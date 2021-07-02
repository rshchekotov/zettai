export interface EventHandler {
  event: string;
  run: (...args: any) => void;
}