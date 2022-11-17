import type { Component } from "solid-js";
import { Routes, Route } from "@solidjs/router";
import Bets from "./Bets";

const Home: Component = () => {
  return (
    <>
      <h1 class="text-2xl text-amber-300">Hello Home Page!</h1>
      <Routes>
        <Route path="/bets" component={Bets} />
      </Routes>
    </>
  );
};

export default Home;
