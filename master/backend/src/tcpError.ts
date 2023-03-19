export class TcpError extends Error {
    constructor(public readonly text: string) {
        super(`Tcp Error: ${text}`)
    }
}
