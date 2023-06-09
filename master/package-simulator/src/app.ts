import { SPI } from './spi';

const spi = new SPI()

const send = [ //CMD, LEN, DATA, CRC
    0x00, 0x00, 0x5a, 0x7e, //init communication
    //0xfd, 0x01, 0x01, 0xf3, //ack module init (module simon says)
    //0xfd, 0x01, 0x0b, 0xd9, // Module init ack (module mazes)
    //0xfd, 0x01, 0x01, 0xef,
    // 0x02, 0x01, 0x00, 0xc3,

    //0x02, 0x01, 0x00, 0xc3, // Ack first wire state
    //0x02, 0x01, 0x01, 0xC4, // Ack second wire state
    //0xfe, 0x01, 0x03, 0x5C, //Ack third error
    //0xfe, 0x01, 0x01, 0x52, //Ack second error
    //0x02, 0x02, 0x01, 0x00, 0xef, //Send invalid len with valid crc
    //0x01, 0x01, 0x03, 0x77,
    //0x01, 0x01, 0x02, 0x70,
    //0x01, 0x01, 0x01, 0x79,
    //0x04, 0x01, 0x91, 0x40, // Set Matrix led 17
    //0x04, 0x01, 0x81, 0x30,
    //0x04, 0x01, 0x05, 0xA5, // Set green circle1 on matrix pos 5
    //0x04, 0x01, 0x3F, 0x03,// Clear green circle
    //0x04, 0x01, 0xC7, 0xE5, // Set target index
    //0x04, 0x01, 0xFF, 0x4D, // CLear target
    0x03, 0x05, 0x80, 0x00, 0x00, 0x00, 0x00, 0x7c, // Set red wall position on matrix pos 0
    //0x03, 0x05, 0xFF, 0xFF, 0xFF, 0xFF, 0xF0, 0x21, // Set all red wall positions 
    ...Array(32).fill(0x00)
]

async function main() {
    await spi.transfer(Buffer.from(send))

    spi.close()
}

main()
