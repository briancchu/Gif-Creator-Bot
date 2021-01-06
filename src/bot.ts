import { Client, MessageAttachment } from 'discord.js';
import { runRenderer } from './renderer';
import { promises, createReadStream } from 'fs';
import { uploadToImgur } from './util/imgur';
const { readFile } = promises;

export async function runBot() {
  const client = new Client();

  const imgurClientId = process.env['IMGUR_CLIENT_ID'];
  const discordToken = process.env['DISCORD_TOKEN'];

  if (!imgurClientId)
    throw new Error('Imgur client ID needs to be provided in IMGUR_CLIENT_ID environment variable.');

  if (!discordToken)
    throw new Error('Discord token needs to be provided in DISCORD_TOKEN environemtn variable.');

  client.on('ready', () => {
    console.log(`Logged in as ${client.user!.tag}!`);
  });

  // Generate text gif from user input
  client.on('message', async message => {
    const rawInput = message.content;
    const fchar = rawInput.charAt(0);
    const input = message.content.substr(1);

    if (fchar === '*') {
      // Create gif using input
      const id = await runRenderer(input);

      // Get the buffer from the file name, assuming that the file exists
      const stream = createReadStream(`output/${id}.mp4`);

      try {
        const response = await uploadToImgur(imgurClientId, stream);

        if (!response.success)
          throw new Error('imgur upload failed:\n' + JSON.stringify(response));

        const imgurId = response.data.id;

        if (!imgurId)
          throw new Error('imgur response does not contain image id');

        // if our video is still pending when Imgur responds, wait a few
        // seconds before uploading to Discord to avoid glitches
        if (response.data.type === 'video/mp4') {
          if (response.data.processing.status === 'pending') {
            await new Promise(res => setTimeout(res, 2000));
          }
        }

        await message.channel.send(`https://imgur.com/${imgurId}`);
      } catch (error) {
        await message.channel.send(
          'Sorry, we couldn\'t upload the animation to Imgur. Here\'s the file, though.',
          new MessageAttachment(stream)
        );

        console.warn('error uploading animation to imgur', error);
      }
    }
  });

  await client.login(discordToken);
}
