import {Signal} from "../@types/state";
import {createDerived} from "./createDerived";

export function createStoreSelector<T, K extends keyof T>(signal: Signal<T>, key: K): Signal<T[K]> {
    return createDerived(() => signal.get()[key], [signal]);
}
