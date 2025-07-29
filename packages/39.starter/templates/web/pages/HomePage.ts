import {Div, H1, P} from '39.ts';

export function HomePage(): HTMLElement {
    return Div({ className: 'default-section' }, [
        H1({ className: 'default-h1' }, ['🏠 Home']),
        P({ className: 'default-p' }, ['Welcome to your 39.ts-powered app!'])
    ]);
}
