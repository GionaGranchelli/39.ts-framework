import {Sidebar} from './Sidebar';
import {Div, Main, renderVNode, VNode} from "../../dom/domSystem";
import {MainHeader} from "./MainHeader";
import {MainFooter} from "./MainFooter";
import {RouterType} from "../../navigation/navigationSystem";
import {MainHeaderProps} from "../../@types/MainHeaderProps";

/**
 * Constructs a layout with header, sidebar, and footer.
 * You provide the main content as an HTMLElement.
 */
export function Layout(content: HTMLElement, router: RouterType, mainHeaderProps: MainHeaderProps): HTMLElement {
    const headerVNode = MainHeader(mainHeaderProps);
    const sidebarVNode = Sidebar(router);
    const footerVNode = MainFooter();

    // Create a wrapper to properly handle HTMLElement content
    const layoutVNode = Div({ className: 'layout-wrapper' }, [
        headerVNode,
        Div({ className: 'layout-page' }, [
            sidebarVNode,
            Main({ className: 'layout-main' }, [])
        ]),
        footerVNode
    ]);

    const layoutElement = renderVNode(layoutVNode);

    // Append the HTMLElement content after rendering
    const mainElement = layoutElement.querySelector('.layout-main');
    if (mainElement) {
        mainElement.appendChild(content);
    }

    return layoutElement;
}
