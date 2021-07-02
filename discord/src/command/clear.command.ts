import { log } from "@/service/logger";
import { CommandTrigger, MessageCommand } from "@/types/message.command";
import { Message, TextChannel } from "discord.js";

export default class ClearCommand extends MessageCommand {
  name: string = 'clear';
  triggers: CommandTrigger[] = [ 'clear' ];
  help: string | string[] = 'The Clear Command.';
  
  constructor() {
    super();
  }

  run = async (msg: Message) => {
    const num = parseInt(msg.content);
    if(!isNaN(num)) {
      let fetched = await msg.channel.messages.fetch({ limit: num + 1 });
      await (<TextChannel> msg.channel).bulkDelete(fetched);
    } else {
      if(msg.content.replace(/^[ \n\t\s]+/, '').length === 0)
        await msg.channel.send('Expecting Number as Input.');
      else await msg.channel.send(`Invalid Input. '${msg.content}'`);
    }

    return true;
  };
}