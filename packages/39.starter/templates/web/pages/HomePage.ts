import {Div, H1, Paragraph} from '39.ts';

export function HomePage(): HTMLElement {
    return Div({ className: 'default-section' }, [
        H1({ className: 'default-h1' }, ['🏠 Home']),
        Paragraph({ className: 'default-p' }, ['Welcome to your 39.ts-powered app!'])
    ]);
}
