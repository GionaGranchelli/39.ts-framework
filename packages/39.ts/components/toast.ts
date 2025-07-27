import { Div, Span } from '../dom/html';
import { createList } from '../core/signalList';
import { eventBus } from '../core/eventBus';

const toasts = createList<string>([], (msg) =>
    Div({ className: 'toast' }, [Span({}, [msg])])
);

export const ToastContainer = () => {
    return Div({ className: 'toast-container' }, [toasts.render()]);
};

eventBus.on('toast:show', (msg: { message: string }) => {
    toasts.add(msg.message);
    setTimeout(() => toasts.removeAt(0), 4000);
});
