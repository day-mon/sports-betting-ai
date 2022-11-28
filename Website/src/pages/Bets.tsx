import { Component, onCleanup } from 'solid-js';
import { createSignal, For, onMount, Show, Suspense } from 'solid-js';
import { Game, Prediction } from '../models';
import { GameCard } from '../components/GameCard';
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
    const BASE_URL = getBaseUrl();
    const response = await fetchHelper(`${BASE_URL}/sports/predict/all?model_name=v1`);
    if (!response) {
      setDisabled(false);
      return;
    }
    const data = (await response.json()) as Prediction[];
    setPredictions(data);
    localStorage.setItem('predictions', JSON.stringify(data));
    setDisabled(false);
  };

  const fetchBets = async (refresh?: boolean) => {
    if (!refresh) setLoading(true);
    const BASE_URL = getBaseUrl();

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



  const sortedBetsByTime = (games: Game[]) => games.sort((a, b) => {
    if (a.start_time.includes('Qtr') || a.start_time.includes("Halftime")) {
        if (a.start_time.includes('Qtr') && b.start_time.includes('Qtr')) {
            return parseInt(a.start_time.split(' ')[1]) - parseInt(b.start_time.split(' ')[1]);
        } else if (a.start_time.includes('Qtr') && b.start_time.includes('Halftime')) {
            return -1;
        } else if (a.start_time.includes('Halftime') && b.start_time.includes('Qtr')) {
            return 1;
        } else {
            return 0;
        }
    }
    if (b.start_time.includes('Qtr') || b.start_time.includes("Halftime")) {
        if (b.start_time.includes('Qtr') && a.start_time.includes('Qtr')) {
            return parseInt(b.start_time.split(' ')[1]) - parseInt(a.start_time.split(' ')[1]);
        } else if (b.start_time.includes('Qtr') && a.start_time.includes('Halftime')) {
            return 1;
        } else if (b.start_time.includes('Halftime') && a.start_time.includes('Qtr')) {
            return -1;
        } else {
            return 0;
        }
    }

    if (a.start_time.includes('Final')) return 1;
    if (b.start_time.includes('Final')) return -1;

    const aTime = a.start_time.split(' ')[0].split(':');
    const bTime = b.start_time.split(' ')[0].split(':');
    const aHour = parseInt(aTime[0]);
    const bHour = parseInt(bTime[0]);
    const aMinute = parseInt(aTime[1]);
    const bMinute = parseInt(bTime[1]);

    if (aHour === bHour) {
      if (aMinute < bMinute) return -1;
      if (aMinute > bMinute) return 1;
      return 0;
    } else  {
      if (aHour < bHour) return -1;
      if (aHour > bHour) return 1;
      return 0;
    }
  });



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
          <For each={sortedBetsByTime(bets())}>{(game) => <GameCard prediction={findPrediction(game)} game={game} />}</For>
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
