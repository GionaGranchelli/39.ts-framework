import {Signal} from "../@types/state";

export function bind<T>(signal: Signal<T>) {
    return {
        value: signal.get(),
        oninput: (e: Event) => {
            const target = e.target as HTMLInputElement;
            signal.set(target.value as T);
        }
    };
}
