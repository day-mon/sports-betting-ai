import { Component, createSignal, Show } from 'solid-js';
import { AnimationDiv } from '~/components/animated-div.tsx';
import { useLocation } from '@solidjs/router';

export const Notfound: Component = () => {

  const [text, setText] = createSignal<string>('')
  const [showOther, setShowOther] = createSignal<boolean>(false)
  let index = 0
  const location = useLocation()

  let message = '404 Not Found'
  const interval = setInterval(() => {
    setText((t) => t + message[index++])
    if (index >= message.length) {
      clearInterval(interval)
      setShowOther(true)
    }
  }, 100)
  return (
    <AnimationDiv class={'flex flex-col justify-center bg-primary items-center h-screen'}>
      <h1 class={'text-9xl flex flex-row font-bold text-100'}>{text()}</h1>
      <Show when={showOther()}>
        <h1 class={'text-3xl text-100'}>The page at {location.pathname} does not exist.</h1>
      </Show>
    </AnimationDiv>
  );
};


