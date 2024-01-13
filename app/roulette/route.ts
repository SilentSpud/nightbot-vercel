import Nightbot from "@/Nightbot";
import { kv } from "@vercel/kv";

type UserInfo = { deaths: number; lives: number; maxStreak?: number };

export async function GET(request: Request) {
  const nightbot = await Nightbot(request);
  if (nightbot === null) return new Response("You aren't Nightbot!", { status: 403 })

  // make sure this is a user command
  if (nightbot.type == "timer") return new Response("", { status: 403 });

  // get the roulette info
  const user = (await kv.get<UserInfo>(`${nightbot.user.name}/roulette`)) ?? { deaths: 0, lives: 0, maxStreak: 0 };
  const hit = Math.floor(Math.random() * 6) == 0;

  if (hit) {
    user.lives = 0;
    user.deaths++;
    kv.set(`${nightbot.user.name}/roulette`, user);
    return new Response(`Bang!${user.deaths > 1 ? ` You've died ${user.deaths} times` : ""}`);
  } else {
    user.lives++;
    if (user.maxStreak === undefined) user.maxStreak = 0;
    let isStreak = false;
    if (user.lives > user.maxStreak) {
      user.maxStreak = user.lives;
      isStreak = true;
    }
    kv.set(`${nightbot.user.name}/roulette`, user);
    return new Response(`Click${user.lives > 1 ? ` x${user.lives} ${isStreak ? "" : ` (Record: ${user.maxStreak})`}` : ""}`);
  }
};