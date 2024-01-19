import { A } from "@solidjs/router";

interface ILink {
    href: string;
    children: string;
    class?: string;
}

export const Link = (props: ILink) => {
    return (
        <A href={props.href} class={props.class} end={true}>
            {props.children}
        </A>
    );
}