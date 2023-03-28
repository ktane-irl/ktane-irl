#include <Arduino.h>
#include <SPI.h>
#include <Wire.h>
#define CIRCULAR_BUFFER_INT_SAFE  // Enable interrupt safety for CircularBuffer lib
#include <CRC8.h>                 // Link Lib: https://registry.platformio.org/libraries/robtillaart/CRC
#include <CircularBuffer.h>       // Link Lib: https://registry.platformio.org/libraries/rlogiacco/CircularBuffer
#include <Timer.h>

#include "global_module.hpp"
#include "module_events.tpp"

// Module ID and Module Version
#define MODULE_ID 2
#define MODULE_VERSION 1

// Wires states event data length
#define WIRE_STATES_EV_DATA_LEN 4
#define WIRE_STATES_SAVE_DEPTH 5

// COLOR ID's
#define COLOR_OFF 0b000      // 0
#define COLOR_BLACK 0b001    // 1
#define COLOR_BLUE 0b010     // 2
#define COLOR_GREEN 0b011    // 3
#define COLOR_RED 0b100      // 4
#define COLOR_YELLOW 0b101   // 5
#define COLOR_WHITE 0b110    // 6
#define COLOR_INVALID 0b111  // 7

// --- MODULE SPECIFIC COMMANDS ---

// Master to Slave
#define CMDMM_RG_LED 0x01
#define CMDMM_ACK_WIRE_STATES 0x02

// Slave to Master
#define CMDMS_WIRE_STATES 0x02

// --- PIN CONFIGURATION ---

// See status_led.hpp for status led configurations

/**
 * @brief Six pins to which the coloured wires are attached to. The wires can be disconnected by the player to disarm the module
 *
 */
const uint8_t wire_pins[] = {A0, A1, A2, A3, A4, A5};

// --- MODULE SPECIFIC OUTPUT DATA ---

/**
 * @brief Describes which color each wire has.
 *  Possible colors | id:
 *      not connected / off | 0b000
 *      black               | 0b001
 *      blue                | 0b010
 *      green               | 0b011
 *      red                 | 0b100
 *      yellow              | 0b101
 *      white               | 0b110
 */

EventBuffer<WIRE_STATES_EV_DATA_LEN> wire_states_ev_buf(CMDMS_WIRE_STATES);

bool force_update_states = false;
// Commands which should be executed after module initialization (e.g. Force update states or change display)
void module_init_settings_local() {
    force_update_states = true;
}

/**
 * @brief Updates wirestates and recognized color ids
 *
 * @return true - when wire states have changed
 * @return false -  when wire states have not changed
 */

void update_wirestates() {
    static uint8_t wire_states_old[6] = {COLOR_INVALID, COLOR_INVALID, COLOR_INVALID, COLOR_INVALID, COLOR_INVALID, COLOR_INVALID};
    static uint8_t wire_states[6][WIRE_STATES_SAVE_DEPTH];
    int adc_value;

    // -- shift wire states --
    for (uint8_t i = 0; i < 6; i++) {
        for (uint8_t j = WIRE_STATES_SAVE_DEPTH - 1; j > 0; j--) {
            wire_states[i][j] = wire_states[i][j - 1];
        }
    }
    for (int i = 0; i < 6; i++) {
        // -- Read voltage for current analog pin --
        adc_value = analogRead(wire_pins[i]);

        if (adc_value <= 85) {  // not connected
            wire_states[i][0] = COLOR_OFF;
        } else if (adc_value <= 255) {  // Red
            wire_states[i][0] = COLOR_RED;
        } else if (adc_value <= 450) {  // Blue
            wire_states[i][0] = COLOR_BLUE;
        } else if (adc_value <= 650) {  // Yellow
            wire_states[i][0] = COLOR_YELLOW;
        } else if (adc_value <= 900) {  // White
            wire_states[i][0] = COLOR_WHITE;
        } else {  // Black
            wire_states[i][0] = COLOR_BLACK;
        }
    }

    // -- Check if wire state is stable and has changed --
    bool changed = false;
    for (int i = 0; i < 6; i++) {
        for (int j = 1; j < WIRE_STATES_SAVE_DEPTH; j++) {
            if (wire_states[i][j] != wire_states[i][0]) {
                return;
            }
        }
        if (wire_states[i][0] != wire_states_old[i]) {
            changed = true;
        }
    }

    // -- Update wire states --
    if (changed || force_update_states) {
        uint8_t wire_states_reg[] = {0x00, 0x00, 0x00};

        for (int i = 0; i < 6; i++) {
            int hi = i / 2;
            wire_states_old[i] = wire_states[i][0];
            if (i % 2 == 0) {
                wire_states_reg[2 - hi] = wire_states[i + 1][0] << 3 | wire_states[i][0];
            }
        }
        Event<WIRE_STATES_EV_DATA_LEN> wire_states_ev{wire_states_ev_buf.get_counter(), wire_states_reg};
        wire_states_ev_buf.add_event(wire_states_ev);
        force_update_states = false;
    }
}

