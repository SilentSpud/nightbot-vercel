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

// Returns an object with the headers sent by Nightbot's urlfetch
export const Nightbot = (req: Request): NightbotHeader => {
  const rawUser = req.headers.get("nightbot-user");
  const rawChan = req.headers.get("nightbot-channel");
  const rawResp = req.headers.get("nightbot-response-url");
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
  return user ? { type: "user", user, chan, send } : { type: "timer", chan, send };
};

export default Nightbot;
