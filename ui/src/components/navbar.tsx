import { Link } from "./link";
import { Component, createSignal, For } from "solid-js";
import { Settings } from "~/components/settings.tsx";
import { useLocation } from '@solidjs/router';

interface Props {
  theme: string;
  callback: (theme: string) => void;
}

interface Route {
  path: string;
  display: string;
}

export const Navbar: Component<Props> = (props: Props) => {
  // let storedPreference = localStorage.getItem('theme');
  const [theme, setTheme] = createSignal(props.theme);
  const location = useLocation();

  const changeTheme = (theme: string) => {
    setTheme(theme);
    props.callback(theme);
  };

  const routes = [
    {
      path: "/games",
      display: "Games"
    },
    {
      path: "/history",
      display: "History"
    }
  ] as Route[];

  return (
    <>
      <header class="px-4 lg:px-6 h-14 flex items-center bg-primary light:bg-primary text-100 light:text-black">
        <Link class="text-2xl font-bold" href="/">
          Accuribet
        </Link>
        <nav class="ml-auto flex gap-4 sm:gap-6 items-center">
          <For each={routes}>
            {route => (
              <Link
                href={route.path}
                class={`font-medium hover:underline underline-offset-4 ${location.pathname === route.path ? 'font-extrabold' : ''}`}
              >
                {route.display}
              </Link>
            )}
          </For>
          <Settings theme={theme()} callback={changeTheme} />
        </nav>
      </header>
    </>
  );
};
