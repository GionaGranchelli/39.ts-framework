import { createComponent } from './component';
import { createEffect } from '../core/createEffect';
import { Div, Section, Button } from '../dom/html';
import { Signal } from '../@types/state';

export const Modal = createComponent<{ visible: Signal<boolean>, onClose?: () => void }>((props, { onMount }) => {
    const { visible, onClose } = props;

    const close = () => {
        visible.set(false);
        onClose?.();
    };

    const modalContent = Section({ className: 'modal-content' }, [
        Button({ onclick: close, className: 'modal-close' }, ['×']),
        Div({}, [`This is the modal content.`])
    ]);

    // Effect to mount/unmount modal
    createEffect(() => {
        const root = document.getElementById('modal-root');
        if (!root) return;

        const show = visible.get();
        root.innerHTML = ''; // clear previous
        if (show) {
            root.style.display = 'flex';
            root.appendChild(modalContent);
        } else {
            root.style.display = 'none';
        }
    }, [visible]);

    // Escape key listener
    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') close();
    };

    onMount(() => {
        document.addEventListener('keydown', handleKeydown);
    });

    return Div({}); // return empty since DOM insert is manual
});
