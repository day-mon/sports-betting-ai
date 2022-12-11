import {Component, For, Index, onCleanup} from 'solid-js';
import { createSignal, onMount, Show, Suspense } from 'solid-js';
import { Game, Prediction } from '../models';
import { GameCard } from '../components/GameCard';
import { Loading } from '../components/Loading';
import { NoData } from '../components/NoData';
import { fetchHelper } from '../util/fetchHelper';
import { LoadingButton } from '../components/LoadingButton';
import { getWinner } from "./History";

const getBaseUrl = (useRemote?: boolean) => {
  // check if current url is localhost
  const remoteUrl = 'https://api.accuribet.win';
  if (useRemote) return remoteUrl;
  return window.location.href.includes('localhost') ? 'http://localhost:8080' : remoteUrl;
};

const options =
    [
        {key: 'v1', value: 'Money Line (V1)', description: 'The V1 Model is a simple model that that predicts winners of the games with no consideration of players or injuries. We use overall team statistics to predict the winner of the game up until this point in the season. This model has days where it is OVERLY confident in its predictions, which may be disingenuous.'},
        {key: 'v2', value: 'Money Line (V2)', description: 'The V2 Model model differs from the V1 model in that it has a confidence value associated with each prediction. We also use 86 features instead of 98.'},
        {key: 'ou', value: 'Over Under (Beta)', description: 'The Over Under model predicts the total score of the game. This model uses the same overall team statistics as the V1 & V2 model. '},
  ];


const Bets: Component = () => {
  const [bets, setBets] = createSignal([] as Game[]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(false);
  const [predictions, setPredictions] = createSignal([] as Prediction[]);
  const [disabled, setDisabled] = createSignal(false);
  const [cardsShow, setCardsShow] = createSignal([] as boolean[]);
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

    const data = (await response.json()) as Game[];
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


  // make a method that checks if all the games are Final and if so et the interval to 3 minutes else 45 seconds
    const checkIfAllGamesAreFinal = () => {
        let allGamesAreFinal = bets().every((game) => game.start_time === 'Final');
        if (allGamesAreFinal) {
          console.log("sd")
            return 180000;
        }
        return 45000;
    }

  const betInterval = setInterval(async () => {
    console.log(`Fetching ${new Date()}`)
    await fetchBets(true);
  }, checkIfAllGamesAreFinal());

  const sortedBetsByTime = (games: Game[]) =>
    games.sort((a, b) => {
      if (a.start_time.includes('Qtr') || a.start_time.includes('Halftime')) {
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
      if (b.start_time.includes('Qtr') || b.start_time.includes('Halftime')) {
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

      if (a.start_time.includes('Final')) {
        let prediction = findPrediction(a);
        let won = prediction?.prediction == getWinner(a)
        return won ? -1 : 1;
      }
      if (b.start_time.includes('Final'))  {
        let prediction = findPrediction(a);
        let won = prediction?.prediction == getWinner(a)
        return won ? -1 : 1;
      }

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
            <select class={"rounded-lg bg-transparent text-center p-2  border border-white text-white"} onInput={async (e) => {
              setModelSelected(e.currentTarget.value)
              await fetchPredictions(modelSelected())
            }} >
              <option value="" disabled selected>None</option>
              <For each={options}>{option =>
                  <option class={'text-black bg-transparent text-center'} value={option.key}>{option.value}</option>
              }</For>
            </select>
            <Show when={modelSelected() !== 'None' && modelSelected() !== ''}  keyed>
            <div class={'text-white text-center mt-3'}>
              <span class={"font-bold"}>About this model</span>: {options.find((option) => option.key === modelSelected())?.description}
            </div>
          </Show>
          </div>
          <Index each={sortedBetsByTime(bets())}>{(game, index) => <GameCard showDropdown={cardsShow()[index]} setShowDropdown={() => changeCardShow(index)} prediction={findPrediction(game())} game={game()} />}</Index>
        </Show>
      </Suspense>
      <div class="flex flex-col">
          <p class="text-xs text-gray-500">
            <span class="font-bold">Disclaimer:</span> The model we wrote is not aware of injuries, suspensions or any thing of that nature. Take the predictions with a grain of salt. 😊
          </p>
          {predictions().length > 0 && predictions()[0].prediction_type === 'score' && (
              <p class="text-xs text-gray-500">
                <span class="font-bold">Disclaimer 2:</span> This model in particular is in its testing phase. We  dont really know the accuracy.
              </p>
          )}
        <p class="text-xs text-gray-500">
            <span class="font-bold">Legal Disclaimer: </span> Our sports betting AI is provided for informational and entertainment purposes only. We do not guarantee the accuracy of our predictions or any financial or other outcomes resulting from the use of our AI. We are not responsible for any decisions or actions taken based on the information provided by our AI. Betting on sports carries a high level of risk and may result in financial loss. Please gamble responsibly.
        </p>
      </div>
    </>
  );
};

export default Bets;
