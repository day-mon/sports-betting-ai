import { Component, For, Show } from 'solid-js';
import { Game } from '~/interface';

import { FiCalendar, FiClock } from 'solid-icons/fi';
import { IoLocationOutline, IoWarning } from 'solid-icons/io';
import { OcDotfill3 } from 'solid-icons/oc';
import { Avatar, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

const logos = import.meta.glob('../assets/teams/*.svg', { eager: true });

const getLogo = (team: string) => {
  return logos[`../assets/teams/${team}.svg`].default;
};

const shortName = (name: string) => {
  const split = name.split(' ');
  return split.slice(1).join(' ');
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
  console.log(game.status.includes('ET'));
  return game.status.includes('ET');
};

const isProjectedWinner = (game: Game): string => {
  // just going to a return a random team name
  return Math.random() < 0.5 ? game.home_team.name : game.away_team.name;
};

const formattedDateForUser = (time: number): string => {
  /**
   * Takes in a unix seconds timestamp and returns a formatted date string
   * Like so: January 15, 2024
   */
  const date = new Date(time * 1000); // Convert seconds to milliseconds
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
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

export const DisplayCardHeader: Component<IDisplayCard> = (props: IDisplayCard) => {
  return (
    <CardHeader class="flex items-center justify-between p-6">
      <For each={[props.game.home_team, props.game.away_team]}>
        {(team, num) => (
          <div class="flex items-center">
            <img alt={`Team ${num} Logo`} class="mr-2 rounded-full" height={50} src={getLogo(team.abbreviation.toLowerCase())} style={{ 'aspect-ratio': '50/50', 'object-fit': 'cover' }} width={50} />
            <div>
              <CardTitle class="text-lg font-bold text-white">{`${team.name}`}</CardTitle>
              <p class="text-sm text-gray-400">
                {team.wins} - {team.losses}
              </p>
            </div>
            <Show when={isProjectedWinner(props.game)}>
              <span class="ml-2 inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">Projected Winner</span>
            </Show>
          </div>
        )}
      </For>
    </CardHeader>
  );
};

export const DemoCard: Component<IDisplayCard> = (props: IDisplayCard) => {
  return (
    <>
      <Card class="w-full max-w-4xl mx-auto bg-gray-900 rounded-lg shadow-md overflow-hidden p-6 text-white">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <Avatar>
                <AvatarImage alt="Detroit Pistons Logo" src={getLogo(props.game.home_team.abbreviation.toLowerCase())} />
              </Avatar>
              <div>
                <CardTitle class="text-lg font-bold">{`${props.game.home_team.city} ${props.game.home_team.name}`}</CardTitle>
                <CardDescription class="text-sm">{`${props.game.home_team.wins} - ${props.game.home_team.losses}`}</CardDescription>
              </div>
            </div>
            <Show when={winningTeam(props.game) === props.game.home_team.id}>
              <Badge class="bg-yellow-500 text-black" variant="secondary">
                Winner
              </Badge>
            </Show>
          </div>
          <div class="flex items-center justify-between mt-4">
            <div class="flex items-center space-x-4">
              <Avatar>
                <AvatarImage alt="Minnesota Timberwolves Logo" src={getLogo(props.game.away_team.abbreviation.toLowerCase())} />
              </Avatar>
              <div>
                <CardTitle class="text-lg font-bold">{`${props.game.away_team.city} ${props.game.away_team.name}`}</CardTitle>
                <CardDescription class="text-sm">{`${props.game.away_team.wins} - ${props.game.away_team.losses}`}</CardDescription>
              </div>
            </div>
            <Show when={winningTeam(props.game) === props.game.away_team.id}>
              <Badge class="bg-yellow-500 text-black" variant="secondary">
                Winner
              </Badge>
            </Show>
          </div>
        </CardHeader>
        {/* <CardHeader class="flex items-center justify-between p-6">
          <div class="flex items-center">
            <img alt={`${props.game.home_team.name}'s Logo`} class="mr-2 rounded-full" height={50} src={getLogo(props.game.home_team.abbreviation.toLowerCase())} style={{ 'aspect-ratio': '50/50', 'object-fit': 'cover' }} width={50} />
            <div>
              <CardTitle class="text-lg font-bold text-white">{`${props.game.home_team.name}`}</CardTitle>
              <p class="text-sm text-gray-400">30-15</p>
            </div>
          </div>
          <div class="flex items-center">
            <div>
              <CardTitle class="text-lg font-bold text-white">{`${props.game.away_team.name}`}</CardTitle>
              <p class="text-sm text-gray-400">35-10</p>
            </div>
            <img alt={`${props.game.away_team.name}'s Logo`} class="ml-2 rounded-full" height={50} src={getLogo(props.game.away_team.abbreviation.toLowerCase())} style={{ 'aspect-ratio': '50/50', 'object-fit': 'cover' }} width={50} />
            <span class="ml-2 inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">Projected Winner</span>
          </div>
        </CardHeader> */}
        <CardContent class="">
          <div class="flex justify-between mt-4 items-center pb-4">
            <div class="flex items-center text-sm">
              <FiCalendar class="mr-1 h-4 w-4 inline-block" />
              <span class="ml-2">{formattedDateForUser(props.game.start_time_unix)}</span>
            </div>
            <Show when={props.game.location}>
              <div class="flex items-center text-sm">
                <IoLocationOutline class="mr-1 h-4 w-4 inline-block" />
                <span class="ml-2">{`${props.game.location.name}, ${props.game.location.city}, ${props.game.location.state}`}</span>
              </div>
            </Show>
            <div class="flex items-center justify-center text-sm">
              <FiClock class="mr-1 h-4 w-4 inline-block" />
              <span class="ml-2">{formattedTimeForUser(props.game.start_time_unix)}</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <Show when={props.game.home_team.leader !== null && props.game.away_team.leader !== null && !isLive(props.game)}>
              <div class="bg-gray-700 p-4 rounded mt-4">
                <h4 class="font-semibold">Key Player - {props.game.home_team.name}</h4>
                <p>{props.game.home_team.leader.name}</p>
                <p class="text-sm text-gray-200">Points: {props.game.home_team.leader.points}</p>
                <p class="text-sm text-gray-200">Rebounds: {props.game.home_team.leader.rebounds}</p>
                <p class="text-sm text-gray-200">Assists: {props.game.home_team.leader.assists}</p>
              </div>
            </Show>
            <Show when={props.game.home_team.leader !== null && props.game.away_team.leader !== null && !isLive(props.game)}>
              <div class="bg-gray-700 p-4 rounded mt-4">
                <h4 class="font-semibold">Key Player - {props.game.away_team.name}</h4>
                <p>{props.game.away_team.leader.name}</p>
                <p class="text-sm text-gray-200">Points: {props.game.away_team.leader.points}</p>
                <p class="text-sm text-gray-200">Rebounds: {props.game.away_team.leader.rebounds}</p>
                <p class="text-sm text-gray-200">Assists: {props.game.away_team.leader.assists}</p>
              </div>
            </Show>
            <div class="col-span-2" id={`${props.game.id}-live-score`}>
              <div class="text-center bg-gray-700 p-4 rounded-lg">
                <div class="flex items-center justify-center mb-2">
                  <span class="text-red-500 animate-pulse mr-2">
                    <OcDotfill3 />
                  </span>
                  <span class="text-white font-bold">Live</span>
                </div>
                <p class="text-2xl text-white font-bold mb-2">
                  {`${props.game.home_team.name}: ${props.game.home_team.score.points}`} - {`${props.game.away_team.name}: ${props.game.away_team.score.points}`}
                </p>
                <p class="text-sm text-gray-400">{props.game.status}</p>
              </div>
            </div>
            <div>
              <div class="mt-4">
                <h3 class="text-lg font-bold">Score Breakdown - {props.game.home_team.name}</h3>
                <Table class="mt-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead class="text-center">1st Quarter</TableHead>
                      <TableHead class="text-center">2nd Quarter</TableHead>
                      <TableHead class="text-center">3rd Quarter</TableHead>
                      <TableHead class="text-center">4th Quarter</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell class="text-center">{props.game.home_team.score.periods[0].score}</TableCell>
                      <TableCell class="text-center">{props.game.home_team.score.periods[1].score}</TableCell>
                      <TableCell class="text-center">{props.game.home_team.score.periods[2].score}</TableCell>
                      <TableCell class="text-center">{props.game.home_team.score.periods[3].score}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div class="mt-4">
                <h4>Timeouts Remaining</h4>
                <p>{props.game.home_team.name}: 2</p>
              </div>
            </div>
            <div>
              <div class="mt-4">
                <h3 class="text-lg font-bold">Score Breakdown - {props.game.away_team.name}</h3>
                <Table class="mt-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead class="text-center">1st Quarter</TableHead>
                      <TableHead class="text-center">2nd Quarter</TableHead>
                      <TableHead class="text-center">3rd Quarter</TableHead>
                      <TableHead class="text-center">4th Quarter</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell class="text-center">{props.game.away_team.score.periods[0].score}</TableCell>
                      <TableCell class="text-center">{props.game.away_team.score.periods[1].score}</TableCell>
                      <TableCell class="text-center">{props.game.away_team.score.periods[2].score}</TableCell>
                      <TableCell class="text-center">{props.game.away_team.score.periods[3].score}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div class="mt-4">
                <h4>Timeouts Remaining</h4>
                <p>{props.game.away_team.name}: 1</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter class="flex justify-between mt-4">
          <Button class="bg-yellow-300 text-yellow-800" variant="default">
            View Injury Report
          </Button>
          <Button class="text-gray-300" variant="ghost">
            View Game Details
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export const DisplayCard: Component<IDisplayCard> = (props: IDisplayCard) => {
  return (
    <>
      <Card class="w-full max-w-2xl mx-auto bg-gray-900 rounded-lg shadow-md overflow-hidden">
        <CardHeader class="flex items-center justify-between p-6">
          <div class="flex items-center">
            <img alt={`${props.game.home_team.name}'s Logo`} class="mr-2 rounded-full" height={50} src={getLogo(props.game.home_team.abbreviation.toLowerCase())} style={{ 'aspect-ratio': '50/50', 'object-fit': 'cover' }} width={50} />
            <div>
              <CardTitle class="text-lg font-bold text-white">{`${props.game.home_team.name}`}</CardTitle>
              <p class="text-sm text-gray-400">30-15</p>
            </div>
          </div>
          <div class="flex items-center">
            <div>
              <CardTitle class="text-lg font-bold text-white">{`${props.game.away_team.name}`}</CardTitle>
              <p class="text-sm text-gray-400">35-10</p>
            </div>
            <img alt={`${props.game.away_team.name}'s Logo`} class="ml-2 rounded-full" height={50} src={getLogo(props.game.away_team.abbreviation.toLowerCase())} style={{ 'aspect-ratio': '50/50', 'object-fit': 'cover' }} width={50} />
            <span class="ml-2 inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">Projected Winner</span>
          </div>
        </CardHeader>
        <CardContent class="p-6">
          <Show when={props.game.start_time_unix}>
            <div class="flex items-center justify-between mb-4">
              <div class="text-sm text-gray-300">
                <FiCalendar class="mr-1 h-4 w-4 inline-block" />
                {formattedDateForUser(props.game.start_time_unix)}
              </div>
              <div class="text-sm text-gray-300">
                <FiClock class="mr-1 h-4 w-4 inline-block" />
                {formattedTimeForUser(props.game.start_time_unix)}
              </div>
            </div>
          </Show>
          <Show when={props.game.location}>
            <div class="mb-4 text-sm text-gray-300">
              <IoLocationOutline class="mr-1 h-4 w-4 inline-block text-gray-300" />
              <span>{`${props.game.location.name}, ${props.game.location.city}, ${props.game.location.state}`}</span>
            </div>
          </Show>
          <Show when={props.game.home_team.leader !== null && props.game.away_team.leader !== null && !isLive(props.game)}>
            <div class="grid grid-cols-2 gap-4 mb-4">
              <For each={[props.game.home_team, props.game.away_team]}>
                {(team, _) => (
                  <div class="border border-gray-700 rounded-lg p-2 shadow-md">
                    <h3 class="text-sm font-bold mb-1 text-white">Key Player - {`${team.name}`}</h3>
                    <p class="text-xs text-gray-400">{`${team.leader.name}`}</p>
                    <p class="text-xs text-gray-400">Points: {`${team.leader.points}`}</p>
                    <p class="text-xs text-gray-400">Rebounds: {`${team.leader.rebounds}`}</p>
                    <p class="text-xs text-gray-400">Assists: {`${team.leader.assists}`}</p>
                  </div>
                )}
              </For>
            </div>
          </Show>
          <div class="mb-4">
            <h3 class="text-sm font-bold mb-1 text-white">Current Score</h3>
            <div class="text-center bg-gray-700 p-4 rounded-lg">
              <div class="flex items-center justify-center mb-2">
                <span class="text-red-500 animate-pulse mr-2">•</span>
                <span class="text-white font-bold">Live</span>
              </div>
              <p class="text-2xl text-white font-bold mb-2">
                {`${shortName(props.game.home_team.name)}`}: 95 - {`${shortName(props.game.away_team.name)}`}: 98
              </p>
              <p class="text-sm text-gray-400">4th Quarter, 2:30 remaining</p>
            </div>
          </div>
          <div class="mb-4">
            <h3 class="text-sm font-bold mb-1 text-white">Score Breakdown</h3>
            <Tabs class="mb-4" defaultValue="first">
              <TabsList class="flex justify-between border-b border-gray-700 bg-gray-700">
                <TabsTrigger class="w-1/4 py-2 text-center font-bold text-white" value="first">
                  1st Quarter
                </TabsTrigger>
                <TabsTrigger class="w-1/4 py-2 text-center font-bold text-white" value="second">
                  2nd Quarter
                </TabsTrigger>
                <TabsTrigger class="w-1/4 py-2 text-center font-bold text-white" value="third">
                  3rd Quarter
                </TabsTrigger>
                <TabsTrigger class="w-1/4 py-2 text-center font-bold text-white" value="fourth">
                  4th Quarter
                </TabsTrigger>
              </TabsList>
              <TabsContent value="first">
                <div class="p-4 border border-gray-700 rounded-lg text-center text-white bg-white dark:bg-gray-800">
                  <p>Lakers: 25</p>
                  <p>Warriors: 22</p>
                </div>
              </TabsContent>
              <TabsContent value="second">
                <div class="p-4 border border-gray-700 rounded-lg text-center text-white bg-white dark:bg-gray-800">
                  <p>Lakers: 20</p>
                  <p>Warriors: 25</p>
                </div>
              </TabsContent>
              <TabsContent value="third">
                <div class="p-4 border border-gray-700 rounded-lg text-center text-white bg-white dark:bg-gray-800">
                  <p>Lakers: 25</p>
                  <p>Warriors: 28</p>
                </div>
              </TabsContent>
              <TabsContent value="fourth">
                <div class="p-4 border border-gray-700 rounded-lg text-center text-white bg-white dark:bg-gray-800">
                  <p>Lakers: 25</p>
                  <p>Warriors: 23</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div class="mb-4">
            <h3 class="text-sm font-bold mb-1 text-white">Timeouts Remaining</h3>
            <div class="flex items-center justify-between text-white">
              <div>
                <h4 class="text-xs font-bold mb-1">Lakers</h4>
                <p>2</p>
              </div>
              <div>
                <h4 class="text-xs font-bold mb-1">Warriors</h4>
                <p>1</p>
              </div>
            </div>
          </div>
          <div class="text-center mb-4 flex items-center justify-center">
            <IoWarning class="mr-1 h-4 w-4 inline-block text-yellow-500" />
            <a class="text-yellow-500 underline" href="#">
              View Injury Report
            </a>
          </div>
          <div class="text-center">
            <Button class="w-full">View Game Details</Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
