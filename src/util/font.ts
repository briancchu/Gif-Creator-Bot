import { Font, RenderOptions } from 'opentype.js';
import { Shape, ShapePath } from 'three';

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

