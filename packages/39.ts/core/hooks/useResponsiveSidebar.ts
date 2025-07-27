import {createSignal} from "../signal";

type SidebarMode = 'full' | 'icon' | 'bottom';

function getSidebarMode(width: number): SidebarMode {
    if (width < 500) return 'bottom';
    if (width < 900) return 'icon';
    return 'full';
}

export function useResponsiveSidebar() {
    const mode = createSignal<SidebarMode>(getSidebarMode(window.innerWidth));

    const updateMode = () => {
        mode.set(getSidebarMode(window.innerWidth));
    };

    window.addEventListener('resize', updateMode);

    return mode;
}
