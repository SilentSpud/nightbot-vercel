import { NextApiRequest, NextApiResponse } from "next";

type UserData = {
  name: string;
  displayName: string;
  provider: "twitch" | "youtube";
  providerId: number;
  userLevel: UserLevel;
};

type ChannelData = {
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

export type NightbotInfo = MsgInfo | TimerInfo;

export const Nightbot = async (req: NextApiRequest, res: NextApiResponse<string>, callback: (req: NextApiRequest, res: NextApiResponse<string>, nightbot: NightbotInfo) => Promise<void>) => {
  if (!req.headers["nightbot-channel"] || !req.headers["nightbot-response-url"]) return res.status(403).send("You aren't Nightbot!");
  const rawUser = req.headers["nightbot-user"];
  const rawChan = req.headers["nightbot-channel"];
  const rawResp = req.headers["nightbot-response-url"];
  if (!rawUser || !rawChan || !rawResp) throw new Error("You aren't Nightbot!");

  // If any of them are arrays, it's a list of headers. We only want the first one.
  const userData = Array.isArray(rawUser) ? rawUser[0] : rawUser;
  const chanData = Array.isArray(rawChan) ? rawChan[0] : rawChan;
  const respData = Array.isArray(rawResp) ? rawResp[0] : rawResp;

  // Process headers
  const user = userData.length ? ({ ...Object.fromEntries(new URLSearchParams(userData)) } as unknown as UserData) : null;
  const chan = { ...Object.fromEntries(new URLSearchParams(chanData)) } as unknown as ChannelData;

  // send function for multiple responses
  // format is https://api.nightbot.tv/1/channel/send/:key
  const respUrl = new URL(respData);
  if (respUrl.hostname !== "api.nightbot.tv" || respUrl.pathname.split("/").length !== 5) throw new Error("Invalid response URL");
  const send = async (message: string): Promise<void> => {
    fetch(`https://api.nightbot.tv/1/channel/send/${respUrl.pathname.split("/")[4]}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  };

  // If there's a user header, it's a chat command. If not, it's a timer.
  const infoBlock: NightbotInfo = user ? { type: "user", user, chan, send } : { type: "timer", chan, send };
  await callback(req, res, infoBlock);
};

export default Nightbot;
