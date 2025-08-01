/**
 * 39.ts Navigation System - Consolidated
 *
 * All navigation functionality in one place to eliminate circular dependencies:
 * - Router functionality with route matching
 * - Breadcrumb system
 * - Navigation utilities
 * - Route parameter parsing
 */

import { createSignal, createDerived } from '../core/reactiveSystem.js';

// ============================================================================
// CORE NAVIGATION TYPES
// ============================================================================

export type Route = {
  path: string; // e.g., '/files/:id'
  component: () => HTMLElement | Promise<HTMLElement>;
  name?: string;
  segments: string[];
  icon?: string;
};

export type Crumb = {
  label: string;
  path: string;
};

export interface NavigationState {
  currentPath: string;
  params: Record<string, string>;
  breadcrumbs: Crumb[];
}

// ============================================================================
// NAVIGATION STATE
// ============================================================================

const getInitialPath = (): string => {
  if (typeof location !== 'undefined' && location.pathname) {
    return location.pathname;
  }
  return '/'; // fallback for non-browser/test environments
};

// Core navigation signals
export const currentRoute = createSignal<string>(getInitialPath());
export const currentRouteParams = createSignal<Record<string, string>>({});
const breadcrumbs = createSignal<Crumb[]>([{ label: "Home", path: "/" }]);

// Derived navigation state
export const navigationState = createDerived<NavigationState>(() => ({
  currentPath: currentRoute.get(),
  params: currentRouteParams.get(),
  breadcrumbs: breadcrumbs.get()
}));

// ============================================================================
// ROUTER SYSTEM
// ============================================================================

class RouterImpl {
  private routes: Route[] = [];
  private fallbackComponent: (() => HTMLElement) | null = null;

  addRoute(route: Route): void {
    // Parse path into segments for matching
    const segments = route.path.split('/').filter(segment => segment.length > 0);
    this.routes.push({ ...route, segments });
  }

  setFallback(component: () => HTMLElement): void {
    this.fallbackComponent = component;
  }

  private matchRoute(path: string): { route: Route; params: Record<string, string> } | null {
    const pathSegments = path.split('/').filter(segment => segment.length > 0);

    for (const route of this.routes) {
      if (route.segments.length !== pathSegments.length) {
        continue;
      }

      const params: Record<string, string> = {};
      let matches = true;

      for (let i = 0; i < route.segments.length; i++) {
        const routeSegment = route.segments[i];
        const pathSegment = pathSegments[i];

        if (routeSegment.startsWith(':')) {
          // Parameter segment
          const paramName = routeSegment.slice(1);
          params[paramName] = pathSegment;
        } else if (routeSegment !== pathSegment) {
          // Fixed segment doesn't match
          matches = false;
          break;
        }
      }

      if (matches) {
        return { route, params };
      }
    }

    return null;
  }

  async navigate(path: string): Promise<void> {
    const match = this.matchRoute(path);

    if (match) {
      currentRoute.set(path);
      currentRouteParams.set(match.params);

      // Update browser history if available
      if (typeof history !== 'undefined' && history.pushState) {
        history.pushState({}, '', path);
      }
    } else if (this.fallbackComponent) {
      // Route not found, use fallback
      currentRoute.set(path);
      currentRouteParams.set({});
    }
  }

  async getCurrentComponent(): Promise<HTMLElement> {
    const path = currentRoute.get();
    const match = this.matchRoute(path);

    if (match) {
      const result = match.route.component();
      return result instanceof Promise ? await result : result;
    } else if (this.fallbackComponent) {
      return this.fallbackComponent();
    }

    throw new Error(`No route found for path: ${path}`);
  }
}

export const Router = RouterImpl;
export const router = new RouterImpl();
export { RouterImpl };

// Export Router type for typing purposes
export type RouterType = RouterImpl;

// ============================================================================
// NAVIGATION FUNCTIONS
// ============================================================================

export function createRoute(path: string, component: () => HTMLElement | Promise<HTMLElement>, options: { name?: string; icon?: string } = {}): Route {
  return {
    path,
    component,
    name: options.name,
    icon: options.icon,
    segments: [] // Will be populated when added to router
  };
}

export async function navigateTo(path: string): Promise<void> {
  await router.navigate(path);
}

export function goBack(): void {
  if (typeof history !== 'undefined' && history.back) {
    history.back();
  }
}

export function goForward(): void {
  if (typeof history !== 'undefined' && history.forward) {
    history.forward();
  }
}

export function replacePath(path: string): void {
  currentRoute.set(path);
  if (typeof history !== 'undefined' && history.replaceState) {
    history.replaceState({}, '', path);
  }
}

// ============================================================================
// ROUTE HOOKS
// ============================================================================

export function useRouteParams(): Record<string, string> {
  return currentRouteParams.get();
}

export function useCurrentRoute(): string {
  return currentRoute.get();
}

// ============================================================================
// BREADCRUMB SYSTEM
// ============================================================================

export function useCrumbs(): Crumb[] {
  return breadcrumbs.get();
}

export function pushCrumb(crumb: Crumb): void {
  const current = breadcrumbs.get();
  breadcrumbs.set([...current, crumb]);
}

export function resetCrumbs(): void {
  breadcrumbs.set([{ label: "Home", path: "/" }]);
}

export function removeCrumb(index: number): void {
  const current = breadcrumbs.get();
  if (index >= 0 && index < current.length) {
    breadcrumbs.set(current.filter((_, i) => i !== index));
  }
}

export function navigateToCrumb(index: number): void {
  const current = breadcrumbs.get();
  if (index >= 0 && index < current.length) {
    const crumb = current[index];
    navigateTo(crumb.path);

    // Remove all breadcrumbs after this one
    breadcrumbs.set(current.slice(0, index + 1));
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

export function generatePath(template: string, params: Record<string, string>): string {
  let path = template;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value);
  });
  return path;
}

export function isCurrentRoute(path: string): boolean {
  return currentRoute.get() === path;
}

export function extractParams(template: string, path: string): Record<string, string> {
  const templateSegments = template.split('/').filter(Boolean);
  const pathSegments = path.split('/').filter(Boolean);
  const params: Record<string, string> = {};

  if (templateSegments.length !== pathSegments.length) {
    return params;
  }

  templateSegments.forEach((segment, index) => {
    if (segment.startsWith(':')) {
      const paramName = segment.slice(1);
      params[paramName] = pathSegments[index];
    }
  });

  return params;
}

// ============================================================================
// BROWSER INTEGRATION
// ============================================================================

// Set up browser history integration if available
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('popstate', () => {
    const path = window.location.pathname;
    currentRoute.set(path);
  });
}
