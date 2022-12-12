import {Injury, SavedGame, SavedHistory} from '../models';
import {Component, createSignal, For, Show} from 'solid-js';
import Modal from './Modal';
import InjuryModal from './modals/InjuryModal';
import {getPercentageRounded} from "../util/math";
import {getTotalScore} from "./GameCard";

interface ISavedGameCardProps {
    savedHistory: SavedHistory;
}

const SavedGameCard: Component<ISavedGameCardProps> = (props: ISavedGameCardProps) => {
    const [showInjury, setShowInjury] = createSignal(false);



    return (
        <div
            class="max-2xl mt-10 p-4 border border-gray-500 rounded-lg shadow-2xl mb-4 bg-gray-800 hover:hover:bg-gray-700/10 text-white">
            <h5 class="flex mb-1 text-xl flex-row justify-center items-center">{`${props.savedHistory.game.home_team_name} vs ${props.savedHistory.game.away_team_name}`}</h5>
            <div class="flex flex-row justify-center">
                <h6 class="text-s">{props.savedHistory.game.home_team_score}</h6>
                <h6 class="text-s mx px-2">-</h6>
                <h6 class="text-s">{props.savedHistory.game.away_team_score}</h6>
            </div>
            <Show when={props.savedHistory.game.model_name !== 'ou'} keyed>
                <div class="flex font-extrabold flex-row justify-center ">
                    {`Our Prediction:`}
                    <span class={`flex flex-col pl-2 text-s ${props.savedHistory.game.winner == props.savedHistory.game.prediction ? 'text-green-500' : 'text-red-500'}`}>{` ${props.savedHistory.game.prediction}`}</span>
                </div>
                <div class="flex font-extrabold flex-row justify-center ">
                    {`Actual Winner:`}
                    <span class="flex flex col pl-2  text-white">{` ${props.savedHistory.game.winner}`}</span>
                </div>
                <Show when={props.savedHistory.game.confidence} keyed>
                    <div class="flex font-extrabold flex-row justify-center ">
                        {`Confidence:`}
                        <span class={"ml-1"}>{` ${getPercentageRounded(props.savedHistory.game.confidence)}%`}</span>
                    </div>
                </Show>
            </Show>
            <Show when={props.savedHistory.game.model_name === 'ou'} keyed>
                <div class="flex font-extrabold flex-row justify-center ">
                     {`Our Prediction: ${props.savedHistory.game.prediction}`}
                </div>
                <div class="flex font-extrabold flex-row justify-center ">
                    {`Actual Score: ${getTotalScore(props.savedHistory.game)}`}
                </div>
                <div class="flex font-extrabold flex-row justify-center ">
                    {`Difference: ${(props.savedHistory.game.prediction as unknown as number) - getTotalScore(props.savedHistory.game)}`}
                </div>
            </Show>
            <Show when={props.savedHistory.injuries && props.savedHistory.injuries?.length > 0} keyed>
                {/* put view injury report in bottom middle of card */}
                <div class="flex flex-row justify-center">
          <span onclick={() => setShowInjury(true)} class="text-xs cursor-pointer hover:underline text-yellow-300">
            ⚠️ View Injury Report
          </span>
                    <InjuryModal injuries={props.savedHistory.injuries!} show={showInjury()} onClose={() => setShowInjury(false)}/>
                </div>
            </Show>
        </div>
    );
};

export default SavedGameCard;
