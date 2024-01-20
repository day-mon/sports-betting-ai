import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GameWithPrediction } from '~/interface.ts';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formattedDateForUser = (time: number): string => {
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

export const getWinningTeam = (game: GameWithPrediction): string => {
  /**
   * Takes in a game and returns the winning team
   */
  if (game.home_team.score.points > game.away_team.score.points) {
    return `${game.home_team.city} ${game.home_team.name}`;
  }
  return `${game.away_team.city} ${game.away_team.name}`;

}

export const isPredictionCorrect = (game: GameWithPrediction): boolean => {
  /**
   * Takes in a game and returns whether the prediction was correct or not
   */
  if (!game.prediction) {
    return false;
  }
  if (game.prediction.prediction_type === 'win-loss') {
    return game.prediction.prediction === getWinningTeam(game);
  }
  return false;
}


export const isGameActuallyLive = (game: GameWithPrediction): boolean => {
  let status = game.status.toLowerCase();
  if (status.includes('q')) {
    return true;
  }

  if (status.includes('h')) {
    return true;
  }

  return status.includes('f');
}