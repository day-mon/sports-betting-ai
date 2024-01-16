/* @refresh reload */
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import App from "~/App";
import Home from "~/pages/Home";

import "./index.css";

const root = document.getElementById("root") as HTMLElement;

render(
  () => (
    <Router root={App}>
        <Route path="/" component={Home} />
    </Router>
  ),
  root!
);
