import { Component } from "solid-js";

export const Loading: Component = () => {
  return (
    <div class="flex h-screen items-center justify-center">
      <div class="flex flex-col items-center space-y-4">
        <div class="h-20 w-20 animate-spin rounded-full border-t-2 border-gray-400"></div>
      </div>
    </div>
  );
};
