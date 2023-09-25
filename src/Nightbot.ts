import { NextApiRequest, NextApiResponse } from "next";
import { ChannelData, NightbotCallback, NightbotHeader, UserData } from "./NightbotHeader";

export const NightbotHandler = async (req: NextApiRequest, res: NextApiResponse<string>, callback: NightbotCallback) => {
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
  const infoBlock: NightbotHeader = user ? { type: "user", user, chan, send } : { type: "timer", chan, send };
  await callback(req, res, infoBlock);
};
export const Nightbot = async (callback: NightbotCallback) => {
  return (req: NextApiRequest, res: NextApiResponse<string>) => NightbotHandler(req, res, callback);
};

export default Nightbot;
