import { createSignal } from "solid-js";
import solidLogo from "./assets/solid.svg";
import gsw from "./assets/gsw.svg";
import farmLogo from "./assets/logo.png";

function App() {
  const [count, setCount] = createSignal(0);

  return (
    <>
<div class="dark">
  <div
    class="border text-card-foreground w-full max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-md overflow-hidden"
    data-v0-t="card"
  >
    <div class="flex-col space-y-1.5 flex items-center justify-between p-6">
      <div class="flex items-center">
        <img
          alt="Team 1 Logo"
          class="mr-2 rounded-full"
          height="50"
          src="/placeholder.svg"
          width="50"
          style="aspect-ratio: 50 / 50; object-fit: cover;"
        />
        <div>
          <h3 class="tracking-tight text-lg font-bold text-white">Los Angeles Lakers</h3>
          <p class="text-sm text-gray-400">30-15</p>
        </div>
      </div>
      <div class="flex items-center">
        <div>
          <h3 class="tracking-tight text-lg font-bold text-white">Golden State Warriors</h3>
          <p class="text-sm text-gray-400">35-10</p>
        </div>
        <img
          alt="Team 2 Logo"
          class="ml-2 rounded-full"
          height="50"
          src={gsw}
          width="50"
          style="aspect-ratio: 50 / 50; object-fit: cover;"
        />
        <span class="ml-2 inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          Projected Winner
        </span>
      </div>
    </div>
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="text-sm text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="mr-1 h-4 w-4 inline-block"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
            <line x1="16" x2="16" y1="2" y2="6"></line>
            <line x1="8" x2="8" y1="2" y2="6"></line>
            <line x1="3" x2="21" y1="10" y2="10"></line>
          </svg>
          January 15, 2024
        </div>
        <div class="text-sm text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="mr-1 h-4 w-4 inline-block"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          7:00 PM
        </div>
      </div>
      <div class="mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="mr-1 h-4 w-4 inline-block text-gray-400"
        >
          <line x1="2" x2="5" y1="12" y2="12"></line>
          <line x1="19" x2="22" y1="12" y2="12"></line>
          <line x1="12" x2="12" y1="2" y2="5"></line>
          <line x1="12" x2="12" y1="19" y2="22"></line>
          <circle cx="12" cy="12" r="7"></circle>
        </svg>
        <span class="text-sm text-gray-400">Staples Center, Los Angeles, CA</span>
      </div>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="border rounded-lg p-2">
          <h3 class="text-sm font-bold mb-1 text-white">Key Player - Lakers</h3>
          <p class="text-xs text-gray-400">LeBron James</p>
          <p class="text-xs text-gray-400">Points: 28</p>
          <p class="text-xs text-gray-400">Rebounds: 8</p>
          <p class="text-xs text-gray-400">Assists: 10</p>
        </div>
        <div class="border rounded-lg p-2">
          <h3 class="text-sm font-bold mb-1 text-white">Key Player - Warriors</h3>
          <p class="text-xs text-gray-400">Stephen Curry</p>
          <p class="text-xs text-gray-400">Points: 32</p>
          <p class="text-xs text-gray-400">Rebounds: 5</p>
          <p class="text-xs text-gray-400">Assists: 9</p>
        </div>
      </div>
      <div class="mb-4">
        <h3 class="text-sm font-bold mb-1 text-white">Current Score</h3>
        <div class="text-center bg-gray-700 p-4 rounded-lg">
          <div class="flex items-center justify-center mb-2">
            <span class="text-red-500 animate-pulse mr-2">•</span>
            <span class="text-white font-bold">Live</span>
          </div>
          <p class="text-2xl text-white font-bold mb-2">Lakers: 95 - Warriors: 98</p>
          <p class="text-sm text-gray-400">4th Quarter, 2:30 remaining</p>
        </div>
      </div>
      <div class="mb-4">
        <h3 class="text-sm font-bold mb-1 text-white">Score Breakdown</h3>
        <div dir="ltr" data-orientation="horizontal" class="mb-4">
          <div
            role="tablist"
            aria-orientation="horizontal"
            class="h-9 items-center rounded-lg bg-muted p-1 text-muted-foreground flex justify-between border-b border-gray-700"
            tabindex="0"
            data-orientation="horizontal"
            style="outline: none;"
          >
            <button
              type="button"
              role="tab"
              aria-selected="true"
              aria-controls="radix-:r3v:-content-1st Quarter"
              data-state="active"
              id="radix-:r3v:-trigger-1st Quarter"
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow w-1/4 py-2 text-center font-bold text-white"
              tabindex="-1"
              data-orientation="horizontal"
              data-radix-collection-item=""
            >
              1st Quarter
            </button>
            <button
              type="button"
              role="tab"
              aria-selected="false"
              aria-controls="radix-:r3v:-content-2nd Quarter"
              data-state="inactive"
              id="radix-:r3v:-trigger-2nd Quarter"
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow w-1/4 py-2 text-center font-bold text-white"
              tabindex="-1"
              data-orientation="horizontal"
              data-radix-collection-item=""
            >
              2nd Quarter
            </button>
            <button
              type="button"
              role="tab"
              aria-selected="false"
              aria-controls="radix-:r3v:-content-3rd Quarter"
              data-state="inactive"
              id="radix-:r3v:-trigger-3rd Quarter"
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow w-1/4 py-2 text-center font-bold text-white"
              tabindex="-1"
              data-orientation="horizontal"
              data-radix-collection-item=""
            >
              3rd Quarter
            </button>
            <button
              type="button"
              role="tab"
              aria-selected="false"
              aria-controls="radix-:r3v:-content-4th Quarter"
              data-state="inactive"
              id="radix-:r3v:-trigger-4th Quarter"
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow w-1/4 py-2 text-center font-bold text-white"
              tabindex="-1"
              data-orientation="horizontal"
              data-radix-collection-item=""
            >
              4th Quarter
            </button>
          </div>
          <div
            data-state="active"
            data-orientation="horizontal"
            role="tabpanel"
            aria-labelledby="radix-:r3v:-trigger-1st Quarter"
            id="radix-:r3v:-content-1st Quarter"
            tabindex="0"
            class="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            style=""
          >
            <div class="p-4 border border-gray-700 rounded-lg text-center text-white bg-white dark:bg-gray-800">
              <p>Lakers: 25</p>
              <p>Warriors: 22</p>
            </div>
          </div>
          <div
            data-state="inactive"
            data-orientation="horizontal"
            role="tabpanel"
            aria-labelledby="radix-:r3v:-trigger-2nd Quarter"
            hidden=""
            id="radix-:r3v:-content-2nd Quarter"
            tabindex="0"
            class="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          ></div>
          <div
            data-state="inactive"
            data-orientation="horizontal"
            role="tabpanel"
            aria-labelledby="radix-:r3v:-trigger-3rd Quarter"
            hidden=""
            id="radix-:r3v:-content-3rd Quarter"
            tabindex="0"
            class="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          ></div>
          <div
            data-state="inactive"
            data-orientation="horizontal"
            role="tabpanel"
            aria-labelledby="radix-:r3v:-trigger-4th Quarter"
            hidden=""
            id="radix-:r3v:-content-4th Quarter"
            tabindex="0"
            class="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          ></div>
        </div>
      </div>
      <div class="mb-4">
        <h3 class="text-sm font-bold mb-1 text-white">Timeouts Remaining</h3>
        <div class="flex items-center justify-between text-white">
          <div>
            <h4 class="text-xs font-bold mb-1">Lakers</h4>
            <p>2</p>
          </div>
          <div>
            <h4 class="text-xs font-bold mb-1">Warriors</h4>
            <p>1</p>
          </div>
        </div>
      </div>
      <div class="text-center mb-4 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="mr-1 h-4 w-4 inline-block text-yellow-500"
        >
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
        <a class="text-yellow-500 underline" href="#">
          View Injury Report
        </a>
      </div>
      <div class="text-center">
        <button class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"></button>
      </div>
    </div>
  </div>
</div>
    </>
  );
}

export default App;
