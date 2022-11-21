import {Component} from "solid-js";

interface INoDataProps {
    message?: string;
}

export const NoData: Component<INoDataProps> = (props?: INoDataProps) => {
    return (
        <div class="flex items-center justify-center h-screen">
            <div class="flex flex-col items-center space-y-4">
                <div class="text-4xl font-bold text-gray-400">{props?.message || "No Data" }</div>
            </div>
        </div>
    )
}