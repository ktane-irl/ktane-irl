<!-- todo -->

## Build

### case

#### SPI

All modules communicate via SPI
RASP   --> Arduino/ESP
MASTER --> SLAVE
M      --> S


SPI always sends and recieves data in parallel, so when a byte gets send, the next data can only be recieved as soon as the next awnser bit recieves.
| BYTE | M->S    | S->M   |
| ---- | ------- | ------ |
| 0    | REQUEST | 0      |
| 1    | 0       | AWNSER |

Due to this principal, commands can overlap each other:
| BYTE | M->S      | S->M     |
| ---- | --------- | -------- |
| 0    | REQUEST 1 | 0        |
| 1    | REQUEST 2 | AWNSER 1 |
| 2    | REQUEST 3 | AWNSER 2 |
| 3    | REQUEST 4 | AWNSER 3 |
| 4    | 0         | AWNSER 4 |

The only known varaible is that the first return value must be 0 and you need to send zeros until all awnsers are recieved.

### modules

### compile and upload

#### dependencies

##### public libs
