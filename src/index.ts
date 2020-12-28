import { Client, MessageAttachment } from 'discord.js';

const client = new Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user!.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    
  }
});

client.on('message', msg => {
  if (msg.content === 'naomi') {
    msg.channel.send('smells', {  });
  }
});

client.on('message', message => {
  // If the message is '!rip'
  if (message.content === '!rip') {
    // Create the attachment using MessageAttachment
    const attachment = new MessageAttachment('https://i.imgur.com/w3duR07.png');
    // Send the attachment in the message channel
    message.channel.send(attachment);
  }
});

client.login('');

var fs = require('fs'),
    omggif = require('omggif'),
    THREE = require('three'),
    SoftwareRenderer = require('three-software-renderer');

// How many frames and how large shall the GIF be?
var NUM_FRAMES = 200, WIDTH = 500, HEIGHT = 500;

// Our scene, camera and renderer and a box to render
var scene    = new THREE.Scene(),
    cam      = new THREE.PerspectiveCamera(45, 1, 1, 2000),
    renderer = new SoftwareRenderer();

cam.position.z = 100;
renderer.setSize(WIDTH, HEIGHT);

var box = new THREE.Mesh(
  new THREE.BoxGeometry(30, 30, 30),
  new THREE.MeshBasicMaterial({color: 0xff0000})
);

scene.add(box);

// GIF has a color palette of 256 possible colours, we're fixing them to two.
// TODO: Generate the palette automatically from the scene
var palette = [0x000000, 0xff0000];

var gifBuffer = new Buffer(WIDTH * HEIGHT * NUM_FRAMES); // holds the entire GIF output
var gif = new omggif.GifWriter(gifBuffer, WIDTH, HEIGHT, {palette: palette, loop: 0});

for(var frame=0; frame<NUM_FRAMES; frame++) {
  box.rotation.y += Math.PI / 100;

  var pixels = renderer.render(scene, cam); // render a frame in memory
  // for each frame of the GIF we'll have to convert the RGBA pixels into palette indices
  gif.addFrame(0, 0, pixels.width, pixels.height, convertRGBAto8bit(pixels.data, palette));
}
fs.writeFileSync('./test.gif', gifBuffer.slice(0, gif.end()));

function convertRGBAto8bit(rgbaBuffer, palette) {
  var outputBuffer = new Uint8Array(rgbaBuffer.length / 4);

  for(var i=0; i<rgbaBuffer.length; i+=4) {
    var colour = (rgbaBuffer[i] << 16) + (rgbaBuffer[i+1] << 8) + rgbaBuffer[i+2];
    for(var p=0; p<palette.length; p++) {
      if(colour == palette[p]) {
        outputBuffer[i/4] = p;
        break;
      }
    }
  }

  return outputBuffer;
}
