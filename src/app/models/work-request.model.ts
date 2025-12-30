import { ActionButtonResponse } from './proccess.model';

export type MentorReviewRequest = {
  taskId: string;
  approved: boolean;
  comment: string;
};

export type WorkRequestRequest = {
  workRequestType: 'LEAVE' | 'REMOTE';
  reason: string;
  fromDate: string;
  toDate: string;
};

export type MentorTaskResponse = {
  taskId: string;
  taskCreateTime: string;

  requestId: number;
  type: 'LEAVE' | 'REMOTE';
  fromDate: string;
  toDate: string;
  reason: string;

  internEmail: string;

  totalAttendance: number;
  onTimeRatio: number;
  earlyCheckoutRatio: number;
  systemNote: string;

  buttons: ActionButtonResponse[];
};

export type WorkRequestResponse = {
  id: number;
  workRequestType: 'LEAVE' | 'REMOTE';
  workRequestStatus: 'PENDING_SYSTEM' | 'PENDING_MENTOR' | 'APPROVED' | 'REJECTED';
  fromDate: string;
  toDate: string;
  reason: string;

  approverName: string;
  adminNote: string;

  totalAttendance: number;
  onTimeRatio: number;
  earlyCheckoutRatio: number;
};
