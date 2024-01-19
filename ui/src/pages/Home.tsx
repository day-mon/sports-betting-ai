import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Link } from '~/components/link';

function Home() {
  return (
    <>
      <main class="flex-1">
        <section class="bg-gray-200 py-20 px-6 text-center">
          <h2 class="text-4xl font-bold mb-4">Welcome to NBA Predictor</h2>
          <p class="text-xl text-gray-700 mb-8">Your go-to AI tool for NBA game predictions.</p>
          <Button class="px-8 py-3" variant="default">
            Get Started
          </Button>
        </section>
        <section class="py-20 px-6">
          <h2 class="text-4xl font-bold text-center mb-8">Latest Predictions</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Lakers vs Celtics</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Winning Team: Lakers</p>
                <p>Winning Probability: 65%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Warriors vs Nets</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Winning Team: Warriors</p>
                <p>Winning Probability: 70%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Bulls vs Heat</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Winning Team: Heat</p>
                <p>Winning Probability: 60%</p>
              </CardContent>
            </Card>
          </div>
        </section>
        <section class="bg-gray-200 py-20 px-6">
          <h2 class="text-4xl font-bold text-center mb-8">Featured Games</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Lakers vs Celtics</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Game Date: 20th January 2024</p>
                <p>Game Time: 7:00 PM</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Warriors vs Nets</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Game Date: 21st January 2024</p>
                <p>Game Time: 8:00 PM</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Bulls vs Heat</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Game Date: 22nd January 2024</p>
                <p>Game Time: 9:00 PM</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <footer class="bg-gray-900 text-white py-12 px-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold mb-2">NBA Predictor</h3>
            <nav class="space-x-4">
              <Link class="hover:underline" href="#">
                Home
              </Link>
              <Link class="hover:underline" href="#">
                Predictions
              </Link>
              <Link class="hover:underline" href="#">
                About
              </Link>
              <Link class="hover:underline" href="#">
                Contact
              </Link>
            </nav>
          </div>
          <div>
            <h3 class="text-xl font-bold mb-2">Follow Us</h3>
            <div class="flex space-x-4">
              {/* social links? */}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Home;
