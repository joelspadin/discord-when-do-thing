import { CommandInteraction, SharedNameAndDescription } from 'discord.js';

export interface Command {
    data: SharedNameAndDescription;
    execute(interaction: CommandInteraction): Promise<void>;
}
