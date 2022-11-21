import type {Component} from 'solid-js';
import {createSignal, For, onMount, Show, Suspense} from "solid-js";
import {Game, Prediction} from "../models";
import {Card} from "../components/Card";
import {Loading} from "../components/Loading";
import {NoData} from "../components/NoData";
import {fetchHelper} from "../util/fetchHelper";


const getBaseUrl = (useRemote?: boolean) => {
    // check if current url is localhost
    if (useRemote) return "https://sports.schoolbot.dev"
    return window.location.href.includes("localhost") ? "http://localhost:8080" : "https://sports.schoolbot.dev";

}

// just doing this for fun change if needed


const Bets: Component = () => {
    const [bets, setBets] = createSignal([] as Game[]);
    const [loading, setLoading] = createSignal(true);
    const [books, setBooks] = createSignal([] as string[]);
    const [error, setError] = createSignal(false);
    const [predictions, setPredictions] = createSignal([] as Prediction[]);

    const fetchPredictions = async () => {
        const BASE_URL = getBaseUrl(true);
        const response = await fetchHelper(`${BASE_URL}/sports/predict/all`);
        if (!response) {
            return
        }
        const data = await response.json() as Prediction[];
        setPredictions(data);
    }

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

        const data = await response.json() as Game[];
        const book = data.flatMap((game) => game.odds.map((odd) => odd.book_name))
            .filter((book, index, self) => self.indexOf(book) === index);
        setBooks(book);
        setBets(data);
    }


    const findPrediction = (game: Game): Prediction | undefined =>  predictions().find((prediction) => prediction.game_id === game.game_id)

    onMount(async () => {
        await fetchBets();
        setLoading(false);
    });

    setInterval(async () => {
        await fetchBets(true);
    }, 45_000);



    return (
        <>
            <Suspense fallback={<Loading/>}>
                <Show when={loading()} keyed>
                    <Loading/>
                </Show>
                <Show when={error() && !loading()} keyed>
                    <NoData message={"There was an error fetching the data"}/>
                </Show>
                <Show when={!loading() && bets().length === 0} keyed>
                    <NoData message={"There are no games at the moment"}/>
                </Show>
                <Show when={bets().length > 0} keyed>
                    {/* Add button to : button*/}
                    <div class="flex flex-col justify-center items-center">
                        <div class="flex flex-row justify-center items-center">
                            <button
                                onclick={() => fetchPredictions()}
                                class="max-2xl mt-10 p-4 border border-gray-500 rounded-lg shadow-2xl mb-4 bg-gray-800 hover:hover:bg-gray-700/10 text-white">Predict all games</button>
                        </div>
                    </div>
                    <For each={bets()}>{(game) => <Card prediction={findPrediction(game)} game={game}/>}</For>
                </Show>
            </Suspense>
        </>
    )
};


export default Bets;
