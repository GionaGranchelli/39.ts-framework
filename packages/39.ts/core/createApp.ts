import {eventBus, setEventLogger} from './eventBus';
import {initDevPanel} from "./devLogger";
import {setSignalLogger} from "./signal";
import {CreateAppConfig, BaseAppState} from "../@types/Config";

export async function createApp<T extends BaseAppState>(config: CreateAppConfig<T>) {
    const { options = {}, platform, store } = config;
    try {
        if (platform?.init) {
            await platform.init();
        }
        document.documentElement.setAttribute('data-theme', store.state.get().theme);
        eventBus.emit('app:ready', null);

        if (options.onReady) {
            if (location.search.includes('debug=true')) {
                const logger = initDevPanel();
                setEventLogger(logger);
                setSignalLogger((name, val) => logger('signal', name, val));
            }

            options.onReady();
        }
    } catch (err) {
        console.error("Error during app initialization:", err);
        eventBus.emit('app:error', err);
        if (options.onError) options.onError(err);
        return; // Don't proceed further if initialization failed
    }
}
