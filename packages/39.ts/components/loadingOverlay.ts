import {createComponent} from './component';
import {Div, Span} from '../dom/html';
import {createSignal} from '../core/signal';
import {createDerived} from '../core/createDerived';

export function loadingOverlay() {
    const visible = createSignal(false);

    const Overlay = createComponent<{ title: string }>((props,ctx) => {
        const overlay = Div({ className: 'loading-overlay' }, [

        ]);
        ctx.onMount(() => console.log("overlay"))
        const visibility = createDerived(() => {
            overlay.style.display = visible.get() ? 'flex' : 'none';
            return overlay;
        }, [visible]);

        return Div({}, [visibility]);
    });

    return {
        Overlay,
        show: () => visible.set(true),
        hide: () => visible.set(false),
        toggle: () => visible.set(!visible.get())
    };
}
