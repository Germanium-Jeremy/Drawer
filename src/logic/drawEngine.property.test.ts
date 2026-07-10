import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { DrawEngine } from './drawEngine';
import { DrawCanvas } from './canvas';
import type { Command } from './parser';

// Validates: Requirements 2.5, 3.5, 4.2, 4.4

// ─── Mock helpers (same pattern as canvas.test.ts) ────────────────────────────

function makeMockGradient() {
    return {
        addColorStop: vi.fn(),
    } as unknown as CanvasGradient;
}

function makeMockCtx() {
    const linearGradient = makeMockGradient();
    const radialGradient = makeMockGradient();

    const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        ellipse: vi.fn(),
        clip: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        clearRect: vi.fn(),
        createLinearGradient: vi.fn().mockReturnValue(linearGradient),
        createRadialGradient: vi.fn().mockReturnValue(radialGradient),
        strokeStyle: '' as string | CanvasGradient,
        fillStyle: '' as string | CanvasGradient,
        lineWidth: 1,
        shadowBlur: 0,
        _linearGradient: linearGradient,
        _radialGradient: radialGradient,
    };
    return ctx;
}

function makeMockCanvas(ctx: ReturnType<typeof makeMockCtx>) {
    return {
        getContext: vi.fn().mockReturnValue(ctx),
        width: 800,
        height: 600,
    } as unknown as HTMLCanvasElement;
}

function createDrawEngine() {
    const ctx = makeMockCtx();
    const htmlCanvas = makeMockCanvas(ctx);
    const drawCanvas = new DrawCanvas(htmlCanvas);
    const engine = new DrawEngine(drawCanvas);

    // Reset call counts so constructor calls (clearRect, etc.) don't interfere
    ctx.save.mockClear();
    ctx.restore.mockClear();

    return { engine, ctx };
}

// ─── Property test: Clip stack balance ───────────────────────────────────────

describe('DrawEngine property: Clip stack balance (Req 2.5, 3.5, 4.2, 4.4)', () => {
    /**
     * Property 1: Clip stack balance
     *
     * For any sequence of n balanced CLIPCIRCLE/ENDCLIP pairs (n ≥ 1, radii > 0),
     * the mock ctx's save and restore call counts must be equal after all commands execute.
     *
     * Validates: Requirements 2.5, 3.5, 4.2, 4.4
     */
    it('save and restore call counts are equal after n balanced CLIPCIRCLE/ENDCLIP pairs', () => {
        fc.assert(
            fc.property(
                // n: number of clip pairs, 1 to 10
                fc.integer({ min: 1, max: 10 }),
                // For each pair, generate cx, cy (any number) and radius (must be > 0)
                fc.array(
                    fc.record({
                        cx: fc.float({ min: -500, max: 500, noNaN: true }),
                        cy: fc.float({ min: -500, max: 500, noNaN: true }),
                        radius: fc.float({ min: 1, max: 500, noNaN: true }),
                    }),
                    { minLength: 1, maxLength: 10 }
                ),
                (n, clipParams) => {
                    const { engine, ctx } = createDrawEngine();

                    // Build exactly n balanced CLIPCIRCLE/ENDCLIP pairs,
                    // cycling through clipParams if n > clipParams.length
                    const commands: Command[] = [];
                    for (let i = 0; i < n; i++) {
                        const p = clipParams[i % clipParams.length];
                        commands.push({ type: 'CLIPCIRCLE', cx: p.cx, cy: p.cy, radius: p.radius });
                        commands.push({ type: 'ENDCLIP' });
                    }

                    engine.run(commands);

                    // The number of save calls must equal the number of restore calls
                    expect(ctx.save.mock.calls.length).toBe(ctx.restore.mock.calls.length);
                }
            )
        );
    });

    it('save and restore counts are both equal to n for n balanced pairs', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 10 }),
                fc.float({ min: 1, max: 500, noNaN: true }),
                (n, radius) => {
                    const { engine, ctx } = createDrawEngine();

                    const commands: Command[] = [];
                    for (let i = 0; i < n; i++) {
                        commands.push({ type: 'CLIPCIRCLE', cx: 400, cy: 300, radius });
                        commands.push({ type: 'ENDCLIP' });
                    }

                    engine.run(commands);

                    // Each CLIPCIRCLE calls save once, each ENDCLIP calls restore once
                    expect(ctx.save.mock.calls.length).toBe(n);
                    expect(ctx.restore.mock.calls.length).toBe(n);
                }
            )
        );
    });
});
