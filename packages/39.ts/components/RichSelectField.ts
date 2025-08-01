import { createSignal } from '../core/signal';
import { Div, Label, Select, Option, Span } from '../dom/html';
import { createDerived } from '../core/createDerived';

export type OptionItem<T> = {
    label: string;
    value: T;
    icon?: string;
};

export function RichSelectField<T>(label: string, options: OptionItem<T>[], defaultValue: T) {
    const value = createSignal<T>(defaultValue);
    const error = createSignal<string | null>(null);

    const select = Select({
        className: 'default-select',
        onchange: (e: { target: HTMLSelectElement; }) => {
            const selected = options.find(opt => String(opt.value) === (e.target as HTMLSelectElement).value);
            if (selected) value.set(selected.value);
        }
    });

    for (const opt of options) {
        const optionEl = Option({ value: String(opt.value) }, [opt.icon ? `${opt.icon} ${opt.label}` : opt.label]);
        select.appendChild(optionEl);
    }

    const errorNode = Span({ className: 'input-error' }, []);
    createDerived(() => {
        errorNode.textContent = error.get() ?? '';
        errorNode.style.display = error.get() ? 'block' : 'none';
    }, [error]);

    return {
        element: Div({}, [Label({}, [label]), select, errorNode]),
        signal: value,
        error,
        reset: () => value.set(defaultValue),
        disable: () => select.setAttribute('disabled', 'true'),
        enable: () => select.removeAttribute('disabled')
    };
}
