import { AccuribetAPI } from '~/client/api.ts';
import { createResource, createSignal, For, Match, Show, Switch } from 'solid-js';
import { AnimationDiv } from '~/components/animated-div.tsx';
import { Loading } from '~/components/loading.tsx';

async function fetchHistory() {
  const instance = AccuribetAPI.getInstance();
  return await instance.getDates();
}

async function fetchHistoryForModelOnDate(model: string, date: string) {
  const instance = AccuribetAPI.getInstance();
  return await instance.getPredictedGames(date, model);

}


export function History() {

  const [dates] = createResource(fetchHistory);
  const [selectedModel, setSelectedModel] = createSignal('')
  const [selectedDate, setSelectedDate] = createSignal('')



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
          <AnimationDiv class={'flex flex-col items-center'}>
            <span class={'text-100 text-2xl'}>
              I would like to see the history of the
              <select
                class={'mx-3 bg-primary border-b-100  border-opacity-50 text-100'}
                onChange={(e) => setSelectedModel(e.currentTarget.value)}
                disabled={dates.loading}
              >
                <For each={dates()}>
                  {date => (
                    <option value={date.model_name}>{date.model_name}</option>
                  )}
                </For>
            </select>
              model
            </span>

            <Show when={selectedModel()}>
              <input
                type={'date'}
                class={"appearance-none mb-2 block bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"}
              />
            </Show>
          </AnimationDiv>
        </Match>
      </Switch>
    </AnimationDiv>
  )
}
