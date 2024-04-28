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

export function ThemeContextProvider(props: ThemeContextProviderProps) {
  let preferredTheme = localStorage.getItem("accuribet-theme");
  const [themeStore, setThemeStore] = createStore<IThemeContext>({
    theme: preferredTheme ? preferredTheme : "blackout",
    setTheme(theme: string) {
      localStorage.setItem("accuribet-theme", theme);
      setThemeStore("theme", theme);
    }
  });

  return <ThemeContext.Provider value={themeStore}>{props.children}</ThemeContext.Provider>;
}
