import { Component, createSignal, For, Show } from "solid-js";
import { Game, GameWithPrediction, Period, Team } from "~/interface";

import { FiClock } from "solid-icons/fi";
import { IoLocationOutline } from "solid-icons/io";
import { OcDotfill3 } from "solid-icons/oc";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle
} from "~/components/ui/alert-dialog.tsx";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/ui/table";
import { isLive, timeUntilGame } from "~/lib/utils.ts";
import { Prediction } from "~/model/prediction.ts";
import { Motion } from "solid-motionone";

const logos = import.meta.glob("../assets/teams/*.svg", { eager: true });

const getLogo = (team: string) => {
  let strIndex = `../assets/teams/${team}.svg`;
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
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short"
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

const getColorFromStatusAndOutcome = (status: string, winner: boolean): string => {
  if (status === "Final" || status === "Final/OT") {
    if (winner) {
      return "bg-emerald-600";
    } else {
      return "bg-red-600";
    }
  } else {
    return "bg-700";
  }
};

const winningTeam = (game: GameWithPrediction): number => {
  if (game.status === "Final" || game.status === "Final/OT") {
    return game.home_team.score.points > game.away_team.score.points
      ? game.home_team.id
      : game.away_team.id;
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
  prediction?: Prediction;
  game: GameWithPrediction;
}

interface IQuickDisplayProps {
  game: Game;
}

export const ScoreTable: Component<ITeamProps> = (props: ITeamProps) => {
  const formatPeriodType = (period: Period) => {
    if (period.period_type === "REGULAR") {
      return `Quarter ${period.period}`;
    } else {
      return period.period_type;
    }
  };

  return (
    <Table class="mt-2">
      <TableHeader class="bg-700 text-300">
        <TableRow>
          <For each={props.team.score.periods}>
            {(period, _) => (
              <TableHead class="text-center text-300">{formatPeriodType(period)}</TableHead>
            )}
          </For>
        </TableRow>
      </TableHeader>
      <TableBody class="bg-600">
        <TableRow>
          <For each={props.team.score.periods}>
            {(period, _) => (
              <TableCell class="text-center">
                {period.score === null || period.score === 0 ? "-" : period.score}
              </TableCell>
            )}
          </For>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export const KeyPlayer: Component<ITeamProps> = (props: ITeamProps) => {
  return (
    <div class="bg-700 p-4 rounded mt-4">
      <h4 class="font-semibold">Key Player - {props.team.name}</h4>
      <p>{props.team.leader.name}</p>
      <p class="text-sm text-gray-200 light:text-100">Points: {props.team.leader.points}</p>
      <p class="text-sm text-gray-200 light:text-100">Rebounds: {props.team.leader.rebounds}</p>
      <p class="text-sm text-gray-200 light:text-100">Assists: {props.team.leader.assists}</p>
    </div>
  );
};

export const TeamInfo: Component<ITeamInfoProps> = (props: ITeamInfoProps) => {
  return (
    <div class="flex flex-col items-center">
      <Avatar class="h-14 w-14">
        <AvatarImage
          alt={`${props.team.name}'s logo`}
          src={getLogo(props.team.abbreviation.toLowerCase())}
        />
      </Avatar>
      <CardTitle class="text-lg font-bold text-center">{`${props.team.city} ${props.team.name}`}</CardTitle>
      <CardDescription class="text-sm text-center flex flex-col items-center">
        <span>{`${props.team.wins} - ${props.team.losses}`}</span>
        <span class="flex flex-row items-center mt-1">
          <Show when={props.winner === props.team.id}>
            <Badge class="bg-yellow-600 hover:bg-yellow-600 text-black">Winner</Badge>
          </Show>
          <Show
            when={
              props.prediction &&
              props.prediction.prediction_type === "win-loss" &&
              props.prediction.prediction === `${props.team.city} ${props.team.name}`
            }
          >
            <Badge
              class={`ml-2 ${getColorFromStatusAndOutcome(
                props.game.status,
                props.winner === props.team.id
              )} text-white`}
            >
              Projected Winner
            </Badge>
          </Show>
        </span>
      </CardDescription>
    </div>
  );
};

export const QuickDisplay: Component<IQuickDisplayProps> = (props: IQuickDisplayProps) => {
  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    const targetId = `#game-card-${props.game.id}`;
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest"
      });
    }
  };

  return (
    <Motion.div
      class="flex flex-row items-center justify-between w-full p-2 mb-2 bg-700 hover:bg-500 rounded-lg hover:shadow-lg cursor-pointer"
      initial={false}
      hover={{ y: [-3, -5, -3], scale: [1, 1.01, 1] }}
      transition={{ duration: 1, easing: "ease-in-out", repeat: Infinity }}
      onClick={handleClick}
    >
      <div class="flex items-center">
        <Avatar class="h-14 w-14">
          <AvatarImage
            alt={`${props.game.home_team.name}'s logo`}
            src={getLogo(props.game.home_team.abbreviation.toLowerCase())}
          />
        </Avatar>
        <span class="ml-1">{props.game.home_team.name}</span>
      </div>
      <div>vs</div>
      <div class="flex items-center">
        <span class="mr-1">{props.game.away_team.name}</span>
        <Avatar class="h-14 w-14">
          <AvatarImage
            alt={`${props.game.away_team.name}'s logo`}
            src={getLogo(props.game.away_team.abbreviation.toLowerCase())}
          />
        </Avatar>
      </div>
    </Motion.div>
  );
};

