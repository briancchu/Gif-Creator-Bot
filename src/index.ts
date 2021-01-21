import { runDiscordBot } from './discord-bot';
import { runTelegramBot } from './telegram-bot';
import { loadLocalFonts, loadRemoteFonts } from './util/font';

async function main() {
  console.info('starting gif creator bot');

  console.info('loading fonts');

  await loadLocalFonts();

  if (process.env.GOOGLE_FONTS_API_KEY)
    await loadRemoteFonts(process.env.GOOGLE_FONTS_API_KEY);
  else
    console.info('google fonts api key not detected; not retrieving remote fonts');

  console.info('running discord and telegram clients');

  await Promise.all([runDiscordBot(), runTelegramBot()]);
}

main().catch(console.error);
