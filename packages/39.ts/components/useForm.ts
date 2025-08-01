import { Div, Button } from '../dom/html';
import {InputField, InputFieldProps} from "./InputFields";

export type FormField<T> = ReturnType<typeof InputField<T>>;

export type UseFormReturn<T> = {
    fields: { [K in keyof T]: FormField<T[K]> };
    element: HTMLElement;
    getValues: () => T;
    isValid: () => boolean;
    handleSubmit: (callback: (data: T) => void) => void;
    reset: () => void;
    disable: () => void;
    enable: () => void;
};

export function useForm<T>(fieldsConfig: { [K in keyof T]: InputFieldProps<T[K]> }): UseFormReturn<T> {
    const fields: any = {};
    const fieldElements: HTMLElement[] = [];

    for (const key in fieldsConfig) {
        const field = InputField(fieldsConfig[key]);
        fields[key] = field;
        fieldElements.push(field.element);
    }

    const element = Div({}, fieldElements);

    const getValues = (): T => {
        const result: any = {};
        for (const key in fields) {
            result[key] = fields[key].signal.get();
        }
        return result;
    };

    const isValid = (): boolean => {
        for (const key in fields) {
            const error = fields[key].error?.get?.();
            if (error) return false;
        }
        return true;
    };

    const handleSubmit = (callback: (data: T) => void) => {
        const submitBtn = Button({ onclick: () => {
                if (isValid()) callback(getValues());
            } }, ['Submit']);
        element.appendChild(submitBtn);
    };

    const reset = () => Object.values(fields).forEach((f: any) => f.reset?.());
    const disable = () => Object.values(fields).forEach((f: any) => f.disable?.());
    const enable = () => Object.values(fields).forEach((f: any) => f.enable?.());

    return {
        fields,
        element,
        getValues,
        isValid,
        handleSubmit,
        reset,
        disable,
        enable
    };
}
