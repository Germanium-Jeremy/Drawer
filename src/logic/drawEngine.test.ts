import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrawEngine } from './drawEngine';
import { DrawCanvas } from './canvas';

// Requirements: 1.7, 1.8, 2.3, 3.3, 5.4, 5.5, 5.8, 6.1

// ─── Mock CanvasGradient ──────────────────────────────────────────────────────

function makeMockGradient(): CanvasGradient {
    return {
        addColorStop: vi.fn(),
    } as unknown as CanvasGradient;
}

// ─── Mock CanvasRenderingContext2D ────────────────────────────────────────────

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

// ─── Mock HTMLCanvasElement ───────────────────────────────────────────────────

function makeMockCanvas(ctx: ReturnType<typeof makeMockCtx>) {
    return {
        getContext: vi.fn().mockReturnValue(ctx),
        width: 800,
        height: 600,
    } as unknown as HTMLCanvasElement;
}

// ─── Factory: create a DrawEngine backed by a mocked ctx ─────────────────────

function createEngine() {
    const ctx = makeMockCtx();
    const htmlCanvas = makeMockCanvas(ctx);
    const drawCanvas = new DrawCanvas(htmlCanvas);

    // Clear constructor noise (clearRect, shadowBlur assignment, etc.)
    vi.clearAllMocks();
    // Re-attach the mocked gradient returns after clearAllMocks wipes them
    ctx.createLinearGradient.mockReturnValue(ctx._linearGradient);
    ctx.createRadialGradient.mockReturnValue(ctx._radialGradient);

    const engine = new DrawEngine(drawCanvas);
    return { engine, ctx, drawCanvas };
}

// ─── Tests: CLIPCIRCLE validation (Req 2.3) ──────────────────────────────────

describe('DrawEngine CLIPCIRCLE (Req 2.3)', () => {
    it('throws when radius is 0', () => {
        const { engine } = createEngine();
        expect(() =>
            engine.run([{ type: 'CLIPCIRCLE', cx: 400, cy: 300, radius: 0 }])
        ).toThrow('CLIPCIRCLE radius must be > 0');
    });

    it('throws when radius is negative', () => {
        const { engine } = createEngine();
        expect(() =>
            engine.run([{ type: 'CLIPCIRCLE', cx: 400, cy: 300, radius: -5 }])
        ).toThrow('CLIPCIRCLE radius must be > 0');
    });

    it('does not throw when radius is positive', () => {
        const { engine } = createEngine();
        expect(() =>
            engine.run([{ type: 'CLIPCIRCLE', cx: 400, cy: 300, radius: 185 }])
        ).not.toThrow();
    });
});

// ─── Tests: CLIPELLIPSE validation (Req 3.3) ─────────────────────────────────

describe('DrawEngine CLIPELLIPSE (Req 3.3)', () => {
    it('throws when rx is 0', () => {
        const { engine } = createEngine();
        expect(() =>
            engine.run([{ type: 'CLIPELLIPSE', cx: 400, cy: 300, rx: 0, ry: 80 }])
        ).toThrow('CLIPELLIPSE rx and ry must be > 0');
    });

    it('throws when ry is 0', () => {
        const { engine } = createEngine();
        expect(() =>
            engine.run([{ type: 'CLIPELLIPSE', cx: 400, cy: 300, rx: 100, ry: 0 }])
        ).toThrow('CLIPELLIPSE rx and ry must be > 0');
    });

    it('throws when rx is negative', () => {
        const { engine } = createEngine();
        expect(() =>
            engine.run([{ type: 'CLIPELLIPSE', cx: 400, cy: 300, rx: -10, ry: 80 }])
        ).toThrow('CLIPELLIPSE rx and ry must be > 0');
    });

    it('throws when ry is negative', () => {
        const { engine } = createEngine();
        expect(() =>
            engine.run([{ type: 'CLIPELLIPSE', cx: 400, cy: 300, rx: 100, ry: -1 }])
        ).toThrow('CLIPELLIPSE rx and ry must be > 0');
    });

    it('does not throw when both rx and ry are positive', () => {
        const { engine } = createEngine();
        expect(() =>
            engine.run([{ type: 'CLIPELLIPSE', cx: 400, cy: 300, rx: 100, ry: 80 }])
        ).not.toThrow();
    });
});

