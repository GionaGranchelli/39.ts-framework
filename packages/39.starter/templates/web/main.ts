import {createApp, Layout, render, router, createSignal} from '39.ts';
import {AppState, initGlobalStore} from './storage/initGlobalStore';
import '39.ts/styles';
import {Store} from "39.ts/core/store";
import {routerView} from "./router";

// Create a theme change signal instead of using the internal event bus
const themeChangeSignal = createSignal(null);

function handleThemeChange(store: Store<AppState>) {
    themeChangeSignal.subscribe(_ => {
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
                        onThemeChange : () => themeChangeSignal.set(Date.now()) // Trigger theme change
                    }
                );
                render(appContent);
                console.log('✅ App booted');
            }
        }
    });
})();
