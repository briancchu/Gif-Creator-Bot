import { Client, MessageAttachment } from 'discord.js';

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

  await client.login('NzkzMTU5NTgwODEyMDUwNDQy.X-oNbA.WANA_OqGxkw266IyFNRXyiG55cg');
}
