// PasswordField.ts — Input with toggle visibility

import { createSignal } from '../core/signal';
import { Div, Button, Span, Input, Label } from '../dom/html';

export function PasswordField(label: string = 'Password', defaultValue = '') {
    const value = createSignal(defaultValue);
    const visible = createSignal(false);

    const input = Input({
        type: 'password',
        value: value.get(),
        oninput: (e: { target: HTMLInputElement; }) => value.set((e.target as HTMLInputElement).value),
        className: 'default-input'
    });

    const toggle = Button({
        type: 'button',
        onclick: () => {
            visible.set(!visible.get());
            input.setAttribute('type', visible.get() ? 'text' : 'password');
            icon.textContent = visible.get() ? '🙈' : '👁';
        },
        className: 'toggle-button'
    }, []);

    const icon = Span({}, [visible.get() ? '🙈' : '👁']);
    toggle.appendChild(icon);

    const wrapper = Div({}, [
        Label({}, [label]),
        Div({ style: { display: 'flex', gap: '0.5rem' } }, [input, toggle])
    ]);

    return {
        element: wrapper,
        signal: value,
        reset: () => value.set(defaultValue),
        disable: () => input.setAttribute('disabled', 'true'),
        enable: () => input.removeAttribute('disabled')
    };
}
