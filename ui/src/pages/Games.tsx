import { Index, Show, createSignal, onMount, For, onCleanup } from 'solid-js';
import { DemoCard as GameCard } from '~/components/display-card';
import { Loading } from '~/components/loading';
import { Game } from '~/interface';

export const Games = () => {
  const [games, setGames] = createSignal<Game[]>([]);
  const [models, setModels] = createSignal<string[]>([]);
  const [liveUpdates, setLiveUpdates] = createSignal<boolean>(false);
  let intervalId: NodeJS.Timeout;

  const fetchGames = async () => {
    const res = await fetch('https://apidev.accuribet.win/api/v1/games/daily?with_odds=true');
    const data = await res.json();

    setGames(data as Game[]);
  };

  const getModels = async () => {
    const res = await fetch('https://apidev.accuribet.win/api/v1/model/list');
    const data = await res.json();

    setModels(data as string[]);
  };

  const toggleLiveUpdates = () => {
    setLiveUpdates(!liveUpdates());
    if (liveUpdates()) {
      intervalId = setInterval(fetchGames, 30000);
    } else {
      clearInterval(intervalId);
    }
  };

  onMount(async () => {
    await fetchGames();
    await getModels();
  });

  onCleanup(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  return (
      <main class="pt-4 min-h-screen bg-gray-900">
        <Show when={games().length > 0} keyed fallback={<Loading />}>
          <div class="mx-2">
            <For each={games()}>
              {(game) => (
                <div class="mt-4">
                  <GameCard game={game} />
                </div>
              )}
            </For>
          </div>
        </Show>
      </main>
  );
};