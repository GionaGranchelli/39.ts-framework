import {Signal} from "./state";

export interface MainHeaderProps {
    state: {
        state: Signal<string>,
        set: (field: string, value: string) => void,
        get: (field: string) => string
    };
    onThemeChange: () => void;
}