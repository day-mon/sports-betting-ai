import { createContext, JSXElement } from "solid-js";
import { createStore } from "solid-js/store";

export interface ThemeContextProviderProps {
  children?: JSXElement;
}

export interface IThemeContext {
  theme: string;
  setTheme: (theme: string) => void;
}

export const ThemeContext = createContext({} as IThemeContext);

const ACCURIBET_THEME_KEY: string = "accuribet-theme";

export function ThemeContextProvider(props: ThemeContextProviderProps) {
  let preferredTheme = localStorage.getItem(ACCURIBET_THEME_KEY);
  const [themeStore, setThemeStore] = createStore<IThemeContext>({
    theme: preferredTheme ? preferredTheme : "blackout",
    setTheme(theme: string) {
      localStorage.setItem(ACCURIBET_THEME_KEY, theme);
      setThemeStore("theme", theme);
    }
  });

  return <ThemeContext.Provider value={themeStore}>{props.children}</ThemeContext.Provider>;
}
