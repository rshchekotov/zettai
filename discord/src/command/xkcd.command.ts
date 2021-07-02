import { log } from "@/service/logger";
import { CommandTrigger, MessageCommand } from "@/types/message.command";
import { getComic, getRandom as getRandomComic } from "@/util/api/xkcd.util";
import { GENERIC_ERROR } from "@/util/discord.util";
import { Message, MessageEmbed } from "discord.js";

export default class PingCommand extends MessageCommand {
  name: string = 'xkcd';
  triggers: CommandTrigger[] = [ 'xkcd' ];
  help: string | string[] = 'The XKCD Command - without parameters it generates a random XKCD Comic. With parameters it tries to load the Comic corresponding to the specified ID.';
  
  constructor() {
    super();
  }

  run = async (msg: Message) => {
    if(msg.content === '') {
      let embed: MessageEmbed | null = await getRandomComic();
      if(embed) msg.channel.send(embed);
      else msg.channel.send(GENERIC_ERROR);
    } else {
      let num = parseInt(msg.content);
      if(!isNaN(num)) {
        let embed: MessageEmbed | null = await getComic(num);
        if(embed) msg.channel.send(embed);
        else msg.channel.send(GENERIC_ERROR);
      }
    }
    return true;
  };
}