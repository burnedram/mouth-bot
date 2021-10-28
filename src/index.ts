import 'reflect-metadata'; // required for discordx

import path from 'path';
import { Client } from 'discordx';
import { Intents } from 'discord.js';

const BOT_TOKEN = 'lolno';

const client = new Client({
  prefix: '!',
  intents: [
    Intents.FLAGS.GUILDS,
    //Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES
  ],
  classes: [path.join(__dirname, 'commands', '**/*.{ts,js}')],
  botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
  silent: true
});

client.once('ready', async () => {
  await client.initApplicationCommands();
  await client.initApplicationPermissions();
  console.log('Discord bot started');
});

client.on('interactionCreate', (interaction) => {
  client.executeInteraction(interaction);
});

/*
We use command, might not be needed anymore?
client.on('messageCreate', (message) => {
  client.executeCommand(message);
});
*/

client.login(BOT_TOKEN);
