/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";

import App from "~/App";
import { Home } from "~/pages/Home";
import { Games } from "~/pages/Games";
import { History } from "~/pages/History";
import { Notfound } from "~/pages/Notfound.tsx";

import "./index.css";
import { ThemeContextProvider } from "~/context/ThemeContext.tsx";

const root = document.getElementById("root") as HTMLElement;

render(
  () => (
    <ThemeContextProvider>
      <Router root={App}>
        <Route path="/" component={Home} />
        <Route path="/games" component={Games} />
        <Route path="/history" component={History} />
        <Route path="*" component={Notfound} />
      </Router>
    </ThemeContextProvider>
  ),
  root!
);
