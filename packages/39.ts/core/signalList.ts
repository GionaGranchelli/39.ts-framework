// /core/createList.ts
import { createSignal } from './signal';
import { h } from '../dom/h';

export function createList<T>(
    initial: T[],
    renderItem: (item: T, index: number) => HTMLElement,
    tag: keyof HTMLElementTagNameMap = 'div'
) {
    const signal = createSignal<T[]>(initial);
    const container = h(tag, {}, []);

    const render = () => {
        while (container.firstChild) container.removeChild(container.firstChild);
        signal.get().forEach((item, i) => {
            container.appendChild(renderItem(item, i));
        });
    };

    render();

    signal.subscribe(render);

    return {
        signal,
        render: () => container,
        add(item: T) {
            signal.set([...signal.get(), item]);
        },
        removeAt(index: number) {
            const list = [...signal.get()];
            list.splice(index, 1);
            signal.set(list);
        },
        clear() {
            signal.set([]);
        },
    };
}
