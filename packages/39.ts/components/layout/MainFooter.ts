import {Footer, P} from "../../dom/domSystem";

export function MainFooter() {
    const el = Footer({ className: 'layout-footer' }, [
        P({}, ['© 2025 39.ts. All rights reserved.'])
    ]);
    return el;
}