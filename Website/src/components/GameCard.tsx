import { Component, createSignal, For, Show } from 'solid-js';
import {Game, Injury, Odd, Prediction, SavedGame} from '../models';
import { Transition } from 'solid-transition-group';
import Modal from './Modal';
import InjuryModal from './modals/InjuryModal';

interface IBetCards {
  game: Game;
  prediction?: Prediction;
  showDropdown: boolean;
  setShowDropdown: () => void;
}
export const getTotalScore = (game: Game | SavedGame) => {
    let home_score = game.home_team_score;
    let away_score = game.away_team_score;

    let home_score_int = parseInt(home_score);
    let away_score_int = parseInt(away_score);

    return home_score_int + away_score_int;
};
export const GameCard: Component<IBetCards> = (props: IBetCards) => {
  const [showInjury, setShowInjury] = createSignal(false);

  const getWinner = (game: Game) => {
    let home_score = game.home_team_score;
    let away_score = game.away_team_score;

    let home_score_int = parseInt(home_score);
    let away_score_int = parseInt(away_score);

    return home_score_int > away_score_int ? game.home_team_name : game.away_team_name;
  };


  const getInjuries = (game: Game): Injury[] => {
    const arr = [];
    if (game.home_team_injuries) {
        arr.push(...game.home_team_injuries);
    }


    if (game.away_team_injuries) {
        arr.push(...game.away_team_injuries);
    }


    return arr;
  };

  const getPredictionAgainstOdds = (odd: Odd, prediction: Prediction) => {
    // in betting is negative number or positive number better
    let home_team_winning = Math.min(odd.home_team_odds, odd.away_team_odds) === odd.home_team_odds;
    let our_prediction = prediction.prediction === props.game.home_team_name;
    return home_team_winning === our_prediction ? 'WITH ODDS' : 'AGAINST ODDS';
  };

  const getGameStatus = () => {
    if (props.game.start_time.includes('ET')) {
      return `Starting @ ${props.game.start_time}`;
    } else if (props.game.start_time.includes('Final') || props.game.start_time.includes('Halftime') || props.game.start_time.includes('Tipoff')) {
      return props.game.start_time;
    } else {
      return (
        <span>
          Current Quarter: {props.game.start_time} {props.game.time_left && !props.game.start_time.includes('End') && <span class="text.sm">({props.game.time_left})</span>}
        </span>
      );
    }
  };

  const getPercentageRounded = (num: number) => {
      return (num * 100).toFixed(2)
  }

  // why use props.game? instead of just game?
  // we lose reactivity if we don't use props.game, so don't change it or figure out a better way to do it

  return (
    <div class="max-2xl mt-10 p-4 border border-gray-500 rounded-lg shadow-2xl mb-4 bg-gray-800 hover:hover:bg-gray-800 text-white">
      <h6 class="flex mb-1 text-xl flex-row justify-center items-center">
        {`${props.game.home_team_name} vs ${props.game.away_team_name}`}
      </h6>


      <Show when={props.game.home_team_score != '' || props.game.away_team_score != ''} keyed>
        <div class="flex flex-row justify-center">
          <Show when={props.game.away_team_score !== '0' || props.game.home_team_score != '0'} keyed>
              {/* show the score of the game */}
            <div class="flex flex-col">
                <span class="text-base">{`${props.game.home_team_score} - ${props.game.away_team_score}`}
                </span>
            </div>
          </Show>
        </div>
      </Show>
      <div class="flex flex-row justify-center ">{getGameStatus()}</div>
      <Show when={props.prediction} keyed>
        <div class="flex flex-row font-extrabold flex-row justify-center ">
            <Show when={props.prediction!.prediction_type === "win-loss"} keyed>
              {`Projected Winner:`}
                <span class={`flex flex-row pl-2 ${!props.game.start_time.includes('Final') ? 'text-white' : `${props.prediction?.prediction === getWinner(props.game) && props.game.start_time.includes('Final') ? 'text-green-500' : 'text-red-500'}`}`}>{` ${props.prediction?.prediction}`}</span>
            </Show>

            <Show when={props.prediction!.prediction_type === 'score'} keyed>
                {`Projected Total Score:`}
                <span class={'flex flex-col pl-2'}>{props?.prediction?.prediction}</span>
            </Show>
        </div>
      </Show>
        <Show when={props.prediction?.confidence}>
            <div class="flex flex-row font-extrabold flex-row justify-center ">
            {`Confidence:`}
            <span class="flex flex-col font-medium pl-2">{` ${getPercentageRounded(props.prediction!.confidence)}%`}</span>
            </div>
        </Show>
      <Show when={props.game.start_time.includes('Final')} keyed>
        <div class="flex flex-row justify-center">{ props.prediction?.prediction_type === 'score' ? `Total Score: ${getTotalScore(props.game)}` : `Winner: ${getWinner(props.game)}`}</div>
          {props.prediction?.prediction_type == "score" &&  <div class="flex flex-row justify-center">{`Difference: ${(getTotalScore(props.game) - parseInt(props.prediction?.prediction))}`}</div>}
      </Show>
      <Show when={props.game.odds && props.game.odds.length !== 0} keyed>
        <div class="flex flex-row justify-center">
          <span onclick={props.setShowDropdown} class="text-xs cursor-pointer hover:underline text-white">
              {!props.showDropdown ? '🎲 View Odds' : '🎲 Close Odds'}
          </span>
        </div>
      </Show>
      <Show when={(props.game.home_team_injuries || props.game.away_team_injuries) && (props.game.home_team_injuries?.length > 0 || props.game.home_team_injuries?.length > 0)} keyed>
        <div class="flex flex-row justify-center">
          <span onclick={() => setShowInjury(true)} class="text-xs cursor-pointer hover:underline text-yellow-300">
            ⚠️ View Injury Report
          </span>
          <InjuryModal header={'Injury reports are important. Our model does not take these factors into account. If there is a influential player not playing take the prediction with a grain of salt.'} injuries={getInjuries(props.game)} show={showInjury()} onClose={() => setShowInjury(false)} />
        </div>
      </Show>
      <Transition name="slide-fade">
        {props.showDropdown && (
            <div class="overflow-x-auto relative mt-4">
              <table class="w-full text-sm text-left text-gray-500">
                <thead class="text-xs text-white uppercase bg-gray-700">
                <tr class="order-b bg-gray-800 border-gray-700">
                  <For each={props.game.odds && props.game.odds.length > 0 && Object.keys(props.game.odds[0])}>{(key) => <th class="px-4 text-center text-white py-3">{key.replace('home_team', props.game.home_team_name).replace('away_team', props.game.away_team_name).replace(/_/g, ' ')}</th>}</For>
                  <Show when={props.prediction && props.game.odds && props.game.odds.length !== 0 && props.prediction.prediction_type == "win-loss"} keyed>
                    <th class="px-4 text-white text-center py-3">Our bet</th>
                  </Show>
                </tr>
                </thead>
                <tbody>
                <For each={props.game.odds}>
                  {(odd) => (
                      <tr class="order-bbg-gray-800 border-gray-700">
                        <th class="py-4 text-center text-white px-6">{odd.book_name.replace(/_/g, ' ').toUpperCase()}</th>
                        <th class="py-4 text-center text-white px-6">{odd.home_team_odds > 0 ? '+' + odd.home_team_odds : odd.home_team_odds}</th>
                        <th class="py-4 text-center text-white px-6">{odd.away_team_odds > 0 ? '+' + odd.away_team_odds : odd.away_team_odds}</th>
                        <th class="py-4 text-center text-white px-6">{odd.home_team_opening_odds > 0 ? '+' + odd.home_team_opening_odds : odd.home_team_opening_odds}</th>
                        <th class="py-4 text-center text-white px-6">{odd.away_team_opening_odds > 0 ? '+' + odd.away_team_opening_odds : odd.away_team_opening_odds}</th>
                        <Show when={props.prediction && props.game.odds && props.game.odds.length !== 0 && props.prediction.prediction_type == "win-loss"} keyed>
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
