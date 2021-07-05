import { ButtonInteraction, Client, CommandInteraction, Guild } from 'discord.js';
import { createSchedule, handleScheduleReply, SCHEDULE_COMMAND } from './schedule';

export async function registerCommands(client: Client, guild?: Guild) {
    if (guild) {
        await client.guilds.cache.get(guild.id)?.commands.create(SCHEDULE_COMMAND);
    } else {
        await client.application?.commands.create(SCHEDULE_COMMAND);
    }
}

export async function handleCommand(client: Client, interaction: CommandInteraction) {
    if (interaction.commandName === 'schedule') {
        await createSchedule(client, interaction);
    }
}

export async function handleButton(client: Client, interaction: ButtonInteraction) {
    if (interaction.customID.startsWith('schedule.')) {
        await handleScheduleReply(client, interaction);
    }
}
