
type EventHandler<T = unknown> = (payload: T) => void;

export let logFn: ((type: string, name: string, payload: unknown) => void) | null = null;
export function setEventLogger(fn: typeof logFn) {
    logFn = fn;
}

class EventBus {
    private events = new Map<string, Set<EventHandler>>();

    on<T>(event: string, handler: EventHandler<T>) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event)!.add(handler as EventHandler);
    }

    off<T>(event: string, handler: EventHandler<T>) {
        this.events.get(event)?.delete(handler as EventHandler);
    }

    emit<T>(event: string, payload: T | null) {
        for (const handler of this.events.get(event) ?? []) {
            handler(payload);
            if (logFn) logFn('event', event, payload);
        }
    }

    clear(event?: string) {
        if (event) this.events.delete(event);
        else this.events.clear();
    }
}

export const eventBus = new EventBus();