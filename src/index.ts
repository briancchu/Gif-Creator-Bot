import { runDiscordBot } from './discord-bot';
import { runTelegramBot } from './telegram-bot';

runDiscordBot()
  .then(() => console.info('discord bot launched'))
  .catch(error => console.error('error while running bot', error));

runTelegramBot()
  .then(() => console.info('telegram bot launched'))
  .catch(error => console.error('error while running bot', error));

