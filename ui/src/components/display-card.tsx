import { Component, createSignal, For, Show } from 'solid-js';
import { Game, GameWithPrediction, Period, Team } from '~/interface';

import { FiClock } from 'solid-icons/fi';
import { IoLocationOutline } from 'solid-icons/io';
import { OcDotfill3 } from 'solid-icons/oc';
import { Avatar, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Prediction } from '~/model/prediction.ts';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog.tsx';

const logos = import.meta.glob('../assets/teams/*.svg', { eager: true });

const getLogo = (team: string) => {
  let strIndex = `../assets/teams/${team}.svg`
  // @ts-ignore
  return logos[strIndex].default;
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
  let status = game.status.toLowerCase();
  return status !== 'ppd';
};

const getColorFromStatusAndOutcome = (
  status: string,
  winner: boolean,
): string => {
  if (status === 'Final') {
    if (winner) {
      return 'bg-emerald-600';
    } else {
      return 'bg-red-600';
    }
  } else {
    return 'bg-yellow-600';
  }
}
const timeUntilGame = (game: GameWithPrediction): string => {
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

const winningTeam = (game: GameWithPrediction): number => {
  if (game.status === 'Final') {
    return game.home_team.score.points > game.away_team.score.points ? game.home_team.id : game.away_team.id;
  }
  return 0;
};

interface IDisplayCard {
  game: GameWithPrediction;
}

interface ITeamProps {
  team: Team;
}

interface ITeamInfoProps {
  team: Team;
  winner: number;
  prediction?: Prediction
  game: GameWithPrediction;
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
    <div class="bg-shark-700 p-4 rounded mt-4">
      <h4 class="font-semibold">Key Player - {props.team.name}</h4>
      <p>{props.team.leader.name}</p>
      <p class="text-sm text-gray-200">Points: {props.team.leader.points}</p>
      <p class="text-sm text-gray-200">Rebounds: {props.team.leader.rebounds}</p>
      <p class="text-sm text-gray-200">Assists: {props.team.leader.assists}</p>
    </div>
  );
};

export const TeamInfo: Component<ITeamInfoProps> = (props: ITeamInfoProps) => {
  return (
    <div class="flex flex-col items-center">
      <Avatar class="h-14 w-14">
        <AvatarImage alt={`${props.team.name}'s logo`} src={getLogo(props.team.abbreviation.toLowerCase())} />
      </Avatar>
      <CardTitle class="text-lg font-bold text-center">{`${props.team.city} ${props.team.name}`}</CardTitle>
      <CardDescription class="text-sm text-center flex flex-col items-center">
        <span>{`${props.team.wins} - ${props.team.losses}`}</span>
        <span class="flex flex-row items-center mt-1">
          <Show when={props.winner === props.team.id}>
            <Badge class="bg-yellow-600 text-black">Winner</Badge>
          </Show>
          <Show when={props.prediction && props.prediction.prediction_type === "win-loss" && props.prediction.prediction === `${props.team.city} ${props.team.name}`}>
            <Badge class={`ml-2 ${getColorFromStatusAndOutcome(
              props.game.status,
              props.winner === props.team.id
            )} text-white`}>Projected Winner</Badge>
          </Show>
        </span>
      </CardDescription>
    </div>
  );
};

export const AdvancedGameCard: Component<ITeamProps> = (props: ITeamProps) => {
  return (
    <div>
      <div class='mt-4'>
        <h3 class='text-lg font-bold'>Score Breakdown - {props.team.name}</h3>
        <ScoreTable team={props.team} />
      </div>
    </div>
  )
}

export const DemoCard: Component<IDisplayCard> = (props: IDisplayCard) => {
  const [injuryReportOpen, setInjuryReportOpen] = createSignal(false);
  return (
    <>
      <Card
        class='w-full max-w-4xl mx-auto bg-shark-900 rounded-lg shadow-md overflow-hidden p-4 text-white border-4 border-white'>
        <CardHeader>
          <div class='flex flex-row items-center justify-between'>
            <TeamInfo team={props.game.home_team} winner={winningTeam(props.game)} prediction={props.game.prediction} game={props.game} />
            <span class="uppercase leading-3 font-boldtext-sm text-shark-400">vs</span>
            <TeamInfo team={props.game.away_team} winner={winningTeam(props.game)} prediction={props.game.prediction} game={props.game} />
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
                  <Show when={props.game.status === 'PPD'}>
                    <p class="text-xs text-gray-400">Postponed</p>
                  </Show>

                  <span class={`${props.game.status === 'PPD' ? 'line-through': ''} `}>
                    {formattedTimeForUser(props.game.start_time_unix)}
                  </span>

                  <Show when={!isLive(props.game) && props.game.status !== 'PPD'}>
                    <p class={`text-xs text-gray-400 font-bold`}>
                      {timeUntilGame(props.game)}
                    </p>
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
                      <span class="text-red-500 animate-pulse mr-2">
                        <OcDotfill3 />
                      </span>
                      <span class="text-white font-bold">Live</span>
                    </Show>
                  </div>
                  <p class="text-2xl text-white font-bold mb-2">
                    {`${props.game.home_team.name}: ${props.game.home_team.score.points}`}
                    <span class={'text-sm text-gray-400 mx-3'}> - </span>
                    {`${props.game.away_team.name}: ${props.game.away_team.score.points}`}
                  </p>
                  <p class="text-sm text-gray-400">{props.game.status.includes('ET') ? 'Starting soon!' : props.game.status}</p>
                </div>
              </div>
              <For each={[props.game.home_team, props.game.away_team]}>
                {(team, _) => (
                  <AdvancedGameCard team={team} />
                )}
              </For>
            </Show>
          </div>
        </CardContent>
        <CardFooter class="flex justify-center mt-4">
          <Show when={[props.game.home_team, props.game.away_team].every((team) => team.injuries.length > 0)}>
            <Button class="bg-yellow-300 text-yellow-800" variant="default" onClick={() => (setInjuryReportOpen(true))}>
              <AlertDialog
                open={injuryReportOpen()}
                onOpenChange={setInjuryReportOpen}
                preventScroll={true}

              >
                <AlertDialogContent>
                  <AlertDialogTitle>Injury Report</AlertDialogTitle>
                  <AlertDialogDescription>
                    <Table class="mt-2">
                      <TableHeader class="text-white">
                        <TableRow>
                          <TableHead class="text-center text-white ">Team</TableHead>
                          <TableHead class="text-center text-white">Player</TableHead>
                          <TableHead class="text-center text-white">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody class="">
                        <For each={[props.game.home_team, props.game.away_team]}>
                          {(team, _) => (
                            <For each={team.injuries}>
                              {(injury, _) => (
                                <TableRow>
                                  <TableCell class="text-center">{team.name}</TableCell>
                                  <TableCell class="text-center">{injury.player}</TableCell>
                                  <TableCell class="text-center">{injury.status}</TableCell>
                                </TableRow>
                              )}
                            </For>
                          )}
                        </For>
                      </TableBody>
                    </Table>
                  </AlertDialogDescription>
                </AlertDialogContent>
              </AlertDialog>
              View Injury Report (dont click lol it wont stop popping up)
            </Button>
          </Show>
        </CardFooter>
      </Card>
    </>
  );
};
