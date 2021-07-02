enum LogType { DEBUG, TRACE, INFO, WARN, ERROR }

const logFormat = [
  { text: 'DEBUG', color: '\x1b[38;2;156;156;156m' },
  { text: 'TRACE', color: '\x1b[38;2;96;156;96m' },
  { text: 'INFO ', color: '\x1b[38;2;0;196;255m' },
  { text: 'WARN ', color: '\x1b[38;2;200;156;16m' },
  { text: 'ERROR', color: '\x1b[38;2;156;16;16m' },
];

class LoggerService {
  log(logType: LogType, message: unknown): void {
    console.log(this.prefix(logType) + message + '\x1b[0m');
  }

  debug(message: string): void {
    this.log(LogType.DEBUG, message);
  }

  trace(message: string): void {
    this.log(LogType.TRACE, message);
  }

  info(message: string): void {
    this.log(LogType.INFO, message);
  }

  warn(message: string): void {
    this.log(LogType.WARN, message);
  }

  error(message: string | Error): void {
    this.log(LogType.ERROR, message);
  }

  clear(): void {
    console.log('\x1b[2J\x1b[;H');
  }

  private now() {
    return new Date().toTimeString().split(' ')[0];
  }

  private prefix(logType: LogType): string {
    return `${logFormat[logType].color}[${logFormat[logType].text} @ ${this.now()}] `;
  }
}

export const log = new LoggerService();
