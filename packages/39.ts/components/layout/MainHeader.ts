import {A, Div, H1, Header, Img, Span} from "../../dom/html";
import {MainHeaderProps} from "../../@types/MainHeaderProps";
import {createDerived} from "../../core/createDerived";
import {createComponent} from "../component";


export function MainHeader(props: MainHeaderProps) {
    return createComponent<MainHeaderProps>((props) => {
        const icon = createDerived(() => {
            // @ts-ignore
            const theme = props.state.get().theme
            return theme === 'dark' ? '🌙' : '☀️';
            // @ts-ignore
        }, [props.state])
        const iconEl = Span({}, [icon.get()]);
        icon.subscribe((value) => {
            iconEl.textContent = value;
        });
        const el = Header({ className: 'layout-header' }, [
            Div(),
            H1({ className: 'title' }, ['🚀 39.ts App']),
            Div({ className: 'switch-team-container' }, [
                A({ className: 'switch-team-a',
                    onclick: (event: MouseEvent) => {
                        event.preventDefault();
                        event.stopPropagation();
                        props.onThemeChange();
                    }}, [
                    Img({ className: 'switch-team-avatar'},[]),
                    iconEl
                ])
            ])
        ]);
        return el;
    })(props)
}
