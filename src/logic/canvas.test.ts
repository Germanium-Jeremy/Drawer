import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrawCanvas } from './canvas';
import type { GradientDef } from '../types/types';

// Requirements: 2.4, 2.5, 3.4, 3.5, 4.2, 5.3, 7.1, 7.2, 7.3, 7.5

// ─── Mock CanvasGradient ──────────────────────────────────────────────────────

function makeMockGradient() {
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
        clearRect: vi.fn(),
        createLinearGradient: vi.fn().mockReturnValue(linearGradient),
        createRadialGradient: vi.fn().mockReturnValue(radialGradient),
        strokeStyle: '',
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createDrawCanvas() {
    const ctx = makeMockCtx();
    const canvas = makeMockCanvas(ctx);
    const drawCanvas = new DrawCanvas(canvas);
    // Reset call counts so constructor calls (clearRect, shadowBlur) don't interfere
    ctx.save.mockClear();
    ctx.restore.mockClear();
    ctx.beginPath.mockClear();
    ctx.arc.mockClear();
    ctx.ellipse.mockClear();
    ctx.clip.mockClear();
    ctx.stroke.mockClear();
    ctx.clearRect.mockClear();
    ctx.createLinearGradient.mockClear();
    ctx.createRadialGradient.mockClear();
    ctx._linearGradient.addColorStop.mockClear();
    ctx._radialGradient.addColorStop.mockClear();
    return { drawCanvas, ctx };
}

// ─── Tests: beginClipCircle ───────────────────────────────────────────────────

describe('DrawCanvas.beginClipCircle (Req 2.4, 2.5)', () => {
    it('calls ctx.save, ctx.beginPath, ctx.arc with correct args, and ctx.clip', () => {
        const { drawCanvas, ctx } = createDrawCanvas();

        drawCanvas.beginClipCircle(100, 200, 50);

        expect(ctx.save).toHaveBeenCalledOnce();
        expect(ctx.beginPath).toHaveBeenCalledOnce();
        expect(ctx.arc).toHaveBeenCalledWith(100, 200, 50, 0, Math.PI * 2);
        expect(ctx.clip).toHaveBeenCalledOnce();
    });

    it('calls ctx.save before ctx.arc and ctx.clip (Req 2.5)', () => {
        const { drawCanvas, ctx } = createDrawCanvas();
        const callOrder: string[] = [];
        ctx.save.mockImplementation(() => callOrder.push('save'));
        ctx.arc.mockImplementation(() => callOrder.push('arc'));
        ctx.clip.mockImplementation(() => callOrder.push('clip'));

        drawCanvas.beginClipCircle(0, 0, 10);

        expect(callOrder).toEqual(['save', 'arc', 'clip']);
    });

    it('passes the exact cx, cy, radius to ctx.arc', () => {
        const { drawCanvas, ctx } = createDrawCanvas();

        drawCanvas.beginClipCircle(400, 300, 185);

        expect(ctx.arc).toHaveBeenCalledWith(400, 300, 185, 0, Math.PI * 2);
    });
});

// ─── Tests: beginClipEllipse ──────────────────────────────────────────────────

describe('DrawCanvas.beginClipEllipse (Req 3.4, 3.5)', () => {
    it('calls ctx.save, ctx.beginPath, ctx.ellipse with correct args, and ctx.clip', () => {
        const { drawCanvas, ctx } = createDrawCanvas();

        drawCanvas.beginClipEllipse(200, 150, 100, 80);

        expect(ctx.save).toHaveBeenCalledOnce();
        expect(ctx.beginPath).toHaveBeenCalledOnce();
        expect(ctx.ellipse).toHaveBeenCalledWith(200, 150, 100, 80, 0, 0, Math.PI * 2);
        expect(ctx.clip).toHaveBeenCalledOnce();
    });

    it('calls ctx.save before ctx.ellipse and ctx.clip (Req 3.5)', () => {
        const { drawCanvas, ctx } = createDrawCanvas();
        const callOrder: string[] = [];
        ctx.save.mockImplementation(() => callOrder.push('save'));
        ctx.ellipse.mockImplementation(() => callOrder.push('ellipse'));
        ctx.clip.mockImplementation(() => callOrder.push('clip'));

        drawCanvas.beginClipEllipse(0, 0, 50, 30);

        expect(callOrder).toEqual(['save', 'ellipse', 'clip']);
    });

    it('passes rotation = 0 and full arc to ctx.ellipse', () => {
        const { drawCanvas, ctx } = createDrawCanvas();

        drawCanvas.beginClipEllipse(10, 20, 60, 40);

        const [, , , , rotation, startAngle, endAngle] = ctx.ellipse.mock.calls[0];
        expect(rotation).toBe(0);
        expect(startAngle).toBe(0);
        expect(endAngle).toBe(Math.PI * 2);
    });
});

// ─── Tests: endClip ───────────────────────────────────────────────────────────

describe('DrawCanvas.endClip (Req 4.2)', () => {
    it('calls ctx.restore exactly once', () => {
        const { drawCanvas, ctx } = createDrawCanvas();

        drawCanvas.endClip();

        expect(ctx.restore).toHaveBeenCalledOnce();
    });

    it('calls ctx.restore on each endClip call', () => {
        const { drawCanvas, ctx } = createDrawCanvas();

        drawCanvas.endClip();
        drawCanvas.endClip();

        expect(ctx.restore).toHaveBeenCalledTimes(2);
    });
});

// ─── Tests: buildGradient (linear) ───────────────────────────────────────────

describe('DrawCanvas.buildGradient — linear (Req 7.1, 7.3)', () => {
    it('calls createLinearGradient(cx, cy-ry, cx, cy+ry)', () => {
        const { drawCanvas, ctx } = createDrawCanvas();
        const def: GradientDef = {
            kind: 'linear',
            stops: [
                { offset: 0, color: '#ff0000' },
                { offset: 1, color: '#0000ff' },
            ],
        };

        drawCanvas.buildGradient(def, 400, 300, 100, 80);

        expect(ctx.createLinearGradient).toHaveBeenCalledWith(400, 220, 400, 380);
    });

    it('adds all color stops to the gradient in order (Req 7.3)', () => {
        const { drawCanvas, ctx } = createDrawCanvas();
        const def: GradientDef = {
            kind: 'linear',
            stops: [
                { offset: 0, color: '#ff0000' },
                { offset: 0.5, color: '#00ff00' },
                { offset: 1, color: '#0000ff' },
            ],
        };

        drawCanvas.buildGradient(def, 200, 200, 50, 50);

        const gradient = ctx._linearGradient;
        expect(gradient.addColorStop).toHaveBeenCalledTimes(3);
        expect(gradient.addColorStop).toHaveBeenNthCalledWith(1, 0, '#ff0000');
        expect(gradient.addColorStop).toHaveBeenNthCalledWith(2, 0.5, '#00ff00');
        expect(gradient.addColorStop).toHaveBeenNthCalledWith(3, 1, '#0000ff');
    });

    it('uses cy - ry as the top y-coordinate', () => {
        const { drawCanvas, ctx } = createDrawCanvas();
        const def: GradientDef = {
            kind: 'linear',
            stops: [
                { offset: 0, color: 'red' },
                { offset: 1, color: 'blue' },
            ],
        };

        drawCanvas.buildGradient(def, 100, 200, 30, 60);

        // cy=200, ry=60 → top=140, bottom=260
        expect(ctx.createLinearGradient).toHaveBeenCalledWith(100, 140, 100, 260);
    });

    it('returns the CanvasGradient object', () => {
        const { drawCanvas, ctx } = createDrawCanvas();
        const def: GradientDef = {
            kind: 'linear',
            stops: [
                { offset: 0, color: 'red' },
                { offset: 1, color: 'blue' },
            ],
        };

        const result = drawCanvas.buildGradient(def, 0, 0, 10, 10);

        expect(result).toBe(ctx._linearGradient);
    });
});

// ─── Tests: buildGradient (radial) ───────────────────────────────────────────

describe('DrawCanvas.buildGradient — radial (Req 7.2, 7.3)', () => {
    it('calls createRadialGradient with inner r=0 and outer r=max(rx,ry)', () => {
        const { drawCanvas, ctx } = createDrawCanvas();
        const def: GradientDef = {
            kind: 'radial',
            stops: [
                { offset: 0, color: '#00aa00' },
                { offset: 1, color: '#8b00ff' },
            ],
        };

        drawCanvas.buildGradient(def, 400, 300, 100, 80);

        // Both circles at (cx, cy); inner r=0; outer r=max(100,80)=100
        expect(ctx.createRadialGradient).toHaveBeenCalledWith(400, 300, 0, 400, 300, 100);
    });

    it('uses max(rx, ry) as outer radius when ry > rx', () => {
        const { drawCanvas, ctx } = createDrawCanvas();
        const def: GradientDef = {
            kind: 'radial',
            stops: [
                { offset: 0, color: 'red' },
                { offset: 1, color: 'blue' },
            ],
        };

        drawCanvas.buildGradient(def, 200, 150, 50, 120);

        // outer r = max(50, 120) = 120
        expect(ctx.createRadialGradient).toHaveBeenCalledWith(200, 150, 0, 200, 150, 120);
    });

    it('adds all color stops to the radial gradient in order (Req 7.3)', () => {
        const { drawCanvas, ctx } = createDrawCanvas();
        const def: GradientDef = {
            kind: 'radial',
            stops: [
                { offset: 0, color: '#00aa00' },
                { offset: 0.33, color: '#ffff00' },
                { offset: 0.67, color: '#ff0000' },
                { offset: 1, color: '#8b00ff' },
            ],
        };

        drawCanvas.buildGradient(def, 400, 300, 185, 185);

        const gradient = ctx._radialGradient;
        expect(gradient.addColorStop).toHaveBeenCalledTimes(4);
        expect(gradient.addColorStop).toHaveBeenNthCalledWith(1, 0, '#00aa00');
        expect(gradient.addColorStop).toHaveBeenNthCalledWith(2, 0.33, '#ffff00');
        expect(gradient.addColorStop).toHaveBeenNthCalledWith(3, 0.67, '#ff0000');
        expect(gradient.addColorStop).toHaveBeenNthCalledWith(4, 1, '#8b00ff');
    });

    it('returns the CanvasGradient object', () => {
        const { drawCanvas, ctx } = createDrawCanvas();
        const def: GradientDef = {
            kind: 'radial',
            stops: [
                { offset: 0, color: 'red' },
                { offset: 1, color: 'blue' },
            ],
        };

        const result = drawCanvas.buildGradient(def, 0, 0, 10, 20);

        expect(result).toBe(ctx._radialGradient);
    });
});

// ─── Tests: drawEllipseArc ────────────────────────────────────────────────────

describe('DrawCanvas.drawEllipseArc (Req 5.3, 7.5)', () => {
    it('converts startAngle and endAngle from degrees to radians', () => {
        const { drawCanvas, ctx } = createDrawCanvas();

        drawCanvas.drawEllipseArc(400, 300, 150, 185, -90, 90, '#ff0000', 2);

        const [, , , , , startRad, endRad] = ctx.ellipse.mock.calls[0];
        expect(startRad).toBeCloseTo(-90 * Math.PI / 180);
        expect(endRad).toBeCloseTo(90 * Math.PI / 180);
    });

    it('passes correct cx, cy, rx, ry, rotation=0 to ctx.ellipse', () => {
        const { drawCanvas, ctx } = createDrawCanvas();

        drawCanvas.drawEllipseArc(200, 150, 80, 60, 0, 180, 'blue', 3);

        expect(ctx.ellipse).toHaveBeenCalledWith(
            200, 150, 80, 60,
            0,
            0 * Math.PI / 180,
            180 * Math.PI / 180
        );
    });

    it('brackets the draw with ctx.save and ctx.restore (Req 7.5)', () => {
        const { drawCanvas, ctx } = createDrawCanvas();
        const callOrder: string[] = [];
        ctx.save.mockImplementation(() => callOrder.push('save'));
        ctx.ellipse.mockImplementation(() => callOrder.push('ellipse'));
        ctx.stroke.mockImplementation(() => callOrder.push('stroke'));
        ctx.restore.mockImplementation(() => callOrder.push('restore'));

        drawCanvas.drawEllipseArc(0, 0, 50, 50, 0, 360, 'red', 1);

        expect(callOrder[0]).toBe('save');
        expect(callOrder[callOrder.length - 1]).toBe('restore');
    });

    it('calls ctx.save before drawing and ctx.restore after (Req 7.5)', () => {
        const { drawCanvas, ctx } = createDrawCanvas();

        drawCanvas.drawEllipseArc(100, 100, 50, 40, -45, 45, '#00ff00', 2);

        expect(ctx.save).toHaveBeenCalledOnce();
        expect(ctx.restore).toHaveBeenCalledOnce();
        expect(ctx.ellipse).toHaveBeenCalledOnce();
        expect(ctx.stroke).toHaveBeenCalledOnce();
    });

    it('handles 360-degree arc (full ellipse equivalent, Req 5.7)', () => {
        const { drawCanvas, ctx } = createDrawCanvas();

        drawCanvas.drawEllipseArc(400, 300, 185, 185, 0, 360, '#ff0000', 2);

        const [, , , , , startRad, endRad] = ctx.ellipse.mock.calls[0];
        expect(startRad).toBeCloseTo(0);
        expect(endRad).toBeCloseTo(2 * Math.PI);
    });

    it('accepts a CanvasGradient as strokeStyle', () => {
        const { drawCanvas, ctx } = createDrawCanvas();
        const gradient = makeMockGradient() as unknown as CanvasGradient;

        // Should not throw
        expect(() =>
            drawCanvas.drawEllipseArc(100, 100, 50, 50, 0, 90, gradient, 2)
        ).not.toThrow();

        expect(ctx.stroke).toHaveBeenCalledOnce();
    });

    it('handles negative startAngle correctly', () => {
        const { drawCanvas, ctx } = createDrawCanvas();

        drawCanvas.drawEllipseArc(0, 0, 100, 80, -180, -90, 'green', 1);

        const [, , , , , startRad, endRad] = ctx.ellipse.mock.calls[0];
        expect(startRad).toBeCloseTo(-Math.PI);
        expect(endRad).toBeCloseTo(-Math.PI / 2);
    });
});
