import { AccuribetAPI } from "~/client/api.ts";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import { AnimationDiv } from "~/components/animated-div.tsx";
import { Loading } from "~/components/loading.tsx";
import { HistoryDate,} from "~/interface.ts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import {FiCalendar, FiAlertCircle, FiXCircle, FiCheckCircle, FiMapPin} from 'solid-icons/fi';
import { ErrorBoundary } from "solid-js";
import {getLogo} from "~/components/display-card.tsx";
import {LOCATION_DATA, TEAM_NAME_ABBRV_MAP} from "~/constants.ts";

async function fetchHistory() {
  const instance = AccuribetAPI.getInstance();
  return await instance.getDates();
}

interface IHistory {
  model: string;
  date: string;
}



async function fetchHistoryForModelOnDate(value: IHistory): Promise<any[] | undefined> {
  if (value.date === "" || value.model === "") return undefined;
  const instance = AccuribetAPI.getInstance();
  return await instance.getPredictedGames(value.date, value.model);
}


function ModelSelector(props: { dates: HistoryDate[], onSelect: (model: string) => void, selectedModel: string }) {
  return (
      <div class="flex flex-row justify-center">
        <For each={props.dates}>
          {date => (
              <div>
                <input
                    type="radio"
                    id={date.model_name}
                    name="model"
                    value={date.model_name}
                    checked={props.selectedModel === date.model_name}
                    onChange={() => props.onSelect(date.model_name)}
                    class="peer sr-only"
                />
                <Label
                    for={date.model_name}
                    class="flex cursor-pointer items-center justify-center rounded-md border-2 border-600 bg-secondary px-12 py-4 text-300 hover:bg-100 hover:text-primary peer-checked:border-primary peer-checked:bg-primary peer-checked:text-50"
                >
                  {date.model_name}
                </Label>
              </div>
          )}
        </For>
      </div>
  );
}

function DateSelector(props: { date: string, onChange: (date: string) => void, minDate?: string, maxDate: string }) {
  return (
      <div class="space-y-2 text-center">
        <Label for="date-input" class="text-300 text-center font-semibold">Select a date</Label>
        <div class="relative">
          <FiCalendar class="absolute left-3 top-1/2 -translate-y-1/2 text-600" />
          <input
              id="date-input"
              type="date"
              class="w-full rounded-md border border-600 bg-secondary px-3 py-2 text-sm text-800 placeholder-600 focus:border-primary focus:ring-1 focus:ring-primary pl-10"
              value={props.date}
              onChange={(event) => props.onChange(event.target.value)}
              max={props.maxDate}
              min={props.minDate}
          />
        </div>
      </div>
  );
}

