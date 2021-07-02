import { popWord } from '@/util/discord.util';
import { Message } from 'discord.js';
import * as fs from 'fs/promises';

export type CommandTrigger = string | RegExp | ((msg: Message) => boolean);

export abstract class MessageCommand {
  abstract name: string;
  abstract triggers: CommandTrigger[];
  parent?: MessageCommand = undefined;
  abstract help: string[] | string;
  abstract run: ((msg: Message) => Promise<boolean>);
  subcommands: MessageCommand[] = [];

  constructor() { }

  async init(domain: string) {
    domain += this.name + '/';
    try {
      let files = await fs.readdir(process.cwd() + '/src/command/' + domain);
      for(const file of files) {
        const path = `@/command/${domain}${file.slice(0, -3)}`;
        const command: MessageCommand = new (await import(path)).default(domain);
        command.parent = this;
        await command.init(domain);
        this.subcommands.push(command);
      }
    } catch {  }
  }

  async check(msg: Message) {
    if(msg.author.bot || msg.webhookID) return undefined;
    for(const trigger of this.triggers) {
      let match = false;
      if(typeof trigger === 'string') {
        if(!this.parent) {
          msg.content = msg.content.substr((<string> process.env.prefix).length);
        }

        const token = popWord(msg.content);
        match = token[0] === trigger;
        if(match) msg.content = token[1];
      } else if(trigger instanceof RegExp) {
        match = trigger.test(msg.content);
      } else {
        match = trigger(msg);
      }

      if(match) {
        let sub: MessageCommand[] = [];

        for(const command of this.subcommands) {
          const checked = await command.check(Object.assign({}, msg));
          if(checked) {
            sub.push(command);
          }
        }

        if(sub.length === 0) {
          return this;
        } else if(sub.length > 0) {
          return sub[0].check(Object.assign({}, msg)) || sub[0];
        }
      }
    }
    return undefined;
  }
}