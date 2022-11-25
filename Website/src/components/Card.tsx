import {Component, createSignal, For, Show} from 'solid-js';
import {Game, Odd, Prediction} from '../models';
import {Transition} from 'solid-transition-group';

interface IBetCards {
    game: Game;
    prediction?: Prediction;
}

export const Card: Component<IBetCards> = (props: IBetCards) => {
    let game = props.game;
    const [showDropdown, setShowDropdown] = createSignal(false);

    const getWinner = (game: Game) => {
        let home_score = game.home_team_score;
        let away_score = game.away_team_score;

        let home_score_int = parseInt(home_score);
        let away_score_int = parseInt(away_score);

        return home_score_int > away_score_int ? game.home_team_name : game.away_team_name;
    };

    const getPredictionAgainstOdds = (odd: Odd, prediction: Prediction) => {
        let home_team_winning = odd.home_team_odds > 0;
        let our_prediction = prediction.predicted_winner === game.home_team_name;
        return home_team_winning === our_prediction ? 'WITH ODDS' : 'AGAINST ODDS';
    };



    return (
        <div
            class="max-2xl mt-10 p-4 border border-gray-500 rounded-lg shadow-2xl mb-4 bg-gray-800 hover:hover:bg-gray-700/10 text-white">
            <h5 class="flex mb-1 text-2xl flex-row justify-center items-center"
                onClick={() => setShowDropdown(!showDropdown())}>
                <Show when={!game.start_time.includes("Final")} keyed>
                    <svg xmlns="http://www.w3.org/2000/svg"
                         class="h-6 w-6 text-gray-500 hover:text-gray-400 cursor-pointer"
                         fill="none"
                         viewBox="0 0 24 24"
                         stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </Show>
                {`${game.home_team_name} vs ${game.away_team_name}`}
            </h5>
            <Show when={game.home_team_score != '' || game.away_team_score != ''} keyed>
                <div class="flex flex-row justify-center">
                    <Show when={game.away_team_score !== '0' || game.home_team_score != '0'} keyed>
                        <h6 class="text-s">{game.home_team_score}</h6>
                        <h6 class="text-s mx px-2">-</h6>
                        <h6 class="text-s">{game.away_team_score}</h6>
                    </Show>
                </div>
            </Show>
            <div class="flex flex-row justify-center ">{game.start_time.includes('ET') ? `Starting @ ${game.start_time}` : game.start_time.includes('Final') ? game.start_time : `Current Quarter: ${game.start_time}`}</div>
            <Show when={props.prediction} keyed>
                <div class="flex font-extrabold flex-row justify-center ">{`Our Projected Winner:`}
                    <span class={`flex flex-col pl-2 text-s ${!props.game.start_time.includes("Final") ?  'text-white' : `${ props.prediction?.predicted_winner === getWinner(game) && game.start_time.includes("Final") ? 'text-green-500' : 'text-red-500'}`}`}>
                        {` ${props.prediction?.predicted_winner}`}
                    </span>
                </div>
            </Show>
            <Show when={game.start_time.includes('Final')} keyed>
                <div class="flex flex-row justify-center">{`Winner: ${getWinner(game)}`}</div>
            </Show>
            <Transition name="slide-fade">
                {showDropdown() && (
                    <div class="overflow-x-auto relative mt-4">
                        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead
                                class="text-xs text-gray-700 uppercase text-white dark:bg-gray-700 dark:text-gray-400">
                            <tr class="order-b dark:bg-gray-800 dark:border-gray-700">
                                <For each={game.odds.length > 0 && Object.keys(game.odds[0])}>{(key) => <th
                                    class="px-4 text-center text-white py-3">{key.replace('home_team', game.home_team_name).replace('away_team', game.away_team_name).replace(/_/g, ' ')}</th>}</For>
                                <Show when={props.prediction && game.odds.length !== 0} keyed>
                                    <th class="px-4 text-white text-center text-center py-3">Our bet</th>
                                </Show>
                            </tr>
                            </thead>
                            <tbody>
                            <For each={game.odds}>
                                {(odd) => (
                                    <tr class=" order-b dark:bg-gray-800 dark:border-gray-700">
                                        <th class="py-4 text-center text-white px-6">{odd.book_name.replace(/_/g, ' ').toUpperCase()}</th>
                                        <th class="py-4 text-center text-white px-6">{odd.home_team_odds > 0 ? '+' + odd.home_team_odds : odd.home_team_odds}</th>
                                        <th class="py-4 text-center text-white px-6">{odd.away_team_odds > 0 ? '+' + odd.away_team_odds : odd.away_team_odds}</th>
                                        <th class="py-4 text-center text-white px-6">{odd.home_team_opening_odds > 0 ? '+' + odd.home_team_opening_odds : odd.home_team_opening_odds}</th>
                                        <th class="py-4 text-center text-white px-6">{odd.away_team_opening_odds > 0 ? '+' + odd.away_team_opening_odds : odd.away_team_opening_odds}</th>
                                        <Show when={props.prediction && game.odds.length !== 0} keyed>
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
        </div>
    );
};
