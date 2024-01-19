import { Component } from 'solid-js';

export const Loading: Component = () => {
  return (
    <div class="flex items-center justify-center h-screen">
      <div class="flex flex-col items-center space-y-4">
        <div class="animate-spin h-20 w-20 rounded-full border-t-2 border-gray-400"></div>
      </div>
    </div>
  );
};
