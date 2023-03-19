#include "status_led.hpp"

#include "Arduino.h"

void status_led_init() {
    pinMode(status_led_pins::BLUE, OUTPUT);
    pinMode(status_led_pins::GREEN, OUTPUT);
    pinMode(status_led_pins::RED, OUTPUT);
}

void status_led_off() {
    digitalWrite(status_led_pins::RED, HIGH);
    digitalWrite(status_led_pins::GREEN, HIGH);
    digitalWrite(status_led_pins::BLUE, HIGH);
}

void status_led_red() {
    digitalWrite(status_led_pins::RED, LOW);
    digitalWrite(status_led_pins::GREEN, HIGH);
    digitalWrite(status_led_pins::BLUE, HIGH);
}

void status_led_green() {
    digitalWrite(status_led_pins::RED, HIGH);
    digitalWrite(status_led_pins::GREEN, LOW);
    digitalWrite(status_led_pins::BLUE, HIGH);
}

void status_led_blue() {
    digitalWrite(status_led_pins::RED, HIGH);
    digitalWrite(status_led_pins::GREEN, HIGH);
    digitalWrite(status_led_pins::BLUE, LOW);
}

void status_led_yellow() {
    digitalWrite(status_led_pins::RED, LOW);
    digitalWrite(status_led_pins::GREEN, LOW);
    digitalWrite(status_led_pins::BLUE, HIGH);
}