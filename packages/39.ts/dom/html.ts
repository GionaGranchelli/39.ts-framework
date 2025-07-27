// /components/html.ts
import { h, Props, Children } from './h';

function normalizeArgs(a?: Props | Children[], b?: Children[]): [Props, Children[]] {
    if (Array.isArray(a)) return [{}, a];
    return [a || {}, b || []];
}


export const Div = (props: Props = {}, children: Children[] = []) => {
    const [normalizedProps, normalizedChildren] = normalizeArgs(props, children)
    return h('div', normalizedProps, normalizedChildren);
}
export const Span = (props: Props = {}, children: Children[] = []) => {
    const [normalizedProps, normalizedChildren] = normalizeArgs(props, children)
    return h('span', normalizedProps, normalizedChildren);
}
export const Button = (props: Props = {}, children: Children[] = []) => {
    const [normalizedProps, normalizedChildren] = normalizeArgs(props, children)
    return h('button', normalizedProps, normalizedChildren);
}
export const H1 = (props: Props = {}, children: Children[] = []) => {
    const [normalizedProps, normalizedChildren] = normalizeArgs(props, children)
    return h('h1', normalizedProps, normalizedChildren);
}
export const H2 = (props: Props = {}, children: Children[] = []) =>
    h('h2', ...normalizeArgs(props, children));
export const H3 = (props: Props = {}, children: Children[] = []) =>
    h('h3', ...normalizeArgs(props, children));
export const Textarea = (props: Props = {}, children: Children[] = []) =>
    h('textarea', ...normalizeArgs(props, children));
export const Select = (props: Props = {}, children: Children[] = []) =>
    h('select', ...normalizeArgs(props, children));

export const Paragraph = (props: Props = {}, children: Children[] = []) => {
    const [normalizedProps, normalizedChildren] = normalizeArgs(props, children)
    return h('p', normalizedProps, normalizedChildren);
}
export const Section = (props: Props = {}, children: Children[] = []) => {
    const [normalizedProps, normalizedChildren] = normalizeArgs(props, children)
    return h('section', normalizedProps, normalizedChildren);
}
export const Input = (props: Props = {}) => {
    return h('input', props);
}
export const Label = (props: Props = {}, children: Children[] = []) => {
    const [normalizedProps, normalizedChildren] = normalizeArgs(props, children)
    return h('label', normalizedProps, normalizedChildren);
}
export const Nav = (props: Props = {}, children: Children[] = []) => {
    const [normalizedProps, normalizedChildren] = normalizeArgs(props, children)
    return h('nav', normalizedProps, normalizedChildren);
}
export const Aside = (props: Props = {}, children: Children[] = []) => {
    const [normalizedProps, normalizedChildren] = normalizeArgs(props, children)
    return h('aside', normalizedProps, normalizedChildren);
}
export const P = (props: Props = {}) => {
    return h('p', props);
}
export const Header = (props: Props = {}, children: Children[] = []) => {
    const [normalizedProps, normalizedChildren] = normalizeArgs(props, children)
    return h('header', normalizedProps, normalizedChildren);
}
export const Option = (props: Props = {}, children: Children[] = []) => {
    return h('option', props, children);
};
export const Ul = (props: Props, children: Children[]) => {
    const [normalizedProps, normalizedChildren] = normalizeArgs(props, children)
    return h('ul', normalizedProps, normalizedChildren);
}
export const Li = (props: Props, children: Children[]) => {
    const [normalizedProps, normalizedChildren] = normalizeArgs(props, children)
    return h('li', normalizedProps, normalizedChildren);
}
export const Footer = (props: Props, children: Children[]) => {
    const [normalizedProps, normalizedChildren] = normalizeArgs(props, children)
    return h('footer', normalizedProps, normalizedChildren);
}
export const Main = (props: Props, children: Children[]) => {
    const [normalizedProps, normalizedChildren] = normalizeArgs(props, children)
    return h('main', normalizedProps, normalizedChildren);
}
export const A = (props: Props, children: Children[]) => {
    const [normalizedProps, normalizedChildren] = normalizeArgs(props, children)
    return h('a', normalizedProps, normalizedChildren);
}

export const Img = (props: Props, children: Children[]) => {
    const [normalizedProps, normalizedChildren] = normalizeArgs(props, children)
    return h('img', normalizedProps, normalizedChildren);
}
