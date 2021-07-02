import { CommandTrigger, MessageCommand } from "@/types/message.command";
import { Message } from "discord.js";

export default class PingCommand extends MessageCommand {
  name: string = 'ping';
  triggers: CommandTrigger[] = [ 'ping' ];
  help: string | string[] = 'The Ping Command.';
  
  constructor() {
    super();
  }

  run = async (msg: Message) => {
    let rep: Message = await msg.reply('*Computing Latency*');
    rep.edit(`Latency: ${rep.createdTimestamp - msg.createdTimestamp}ms`);

    return true;
  };
}