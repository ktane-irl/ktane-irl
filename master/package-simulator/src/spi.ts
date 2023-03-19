import * as spi from "spi-device"

function BufferToString(b: Buffer) {
    return b.toString("hex").match(/.{1,2}/g)?.join(" ")
}

export class SPI {
    spi: spi.SpiDevice
    constructor() {
        this.spi = spi.openSync(0, 0)
    }

    transfer(outbuffer: Buffer): Promise<Buffer> {
        return new Promise<Buffer>(async (resolve, reject) => {
            const message = {
                sendBuffer: outbuffer,
                receiveBuffer: Buffer.alloc(outbuffer.length),
                byteLength: outbuffer.length,
                // speedHz: 9600
                // speedHz: 57600
                speedHz: 60000 // 0 Errors/MB
                // speedHz: 63000 // 4 Errors/MB
                // speedHz: 64000 // 4.5 Errors/MB
                // speedHz: 65000 // 10 Errors/MB
                // speedHz: 67000 // 20 Errors/MB
                // speedHz: 115200 // 80 Error/MB
            };

            // console.log("Sending : " + Array.from(outbuffer).map(x => x.toString(16).padStart(2, "0")).join(" "))
            console.log("Sending : " + BufferToString(outbuffer))

            this.spi.transfer([message], (err, msg: spi.SpiMessage) => {
                if (err)
                    reject(err)
                else if (!msg[0].receiveBuffer)
                    reject(Error("answer Buffer is null"));
                else {
                    console.log("Received: " + BufferToString(msg[0].receiveBuffer))
                    resolve(msg[0].receiveBuffer)
                }
            })
        })
    }

    close() {
        this.spi.closeSync()
    }

}
