import { A } from "@solidjs/router";
import { Component, ComponentProps, JSX } from "solid-js";

export interface LinkProps extends ComponentProps<typeof A> {
  href: string;
  children?: JSX.Element;
  class?: string;
}

export const Link: Component<LinkProps> = (props: LinkProps) => {
  return (
    <A href={props.href} class={props.class} end={true}>
      {props.children}
    </A>
  );
};
