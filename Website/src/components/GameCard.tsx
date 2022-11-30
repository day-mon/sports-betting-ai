import {Component, createSignal, For, Show} from 'solid-js';
import {Game, Injury, Odd, Prediction} from '../models';
import {Transition} from 'solid-transition-group';
import Modal from "./Modal";
import InjuryModal from "./modals/InjuryModal";

interface IBetCards {
    game: Game;
    prediction?: Prediction;
    showDropdown: boolean;
    setShowDropdown: () => void;
}

export const GameCard: Component<IBetCards> = (props: IBetCards) => {
    const [showInjury, setShowInjury] = createSignal(false);

    const getWinner = (game: Game) => {
        let home_score = game.home_team_score;
        let away_score = game.away_team_score;

        let home_score_int = parseInt(home_score);
        let away_score_int = parseInt(away_score);

        return home_score_int > away_score_int ? game.home_team_name : game.away_team_name;
    };

    const getInjuries = (): Injury[] => {
        const arr = []
        if (props.game.home_team_injuries) {
            arr.push(...props.game.home_team_injuries)
        }

        if (props.game.away_team_injuries) {
            arr.push(...props.game.away_team_injuries)
        }

        return arr;
    }

    const getPredictionAgainstOdds = (odd: Odd, prediction: Prediction) => {
        // in betting is negative number or positive number better
        let home_team_winning = Math.min(odd.home_team_odds, odd.away_team_odds) === odd.home_team_odds;
        let our_prediction = prediction.predicted_winner === props.game.home_team_name;
        return (home_team_winning === our_prediction) ? 'WITH ODDS' : 'AGAINST ODDS';
    };

    const getGameStatus = () => {
        if (props.game.start_time.includes('ET')) {
            return `Starting @ ${props.game.start_time}`
        } else if (props.game.start_time.includes('Final') || props.game.start_time.includes("Halftime") || props.game.start_time.includes("Tipoff")) {
            return props.game.start_time
        } else {
            return (
                <span>Current Quarter: {props.game.start_time} {(props.game.time_left && !props.game.start_time.includes("End") && <span class="text.sm">({props.game.time_left})</span>}</span>
            )
        }

    }

    // why use props.game? instead of just game?
    // we lose reactivity if we don't use props.game, so don't change it or figure out a better way to do it

    return (
        <div
            class="max-2xl mt-10 p-4 border border-gray-500 rounded-lg shadow-2xl mb-4 bg-gray-800 hover:hover:bg-gray-700/10 text-white">
            <h6 class="flex mb-1 text-2xl flex-row justify-center items-center"
                onClick={() => props.setShowDropdown()}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500 hover:text-gray-400 cursor-pointer"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
                {`${props.game.home_team_name} vs ${props.game.away_team_name}`}
            </h6>


            <Show when={props.game.home_team_score != '' || props.game.away_team_score != ''} keyed>
                <div class="flex flex-row justify-center">
                    <Show when={props.game.away_team_score !== '0' || props.game.home_team_score != '0'} keyed>
                        <h6 class="text-s">{props.game.home_team_score}</h6>
                        <h6 class="text-s mx px-2">-</h6>
                        <h6 class="text-s">{props.game.away_team_score}</h6>
                    </Show>
                </div>
            </Show>
            <div class="flex flex-row justify-center ">{getGameStatus()}</div>
            <Show when={props.prediction} keyed>
                <div class="flex font-extrabold flex-row justify-center ">{`Our Projected Winner:`}
                    <span
                        class={`flex flex-col pl-2 text-s ${!props.game.start_time.includes("Final") ? 'text-white' : `${props.prediction?.predicted_winner === getWinner(props.game) && props.game.start_time.includes("Final") ? 'text-green-500' : 'text-red-500'}`}`}>
                        {` ${props.prediction?.predicted_winner}`}
                    </span>
                </div>
            </Show>
            <Show when={props.game.start_time.includes('Final')} keyed>
                <div class="flex flex-row justify-center">{`Winner: ${getWinner(props.game)}`}</div>
            </Show>


            <Transition name="slide-fade">
                {props.showDropdown && (
                    <div class="overflow-x-auto relative mt-4">
                        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead class="text-xs text-gray-700 uppercase text-white dark:bg-gray-700 dark:text-gray-400">
                            <tr class="order-b dark:bg-gray-800 dark:border-gray-700">
                                <For each={props.game.odds && props.game.odds.length > 0 && Object.keys(props.game.odds[0])}>{(key) =>
                                    <th class="px-4 text-center text-white py-3">{key.replace('home_team', props.game.home_team_name).replace('away_team', props.game.away_team_name).replace(/_/g, ' ')}</th>}
                                </For>
                                <Show when={props.prediction && props.game.odds && props.game.odds.length !== 0} keyed>
                                    <th class="px-4 text-white text-center text-center py-3">Our bet</th>
                                </Show>
                            </tr>
                            </thead>
                            <tbody>
                            <For each={props.game.odds}>
                                {(odd) => (
                                    <tr class=" order-b dark:bg-gray-800 dark:border-gray-700">
                                        <th class="py-4 text-center text-white px-6">{odd.book_name.replace(/_/g, ' ').toUpperCase()}</th>
                                        <th class="py-4 text-center text-white px-6">{odd.home_team_odds > 0 ? '+' + odd.home_team_odds : odd.home_team_odds}</th>
                                        <th class="py-4 text-center text-white px-6">{odd.away_team_odds > 0 ? '+' + odd.away_team_odds : odd.away_team_odds}</th>
                                        <th class="py-4 text-center text-white px-6">{odd.home_team_opening_odds > 0 ? '+' + odd.home_team_opening_odds : odd.home_team_opening_odds}</th>
                                        <th class="py-4 text-center text-white px-6">{odd.away_team_opening_odds > 0 ? '+' + odd.away_team_opening_odds : odd.away_team_opening_odds}</th>
                                        <Show when={props.prediction && props.game.odds && props.game.odds.length !== 0} keyed>
                                            <th class="py-4 text-center text-white px-6">{getPredictionAgainstOdds(odd!, props.prediction!)}</th>
                                        </Show>
                                    </tr>
                                )}
                            </For>
                            </tbody>
                        </table>
                    </div>
                )}
            </Transition>
            <Show when={(props.game.home_team_injuries || props.game.away_team_injuries) && (props.game.home_team_injuries?.length > 0 || props.game.home_team_injuries?.length > 0)} keyed>
                <div class="flex flex-row justify-center">
                    <span onclick={() => setShowInjury(true)} class="text-xs cursor-pointer hover:underline text-yellow-300 dark:text-gray-400">⚠️ View Injury Report</span>
                    <InjuryModal header={"Injuries reports are important. Our model does not take these factors into account. If there is a influential player not playing take the prediction with a grain of salt."} injuries={getInjuries()} show={showInjury()} onClose={() => setShowInjury(false)}/>
                </div>
            </Show>
        </div>
    );
};
