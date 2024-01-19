import { A } from "@solidjs/router";
import { Component } from "solid-js";

interface ILink {
    href: string;
    children: string;
    class?: string;
}

export const Link: Component<ILink> = (props: ILink) => {
    return (
        <A href={props.href} class={props.class} end={true}>
            {props.children}
        </A>
    );
}