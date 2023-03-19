#include <Adafruit_NeoPixel.h>
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

// --- MODULE SPECIFIC CONFIGURATION ---

// If enabled, rotate the 6x6 matrix by 90, 180 or 270 degrees counter-clockwise
// #define ROTATE_90
// #define ROTATE_180
// #define ROTATE_270

// Module ID and Module Version
#define MODULE_ID 11
#define MODULE_VERSION 1

// --- MODULE SPECIFIC COMMANDS ---

// Master to Slave
#define CMDMM_RG_LED 0x01
#define CMDMM_ACK_BUTTON_STATES 0x02
#define CMDMM_RED_WALL_POSITIONS 0x03
#define CMDMM_SPECIAL_POSITIONS 0x04

// Slave to Master
#define CMDMS_BUTTON_STATES 0x02

// --- PIN CONFIGURATION ---
#define MATRIX_DATA_IN 6
// #define MATRIX_DATA_OUT

// See status_led.hpp for status led configurations

// TRBL
#define BUTTON_TOP 5     // 7 //TODO was is wrong in Code or Circuit Board?
#define BUTTON_RIGHT 4   // 3
#define BUTTON_BOTTOM 3  // 4
#define BUTTON_LEFT 7    // 5
const uint8_t button_pins[] = {BUTTON_TOP, BUTTON_RIGHT, BUTTON_BOTTOM, BUTTON_LEFT};

// --- Helper defines ---

#define BUTTON_STATES_EV_DATA_LEN 2
#define NUMPIXELS 64
#define BUTTON_RELEASED 0
#define BUTTON_PRESSED 1

#define SPEC_TYPE_CIRC01 0x00  // Green circle 1 to identify labyrinth
#define SPEC_TYPE_CIRC02 0x01  // Green circle 2 to identify labyrinth
#define SPEC_TYPE_PLAYER 0x02  // white position of player
#define SPEC_TYPE_TARGET 0x03  // red pulsing position of target

// Color defines

#define MATRIX_COL_OFF 0x00
#define MATRIX_COL_PLAYER 0x02
#define MATRIX_COL_CIRC 0x03
#define MATRIX_COL_TARGET 0x04

uint8_t wall_positions[36] = {0x00};
uint8_t player_index = 0xFF;
uint8_t target_index = 0xFF;
uint8_t circ01_index = 0xFF;
uint8_t circ02_index = 0xFF;

uint8_t player_index_old = 0xFF;
uint8_t target_index_old = 0xFF;
uint8_t circ01_index_old = 0xFF;
uint8_t circ02_index_old = 0xFF;

EventBuffer<BUTTON_STATES_EV_DATA_LEN> button_states_ev_buf(CMDMS_BUTTON_STATES);
Adafruit_NeoPixel pixels(NUMPIXELS, MATRIX_DATA_IN, NEO_GRB + NEO_KHZ800);  // TODO: Check if NEO_KHZ800 is correct

// Commands which should be executed after module initialization (e.g. Force update states or change display)
void module_init_settings_local() {
}

// Translate position from 6x6 matrix to 8x8 matrix
uint8_t _6_to_8_matrix(uint8_t position) {
    // Serial.print("Position in der 6er Matrix");
    // Serial.println(position);

#ifdef ROTATE_90
    position = rotate_90(position);
#endif

#ifdef ROTATE_180
    position = rotate_180(position);
#endif

#ifdef ROTATE_270
    position = rotate_270(position);
#endif

    uint8_t x_6 = position / 6;
    uint8_t y_6 = position % 6;

    uint8_t x_8 = x_6 + 1;
    uint8_t y_8 = y_6 + 1;

    // Serial.print("Position in der 8er Matrix");
    // Serial.println(8 * y_8 + x_8);

    return 8 * x_8 + y_8;
}

#ifdef ROTATE_90
// in 6x6 matrix rotate position by 90° counter clockwise
uint8_t rotate_90(uint8_t position) {
    uint8_t x_6 = position / 6;
    uint8_t y_6 = position % 6;

    return 6 * (5 - y_6) + x_6;
}
#endif

