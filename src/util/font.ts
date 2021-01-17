import { Font, RenderOptions, parse } from 'opentype.js';
import { Shape, ShapePath } from 'three';
import { promises } from 'fs';
import { join } from 'path';
import fetch from 'node-fetch';
const { readdir, readFile } = promises;

interface ShapeOptions extends RenderOptions {
  x?: number;
  y?: number;
}

export function textToShapes(text: string, font: Font, size: number, options?: ShapeOptions): Shape[] {
  // get an SVG-style path that represents the text we're drawing
  const path = font.getPath(text, options?.x ?? 0, options?.y ?? 0, size, options);

  // create a Three.js ShapePath so that this path can be converted into
  // Three.js Shapes
  const shape = new ShapePath();

  // used to figure out whether the shapes are clockwise or counterclockwise
  // https://stackoverflow.com/a/1165943/3508956
  let edgeSum = 0;

  // translate each SVG-style path command into Three.js
  for (const command of path.commands) {
    let firstPoint;

    switch (command.type) {
    case 'M':
      firstPoint = {
        x: command.x,
        y: command.y,
      };
      shape.moveTo(command.x, command.y); break;
    case 'L': {
      const currentPoint = shape.currentPath.currentPoint as THREE.Vec2;
      edgeSum += (command.x - currentPoint.x) * (command.y + currentPoint.y);
      shape.lineTo(command.x, command.y);
      break;
    }
    case 'C': {
      const currentPoint = shape.currentPath.currentPoint as THREE.Vec2;
      edgeSum += (command.x - currentPoint.x) * (command.y + currentPoint.y);
      shape.bezierCurveTo(
        command.x1, command.y1, command.x2, command.y2, command.x, command.y
      );
      break;
    }
    case 'Q': {
      const currentPoint = shape.currentPath.currentPoint as THREE.Vec2;
      edgeSum += (command.x - currentPoint.x) * (command.y + currentPoint.y);
      shape.quadraticCurveTo(
        command.x1, command.y1, command.x, command.y
      );
      break;
    }
    case 'Z': {
      if (firstPoint) {
        const currentPoint = shape.currentPath.currentPoint as THREE.Vec2;
        edgeSum += (firstPoint.x - currentPoint.x) * (firstPoint.y + currentPoint.y);
      }
      shape.currentPath.closePath();
      break;
    }
    }
  }

  return shape.toShapes(edgeSum < 0);
}

interface FontContainer {
  family: string;
  weight: number;
  style: FontStyle;

  /**
   * The local path or remote URI to load this font from.
   */
  file: string;

  /**
   * True if `file` is a remote URI and not a local file path.
   */
  remote: boolean;

  /**
   * The font object if this font was requested recently, or null if it has been
   * unloaded.
   */
  font: Font | null;

  /**
   * A handle to the timer which will unload this font when it's not being used
   * anymore.
   */
  timer: NodeJS.Timeout | null;
}

type FontStyle = 'regular' | 'italic';

/**
 * Number of seconds without use before a font should be unloaded.
 */
const FONT_TIMEOUT = 3600;

/**
 * A map of maps of maps. Maps names -> font families -> font weights -> font
 * styles -> fonts.
 */
const fontMap = new Map<string, Map<number, Map<FontStyle, FontContainer>>>();

function unloadFont(container: FontContainer) {
  container.font = null;
  container.timer = null;
}

async function loadFont(container: FontContainer): Promise<Font | null> {
  if (container.font)
    return container.font;

  try {
    const buf =
      container.remote
        ? await fetch(container.file)
          .then(res => res.blob())
          .then(blob => blob.arrayBuffer())
        : await readFile(container.file)
          .then(blob => blob.buffer);

    container.font = parse(buf);
    container.timer = setTimeout(() => unloadFont(container), FONT_TIMEOUT);
    return container.font;
  } catch (e) {
    console.warn(`failed to load font '${container.family}' from '${container.file}'`, e);
    return null;
  }
}

/**
 * Loads all of the fonts in the `src/fonts` folder and returns a mapping from
 * font family name to font object.
 */
