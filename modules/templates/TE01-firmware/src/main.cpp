#include <Arduino.h>
#include <SPI.h>
#include <Wire.h>
#define CIRCULAR_BUFFER_INT_SAFE  // Enable interrupt safety for CircularBuffer lib
#include <CRC8.h>                 // Link Lib: https://registry.platformio.org/libraries/robtillaart/CRC
#include <CircularBuffer.h>       // Link Lib: https://registry.platformio.org/libraries/rlogiacco/CircularBuffer
#include <Timer.h>

#include "global_module.hpp"
#include "module_events.tpp"
#include "status_led.hpp"

/* -- Instruction: Creating a new module --
1. Edit MODULE_ID and MODULE_VERSION
2. Add module specific variables, defines
3. Edit function "module_init_settings_local" if necessary (Don't delete!)
4. Add module specific commands into "process_module_cmd"
   (CMDMS = Command module specific slave -> master; CMDMM = Command module specific master -> slave)
5. Add module specific code into setup and loop
6. If necessary delete ";" in file "platformio.ini" - build_flags  --> Enables specific print commands for SPI debugging
6. Delete this instruction manual
*/

/* -- Command naming convention
   
    CMDGS = Global command Slave -> Master
    CMDGM = Global command Master -> Slave
    CMDMS = Module command Slave -> Master
    CMDMM = Module command Master -> Slave
*/

// Module ID and Module Version
#define MODULE_ID 0
#define MODULE_VERSION 0

// --- MODULE SPECIFIC COMMANDS ---

// Master to Slave
#define CMDMM_RG_LED 0x01

// Slave to Master

// --- PIN CONFIGURATION ---

// See status_led.hpp for status led configurations

// --- MODULE SPECIFIC OUTPUT DATA ---

// Commands which should be executed after module initialization (e.g. Force update states or change display)
void module_init_settings_local() {
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

            // Add further module specific commands here (e.g. CMDMM_...)

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

void loop() {
    // Add module specific code here

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

            // Push module specific events here
        }

#ifdef DEBUG_PRINT_BUFFER_AFTER_EXCHANGE
        Serial.print(" next send: ");
        print_tx_buffer();
        Serial.println();
#endif

        ready = true;
    }
}
