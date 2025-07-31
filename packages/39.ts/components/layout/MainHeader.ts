import {A, Div, H1, Header, Span, renderVNode} from "../../dom/domSystem";
import {MainHeaderProps} from "../../@types/MainHeaderProps";
import {createDerived} from "../../core/reactiveSystem";
import {createComponent} from "../component";


export function MainHeader(props: MainHeaderProps) {
    return createComponent<MainHeaderProps>((props) => {
        const icon = createDerived(() => {
            // @ts-ignore
            const theme = props.state.get().theme
            return theme === 'dark' ? '🌙' : '☀️';
            // @ts-ignore
        }, [props.state]);

        return Header({ className: 'layout-header' }, [
            Div(),
            H1({ className: 'title' }, ['🚀 39.ts App']),
            Div({ className: 'switch-team-container' }, [
                A({ className: 'switch-team-a',
                    onclick: (event: Event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        props.onThemeChange();
                    }}, [
                    Div({ className: 'switch-team-avatar'}),
                    Span({}, [icon.get()])
                ])
            ])
        ]);
    })(props);
}
