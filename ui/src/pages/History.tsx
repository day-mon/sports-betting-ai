import { AccuribetAPI } from "~/client/api.ts";
import { createResource, createSignal, For, Match, Show, Switch } from "solid-js";
import { AnimationDiv } from "~/components/animated-div.tsx";
import { Loading } from "~/components/loading.tsx";
import { HistoryDate, HistoryGame } from "~/interface.ts";

async function fetchHistory() {
  const instance = AccuribetAPI.getInstance();
  return await instance.getDates();
}

interface IHistory {
  model: string;
  date: string;
}

async function fetchHistoryForModelOnDate(value: IHistory): Promise<HistoryGame[] | undefined> {
  if (value.date === "" || value.model === "") return undefined;
  const instance = AccuribetAPI.getInstance();
  return await instance.getPredictedGames(value.date, value.model);
}

export function History() {
  const [dates] = createResource<HistoryDate[]>(fetchHistory);
  const [currentData, setCurrentData] = createSignal<IHistory>({ model: "", date: "" } as IHistory);
  const [historyResource] = createResource(currentData, fetchHistoryForModelOnDate);

  const oldestDateForModel = () => {
    if (!dates.error && dates()) {
      const datesForModel = dates()?.find(date => date.model_name === currentData().model);
      if (datesForModel) {
        return datesForModel.dates[datesForModel.dates.length - 1];
      }
    }
  };

  return (
    <main class="pt-4 min-h-screen bg-primary">
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
                  class={"mx-3 bg-primary border-b appearance-none border-white text-100"}
                  onChange={e => setCurrentData({ ...currentData(), model: e.target.value })}
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

              <Show when={historyResource.error}>
                <span class={"text-red-500 bg-gray-200 rounded-full font-bold px-3 py-1 mt-2"}>
                  Error! {historyResource.error.message}
                </span>
              </Show>

              <Show when={currentData().model}>
                <input
                  type={"date"}
                  class={
                    "appearance-none mb-2 block bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  }
                  onChange={event => {
                    setCurrentData({ ...currentData(), date: event.target.value });
                  }}
                  max={new Date().toISOString().split("T")[0]}
                  min={oldestDateForModel()}
                />
              </Show>

              <Show when={historyResource()}>
                <AnimationDiv class={"flex flex-col justify-between items-center h-fit w-1/2"}>
                  <For each={historyResource()}>
                    {game => (
                      <AnimationDiv
                        id={game.game_id}
                        class="flex flex-col items-center mx-100 mt-2 text-100 w-full font-bold bg-secondary rounded-lg p-4"
                      >
                        <span>
                          {game.home_team_name} vs {game.away_team_name}
                        </span>
                        <span>
                          {game.home_team_score} - {game.away_team_score}
                        </span>
                        <span>{game.date}</span>
                      </AnimationDiv>
                    )}
                  </For>
                </AnimationDiv>
              </Show>
            </AnimationDiv>
          </Match>
        </Switch>
      </AnimationDiv>
    </main>
  );
}
