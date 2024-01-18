import { Index, createSignal, onMount } from 'solid-js';
import { DisplayCard as GameCard } from '~/components/display-card';
import { Game } from '~/interface';

export const Games = () => {
  const [games, setGames] = createSignal<Game[]>([]);

  const fetchGames = async () => {
    const res = await fetch('https://apidev.accuribet.win/api/v1/games/daily?with_odds=true');
    const data = await res.json();

    setGames(data as Game[]);
  };

  onMount(async () => {
    await fetchGames();
  });

  return (
    <>
      <main class="pt-4 bg-gradient-to-r from-slate-900 to-slate-700">
        <div class="grid grid-cols-2 gap-4">
          <Index each={games()}>
            {(game, i) => (
              <div class="">
                <GameCard game={game()} />
              </div>
            )}
          </Index>
        </div>
      </main>
    </>
  );
};
