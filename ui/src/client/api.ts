import axios, { AxiosInstance } from 'axios';
import { Game } from '~/interface.ts';


interface DateResponse {
 dates: string[];
 model_name: string;
}

export class AccuribetAPI {
 private client: AxiosInstance;
 private static instance: AccuribetAPI;



 static getInstance(): AccuribetAPI {
  if (!AccuribetAPI.instance) {
   AccuribetAPI.instance = new AccuribetAPI();
  }
  return AccuribetAPI.instance;
 }
 private constructor() {
  this.client = axios.create({
   baseURL: import.meta.env.VITE_API_BASE_URL as string,
    validateStatus: (status: number) => {
      return status < 500;
    }
  })

 }


 async predict(
   model: string
 ) {
    const res = await this.client.get(`/model/predict/${model}`);
    return res.data;
 }

 async dailyGames(
   withOdds: boolean = false
 ): Promise<Game[]> {
    const res = await this.client.get<Game[]>(`/games/daily?with_odds=${withOdds}`);
    return res.data;
 }

 async listModels(): Promise<string[]> {
    const res = await this.client.get<string[]>('/model/list');
    return res.data;
 }

 async modelAccuracy(
    modelName: string
  ): Promise<number> {
      const res = await this.client.get<number>(`/model/accuracy/${modelName}`);
      return res.data;
  }


 async getDates(): Promise<DateResponse[]> {
    const res = await this.client.get<DateResponse[]>('/model/history/dates');
    return res.data;
 }



}