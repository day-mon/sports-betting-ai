import { Index, createSignal, onMount } from 'solid-js';
import { DisplayCard as GameCard } from '~/components/display-card';
import { Game } from '~/interface';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Link } from '~/components/link';

function Games() {
  const [games, setGames] = createSignal<Game[]>([]);

  const fetchGames = async () => {
    const res = await fetch('https://apidev.accuribet.win/api/v1/games/daily?with_odds=true');
    const data = await res.json();

    setGames(data as Game[]);
  };

  onMount(async () => {
    await fetchGames();
  });

  return (
    <>
      <Index each={games()}>
        {(game, i) => (
          <div class="mb-4">
            <GameCard game={game()} />
          </div>
        )}
      </Index>
    </>
  );
}

export default Games;
