import { createSignal } from "./signal";
import { Div, Span } from "../dom/html";
import { createComponent } from "../components/component";
import {createDerived} from "./createDerived";

export function useLoadingOverlay() {
    const visible = createSignal(false);

    const LoadingOverlay = createComponent(() => {
        const wrapper = Div({ className: 'loading-overlay', style: { display: 'none' } }, [
            Span({ className: 'spinner' }, ['Loading...'])
        ]);

        // reactively update style.display based on signal
        createDerived(() => {
            wrapper.style.display = visible.get() ? 'flex' : 'none';
        }, [visible]);

        return wrapper; // ✅ returns actual HTMLElement, not a signal
    });

    return {
        LoadingOverlay,
        show: () => visible.set(true),
        hide: () => visible.set(false),
        isVisible: visible
    };
}