import { createSignal } from "../core/signal";

export type Crumb = { label: string; path: string };

const crumbs = createSignal<Crumb[]>([]);

export function useCrumbs() {
    return crumbs;
}

export function pushCrumb(path: string, label: string) {
    const existing = crumbs.get().find(c => c.path === path);
    if (!existing) {
        crumbs.set([...crumbs.get(), { label, path }]);
    }
}

export function resetCrumbs() {
    const home: Crumb = { label: "Home", path: "/" };
    crumbs.set([home]);
}
