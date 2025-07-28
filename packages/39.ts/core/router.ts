import { eventBus } from './eventBus';
import {createSignal} from "./signal";
import {Crumb, pushCrumb, resetCrumbs} from "../dom/breadcrumbs";


const getInitialPath = () => {
  if (typeof location !== 'undefined' && location.pathname) return location.pathname;
  return '/'; // fallback for non-browser/test
};

export const currentRoute = createSignal<string>(getInitialPath());
export const currentRouteParams = createSignal<Record<string, string>>({});

export function createRoute(path: string, component: () => HTMLElement | Promise<HTMLElement>,
                             name: string, icon: string = '🏠',
                             segments: string[] = []): Route {
    return {
        path,
        component,
        name,
        segments,
        icon
    } as Route;

}

export function useRouteParams() {
    return currentRouteParams;
}

export type Route = {
    path: string; // e.g., '/files/:id'
    component: () => HTMLElement | Promise<HTMLElement>;
    name?: string;
    segments: string[];
    icon?: string
};
function parseRoute(path: string): { parts: string[]; paramKeys: string[] } {
    const parts = path.split('/').filter(Boolean);
    const paramKeys = parts.filter(p => p.startsWith(':')).map(p => p.slice(1));
    return { parts, paramKeys };
}

function matchRoute(route: Route, actualPath: string): { matched: boolean; params: Record<string, string> } {
    const actualParts = actualPath.split('/').filter(Boolean);
    const routeParts = parseRoute(route.path).parts;

    if (routeParts.length !== actualParts.length) return { matched: false, params: {} };

    const params: Record<string, string> = {};

    for (let i = 0; i < routeParts.length; i++) {
        const rp = routeParts[i];
        const ap = actualParts[i];

        if (rp.startsWith(':')) {
            params[rp.slice(1)] = decodeURIComponent(ap);
        } else if (rp !== ap) {
            return { matched: false, params: {} };
        }
    }

    return { matched: true, params };
}

export class Router {
    private routes: Route[] = [];
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
        window.addEventListener('popstate', () => {
            this.render(location.pathname);
        });

        eventBus.on('navigate', (path: string) => {
            this.navigate(path);
        });
    }

    getRoutes(): Route[] {
        return this.routes;
    }

    addRoute(route: Route) {
        this.routes.push({
            ...route,
            segments: route.path.split('/').filter(Boolean)
        });
    }

    registerRoutes(routes: Route[]) {
        this.routes.push(...routes.map(route => ({
            path : route.path,
            name: route.name,
            component : route.component,
            segments: route.path.split('/').filter(Boolean),
            icon : route.icon
        })));
    }

    navigate(path: string) {
        history.pushState({}, '', path);
        this.render(path);
    }

    replace(path: string) {
        history.replaceState({}, '', path);
        this.render(path);
    }

    async render(path: string) {
        for (const route of this.routes) {
            const { matched, params } = matchRoute(route, path);
            if (matched) {

                this.container.innerHTML = '';
                currentRoute.set(path);
                currentRouteParams.set(params);

                const label = route.name ?? decodeURIComponent(path.split('/').pop() ?? '');
                const trail = this.inferBreadcrumbsFrom(path)
                resetCrumbs();
                for (const crumb of trail) pushCrumb(crumb.path, crumb.label);

                const view = await route.component();
                view.classList.add('fade-enter');
                this.container.appendChild(view);

                requestAnimationFrame(()=> view.classList.add('fade-enter-active'))
                setTimeout(()=> view.classList.remove('fade-enter', 'fade-enter-active'), 400);

                return;
            }
        }

        this.renderNotFound(path);
    }

    private renderNotFound(path: string) {
        const h1 = document.createElement('h1');
        h1.textContent = '404 - Page Not Found';
        const p = document.createElement('p');
        p.textContent = `No route found for ${path}`;
        const section = document.createElement('section');
        section.appendChild(h1);
        section.appendChild(p);
        this.container.innerHTML = '';
        this.container.appendChild(section);
    }

    private inferBreadcrumbsFrom(path: string): Crumb[] {
        const crumbs: Crumb[] = [{ label: 'Home', path: '/' }];
        const segments = path.split('/').filter(Boolean);

        let currentPath = '';

        for (let i = 0; i < segments.length; i++) {
            currentPath += '/' + segments[i];

            // Try to find the best matching route
            const route = this.routes.find(r => {
                const rs = r.segments;
                if (rs.length !== i + 1) return false;
                return rs.every((seg, j) => seg.startsWith(':') || seg === segments[j]);
            });

            if (route) {
                const label = route.name
                    ?? (route.segments[i].startsWith(':')
                        ? decodeURIComponent(route.segments[i].slice(1) ?? segments[i]) :
                        this.capitalize(segments[i]));

                crumbs.push({ label, path: currentPath });
            }
        }

        return crumbs;
    }

    private capitalize(s: string) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
}

// Global router instance
let globalRouter: Router | null = null;

/**
 * Create a router instance
 */
export function createRouter(container: HTMLElement): Router {
    globalRouter = new Router(container);
    return globalRouter;
}

/**
 * Get the global router instance
 */
export const router = {
    navigate: (path: string) => {
        if (!globalRouter) {
            throw new Error('Router not initialized. Call createRouter() first.');
        }
        globalRouter.navigate(path);
    },
    replace: (path: string) => {
        if (!globalRouter) {
            throw new Error('Router not initialized. Call createRouter() first.');
        }
        globalRouter.replace(path);
    },
    addRoute: (route: Route) => {
        if (!globalRouter) {
            throw new Error('Router not initialized. Call createRouter() first.');
        }
        globalRouter.addRoute(route);
    }
};

/**
 * Navigate to a path
 */
export function navigateTo(path: string): void {
    router.navigate(path);
}