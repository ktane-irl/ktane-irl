#pragma once

// --- PIN CONFIGURATION ---

/**
 * @brief  Configures the pins for the status LED --> BLUE = 7; GREEN = 8; RED = 9
 *
 */
enum status_led_pins { BLUE = 7,
                       GREEN,
                       RED };

/**
 * @brief Turns the status led off
 *
 */
void status_led_off();

/**
 * @brief Sets the status led to red
 *
 */
void status_led_red();

/**
 * @brief Sets the status led to green
 *
 */
void status_led_green();

/**
 * @brief Sets the status led to blue
 *
 */
void status_led_blue();


/**
 * @brief Sets the status led to blue
 * 
 */
void status_led_yellow();


/**
 * @brief Initializes the status led by setting the required pins to Output pins
 *
 */
void status_led_init();