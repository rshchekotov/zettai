import { log } from "@/service/logger";
import { EventHandler } from "@/types/event.handler";

export default class ReadyHandler implements EventHandler {
  event: string = 'ready';
  
  run = (args: any[]) => {
    log.info('[Zettai-Bot/ReadyHandler] Bot Startup.');
  };
}