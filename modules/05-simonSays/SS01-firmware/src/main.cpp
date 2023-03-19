#include <Arduino.h>
#include <SPI.h>
#include <Wire.h>
#define CIRCULAR_BUFFER_INT_SAFE  // Enable interrupt safety for CircularBuffer lib
#include <CRC8.h>                 // Link Lib: https://registry.platformio.org/libraries/robtillaart/CRC
#include <CircularBuffer.h>       // Link Lib: https://registry.platformio.org/libraries/rlogiacco/CircularBuffer
#include <Timer.h>

#include "Wire.h"
#include "global_module.hpp"
#include "module_events.tpp"
#include "status_led.hpp"

// Module ID and Module Version
#define MODULE_ID 5
#define MODULE_VERSION 1

// --- MODULE SPECIFIC COMMANDS ---

// Button states event data length
#define BUTTON_STATES_EV_DATA_LEN 2

// Master to Slave
#define CMDMM_RG_LED 0x01
#define CMDMM_LED_STATES 0x02
#define CMDMM_ACK_BUTTON_STATES 0x03

// Slave to Master
#define CMDMS_BUTTON_STATES 0x03

// --- PIN CONFIGURATION ---
#define LED_RED A0
#define LED_GREEN A1
#define LED_BLUE A2
#define LED_YELLOW A3

#define BUTTON_RED 6
#define BUTTON_GREEN 5
#define BUTTON_BLUE 4
#define BUTTON_YELLOW 3

// --- Helper Defines ---
#define LED_OFF 1023
#define LED_ON 0
#define BUTTON_RELEASED 0
#define BUTTON_PRESSED 1

// See status_led.hpp for status led configurations
const uint8_t button_pins[] = {BUTTON_RED, BUTTON_GREEN, BUTTON_YELLOW, BUTTON_BLUE};

EventBuffer<BUTTON_STATES_EV_DATA_LEN> button_states_ev_buf(CMDMS_BUTTON_STATES);
// --- MODULE SPECIFIC OUTPUT DATA ---

bool force_update_states = false;
// Commands which should be executed after module initialization (e.g. Force update states or change display)
void module_init_settings_local() {
    force_update_states = true;
}

void led_states(uint8_t led_code) {
    analogWrite(LED_BLUE, led_code & (1 << 3) ? LED_ON : LED_OFF);
    analogWrite(LED_YELLOW, led_code & (1 << 2) ? LED_ON : LED_OFF);
    analogWrite(LED_GREEN, led_code & (1 << 1) ? LED_ON : LED_OFF);
    analogWrite(LED_RED, led_code & (1 << 0) ? LED_ON : LED_OFF);
}

void update_buttonstates() {
    static uint8_t button_states_old[4] = {BUTTON_RELEASED, BUTTON_RELEASED, BUTTON_RELEASED, BUTTON_RELEASED};
    static uint8_t button_states[4];

    for (int i = 0; i < 4; i++) {
        // -- Read button pressed / released for current digital pin --
        if (digitalRead(button_pins[i]) == BUTTON_PRESSED) {
            button_states[i] = BUTTON_PRESSED;
        } else if (digitalRead(button_pins[i]) == BUTTON_RELEASED) {
            button_states[i] = BUTTON_RELEASED;
        }
    }

    // -- Check if button state is stable and has changed --
    bool changed = false;
    for (int i = 0; i < 4; i++) {
        if (button_states[i] != button_states_old[i]) {
            changed = true;
        } else {
            continue;
        }
    }

    // -- Update button states --
    if (changed || force_update_states) {
        uint8_t button_states_reg[] = {0x00};
        for (int i = 0; i < 4; i++) {
            button_states_old[i] = button_states[i];
            button_states_reg[0] += button_states[i] ? 0 : (1 << i);
        }

        Event<BUTTON_STATES_EV_DATA_LEN> button_states_ev{button_states_ev_buf.get_counter(), button_states_reg};
        button_states_ev_buf.add_event(button_states_ev);
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

        case CMDMM_LED_STATES: {
            if (len == 0x01) {
                uint8_t led_code = frame_data_buf.shift();
                led_states(led_code);
            } else {
                add_error_event(ERR_INVALID_DATA_LEN);
            }
            break;
        }

        case CMDMM_ACK_BUTTON_STATES: {
            {
                if (len == 1) {
                    Event<2> button_states_ev = button_states_ev_buf.peek_event();
                    uint8_t bs_ev_buf_counter = button_states_ev.data_[0];
                    uint8_t ack_counter = frame_data_buf.shift();

                    if (bs_ev_buf_counter == ack_counter) {
                        button_states_ev_buf.remove_first_event();
                    } else {
                        add_error_event(ERR_ACK_MISMATCH);
                    }
                } else {
                    add_error_event(ERR_INVALID_DATA_LEN);
                }
                break;
            }

            default:
                add_error_event(ERR_INVALID_CMD);
                break;
        }
            data.clear();
    }
}

void setup() {
    module_setup();

    // Init Status LED and turn off
    status_led_init();
    status_led_off();
    status_led_blue();

    // Init Buttons and activate Pullup
    pinMode(BUTTON_RED, INPUT_PULLUP);
    pinMode(BUTTON_GREEN, INPUT_PULLUP);
    pinMode(BUTTON_BLUE, INPUT_PULLUP);
    pinMode(BUTTON_YELLOW, INPUT_PULLUP);

    // Init LED's
    pinMode(LED_RED, OUTPUT);
    pinMode(LED_GREEN, OUTPUT);
    pinMode(LED_BLUE, OUTPUT);
    pinMode(LED_YELLOW, OUTPUT);

    // Turn Off LED's
    analogWrite(LED_RED, LED_OFF);
    analogWrite(LED_GREEN, LED_OFF);
    analogWrite(LED_BLUE, LED_OFF);
    analogWrite(LED_YELLOW, LED_OFF);
}
Timer buttonTimer(20);

void loop() {
    // Update buttonstates if necessary
    if (buttonTimer.tick()) {
        update_buttonstates();
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
            push_ev_to_send_buf<BUTTON_STATES_EV_DATA_LEN, TX_BUFFER_SIZE>(button_states_ev_buf, send_buffer);
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
