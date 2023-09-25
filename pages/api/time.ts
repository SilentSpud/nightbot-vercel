import Nightbot from "../../src/Nightbot";

const cmdRegex = /  "(.*?)": /

const handler = Nightbot(async (_req, res, nightbot) => {
  const cmdList = await (await fetch("https://its.pupti.me/commands")).text();
  const cmds = cmdList.split("\n").filter((c) => c.startsWith(`  "`)).map((c) => (c.match(cmdRegex) as string[])[1]);
  // Pick a random command and send it
  const cmd = cmds[Math.floor(Math.random() * cmds.length)];
  return res.status(200).send(cmd);
});