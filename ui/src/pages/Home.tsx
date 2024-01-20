import { Button } from '~/components/ui/button.tsx';

export const Home = () => {
  return (
    <>
      <main class="flex-1">
        <section class="bg-shark-200 py-20 px-6 text-center">
          <h2 class="text-4xl font-bold mb-4 text-shark-900">Welcome to NBA Predictor</h2>
          <p class="text-xl text-shark-700 mb-8">Your go-to AI tool for NBA game predictions.</p>
          <Button class="px-8 py-3 bg-shark-700 text-white" variant="default">
            Get Started
          </Button>
        </section>
        <section class="py-20 px-6">
          <h2 class="text-4xl font-bold text-center mb-8 text-shark-900">Latest Predictions</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card components */}
          </div>
        </section>
        <section class="bg-shark-200 py-20 px-6">
          <h2 class="text-4xl font-bold text-center mb-8 text-shark-900">Featured Games</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card components */}
          </div>
        </section>
      </main>
      <footer class="bg-shark-900 text-white py-12 px-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold mb-2">NBA Predictor</h3>
            <nav class="space-x-4">
              {/* Navigation links */}
            </nav>
          </div>
          <div>
            <h3 class="text-xl font-bold mb-2">Follow Us</h3>
            <div class="flex space-x-4">{/* social links? */}</div>
          </div>
        </div>
      </footer>
    </>
  );
};