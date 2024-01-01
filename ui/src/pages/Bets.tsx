import {Component, For, Index, onCleanup} from 'solid-js';
import {createSignal, onMount, Show, Suspense} from 'solid-js';
import {Game, Prediction} from '../models';
import {GameCard} from '../components/GameCard';
import {Loading} from '../components/Loading';
import {NoData} from '../components/NoData';
import {fetchHelper} from '../util/fetchHelper';
import LoadingSelect from "../components/LoadingSelect";
import {MODEL_OPTIONS} from "../constants";
import {getPredictedWinColor} from "./History";
import {ErrorPopup} from "../components/ErrorPopup";
import { DailyGame, DailyGames } from '../model/game';

const getBaseUrl = (useRemote?: boolean) => {
    // check if current url is localhost
    const remoteUrl = 'https://api.accuribet.win';
    if (useRemote) return remoteUrl;
    let url =  window.location.href.includes('localhost') ? 'http://localhost:8000' : remoteUrl;
    url += '/api/v1';
    return url;
};


const Bets: Component = () => {
    const [bets, setBets] = createSignal<DailyGames>({} as DailyGames);
    const [cardsShow, setCardsShow] = createSignal<boolean[]>([]);
    const [predictionFetchFailed, setPredictionFetchFailed] = createSignal<boolean>(false)
    const [predictionsErrorResponse, setPredictionsErrorResponse] = createSignal<string>()
    const [modelPredictions, setPredictions] = createSignal<Prediction[]>([]);
    const [loading, setLoading] = createSignal(true);
    const [error, setError] = createSignal(false);
    const [disabled, setDisabled] = createSignal(false);
    const [errorMessage, setErrorMessage] = createSignal<string>('');
    const [modelSelected, setModelSelected] = createSignal('')

    const fetchPredictions = async (model_name: string) => {
        if (model_name === '') return;
        let predictions = sessionStorage.getItem(`predictions_${model_name}`);
        if (predictions) {
            let parsedPredictions = JSON.parse(predictions) as Prediction[];
            let allGamesInPredictions = bets().every((game) => parsedPredictions.some((prediction) => prediction.game_id === game.id));
            if (allGamesInPredictions) {
                setPredictions(parsedPredictions);
                return;
            }
        }

        setDisabled(true);
        const BASE_URL = getBaseUrl();
        let response = await fetchHelper(`${BASE_URL}/model/predict/${model_name}`);
        if (!response) {
            setDisabled(false);
            setPredictionFetchFailed(true)
            setTimeout(() => setPredictionFetchFailed(false), 2000)
            return;
        }

        const data = await response.json();

        if (response.status !== 200) {
            setDisabled(false);
            setPredictionFetchFailed(true)
            setPredictionsErrorResponse(data.message)

            setTimeout(() => setPredictionFetchFailed(false), 2000)
            return;
        }

        const prediction = data as Prediction[];
        setPredictions(prediction);
        sessionStorage.setItem(`predictions_${model_name}`, JSON.stringify(prediction));
        setDisabled(false);
        setPredictionsErrorResponse(undefined)
        setPredictionFetchFailed(false)

    };

    const fetchBets = async (refresh?: boolean) => {
        if (!refresh) setLoading(true);
        const BASE_URL = getBaseUrl();

        const res = await fetchHelper(`${BASE_URL}/games/daily`);

        if (!res && !refresh) {
            setError(true);
            setLoading(false);
            setErrorMessage('Failed to fetch games')
            return;
        }

        let response = res!;
        let data = await response.json();


        if (response.status !== 200 && !refresh) {
            setError(true);
            setErrorMessage(data.message)
            setLoading(false);
            return;
        }

        if (response.status !== 200 && refresh) {
            return;
        }

        setError(false);
        setErrorMessage('')
        setBets(data as DailyGames);
    };


    const findPrediction = (game: DailyGame): Prediction | undefined => modelPredictions().find((prediction) => prediction.game_id === game.id);


    const getWinPercentage = () => {
        let won = bets().filter(game => game.status.includes('Final'))
            .map(game => game.away_team.score > game.home_team.score ? [game.away_team.name, game.id] : [game.home_team.name, game.id  ])
            .filter(game => {
                let foundPrediction = modelPredictions().find(predict => predict.game_id == game[1]);
                return foundPrediction?.prediction == game[0]
        }).length;
        return Math.round((won / bets().filter(game => game.status.includes('Final')).length) * 100);
    }

    onMount(async () => {
        await fetchBets();

        let predictions = sessionStorage.getItem(`predictions_${modelSelected()}`);
        if (!predictions) {
            setLoading(false)
            return;
        }
        let parsedPredictions = JSON.parse(predictions) as Prediction[];
        let allGamesInPredictions = bets().every((game) => parsedPredictions.some((prediction) => prediction.game_id === game.id));
        if (allGamesInPredictions) {
            setLoading(false);
            setPredictions(parsedPredictions);
            return;
        }


        setLoading(false);
    });


    const getWinner = (game: DailyGame) => {
        let home_score = game.home_team.score;
        let away_score = game.away_team.score;


        return home_score > away_score ? game.home_team.name : game.away_team.name;
    };


    const betInterval = setInterval(async () => await fetchBets(true), 45_000);


    const sortedBetsByTime = (games: DailyGames) =>
        games.sort((a, b) => {
            if (a.status.includes('Q') || a.status.includes('Halftime')) {
                if (a.status.includes('Q') && b.status.includes('Q')) {
                    return parseInt(a.status.split(' ')[1]) - parseInt(b.status.split(' ')[1]);
                } else if (a.status.includes('Q') && b.status.includes('Halftime')) {
                    return -1;
                } else if (a.status.includes('Halftime') && b.status.includes('Q')) {
                    return 1;
                } else {
                    return 0;
                }
            }
            if (b.status.includes('Q') || b.status.includes('Halftime')) {
                if (b.status.includes('Q') && a.status.includes('Q')) {
                    return parseInt(b.status.split(' ')[1]) - parseInt(a.status.split(' ')[1]);
                } else if (b.status.includes('Q') && a.status.includes('Halftime')) {
                    return 1;
                } else if (b.status.includes('Halftime') && a.status.includes('Q')) {
                    return -1;
                } else {
                    return 0;
                }
            }


            if (a.status.includes('Final')) {
                let prediction = findPrediction(a);
                if (!prediction) return 1;
                let won = prediction.prediction == getWinner(a)
                return won ? -1 : 1;
            }
            if (b.status.includes('Final')) {
                let prediction = findPrediction(a);
                if (!prediction) return 1;
                let won = prediction.prediction == getWinner(a)
                return won ? -1 : 1;
            }

            const aTime = a.status.split(' ')[0].split(':');
            const bTime = b.status.split(' ')[0].split(':');
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

    onCleanup(() => clearInterval(betInterval));


    return (
        <>
            <Suspense fallback={<Loading/>}>
                <Show when={loading()} keyed>
                    <Loading/>
                </Show>
                <Show when={error() && !loading()} keyed>
                    <NoData message={ errorMessage() ?? 'There was an error fetching the data'}>
                        {/* yikes */}
                        <Show when={errorMessage() === 'No games found for today'} keyed>
                            <a target={'_blank'} href={'https://www.nba.com/schedule'} class="text-white underline font-semibold text-center">View the NBA Schedule</a>
                        </Show>
                    </NoData>
                </Show>
                <Show when={!loading() && bets().length === 0} keyed>
                    <NoData message={'There are no games at the moment'}/>
                </Show>
                <Show when={bets().length > 0} keyed>
                    <div class="flex flex-col justify-center items-center">
                        <h5 class="text-xl text-white mb-4 font-bold text-center">Select a model to predict with</h5>
                        <LoadingSelect disabled={disabled()} options={MODEL_OPTIONS} onInput={async (e) => {
                            setModelSelected(e.currentTarget.value)
                            await fetchPredictions(modelSelected())
                        }}/>
                        {predictionFetchFailed() && (
                            <ErrorPopup errorText={predictionsErrorResponse()} closeHandler={() => setPredictionFetchFailed(false)} show={predictionFetchFailed()}/>
                        )}
                        <Show when={modelSelected() !== 'None' && modelSelected() !== ''} keyed>
                            <a href={`/about/${modelSelected()}`} class="text-white hover:underline text-center mt-4">Learn
                                more about {modelSelected().toUpperCase()}</a>
                            <Show when={bets().every(game => game.status.includes('Final')) && modelPredictions().length !== 0 && modelSelected() !== 'ou'} keyed>

                                <h5 class="text-base text-white font-bold text-center">
                                    We predicted
                                    <span class={`${getPredictedWinColor(getWinPercentage())}`}>
                                        {` ${getWinPercentage()}`}%
                                    </span> of the games correctly on <span class="font-bold underline">{bets()[0].date}</span>
                                </h5>
                            </Show>
                        </Show>

                    </div>
                    <Index each={sortedBetsByTime(bets())}>
                        {(game, index) =>
                            <GameCard showDropdown={cardsShow()[index]}
                                      setShowDropdown={() => changeCardShow(index)}
                                      prediction={findPrediction(game())}
                                      game={game()}/>}
                    </Index>
                </Show>
            </Suspense>
            <div class="flex flex-col">
                <p class="text-xs text-gray-500">
                    <span class="font-extrabold">Disclaimer:</span> The model we wrote is not aware of injuries,
                    suspensions or any thing of that nature. Take the predictions with a grain of salt. 😊
                </p>
                <p class="text-xs text-gray-500">
                    <span class="font-extrabold">Legal Disclaimer: </span> Our sports betting AI is provided for
                    informational and entertainment purposes only. We do not guarantee the accuracy of our predictions
                    or any financial or other outcomes resulting from the use of our AI. We are not responsible for any
                    decisions or actions taken based on the information provided by our AI. Betting on sports carries a
                    high level of risk and may result in financial loss. Please gamble responsibly.
                </p>
            </div>
        </>
    );
};

export default Bets;