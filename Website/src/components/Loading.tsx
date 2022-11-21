import { Component } from 'solid-js';

export const Loading: Component = () => {
  return (
    <div class="flex items-center justify-center h-screen">
      <div class="flex flex-col items-center space-y-4">
        <div class="w-20 h-20 border-l-4 border-t-gray-400 rounded-full animate-spin"></div>
      </div>
    </div>
  );
};
