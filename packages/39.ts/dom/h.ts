// /core/h.ts
import { eventBus } from '../core/eventBus'; // assume you have a basic EventBus
import { defaultClassNames } from './defaultClassNames';
import {Signal} from "../@types/state";


export type Props = {
    [key: string]: any;
    dispatch?: string; // topic to emit to EventBus
};

export type Children = string | HTMLElement | Array<Children>| Signal<any>;
export function h(
    tag: keyof HTMLElementTagNameMap,
    props: Props = {},
    children: Children[] = []
): HTMLElement {

    // ✅ VALIDATE FIRST
    if (typeof props !== 'object' || props === null || Array.isArray(props)) {
        console.error(`🚨 Invalid props passed to <${tag}>:`, props);
        throw new Error(`Invalid props: expected object, got ${typeof props}`);
    }

    const el = document.createElement(tag);

    const { dispatch, className, ...rest } = props;

    // Apply default className if not provided
    if (!className && defaultClassNames[tag]) {
        el.className = defaultClassNames[tag]!;
    } else if (className) {
        el.className = className;
    }

    // Rest of the props
    for (const [key, value] of Object.entries(rest)) {
        try {
            switch (true) {
                case key.startsWith('on') && typeof value === 'function':
                    el.addEventListener(key.slice(2).toLowerCase(), (e) => {
                        value(e);
                        if (dispatch) eventBus.emit(dispatch, e);
                    });
                    break;
                case key === 'text':
                    el.innerText = value;
                    break;
                case key === 'style' && typeof value === 'object':
                    Object.assign(el.style, value);
                    break;
                case key === 'util' && Array.isArray(value):
                    el.className += ' ' + value.join(' ');
                    break;
                case value !== false && value != null:
                    if (typeof key !== 'string' || key.trim() === '') {
                        console.error('❌ Invalid attribute key:', key, value);
                        throw new Error(`Invalid attribute key: ${key}`);
                    }
                    el.setAttribute(key, String(value));
                    break;
            }
        } catch (err) {
            console.error(`❌ Error setting attribute on <${tag}>:`, key, value);
            throw err;
        }
    }

    // Children
    const append = (child: Children) => {
        if (Array.isArray(child)) {
            child.forEach(append);
        } else if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
            el.appendChild(child);
        } else if (child && typeof child === 'object' && 'get' in child && 'subscribe' in child) {
            const textNode = document.createTextNode(String(child.get()));
            el.appendChild(textNode);
            child.subscribe((newVal: any) => {
                textNode.textContent = String(newVal);
            });
        }
    };
    children.forEach(append);

    return el;
}
