import { Client, MessageAttachment } from 'discord.js';
import { runRenderer } from './renderer';
import { promises } from 'fs';
const { readFile } = promises;

export async function runBot() {
  const client = new Client();

  client.on('ready', () => {
    console.log(`Logged in as ${client.user!.tag}!`);
  });

  client.on('message', msg => {
    if (msg.content === 'ping') {

    }
  });

  client.on('message', async message => {
    // If the message is '!rip'

    if (message.content === '!rip') {
      // Create the attachment using MessageAttachment
      const attachment = new MessageAttachment('https://i.imgur.com/w3duR07.png');
      // Send the attachment in the message channel
      await message.channel.send(attachment);
    }
  });

  // Generate text gif from user input
  client.on('message', async message => {
    const rawInput = message.content;
    const fchar = rawInput.charAt(0);
    const input = message.content.substr(1);
    if (fchar === '*') {
      // Create gif with file name 'output.mp4' using input
      await runRenderer(input);
      // Get the buffer from the file name, assuming that the file exists
      const buffer = await readFile('output.mp4');
      const attachment = new MessageAttachment(buffer, 'output.mp4');
      message.channel.send(attachment);
    }
  });

  await client.login('NzkzMTU5NTgwODEyMDUwNDQy.X-oNbA.WANA_OqGxkw266IyFNRXyiG55cg');
}