#ifdef ROTATE_180
// in 6x6 matrix rotate position by 180° counter clockwise
uint8_t rotate_180(uint8_t position) {
    uint8_t x_6 = position / 6;
    uint8_t y_6 = position % 6;

    return 6 * (5 - x_6) + (5 - y_6);
}
#endif

#ifdef ROTATE_270
// in 6x6 matrix rotate position by 270° counter clockwise
uint8_t rotate_270(uint8_t position) {
    uint8_t x_6 = position / 6;
    uint8_t y_6 = position % 6;

    return 6 * y_6 + (5 - x_6);
}
#endif

// Translate position from 8x8 matrix to 6x6 matrix
// uint8_t game_to_real_matrix(uint8_t position) {
//     uint8_t x_8 = position / 8;
//     uint8_t y_8 = position % 8;

//     uint8_t x_6 = x_8 - 1;
//     uint8_t y_6 = y_8 - 1;

//     return 6*y_6 + x_6;
// }

void set_color(uint8_t red, uint8_t green, uint8_t blue, uint8_t index) {
    pixels.setPixelColor(index, pixels.Color(red, green, blue));
}

// TODO: Test if this is correct
void setBorderColor(uint8_t r, uint8_t g, uint8_t b) {
    // Top
    for (int i = 0; i < 8; i++) {
        pixels.setPixelColor(i, pixels.Color(g, r, b));
    }

    // Bottom
    for (int i = 56; i < 64; i++) {
        pixels.setPixelColor(i, pixels.Color(g, r, b));
    }

    // Left
    for (int i = 0; i < 64; i += 8) {
        pixels.setPixelColor(i, pixels.Color(g, r, b));
    }

    // Right
    for (int i = 7; i < 64; i += 8) {
        pixels.setPixelColor(i, pixels.Color(g, r, b));
    }

    pixels.show();
}

void rainbow_test(int count) {
    int r, g, b;
    pixels.setBrightness(5);
    for (int c = 0; c < count; c++) {
        for (int j = 0; j < 3; j += 1) {
            r = 0;
            g = 0;
            b = 0;
            if (j % 3 == 0) {
                r = 255;
            } else if (j % 3 == 1) {
                g = 255;
            } else {
                b = 255;
            }

            for (int i = 0; i < 64; i++) {
                pixels.setPixelColor(i, pixels.Color(r, g, b));
                pixels.show();
                delay(10);
            }
        }
    }
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
    if (changed) {
        uint8_t button_states_reg[] = {0x00};
        for (int i = 0; i < 4; i++) {
            button_states_old[i] = button_states[i];
            button_states_reg[0] += button_states[i] ? 0 : (1 << i);
        }

        Event<BUTTON_STATES_EV_DATA_LEN> button_states_ev{button_states_ev_buf.get_counter(), button_states_reg};
        button_states_ev_buf.add_event(button_states_ev);
    }
}

/*
 *  - Setting and clearing of wall positions works
 *
 */

