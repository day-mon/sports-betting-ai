import { Link } from "./link";
import { For } from "solid-js";
import { Settings } from "~/components/settings.tsx";
import { useLocation } from "@solidjs/router";

interface Route {
  path: string;
  display: string;
}

export function Navbar() {
  const location = useLocation();

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
      <header class="flex h-14 items-center bg-primary px-4 text-100 light:bg-primary light:text-black lg:px-6">
        <Link class="text-2xl font-bold" href="/">
          Accuribet
        </Link>
        <nav class="ml-auto flex items-center gap-4 sm:gap-6">
          <For each={routes}>
            {route => (
              <Link
                href={route.path}
                class={`font-medium underline-offset-4 hover:underline ${location.pathname === route.path ? "font-extrabold" : ""}`}
              >
                {route.display}
              </Link>
            )}
          </For>
          <Settings />
        </nav>
      </header>
    </>
  );
}
