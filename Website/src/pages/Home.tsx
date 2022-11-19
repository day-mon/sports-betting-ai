import type { Component } from "solid-js";
import { Routes, Route } from "@solidjs/router";
import Bets from "./Bets";

const Home: Component = () => {
    // just doing this for fun change if needed
    return (
    <>
        <section class="py-24 flex items-center min-h-screen justify-center">
            <div class="mx-auto max-w-[43rem]">
                <div class="text-center ">
                    <h1 class="mt-1 text-[3.0rem] font-bold leading-[4rem] tracking-tight text-white">Accuribet</h1>
                    <p class="text-xl font-medium leading-8 text-gray-400">Accuribet is a website that utilizes a neural network to predict the outcome of NBA games. We use 98 unique data points and 10 years of historic data to predict the outcome.</p>
                    <p class="mt-3 text-lg leading-relaxed text-slate-400">By: Alexander Diaz, Connor Smith & Damon Montague</p>
                </div>

                <div class="mt-6 flex items-center justify-center gap-4">
                    <a href="https://github.com/day-mon/sports-betting-ai" class="transform rounded-md bg-white px-5 py-3 font-medium text- transition-colors hover:bg-indigo-700">View Code</a>
                    {/*<a href="#" class="transform rounded-md border border-slate-200 px-5 py-3 font-medium text-white transition-colors hover:bg-slate-50"> Request a demo </a>*/}
                </div>
            </div>
        </section>
    </>
  );
};

export default Home;
