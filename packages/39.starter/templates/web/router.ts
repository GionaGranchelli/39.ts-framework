import { HomePage } from './pages/HomePage';
import {SettingsPage} from "./pages/SettingsPage";
import {createRouter, Router, Section} from "39.ts";

export const routerView = Section({ className: 'layout-content' });
export const router = new Router(routerView);

router.registerRoutes([
    createRouter('/', () => HomePage(), 'Home', '🏠'),
    createRouter('/settings', () => SettingsPage(), 'Settings', '⚙️')
]);

router.render(location.pathname);
