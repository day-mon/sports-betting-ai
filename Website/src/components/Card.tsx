import {Component, For} from "solid-js";
import {Game} from "../models";
import {Menu, MenuItem} from 'solid-headless'

interface IBetCards {
    game: Game
}


export const Card: Component<IBetCards> = (
    props: IBetCards
) => {
    let game = props.game;
    return (
        <div class="max-2xl p-4 bg-gray-700/75 border gre rounded-lg shadow-md hover:bg-gray-100 dark:bg-amber-500 dark:border-gray-700 dark:hover:bg-amber-500 mb-4">
            <h5 class="mb-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{game.away_team_name} vs {game.home_team_name}</h5>
            <Menu
                as={'dropdown'}
                class={"flex flex-col"}
            >
                <For each={game.odds}>{(odd) =>
                    <MenuItem
                        as='dropdown-item'
                        class={"flex flex-row justify-between"}
                    >{odd.book_name}</MenuItem>
                }</For>
            </Menu>
        </div>
    )

}