

export interface Prediction {
  prediction_type: "win-loss" | "total-score"
  prediction: string
  game_id: string
  confidence: number | undefined
}

export type Predictions = Prediction[]