export async function loadLocalFonts(): Promise<void> {
  const fontDirectory = 'src/fonts';

  console.info(`loading local fonts from '${fontDirectory}'`);

  for (const fontFilename of await readdir(fontDirectory)) {
    if (!fontFilename.endsWith('.ttf')) continue;

    const path = join(fontDirectory, fontFilename);

    const fontBuffer = await readFile(path);

    const font = parse(fontBuffer.buffer);

    const family = (font.names as any).preferredFamily ?? font.names.fontFamily;
    const familyCode = family['en'].toLowerCase().replace(/\s+/g, '');

    const weight = font.tables['os2']['usWeightClass'];
    const style =
      (font.tables['os2']['fsSelection'] & 1) === 1 ? 'italic' : 'regular';

    let familyMap = fontMap.get(familyCode);

    if (familyMap === undefined) {
      familyMap = new Map();
      fontMap.set(familyCode, familyMap);
    }

    let weightMap = familyMap.get(weight);

    if (weightMap === undefined) {
      weightMap = new Map();
      familyMap.set(weight, weightMap);
    }

    const container: FontContainer = {
      font: font,
      family: family,
      weight: weight,
      style: style,
      file: path,
      remote: false,
      timer: setTimeout(() => unloadFont(container), FONT_TIMEOUT),
    };

    weightMap.set(style, container);

    console.debug(`loaded local font ${font.names.fontFamily['en']} from ${path}`);
  }
}

interface GoogleFontFamily {
  kind: string;
  family: string;
  subsets: string[];
  variants: string[];
  version: string;
  lastModified: string;
  files: Record<string, string>
}

export async function loadRemoteFonts(apiKey: string): Promise<void> {
  console.info('loading remote fonts from google fonts');

  const response = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`);
  const families = await response.json().then(json => json.items) as GoogleFontFamily[];

  for (const family of families) {
    const familyCode = family.family.toLowerCase().replace(/\s+/g, '');

    let familyMap = fontMap.get(familyCode);

    if (familyMap === undefined) {
      familyMap = new Map();
      fontMap.set(familyCode, familyMap);
    }

    for (const [variant, url] of Object.entries(family.files)) {
      let weight = 500;
      let style: FontStyle = 'regular';

      // variants are written as either 'regular', 'italic', a three digit
      // number like '700', or a three digit number followed by italic like
      // '500italic'
      const variantNumeric = parseInt(variant.slice(0, 3), 10);
      const variantItalic = variant.endsWith('italic');
      if (variantNumeric) weight = variantNumeric;
      if (variantItalic) style = 'italic';

      let weightMap = familyMap.get(weight);

      if (weightMap === undefined) {
        weightMap = new Map();
        familyMap.set(weight, weightMap);
      }

      const container: FontContainer = {
        family: family.family,
        weight: weight,
        style: style,
        file: url,
        remote: true,
        font: null,
        timer: null,
      };

      weightMap.set(style, container);
    }

    console.debug(`loaded remote font '${family.family}' (${family.variants.length} variants)`);
  }
}

// disable require-await for now; this function will be made async when I add
// support for downloading fonts
// eslint-disable-next-line @typescript-eslint/require-await
export async function getFont(
  fontFamily: string,
  fontWeight = 500,
  fontStyle: 'regular' | 'italic' = 'regular'
): Promise<Font | null> {
  const family = fontMap.get(fontFamily.toLowerCase().replace(/\s+/g, ''));
  if (!family) return null;

  // get the styles by weight, unless the font doesn't have that weight
  const faces =
    family.get(fontWeight)
    // if the font doesn't have that, get the closest to the requested weight
    ?? family.get(Array.from(family.keys()).sort((a, b) => Math.abs(a - fontWeight) - Math.abs(b - fontWeight))[0]);
  if (!faces) return null;

  const container = faces.get(fontStyle) ?? faces.get('regular');
  if (!container) return null;

  return loadFont(container);
}

export function getRandomFont(): Promise<Font> {
  const families = Array.from(fontMap.values());
  const family = families[Math.floor(Math.random() * families.length)];
  const faces = Array.from(family.values());
  const face = faces[Math.floor(Math.random() * faces.length)];
  const fonts = Array.from(face.values());
  return loadFont(fonts[Math.floor(Math.random() * fonts.length)]);
}
