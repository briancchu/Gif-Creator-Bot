
import { EventTarget } from 'event-target-shim';

/**
 * This is a fake Canvas object that can be used to trick Three.js or similar
 * libraries into thinking they have a real <canvas> element to render to.
 */
export class FakeCanvas extends EventTarget implements OffscreenCanvas {
  private readonly context: WebGLRenderingContext;

  public width: number;

  public height: number;

  public constructor(context: WebGLRenderingContext, width: number, height: number) {
    super();

    this.width = width;
    this.height = height;
    this.context = context;
  }

  public getContext(contextId: '2d', options?: CanvasRenderingContext2DSettings): null;

  public getContext(contextId: 'bitmaprenderer', options?: ImageBitmapRenderingContextSettings): null;

  public getContext(contextId: 'webgl', options?: WebGLContextAttributes): WebGLRenderingContext | null;

  public getContext(contextId: 'webgl2', options?: WebGLContextAttributes): null;

  public getContext(contextId: OffscreenRenderingContextId, options?: any): null;

  public getContext(contextId: '2d' | 'bitmaprenderer' | 'webgl' | 'webgl2' | OffscreenRenderingContextId, options: any) {
    if (contextId === 'webgl')
      return this.context;
    else
      return null;
  }

  public convertToBlob(): never { throw new Error('not implemented'); }

  public transferToImageBitmap(): never {
    throw new Error('not implemented');
  }
}
