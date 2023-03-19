import { Collection } from 'discord.js';
import { Command } from './commands/command';
import schedule from './commands/schedule';

export function getCommands() {
    const commands = new Collection<string, Command>();

    commands.set(schedule.data.name, schedule);

    return commands;
}
