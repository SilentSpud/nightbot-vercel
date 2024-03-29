import { DateTime } from "luxon";
import Nightbot from "@/Nightbot";
import { kv } from "@vercel/kv";
import moment from "moment";

export async function GET(request: Request) {
  let nightbot;
  try {
    nightbot = Nightbot(request);
  } catch (e: any) {
    return new Response(e.message, { status: 403 });
  }

  // get the last time this was called in this channel from redis
  const oldTime = await kv.get<number>(`${nightbot.chan.name}/timer`);

  // store the current time in its place
  const now = moment().valueOf();
  kv.set(`${nightbot.chan.name}/timer`, now);

  // if there was no old time, just return 0
  if (!oldTime) return new Response("00:00:00");

  // send the difference between the two timestamps
  const start = DateTime.fromMillis(oldTime);
  const diff = DateTime.now().diff(start, ["days", "hours", "minutes", "seconds"]);

  return new Response(diff.get("days") > 0 ? diff.toFormat("d:hh:mm:ss") : diff.toFormat("hh:mm:ss"));
};