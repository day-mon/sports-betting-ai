import {Component, For, Index, onCleanup} from 'solid-js';
import { createSignal, onMount, Show, Suspense } from 'solid-js';
import { Game, Prediction } from '../models';
import { GameCard } from '../components/GameCard';
import { Loading } from '../components/Loading';
import { NoData } from '../components/NoData';
import { fetchHelper } from '../util/fetchHelper';
import LoadingSelect from "../components/LoadingSelect";
import {MODEL_OPTIONS} from "../constants";

const getBaseUrl = (useRemote?: boolean) => {
  // check if current url is localhost
  const remoteUrl = 'https://api.accuribet.win';
  if (useRemote) return remoteUrl;
  return window.location.href.includes('localhost') ? 'http://localhost:8080' : remoteUrl;
};


const Bets: Component = () => {
  const [bets, setBets] = createSignal<Game[]>([]);
  const [cardsShow, setCardsShow] = createSignal<boolean[]>([]);
  const [predictions, setPredictions] = createSignal<Prediction[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(false);
  const [disabled, setDisabled] = createSignal(false);
  const [modelSelected, setModelSelected] = createSignal('')

  const fetchPredictions = async (model_name: string) => {
    if (model_name === '') return;
    let predictions = sessionStorage.getItem(`predictions_${model_name}`);
    if (predictions) {
      let parsedPredictions = JSON.parse(predictions) as Prediction[];
      let allGamesInPredictions = bets().every((game) => parsedPredictions.some((prediction) => prediction.game_id === game.game_id));
      if (allGamesInPredictions) {
        setPredictions(parsedPredictions);
        return;
      }
    }

    setDisabled(true);
    const BASE_URL = getBaseUrl();
    const response = await fetchHelper(`${BASE_URL}/sports/predict/all?model_name=${model_name}`);
    if (!response) {
      setDisabled(false);
      return;
    }

    const data = (await response.json()) as Prediction[];
    setPredictions(data);
    sessionStorage.setItem(`predictions_${model_name}`, JSON.stringify(data));
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

    const data = await response.json() as Game[]
    setBets(data);
  };



  const findPrediction = (game: Game) => predictions().find((prediction) => prediction.game_id === game.game_id);

  onMount(async () => {
    await fetchBets();

    let predictions = sessionStorage.getItem(`predictions_${modelSelected()}`);
    if (predictions) {
      let parsedPredictions = JSON.parse(predictions) as Prediction[];
      let allGamesInPredictions = bets().every((game) => parsedPredictions.some((prediction) => prediction.game_id === game.game_id));
      if (allGamesInPredictions) {
        setLoading(false);
        setPredictions(parsedPredictions);
        return;
      }
    }

    setLoading(false);
  });


  const getWinner = (game: Game) => {
    let home_score = game.home_team_score;
    let away_score = game.away_team_score;

    let home_score_int = parseInt(home_score);
    let away_score_int = parseInt(away_score);

    return home_score_int > away_score_int ? game.home_team_name : game.away_team_name;
  };


  const betInterval = setInterval(async () => {
    await fetchBets(true);
  }, 45_000);


  const sortedBetsByTime = (games: Game[]) =>
    games.sort((a, b) => {
      if (a.game_status.includes('Q') || a.game_status.includes('Halftime')) {
        if (a.game_status.includes('Q') && b.game_status.includes('Q')) {
          return parseInt(a.game_status.split(' ')[1]) - parseInt(b.game_status.split(' ')[1]);
        } else if (a.game_status.includes('Q') && b.game_status.includes('Halftime')) {
          return -1;
        } else if (a.game_status.includes('Halftime') && b.game_status.includes('Q')) {
          return 1;
        } else {
          return 0;
        }
      }
      if (b.game_status.includes('Q') || b.game_status.includes('Halftime')) {
        if (b.game_status.includes('Q') && a.game_status.includes('Q')) {
          return parseInt(b.game_status.split(' ')[1]) - parseInt(a.game_status.split(' ')[1]);
        } else if (b.game_status.includes('Q') && a.game_status.includes('Halftime')) {
          return 1;
        } else if (b.game_status.includes('Halftime') && a.game_status.includes('Q')) {
          return -1;
        } else {
          return 0;
        }
      }



      if (a.game_status.includes('Final')) {
        let prediction = findPrediction(a);
        let won = prediction?.prediction == getWinner(a)
        return won ? -1 : 1;
      }
      if (b.game_status.includes('Final'))  {
        let prediction = findPrediction(a);
        let won = prediction?.prediction == getWinner(a)
        return won ? -1 : 1;
      }

      const aTime = a.game_status.split(' ')[0].split(':');
      const bTime = b.game_status.split(' ')[0].split(':');
      const aHour = parseInt(aTime[0]);
      const bHour = parseInt(bTime[0]);
      const aMinute = parseInt(aTime[1]);
      const bMinute = parseInt(bTime[1]);

      if (aHour === bHour) {
        if (aMinute < bMinute) return -1;
        if (aMinute > bMinute) return 1;
        return 0;
      } else {
        if (aHour < bHour) return -1;
        if (aHour > bHour) return 1;
        return 0;
      }
    });

  const changeCardShow = (index: number) => {
    let newCardsShow = cardsShow().slice();
    newCardsShow[index] = !newCardsShow[index];
    setCardsShow(newCardsShow);
  };

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
            <h5 class="text-xl text-white mb-4 font-bold text-center">Select a model to predict with</h5>
            <LoadingSelect disabled={disabled()} options={MODEL_OPTIONS} onInput={async (e) => {
              setModelSelected(e.currentTarget.value)
              await fetchPredictions(modelSelected())
            }} />
            <Show when={modelSelected() !== 'None' && modelSelected() !== ''}  keyed>
              <a href={`/about/${modelSelected()}`} class="text-white hover:underline text-center mt-4">Learn more about {modelSelected().toUpperCase()}</a>
          </Show>
          </div>
          <Index each={sortedBetsByTime(bets())}>{(game, index) => <GameCard showDropdown={cardsShow()[index]} setShowDropdown={() => changeCardShow(index)} prediction={findPrediction(game())} game={game()} />}</Index>
        </Show>
      </Suspense>
      <div class="flex flex-col">
          <p class="text-xs text-gray-500">
            <span class="font-extrabold">Disclaimer:</span> The model we wrote is not aware of injuries, suspensions or any thing of that nature. Take the predictions with a grain of salt. 😊
          </p>
          {predictions().length > 0 && predictions()[0].prediction_type === 'score' && (
              <p class="text-xs text-gray-500">
                <span class="font-extrabold">Disclaimer 2:</span> This model in particular is in its testing phase. We  dont really know the accuracy.
              </p>
          )}
        <p class="text-xs text-gray-500">
            <span class="font-extrabold">Legal Disclaimer: </span> Our sports betting AI is provided for informational and entertainment purposes only. We do not guarantee the accuracy of our predictions or any financial or other outcomes resulting from the use of our AI. We are not responsible for any decisions or actions taken based on the information provided by our AI. Betting on sports carries a high level of risk and may result in financial loss. Please gamble responsibly.
        </p>
      </div>
    </>
  );
};

export default Bets;
