import gl from 'gl';
import ffmpeg from 'fluent-ffmpeg';
import * as THREE from 'three';
import { FakeCanvas } from './util/canvas';
import { PassThrough } from 'stream';

export async function runRenderer(): Promise<void> {
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

  // create a stream that will send the data we send to it into FFMpeg
  const stream = new PassThrough({ objectMode: false });

  // create an FFMpeg command that will process the stream as a 'raw video' in
  // RGBA format and produce a WebM-encoded video
  const command = ffmpeg(stream);
  command.inputFormat('rawvideo');
  command.inputOption('-pixel_format rgba');
  command.inputOption('-framerate 60');
  command.inputOption(`-video_size ${WIDTH}x${HEIGHT}`);
  command.output('test.mp4');

  // return a Promise that resolves when FFMpeg exits
  return new Promise((resolve, reject) => {
    command.on('end', () =>  resolve());
    command.on('error', (err) =>  reject(err));
    command.run();

    for (let frame = 0; frame < NUM_FRAMES; frame++) {
      box.rotation.y += Math.PI / 100;
      box.material.color.offsetHSL(0.01, 0, 0);

      renderer.render(scene, cam); // render a frame in memory

      // create a buffer to contain the pixels
      const pixels = new Uint8Array(WIDTH * HEIGHT * 4);

      // copy the pixels to the buffer
      ctx.readPixels(0, 0, WIDTH, HEIGHT, ctx.RGBA, ctx.UNSIGNED_BYTE, pixels);

      // send the buffer to FFMpeg
      stream.write(pixels);
    }

    stream.end();
  });
}
