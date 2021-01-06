import gl from 'gl';
import ffmpeg from 'fluent-ffmpeg';
import * as THREE from 'three';
import { FakeCanvas } from './util/canvas';
import { PassThrough } from 'stream';
import { promises } from 'fs';
import { parse } from 'opentype.js';
import { textToShapes } from './util/font';
const { readFile } = promises;

export async function runRenderer(input: string): Promise<void> {
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

  cam.position.z = 300;

  const fontData = await readFile('src/fonts/Inter-Bold.ttf');
  const font = parse(fontData.buffer);

  // returns a string separated onto multiple lines based on max width
  function wrapText(text: string, fontSize: number, maxWidth: number) {
    const lines = [];

    let currentLine = '';
    let currentWord = '';

    for (const character of text) {
      if (character === '\n') {
        lines.push(currentLine);
        currentLine = '';
        currentWord = '';
        continue;
      }

      // if this character is whitespace, our word has ended,
      // consider breaking the line
      if (/\s/.test(character)) {
        const futureLine = currentLine + currentWord;

        // if adding the word to this line would fit, then add it, otherwise,
        // add it to the current line and keep the whitespace
        if (font.getAdvanceWidth(futureLine, fontSize) < maxWidth) {
          currentLine = futureLine + character;
        } else {
          lines.push(currentLine);
          currentLine = currentWord + character;
        }

        currentWord = '';
      } else {
        currentWord += character;
      }
    }

    if (!/^\s*$/.test(currentWord)) currentLine += currentWord;
    if (currentLine !== '') lines.push(currentLine);

    return lines;
  }

  // calculate the number of units covered by the viewport horizontally at the
  // given distance from the camera
  const viewportDistance = cam.position.length();
  // horizontal FoV
  const viewportFov = cam.fov * cam.aspect;
  const viewportWidth = Math.tan(viewportFov / 2 * Math.PI / 180) * viewportDistance * 2;
  // add 5% padding on each side
  const maxWidth = viewportWidth * 0.9;

  const fontSize = 30;

  const textLines = wrapText(input, fontSize, maxWidth);

  const textShapes = textLines.flatMap((line, index) => {
    const lineWidth = font.getAdvanceWidth(line, fontSize);
    const lineShapes = textToShapes(line, font, fontSize, {
      x: -lineWidth / 2,
      y: fontSize * index,
    });

    return lineShapes;
  });

  const textGeometry = new THREE.ExtrudeBufferGeometry(textShapes, {
    curveSegments: 12,
    bevelEnabled: false,
    depth: 10,
  });

  textGeometry.computeBoundingBox();
  textGeometry.center();

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
  dirLight.position.set(0, 0, 1).normalize();
  scene.add(dirLight);

  const pointLight = new THREE.PointLight(0xffffff, 1.5);
  pointLight.position.set(0, 100, 90);
  scene.add(pointLight);

  const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
  const mesh = new THREE.Mesh(textGeometry, material);

  scene.add(mesh);

  // create a stream that will send the data we send to it into FFMpeg
  const stream = new PassThrough({ objectMode: false });

  // create an FFMpeg command that will process the stream as a 'raw video' in
  // RGBA format and produce a WebM-encoded video
  const command = ffmpeg(stream);
  command.inputFormat('rawvideo');
  command.inputOption('-pixel_format rgba');
  command.inputOption('-framerate 60');
  command.inputOption(`-video_size ${WIDTH}x${HEIGHT}`);
  command.outputOption('-c:v libx264');
  command.outputOption('-crf 10');
  // command.outputOption('-b:v 1M');
  command.outputOption('-pix_fmt yuv420p');
  command.output('output.mp4');

  // return a Promise that resolves when FFMpeg exits
  return new Promise((resolve, reject) => {
    command.on('end', () => resolve());
    command.on('error', (err) => reject(err));
    command.run();

    for (let frame = 0; frame < NUM_FRAMES; frame++) {
      mesh.rotation.y += Math.PI / 100;
      mesh.material.color.offsetHSL(0.01, 0, 0);

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
