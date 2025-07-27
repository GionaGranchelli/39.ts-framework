
import {Sidebar} from './Sidebar';
import {Div, Main} from "../../dom/html";
import {MainHeader} from "./MainHeader";
import {MainFooter} from "./MainFooter";
import {Router} from "../../core/router";
import {MainHeaderProps} from "../../@types/MainHeaderProps";

/**
 * Constructs a layout with header, sidebar, and footer.
 * You provide the main content as an HTMLElement.
 */
export function Layout(content: HTMLElement, router: Router, mainHeaderProps: MainHeaderProps ): HTMLElement {
    return Div({ className: 'layout-wrapper' }, [
        MainHeader(mainHeaderProps),
        Div({ className: 'layout-page' }, [
            Sidebar(router),
            Main({ className: 'layout-main' }, [content])
        ]),
        MainFooter()
    ]);
}
