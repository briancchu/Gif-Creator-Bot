import { runRenderer } from './renderer';
import { createReadStream } from 'fs';
import TelegramBot from 'telegraf';
import { parseOptions } from './util/options';

export async function runTelegramBot() {
  const telegramToken = process.env['TELEGRAM_BOT_TOKEN'];

  if (!telegramToken)
    throw new Error('Telegram token needs to be provided in TELEGRAM_BOT_TOKEN environment variable.');

  const bot = new TelegramBot(telegramToken);

  bot.command('gif', async (ctx) => {
    await ctx.replyWithChatAction('record_video');

    let input = ctx.message!.text!;

    // this input includes the slash command, /gif
    if (input.startsWith('/gif')) input = input.slice(4);
    // sometimes it's more verbose, /gif@textgifcreatorbot
    if (input.startsWith('@textgifcreatorbot')) input = input.slice(18);

    const { options, text } = parseOptions(input);

    try {
    // Create gif using input
      const id = await runRenderer(text, options);

      await ctx.replyWithChatAction('upload_video');

      // Get the buffer from the file name, assuming that the file exists
      const stream = createReadStream(`output/${id}.mp4`);

      await ctx.telegram.sendAnimation(
        ctx.chat!.id,
        { source: stream },
        { reply_to_message_id: ctx.message!.message_id });
    } catch (e) {
      await ctx.reply(`Error: \`${e.message}\``);
    }
  });

  await bot.launch();
}
