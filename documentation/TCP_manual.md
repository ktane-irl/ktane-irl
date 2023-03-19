# TCP manual

all messages consist of 4 parts:

* 1     byte  POS:  the position of the module (0-12, 0xFF=controller)
* 1     byte  CMD:  the command describing the action to be taken (0x01 - 0xFE)
* 1     byte  LEN:  the length of the DATA bytes
* 0-255 bytes DATA: the data to be sent or received

All messages from the module are acknowledged by the controller and relayed to the backend. Backend messages are directly relayed to the module. When POS is 0xFF, the message is from or to the controller.

## IDs

see in [SPI manual](SPI_manual.md#error-codes-8-bit)

## Error codes (8 bit)

| ID  | ERROR CODE           |
| --- | -------------------- |
| 0   | NoError              |
| 1   | CRCErrorFromModule   |
| 2   | ZeroLengthFromModule |
| 10  | IncorrectPosition    |

## CONTROLLER MESSAGES

BACKEND->CONTROLLER
| CMD  | NAME                       |  LEN | DATA DESCRIPTION |
| ---- | -------------------------- | ---: | ---------------- |
| 0x00 | reserved for NO_CMD        |      |                  |
| 0xFF | reserved for NOT_CONNECTED |      |                  |
| 0xEA | reserved for SPI test      |      |                  |
|      |                            |      |                  |

CONTROLLER->BACKEND
| CMD  | NAME                       | SENT CONDITION             |  LEN | DATA DESCRIPTION                                               |
| ---- | -------------------------- | -------------------------- | ---: | -------------------------------------------------------------- |
| 0x00 | reserved for NO_CMD        |                            |      |                                                                |
| 0xFF | reserved for NOT_CONNECTED |                            |      |                                                                |
| 0xEA | reserved for SPI test      |                            |      |                                                                |
|      |                            |                            |      |                                                                |
| 0x01 | Modules detected           | looped through all clients |    2 | 0b___CCCCC 0bCCCCCCCC:                                         |
|      |                            |                            |      | C = module connected on pos (1 = CONNECTED, 0 = NOT CONNECTED) |
| 0xFE | Error                      |                            |    2 | position (0xFF=controller), [ErrorCode](#error-codes-8-bit)    |
