import {Footer, Paragraph} from "../../dom/html";

export function MainFooter() {
    const el = Footer({ className: 'layout-footer' }, [
        Paragraph({}, ['© 2025 39.ts. All rights reserved.'])
    ]);
    return el;
}