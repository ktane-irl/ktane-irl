// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventCallback = (...args: any[]) => any;
export type EventMap = Record<string, EventCallback>;
export type EventKey<T extends EventMap> = string & keyof T;
export type EventDisposable = { off(): void; }

export class Emitter<T extends EventMap> {
    private listeners: {
        [key: string]: Array<EventCallback>;
    } = {}

    constructor() { return }

    on<K extends EventKey<T>>(key: K, fn: T[K]): EventDisposable {
        this.listeners[key] = (this.listeners[key] || []).concat(fn)
        return {
            off: () => this.off(key, fn)
        }
    }

    off<K extends EventKey<T>>(key: K, fn: T[K]): number {
        const len = this.listeners[key]?.length || 0
        this.listeners[key] = (this.listeners[key] || []).filter(f => f !== fn)
        return len - (this.listeners[key]?.length || 0)
    }

    emit<K extends EventKey<T>>(key: K, ...data: Parameters<T[K]>): ReturnType<T[K]>[] {
        return (this.listeners[key] || []).map(fn => fn(...data))
    }
}
