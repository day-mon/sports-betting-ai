import type { Component } from "solid-js";
import { lazy } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import NavbarLink from "./NavbarLink";
const Bets = lazy(() => import("../pages/Bets"));
const Home = lazy(() => import("../pages/Home"));

const Navbar: Component = () => {
  const location = useLocation();

  return (
    <>
      <nav class="px-2 sm:px-4 py-2.5">
        <div class="container flex flex-wrap justify-between items-center mx-auto">
          <A href="/" class="flex items-center">
            <span class="self-center text-2xl font-bold whitespace-nowrap text-white">
              Accuribet
            </span>
          </A>
          <button
            data-collapse-toggle="navbar-default"
            type="button"
            class="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-controls="navbar-default"
            aria-expanded="false"
          >
            <span class="sr-only">Open main menu</span>
            <svg
              class="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
          <div class="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul class="flex flex-col p-4 mt-4 rounded-lg border border-gray-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0">
              <NavbarLink
                href="/"
                linkText="Home"
                current={location.pathname != "/"}
              />
              <NavbarLink
                href="/bets"
                linkText="Bets"
                current={location.pathname != "/bets"}
              />
              <NavbarLink
                href="/login"
                linkText="Login"
                current={location.pathname != "/login"}
              />
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
