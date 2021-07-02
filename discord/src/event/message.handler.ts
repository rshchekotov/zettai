import * as fs from 'fs/promises';

import { log } from "@/service/logger";
import { EventHandler } from "@/types/event.handler";
import { MessageCommand } from "@/types/message.command";
import { Message } from 'discord.js';
import { popWord } from '@/util/discord.util';

export default class MessageHandler implements EventHandler {
  event: string = 'message';
  commands: MessageCommand[] = [];

  constructor() {
    this.init();
  }

  async init() {
    let files = await fs.readdir(process.cwd() + '/src/command/');
    for(const file of files) {
      if(file.endsWith('.command.ts')) {
        const path = `@/command/${file.slice(0, -3)}`;
        const command: MessageCommand = new (await import(path)).default();
        await command.init('');
        this.commands.push(command);
      }
    }
  }

  run = async (msg: Message) => {
    for(const command of this.commands) {
      let kill = await command.check(Object.assign({}, msg));
      if(kill) {
        let tmpCmd: MessageCommand | undefined = kill;
        // ToDo: Return Trigger
        while(tmpCmd && tmpCmd.triggers.filter(e => typeof e === 'string').length > 0) {
          msg.content = popWord(msg.content)[1];
          tmpCmd = tmpCmd.parent;
        }
        await kill.run(msg);
        log.debug(`Executed ${kill.name}`);
        break;
      }
    }
  };
}