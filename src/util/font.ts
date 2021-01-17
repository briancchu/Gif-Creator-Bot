import { Font, RenderOptions, parse } from 'opentype.js';
import { Shape, ShapePath } from 'three';
import { promises } from 'fs';
import { join } from 'path';
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

  // translate each SVG-style path command into Three.js
  for (const command of path.commands) {
    switch (command.type) {
    case 'M': shape.moveTo(command.x, command.y); break;
    case 'L': shape.lineTo(command.x, command.y); break;
    case 'C': shape.bezierCurveTo(
      command.x1, command.y1, command.x2, command.y2, command.x, command.y
    ); break;
    case 'Q': shape.quadraticCurveTo(
      command.x1, command.y1, command.x, command.y
    ); break;
    case 'Z': shape.currentPath.closePath(); break;
    }
  }

  return shape.toShapes(true);
}

type FontStyle = 'regular' | 'italic';

/**
 * A map of maps of maps. Maps names -> font families -> font weights -> font
 * styles -> fonts.
 */
const fontMap = new Map<string, Map<number, Map<FontStyle, Font>>>();

/**
 * Loads all of the fonts in the `src/fonts` folder and returns a mapping from
 * font family name to font object.
 */
export async function loadLocalFonts(): Promise<void> {
  const fontDirectory = 'src/fonts';

  for (const fontFilename of await readdir(fontDirectory)) {
    if (!fontFilename.endsWith('.ttf')) continue;

    const fontPath = join(fontDirectory, fontFilename);

    console.log('font found: ' + fontPath);

    const fontBuffer = await readFile(fontPath);

    const font = parse(fontBuffer.buffer);

    let fontFamily = (font.names as any).preferredFamily ?? font.names.fontFamily;
    fontFamily = fontFamily['en'].toLowerCase().replace(' ', '');

    const fontWeight = font.tables['os2']['usWeightClass'];
    const fontStyle =
      (font.tables['os2']['fsSelection'] & 1) === 1 ? 'italic' : 'regular';

    let familyMap = fontMap.get(fontFamily);

    if (familyMap === undefined) {
      familyMap = new Map();
      fontMap.set(fontFamily, familyMap);
    }

    let weightMap = familyMap.get(fontWeight);

    if (weightMap === undefined) {
      weightMap = new Map();
      familyMap.set(fontWeight, weightMap);
    }

    weightMap.set(fontStyle, font);
  }
}

export async function loadRemoteFonts(apiKey: string): Promise<void> {
  const response = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`);
  const faces = await response.json();
}

// disable require-await for now; this function will be made async when I add
// support for downloading fonts
// eslint-disable-next-line @typescript-eslint/require-await
export async function getFont(
  fontFamily: string,
  fontWeight = 500,
  fontStyle: 'regular' | 'italic' = 'regular'
): Promise<Font | null> {
  const family = fontMap.get(fontFamily.toLowerCase().replace(' ', ''));
  if (!family) return null;

  // get the styles by weight, unless the font doesn't have that weight
  const faces =
    family.get(fontWeight)
    // if the font doesn't have that, get the closest to the requested weight
    ?? family.get(Array.from(family.keys()).sort((a, b) => Math.abs(a - fontWeight) - Math.abs(b - fontWeight))[0]);
  if (!faces) return null;

  const font = faces.get(fontStyle) ?? faces.get('regular');
  if (!font) return null;

  return font;
}

export function getRandomFont(): Font {
  const families = Array.from(fontMap.values());
  const family = families[Math.floor(Math.random() * families.length)];
  const faces = Array.from(family.values());
  const face = faces[Math.floor(Math.random() * faces.length)];
  const fonts = Array.from(face.values());
  return fonts[Math.floor(Math.random() * fonts.length)];
}
