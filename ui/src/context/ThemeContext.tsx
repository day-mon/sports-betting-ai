import { createContext, JSXElement } from "solid-js";
import { createStore } from "solid-js/store";

export interface ThemeContextProviderProps {
  children?: JSXElement;
}

export interface IThemeContext {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export type Theme = "blackout" | "logan" | "lavender" | "light" | "blue";
export const themeOptions: Theme[] = ["blackout", "logan", "lavender", "light", "blue"];

export const ThemeContext = createContext({} as IThemeContext);

const ACCURIBET_THEME_KEY: string = "accuribet-theme";

export function ThemeContextProvider(props: ThemeContextProviderProps) {
  let storedTheme: Theme | undefined = localStorage.getItem(ACCURIBET_THEME_KEY) as Theme;
  let preferredTheme: Theme = themeOptions.includes(storedTheme) ? storedTheme : "blackout";
  const [themeStore, setThemeStore] = createStore<IThemeContext>({
    theme: preferredTheme,
    setTheme(theme: Theme) {
      localStorage.setItem(ACCURIBET_THEME_KEY, theme);
      setThemeStore("theme", theme);
    }
  });

  return <ThemeContext.Provider value={themeStore}>{props.children}</ThemeContext.Provider>;
}
