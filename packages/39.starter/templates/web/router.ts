import { HomePage } from './pages/HomePage';
import {SettingsPage} from "./pages/SettingsPage";
import {createRoute, Router, Section} from "39.ts";

export const routerView = Section({ className: 'layout-content' });
export const router = new Router(routerView);

router.registerRoutes([
    createRoute('/', () => HomePage(), 'Home', '🏠'),
    createRoute('/settings', () => SettingsPage(), 'Settings', '⚙️')
]);

router.render(location.pathname);
