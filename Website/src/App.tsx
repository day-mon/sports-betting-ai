import type { Component } from 'solid-js';
import Navbar from './components/Navbar';
import { Routes, Route } from '@solidjs/router';
import { lazy } from 'solid-js';
const Bets = lazy(() => import('./pages/Bets'));
const Home = lazy(() => import('./pages/Home'));

const App: Component = () => {
  return (
    <>
      <div
        id="wrapper"
        class="bg-gray-900 min-h-screen"
        style="font-family: 'JetBrains Mono', sans-serif;">
        <Navbar />
        <div id="content" class="container mx-auto px-4 pb-4">
          <Routes>
            <Route path="/" component={Home} />
            <Route path="/bets" component={Bets} />
            <Route path="/login" element={<div>This is a login page</div>} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default App;
