#include "global_module.hpp"

#include <CRC8.h>
#include <CircularBuffer.h>

#include "Arduino.h"
#include "SPI.h"
#include "Wire.h"
#include "module_events.tpp"

CircularBuffer<uint8_t, TX_BUFFER_SIZE> send_buffer;
CircularBuffer<uint8_t, RX_BUFFER_SIZE> receive_buffer;
EventBuffer<ERROR_EV_DATA_LEN> error_ev_buf(CMDGS_ERROR);
CircularBuffer<uint8_t, 8> frame_data_buf;

volatile bool rx_buffer_full = false;
volatile bool ready = false;
volatile bool module_initialized = false;

// Variables used in validate_and_process_frame()
enum FRAME_STRUCTURE loop_frame_byte = CMD;
uint8_t loop_cmd = 0x00;
uint8_t loop_len = 0x00;
CRC8 loop_crc;

// Forward declarations
void check_err_ack();

void module_setup() {
    Serial.begin(BAUD_RATE);
    while (!Serial)
        delay(0);
    Serial.print("\n\nUPLOADED " + String(__DATE__) + " " + String(__TIME__) + "\n");

    // Setup SPI
    SPDR = 0x00;                // Write initial 0x00 value to SPDR
    pinMode(MISO, OUTPUT);      // Set MISO pin to output
    pinMode(SS, INPUT_PULLUP);  // Set Slave-Select pin to input with internal pullup
    SPCR |= _BV(SPE);           // Enable SPI
    SPCR |= _BV(SPIE);          // Enable SPI interrupt

    // Activate SS Interrupt with Rising edge --> Call function ss_deselect()
    attachInterrupt(digitalPinToInterrupt(2), ss_deselect, RISING);
}

void module_init(uint8_t module_id, uint8_t module_ver) {
    CRC8 module_init_crc;

    // Build Send-command for module init and calculate crc
    module_init_crc.add(CMDGS_MODULE_INIT);
    send_buffer.push(CMDGS_MODULE_INIT);
    module_init_crc.add(0x02);
    send_buffer.push(0x02);
    module_init_crc.add(module_id);
    send_buffer.push(module_id);
    module_init_crc.add(module_ver);
    send_buffer.push(module_ver);
    send_buffer.push(module_init_crc.getCRC());

    module_init_crc.reset();
}

void module_init_settings_global() {
    receive_buffer.clear();
    send_buffer.clear();
    module_init_settings_local();
}

void (*module_reset_hard)(void) = 0x00;

enum INIT_STEP init_step = INIT_STEP::BEGIN;
void ss_deselect() {
    ready = false;
    init_step = INIT_STEP::BEGIN;
    SPDR = CMDGS_FLOW_CONTROL_STOP;
}

ISR(SPI_STC_vect) {
    static enum FRAME_STRUCTURE isr_frame_state = CMD;
    static uint8_t rest_len = 0;
    if (!ready) {
        SPDR = CMDGS_FLOW_CONTROL_STOP;
        return;
    }

    // Initialize communication
    switch (init_step) {
        case BEGIN:
            if (SPDR == 0x00) {
                SPDR = 0x5A;
                init_step = INIT_STEP::CONFIRM;
            } else {
                init_step = INIT_STEP::BEGIN;
            }

            break;

        case CONFIRM:
            if (SPDR == 0x00) {
                SPDR = 0x7E;
                init_step = INIT_STEP::RESPONSE;
            } else {
                init_step = INIT_STEP::BEGIN;
                SPDR = 0x00;
            }
            break;

        case RESPONSE:
            if (SPDR == 0x5A) {
                SPDR = 0x7E;
                init_step = INIT_STEP::VALIDATE;
            } else {
                init_step = INIT_STEP::BEGIN;
                SPDR = 0x00;
            }
            break;

        case VALIDATE: {
            // create checksum  of IN-SPDR (count active bits)
            uint8_t checksum = ((SPDR >> 0) & 0x01) +
                               ((SPDR >> 1) & 0x01) +
                               ((SPDR >> 2) & 0x01) +
                               ((SPDR >> 3) & 0x01) +
                               ((SPDR >> 4) & 0x01) +
                               ((SPDR >> 5) & 0x01) +
                               ((SPDR >> 6) & 0x01) +
                               ((SPDR >> 7) & 0x01);

            if (checksum > 2) {
                init_step = INIT_STEP::INITIALIZED;
            } else {
                init_step = INIT_STEP::BEGIN;
                SPDR = 0x00;
            }
        } break;

        default:
            break;
    }

    // Check if communication is initialized
    if (init_step != INIT_STEP::INITIALIZED) {
        return;
    }

    // --Send routine--
    if (!send_buffer.isEmpty()) {
        SPDR = send_buffer.shift();
    } else {
        SPDR = CMDGS_FLOW_CONTROL_STOP;
    }

    // Check if Module init command is received
    if (module_initialized == false) {
        if (isr_frame_state == CMD && SPDR != CMDGM_ACK_MODULE_INIT) {
            return;
        }
    }

    // TODO Set rx_buffer full flag somewhere
    if (rx_buffer_full) {
        return;
    }

    // Receive command and check length to guarantee complete reception
    switch (isr_frame_state) {
        case CMD:
            if (SPDR != NO_CMD && SPDR != 0x7E) {
                receive_buffer.push(SPDR);
                isr_frame_state = FRAME_STRUCTURE::LEN;
            }
            break;

        case LEN:
            receive_buffer.push(SPDR);
            rest_len = SPDR;
            if (rest_len == 0x00)
                isr_frame_state = FRAME_STRUCTURE::CRC;
            else
                isr_frame_state = FRAME_STRUCTURE::DATA;
            break;

        case DATA:
            receive_buffer.push(SPDR);
            rest_len--;
            if (rest_len == 0)
                isr_frame_state = FRAME_STRUCTURE::CRC;
            break;

        case CRC:
            receive_buffer.push(SPDR);
            isr_frame_state = FRAME_STRUCTURE::CMD;
            break;
    }
}
/**
 * @brief Processes global commands from the master
 *
 * @param cmd Command byte too process
 * @param len Length byte defining the length of the data
 * @param frame_buf Buffer containing the data
 * @return true : Return true if a valid global command was recognized, processing module specific commands should be skipped afterwards
 * @return false : Return false passed command was not a global command, processing module specific commands should be continued
 */
