
const FEATURES = [
    { name: 'W', longName: 'Wins' },
    { name: 'L', longName: 'Losses' },
    { name: 'W_PCT', longName: 'Win Percentage' },
    { name: 'FGM', longName: 'Field Goals Made' },
    { name: 'FGA', longName: 'Field Goals Attempted' },
    { name: 'FG_PCT', longName: 'Field Goal Percentage' },
    { name: 'FG3M', longName: '3-Point Field Goals Made' },
    { name: 'FG3A', longName: '3-Point Field Goals Attempted' },
    { name: 'FG3_PCT', longName: '3-Point Field Goal Percentage' },
    { name: 'FTM', longName: 'Free Throws Made' },
    { name: 'FTA', longName: 'Free Throws Attempted' },
    { name: 'FT_PCT', longName: 'Free Throw Percentage' },
    { name: 'OREB', longName: 'Offensive Rebounds' },
    { name: 'DREB', longName: 'Defensive Rebounds' },
    { name: 'REB', longName: 'Rebounds' },
    { name: 'AST', longName: 'Assists' },
    { name: 'TOV', longName: 'Turnovers' },
    { name: 'STL', longName: 'Steals' },
    { name: 'BLK', longName: 'Blocks' },
    { name: 'BLKA', longName: 'Blocked Shots' },
    { name: 'PF', longName: 'Personal Fouls' },
    { name: 'PFD', longName: 'Personal Fouls Drawn' },
    { name: 'PTS', longName: 'Points' },
    { name: 'PLUS_MINUS', longName: 'Team points scored - Team points allowed' },
];

const FEATURES_V2 = FEATURES.filter(i => i.name !== 'W' && i.name !== 'L' && i.name !== 'PLUS_MINUS');

export const MODEL_OPTIONS =
    [
        { key: 'v1', features: FEATURES, value: 'Money Line (V1)', description: 'The V1 Model is a simple model that that predicts winners of the games with no consideration of players or injuries. We use overall team statistics to predict the winner of the game up until this point in the season. This model has days where it is OVERLY confident in its predictions, which may be disingenuous.'},
        { key: 'v2', features: FEATURES_V2, value: 'Money Line (V2)', description: 'The V2 Model model differs from the V1 model in that it has a confidence value associated with each prediction. We also use 42 inputs instead of 48.'},
        { key: 'ou', features: FEATURES, value: 'Over Under', description: 'The Over Under model predicts the total score of the game. This model uses the same overall team statistics as the V1 & V2 model. '},
    ];

export const getBaseUrl = (useRemote?: boolean) => {
    const remoteUrl = 'https://api.accuribet.win';
    if (useRemote) return remoteUrl;
    return window.location.href.includes('localhost') ? 'http://localhost:8080' : remoteUrl;
};