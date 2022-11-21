import { lazy } from "solid-js";
import { Routes, Route, A } from "@solidjs/router"
const Home = lazy(() => import("./pages/Home"));
const Bets = lazy(() => import('./pages/Bets'));

export default function App() {
  return <>
    <h1>My Site with Lots of Pages</h1>
    <nav>
      <A href="/about">About</A>
      <A href="/">Home</A>
      <A href={"/bets"}>Bets</A>
    </nav>
    <Routes>
      <Route path="/" component={Home} />
      <Route path='/bets' component={Bets} />
      <Route path="/about" element={<div>This site was made with Solid</div>} />
    </Routes>
  </>
}