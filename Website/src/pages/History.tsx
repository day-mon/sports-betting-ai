import {Component, createSignal, onMount, Show, Suspense} from "solid-js";
import {fetchHelper} from "../util/fetchHelper";
import {Loading} from "../components/Loading";
import {NoData} from "../components/NoData";

const History: Component = () => {
    const [error, setError] = createSignal(false);
    const [loading, setLoading] = createSignal(true);
    const [dates, setDates] = createSignal([] as Date[]);
    const [date, setDate] = createSignal(null as Date | null);


    const getBaseUrl = (useRemote?: boolean) => {
        // check if current url is localhost
        const remoteUrl = 'https://api.accuribet.win';
        if (useRemote) return remoteUrl;
        return window.location.href.includes('localhost') ? 'http://localhost:8080' : remoteUrl;
    };


    onMount(async () => {
        let url = `${getBaseUrl()}/sports/history/dates`;
        let response = await fetchHelper(url);

        if (!response) {
            setError(true);
            setLoading(false);
            return;
        }

        if (!response.ok) {
            setError(true);
            setLoading(false);
            return;
        }

        let dates = await response.json() as string[];
        dates.push('2022-01-01');

        let parsedDates = dates.map((date) => {
            let [year, month, day] = date.split('-');
            return new Date(parseInt(year), parseInt(month) - 1,  parseInt(day));
        }).sort((a, b) => b.getTime() - a.getTime());

        setDates(parsedDates);
        setDate(parsedDates.length == 0 ? null : parsedDates[0]);
        setLoading(false);
    })



    return (
        <Suspense fallback={<Loading />}>
            <Show when={loading()} keyed>
                <Loading />
            </Show>
            <Show when={error() && !loading()} keyed>
                <NoData message={'There was an error fetching the data'} />
            </Show>
            <Show when={!loading() && dates().length === 0} keyed>
                <NoData message={'There are no games at the moment'} />
            </Show>
            <Show when={!loading() && dates().length !== 0} keyed>
                <div class="flex flex-col items-center mt-15 justify-center w-full h-full">
                    <h5 class="text-xl text-white mb-4 font-bold text-center">Choose a date to see our history on</h5>
                </div>
            </Show>
        </Suspense>
    );
}

export default History;