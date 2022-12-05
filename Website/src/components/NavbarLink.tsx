import type { Component } from 'solid-js';
import { A } from '@solidjs/router';

interface Props {
  href: string;
  linkText: string;
  current: boolean;
  onclick?: () => void
}

const NavbarLink: Component<Props> = (props: Props) => {
  return (
    <>
      <A href={props.href} onclick={props.onclick} class={`block py-2 pr-4 pl-3 rounded md:border-0 md:p-0 ${props.current ? 'text-gray-400' : 'underline text-white font-extrabold'}`}>
        {props.linkText}
      </A>
    </>
  );
};

export default NavbarLink;
