import { Client, MessageAttachment } from 'discord.js';
import { runRenderer } from './renderer';
import { createReadStream } from 'fs';
import { getImageInfo, uploadToImgur } from './util/imgur';

export async function runDiscordBot() {
  const client = new Client();

  const imgurClientId = process.env['IMGUR_CLIENT_ID'];
  const discordToken = process.env['DISCORD_BOT_TOKEN'];

  if (!imgurClientId)
    throw new Error('Imgur client ID needs to be provided in IMGUR_CLIENT_ID environment variable.');

  if (!discordToken)
    throw new Error('Discord token needs to be provided in DISCORD_BOT_TOKEN environment variable.');

  client.on('ready', () => {
    console.log(`Logged in as ${client.user!.tag}!`);
  });

  // Generate text gif from user input
  client.on('message', async message => {
    const rawInput = message.content;
    const fchar = rawInput.charAt(0);
    const input = message.content.substr(1);

    if (fchar === '*') {
      const reply = await message.channel.send('rendering your gif');

      // Create gif using input
      const id = await runRenderer(input);

      // Get the buffer from the file name, assuming that the file exists
      const stream = createReadStream(`output/${id}.mp4`);

      const emojis = '⏳⌛';
      let emojiIdx = 0;

      try {
        await reply.edit(`uploading your gif to imgur ${emojis[emojiIdx]}`);
        emojiIdx = (emojiIdx + 1) % emojis.length;

        let imgurResponse = await uploadToImgur(imgurClientId, stream);

        if (!imgurResponse.success)
          throw new Error('imgur upload failed:\n' + JSON.stringify(imgurResponse));

        const imgurId = imgurResponse.data.id;

        if (!imgurId)
          throw new Error('imgur response does not contain image id');

        // if our video is still pending when Imgur responds, wait a few
        // seconds before uploading to Discord to avoid glitches
        while (
          imgurResponse.data.type === 'video/mp4'
          && imgurResponse.data.processing.status === 'pending'
        ) {
          await new Promise(res => setTimeout(res, 1000));
          imgurResponse = await getImageInfo(imgurClientId, imgurResponse.data.id);

          void reply.edit(`uploading your gif to imgur ${emojis[emojiIdx]}`);
          emojiIdx = (emojiIdx + 1) % emojis.length;
        }

        await new Promise(res => setTimeout(res, 1000));

        await reply.edit(`https://imgur.com/${imgurId}`);
      } catch (error) {
        await reply.edit(
          'sorry, we couldn\'t upload the animation to imgur. here\'s the file, though.'
        );
        await reply.channel.send(new MessageAttachment(createReadStream(`output/${id}.mp4`)));

        console.warn('error uploading animation to imgur', error);
      }
    }
  });

  await client.login(discordToken);
}
