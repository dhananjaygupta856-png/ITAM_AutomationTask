import fs from 'node:fs';
import path from 'node:path';

const logDirectory = path.resolve(process.cwd(), 'logs');
const logFile = path.join(logDirectory, 'automation-errors.txt');

function ensureLogDirectory(): void {
  fs.mkdirSync(logDirectory, { recursive: true });
}

export function logIssue(message: string): void {
  ensureLogDirectory();
  const line = `[${new Date().toISOString()}] ${message.replace(/\r?\n/g, ' ')}\n`;
  fs.appendFileSync(logFile, line, 'utf8');
}

export function clearIssueLog(): void {
  ensureLogDirectory();
  fs.writeFileSync(logFile, '', 'utf8');
}

export function getIssueLogPath(): string {
  return logFile;
}