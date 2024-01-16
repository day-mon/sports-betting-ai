import { Component } from "solid-js";
import { Game } from "~/interface";

import { FiCalendar, FiClock } from 'solid-icons/fi';
import { IoLocationOutline } from 'solid-icons/io';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";

import homeLogo from "~/assets/teams/lal.svg";
import awayLogo from "~/assets/teams/gsw.svg";

interface IDisplayCard {
    game: Game;
}

export const DisplayCard: Component<IDisplayCard> = (props: IDisplayCard) => {
  return (
    <>
      <Card class="w-full max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <CardHeader class="flex items-center justify-between p-6">
          <div class="flex items-center">
            <img
              alt="Team 1 Logo"
              class="mr-2 rounded-full"
              height={50}
              src={homeLogo}
              style={{"aspect-ratio": "50/50", "object-fit": "cover"}}
              width={50}
            />
            <div>
              <CardTitle class="text-lg font-bold text-white">
              {`${props.game.home_team.name}`}
              </CardTitle>
              <p class="text-sm text-gray-400">30-15</p>
            </div>
          </div>
          <div class="flex items-center">
            <div>
              <CardTitle class="text-lg font-bold text-white">
              {`${props.game.away_team.name}`}
              </CardTitle>
              <p class="text-sm text-gray-400">35-10</p>
            </div>
            <img
              alt="Team 2 Logo"
              class="ml-2 rounded-full"
              height={50}
              src={awayLogo}
              style={{"aspect-ratio": "50/50", "object-fit": "cover"}}
              width={50}
            />
            <span class="ml-2 inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Projected Winner
            </span>
          </div>
        </CardHeader>
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm text-gray-400">
            <FiCalendar class="mr-1 h-4 w-4 inline-block" />
              January 15, 2024
            </div>
            <div class="text-sm text-gray-400">
            <FiClock class="mr-1 h-4 w-4 inline-block" />
              7:00 PM
            </div>
          </div>
          <div class="mb-4">
            <IoLocationOutline class="mr-1 h-4 w-4 inline-block text-gray-400" />
            <span class="text-sm text-gray-400">Staples Center, Los Angeles, CA</span>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="border rounded-lg p-2">
              <h3 class="text-sm font-bold mb-1 text-white">Key Player - {`${props.game.home_team.name}`}</h3>
              <p class="text-xs text-gray-400">{`${props.game.home_team.leader.name}`}</p>
              <p class="text-xs text-gray-400">Points: {`${props.game.home_team.leader.points}`}</p>
              <p class="text-xs text-gray-400">Rebounds: {`${props.game.home_team.leader.rebounds}`}</p>
              <p class="text-xs text-gray-400">Assists: {`${props.game.home_team.leader.assists}`}</p>
            </div>
            <div class="border rounded-lg p-2">
              <h3 class="text-sm font-bold mb-1 text-white">Key Player - {`${props.game.away_team.name}`}</h3>
              <p class="text-xs text-gray-400">{`${props.game.away_team.leader.name}`}</p>
              <p class="text-xs text-gray-400">Points: {`${props.game.away_team.leader.points}`}</p>
              <p class="text-xs text-gray-400">Rebounds: {`${props.game.away_team.leader.rebounds}`}</p>
              <p class="text-xs text-gray-400">Assists: {`${props.game.away_team.leader.assists}`}</p>
            </div>
          </div>
          <div class="mb-4">
            <h3 class="text-sm font-bold mb-1 text-white">Current Score</h3>
            <div class="text-center bg-gray-700 p-4 rounded-lg">
              <div class="flex items-center justify-center mb-2">
                <span class="text-red-500 animate-pulse mr-2">•</span>
                <span class="text-white font-bold">Live</span>
              </div>
              <p class="text-2xl text-white font-bold mb-2">Lakers: 95 - Warriors: 98</p>
              <p class="text-sm text-gray-400">4th Quarter, 2:30 remaining</p>
            </div>
          </div>
          <div class="mb-4">
            <h3 class="text-sm font-bold mb-1 text-white">Score Breakdown</h3>
            <Tabs class="mb-4" defaultValue="first">
              <TabsList class="flex justify-between border-b border-gray-700">
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
            {/* <XIcon class="mr-1 h-4 w-4 inline-block text-yellow-500" />
            <Link class="text-yellow-500 underline" href="#">
              View Injury Report
            </Link> */}
          </div>
          <div class="text-center">
            <Button class="w-full">View Game Details</Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}