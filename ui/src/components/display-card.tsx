import { Component, For, Show } from 'solid-js';
import { Game, Period, Team } from '~/interface';

import { FiCalendar, FiClock } from 'solid-icons/fi';
import { IoLocationOutline } from 'solid-icons/io';
import { OcDotfill3 } from 'solid-icons/oc';
import { Avatar, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { formattedDateForUser } from '~/lib/utils';

const logos = import.meta.glob('../assets/teams/*.svg', { eager: true });

const getLogo = (team: string) => {
  return logos[`../assets/teams/${team}.svg`].default;
};

const formattedTimeForUser = (time: number): string => {
  /**
   * Takes in a unix seconds timestamp and returns a formatted time string
   * for the user.
   * Like so: 12:00 PM EST
   */
  const date = new Date(time * 1000); // Convert seconds to milliseconds
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

const isLive = (game: Game): boolean => {
  let time = game.start_time_unix;
  let date = new Date(time * 1000);
  let currentDate = new Date();
  if (date > currentDate) {
    return false;
  }
  if (game.status === "PPD") {
    return false;
  }

  return true
};

const timeUntilGame = (game: Game): string => {
  /**
   * Takes in a unix seconds timestamp and returns a formatted time string
   * for the user.
   * Like so: 12:00 PM EST
   */
  const date = new Date(game.start_time_unix * 1000); // Convert seconds to milliseconds
  const currentDate = new Date();
  const diff = date.getTime() - currentDate.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return `${hours} hours, ${minutes} minutes`;
};

const winningTeam = (game: Game): number => {
  if (game.status === 'Final') {
    return game.home_team.score > game.away_team.score ? game.home_team.id : game.away_team.id;
  }
  return 0;
};

interface IDisplayCard {
  game: Game;
}

interface ITeamProps {
  team: Team;
}

export const ScoreTable: Component<ITeamProps> = (props: ITeamProps) => {
  const formatPeriodType = (period: Period) => {
    if (period.period_type === 'REGULAR') {
      return `Quarter ${period.period}`;
    } else {
      return period.period_type;
    }
  };

  return (
    <Table class="mt-2">
      <TableHeader class="bg-shark-700 text-shark-300">
        <TableRow>
          <For each={props.team.score.periods}>{(period, _) => <TableHead class="text-center text-shark-300">{formatPeriodType(period)}</TableHead>}</For>
        </TableRow>
      </TableHeader>
      <TableBody class="bg-shark-600">
        <TableRow>
          <For each={props.team.score.periods}>{(period, _) => <TableCell class="text-center">{period.score}</TableCell>}</For>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export const KeyPlayer: Component<ITeamProps> = (props: ITeamProps) => {
  return (
    <div class="bg-gray-700 p-4 rounded mt-4">
      <h4 class="font-semibold">Key Player - {props.team.name}</h4>
      <p>{props.team.leader.name}</p>
      <p class="text-sm text-gray-200">Points: {props.team.leader.points}</p>
      <p class="text-sm text-gray-200">Rebounds: {props.team.leader.rebounds}</p>
      <p class="text-sm text-gray-200">Assists: {props.team.leader.assists}</p>
    </div>
  );
};

export const DemoCard: Component<IDisplayCard> = (props: IDisplayCard) => {
  return (
    <>
      <Card class="w-full max-w-4xl mx-auto bg-shark-900 rounded-lg shadow-md overflow-hidden p-6 text-white border-4 border-shark-600">
        <CardHeader>
          <div class="flex flex-row items-center justify-between">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage alt="Detroit Pistons Logo" src={getLogo(props.game.home_team.abbreviation.toLowerCase())} />
                </Avatar>
                <div>
                  <CardTitle class="text-lg font-bold">{`${props.game.home_team.city} ${props.game.home_team.name}`}</CardTitle>
                  <CardDescription class="text-sm text-center">{`${props.game.home_team.wins} - ${props.game.home_team.losses}`}</CardDescription>
                </div>
              </div>
              <Show when={winningTeam(props.game) === props.game.home_team.id}>
                <Badge class="bg-yellow-500 text-black" variant="secondary">
                  Winner
                </Badge>
              </Show>
            </div>
            <span class="uppercase leading-3 font-bold text-sm text-gray-400">vs</span>
            <div class="flex items-center justify-between mt-4">
              <div class="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage alt="Minnesota Timberwolves Logo" src={getLogo(props.game.away_team.abbreviation.toLowerCase())} />
                </Avatar>
                <div>
                  <CardTitle class="text-lg font-bold">{`${props.game.away_team.city} ${props.game.away_team.name}`}</CardTitle>
                  <CardDescription class="text-sm text-center">{`${props.game.away_team.wins} - ${props.game.away_team.losses}`}</CardDescription>
                </div>
              </div>
              <Show when={winningTeam(props.game) === props.game.away_team.id}>
                <Badge class="bg-yellow-500 text-black" variant="secondary">
                  Winner
                </Badge>
              </Show>
            </div>
          </div>
        </CardHeader>
        <CardContent class="">
          <div class="flex justify-evenly mt-4 items-center pb-4">
            <Show when={props.game.location}>
              <div class="flex items-center text-sm">
                <IoLocationOutline class="mr-1 h-4 w-4 inline-block" />
                <span class="ml-2">{`${props.game.location.name}, ${props.game.location.city}, ${props.game.location.state}`}</span>
              </div>
            </Show>
            <Show when={!isLive(props.game)}>
              <div class="flex items-center justify-center text-sm">
                <FiClock class="mr-1 h-4 w-4 inline-block" />
                <span class="ml-2">
                  {formattedTimeForUser(props.game.start_time_unix)}
                  <Show when={!isLive(props.game)}>
                    <p class="text-xs text-gray-400">{timeUntilGame(props.game)}</p>
                  </Show>
                </span>
              </div>
            </Show>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <For each={[props.game.home_team, props.game.away_team]}>
              {(team, _) => (
                <Show when={team.leader !== null && isLive(props.game)}>
                  <KeyPlayer team={team} />
                </Show>
              )}
            </For>
            <Show when={isLive(props.game)}>
              <div class="col-span-2" id={`${props.game.id}-live-score`}>
                <div class="text-center bg-shark-800 p-4 rounded-lg">
                  <div class="flex items-center justify-center mb-2">

                    <Show when={!props.game.status.toLowerCase().includes('final')}>
                       <span class='text-red-500 animate-pulse mr-2'>
                      <OcDotfill3 />
                      </span>
                      <span class='text-white font-bold'>Live</span>
                    </Show>
                  </div>
                  <p class='text-2xl text-white font-bold mb-2'>
                    {`${props.game.home_team.name}: ${props.game.home_team.score.points}`}
                    <span class={'text-sm text-gray-400 mx-3'}> - </span>
                    {`${props.game.away_team.name}: ${props.game.away_team.score.points}`}
                  </p>
                  <p class="text-sm text-gray-400">{props.game.status.includes('ET') ? 'Starting soon!' : props.game.status}</p>
                </div>
              </div>
              <div>
                <div class="mt-4">
                  <h3 class="text-lg font-bold">Score Breakdown - {props.game.home_team.name}</h3>
                  <ScoreTable team={props.game.home_team} />
                </div>
                <div class="mt-4">
                  <h4>Timeouts Remaining</h4>
                  <p>{props.game.home_team.name}: 2</p>
                </div>
              </div>
              <div>
                <div class="mt-4">
                  <h3 class="text-lg font-bold">Score Breakdown - {props.game.away_team.name}</h3>
                  <ScoreTable team={props.game.away_team} />
                </div>
                <div class="mt-4 ">
                  <h4>Timeouts Remaining</h4>
                  <p>{props.game.away_team.name}: 1</p>
                </div>
              </div>
            </Show>
          </div>
        </CardContent>
        <CardFooter class="flex justify-center mt-4">
          <Button class="bg-yellow-300 text-yellow-800" variant="default">
            View Injury Report
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};