function HistoryList(props: { games: any[] }) {
  const correctPredictions = props.games.filter(game => game.prediction_was_correct).length;

  const percentageCorrect = (correctPredictions / props.games.length) * 100;

  return (
      <Show
          when={props.games.length > 0}
          fallback={
            <Card class="bg-secondary p-6 text-center">
              <FiAlertCircle class="mx-auto mb-4 h-12 w-12 text-600" />
              <p class="text-lg font-semibold text-800">No games available for this date and model.</p>
              <p class="mt-2 text-sm text-600">Try selecting a different date or model.</p>
            </Card>
          }
      >
        <div class="space-y-4">
          <Card class="bg-secondary p-4">
            <p class="text-center text-lg font-semibold text-300">
              Predictions Correct: {percentageCorrect.toFixed(2)}%
            </p>
          </Card>
          <For each={props.games}>
            {game => {
              const homeWon = game.home_team_score > game.away_team_score;

              const abbrv = TEAM_NAME_ABBRV_MAP[game.home_team_name];
              const location = LOCATION_DATA[abbrv] || { name: "", city: "", state: "" }

              return (
                  <Card class={`overflow-hidden ${homeWon ? 'bg-blue-100' : 'bg-red-100'}`}>
                    <CardContent class="p-6">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                          <img src={getLogo(TEAM_NAME_ABBRV_MAP[game.home_team_name])} alt={game.home_team_name} class="w-12 h-12" />
                          <div>
                            <p class={`text-lg font-semibold ${homeWon ? 'text-blue-800' : 'text-800'}`}>{game.home_team_name}</p>
                            <p class="text-2xl font-bold text-primary">{game.home_team_score}</p>
                          </div>
                        </div>
                        <div class="text-center">
                          <p class="text-sm font-semibold text-800">vs</p>
                          <p class="text-sm text-600">{new Date(game.date).toLocaleDateString()}</p>
                        </div>
                        <div class="flex items-center space-x-4">
                          <div class="text-right">
                            <p class={`text-lg font-semibold ${!homeWon ? 'text-red-800' : 'text-800'}`}>{game.away_team_name}</p>
                            <p class="text-2xl font-bold text-primary">{game.away_team_score}</p>
                          </div>
                          <img src={getLogo(TEAM_NAME_ABBRV_MAP[game.away_team_name])} alt={game.away_team_name} class="w-12 h-12" />
                        </div>
                      </div>
                      <div class="mt-4 flex items-center justify-center space-x-2">
                        <p class="text-sm font-semibold text-800">Prediction: {game.prediction}</p>
                        {game.prediction_was_correct ? (
                            <FiCheckCircle class="text-green-700" />
                        ) : (
                            <FiXCircle class="text-red-700" />
                        )}
                      </div>
                      <div class="mt-2 flex items-center justify-center text-sm text-600">
                        <FiMapPin class="mr-1" />
                        <span>{location.name}, {location.city}, {location.state}</span>
                      </div>
                    </CardContent>
                  </Card>
              );
            }}
          </For>
        </div>
      </Show>
  );
}

export function History() {
  const [dates] = createResource<HistoryDate[]>(fetchHistory);
  const [currentData, setCurrentData] = createSignal<IHistory>({ model: "", date: "" });
  const [historyResource] = createResource(currentData, fetchHistoryForModelOnDate);

  const oldestDateForModel = () => {
    if (dates() && currentData().model) {
      const datesForModel = dates()?.find(date => date.model_name === currentData().model)?.dates;
      return datesForModel ? datesForModel[datesForModel.length - 1] : undefined;
    }
  };

  const handleModelChange = (modelName: string) => {
    setCurrentData({ model: modelName, date: "" });
  };

  return (
      <main class="flex-grow bg-primary pt-8 font-monserrat">
        <AnimationDiv class="container mx-auto px-4">
          <Card class="bg-secondary text-800 shadow-lg">
            <CardHeader class="text-center">
              <CardTitle class="text-3xl font-bold text-300">Prediction History</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorBoundary fallback={(err: Error) => {
                  console.log(`Name: ${err.name}, Message: ${err.message}, Stack ${err.stack}`); // `Name: Error, Message: An error occurred
                  return (
                  <div class="rounded-md bg-100 p-4 text-center text-800">
                    <FiAlertCircle class="mx-auto mb-2 h-6 w-6 text-600" />
                    <p class="font-semibold">An error occurred</p>
                    <p class="text-sm text-600">{err.message}</p>
                  </div>

              )}}>
                <Suspense fallback={<Loading />}>
                  <div class="space-y-6">
                    <div class="space-y-4">
                      <Label class="text-center block text-300 font-semibold">Select a model</Label>
                      <ModelSelector
                          dates={dates() || []}
                          onSelect={handleModelChange}
                          selectedModel={currentData().model}
                      />

                      <Show when={currentData().model}>
                        <DateSelector
                            date={currentData().date}
                            onChange={(date) => setCurrentData({ ...currentData(), date })}
                            maxDate={new Date().toISOString().split("T")[0]}
                            minDate={oldestDateForModel()}
                        />
                      </Show>
                    </div>

                    <Suspense fallback={<Loading />}>
                      <Show when={historyResource()}>
                        <HistoryList games={historyResource() || []} />
                      </Show>
                    </Suspense>
                  </div>
                </Suspense>
              </ErrorBoundary>
            </CardContent>
          </Card>
        </AnimationDiv>
      </main>
  );
}