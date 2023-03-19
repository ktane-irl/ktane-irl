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

// Module ID and Module Version
#define MODULE_ID 0
#define MODULE_VERSION 1

// --- MODULE SPECIFIC COMMANDS ---

// Master to Slave
#define CMDMM_SET_INDICATOR_LEDS 0x01
#define CMDMM_ACK_BATTERY_STATES 0x02

// Slave to Master
#define CMDMS_BATTERY_STATES 0x02

// --- PIN CONFIGURATION ---

#define LED_A A0
#define LED_B A1
#define LED_C A2
#define LED_D A3
#define LED_E A4

const uint8_t battery_pins[] = {9, 8, 7, 6, 5, 4};

// --- Helper Defines ---
#define BATTERY_INITIALIZE_ARRAY 2
#define BATTERY_CONNECTED 1
#define BATTERY_DISCONNECTED 0

#define BATTERY_COUNT 6

#define LED_OFF 1023
#define LED_ON 0

#define BATTERY_STATES_EV_DATA_LEN 0x02

// See status_led.hpp for status led configurations

EventBuffer<BATTERY_STATES_EV_DATA_LEN> battery_states_ev_buf(CMDMS_BATTERY_STATES);

bool force_update_states = false;
// Commands which should be executed after module initialization (e.g. Force update states or change display)
void module_init_settings_local() {
    force_update_states = true;
}

void led_states(uint8_t led_code) {
    analogWrite(LED_A, led_code & (1 << 0) ? LED_ON : LED_OFF);
    analogWrite(LED_B, led_code & (1 << 1) ? LED_ON : LED_OFF);
    analogWrite(LED_C, led_code & (1 << 2) ? LED_ON : LED_OFF);
    analogWrite(LED_D, led_code & (1 << 3) ? LED_ON : LED_OFF);
    analogWrite(LED_E, led_code & (1 << 4) ? LED_ON : LED_OFF);
}

void update_batterystates() {
    static uint8_t battery_states_old[BATTERY_COUNT] = {
        BATTERY_INITIALIZE_ARRAY,
        BATTERY_INITIALIZE_ARRAY,
        BATTERY_INITIALIZE_ARRAY,
        BATTERY_INITIALIZE_ARRAY,
        BATTERY_INITIALIZE_ARRAY,
        BATTERY_INITIALIZE_ARRAY};
    static uint8_t battery_states[BATTERY_COUNT];

    for (int i = 0; i < BATTERY_COUNT; i++) battery_states[i] = digitalRead(battery_pins[i]);

    // -- Check if battery state is stable and has changed --
    bool changed = false;
    for (int i = 0; i < BATTERY_COUNT; i++) {
        if (battery_states[i] != battery_states_old[i]) {
            changed = true;
        } else {
            continue;
        }
    }

    // -- Update battery states --
    if (changed || force_update_states) {
        uint8_t battery_states_reg[] = {0x00};
        for (int i = 0; i < BATTERY_COUNT; i++) {
            battery_states_old[i] = battery_states[i];
            battery_states_reg[0] += battery_states[i] ? 0 : (1 << i);
        }

        Event<BATTERY_STATES_EV_DATA_LEN> battery_states_ev{battery_states_ev_buf.get_counter(), battery_states_reg};
        battery_states_ev_buf.add_event(battery_states_ev);
        force_update_states = false;
    }
}

void process_module_cmd(uint8_t &cmd, uint8_t &len, CircularBuffer<uint8_t, 8> &data) {
    switch (cmd) {
        case CMDMM_SET_INDICATOR_LEDS: {
            if (len == 0x01) {
                uint8_t led_code = frame_data_buf.shift();
                led_states(led_code);
            } else {
                add_error_event(ERR_INVALID_DATA_LEN);
            }
        } break;

        case CMDMM_ACK_BATTERY_STATES: {
            if (len == 1) {
                Event<2> battery_states_ev = battery_states_ev_buf.peek_event();
                uint8_t bs_ev_buf_counter = battery_states_ev.data_[0];
                uint8_t ack_counter = frame_data_buf.shift();

                if (bs_ev_buf_counter == ack_counter) {
                    battery_states_ev_buf.remove_first_event();
                } else {
                    add_error_event(ERR_ACK_MISMATCH);
                }
            } else {
                add_error_event(ERR_INVALID_DATA_LEN);
            }
            break;
        } break;

        default:
            add_error_event(ERR_INVALID_CMD);
            break;
    }
    data.clear();
}

void setup() {
    module_setup();

    // Init LED's
    pinMode(LED_A, OUTPUT);
    pinMode(LED_B, OUTPUT);
    pinMode(LED_C, OUTPUT);
    pinMode(LED_D, OUTPUT);
    pinMode(LED_E, OUTPUT);

    // Turn Off LED's
    analogWrite(LED_A, LED_OFF);
    analogWrite(LED_B, LED_OFF);
    analogWrite(LED_C, LED_OFF);
    analogWrite(LED_D, LED_OFF);
    analogWrite(LED_E, LED_OFF);

    for (uint8_t i = 0; i < BATTERY_COUNT; i++) {
        pinMode(battery_pins[i], INPUT_PULLUP);
    }
}

Timer batteryTimer(500);

void loop() {
    // Update batterystates if necessary
    if (batteryTimer.tick()) {
        update_batterystates();
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
            push_ev_to_send_buf<BATTERY_STATES_EV_DATA_LEN, TX_BUFFER_SIZE>(battery_states_ev_buf, send_buffer);
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
