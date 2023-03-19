#include <Adafruit_GFX.h>
#include <Adafruit_LEDBackpack.h>
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
#define MODULE_ID 1
#define MODULE_VERSION 1

// --- MODULE SPECIFIC COMMANDS ---

// Master to Slave
#define CMDMM_TIME_STRIKES 0x01

// Slave to Master

// --- PIN CONFIGURATION ---

#define CLOCK_SDA A4  // naming D
#define CLOCK_SCL A5  // naming C

#define LED_STRIKE_LEFT 3
#define LED_STRIKE_RIGHT 4

// --- Helper Defines ---

#define LED_STRIKE_LEFT_MASK _BV(7)
#define LED_STRIKE_RIGHT_MASK _BV(6)

Adafruit_AlphaNum4 seg_disp = Adafruit_AlphaNum4();

// --- MODULE SPECIFIC OUTPUT DATA ---

void printTimer(char msg[4], bool printPoint) {
    seg_disp.writeDigitAscii(0, msg[0]);
    seg_disp.writeDigitAscii(1, msg[1], printPoint);  // Enable the decimal point (used as delimeter for minutes and seconds here)
    seg_disp.writeDigitAscii(2, msg[2]);
    seg_disp.writeDigitAscii(3, msg[3]);
    seg_disp.writeDisplay();
}

// Commands which should be executed after module initialization (e.g. Force update states or change display)
void module_init_settings_local() {
    char init_msg[] = "----";
    printTimer(init_msg, false);
}

void process_module_cmd(uint8_t &cmd, uint8_t &len, CircularBuffer<uint8_t, 8> &data) {
    switch (cmd) {
        case CMDMM_TIME_STRIKES:
            if (len == 0x02) {
                {
                    uint8_t upper_byte = frame_data_buf.shift();
                    uint8_t lower_byte = frame_data_buf.shift();

                    // LEDs for Strikes
                    digitalWrite(LED_STRIKE_LEFT, !(LED_STRIKE_LEFT_MASK & upper_byte));
                    digitalWrite(LED_STRIKE_RIGHT, !(LED_STRIKE_RIGHT_MASK & upper_byte));

                    // Max time in seconds is 4095
                    uint16_t full_time_sec = (upper_byte & 0b00001111) << 8 | lower_byte;  // 12 bit time
                    uint8_t time_min = full_time_sec / 60;
                    uint8_t time_sec = full_time_sec % 60;

                    // Set each digit and add 48 to get corresponding ascii character
                    char msg[] = {
                        char((time_min / 10) + 48),
                        char((time_min % 10) + 48),
                        char(uint8_t(time_sec / 10) + 48),
                        char(uint8_t(time_sec % 10) + 48)};

                    printTimer(msg, true);
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
    module_setup();
    // LEDs for Strikes, make sure ports are set to output
    pinMode(LED_STRIKE_LEFT, OUTPUT);
    pinMode(LED_STRIKE_RIGHT, OUTPUT);
    digitalWrite(LED_STRIKE_LEFT, HIGH);
    digitalWrite(LED_STRIKE_RIGHT, HIGH);
    // Seg Display, make sure ports are set to output
    pinMode(CLOCK_SCL, OUTPUT);
    pinMode(CLOCK_SDA, OUTPUT);
    // init seg disp in normal mode (single display -> 0x70)

    if (!seg_disp.begin(0x70)) {
        Serial.println("Error while initializing the 14Seg Disp ");
    } else {
        Serial.println("14Seg Disp initialized successfully");
    }

    char init_msg[] = "INIT";
    printTimer(init_msg, false);

    // seg_disp.setBrightness(15);  // max brightness
}

void loop() {
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
