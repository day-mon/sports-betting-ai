import { Index, Show, createSignal, onMount } from 'solid-js';
import { DemoCard as GameCard } from '~/components/display-card';
import { Loading } from '~/components/loading';
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
      <main class="pt-4 min-h-screen bg-gray-900">
        <Show when={games().length > 0} keyed fallback={<Loading />}>
          <div class="mx-2">
            <Index each={games()}>
              {(game, _) => (
                <div class="mt-4">
                  <GameCard game={game()} />
                </div>
              )}
            </Index>
          </div>
        </Show>
      </main>
    </>
  );
};
