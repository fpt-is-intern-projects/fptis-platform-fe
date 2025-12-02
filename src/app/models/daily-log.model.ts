export type DailyLogResponse = {
  id: number;

  mainTask: string;
  result: string;

  workDate: string;
  startTime?: string;
  endTime?: string;

  location: string;
};

export type CreateDailyLogRequest = {
  mainTask: string;
  result: string;
  workDate: string;
  startTime?: string;
  endTime?: string;
  location: string;
};

export type UpdateDailyLogRequest = {
  mainTask: string;
  result: string;
};
