import { Link } from "./link";
import { Component, createSignal, For } from "solid-js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select.tsx";

interface Props {
  theme: string;
  callback: (theme: string) => void;
}

interface Route {
  path: string;
  display: string;
}
export const Navbar: Component<Props> = (props: Props) => {
  // let storedPreference = localStorage.getItem('theme');
  const [theme, setTheme] = createSignal(props.theme);

  const changeTheme = (theme: string) => {
    setTheme(theme);
    props.callback(theme);
  };

  const routes = [
    {
      path: "/games",
      display: "Games"
    },
    {
      path: "/history",
      display: "History"
    }
  ] as Route[];

  return (
    <header class="flex items-center justify-between px-6 py-4 bg-primary text-white light:text-black">
      <h1 class="text-2xl font-bold">Accuribet</h1>
      <nav class="space-x-4 flex flex-row items-center">
        <Select
          value={theme()}
          onChange={changeTheme}
          options={["blackout", "logan", "lavender", "light", "blue"]}
          placeholder="Select a theme"
          itemComponent={props => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
        >
          <SelectTrigger aria-label="Theme" class="w-[180px]">
            <SelectValue<string>>{state => state.selectedOption()}</SelectValue>
          </SelectTrigger>
          <SelectContent />
        </Select>
        <For each={routes}>{route => <Link href={route.path}>{route.display}</Link>}</For>
      </nav>
    </header>
  );
};
