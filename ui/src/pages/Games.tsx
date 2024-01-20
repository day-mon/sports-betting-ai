import { FiCalendar } from 'solid-icons/fi';
import { For, Show, createSignal, onCleanup, onMount } from 'solid-js';
import { DemoCard as GameCard } from '~/components/display-card';
import { Loading } from '~/components/loading';
import { Switch } from '~/components/ui/switch';
import { Game } from '~/interface';
import { formattedDateForUser } from '~/lib/utils';

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
      intervalId = setInterval(fetchGames, 30_000);
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
    <main class="pt-4 min-h-screen bg-shark-950">
      <Show when={games().length > 0} keyed fallback={<Loading />}>
        <div class="mx-2">
          <div id="options" class="text-white w-full max-w-4xl mx-auto mb-3 flex flex-row items-center justify-between">
            <div class="flex items-center text-sm">
              <FiCalendar class="mr-1 h-4 w-4 inline-block" />
              <span class="ml-2">{formattedDateForUser(games()[0].start_time_unix)}</span>
            </div>
            <div class="flex flex-row items-center">
              <span class="text-sm mr-2">Live Updates</span>
              <Switch checked={liveUpdates()} onChange={toggleLiveUpdates} />
            </div>
          </div>
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
