import type { Component } from "solid-js";
import Navbar from "./components/Navbar";
import { Routes, Route } from "@solidjs/router";
import { lazy } from "solid-js";
const Bets = lazy(() => import("./pages/Bets"));
const Home = lazy(() => import("./pages/Home"));

const App: Component = () => {
  return (
    <>
    <div id="wrapper" class="bg-gray-900 h-screen" style="font-family: 'JetBrains Mono', sans-serif;">
      <Navbar />
      <Routes>
        <Route path="/bets" component={Bets} />
        <Route path="/" component={Home} />
        <Route
          path="/login"
          element={<div>This is a login page</div>}
        />
      </Routes>
    </div>
    </>
  );
};

export default App;
