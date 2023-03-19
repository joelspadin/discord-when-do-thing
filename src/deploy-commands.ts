import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import { getCommands } from './commands';

dotenv.config();

const applicationId = process.env.APP_ID;
const token = process.env.TOKEN;

if (!token || !applicationId) {
    throw new Error('Create a .env file with APP_ID and TOKEN variables');
}

const rest = new REST({ version: '10' }).setToken(token);
const commands = getCommands().mapValues((c) => c.data);

(async () => {
    try {
        console.log(`Reloading ${commands.size} application (/) commands.`);

        await rest.put(Routes.applicationCommands(applicationId), { body: commands });

        console.log('Success.');
    } catch (error) {
        console.error(error);
    }
})();
