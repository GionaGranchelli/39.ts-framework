import { createComponent } from './component';
import { Div, Span } from '../dom/html';
import { useCrumbs } from '../dom/breadcrumbs';
import { createDerived } from '../core/createDerived';
import {Router} from "../core/router";

export function Breadcrumbs(router: Router) {
    return  createComponent(() => {
        const trail = useCrumbs();

        const container = Div({ className: 'breadcrumbs' });

        const renderTrail = () => {
            const crumbs = trail.get();

            return crumbs.map((crumb, i) => {
                const span = Span({
                    onclick: () => router.navigate(crumb.path),
                    style: {
                        cursor: 'pointer',
                        fontWeight: i === crumbs.length - 1 ? 'bold' : 'normal',
                        color: 'var(--button-bg)',
                        marginRight: '0.5rem'
                    }
                }, [crumb.label]);

                if (i < crumbs.length - 1) {
                    return Div({}, [span, Span({}, [' / '])]);
                }
                return span;
            });
        };

        createDerived(() => {
            container.innerHTML = '';
            for (const node of renderTrail()) {
                container.appendChild(node);
            }
        }, [trail]);

        return container;
    });
}