// ─── Tests: ELLIPSEARC with penDown = false (Req 5.4) ────────────────────────

describe('DrawEngine ELLIPSEARC penDown=false (Req 5.4)', () => {
    it('does not call drawEllipseArc when penDown is false', () => {
        const { engine, ctx } = createEngine();
        engine.run([
            { type: 'PENUP' },
            { type: 'ELLIPSEARC', rx: 150, ry: 185, startAngle: -90, endAngle: 90 },
        ]);
        // ctx.ellipse is called inside drawEllipseArc — should NOT be called
        expect(ctx.ellipse).not.toHaveBeenCalled();
    });
});

// ─── Tests: ELLIPSEARC with startAngle === endAngle (Req 5.5) ────────────────

describe('DrawEngine ELLIPSEARC startAngle === endAngle (Req 5.5)', () => {
    it('does not call drawEllipseArc when startAngle equals endAngle', () => {
        const { engine, ctx } = createEngine();
        engine.run([
            { type: 'ELLIPSEARC', rx: 150, ry: 185, startAngle: 45, endAngle: 45 },
        ]);
        expect(ctx.ellipse).not.toHaveBeenCalled();
    });

    it('does not call drawEllipseArc when both angles are 0', () => {
        const { engine, ctx } = createEngine();
        engine.run([
            { type: 'ELLIPSEARC', rx: 100, ry: 100, startAngle: 0, endAngle: 0 },
        ]);
        expect(ctx.ellipse).not.toHaveBeenCalled();
    });
});

// ─── Tests: ELLIPSEARC with rx <= 0 (Req 5.8) ────────────────────────────────

describe('DrawEngine ELLIPSEARC rx/ry validation (Req 5.8)', () => {
    it('throws when rx is 0', () => {
        const { engine } = createEngine();
        expect(() =>
            engine.run([{ type: 'ELLIPSEARC', rx: 0, ry: 185, startAngle: -90, endAngle: 90 }])
        ).toThrow();
    });

    it('throws when rx is negative', () => {
        const { engine } = createEngine();
        expect(() =>
            engine.run([{ type: 'ELLIPSEARC', rx: -10, ry: 185, startAngle: -90, endAngle: 90 }])
        ).toThrow();
    });

    it('throws when ry is 0', () => {
        const { engine } = createEngine();
        expect(() =>
            engine.run([{ type: 'ELLIPSEARC', rx: 150, ry: 0, startAngle: -90, endAngle: 90 }])
        ).toThrow();
    });

    it('throws when ry is negative', () => {
        const { engine } = createEngine();
        expect(() =>
            engine.run([{ type: 'ELLIPSEARC', rx: 150, ry: -5, startAngle: -90, endAngle: 90 }])
        ).toThrow();
    });
});

// ─── Tests: COLOR after GRADIENT clears gradient (Req 1.8) ───────────────────

describe('DrawEngine COLOR after GRADIENT clears gradient (Req 1.8)', () => {
    it('COLOR resets gradient: CIRCLE after COLOR uses a string strokeStyle, not a CanvasGradient', () => {
        const { engine, ctx } = createEngine();

        engine.run([
            {
                type: 'GRADIENT',
                gradientType: 'linear',
                stops: [
                    { offset: 0, color: '#ff0000' },
                    { offset: 1, color: '#0000ff' },
                ],
            },
            { type: 'COLOR', value: '#00ff00' },
            { type: 'CIRCLE', radius: 50 },
        ]);

        // drawCircle sets ctx.strokeStyle — it should be a string, not a CanvasGradient
        expect(typeof ctx.strokeStyle).toBe('string');
        // And specifically it should be the COLOR value
        expect(ctx.strokeStyle).toBe('#00ff00');
        // createLinearGradient should NOT have been called
        expect(ctx.createLinearGradient).not.toHaveBeenCalled();
    });

    it('COLOR after GRADIENT: drawCircle arc is called (confirming CIRCLE executed)', () => {
        const { engine, ctx } = createEngine();

        engine.run([
            {
                type: 'GRADIENT',
                gradientType: 'radial',
                stops: [
                    { offset: 0, color: 'red' },
                    { offset: 1, color: 'blue' },
                ],
            },
            { type: 'COLOR', value: 'green' },
            { type: 'CIRCLE', radius: 30 },
        ]);

        // ctx.arc is called inside drawCircle
        expect(ctx.arc).toHaveBeenCalledOnce();
        // strokeStyle should be the string 'green', not a CanvasGradient
        expect(ctx.strokeStyle).toBe('green');
    });
});

