import {Component, createSignal, For, Show} from "solid-js";
import {Game} from "../models";
import {Menu, MenuItem} from 'solid-headless'

interface IBetCards {
    game: Game
}

export const Card: Component<IBetCards> = (
    props: IBetCards
) => {
    let game = props.game;
    const [showModal, setShowModal] = createSignal(false);

    const getWinner = (game: Game) => {
        let home_score = game.home_team_score
        let away_score = game.away_team_score

        let home_score_int = parseInt(home_score)
        let away_score_int = parseInt(away_score)

        return home_score_int > away_score_int ? game.home_team_name : game.away_team_name
    }


    return (
        <div class="max-2xl mt-10 p-4 border border-gray-500 rounded-lg shadow-2xl mb-4 bg-gray-800 hover:hover:bg-gray-700/10 text-white">
            <h5 class="flex mb-1 text-2xl flex-row justify-center ">{`${game.home_team_name} vs ${game.away_team_name}`}</h5>
            <Show when={game.home_team_score != "" || game.away_team_score != ""} keyed>
                <div class="flex flex-row justify-center">
                    <h6 class="text-s">{game.away_team_score != "0"  || game.home_team_score != "0" ? game.home_team_score : "TBD"}</h6>
                    <h6 class="text-s mx px-2">-</h6>
                    <h6 class="text-s">{game.away_team_score != "0"  || game.home_team_score != "0" ? game.away_team_score : "TBD"}</h6>
                </div>
            </Show>
            <Menu
                as={'dropdown'}
                class={"flex flex-col"}
            >
                <For each={game.odds}>{(odd) =>
                    <MenuItem
                        as='dropdown-item'
                        class={"flex flex-row justify-center"}
                    >
                        <p onclick={() => setShowModal(true)} class="cursor-pointer under"> {`${odd.book_name} odds`}</p>
                        <Show when={showModal()} keyed>
                            {/*modal component here*/}
                        </Show>
                    </MenuItem>
                }</For>
            </Menu>
            <div class="flex flex-row justify-center ">{game.start_time.includes("ET") ? `Starting @ ${game.start_time}` : game.start_time.includes("Final") ? game.start_time :   `Current Quarter: ${game.start_time}` }</div>
            <Show when={game.projected_winner} keyed>
                <div class="flex flex-row justify-center">{`Projected Winner: ${game.projected_winner}`}</div>
            </Show>
            <Show  when={game.start_time.includes("Final")} keyed>
                <div class="flex flex-row justify-center">{`Winner: ${getWinner(game)}`}</div>
            </Show>
        </div>
    )

}