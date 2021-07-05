import { Client, Intents } from 'discord.js';
import * as dotenv from 'dotenv';
import { handleButton, handleCommand, registerCommands } from './commands';
import { getInviteLink } from './invite';

dotenv.config();

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on('ready', async () => {
    console.log(getInviteLink(client));

    await registerCommands(client);
});

client.on('message', async (message) => {
    if (!client.application?.owner) {
        await client.application?.fetch();
    }

    if (message.content === '!deploy' && message.guild && message.author.id === client.application?.owner?.id) {
        await registerCommands(client, message.guild);
    }
});

client.on('interaction', async (interaction) => {
    if (interaction.isCommand()) {
        await handleCommand(client, interaction);
    }

    if (interaction.isButton()) {
        await handleButton(client, interaction);
    }
});

client.login(process.env.TOKEN);