// ─── Tests: GRADIENT sets state.gradient correctly (Req 1.6) ─────────────────

describe('DrawEngine GRADIENT sets gradient state (Req 1.6)', () => {
    it('GRADIENT causes CIRCLE to use a CanvasGradient (createLinearGradient called)', () => {
        const { engine, ctx } = createEngine();

        engine.run([
            {
                type: 'GRADIENT',
                gradientType: 'linear',
                stops: [
                    { offset: 0, color: '#ff0000' },
                    { offset: 0.5, color: '#00ff00' },
                    { offset: 1, color: '#0000ff' },
                ],
            },
            { type: 'CIRCLE', radius: 50 },
        ]);

        // buildGradient for CIRCLE calls createLinearGradient
        expect(ctx.createLinearGradient).toHaveBeenCalledOnce();
        // strokeStyle should be the CanvasGradient object (not a string)
        expect(typeof ctx.strokeStyle).not.toBe('string');
        expect(ctx.strokeStyle).toBe(ctx._linearGradient);
    });

    it('GRADIENT radial causes CIRCLE to call createRadialGradient', () => {
        const { engine, ctx } = createEngine();

        engine.run([
            {
                type: 'GRADIENT',
                gradientType: 'radial',
                stops: [
                    { offset: 0, color: '#00aa00' },
                    { offset: 1, color: '#8b00ff' },
                ],
            },
            { type: 'CIRCLE', radius: 100 },
        ]);

        expect(ctx.createRadialGradient).toHaveBeenCalledOnce();
        expect(ctx.strokeStyle).toBe(ctx._radialGradient);
    });
});

// ─── Tests: CIRCLE with active gradient receives CanvasGradient (Req 6.1) ────

describe('DrawEngine CIRCLE with active gradient (Req 6.1)', () => {
    it('drawCircle strokeStyle is the CanvasGradient from buildGradient', () => {
        const { engine, ctx } = createEngine();

        engine.run([
            {
                type: 'GRADIENT',
                gradientType: 'linear',
                stops: [
                    { offset: 0, color: '#ff0000' },
                    { offset: 1, color: '#0000ff' },
                ],
            },
            { type: 'CIRCLE', radius: 185 },
        ]);

        // The strokeStyle set on ctx should be the CanvasGradient instance
        expect(ctx.strokeStyle).toBe(ctx._linearGradient);
        // It should NOT be a plain string
        expect(typeof ctx.strokeStyle).not.toBe('string');
    });

    it('CIRCLE with no gradient uses string color', () => {
        const { engine, ctx } = createEngine();

        engine.run([
            { type: 'COLOR', value: '#abcdef' },
            { type: 'CIRCLE', radius: 50 },
        ]);

        expect(typeof ctx.strokeStyle).toBe('string');
        expect(ctx.strokeStyle).toBe('#abcdef');
    });

    it('CIRCLE with gradient calls ctx.arc (confirms circle was actually drawn)', () => {
        const { engine, ctx } = createEngine();

        engine.run([
            {
                type: 'GRADIENT',
                gradientType: 'radial',
                stops: [
                    { offset: 0, color: 'red' },
                    { offset: 1, color: 'blue' },
                ],
            },
            { type: 'CIRCLE', radius: 75 },
        ]);

        expect(ctx.arc).toHaveBeenCalledOnce();
        expect(ctx.stroke).toHaveBeenCalledOnce();
    });
});
