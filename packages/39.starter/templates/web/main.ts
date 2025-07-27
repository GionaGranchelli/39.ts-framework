import {createApp, eventBus, Layout, render, Store} from '39.ts';
import {AppState, initGlobalStore} from './storage/initGlobalStore';
import {router, routerView} from './router';
import '39.ts/styles';


function handleThemeChange(store: Store<AppState>) {
    eventBus.on("theme:change", _ => {
        const theme = store.get('theme') || 'dark';
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', `light`);
            store.set('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', `dark`);
            store.set('theme', 'dark');
        }
    });
}

// @ts-ignore
(async () => {
    const store = await initGlobalStore();
    await createApp({
        store,
        platform: {
            init: async () => console.log('🌐 Web platform ready')
        },
        options: {
            // @ts-ignore
            onReady: async () => {
                handleThemeChange(store);
                const appContent = Layout(
                    routerView,
                    router,
                    {
                        // @ts-ignore
                        state: store.state,
                        onThemeChange : () => eventBus.emit("theme:change", null)
                    }
                );
                render(appContent);
                console.log('✅ App booted');
            }
        }
    });
})();
