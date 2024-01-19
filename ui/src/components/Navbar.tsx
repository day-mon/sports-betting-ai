import { Link } from './link';
import { Component } from 'solid-js';

export const Navbar: Component = () => {
  return (
    <header class="flex items-center justify-between px-6 py-4 bg-gray-900 text-white">
      <h1 class="text-2xl font-bold">Accuribet</h1>
      <nav class="space-x-4">
        <Link class="hover:underline" href="/">
          Home
        </Link>
        <Link class="hover:underline" href="/games">
          Games
        </Link>
      </nav>
    </header>
  );
};
