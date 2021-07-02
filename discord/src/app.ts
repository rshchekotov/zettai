import { Client } from 'discord.js';
import * as fs from 'fs/promises';

import { getToken, initConfig } from './service/config';
import { log } from './service/logger';
import { EventHandler } from './types/event.handler';

const global: {[key: string]: any} = {};

class Bot extends Client {
  async boot() {
    initConfig();
    global.client = this;
    
    /* Event Registry */
    let files = await fs.readdir(process.cwd() + '/src/event/');
    for(const file of files) {
      const path = `@/event/${file.slice(0, -3)}`;
      const handler: EventHandler = new (await import(path)).default();
      this.on(handler.event, handler.run);
    }
  
    this.login(getToken());
  }
}

new Bot().boot();

export { global };