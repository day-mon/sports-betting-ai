import { Link } from "~/components/link.tsx";
import { Button } from "~/components/ui/button.tsx";
import { AnimationDiv } from "~/components/animated-div.tsx";
import { FaSolidBasketball } from "solid-icons/fa";
import { TbBrain } from "solid-icons/tb";

export function Home() {
  return (
    <main class="flex min-h-screen flex-col bg-primary font-monserrat text-100 light:bg-primary light:text-black">
      <section class="to-900 flex min-h-[50vh] w-full items-center bg-gradient-to-r from-700 via-800 py-12 light:from-indigo-500 light:via-purple-500 light:to-pink-500 md:py-24 lg:py-32">
        <div class="container px-4 md:px-6">
          <div class="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <AnimationDiv
              class="flex flex-col justify-center space-y-4"
              animate={{ x: [-200, 0], opacity: [0, 1] }}
              duration={1}
              easing={"ease-in-out"}
            >
              <div class="space-y-2">
                <h1 class="text-3xl font-bold tracking-tighter text-100 light:text-white sm:text-5xl xl:text-6xl/none">
                  Predict NBA Game Outcomes with Accuribet
                </h1>
                <p class="max-w-[600px] text-200 light:text-white dark:text-gray-400 md:text-xl">
                  Accuribet uses machine learning algorithms to predict the outcomes of NBA games.
                  We use 42-48 unique data points and 10 years of historic data to predict the
                  outcome.
                </p>
              </div>
            </AnimationDiv>
            <AnimationDiv
              animate={{
                y: [-200, 0, -50, -75, -100, -120, -125, -120, -100, -75, -50, 0],
                opacity: [0, 1]
              }}
              duration={1.2}
              easing={"ease-in-out"}
            >
              <AnimationDiv animate={{ rotate: [0, 360] }} duration={1.2} easing={"linear"}>
                <FaSolidBasketball class="mx-auto h-48 w-48 transform cursor-pointer overflow-hidden rounded-xl fill-white object-cover transition-all duration-500 ease-in-out hover:rotate-45 hover:scale-125 sm:w-full lg:order-last" />
              </AnimationDiv>
            </AnimationDiv>
          </div>
        </div>
      </section>
      <section class="w-full bg-gray-100 py-12 dark:bg-gray-800 md:py-24 lg:py-32">
        <div class="container px-4 md:px-6">
          <div class="flex flex-col items-center justify-center space-y-4 text-center">
            <div class="space-y-2">
              <div class="inline-block rounded-lg bg-100 px-3 py-1 text-sm text-secondary">
                Accuracy
              </div>
              <h2 class="text-3xl font-bold tracking-tighter text-primary light:text-black sm:text-5xl">
                Unparalleled Prediction Accuracy
              </h2>
              <p class="max-w-[900px] text-secondary light:text-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Accuribet's machine learning models have been trained on over 10 years of historical
                NBA data, ensuring accuracy in our predictions.
              </p>
            </div>
          </div>
          <div class="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
            <TbBrain class="mx-auto h-48 w-48 overflow-hidden rounded-xl stroke-700 object-cover light:stroke-black sm:w-full lg:order-last" />
            <div class="flex flex-col justify-center space-y-4">
              <ul class="grid gap-6">
                <li>
                  <div class="grid gap-1">
                    <h3 class="text-xl font-bold text-primary light:text-black">60%+ Accuracy</h3>
                    <p class="text-secondary light:text-100">
                      Our machine learning models have an average accuracy of over 60% on NBA game
                      predictions.
                    </p>
                  </div>
                </li>
                <li>
                  <div class="grid gap-1">
                    <h3 class="text-xl font-bold text-primary light:text-black">
                      Real-Time Updates
                    </h3>
                    <p class="text-secondary light:text-100">
                      Get the latest predictions and updates as soon as new data becomes available.
                    </p>
                  </div>
                </li>
                <li>
                  <div class="grid gap-1">
                    <h3 class="text-xl font-bold text-primary light:text-black">Easy to Use</h3>
                    <p class="text-secondary light:text-100">
                      Our intuitive interface makes it simple to access the information you need.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section class="w-full bg-gradient-to-l from-400 via-600 to-800 py-12 light:from-indigo-500 light:via-purple-500 light:to-pink-500 md:py-24 lg:py-32">
        <div class="container px-4 md:px-6">
          <div class="grid items-center justify-center gap-4 text-center">
            <div class="space-y-3">
              <h2 class="text-3xl font-bold tracking-tighter text-100 light:text-white md:text-4xl/tight">
                Get Started with Accuribet
              </h2>
              <p class="mx-auto max-w-[600px] text-200 light:text-800 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Check out our live games page to see the latest predictions and updates.
              </p>
              <Button class="w-full md:w-auto" color="secondary" size="lg">
                <Link href={"/games"}>Live Games</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
