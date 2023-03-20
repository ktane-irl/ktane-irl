# SPI manual

all messages consist of 4 parts:

* 1     byte  CMD:  the command describing the action to be taken (0x01 - 0xFE)
* 1     byte  LEN:  the length of the DATA bytes
* 0-255 bytes DATA: the data to be sent or received
* 1     byte  CRC:  the CRC of the message, suing the Arduino internal CRC8 function

All Commands sent from client to the master need to be acknowledged by the master. The master will send a message with the same CMD as the original message, LEN = 1 and DATA with the event counter from the client message.

There is one exception for the SPI test:  
When CMD=0xEA, LEN=0xA5  
The SPI tests consists of 255 data bytes, using this algorithm:  
`data_0 = 0x01, data_i = (data_(i-1) * 5 + 1) % 256`  
As soon as the SPI test is done, the master and the client create error count messages (see [global](#global)).  
The client sends this as usual over SPI, the master injects the package as if it were received per SPI.

## IDs

### Module IDs

| ID dec | SHORT | NAME                |
| -----: | ----: | ------------------- |
|      0 |    CA | Case                |
|      1 |    CM | Clock Module        |
|      2 |    WI | Wires               |
|      3 |    TB | The Button          |
|      4 |    KP | Keypads             |
|      5 |    SS | Simon Says          |
|      6 |    WF | Who’s on First      |
|      7 |    ME | Memory              |
|      8 |    MC | Morse Code          |
|      9 |    CW | Complicated Wires   |
|     10 |    WS | Wire Sequences      |
|     11 |    MA | Mazes               |
|     12 |    PW | Passwords           |
|     16 |    VG | Venting Gas         |
|     17 |    CD | Capacitor Discharge |
|     18 |    KN | Knobs               |

### Color IDs (3 bit)

| ID    | COLOR               |
| ----- | ------------------- |
| 0b000 | not connected / off |
| 0b001 | black               |
| 0b010 | blue                |
| 0b011 | green               |
| 0b100 | red                 |
| 0b101 | yellow              |
| 0b110 | white               |

### Error codes (8 bit)

| ID  | ERROR CODE             |
| --- | ---------------------- |
| 0   | NoError                |
| 1   | CRCError               |
| 2   | InvalidCommand         |
| 3   | InvalidDataLength      |
| 4   | AcknowledgeError       |
| 5   | BufferOverflow         |
|     |                        |
| 10  | DisplayConnectionError |

## GLOBAL

MASTER->SLAVE
| CMD  | NAME                       |  LEN | DATA DESCRIPTION |
| ---- | -------------------------- | ---: | ---------------- |
| 0x00 | reserved for NO_CMD        |      |                  |
| 0xFF | reserved for NOT_CONNECTED |      |                  |
| 0xEA | reserved for SPI test      |      |                  |
|      |                            |      |                  |
| 0xFE | ACK Error code             |    1 | error counter    |
| 0xFD | ACK module initialization  |    1 | ID               |
| 0xFC | request module reset       |    0 |                  |

SLAVE->MASTER
| CMD  | NAME                                     | SENT CONDITION       |  LEN | DATA DESCRIPTION          |
| ---- | ---------------------------------------- | -------------------- | ---: | ------------------------- |
| 0x00 | reserved for NO_CMD                      |                      |      |                           |
| 0xFF | reserved for NOT_CONNECTED               |                      |      |                           |
| 0xEA | reserved for SPI test                    |                      |      |                           |
| 0xEB | Error count on MOSI (sent by slave)      | on SPI test done     |    1 | number of byte errors     |
| 0xEC | Error count on MISO (injected by master) | on SPI test done     |    1 | number of byte errors     |
|      |                                          |                      |      |                           |
| 0xFE | Error code                               | on error             |    2 | error counter, error code |
| 0xFD | module ID+version                        | when not initialized |    2 | ID, version               |

## 00 Case

### CA-01

MASTER->SLAVE
| CMD  | NAME                      |  LEN | DATA DESCRIPTION                 |
| ---- | ------------------------- | ---: | -------------------------------- |
| 0x01 | set 5 indicator lights    |    1 | 0b___43210:                      |
|      |                           |      | 0-4: indicator (1 = ON, 0 = OFF) |
| 0x02 | ACK 6 battery slot states |    1 | counter                          |

SLAVE->MASTER
| CMD  | NAME                  | SENT CONDITION              |  LEN | DATA DESCRIPTION                           |
| ---- | --------------------- | --------------------------- | ---: | ------------------------------------------ |
| 0x02 | 6 battery slot states | when initialized or changed |    2 | counter, 0b__543210:                       |
|      |                       |                             |      | 0-5: battery slots (1 = FILLED, 0 = EMPTY) |

## 01 Clock Module

### CM-01

MASTER->SLAVE
| CMD  | NAME                      |  LEN | DATA DESCRIPTION                                         |
| ---- | ------------------------- | ---: | -------------------------------------------------------- |
| 0x01 | game time left and errors |    2 | 0bLR__TTTT 0bTTTTTTTT:                                   |
|      |                           |      | L = left "X" LED (1 = ON, 0 = OFF)                       |
|      |                           |      | R = right "X" LED (1 = ON, 0 = OFF)                      |
|      |                           |      | T = time left in seconds (12 bit, MSB left to LSB right) |

## 02 Wires

### WI-01

MASTER->SLAVE
| CMD  | NAME            |  LEN | DATA DESCRIPTION                |
| ---- | --------------- | ---: | ------------------------------- |
| 0x01 | RG LED          |    1 | 0b______RG:                     |
|      |                 |      | R = Red LED (1 = ON, 0 = OFF)   |
|      |                 |      | G = Green LED (1 = ON, 0 = OFF) |
| 0x02 | ACK wire states |    1 | counter                         |

SLAVE->MASTER
| CMD  | NAME        | SENT CONDITION              |  LEN | DATA DESCRIPTION                                 |
| ---- | ----------- | --------------------------- | ---: | ------------------------------------------------ |
| 0x02 | wire states | when initialized or changed |    4 | counter, 0b__555444 0b__333222 0b__111000:       |
|      |             |                             |      | 0=top to 5=bottom: [color IDs](#color-ids-3-bit) |

## 03 The Button

## 04 Keypads

## 05 Simon Says

### SS-01

MASTER->SLAVE
| CMD  | NAME              |  LEN | DATA DESCRIPTION                 |
| ---- | ----------------- | ---: | -------------------------------- |
| 0x01 | RG LED            |    1 | 0b______RG:                      |
|      |                   |      | R = Red LED (1 = ON, 0 = OFF)    |
|      |                   |      | G = Green LED (1 = ON, 0 = OFF)  |
| 0x02 | LED states        |    1 | 0b____BYGR                       |
|      |                   |      | B = blue LED   (1 = ON, 0 = OFF) |
|      |                   |      | Y = yellow LED (1 = ON, 0 = OFF) |
|      |                   |      | G = green LED  (1 = ON, 0 = OFF) |
|      |                   |      | R = red LED    (1 = ON, 0 = OFF) |
| 0x03 | ACK button states |    1 | counter                          |

SLAVE->MASTER
| CMD  | NAME          | SENT CONDITION              |  LEN | DATA DESCRIPTION                                    |
| ---- | ------------- | --------------------------- | ---: | --------------------------------------------------- |
| 0x03 | button states | when initialized or changed |    2 | counter, 0b____BYGR                                 |
|      |               |                             |      | B = blue button state   (1 = PRESSED, 0 = RELEASED) |
|      |               |                             |      | Y = yellow button state (1 = PRESSED, 0 = RELEASED) |
|      |               |                             |      | G = green button state  (1 = PRESSED, 0 = RELEASED) |
|      |               |                             |      | R = red button state    (1 = PRESSED, 0 = RELEASED) |

## 06 Who’s on First

## 07 Memory

## 08 Morse Code

### MC-01

Morse Code Frequencies:
| Code | Frequency |
| ---- | --------- |
| 0x0  | 3.505 MHz |
| 0x1  | 3.515 MHz |
| 0x2  | 3.522 MHz |
| 0x3  | 3.532 MHz |
| 0x4  | 3.535 MHz |
| 0x5  | 3.542 MHz |
| 0x6  | 3.545 MHz |
| 0x7  | 3.552 MHz |
| 0x8  | 3.555 MHz |
| 0x9  | 3.565 MHz |
| 0xA  | 3.572 MHz |
| 0xB  | 3.575 MHz |
| 0xC  | 3.582 MHz |
| 0xD  | 3.592 MHz |
| 0xE  | 3.595 MHz |
| 0xF  | 3.600 MHz |

MASTER->SLAVE
| CMD  | NAME                     |  LEN | DATA DESCRIPTION                |
| ---- | ------------------------ | ---: | ------------------------------- |
| 0x01 | RG LED                   |    1 | 0b______RG:                     |
|      |                          |      | R = Red LED (1 = ON, 0 = OFF)   |
|      |                          |      | G = Green LED (1 = ON, 0 = OFF) |
| 0x02 | ACK button and frequency |    1 | counter                         |
| 0x03 | morse led                |    1 | 0b_______L:                     |
|      |                          |      | L = LED (1 = ON, 0 = OFF)       |

SLAVE->MASTER
| CMD  | NAME                 | SENT CONDITION              |  LEN | DATA DESCRIPTION    |
| ---- | -------------------- | --------------------------- | ---: | ------------------- |
| 0x02 | button and frequency | when button or freq changed |    2 | counter, 0b000BFFFF |
|      |                      |                             |      | B = button state    |
|      |                      |                             |      | F = frequency code  |

## 09 Complicated Wires

## 10 Wire Sequences

## 11 Mazes

### MA-01

Maze positioning:
| ROW\COL | 0   | 1   | 2   | 3   | 4   | 5   |
| ------- | --- | --- | --- | --- | --- | --- |
| 0       | 0   | 1   | 2   | 3   | 4   | 5   |
| 1       | 6   | 7   | 8   | 9   | 10  | 11  |
| 2       | 12  | 13  | 14  | 15  | 16  | 17  |
| 3       | 18  | 19  | 20  | 21  | 22  | 23  |
| 4       | 24  | 25  | 26  | 27  | 28  | 29  |
| 5       | 30  | 31  | 32  | 33  | 34  | 35  |

Special type codes:
| ID  | color       | DESCRIPTION                             |
| --- | ----------- | --------------------------------------- |
| 0   | green       | Circle 1 to identify labyrinth          |
| 1   | green       | Circle 2 to identify labyrinth          |
| 2   | white       | position of player                      |
| 3   | red pulsing | red turning triangle position of target |

MASTER->SLAVE
| CMD  | NAME               |  LEN | DATA DESCRIPTION                     |
| ---- | ------------------ | ---: | ------------------------------------ |
| 0x01 | RG LED             |    1 | 0b______RG:                          |
|      |                    |      | R = Red LED (1 = ON, 0 = OFF)        |
|      |                    |      | G = Green LED (1 = ON, 0 = OFF)      |
| 0x02 | ACK button states  |    1 | counter                              |
| 0x03 | Red wall positions |    5 | 0b01234567 0b89.....                 |
|      |                    |      | sets red positions in matrix above   |
| 0x04 | Special positions  |  1-4 | 0bCCPPPPPP:                          |
|      |                    |      | C = Special Type code                |
|      |                    |      | P = Position in maze (>35 means OFF) |

SLAVE->MASTER
| CMD  | NAME          | SENT CONDITION              |  LEN | DATA DESCRIPTION                                    |
| ---- | ------------- | --------------------------- | ---: | --------------------------------------------------- |
| 0x02 | button states | when initialized or changed |    2 | counter, 0b____TRBL                                 |
|      |               |                             |      | T = top button state    (1 = PRESSED, 0 = RELEASED) |
|      |               |                             |      | R = right button state  (1 = PRESSED, 0 = RELEASED) |
|      |               |                             |      | B = bottom button state (1 = PRESSED, 0 = RELEASED) |
|      |               |                             |      | L = left button state   (1 = PRESSED, 0 = RELEASED) |

## 12 Passwords

## 13 Venting Gas

## 14 Capacitor Discharge

## 15 Knobs
