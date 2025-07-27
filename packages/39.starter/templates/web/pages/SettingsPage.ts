import { Div, H1, Paragraph} from '39.ts';

export function SettingsPage(): HTMLElement {
    return Div({ className: 'default-section' }, [
        H1({ className: 'default-h1' }, ['⚙️ Settings']),
        Paragraph({ className: 'default-p' }, ['This is the settings page.'])
    ]);
}
