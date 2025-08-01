import { Span } from '../dom/html';
import { Props, Children } from '../dom/h';
import {Router} from "../core/router";

type LinkProps = Props & { to: string };

export function Link(router: Router, props: LinkProps, children: Children[] = []) {
    const { to, ...rest } = props;

    return Span({
        ...rest,
        onclick: (e: MouseEvent) => {
            e.preventDefault();
            router.navigate(to);
        },
        style: {
            color: 'var(--button-bg)',
            textDecoration: 'underline',
            cursor: 'pointer',
            ...(rest.style || {})
        }
    }, children);
}