export const AdvancedGameCard: Component<ITeamProps> = (props: ITeamProps) => {
  return (
    <div>
      <div class="mt-4">
        <h3 class="text-lg font-bold">Score Breakdown - {props.team.name}</h3>
        <ScoreTable team={props.team} />
      </div>
    </div>
  );
};

export const DemoCard: Component<IDisplayCard> = (props: IDisplayCard) => {
  const [injuryReportOpen, setInjuryReportOpen] = createSignal(false);
  return (
    <>
      <Card
        class="w-full max-w-4xl mx-auto bg-secondary rounded-lg shadow-md overflow-hidden p-4 text-white light:text-black border-4 border-700"
        id={`game-card-${props.game.id}`}
      >
        <CardHeader>
          <div class="flex flex-row items-center justify-between">
            <TeamInfo
              team={props.game.home_team}
              winner={winningTeam(props.game)}
              prediction={props.game.prediction}
              game={props.game}
            />
            <span class="uppercase leading-3 font-boldtext-sm text-400">vs</span>
            <TeamInfo
              team={props.game.away_team}
              winner={winningTeam(props.game)}
              prediction={props.game.prediction}
              game={props.game}
            />
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
                  <Show when={props.game.status === "PPD"}>
                    <p class="text-xs text-gray-400">Postponed</p>
                  </Show>

                  <span class={`${props.game.status === "PPD" ? "line-through" : ""} `}>
                    {formattedTimeForUser(props.game.start_time_unix)}
                  </span>

                  <Show when={!isLive(props.game) && props.game.status !== "PPD"}>
                    <p class={`text-xs text-gray-400 text-center font-bold`}>
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
                <div class="text-center bg-800 p-4 rounded-lg">
                  <div class="flex items-center justify-center mb-2">
                    <Show when={!props.game.status.toLowerCase().includes("final")}>
                      <span class="text-red-500 animate-pulse mr-2">
                        <OcDotfill3 />
                      </span>
                      <span class="text-white light:text-black font-bold">Live</span>
                    </Show>
                  </div>
                  <div class="grid grid-cols-3 text-2xl font-bold mb-2 px-2">
                    <div class="text-center">
                      <p class="text-white light:text-black">{props.game.home_team.name}</p>
                      <p class="text-white light:text-200 bg-700 py-2 px-4 rounded inline-block">
                        {props.game.home_team.score.points}
                      </p>
                    </div>
                    <span class="text-sm text-gray-400 mt-6 mx-3"> - </span>
                    <div class="text-center">
                      <p class="text-white light:text-black">{props.game.away_team.name}</p>
                      <p class="text-white light:text-200 bg-700 py-2 px-4 rounded inline-block">
                        {props.game.away_team.score.points}
                      </p>
                    </div>
                  </div>
                  <p class="text-sm text-gray-400 light:text-100">
                    {props.game.status.includes("ET") ? "Starting soon!" : props.game.status}
                  </p>
                </div>
              </div>
              <For each={[props.game.home_team, props.game.away_team]}>
                {(team, _) => <AdvancedGameCard team={team} />}
              </For>
            </Show>
          </div>
        </CardContent>
        <CardFooter class="mt-4 block">
          <div>
            <Show
              when={props.game.prediction && props.game.prediction.prediction_type == "win-loss"}
            >
              <h3 class="font-bold">Prediction Confidence</h3>
              <div class="bg-600 p-4 rounded mt-4">
                <p class="text-sm">
                  The prediction model has a confidence of{" "}
                  {((props.game.prediction?.confidence ?? 0) * 100).toFixed(1)}% for the{" "}
                  <span class="font-bold">{props.game.prediction?.prediction}</span> to win.
                </p>
              </div>
            </Show>
          </div>
          <div class="flex flex-row items-center justify-center mt-4">
            <Show
              when={[props.game.home_team, props.game.away_team].every(
                team => team.injuries.length > 0
              )}
            >
              <Button
                class="bg-700 text-white light:text-black"
                variant="default"
                onClick={() => setInjuryReportOpen(true)}
              >
                View Injury Report
              </Button>
              <AlertDialog
                open={injuryReportOpen()}
                onOpenChange={setInjuryReportOpen}
                preventScroll={true}
              >
                <AlertDialogContent class="bg-900 p-4 rounded-lg">
                  <AlertDialogTitle class="flex flex-row justify-center items-center text-2xl font-bold mb-2">
                    Injury Report
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <Table class="mt-2">
                      <TableHeader>
                        <TableRow class="bg-700 text-300">
                          <TableHead class="text-center font-semibold">Team</TableHead>
                          <TableHead class="text-center font-semibold">Player</TableHead>
                          <TableHead class="text-center font-semibold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <For each={[props.game.home_team, props.game.away_team]}>
                          {(team, _) => (
                            <For each={team.injuries}>
                              {(injury, _) => (
                                <TableRow>
                                  <TableCell class="text-center text-100">{team.name}</TableCell>
                                  <TableCell class="text-center text-100">
                                    {injury.player}
                                  </TableCell>
                                  <TableCell class="text-center text-100">
                                    {injury.status}
                                  </TableCell>
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
            </Show>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};