bool process_global_cmd(uint8_t &cmd, uint8_t &len, CircularBuffer<uint8_t, 8> &frame_buf) {
    switch (cmd) {
        // Global commands
        case CMDGM_REQ_MODULE_RESET:
            if (len == 0x00) {
                module_reset_hard();
            } else {
                add_error_event(ERR_INVALID_DATA_LEN);
            }

            return true;

        case CMDGM_ACK_MODULE_INIT:
            if (len == 1) {
                module_initialized = true;
                module_init_settings_global();
                ;
            } else {
                add_error_event(ERR_INVALID_DATA_LEN);
            }
            return true;

        case CMDGM_ACK_ERR: {
            if (len == 1) {
                check_err_ack();
            } else {
                add_error_event(ERR_INVALID_DATA_LEN);
            }
            return true;
        }

        case CMDG_SPI_TEST:
            // TODO: Wait for master implementation
            return true;

        default:
            return false;
    }
}

void validate_and_process_frames(const callback_process_cmd process_module_cmd) {
    while (receive_buffer.isEmpty() == false) {
        switch (loop_frame_byte) {
            case CMD:
                loop_cmd = receive_buffer.shift();
                loop_crc.add(loop_cmd);
                loop_frame_byte = LEN;
                break;

            case LEN:
                loop_len = receive_buffer.shift();
                loop_crc.add(loop_len);
                loop_frame_byte = DATA;
                break;

            case DATA:
                for (int i = 0; i < loop_len; i++) {
                    uint8_t data = receive_buffer.shift();
                    frame_data_buf.push(data);
                    loop_crc.add(data);
                }
                loop_frame_byte = CRC;
                break;

            case CRC:
                // CRC is valid
                if (loop_crc.getCRC() == receive_buffer.shift()) {
                    if (!process_global_cmd(loop_cmd, loop_len, frame_data_buf)) {
                        process_module_cmd(loop_cmd, loop_len, frame_data_buf);
                    }
                } else {
                    add_error_event(ERR_CRC);
                }
                frame_data_buf.clear();
                loop_crc.reset();
                loop_frame_byte = CMD;
                break;
        }
    }
    receive_buffer.clear();
}

/*
   ---------------------  HELPER FUNCTIONS ---------------------
*/

// Generates new Error Event and adds it to the Error Event Buffer
void add_error_event(uint8_t error_code) {
    // Generate new Error Event
    Event<ERROR_EV_DATA_LEN> err_ev{
        error_ev_buf.get_counter(),
        {error_code}};

    // Add Error Event to Error Event Buffer
    error_ev_buf.add_event(err_ev);
}

void check_err_ack() {
    Event<2> err_ev = error_ev_buf.peek_event();
    uint8_t err_ev_buf_counter = err_ev.data_[0];
    uint8_t ack_counter = frame_data_buf.shift();

    if (err_ev_buf_counter == ack_counter) {
        error_ev_buf.remove_first_event();
    } else {
        add_error_event(ERR_ACK_MISMATCH);
    }
}

/*
    --------------------- DEBUGGING HELPER FUNCTIONS ---------------------
*/

// For Debugging purposes
void print_rx_buffer() {
    Serial.print("[");
    for (uint8_t i = 0; i < receive_buffer.size(); i++) {
        Serial.print(receive_buffer[i], HEX);
        Serial.print(", ");
    }
    Serial.print("]");
}

// For Debugging purposes print tx buffer
void print_tx_buffer() {
    Serial.print("[");
    for (uint8_t i = 0; i < send_buffer.size(); i++) {
        Serial.print(send_buffer[i], HEX);
        Serial.print(", ");
    }
    Serial.print("]");
}