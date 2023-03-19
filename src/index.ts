import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import { getCommands } from './commands';
import { Command } from './commands/command';
import { getInviteLink } from './invite';

dotenv.config();

class MyClient extends Client {
    commands = new Collection<string, Command>();
}

const client = new MyClient({
    intents: [GatewayIntentBits.Guilds],
});

client.commands = getCommands();

client.once(Events.ClientReady, (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    console.log('Invite bot with:');
    console.log(getInviteLink(c));
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`Missing command ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing the command', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing the command', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);