void updateMatrix() {
    // Serial.print("Circ01index: ");
    // Serial.println(circ01_index);
    // Serial.print("Circ01indexOld: ");
    // Serial.println(circ01_index_old);

    // clear everything
    for (int i = 0; i < 36; i++) {
        set_color(0, 0, 0, _6_to_8_matrix(i));
    }

    set_color(0, 255, 0, _6_to_8_matrix(circ01_index));
    set_color(0, 255, 0, _6_to_8_matrix(circ02_index));
    set_color(255, 255, 255, _6_to_8_matrix(player_index));
    set_color(255, 0, 100, _6_to_8_matrix(target_index));

    // Check if any of the indices collide and if so, set mixed color
    if (player_index == circ01_index || player_index == circ02_index) {
        // Serial.println("player = circ");
        set_color(100, 255, 100, _6_to_8_matrix(player_index));  // Mix player color with circle color
    }
    if (circ01_index == target_index || circ02_index == target_index) {
        // Serial.println("circ = target");
        set_color(255, 255, 0, _6_to_8_matrix(target_index));  // Mix circle color with target color
    }
    if (player_index == target_index) {
        // Serial.println("player = target");
        set_color(255, 255, 255, _6_to_8_matrix(player_index));  // Mix player color with target color
    }

    if (player_index > 35) {
        set_color(0, 0, 0, _6_to_8_matrix(player_index_old));
    }

    if (circ01_index > 35) {
        // Serial.print("circ01 above 35: ");
        // Serial.println(circ01_index);
        set_color(0, 0, 0, _6_to_8_matrix(circ01_index_old));
    }

    if (circ02_index > 35) {
        set_color(0, 0, 0, _6_to_8_matrix(circ02_index_old));
    }

    if (target_index > 35) {
        set_color(0, 0, 0, _6_to_8_matrix(target_index_old));
    }

    // Set color for wall collisions (if any)
    for (int i = 0; i < 36; i++) {
        if (wall_positions[i] == 1) {
            set_color(255, 0, 0, _6_to_8_matrix(i));
        }
    }

    if (!selected) {
        // Serial.print("<");
        pixels.show();
        // Serial.print(">");
    } else {
        // Serial.println("X");
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
        } break;  // Check which color code is already set in matrix and set appropriate mix color

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
        }

        case CMDMM_RED_WALL_POSITIONS: {
            if (len == 0x05) {
                uint8_t matrix_index = 0;
                for (int i = 0; i < 5; i++) {
                    uint8_t wall_byte = frame_data_buf.shift();
                    int var;
                    if (i == 5)
                        var = 3;
                    else
                        var = 0;

                    for (int j = 7; j >= var; j--) {
                        // if (i >= 4 && j >= 4) break; // Only 36 pixels, The fifth byte only contains four bits
                        if (wall_byte & _BV(j)) {
                            wall_positions[matrix_index] = 1;
                            // Serial.print("Wallpos ");
                            // Serial.print(matrix_index);
                            // Serial.print(" : ");
                            // Serial.println(wall_positions[matrix_index]);
                        } else {
                            wall_positions[matrix_index] = 0;
                        }
                        matrix_index++;
                    }
                }

            } else {
                add_error_event(ERR_INVALID_DATA_LEN);
            }
        } break;

        case CMDMM_SPECIAL_POSITIONS: {
            uint8_t special_type = 0;
            uint8_t position = 0;
            if (len > 4 || len < 1) {
                add_error_event(ERR_INVALID_DATA_LEN);
            } else {
                uint8_t len_index = len;
                do {
                    uint8_t byte = frame_data_buf.shift();
                    special_type = byte >> 6;
                    position = byte & 0b00111111;

                    switch (special_type) {
                        case SPEC_TYPE_CIRC01:
                            // Serial.println("circ02");
                            circ01_index_old = circ01_index;
                            circ01_index = position;
                            break;

                        case SPEC_TYPE_CIRC02:
                            // Serial.println("circ02");
                            circ02_index_old = circ02_index;
                            circ02_index = position;
                            break;

                        case SPEC_TYPE_PLAYER:
                            player_index_old = player_index;
                            player_index = position;
                            // Serial.println("player");
                            break;

                        case SPEC_TYPE_TARGET:
                            target_index_old = target_index;
                            // Serial.println("target");
                            target_index = position;
                            break;

                        default:
                            // Serial.print("Special Type not known ");
                            // Serial.println(special_type);
                            //  TODO error handling
                            break;
                    }
                    len_index--;
                } while (len_index > 0);
            }

        } break;

        default:
            Serial.println("Error invalid command ");
            add_error_event(ERR_INVALID_CMD);
            break;
    }
    data.clear();
}

void setup() {
    // --Setup SPI connection--
    module_setup();

    // Init Status LED
    status_led_init();
    status_led_blue();

    pinMode(BUTTON_TOP, INPUT_PULLUP);
    pinMode(BUTTON_RIGHT, INPUT_PULLUP);
    pinMode(BUTTON_BOTTOM, INPUT_PULLUP);
    pinMode(BUTTON_LEFT, INPUT_PULLUP);

    // Setup pixel matrix
    pinMode(MATRIX_DATA_IN, OUTPUT);

    pixels.begin();

    // rainbow_test(3);            // For debugging
    // setBorderColor(0, 0, 150);  // blue not ; For debugging; Not visible in case
    pixels.setBrightness(100);

    pixels.show();
}

Timer buttonTimer(20);

void loop() {
    // Update buttonstates if necessary
    if (buttonTimer.tick()) {
        update_buttonstates();
        updateMatrix();
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