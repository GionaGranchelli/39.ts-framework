export type ComponentContext = {
    onMount(cb: () => void): void;
    onDestroy(cb: () => void): void;
};

export type Component = (ctx: ComponentContext) => HTMLElement;

export type ComponentWithProps<T> = (props: T, ctx: ComponentContext) => HTMLElement;

export type ComponentFactory<TProps> = {
    (setup: (props: TProps, ctx: ComponentContext) => HTMLElement): (props: TProps) => HTMLElement;
};

export function createComponent<TProps>(
    setup: (props: TProps, ctx: ComponentContext) => HTMLElement
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

        const el = setup(props, ctx);

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