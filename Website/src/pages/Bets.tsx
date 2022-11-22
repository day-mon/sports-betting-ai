import { Component, onCleanup } from 'solid-js';
import { createSignal, For, onMount, Show, Suspense } from 'solid-js';
import { Game, Prediction } from '../models';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';
import { NoData } from '../components/NoData';
import { fetchHelper } from '../util/fetchHelper';
import { LoadingButton } from '../components/LoadingButton';

const getBaseUrl = (useRemote?: boolean) => {
  // check if current url is localhost
  const remoteUrl = 'https://api.accuribet.win';
  if (useRemote) return remoteUrl;
  return window.location.href.includes('localhost') ? 'http://localhost:8080' : remoteUrl;
};

// just doing this for fun change if needed

const Bets: Component = () => {
  const [bets, setBets] = createSignal([] as Game[]);
  const [loading, setLoading] = createSignal(true);
  const [books, setBooks] = createSignal([] as string[]);
  const [error, setError] = createSignal(false);
  const [predictions, setPredictions] = createSignal([] as Prediction[]);
  const [disabled, setDisabled] = createSignal(false);

  const fetchPredictions = async () => {
    let predictions = localStorage.getItem('predictions');
    if (predictions) {
      let parsedPredictions = JSON.parse(predictions) as Prediction[];
      let allGamesInPredictions = bets().every((game) => parsedPredictions.some((prediction) => prediction.game_id === game.game_id));
      if (allGamesInPredictions) {
        setPredictions(parsedPredictions);
        return;
      }
    }

    setDisabled(true)
    const BASE_URL = getBaseUrl(true);
    const response = await fetchHelper(`${BASE_URL}/sports/predict/all`);
    if (!response) {
      return;
    }
    const data = (await response.json()) as Prediction[];
    setPredictions(data);
    localStorage.setItem('predictions', JSON.stringify(data));
    setDisabled(false);
  };

  const fetchBets = async (refresh?: boolean) => {
    if (!refresh) setLoading(true);
    const BASE_URL = getBaseUrl(true);

    const res = await fetchHelper(`${BASE_URL}/sports/games`);

    if (!res && !refresh) {
      setError(true);
      setLoading(false);
      return;
    }

    let response = res!;

    if (response.status !== 200 && !refresh) {
      setError(true);
      setLoading(false);
      return;
    }

    setError(false);

    const data = (await response.json()) as Game[];
    const book = data.flatMap((game) => game.odds.map((odd) => odd.book_name)).filter((book, index, self) => self.indexOf(book) === index);
    setBooks(book);
    setBets(data);
  };

  const findPrediction = (game: Game) => predictions().find((prediction) => prediction.game_id === game.game_id);

  onMount(async () => {
    await fetchBets();
    setLoading(false);
  });

  const betInterval = setInterval(async () => {
    await fetchBets(true);
  }, 45_000);

  onCleanup(() => {
    clearInterval(betInterval);
  });

  return (
    <>
      <Suspense fallback={<Loading />}>
        <Show when={loading()} keyed>
          <Loading />
        </Show>
        <Show when={error() && !loading()} keyed>
          <NoData message={'There was an error fetching the data'} />
        </Show>
        <Show when={!loading() && bets().length === 0} keyed>
          <NoData message={'There are no games at the moment'} />
        </Show>
        <Show when={bets().length > 0} keyed>
          <div class="flex flex-col justify-center items-center">
            <div class="flex flex-row justify-center items-center">
              <LoadingButton disabled={disabled()} onClick={fetchPredictions}>
                Fetch our predictions
              </LoadingButton>
            </div>
          </div>
          <For each={bets()}>{(game) => <Card prediction={findPrediction(game)} game={game} />}</For>
        </Show>
      </Suspense>
      <div class="flex flex-col justify-center items-center">
        <div class="flex flex-row justify-center items-center">
          <p class="text-xs text-gray-500">
            <span class="font-bold">Disclaimer:</span> The model we wrote is not aware of injuries, suspensions or any thing of that nature. Take the predictions with a grain of salt. 😊
          </p>
        </div>
      </div>
    </>
  );
};

export default Bets;
