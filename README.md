# When Do Thing?

A Discord bot for asking people when to do the thing.

Use the `/schedule` command to create a schedule. People can click which days of
the week they are available, and the bot will update the message to show everyone's
availability.

I wrote it for raiding in Final Fantasy XIV, so it makes some assumptions like
weeks starting on Tuesday and eight people being a full group. It's not very
flexible. Fork it and fix it if that doesn't work for you.

## Setup

1. Clone this repo.
2. Make a Discord bot.
3. Create a `.env` file at the root of the repo. Put your bot's application ID and token in the file:

   ```ini
   APP_ID=...
   TOKEN=...
   ```

4. Run these commands to install dependencies and start the bot:

   ```bash
   npm install
   npm run compile
   npm start
   ```

5. The bot will print its invite link. Use it to invite it to your server.
6. Type `!deploy` somewhere the bot can read it, or wait about an hour for the command to register.

## Configuration

The `.env` file supports these variables.

| Name           | Description                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| `TOKEN`        | Your bot's token                                                                                           |
| `RAID_SIZE`    | The number of people in your group. Defaults to 8.                                                         |
| `ALMOST_EMOJI` | An emoji to add to a button when you're one away from a full group, for that one person who never responds |
