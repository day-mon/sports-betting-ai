import { Component, createSignal, onMount } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { Transition } from 'solid-transition-group';
import NavbarLink from './NavbarLink';


const Navbar: Component = () => {
  const location = useLocation();
  const [dropdown, setDropdown] = createSignal(true);

  onMount(() => {
    hideDropdown();
  });

  const hideDropdown = () => {
    if (window.innerWidth < 768) {
      setDropdown(false);
    }
  };


  return (
    <>
      <nav class="px-2 sm:px-4 py-2.5">
        <div class="container flex flex-wrap justify-between items-center mx-auto">
          <A href="/" class="flex items-center">
            <span class="self-center text-2xl font-bold whitespace-nowrap text-white">Accuribet</span>
          </A>
          <button data-collapse-toggle="navbar-default" type="button"
                  class="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden focus:outline-none focus:ring-2 focus:ring-gray-200"
                  aria-controls="navbar-default" aria-expanded="false" onClick={() => setDropdown(!dropdown())}>
            <span class="sr-only">Open main menu</span>
            <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                 xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clip-rule="evenodd"></path>
            </svg>
          </button>
          <div class={`w-full md:block md:w-auto ${dropdown() ? '' : 'hidden'}`} id="navbar-default">
            <Transition name="slide-fade" mode="inout">
              {dropdown() && (
                  <ul class="flex flex-col p-4 mt-10 rounded-lg border border-gray-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0">
                    <NavbarLink href="/" onclick={hideDropdown} linkText="Home" current={location.pathname !== '/'}/>
                    <NavbarLink href="/bets" linkText="Bets" onclick={hideDropdown}
                                current={location.pathname !== '/bets'}/>
                    <NavbarLink href="/history" linkText="Our History" onclick={hideDropdown}
                                current={location.pathname !== '/history'}/>
                  </ul>
              )}
            </Transition>
          </div>
        </div>
        <div class={'flex flex-row items-center justify-center text-white space-x-4 md:space-x-8'}>
          We are working on something new..... <a target={'_blank'} class={'mx-2 font-bold underline'} href="https://beta.accuribet.win">Check it out!</a>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