void process_module_cmd(uint8_t &cmd, uint8_t &len, CircularBuffer<uint8_t, 8> &data) {
    switch (cmd) {
        case CMDMM_RG_LED: {
            if (len == 0x01) {
                uint8_t led_code = frame_data_buf.shift();
                digitalWrite(status_led_pins::GREEN, (led_code & (1 << 0)) ? LOW : HIGH);
                digitalWrite(status_led_pins::RED, (led_code & (1 << 1)) ? LOW : HIGH);
            } else {
                add_error_event(ERR_INVALID_DATA_LEN);
            }
        } break;

        case CMDMM_ACK_WIRE_STATES:
            if (len == 1) {
                {
                    Event<4> wire_states_ev = wire_states_ev_buf.peek_event();
                    uint8_t ws_ev_buf_counter = wire_states_ev.data_[0];
                    uint8_t ack_counter = frame_data_buf.shift();

                    if (ws_ev_buf_counter == ack_counter) {
                        wire_states_ev_buf.remove_first_event();
                    } else {
                        add_error_event(ERR_ACK_MISMATCH);
                    }
                }
            } else {
                add_error_event(ERR_INVALID_DATA_LEN);
            }
            break;

        default:
            add_error_event(ERR_INVALID_CMD);
            break;
    }
    data.clear();
}

void setup() {
    // --Setup SPI connection--
    module_setup();

    // Init Status LED and turn off
    status_led_init();
    status_led_off();
    status_led_blue();
}

Timer wireTimer(20);

void loop() {
    // Update wirestates if necessary
    if (wireTimer.tick()) {
        update_wirestates();
    }

    if (!ready) {
#ifdef DEBUG_PRINT_BUFFER_AFTER_EXCHANGE
        Serial.print("EXCHANGE: (tx left: ");
        Serial.print(send_buffer.size());
        Serial.print(") rec:  ");
        print_rx_buffer();
#endif

        // --Validation and proccess of received frames--
        validate_and_process_frames(process_module_cmd);
        send_buffer.clear();

        // --Build send buffer--
        // Go through all event buffers and push new events to send_buffer
        if (module_initialized == false) {
            module_init(MODULE_ID, MODULE_VERSION);
        } else {
            push_ev_to_send_buf<WIRE_STATES_EV_DATA_LEN, TX_BUFFER_SIZE>(wire_states_ev_buf, send_buffer);
            push_ev_to_send_buf<ERROR_EV_DATA_LEN, TX_BUFFER_SIZE>(error_ev_buf, send_buffer);
        }

#ifdef DEBUG_PRINT_BUFFER_AFTER_EXCHANGE
        Serial.print(" next send: ");
        print_tx_buffer();
        Serial.println();
#endif

        ready = true;
    }
}
