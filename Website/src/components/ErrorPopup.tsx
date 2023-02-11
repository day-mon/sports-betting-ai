import { createSignal, Component } from 'solid-js';

interface IErrorPopupProps {
    show: boolean;
    errorText?: string
    closeHandler: () => void
}

export const ErrorPopup: Component<IErrorPopupProps> = (props: IErrorPopupProps) => {

    return (
        props.show && (
            <div
                class="fixed top-0 p-4 bg-red-500 text-white rounded-lg shadow-lg transition duration-500 ease-in-out opacity-100"
                style={{ opacity: props.show ? 1 : 0 }}
            >
                <p class="text-sm">{ props.errorText ? `An error has occurred. Error: ${props.errorText}` : 'An error has occurred. Please try again later.'}</p>
                <button
                    class="absolute top-0 right-0 m-2 p-2 text-white"
                    onClick={props.closeHandler}
                >
                    ×
                </button>
            </div>
        )
    );
};
