import { Component, Show } from 'solid-js';
interface IModalProps {
  show: boolean;
  children: any;
  onClose: () => void;
}

const Modal: Component<IModalProps> = (props: IModalProps) => {
  return (
    <>
      <Show when={props.show} fallback={<></>}>
        <div class="fixed border-white z-10 inset-0 overflow-y-auto">
          <div class="flex items-end border-white justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 transition-opacity" aria-hidden="true">
              <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div class="inline-block border border-white/50 align-bottom bg-gray-800 rounded-lg text-left overflow-hidden drop-shadow-xl  transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
              <div class="bg-gray-900  px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <div class="mt-2">{props.children}</div>
                  </div>
                </div>
              </div>
              <div class="bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="button" class="w-full inline-flex justify-center rounded-md border border-white shadow-sm px-4 py-2 bg-gray-900 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm" onclick={() => props.onClose()}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
};

export default Modal;
