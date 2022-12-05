import { Injury } from '../../models';
import Modal from '../Modal';
import { Component, For } from 'solid-js';

interface IInjuryProps {
  injuries: Injury[];
  show: boolean;
  onClose: () => void;
  header?: string;
}
const InjuryModal: Component<IInjuryProps> = (props: IInjuryProps) => {
  const injuries = props.injuries;

  const keys = Object.keys(injuries[0]);
  console.log(keys)


  let game_id_index = keys.indexOf('game_id');
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

  console.log(keys)

  return (
    <Modal show={props.show} onClose={props.onClose}>
      {props.header && <h1 class="text-xl font-bold">{props.header}</h1>}
      <div class="overflow-x-auto border-white relative mt-4">
        <table class="w-full text-sm text-left">
          <thead class="text-xs uppercase">
            <tr class="order-b bg-gray-800 border-gray-700">
              <For each={keys}>{(key) => <th class="text-center text-white py-3">{key}</th>}</For>
            </tr>
          </thead>
          <tbody>
            <For each={injuries}>
              {(odd: Injury) => (
                <tr class="border-b border-gray-700 bg-gray-800">
                  <For each={keys}>{(key: string) => <td class="px-4 text-center text-white py-3">{odd[key]}</td>}</For>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default InjuryModal;
