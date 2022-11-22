import type { Component } from 'solid-js';
import { Routes, Route } from '@solidjs/router';
import Bets from './Bets';

const Home: Component = () => {
  // just doing this for fun change if needed
  return (
    <>
      <section class="py-24 flex flex-col items-center justify-center">
        <div class="mx-auto max-w-[43rem]">
          <div class="text-center ">
            <h1 class="mt-1 text-[3.0rem] font-bold leading-[4rem] tracking-tight text-white">
              Accuribet
            </h1>
            <p class="text-xl font-medium leading-8 text-gray-400">
              Accuribet is a website that utilizes a neural network to predict the outcome of NBA
              games. We use 98 unique data points and 10 years of historic data to predict the
              outcome.
            </p>
            <p class="mt-3 text-lg leading-relaxed text-slate-400">
              By: Alexander Diaz, Connor Smith &amp; Damon Montague
            </p>
          </div>

          <div class="mt-6 flex items-center justify-center gap-4">
            <a
              href="https://github.com/day-mon/sports-betting-ai"
              class="transform rounded-md bg-white px-5 py-3 font-medium text- transition-colors hover:bg-indigo-700">
              View Code
            </a>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 mt-4">
          <div class="bg-white rounded-lg shadow-lg p-4">
            <h2 class="text-2xl font-bold text-gray-900">Website</h2>
            <p class="text-gray-600">
              This website was built using SolidJS, which is a lightweight alterative to the React framework.
            </p>
          </div>
          <div class="bg-white rounded-lg shadow-lg p-4">
            <h2 class="text-2xl font-bold text-gray-900">API</h2>
            <p class="text-gray-600">
              The API for this application was built using <a href="https://actix.rs/" target="_blank" class="text-blue-600">Actix Web</a>, which is a web framework for the Rust language.
            </p>
          </div>
          <div class="bg-white rounded-lg shadow-lg p-4">
            <h2 class="text-2xl font-bold text-gray-900">Model</h2>
            <p class="text-gray-600">
              Our model was built using TensorFlow and Keras. With the use of past game data and 98 unique data points we can predict a games outcome with around 80-90% accuracy.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
