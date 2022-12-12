import {Component, createEffect, createSignal, For, on, onMount, Show, Suspense} from 'solid-js';
import {fetchHelper} from '../util/fetchHelper';
import {Loading} from '../components/Loading';
import {NoData} from '../components/NoData';
import {DateTimePicker} from 'date-time-picker-solid';
import {Game, HistoryDates, SavedGame, SavedHistory} from '../models';
import SavedGameCard from '../components/SavedGameCard';
import LoadingSelect from "../components/LoadingSelect";
import {MODEL_OPTIONS} from "../constants";

export const getWinner = (game?: SavedGame | Game) => {
    if (!game) {
        return "Couldn't find a projected winner";
    }
    const home_score = parseInt(game.home_team_score);
    const away_score = parseInt(game.away_team_score);

    return home_score > away_score ? game.home_team_name : game.away_team_name;
};


const History: Component = () => {
    const [error, setError] = createSignal(false);
    const [loading, setLoading] = createSignal(true);
    const [historyLoading, setHistoryLoading] = createSignal(false);
    const [dates, setDates] = createSignal([] as HistoryDates[]);
    const [jsDates, setJsDates] = createSignal([] as Date[]);
    const [history, setHistory] = createSignal([] as SavedHistory[]);
    const [date, setDate] = createSignal(undefined as Date | undefined);
    const [modelSelected, setModelSelected] = createSignal('');
    const [funcRan, setFuncRan] = createSignal(0);
    const [calOpen, setCalOpen] = createSignal(false);


    const getBaseUrl = (useRemote?: boolean) => {
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

        let dates = (await response.json()) as HistoryDates[];
        setDates(dates);

        setLoading(false)
    });

    const yesterdayDate = (d: Date) => {
        const h = new Date(d);
        console.log(h);
        h.setDate(h.getDate() - 1);
        return h;
    };

    const tomorrowDate = (d: Date) => {
        const h = new Date(d);
        h.setDate(h.getDate() + 1);
        return h;
    };

    const getGamesOnDate = async (modelName: string, date?: Date) => {
        if (!date) {
            console.log("no date");
            return
        }
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = ('0' + date.getDate()).slice(-2);

        let hour = new Date().getHours();

        let formattedDate = `${year}-${month}-${day}`;
        if (sessionStorage.getItem(`${formattedDate}_${modelName}_${hour}`)) {
            let games = JSON.parse(sessionStorage.getItem(`${formattedDate}_${modelName}`) as string) as SavedHistory[];
            setHistory(games);
            return;
        }

        setHistoryLoading(true);
        let url = `${getBaseUrl()}/sports/history?date=${formattedDate}&model_name=${modelName}`;
        let response = await fetchHelper(url);

        if (!response) {
            setError(true);
            setHistoryLoading(false);
            return;
        }

        if (!response.ok) {
            setError(true);
            setHistoryLoading(false);
            return;
        }
        const games = (await response.json()) as SavedHistory[];
        sessionStorage.setItem(`${formattedDate}_${modelName}_${hour}`, JSON.stringify(games));
        setHistory(games);
        setFuncRan(funcRan() + 1);
        setHistoryLoading(false);
    };

    const sortByWinner = (games: SavedHistory[]) => {
        return games.sort((a, b) => {
            let _1 = a.game.winner == a.game.prediction;
            let _2 = a.game.winner == b.game.prediction;
            if (_1 && !_2) return -1;
            if (!_1 && _2) return 1;
            return 0;
        });
    };


    const getWinPercentage = (games: SavedHistory[]) => {
        let won = games.filter((game) => game.game.winner == game.game.prediction).length;
        return Math.round((won / games.length) * 100);
    };





    const getPredictedWinColor = () => {
        let winPercentage = getWinPercentage(history());
        if (winPercentage > 50 && winPercentage < 60) return 'text-yellow-500';
        if (winPercentage >= 60) return 'text-green-500';
        if (winPercentage <= 50) return 'text-red-500';
    };

    const getOptions = () => MODEL_OPTIONS.filter((option) => {
        return dates().some((date) => date.model_name.includes(option.key));
    });

    const getCalenderForDates = (minDate: Date, maxDate: Date, currentDate: Date) => {
        return (
            <DateTimePicker
                customizeCalendar={'m-0'}
                minDate={minDate}
                maxDate={maxDate}
                dateFormat={'Y-M-D'}
                currentDate={currentDate}
                enableSelectedDateEditor={false}
                enableSelectedDate={false}
                calendarResponse={async (props) => {
                    props.setCalendarState(calOpen());
                    setDate(props.currentDate);
                    props.currentDate = date();
                    await getGamesOnDate(modelSelected(), props.currentDate);
                }}
            />
        )
    }


    return (
        <Suspense fallback={<Loading/>}>
            <Show when={loading()} keyed>
                <Loading/>
            </Show>
            <Show when={error() && !loading()} keyed>
                <NoData message={'There was an error fetching the data'}/>
            </Show>
            <Show when={!loading() && dates().length === 0} keyed>
                <NoData message={'There are no games we have saved :('}/>
            </Show>
            <Show when={!loading() && dates().length !== 0} keyed>
                <div class="flex flex-col items-center justify-center">
                    <h5 class={"mb-2 text-white font-bold text-base"}>Select a model</h5>
                    <LoadingSelect disabled={historyLoading()} options={getOptions()} onInput={(e) => {
                        setModelSelected(e.target.value);

                        let newDatesHist = dates().find(d => d.model_name.includes(e.target.value));
                        if (!newDatesHist) return;
                        let newDates = newDatesHist.dates
                            .map((date) => {
                                let [year, month, day] = date.split('-');
                                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                            }).sort((a, b) => a.getTime() - b.getTime());

                        setJsDates(newDates);
                    }}/>



                    <Show when={modelSelected() !== 'None' && modelSelected() !== ''}  keyed>
                        <div class={'text-white text-center mt-6 mb-5'}>
                            <span class={"font-bold mt-0"}>About this model</span>: {MODEL_OPTIONS.find((option) => option.key === modelSelected())?.description}
                        </div>
                    </Show>
                    { modelSelected() && (
                        getCalenderForDates(yesterdayDate(jsDates()[0]),
                            tomorrowDate(jsDates()[jsDates().length - 1]),
                            jsDates()[jsDates().length - 1]
                        )
                    )}
                </div>
                <Show when={!historyLoading()} fallback={<Loading/>} keyed>
                    <div class="flex flex-col items-center mt-15 justify-center w-full h-full">
                        <Show when={!isNaN(getWinPercentage(history())) && modelSelected() !== 'ou'} keyed>
                            <h5 class="text-base text-white font-bold text-center">
                                We predicted
                                <span class={`${getPredictedWinColor()}`}> {getWinPercentage(history())}% </span>
                                of the games correctly on <span
                                class="font-bold underline">{date()?.toDateString()}</span>
                            </h5>
                        </Show>
                    </div>
                    <For each={sortByWinner(history())}>{(game) => <SavedGameCard savedHistory={game}/>}</For>
                </Show>
            </Show>
        </Suspense>
    );
};

export default History;
