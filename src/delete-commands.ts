import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import { parseArgs } from 'node:util';

dotenv.config();

const applicationId = process.env.APP_ID;
const token = process.env.TOKEN;

if (!token || !applicationId) {
    throw new Error('Create a .env file with APP_ID and TOKEN variables');
}

const { values } = parseArgs({
    options: {
        command: {
            type: 'string',
            short: 'c',
        },
        guild: {
            type: 'string',
            short: 'g',
        },
    },
});

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        if (values.guild) {
            if (values.command) {
                console.log(`Deleting command ${values.command} from guild ${values.guild}.`);
                await rest.delete(Routes.applicationGuildCommand(applicationId, values.guild, values.command));
            } else {
                console.log(`Deleting all application (/) commands from guild ${values.guild}.`);
                await rest.put(Routes.applicationGuildCommands(applicationId, values.guild), { body: [] });
            }
        } else {
            if (values.command) {
                console.log(`Deleting command ${values.command}.`);
                await rest.delete(Routes.applicationCommand(applicationId, values.command));
            } else {
                console.log('Deleting all application (/) commands.');
                await rest.put(Routes.applicationCommands(applicationId), { body: [] });
            }
        }

        console.log('Success.');
    } catch (error) {
        console.log(error);
    }
})();
