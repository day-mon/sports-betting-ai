import { FiCalendar } from 'solid-icons/fi';
import {
  createEffect,
  createResource,
  createSignal,
  For,
  Match,
  onCleanup,
  Show,
  Switch as SolidSwitch,
} from 'solid-js';
import { DemoCard as GameCard } from '~/components/display-card';
import { Loading } from '~/components/loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select.tsx';
import { Switch } from '~/components/ui/switch';
import { Game, GameWithPrediction } from '~/interface';
import { formattedDateForUser, isGameActuallyLive, isPredictionCorrect } from '~/lib/utils';
import { Prediction } from '~/model/prediction.ts';
import { AccuribetAPI } from '~/client/api.ts';
import { AnimationDiv } from '~/components/animated-div.tsx';
import { SimpleTooltip } from '~/components/tooltip.tsx';

async function fetchGames() {
  const instance = AccuribetAPI.getInstance();
  return await instance.dailyGames();
}


async function fetchModels() {
  if (sessionStorage.getItem('models')) {
    return JSON.parse(sessionStorage.getItem('models') as string);
  }
  const instance = AccuribetAPI.getInstance();
  const response =  await instance.listModels();
  sessionStorage.setItem('models', JSON.stringify(response));
  return response;
}

async function fetchPredictions(model: string) {
  const instance = AccuribetAPI.getInstance();
  return await instance.predict(model);
}

export const Games = () => {
  const [games, { refetch }] = createResource(fetchGames);
  const [models] = createResource(fetchModels);
  const [selectedModel, setSelectedModel] = createSignal<string | undefined>();
  const [predictions] = createResource(selectedModel, fetchPredictions);
  const [liveUpdates, setLiveUpdates] = createSignal<boolean>(false);
  let betInterval: NodeJS.Timeout | undefined;

  const gamesPlaying = (games: Game[]): boolean => {
    return games
      .filter(game => game.status.toLowerCase() !== 'ppd')
      .some(
        game => game.status.toLowerCase().includes('q') || game.status.toLowerCase().includes('h'),
      );
  };

  const getGamesWithPredictions = (
    games: Game[],
    prediction: Prediction[],
  ): GameWithPrediction[] => {
    return games
      .map(game => {
        const gamePrediction = prediction?.find(pred => pred.game_id === game.id);
        return {
          ...game,
          prediction: gamePrediction,
        };
      })
      .sort((a, b) => {
        // Live games come first
        if (isGameActuallyLive(a) && !isGameActuallyLive(b)) return -1;
        if (!isGameActuallyLive(a) && isGameActuallyLive(b)) return 1;
        if (isGameActuallyLive(a) && isGameActuallyLive(b)) return 0;

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
  };


  createEffect(() => {
    if (liveUpdates()) {
      betInterval = setInterval(() => refetch(), 35_000);
    } else if (betInterval) {
      clearInterval(betInterval);
      betInterval = undefined;
    }
  })

  onCleanup(() => {
    if (!betInterval) return;
    clearInterval(betInterval);
  });




  return (
    <main class='pt-4 min-h-screen bg-primary'>
      <SolidSwitch fallback={
        <AnimationDiv>
          <div class='text-white text-center'>No models found</div>
        </AnimationDiv>
      }>
        <Match when={games.loading && games.state !== "refreshing"}>
          <Loading />
        </Match>
        <Match when={!games.error}>
          <AnimationDiv class='grid lg:grid-cols-4 grid-cols-1 container text-white light:text-black'>
            <div class='col-span-3'>
              <div class='mx-2'>
                <div class='flex flex-row items-center justify-center mb-10'>
                  <Show when={predictions.loading}>
                    <AnimationDiv class='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></AnimationDiv>
                  </Show>
                  <Select
                    options={models()!!}
                    placeholder='Select a model'
                    onChange={setSelectedModel}
                    value={selectedModel()}
                    itemComponent={props => (
                      <SelectItem
                        class={'text-white bg-transparent text-center border-700 hover:bg-secondary'}
                        item={props.item}
                      >
                        {props.item.rawValue}
                      </SelectItem>
                    )}
                  >
                    <SelectTrigger
                      aria-label='models'
                      class='w-[180px] bg-primary text-white border-2 border-700'
                    >
                      <SelectValue<string>>{state => state.selectedOption()}</SelectValue>
                    </SelectTrigger>
                    <SelectContent class='bg-primary' />
                  </Select>
                </div>
                <AnimationDiv
                  id='options'
                  class='text-white w-full max-w-4xl mx-auto mb-3 flex flex-row items-center justify-between'
                >
                  <div class='flex items-center text-sm'>
                    <FiCalendar class='mr-1 h-4 w-4 inline-block' />
                    <span class='ml-2'>{formattedDateForUser(games()!![0].start_time_unix)}</span>
                  </div>

                  <AnimationDiv class='flex flex-row items-center'>
                    <span class='text-sm mr-2'>Live Updates</span>
                    <SimpleTooltip trigger={
                      <Switch
                        checked={liveUpdates()}
                        onChange={setLiveUpdates}
                        disabled={!gamesPlaying(games()!!)}
                      />
                    }>
                      {gamesPlaying(games()!!)
                        ? `Live updates will be gathered every 30 seconds`
                        : `Live updates are disabled until games start`}
                    </SimpleTooltip>
                  </AnimationDiv>
                </AnimationDiv>

                <For each={getGamesWithPredictions(games()!!, predictions())}>
                  {game => (
                    <div id={game.id} class='mt-4'>
                      <GameCard game={game} />
                    </div>
                  )}
                </For>
              </div>
            </div>
          </AnimationDiv>
        </Match>
      </SolidSwitch>
    </main>
  );
};
