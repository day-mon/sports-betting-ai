import { AiFillGithub } from "solid-icons/ai";

export function Footer() {
  return (
    <>
      <footer class="flex w-full shrink-0 flex-col items-center gap-2 bg-primary px-4 py-6 font-monserrat text-100 light:bg-primary light:text-black sm:flex-row md:px-6">
        <p class="order-last mt-2 text-xs text-100 light:text-black sm:order-first sm:mt-auto">
          &copy;&nbsp;{new Date().getFullYear()}&nbsp;Accuribet. All rights reserved.
        </p>
        <nav class="flex flex-col items-center gap-4 sm:ml-auto sm:items-end sm:gap-6">
          <a
            href="https://github.com/day-mon/sports-betting-ai"
            class="flex flex-row text-xs underline-offset-4 hover:underline"
            target="_blank"
          >
            <AiFillGithub class="mx-2 h-4 w-4" />
            Github
          </a>
          <p class="text-xs">
            Some assets from{" "}
            <a href="https://solid-icons.vercel.app/" class="hover:underline" target="_blank">
              Solid Icons
            </a>{" "}
            and{" "}
            <a href="https://www.solid-ui.com/" class="hover:underline" target="_blank">
              Solid-UI
            </a>
            .
          </p>
        </nav>
      </footer>
    </>
  );
}
