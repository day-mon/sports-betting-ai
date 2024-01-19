import { Navbar } from '~/components/navbar';

const App = (props: any) => {
  return (
    <>
      <div class="flex flex-col min-h-screen">
        <Navbar />
        <div class="dark">{props.children}</div>
      </div>
    </>
  );
};

export default App;
