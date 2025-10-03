import { toBlob } from '../utils/canvas';

describe('Canvas Utility Functions', () => {
  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    context = canvas.getContext('2d')!;
  });

  test('toBlob should convert canvas to Blob', async () => {
    // Draw something on the canvas
    context.fillStyle = 'red';
    context.fillRect(0, 0, 100, 100);

    const blob = await toBlob(canvas, 'image/jpeg', 0.8);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/jpeg');
  });

  test('toBlob should handle invalid quality', async () => {
    const blob = await toBlob(canvas, 'image/jpeg', 2);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/jpeg');
  });

  test('toBlob should return null for unsupported formats', async () => {
    const blob = await toBlob(canvas, 'image/unsupported', 0.8);
    expect(blob).toBeNull();
  });
});