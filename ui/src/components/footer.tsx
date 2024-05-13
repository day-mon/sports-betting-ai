import { AiFillGithub } from "solid-icons/ai";

export function Footer() {
  return (
    <>
      <footer class="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 bg-primary light:bg-primary text-100 light:text-black font-monserrat">
        <p class="mt-2 sm:mt-auto text-xs text-100 light:text-black order-last sm:order-first">
          &copy;&nbsp;{new Date().getFullYear()}&nbsp;Accuribet. All rights reserved.
        </p>
        <nav class="sm:ml-auto flex flex-col items-center sm:items-end gap-4 sm:gap-6">
          <a
            href="https://github.com/day-mon/sports-betting-ai"
            class="text-xs flex flex-row hover:underline underline-offset-4"
            target="_blank"
          >
            <AiFillGithub class="w-4 h-4 mx-2" />
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
