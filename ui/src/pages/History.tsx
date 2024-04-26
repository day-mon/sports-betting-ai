import { AccuribetAPI } from '~/client/api.ts';
import { createResource, createSignal, Match, Switch } from 'solid-js';
import { AnimationDiv } from '~/components/animated-div.tsx';
import { Loading } from '~/components/loading.tsx';

async function fetchHistory() {
  const instance = AccuribetAPI.getInstance();
  return await instance.getDates();
}



export function History() {

  const [dates] = createResource(fetchHistory);

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
          <div>
            <h1 class={'text-3xl text-100'}>History</h1>
          </div>
        </Match>
      </Switch>
    </AnimationDiv>
  )
}