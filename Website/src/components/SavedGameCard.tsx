import {SavedGame} from "../models";
import {Component} from "solid-js";

interface ISavedGameCardProps {
    game: SavedGame
}


const SavedGameCard: Component<ISavedGameCardProps> = (props: ISavedGameCardProps) => {
    const { game } = props;
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
                <span class={`flex flex-col pl-2 text-s ${ props.game.winner == props.game.our_projected_winner ? 'text-green-500' : 'text-red-500'}`}>
                        {` ${props.game?.our_projected_winner}`}
                    </span>
            </div>
            <div class="flex font-extrabold flex-row justify-center ">{`Actual Winner:`}
                <span class="flex flex col pl-2 text-s text-white">
                        {` ${props.game?.winner}`}
                    </span>
            </div>
        </div>
    )
}


export default SavedGameCard;