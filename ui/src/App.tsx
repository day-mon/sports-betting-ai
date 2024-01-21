import { Component, createSignal } from 'solid-js';
import { Navbar } from '~/components/navbar';

const App: Component = (props: any) => {
  let preferredTheme = localStorage.getItem('theme');
  const [theme, setTheme] = createSignal(
    preferredTheme ? preferredTheme : 'blackout',
  );

  const changeThemeCallback = (theme: string) => {
    setTheme(theme);
    localStorage.setItem('theme', theme);
  };

  return (
    <>
      <div class={`flex flex-col min-h-screen ${theme()}`}>
        <Navbar theme={theme()} callback={changeThemeCallback} />
        {props.children}
      </div>
    </>
  );
};

export default App;
