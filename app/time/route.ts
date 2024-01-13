import Nightbot from "@/Nightbot";

const cmdRegex = /  "(.*?)": /

export async function GET(request: Request) {
  const nightbot = await Nightbot(request);
  if (nightbot === null) return new Response("You aren't Nightbot!", { status: 403 })

  const cmdList = await (await fetch("https://its.pupti.me/commands")).text();
  const cmds = cmdList.split("\n").filter((c) => c.startsWith(`  "`)).map((c) => (c.match(cmdRegex) as string[])[1]);
  // Pick a random command and send it
  const cmd = cmds[Math.floor(Math.random() * cmds.length)];
  return new Response(cmd);
};