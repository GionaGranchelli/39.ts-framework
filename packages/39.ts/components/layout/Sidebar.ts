import {A, Aside, Button, Li, Nav, Span, Ul} from "../../dom/html";
import {Router} from "../../core/router";
import {useResponsiveSidebar} from "../../core/hooks/useResponsiveSidebar";
import {createSignal} from "../../core/signal";
import {createDerived} from "../../core/createDerived";

export function Sidebar(router: Router): HTMLElement {
    const routes = router.getRoutes();
    const mode = useResponsiveSidebar();
    const drawerOpen = createSignal<boolean>(true);

    // const actualMode = createDerived(() => {
    //     return drawerOpen.get()
    //         ? 'drawer'
    //         : mode.get();
    // }, [mode, drawerOpen]);

    // const hamburger = Button({
    //     className: 'hamburger-button',
    //     onclick: () => drawerOpen.set(!drawerOpen.get())
    // }, ['☰']);

    const items = routes.map(route => {
        const iconSpan = Span({className: 'icon'}, [route.icon||'🤷']);
        const labelSpan = Span({className: 'label'}, [route.name ?? route.path]);
        const link = A({ href: route.path, className: 'menu-item' }, [iconSpan, labelSpan]);
        link.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            router.render(route.path);
            history.pushState(null, '', route.path);
        })
        return Li({}, [link]);
    });
    const nav = Nav({ className: 'layout-sidebar' },[Ul({}, items)]);
    drawerOpen.subscribe( isOpen => {
        if (isOpen) {
            nav.classList.add('open');
        } else {
            nav.classList.remove('open');
        }
    })
    return Aside([nav]);
}