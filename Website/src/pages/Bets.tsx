import type {Component} from 'solid-js';
import {createSignal, For, onMount, Show, Suspense} from "solid-js";
import {Game} from "../models";
import {Card} from "../components/Card";
import {Loading} from "../components/Loading";
import {NoData} from "../components/NoData";

const BASE_URL = "https://sports.schoolbot.dev/sports/games";

// just doing this for fun change if needed


const Bets: Component = () => {
    const [bets, setBets] = createSignal([] as Game[]);
    const [loading, setLoading] = createSignal(true);

    onMount(async () => {
        setLoading(true);
        const res = await fetch(BASE_URL);
        const data = await res.json() as Game[];
        setBets(data);
        setLoading(false);
    });

    setInterval(async () => {
        const res = await fetch(BASE_URL);
        const data = await res.json() as Game[];
        setBets(data);
    }, 60_000);

    return (
        <>
            <Suspense fallback={<Loading/>}>
                <Show when={loading() && bets().length === 0} keyed>
                    <Loading/>
                </Show>
                <Show when={!loading() && bets().length === 0} keyed>
                    <NoData message={"There are no games at the moment"}/>
                </Show>
                <Show when={bets().length > 0} keyed>
                    <For each={bets()}>{(bet) => <Card game={bet}/>}</For>
                </Show>
            </Suspense>
        </>
    )
};


export default Bets;
