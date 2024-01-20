import { FiCalendar } from 'solid-icons/fi';
import { For, Show, createSignal, onCleanup, onMount } from 'solid-js';
import { DemoCard as GameCard } from '~/components/display-card';
import { Loading } from '~/components/loading';
import { Switch } from '~/components/ui/switch';
import { Game, GameWithPrediction } from '~/interface';
import { formattedDateForUser, isGameActuallyLive, isPredictionCorrect } from '~/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select.tsx';
import { Prediction } from '~/model/prediction.ts';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip.tsx';

export const Games = () => {
  const [games, setGames] = createSignal<Game[]>([]);
  const [models, setModels] = createSignal<string[]>([]);
  const [selectedModel, setSelectedModel] = createSignal<string>('');
  const [liveUpdates, setLiveUpdates] = createSignal<boolean>(false);
  const [predictions, setPredictions] = createSignal<Prediction[]>([]);

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

  const fetchPredictions = async (model: string) => {
    if (!model) return
    const cacheKey = `${games().map((game) => game.id).join('-')}--${model}`;
    const cachedPredictions = localStorage.getItem(cacheKey);
    if (cachedPredictions) {
      console.log('Using cached predictions');
      setSelectedModel(model);
      setPredictions(JSON.parse(cachedPredictions) as Prediction[]);
      return;
    }


    const res = await fetch(`https://apidev.accuribet.win/api/v1/model/predict/${model}`);
    const data = await res.json() as Prediction[];

    localStorage.setItem(cacheKey, JSON.stringify(data));
    setPredictions(data);
    setSelectedModel(model);
  }

  const toggleLiveUpdates = () => {
    setLiveUpdates(!liveUpdates());
    if (liveUpdates()) {
      intervalId = setInterval(fetchGames, 30_000);
    } else {
      clearInterval(intervalId);
    }
  };

  const gamesPlaying = (games: Game[]): boolean => {
    return games
      .filter((game) => game.status.toLowerCase() !== 'ppd')
      .some((game) => game.status.toLowerCase().includes('q') || game.status.toLowerCase().includes('h'));
  }






  const getGamesWithPredictions = (games: Game[], prediction: Prediction[]): GameWithPrediction[] => {
    return games.map((game) => {
      const gamePrediction = prediction.find((pred) => pred.game_id === game.id);
      return {
        ...game,
        prediction: gamePrediction,
      };
    }).sort((a, b) => {
      // Live games come first
      if (isGameActuallyLive(a) && !isGameActuallyLive(b)) return -1;
      if (!isGameActuallyLive(a) && isGameActuallyLive(b)) return 1;

      // Then games with status 'Final'
      if (a.status === 'Final' && b.status !== 'Final') return -1;
      if (a.status !== 'Final' && b.status === 'Final') return 1;

      // Among 'Final' games, correctly predicted games come first
      if (a.status === 'Final' && b.status === 'Final') {
        if (isPredictionCorrect(a) && !isPredictionCorrect(b)) return -1;
        if (!isPredictionCorrect(a) && isPredictionCorrect(b)) return 1;
      }

      // Postponed games come last
      if (a.status === 'ppd' && b.status !== 'ppd') return 1;
      if (a.status !== 'ppd' && b.status === 'ppd') return -1;

      // If none of the above conditions are met, don't change order
      return 0;
    });
  }


  onMount(async () => {
    await fetchGames();
    await getModels();
  });

  onCleanup(() => {
    if (!intervalId) return;
    clearInterval(intervalId);
  });

  return (
    <main class="pt-4 min-h-screen bg-shark-950">
      <Show when={games().length > 0} keyed fallback={<Loading />}>
        <div class="mx-2">
          <div class="flex flex-row items-center justify-center mb-10">
         <Select
          options={models()}
          placeholder="Select a model"
          onChange={async (e) => {
            await fetchPredictions(e);
          }}
          value={selectedModel()}
          itemComponent={(props) => <SelectItem class={'text-white bg-transparent border-shark-700 hover:bg-shark-900'} item={props.item}>{props.item.rawValue}</SelectItem>} >
           <SelectTrigger aria-label="models" class="w-[180px] bg-shark-950 text-white border-2 border-shark-700">
             <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
           </SelectTrigger>
          <SelectContent class="bg-shark-950" />
        </Select>
          </div>
          <div id="options" class="text-white w-full max-w-4xl mx-auto mb-3 flex flex-row items-center justify-between">
            <div class="flex items-center text-sm">
              <FiCalendar class="mr-1 h-4 w-4 inline-block" />
              <span class="ml-2">{formattedDateForUser(games()[0].start_time_unix)}</span>
            </div>

            <div class="flex flex-row items-center">
              <span class="text-sm mr-2">Live Updates</span>
              <Tooltip>
                <TooltipTrigger>
                  <Switch checked={liveUpdates()} onChange={toggleLiveUpdates} disabled={!gamesPlaying(games())} />
                </TooltipTrigger>
                <Show when={!gamesPlaying(games())}>
                  <TooltipContent>
                    Live updates are disabled until games start
                  </TooltipContent>
                </Show>
              </Tooltip>
            </div>
          </div>

          {/*<div class={'left-0 h-full absolute opacity-50'}>*/}
          {/*  <For each={getGamesWithPredictions(games(), predictions())}>*/}
          {/*    {(game) => (*/}
          {/*      <div class="flex flex-col items-center justify-center h-24" onclick={() => document.getElementById(game.id)?.scrollIntoView({ behavior: 'smooth' })}>*/}
          {/*        <div class="text-center">*/}
          {/*          <p class="text-sm text-white transition-transform hover:scale-110 cursor-pointer">*/}
          {/*            {game.home_team.name} vs {game.away_team.name}*/}
          {/*          </p>*/}
          {/*          </div>*/}
          {/*      </div>*/}
          {/*    )}*/}
          {/*  </For>*/}
          {/*</div>*/}

          <For each={getGamesWithPredictions(games(), predictions())}>
            {(game) => (
              <div id={game.id} class="mt-4">
                <GameCard game={game} />
              </div>
            )}
          </For>
        </div>
      </Show>
    </main>
  );
};
