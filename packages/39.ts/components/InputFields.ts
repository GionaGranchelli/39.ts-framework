import {createSignal} from '../core/signal';
import {Div, Label, Input, Select, Textarea, Span} from '../dom/html';
import {createDerived} from '../core/createDerived';

export type InputType =
    | 'text'
    | 'number'
    | 'checkbox'
    | 'password'
    | 'email'
    | 'textarea'
    | 'select'
    | 'date';

export type InputFieldProps<T> = {
    label?: string;
    type?: InputType;
    placeholder?: string;
    options?: { label: string; value: T }[]; // For select
    min?: number;
    max?: number;
    step?: number;
    required?: boolean;
    defaultValue?: T;
    validate?: (value: T) => string | null;
};

export function InputField<T>(props: InputFieldProps<T>): {
  element: HTMLElement;
  signal: ReturnType<typeof createSignal<T>>;
  error: ReturnType<typeof createSignal<string | null>>;
  reset: () => void;
  disable: () => void;
  enable: () => void;
} {
  const type = props.type || 'text';
  const defaultValue = props.defaultValue ?? getDefaultForType(type);
  const signal = createSignal<T>(defaultValue);
  const errorSignal = createSignal<string | null>(null);

    let inputElement: HTMLElement;

    const updateValue = (e: Event) => {
        const el = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        let value: any;

        switch (props.type) {
            case 'checkbox':
                value = (el as HTMLInputElement).checked;
                break;
            case 'number':
                value = parseFloat(el.value);
                if (isNaN(value)) value = '';
                break;
            case 'date':
                value = el.value; // as ISO string
                break;
            default:
                value = el.value;
        }

        const error = props.validate?.(value as T) ?? null;
        errorSignal.set(error);

        if (!error) {
            signal.set(value as T);
        }
    };

    switch (type) {
        case 'textarea':
            inputElement = Textarea({
                placeholder: props.placeholder,
                className: 'default-input',
                oninput: (e: { target: HTMLTextAreaElement; }) => {
                    const value = (e.target as HTMLTextAreaElement).value as T;
                    validateAndSet(value);
                },
            }, []);
            break;

        case 'select':
            inputElement = Select({
                    className: 'default-input',
                    onchange: updateValue
                },
                (props.options ?? []).map(opt => {
                    const option = document.createElement('option');
                    option.value = String(opt.value);
                    option.textContent = opt.label;
                    return option;
                })
            );
            break;
        case 'checkbox':
            inputElement = Input({
                type,
                placeholder: props.placeholder,
                className: 'default-input',
                min: props.min?.toString(),
                max: props.max?.toString(),
                step: props.step?.toString(),
                checked: Boolean(signal.get()),
                value: String(signal.get()),
                oninput: (e: { target: HTMLInputElement; }) => {
                    const el = e.target as HTMLInputElement;
                    let newVal: any = el.value;
                    newVal = el.checked;
                    validateAndSet(newVal as T);
                }
            });
            break;
        default:
            inputElement = Input({
                type: props.type || 'text',
                value: props.defaultValue ?? getDefaultForType(props.type),
                oninput: updateValue
            });
    }

    const errorNode = Span({className: 'input-error'}, ['']);
    createDerived(() => {
        errorNode.textContent = errorSignal.get() ?? '';
        errorNode.style.display = errorSignal.get() ? 'block' : 'none';
    }, [errorSignal]);

    const validateAndSet = (value: T) => {
        const error = props.validate?.(value) ?? null;
        errorSignal.set(error);
        if (!error) signal.set(value);
    };

    const wrapper = props.label
        ? Div({}, [Label({}, [props.label]), inputElement, errorNode])
        : Div({}, [inputElement, errorNode]);

    return {
        element: wrapper,
        signal,
        error: errorSignal,
        reset: () => signal.set(defaultValue),
        disable: () => inputElement.setAttribute('disabled', 'true'),
        enable: () => inputElement.removeAttribute('disabled')
    };
}

function getDefaultForType(type?: InputType): any {
    switch (type) {
        case 'checkbox': return false;
        case 'number': return 0;
        case 'select': return '';
        case 'date': return new Date().toISOString();
        default: return '';
    }
}

