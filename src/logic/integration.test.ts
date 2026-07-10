import { describe, it, expect, vi } from 'vitest';
import { parse } from './parser';
import { DrawCanvas } from './canvas';
import { DrawEngine } from './drawEngine';

// Requirements: 2.4, 3.4, 4.2, 4.4, 5.3

// ─── Globe script from design.md §"Example Usage — Rainbow Globe" ────────────

const GLOBE_SCRIPT = `
SETXY 400 300
COLOR #8b00ff  WIDTH 6  CIRCLE 195
COLOR #4b0082  WIDTH 6  CIRCLE 200
COLOR #0000ff  WIDTH 6  CIRCLE 205
COLOR #00aa00  WIDTH 6  CIRCLE 210
COLOR #ffff00  WIDTH 6  CIRCLE 215
COLOR #ff7700  WIDTH 6  CIRCLE 220
COLOR #ff0000  WIDTH 6  CIRCLE 225

SETXY 400 300
CLIPCIRCLE 400 300 185

GRADIENT linear [0 #ff0000  0.17 #ff7700  0.33 #ffff00  0.5 #00aa00  0.67 #0000ff  0.83 #4b0082  1 #8b00ff]
WIDTH 2
SETXY 400 160  ELLIPSE 185 15
SETXY 400 193  ELLIPSE 185 35
SETXY 400 230  ELLIPSE 185 60
SETXY 400 270  ELLIPSE 185 80
SETXY 400 310  ELLIPSE 185 80
SETXY 400 350  ELLIPSE 185 60
SETXY 400 387  ELLIPSE 185 35
SETXY 400 420  ELLIPSE 185 15

GRADIENT radial [0 #00aa00  0.33 #ffff00  0.5 #ff7700  0.67 #ff0000  0.83 #4b0082  1 #8b00ff]
WIDTH 2
SETXY 400 300  ELLIPSEARC 185 185 -90 90
SETXY 400 300  ELLIPSEARC 150 185 -90 90
SETXY 400 300  ELLIPSEARC 110 185 -90 90
SETXY 400 300  ELLIPSEARC 70  185 -90 90
SETXY 400 300  ELLIPSEARC 30  185 -90 90
SETXY 400 300  ELLIPSEARC 150 185 90 270
SETXY 400 300  ELLIPSEARC 110 185 90 270
SETXY 400 300  ELLIPSEARC 70  185 90 270
SETXY 400 300  ELLIPSEARC 30  185 90 270

ENDCLIP
`;

// ─── Mock canvas context (same pattern as canvas.test.ts) ─────────────────────

function makeMockCtx() {
    const linearGradient = { addColorStop: vi.fn() } as unknown as CanvasGradient;
    const radialGradient  = { addColorStop: vi.fn() } as unknown as CanvasGradient;

    return {
        save:                  vi.fn(),
        restore:               vi.fn(),
        beginPath:             vi.fn(),
        arc:                   vi.fn(),
        ellipse:               vi.fn(),
        clip:                  vi.fn(),
        stroke:                vi.fn(),
        fill:                  vi.fn(),
        moveTo:                vi.fn(),
        lineTo:                vi.fn(),
        closePath:             vi.fn(),
        clearRect:             vi.fn(),
        createLinearGradient:  vi.fn().mockReturnValue(linearGradient),
        createRadialGradient:  vi.fn().mockReturnValue(radialGradient),
        strokeStyle:           '' as string | CanvasGradient,
        fillStyle:             '' as string | CanvasGradient,
        lineWidth:             1,
        shadowBlur:            0,
    };
}

function makeMockCanvas(ctx: ReturnType<typeof makeMockCtx>) {
    return {
        getContext: vi.fn().mockReturnValue(ctx),
        width:  800,
        height: 600,
    } as unknown as HTMLCanvasElement;
}

// ─── Integration tests ─────────────────────────────────────────────────────────

describe('Integration: rainbow-globe script (Req 2.4, 3.4, 4.2, 4.4, 5.3)', () => {

    it('parses the full globe script without throwing', () => {
        expect(() => parse(GLOBE_SCRIPT)).not.toThrow();
    });

    it('parses the correct number of top-level commands', () => {
        // Count expected top-level commands from the script:
        //   Step 1: SETXY + 7×(COLOR WIDTH CIRCLE) = 1 + 21 = 22
        //   Step 2: SETXY + CLIPCIRCLE              = 2
        //   Step 3: GRADIENT + WIDTH + 8×(SETXY ELLIPSE) = 2 + 16 = 18
        //   Step 4: GRADIENT + WIDTH + 9×(SETXY ELLIPSEARC) = 2 + 18 = 20
        //   Step 5: ENDCLIP                         = 1
        //   Total:  22 + 2 + 18 + 20 + 1            = 63
        const commands = parse(GLOBE_SCRIPT);
        expect(commands).toHaveLength(63);
    });

    it('executes the full globe script without throwing', () => {
        const ctx = makeMockCtx();
        const canvas = makeMockCanvas(ctx);
        const drawCanvas = new DrawCanvas(canvas as unknown as HTMLCanvasElement);
        const engine = new DrawEngine(drawCanvas);

        const commands = parse(GLOBE_SCRIPT);
        expect(() => engine.run(commands)).not.toThrow();
    });

    it('ctx.save and ctx.restore are balanced (LIFO invariant from Req 4.4)', () => {
        const ctx = makeMockCtx();
        const canvas = makeMockCanvas(ctx);
        const drawCanvas = new DrawCanvas(canvas as unknown as HTMLCanvasElement);
        const engine = new DrawEngine(drawCanvas);

        // Reset after DrawCanvas constructor's own clearRect / shadowBlur calls
        ctx.save.mockClear();
        ctx.restore.mockClear();

        const commands = parse(GLOBE_SCRIPT);
        engine.run(commands);

        // Every save from CLIPCIRCLE and drawEllipseArc must have a matching restore.
        // 1 CLIPCIRCLE/ENDCLIP pair + 9 ELLIPSEARC save/restore pairs = 10 each.
        expect(ctx.save.mock.calls.length).toBe(ctx.restore.mock.calls.length);
    });

    it('strokes all 7 rainbow ring circles', () => {
        const ctx = makeMockCtx();
        const canvas = makeMockCanvas(ctx);
        const drawCanvas = new DrawCanvas(canvas as unknown as HTMLCanvasElement);
        const engine = new DrawEngine(drawCanvas);
        ctx.stroke.mockClear();

        const commands = parse(GLOBE_SCRIPT);
        engine.run(commands);

        // 7 CIRCLE + 8 ELLIPSE + 9 ELLIPSEARC = 24 stroked shapes
        // (drawEllipseArc also calls stroke once per arc)
        expect(ctx.stroke.mock.calls.length).toBeGreaterThanOrEqual(24);
    });

    it('uses both linear and radial gradients during execution', () => {
        const ctx = makeMockCtx();
        const canvas = makeMockCanvas(ctx);
        const drawCanvas = new DrawCanvas(canvas as unknown as HTMLCanvasElement);
        const engine = new DrawEngine(drawCanvas);
        ctx.createLinearGradient.mockClear();
        ctx.createRadialGradient.mockClear();

        const commands = parse(GLOBE_SCRIPT);
        engine.run(commands);

        // Linear gradient is used for 8 ELLIPSE draw calls
        expect(ctx.createLinearGradient.mock.calls.length).toBeGreaterThanOrEqual(1);
        // Radial gradient is used for 9 ELLIPSEARC draw calls
        expect(ctx.createRadialGradient.mock.calls.length).toBeGreaterThanOrEqual(1);
    });
});
