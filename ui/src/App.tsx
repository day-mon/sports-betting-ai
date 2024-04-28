import { Component, useContext } from "solid-js";
import { Navbar } from "~/components/navbar";
import { IThemeContext, ThemeContext } from "~/context/ThemeContext.tsx";

const App: Component = (props: any) => {
  const themeContext: IThemeContext = useContext(ThemeContext);

  return (
    <>
      <div class={`flex flex-col min-h-screen bg-primary ${themeContext.theme}`}>
        <Navbar />
        {props.children}
      </div>
    </>
  );
};

export default App;
