import {A, Aside, Li, Nav, Span, Ul, VNode} from "../../dom/domSystem";
import {RouterType, Route} from "../../navigation/navigationSystem";
import {useResponsiveSidebar} from "../../core/hooks/useResponsiveSidebar";
import {createSignal} from "../../core/reactiveSystem";

export function Sidebar(router: RouterType): VNode {
    // Use empty routes for now - in real usage, routes would be passed or accessed differently
    const routes: Route[] = [];
    const mode = useResponsiveSidebar();
    const drawerOpen = createSignal<boolean>(true);

    // Create route items as VNodes (no HTMLElement mixing)
    const items: VNode[] = routes.map((route: Route) => {
        return Li({}, [
            A({
                href: route.path,
                className: 'menu-item',
                onclick: (event: Event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    router.navigate(route.path);
                }
            }, [
                Span({className: 'icon'}, [route.icon || '🤷']),
                Span({className: 'label'}, [route.name ?? route.path])
            ])
        ]);
    });

    return Aside({}, [
        Nav({ className: 'layout-sidebar' }, [
            Ul({}, items)
        ])
    ]);
}