import { Component, createSignal } from "solid-js";
import { AnimationDiv } from "~/components/animated-div.tsx";
import { useLocation } from "@solidjs/router";

export const Notfound: Component = () => {
  const [text, setText] = createSignal<string>("");
  let index = 0;
  const location = useLocation();

  let message = "404 Not Found";
  const interval = setInterval(() => {
    setText(t => t + message[index++]);
    if (index >= message.length) {
      clearInterval(interval);
    }
  }, 100);
  return (
    <AnimationDiv
      class={"flex h-screen animate-pulse flex-col items-center justify-center bg-primary"}
    >
      <h1 class={"flex animate-bounce flex-row text-9xl font-bold text-100"}>{text()}</h1>
      <AnimationDiv class={"mt-5"}>
        <h1 class={"animate-fade-in-down text-3xl text-100"}>
          I think... you're lost
          <strong class={"mx-2 text-red-500"}>{location.pathname}</strong>
          does not exist.
        </h1>
      </AnimationDiv>
    </AnimationDiv>
  );
};
