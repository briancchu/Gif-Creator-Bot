import { runDiscordBot } from './discord-bot';
import { runTelegramBot } from './telegram-bot';
import { loadFonts } from './util/font';

async function main() {
  console.info('starting gif creator bot');

  console.info('loading fonts');

  await loadFonts();

  console.info('running discord and telegram clients');

  await Promise.all([runDiscordBot(), runTelegramBot()]);

  console.warn('gif creator bot is exiting');
}

main().catch(console.error);
