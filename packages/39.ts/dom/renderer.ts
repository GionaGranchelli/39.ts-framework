export function render(root: string | HTMLElement | (() => HTMLElement), selector: string = '#app') {
    const appRoute = document.querySelector(selector);
    if (!appRoute) {
        console.warn(`Render target not found: ${selector}`);
        return;
    }
    const view = typeof root === 'function' ? root() : root;
    appRoute.innerHTML = '';

    if (typeof view === 'string') {
        appRoute.innerHTML = view;
    } else {
        appRoute.appendChild(view);
    }
}

export function append(html: string | HTMLElement, selector: string = '#app') {
    const app = document.querySelector(selector);
    if (!app) {
        console.warn(`Append target not found: ${selector}`);
        return;
    }
    if (typeof html === 'string') {
        app.insertAdjacentHTML('beforeend', html);
    } else {
        app.appendChild(html);
    }
}