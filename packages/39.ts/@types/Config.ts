import type {Store} from "../core/store";
import {PlatformAdapter} from "./PlatformAdapter";

export interface AppOptions {
    onReady?: () => void;
    onError?: (err: unknown) => void;
}

export interface AppConfig<T> {
    options?: AppOptions;
    store: Store<T>
    platform?: PlatformAdapter;
}

export interface BaseAppState {
    theme: string;
    [key: string]: any;
}


export interface CreateAppConfig<T extends BaseAppState> {
    options?: AppOptions;
    store: Store<T>;
    // bridge: Bridge;
    platform: PlatformAdapter;
}
