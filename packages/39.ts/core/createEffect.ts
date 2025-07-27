import {Signal} from "../@types/state";

export function createEffect(fn: () => void, deps: Signal<any>[]) {
    deps.forEach(dep => dep.subscribe(fn));
    fn(); // run once initially
}