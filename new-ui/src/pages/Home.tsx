import { Index, createSignal, onMount } from "solid-js";
import { DisplayCard as Card } from "~/components/display-card";
import { Game } from "~/interface";

function Home() {
  const [games, setGames] = createSignal<Game[]>([]);

  const fetchGames = async () => {
    const res = await fetch(
      "https://apidev.accuribet.win/api/v1/games/daily?with_odds=true"
    );
    const data = await res.json();

    setGames(data as Game[]);
  };

  onMount(async () => {
    await fetchGames();
  });

  return (
    <>
      <h1 class="text-red-600 text-2xl">Home</h1>
      <Index each={games()}>{(game, i) => <div class="mb-4"><Card game={game()} /></div>}</Index>
    </>
  );
}

export default Home;
