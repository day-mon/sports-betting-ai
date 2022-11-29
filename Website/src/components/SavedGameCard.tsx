import {Injury, SavedGame, SavedHistory} from "../models";
import {Component, createSignal, For, Show} from "solid-js";
import Modal from "./Modal";

interface ISavedGameCardProps {
    savedHistory: SavedHistory
}


const SavedGameCard: Component<ISavedGameCardProps> = (props: ISavedGameCardProps) => {
    const game = props.savedHistory.game;
    const [showInjury, setShowInjury] = createSignal(false);


    const getWinner = (game?: SavedGame) => {
        if (!game) {
            return "Couldn't find a projected winner"
        }
        const home_score = parseInt(game.home_team_score);
        const away_score = parseInt(game.away_team_score);

        return home_score > away_score ? game.home_team_name : game.away_team_name;
    }

    const injuryReportModal = (injuries: Injury[]) => {
        const keys = Object.keys(injuries[0]);
        let game_id_index = keys.indexOf('gameId');
        keys.splice(game_id_index, 1);

        injuries.sort((a, b) => {
            if (a.team === b.team) {
                return 0;
            } else if (a.team) {
                return -1;
            } else {
                return 1;
            }
        });

        return (
            <Modal show={showInjury()} onClose={() => setShowInjury(false)}>
                <div class="overflow-x-auto border-white relative mt-4">
                    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead class="text-xs text-gray-700 uppercase text-white dark:bg-gray-700 dark:text-gray-400">
                        <tr class="order-b dark:bg-gray-800 dark:border-gray-700">
                            <For each={keys}>{(key) =>
                                <th class="text-center text-white py-3">{key}</th>}
                            </For>
                        </tr>
                        </thead>
                        <tbody>
                        <For each={injuries}>
                            {(odd) => (
                                <tr class="border-b border-gray-500 dark:border-gray-700 dark:bg-gray-800">
                                    <For each={keys}>{(key: string) =>
                                        <td class="px-4 text-center text-white py-3">{odd[key]}</td>}
                                    </For>
                                </tr>
                            )}
                        </For>
                        </tbody>
                    </table>
                </div>
            </Modal>
        )
    }

    return (
        <div class="max-2xl mt-10 p-4 border border-gray-500 rounded-lg shadow-2xl mb-4 bg-gray-800 hover:hover:bg-gray-700/10 text-white">
            <h5 class="flex mb-1 text-2xl flex-row justify-center items-center">
                {`${game.home_team_name} vs ${game.away_team_name}`}
            </h5>
            <div class="flex flex-row justify-center">
                <h6 class="text-s">{game.home_team_score}</h6>
                <h6 class="text-s mx px-2">-</h6>
                <h6 class="text-s">{game.away_team_score}</h6>
            </div>
            <div class="flex font-extrabold flex-row justify-center ">{`Our Projected Winner:`}
                <span class={`flex flex-col pl-2 text-s ${ getWinner(game) == game.our_projected_winner ? 'text-green-500' : 'text-red-500'}`}>
                        {` ${game.our_projected_winner}`}
                    </span>
            </div>
            <div class="flex font-extrabold flex-row justify-center ">{`Actual Winner:`}
                <span class="flex flex col pl-2 text-s text-white">
                        {` ${getWinner(game)}`}
                    </span>
            </div>
            <Show when={(props.savedHistory.injuries && (props.savedHistory.injuries?.length > 0))} keyed>
                {/* put view injury report in bottom middle of card */}
                <div class="flex flex-row justify-center">
                    <span onclick={() => setShowInjury(true)} class="text-xs cursor-pointer hover:underline text-yellow-300 dark:text-gray-400">⚠️ View Injury Report</span>
                    {injuryReportModal(props.savedHistory.injuries!)}
                </div>
            </Show>
        </div>
    )
}


export default SavedGameCard;
