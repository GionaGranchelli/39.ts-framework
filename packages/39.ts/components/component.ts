import { VNode, renderVNode } from '../dom/domSystem.js';

export type ComponentContext = {
    onMount(cb: () => void): void;
    onDestroy(cb: () => void): void;
};

// Components can return either VNode (virtual) or HTMLElement (real)
export type Component = (ctx: ComponentContext) => HTMLElement | VNode;

export type ComponentWithProps<T> = (props: T, ctx: ComponentContext) => HTMLElement | VNode;

export type ComponentFactory<TProps> = {
    (setup: (props: TProps, ctx: ComponentContext) => HTMLElement | VNode): (props: TProps) => HTMLElement;
};

/**
 * Creates a component that always returns an HTMLElement.
 * If the setup function returns a VNode, it will be automatically rendered to HTMLElement.
 */
export function createComponent<TProps>(
    setup: (props: TProps, ctx: ComponentContext) => HTMLElement | VNode
): (props: TProps) => HTMLElement {
    return (props: TProps) => {
        const mountCallbacks: (() => void)[] = [];
        const destroyCallbacks: (() => void)[] = [];

        const ctx: ComponentContext = {
            onMount(cb) {
                mountCallbacks.push(cb);
            },
            onDestroy(cb) {
                destroyCallbacks.push(cb);
            }
        };

        const result = setup(props, ctx);
        
        // Convert VNode to HTMLElement if needed
        const el = result instanceof HTMLElement ? result : renderVNode(result);

        // Trigger onMount (after current task)
        queueMicrotask(() => {
            mountCallbacks.forEach(fn => fn());
        });

        // Trigger onDestroy when element is removed from DOM
        const observer = new MutationObserver(() => {
            if (!document.body.contains(el)) {
                destroyCallbacks.forEach(fn => fn());
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        return el;
    };
}

/**
 * Creates a functional component that returns VNode (for composition)
 * Use this when you want to create reusable VNode-based components
 */
export function createVNodeComponent<TProps>(
    setup: (props: TProps) => VNode
): (props: TProps) => VNode {
    return (props: TProps) => setup(props);
}

/**
 * Creates a functional component that returns HTMLElement (for direct use)
 * Use this when you need immediate DOM manipulation
 */
export function createDOMComponent<TProps>(
    setup: (props: TProps) => HTMLElement | VNode
): (props: TProps) => HTMLElement {
    return (props: TProps) => {
        const result = setup(props);
        return result instanceof HTMLElement ? result : renderVNode(result);
    };
}
