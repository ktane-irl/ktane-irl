#pragma once

#include "module_events.tpp"

#define BAUD_RATE 115200
#define RX_BUFFER_SIZE 258
#define TX_BUFFER_SIZE 70  // decreased from 258 to 70 (wires-module specific)to save ram

// Error event data length
#define ERROR_EV_DATA_LEN 2

// ERROR CODES
#define NO_ERROR 0x00
#define ERR_CRC 0x01
#define ERR_INVALID_CMD 0x02
#define ERR_INVALID_DATA_LEN 0x03
#define ERR_ACK_MISMATCH 0x04

// --- GLOBAL COMMANDS ---
// Reserved Commands (Master -> Slave & Slave -> Master)
#define NO_CMD 0x00
#define CMDG_NOT_CONNECTED 0xFF
#define CMDG_SPI_TEST 0xEA

// Master -> Slave
#define CMDGM_REQ_MODULE_RESET 0xFC
#define CMDGM_ACK_ERR 0xFE
#define CMDGM_ACK_MODULE_INIT 0xFD

// Slave -> Master
#define CMDGS_MODULE_INIT 0xFD
#define CMDGS_ERR_CNT_MISO 0xEC
#define CMDGS_ERR_CNT_MOSI 0xEB
#define CMDGS_FLOW_CONTROL_STOP 0x00
#define CMDGS_ERROR 0xFE

/**
 * @brief General frame structure; Enumerates the different parts of a frame and is used to parse the frame
 *
 */
enum FRAME_STRUCTURE {
    CMD,
    LEN,
    DATA,
    CRC
};

/**
 * @brief Enumerates the different steps of the module initialization process
 *
 */
enum INIT_STEP {
    BEGIN,
    CONFIRM,
    RESPONSE,
    VALIDATE,
    INITIALIZED
};

/**
 * @brief Defines the callback function type for processing module specific commands
 *
 */
typedef void(callback_process_cmd)(uint8_t &cmd, uint8_t &len, CircularBuffer<uint8_t, 8> &frame_buf);

/*
   --------------------- BUFFERS ---------------------
*/

/**
 * @brief Main buffer for incoming data
 *
 */
extern CircularBuffer<uint8_t, TX_BUFFER_SIZE> send_buffer;

/**
 * @brief Main buffer for outgoing data
 *
 */
extern CircularBuffer<uint8_t, RX_BUFFER_SIZE> receive_buffer;

/**
 * @brief Error event buffer which stores local errors on the module until they have been acknowledged by the master
 *
 */
extern EventBuffer<ERROR_EV_DATA_LEN> error_ev_buf;

/**
 * @brief Buffer for storing the data of one frame; Used to parse the frame
 *
 */
extern CircularBuffer<uint8_t, 8> frame_data_buf;  // decreased from 256 to 8 (wires-module specific) to save ram

/* --- Globally required variables --- */
/**
 * @brief Flag to indicate that the receive buffer is full
 *
 */
extern volatile bool rx_buffer_full;

/**
 * @brief Ready flag, to indicate this module is accepting new commands
 */
extern volatile bool ready;

/**
 * @brief Flag to indicate that the module has been initialized
 *
 */
extern volatile bool module_initialized;

/*
   --------------------- FUNCTIONS ---------------------
*/

/**
 * @brief Prints upload confirmation message and initializes SPI communication
 *
 */
void module_setup();

/**
 * @brief Sends module id and version to master
 *
 */
void module_init(uint8_t module_id, uint8_t module_version);

/**
 * @brief Soft Resets the module by clearing the receive and send buffers and turning off the status LED if necessary
 * Calls module_init_settings_local which should be implemented in the main function of every module
 *
 */
void module_init_settings_global();

/**
 * @brief Module specific commands which should be executed after the module initialization (function called by module_init_settings_global)
 *
 */
void module_init_settings_local();

/**
 * @brief Calling module_reset_hard() resets the module/arduino (function pointer to address 0x00).
 *        Equivalent to pressing the reset button on the arduino.
 */
extern void (*module_reset_hard)(void);

/**
 * @brief Validates frame CRC calls global cmd processing and module specific cmd processing)
 *
 * @param process_cmd Pointer to function which processes the module specific commands
 */
void validate_and_process_frames(callback_process_cmd process_cmd);

/**
 * @brief Helper function to add an error event to the error event buffer
 *
 * @param error_code Error code to be added to the error event buffer
 */
void add_error_event(uint8_t error_code);

/*
   --------------------- INTERRUPT SERVICE ROUTINES ---------------------
*/

/**
 * @brief Called when Master deselects this module.
 *        ISR Function which is called when Slave Select gets pulled from low to high
 *
 */
void ss_deselect();

/**
 * @brief ISR Serial Transfer Complete - Called when a byte is received from the master
 *
 */
ISR(SPI_STC_vect);

/*
   --------------------- DEBUGGING HELPER FUNCTIONS ---------------------
*/

/**
 * @brief Prints the receive buffer to the serial monitor
 *
 */
void print_rx_buffer();

/**
 * @brief Prints the send buffer to the serial monitor
 *
 */
void print_tx_buffer();
