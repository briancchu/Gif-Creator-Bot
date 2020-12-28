import { writeFileSync } from 'fs';
import { writeFile } from 'fs/promises';
import gl from 'gl';
import { GifWriter } from 'omggif';
import * as THREE from 'three';
import { FakeCanvas } from './util/canvas';

export async function runRenderer() {
// How many frames and how large shall the GIF be?
  const NUM_FRAMES = 200, WIDTH = 500, HEIGHT = 500;

  // create headless WebGL1 context
  const ctx = gl(500, 500);
  // create fake canvas to wrap that context
  const canvas = new FakeCanvas(ctx, WIDTH, HEIGHT);

  // Our scene, camera and renderer and a box to render
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(45, 1, 1, 2000);
  const renderer = new THREE.WebGLRenderer({
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

  const gif = new GifWriter(gifBuffer, WIDTH, HEIGHT, {
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

  await writeFile('./test.gif', gifBuffer.slice(0, gif.end()));
}

function convertRGBAto8bit(rgbaBuffer: Uint8Array, palette: number[]) {
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
