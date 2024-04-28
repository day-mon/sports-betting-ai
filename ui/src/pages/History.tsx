import { AccuribetAPI } from "~/client/api.ts";
import { createResource, createSignal, For, Match, Show, Switch } from "solid-js";
import { AnimationDiv } from "~/components/animated-div.tsx";
import { Loading } from "~/components/loading.tsx";
import { HistoryDate, HistoryGame } from "~/interface.ts";

async function fetchHistory() {
  const instance = AccuribetAPI.getInstance();
  return await instance.getDates();
}

async function fetchHistoryForModelOnDate(model: string, date: string) {
  const instance = AccuribetAPI.getInstance();
  return await instance.getPredictedGames(date, model);
}

export function History() {
  const [dates] = createResource<HistoryDate[]>(fetchHistory);
  const [selectedModel, setSelectedModel] = createSignal("");
  const [selectedDate, setSelectedDate] = createSignal("");
  const [history, setHistory] = createSignal<HistoryGame[]>([]);
  const [error, setError] = createSignal("");

  const handleDateChange = (e: Event) => {
    let target = e.target as HTMLInputElement;
    setSelectedDate(target.value);
    setHistory([]);

    updateHistory().then(() => {
      setError("");
    });
  };

  const updateHistory = async () => {
    const data = await fetchHistoryForModelOnDate(selectedModel(), selectedDate());

    console.log("oldest date", oldestDateForModel());

    if (data) {
      setHistory(data as HistoryGame[]);
      console.log(history());
    } else {
      setHistory([]);
      setError("No data found for this model on this date");
    }
  };

  const oldestDateForModel = () => {
    if (!dates.error && dates()) {
      const datesForModel = dates()?.find(date => date.model_name === selectedModel());
      if (datesForModel) {
        return datesForModel.dates[datesForModel.dates.length - 1];
      }
    }
  };

  return (
    <AnimationDiv>
      <Switch>
        <Match when={dates.loading}>
          <Loading />
        </Match>
        <Match when={dates.error}>
          <h1>Error fetching dates</h1>
        </Match>
        <Match when={dates()}>
          <AnimationDiv class={"flex flex-col items-center"}>
            <span class={"text-100 text-2xl"}>
              I would like to see the history of the
              <select
                class={"mx-3 bg-primary border-b-100  border-opacity-50 text-100"}
                onChange={e => setSelectedModel(e.currentTarget.value)}
                disabled={dates.loading}
              >
                <option disabled selected>
                  ...
                </option>
                <For each={dates()}>
                  {date => <option value={date.model_name}>{date.model_name}</option>}
                </For>
              </select>
              model
            </span>

            <Show when={error()}>
              <span class={"text-red-500 bg-gray-200 rounded-full font-bold px-3 py-1 mt-2"}>
                Error! {error()}
              </span>
            </Show>

            <Show when={selectedModel()}>
              <input
                type={"date"}
                class={
                  "appearance-none mb-2 block bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                }
                onChange={handleDateChange}
                max={new Date().toISOString().split("T")[0]}
                min={oldestDateForModel()}
              />
            </Show>

            <Show when={history()}>
              <For each={history()}>
                {game => (
                  <div
                    id={game.game_id}
                    class="flex flex-col mt-2 text-100 font-bold bg-secondary rounded-lg p-4"
                  >
                    <span>
                      {game.home_team_name} vs {game.away_team_name}
                    </span>
                    <span>
                      {game.home_team_score} - {game.away_team_score}
                    </span>
                    <span>{game.date}</span>
                  </div>
                )}
              </For>
            </Show>
          </AnimationDiv>
        </Match>
      </Switch>
    </AnimationDiv>
  );
}
