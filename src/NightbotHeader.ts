import { NextApiRequest, NextApiResponse } from "next";

export type UserData = {
  name: string;
  displayName: string;
  provider: "twitch" | "youtube";
  providerId: number;
  userLevel: UserLevel;
};

export type ChannelData = {
  name: string;
  displayName: string;
  provider: "twitch" | "youtube";
  providerId: number;
};

export enum UserLevel {
  Admin = "admin",
  Owner = "owner",
  Moderator = "moderator",
  VIP = "twitch_vip",
  Regular = "regular",
  Subscriber = "subscriber",
  Everyone = "everyone",
}

export type MsgInfo = {
  type: "user";
  user: UserData;
  chan: ChannelData;
  send: (message: string) => Promise<void>;
};

export type TimerInfo = {
  type: "timer";
  chan: ChannelData;
  send: (message: string) => Promise<void>;
};

export type NightbotHeader = MsgInfo | TimerInfo;

export type NightbotCallback = (req: NextApiRequest, res: NextApiResponse<string>, nightbot: NightbotHeader) => Promise<void>;