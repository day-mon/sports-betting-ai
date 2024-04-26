import { Link } from "~/components/link.tsx";

export const Home = () => {
  return (
    <>
      <div class="flex flex-col min-h-[100dvh] bg-primary light:bg-primary text-100 light:text-black">
        <main class="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <section class="w-full py-12 md:py-24 lg:py-32">
            <div class="container px-4 md:px-6">
              <div class="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                <div class="flex flex-col justify-center space-y-4">
                  <div class="space-y-2">
                    <h1 class="text-3xl text-100 light:text-white font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                      Predict NBA Game Outcomes with Accuribet
                    </h1>
                    <p class="max-w-[600px] text-200 light:text-white md:text-xl dark:text-gray-400">
                      Accuribet uses machine learning algorithms to predict the outcomes of NBA
                      games. We use 42-48 unique data points and 10 years of historic data to
                      predict the outcome.
                    </p>
                  </div>
                </div>
                <img
                  alt="Hero"
                  class="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                  height="550"
                  src="https://placeholder.pics/svg/300/F97EFF-8589FF/Placedholder"
                  width="550"
                />
              </div>
            </div>
          </section>
          <section class="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
            <div class="container px-4 md:px-6">
              <div class="flex flex-col items-center justify-center space-y-4 text-center">
                <div class="space-y-2">
                  <div class="inline-block rounded-lg bg-100 px-3 py-1 text-sm text-secondary">
                    Accuracy
                  </div>
                  <h2 class="text-3xl font-bold tracking-tighter sm:text-5xl text-primary light:text-black">
                    Unparalleled Prediction Accuracy
                  </h2>
                  <p class="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-secondary light:text-100">
                    Accuribet's machine learning models have been trained on years of historical NBA
                    data, giving you the most accurate predictions in the industry. Our users report
                    an average accuracy of over 80% on their bets.
                  </p>
                </div>
              </div>
              <div class="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
                <img
                  alt="Accuracy Chart"
                  class="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                  height="310"
                  src="https://placeholder.pics/svg/300x200/F97EFF-8589FF/Placedholder"
                  width="550"
                />
                <div class="flex flex-col justify-center space-y-4">
                  <ul class="grid gap-6">
                    <li>
                      <div class="grid gap-1">
                        <h3 class="text-xl font-bold text-primary light:text-black">
                          80%+ Accuracy
                        </h3>
                        <p class="text-secondary light:text-100">
                          Our machine learning models have an average accuracy of over 80% on NBA
                          game predictions.
                        </p>
                      </div>
                    </li>
                    <li>
                      <div class="grid gap-1">
                        <h3 class="text-xl font-bold text-primary light:text-black">
                          Real-Time Updates
                        </h3>
                        <p class="text-secondary light:text-100">
                          Get the latest predictions and updates as soon as new data becomes
                          available.
                        </p>
                      </div>
                    </li>
                    <li>
                      <div class="grid gap-1">
                        <h3 class="text-xl font-bold text-primary light:text-black">Easy to Use</h3>
                        <p class="text-secondary light:text-100">
                          Our intuitive interface makes it simple to access the information you need
                          to make informed bets.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          <section class="w-full py-12 md:py-24 lg:py-32 bg-500">
            <div class="container px-4 md:px-6">
              <div class="grid items-center justify-center gap-4 text-center">
                <div class="space-y-3">
                  <h2 class="text-3xl font-bold tracking-tighter md:text-4xl/tight text-primary">
                    Get Started with Accuribet
                  </h2>
                  <p class="mx-auto max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-secondary">
                    Sign up today to start using our powerful NBA prediction platform and start
                    winning big.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
        <footer class="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            © 2024 Accuribet. All rights reserved.
          </p>
          <nav class="sm:ml-auto flex gap-4 sm:gap-6">
            <Link class="text-xs hover:underline underline-offset-4" href="#">
              Terms of Service
            </Link>
            <Link class="text-xs hover:underline underline-offset-4" href="#">
              Privacy
            </Link>
          </nav>
        </footer>
      </div>
    </>
  );
};
