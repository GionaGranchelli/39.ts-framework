import { createSignal } from '../core/signal';
import { Div, Label, Input, Span } from '../dom/html';
import { createDerived } from '../core/createDerived';

const phoneRegex = /^\+?\d{7,15}$/;

export function PhoneNumberField(label = 'Phone', defaultValue = '') {
    const value = createSignal(defaultValue);
    const error = createSignal<string | null>(null);

    const input = Input({
        type: 'tel',
        placeholder: '+123456789',
        value: value.get(),
        oninput: (e: { target: HTMLInputElement; }) => {
            const val = (e.target as HTMLInputElement).value;
            value.set(val);
            error.set(phoneRegex.test(val) ? null : 'Invalid phone number');
        },
        className: 'default-input'
    });

    const errorNode = Span({ className: 'input-error' }, []);
    createDerived(() => {
        errorNode.textContent = error.get() ?? '';
        errorNode.style.display = error.get() ? 'block' : 'none';
    }, [error]);

    return {
        element: Div({}, [Label({}, [label]), input, errorNode]),
        signal: value,
        error,
        reset: () => value.set(defaultValue),
        disable: () => input.setAttribute('disabled', 'true'),
        enable: () => input.removeAttribute('disabled')
    };
}
