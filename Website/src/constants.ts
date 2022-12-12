export const MODEL_OPTIONS =
    [
        {key: 'v1', value: 'Money Line (V1)', description: 'The V1 Model is a simple model that that predicts winners of the games with no consideration of players or injuries. We use overall team statistics to predict the winner of the game up until this point in the season. This model has days where it is OVERLY confident in its predictions, which may be disingenuous.'},
        {key: 'v2', value: 'Money Line (V2)', description: 'The V2 Model model differs from the V1 model in that it has a confidence value associated with each prediction. We also use 43 features instead of 49.'},
        {key: 'ou', value: 'Over Under (Beta)', description: 'The Over Under model predicts the total score of the game. This model uses the same overall team statistics as the V1 & V2 model. '},
    ];
export const getBaseUrl = (useRemote?: boolean) => {
    const remoteUrl = 'https://api.accuribet.win';
    if (useRemote) return remoteUrl;
    return window.location.href.includes('localhost') ? 'http://localhost:8080' : remoteUrl;
};