import type { Component } from 'solid-js';

const Error: Component = () => {
  return (
    <>
      <section class="flex flex-col items-center justify-center h-screen -mt-24">
        <div class="text-9xl text-white underline underline-offset-8">404</div>
        <div class="text-gray-400 text-2xl mt-4 text-center">These are not the droids you are looking for.</div>
        <div class="text-white text-xl mt-8 text-center">The page you are looking for is not available, or does not exist. Please check the URL and try again.</div>
      </section>
    </>
  );
};

export default Error;
