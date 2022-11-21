import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import App from "./App";

render(
    () => (
        <Router>
            <App />
        </Router>
    ),
    document.getElementById("root") as HTMLElement
);

async function handleRequest(request) {
    // get images from request return them in a raw format
    const { pathname } = new URL(request.url);
    if (pathname.startsWith("/images/")) {
        const image = await getImage(pathname);
        return new Response(image, {
            headers: {
                "Content-Type": "image/png",
            },
        });
    }
}