import { Client, MessageAttachment } from 'discord.js';
import { writeFileSync } from 'fs';
import * as omggif from 'omggif';
import * as THREE from 'three';
import gl from 'gl';
import { EventTarget } from 'event-target-shim';

// const client = new Client();

// client.on('ready', () => {
//   console.log(`Logged in as ${client.user!.tag}!`);
// });

// client.on('message', msg => {
//   if (msg.content === 'ping') {

//   }
// });

// client.on('message', message => {
//   // If the message is '!rip'
//   if (message.content === '!rip') {
//     // Create the attachment using MessageAttachment
//     const attachment = new MessageAttachment('https://i.imgur.com/w3duR07.png');
//     // Send the attachment in the message channel
//     message.channel.send(attachment);
//   }
// });

// client.login('NzkzMTU5NTgwODEyMDUwNDQy.X-oNbA.WANA_OqGxkw266IyFNRXyiG55cg');

// How many frames and how large shall the GIF be?
const NUM_FRAMES = 200, WIDTH = 500, HEIGHT = 500;

const ctx = gl(500, 500);

class FakeCanvas extends EventTarget implements OffscreenCanvas {
  public width: number;

  public height: number;

  public constructor(width: number, height: number) {
    super();

    this.width = width;
    this.height = height;
  }

  /**
     * Returns an object that exposes an API for drawing on the OffscreenCanvas object. contextId specifies the desired API: "2d", "bitmaprenderer", "webgl", or "webgl2". options is handled by that API.
     *
     * This specification defines the "2d" context below, which is similar but distinct from the "2d" context that is created from a canvas element. The WebGL specifications define the "webgl" and "webgl2" contexts. [WEBGL]
     *
     * Returns null if the canvas has already been initialized with another context type (e.g., trying to get a "2d" context after getting a "webgl" context).
     */
  public getContext(contextId: '2d', options?: CanvasRenderingContext2DSettings): null;

  public getContext(contextId: 'bitmaprenderer', options?: ImageBitmapRenderingContextSettings): null;

  public getContext(contextId: 'webgl', options?: WebGLContextAttributes): WebGLRenderingContext | null;

  public getContext(contextId: 'webgl2', options?: WebGLContextAttributes): null;

  public getContext(contextId: OffscreenRenderingContextId, options?: any): null;

  public getContext(contextId: '2d' | 'bitmaprenderer' | 'webgl' | 'webgl2' | OffscreenRenderingContextId, options: any) {
    if (contextId === 'webgl')
      return ctx;
    else
      return null;
  }

  public convertToBlob(): never { throw new Error('not implemented'); }

  public transferToImageBitmap(): never {
    throw new Error('not implemented');
  }
}

const canvas = new FakeCanvas(WIDTH, HEIGHT);

// Our scene, camera and renderer and a box to render
const scene = new THREE.Scene(),
  cam = new THREE.PerspectiveCamera(45, 1, 1, 2000),
  renderer = new THREE.WebGLRenderer({
    canvas,
    context: ctx,
  });

cam.position.z = 100;

const box = new THREE.Mesh(
  new THREE.BoxGeometry(30, 30, 30),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);

scene.add(box);

// GIF has a color palette of 256 possible colours, we're fixing them to two.
// TODO: Generate the palette automatically from the scene
const palette = [0x000000, 0xff0000];

const gifBuffer = Buffer.alloc(WIDTH * HEIGHT * NUM_FRAMES); // holds the entire GIF output
const gif = new omggif.GifWriter(gifBuffer, WIDTH, HEIGHT, {
  palette: palette,
  loop: 0,
});

for (let frame = 0; frame < NUM_FRAMES; frame++) {
  box.rotation.y += Math.PI / 100;

  renderer.render(scene, cam); // render a frame in memory

  const pixels = new Uint8Array(WIDTH * HEIGHT * 4);

  ctx.readPixels(0, 0, WIDTH, HEIGHT, ctx.RGBA, ctx.UNSIGNED_BYTE, pixels);

  // for each frame of the GIF we'll have to convert the RGBA pixels into palette indices
  gif.addFrame(0, 0, WIDTH, WIDTH, convertRGBAto8bit(pixels, palette) as any);
}

writeFileSync('./test.gif', gifBuffer.slice(0, gif.end()));

function convertRGBAto8bit(rgbaBuffer: any, palette: number[]) {
  const outputBuffer = new Uint8Array(rgbaBuffer.length / 4);

  for (let i = 0; i < rgbaBuffer.length; i += 4) {
    const colour = (rgbaBuffer[i] << 16) + (rgbaBuffer[i + 1] << 8) + rgbaBuffer[i + 2];
    for (let p = 0; p < palette.length; p++) {
      if (colour === palette[p]) {
        outputBuffer[i / 4] = p;
        break;
      }
    }
  }

  return outputBuffer;
}
