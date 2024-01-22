import { FiCalendar } from "solid-icons/fi";
import { For, Show, createSignal, onCleanup, onMount } from "solid-js";
import { Motion } from "solid-motionone";
import { DemoCard as GameCard, QuickDisplay } from "~/components/display-card";
import { Loading } from "~/components/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select.tsx";
import { Switch } from "~/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip.tsx";
import { Game, GameWithPrediction } from "~/interface";
import { formattedDateForUser, isGameActuallyLive, isPredictionCorrect } from "~/lib/utils";
import { Prediction } from "~/model/prediction.ts";

export const Games = () => {
  const [games, setGames] = createSignal<Game[]>([]);
  const [models, setModels] = createSignal<string[]>([]);
  const [selectedModel, setSelectedModel] = createSignal<string>("");
  const [liveUpdates, setLiveUpdates] = createSignal<boolean>(false);
  const [predictions, setPredictions] = createSignal<Prediction[]>([]);
  const [predictionLoading, setPredictionLoading] = createSignal<boolean>(false);

  let intervalId: NodeJS.Timeout;

  const fetchGames = async () => {
    const res = await fetch("https://apidev.accuribet.win/api/v1/games/daily?with_odds=true");
    const data = await res.json();

    setGames(data as Game[]);
  };

  const getModels = async () => {
    const res = await fetch("https://apidev.accuribet.win/api/v1/model/list");
    const data = await res.json();

    setModels(data as string[]);
  };

  const fetchPredictions = async (model: string) => {
    if (!model) return;
    const cacheKey = `${games()
      .map(game => game.id)
      .join("-")}--${model}`;
    const cachedPredictions = localStorage.getItem(cacheKey);
    if (cachedPredictions) {
      console.log("Using cached predictions");
      setSelectedModel(model);
      setPredictions(JSON.parse(cachedPredictions) as Prediction[]);
      return;
    }

    setPredictionLoading(true);

    let res;
    try {
      res = await fetch(`https://apidev.accuribet.win/api/v1/model/predict/${model}`);
    } catch (e) {
      console.log(e);
    } finally {
      setPredictionLoading(false);
    }
    if (!res) return;

    const data = (await res.json()) as Prediction[];

    localStorage.setItem(cacheKey, JSON.stringify(data));
    setPredictions(data);
    setSelectedModel(model);
  };

  const toggleLiveUpdates = () => {
    setLiveUpdates(!liveUpdates());
    if (liveUpdates()) {
      intervalId = setInterval(fetchGames, 3_000);
    } else {
      clearInterval(intervalId);
    }
  };

  const gamesPlaying = (games: Game[]): boolean => {
    return games
      .filter(game => game.status.toLowerCase() !== "ppd")
      .some(
        game => game.status.toLowerCase().includes("q") || game.status.toLowerCase().includes("h")
      );
  };

  const getGamesWithPredictions = (
    games: Game[],
    prediction: Prediction[]
  ): GameWithPrediction[] => {
    return games
      .map(game => {
        const gamePrediction = prediction.find(pred => pred.game_id === game.id);
        return {
          ...game,
          prediction: gamePrediction
        };
      })
      .sort((a, b) => {
        // Live games come first
        if (isGameActuallyLive(a) && !isGameActuallyLive(b)) return -1;
        if (!isGameActuallyLive(a) && isGameActuallyLive(b)) return 1;

        // Then games with status 'Final'
        if (a.status === "Final" && b.status !== "Final") return -1;
        if (a.status !== "Final" && b.status === "Final") return 1;

        // Among 'Final' games, correctly predicted games come first
        if (a.status === "Final" && b.status === "Final") {
          if (isPredictionCorrect(a) && !isPredictionCorrect(b)) return -1;
          if (!isPredictionCorrect(a) && isPredictionCorrect(b)) return 1;
        }

        // Postponed games come last
        if (a.status === "ppd" && b.status !== "ppd") return 1;
        if (a.status !== "ppd" && b.status === "ppd") return -1;

        // If none of the above conditions are met, don't change order
        return 0;
      });
  };

  onMount(async () => {
    await fetchGames();
    await getModels();
  });

  onCleanup(() => {
    if (!intervalId) return;
    clearInterval(intervalId);
  });

  return (
    <main class="pt-4 min-h-screen bg-primary">
      <Show when={games().length > 0} keyed fallback={<Loading />}>
        <div class="grid lg:grid-cols-4 grid-cols-1 container text-white light:text-black">
          <div class="col-span-1 mx-2">
            <h3 class="text-lg font-bold underline underline-offset-2">Games</h3>
            <div class="flex flex-col items-start justify-between">
              <For each={games()}>{game => <QuickDisplay game={game} />}</For>
            </div>
          </div>
          <Motion.div
            animate={{ opacity: [0, 1] }}
            transition={{ duration: 1, easing: "ease-in-out" }}
            class="col-span-3"
          >
            <div class="mx-2">
              <div class="flex flex-row items-center justify-center mb-10">
                <Show when={predictionLoading()}>
                  {/* little loading spinner  next to the model select */}
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                </Show>
                <Select
                  options={models()}
                  placeholder="Select a model"
                  onChange={async e => {
                    await fetchPredictions(e);
                  }}
                  value={selectedModel()}
                  itemComponent={props => (
                    <SelectItem
                      class={"text-white bg-transparent text-center border-700 hover:bg-secondary"}
                      item={props.item}
                    >
                      {props.item.rawValue}
                    </SelectItem>
                  )}
                >
                  <SelectTrigger
                    aria-label="models"
                    class="w-[180px] bg-primary text-white border-2 border-700"
                  >
                    <SelectValue<string>>{state => state.selectedOption()}</SelectValue>
                  </SelectTrigger>
                  <SelectContent class="bg-primary" />
                </Select>
              </div>
              <div
                id="options"
                class="text-white w-full max-w-4xl mx-auto mb-3 flex flex-row items-center justify-between"
              >
                <div class="flex items-center text-sm">
                  <FiCalendar class="mr-1 h-4 w-4 inline-block" />
                  <span class="ml-2">{formattedDateForUser(games()[0].start_time_unix)}</span>
                </div>

                <div class="flex flex-row items-center">
                  <span class="text-sm mr-2">Live Updates</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Switch
                        checked={liveUpdates()}
                        onChange={toggleLiveUpdates}
                        disabled={!gamesPlaying(games())}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      {gamesPlaying(games())
                        ? `Live updates will be gathered every 30 seconds`
                        : `Live updates are disabled until games start`}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <For each={getGamesWithPredictions(games(), predictions())}>
                {game => (
                  <div id={game.id} class="mt-4">
                    <GameCard game={game} />
                  </div>
                )}
              </For>
            </div>
          </Motion.div>
        </div>
      </Show>
    </main>
  );
};
