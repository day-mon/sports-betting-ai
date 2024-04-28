import { Component, createSignal } from 'solid-js';
import { AnimationDiv } from '~/components/animated-div.tsx';
import { useLocation } from '@solidjs/router';

export const Notfound: Component = () => {

  const [text, setText] = createSignal<string>('')
  let index = 0
  const location = useLocation()

  let message = '404 Not Found'
  const interval = setInterval(() => {
    setText((t) => t + message[index++])
    if (index >= message.length) {
      clearInterval(interval)
    }
  }, 100)
  return (
    <AnimationDiv class={'flex flex-col justify-center bg-primary items-center h-screen animate-pulse'}>
      <h1 class={'text-9xl flex flex-row font-bold text-100 animate-bounce'}>{text()}</h1>
      <AnimationDiv class={'mt-5'}>
        <h1 class={'text-3xl text-100 animate-fade-in-down'}>I think... you're lost
          <strong class={'mx-2 text-red-500'}>{location.pathname}</strong>
          does not exist.
        </h1>
      </AnimationDiv>
    </AnimationDiv>
  );
};