import {Component, createSignal, For, onMount, Show} from "solid-js";
import {getBaseUrl, MODEL_OPTIONS} from "../constants";
import {fetchHelper} from "../util/fetchHelper";

const About: Component = () => {
    const [winRate, setWinRate] = createSignal<number | string>('');

    const model_name = window.location.pathname.split('/')[2];
    const model = MODEL_OPTIONS.find((model) => model.key === model_name);
    if (!model) {
        return (
            <div class="flex flex-col justify-center items-center h-full">
                <div class="text-red-500 text-center font-bold text-2xl mb-5">
                    Model not found
                </div>
                <div class="flex flex-col items-center">
                    <div class="text-white text-center font-bold text-base mb-5">
                        <span>View other models:  {MODEL_OPTIONS.map(i => (<a class={'ml-2 text-base hover:underline'} href={`/about/${i.key}`}>{i.value}</a> ))}</span>
                    </div>
                </div>
            </div>
        );
    }


    onMount(async () => {
        let response = await fetchHelper(`${getBaseUrl()}/sports/model/accuracy?model_name=${model.key}`);
        if (!response) {
            setWinRate('Could not fetch win rate');
            return;
        }
        let data = await response.json();

        setWinRate(typeof data === 'string' ? data : Number(data.toFixed(2)));
    });
    // / get the model name from the url


    const getPredictedWinColor = (winRate: number) => {
        if (winRate >= 50 && winRate < 60) return 'text-yellow-500';
        if (winRate >= 60) return 'text-green-500';
        if (winRate < 50) return 'text-red-500';
    };

    return (
        <div>
            <div class="mt-4 text-center">
                <h2 class="text-xl font-bold text-center mb-2 text-gray-100">{model.value}</h2>
                <span class={'font-bold text-sm text-center text-white'}>About this model:</span> <span class="text-sm  text-center text-gray-100">{model.description}</span>
                <div class={'text-center'}>
                    <span class={'mb-2 text-sm text-center text-white'} >In addition to these stats we use the teams ranking in comparison to everyone else for each of these stats. For example: Wins Ranking of the bucks may be first in the season</span>
                </div>
                <div class="overflow-x-auto relative  sm:rounded-lg">
                    <div class="mt-4">
                        <table class="w-full text-sm text-center  text-gray-500">
                            <thead class="text-xs text-gray-700 border-b-2 border-b-white/50 uppercase">
                            <tr>
                                <th scope='col' class="px-4 text-white font-bold py-2">Input</th>
                                <th scope='col' class="px-4 text-white font-bold py-2">Description</th>
                            </tr>
                            </thead>
                            <tbody class={'text-white'}>
                            <For each={model.features}>
                                {(feature) => (
                                    <tr>
                                        <td class="px-4 py-2">{feature.name}</td>
                                        <td class="px-4 py-2">{feature.longName}</td>
                                    </tr>
                                )}
                            </For>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="flex flex-col items-center">
                    <div class="text-white text-center text-xl mb-5">
                        <span class={'text-base font-bold'} >Total Inputs:</span> <span class={'text-base'}>{model.features.length * 2}</span>
                    </div>
                </div>
                <div class="flex flex-col items-center">
                    <div class="text-white text-center font-bold text-base mb-5">
                        <Show when={typeof winRate() === 'string'} keyed>
                            {winRate()}
                        </Show>
                        <Show when={typeof winRate() === 'number'} keyed>
                            <span>Win Rate: <span class={`${getPredictedWinColor(winRate() as number)}`}>{winRate()}%</span></span>
                        </Show>
                        {/*<span> {typeof winRate() === 'string' ? winRate() : `Win rate ${winRate()}%`}</span>*/}
                    </div>
                </div>
                <div class="flex flex-col items-center">
                    <div class="text-white text-center text-base mb-5">
                       <span> <span class={'font-bold'}>View other models:</span>  {MODEL_OPTIONS.filter(i => i.key !== model.key).map(i => (<a class={'ml-2 text-base hover:underline'} href={`/about/${i.key}`}>{i.value}</a> ))}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default About;