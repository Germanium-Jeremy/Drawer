import { describe, it, expect } from 'vitest';
import { parse } from './parser';

// Requirements: 1.2, 1.3, 1.4, 1.5, 2.2, 3.2, 8.1–8.6

describe('Parser — GRADIENT command', () => {
    it('parses GRADIENT linear with 2 stops correctly (Req 1.1, 8.1, 8.6)', () => {
        const result = parse('GRADIENT linear [0 #ff0000 1 #0000ff]');
        expect(result).toHaveLength(1);
        const cmd = result[0];
        expect(cmd.type).toBe('GRADIENT');
        if (cmd.type !== 'GRADIENT') return;
        expect(cmd.gradientType).toBe('linear');
        expect(cmd.stops).toHaveLength(2);
        expect(cmd.stops[0]).toEqual({ offset: 0, color: '#ff0000' });
        expect(cmd.stops[1]).toEqual({ offset: 1, color: '#0000ff' });
    });

    it('parses GRADIENT radial with multiple stops (Req 1.1, 8.1)', () => {
        const result = parse('GRADIENT radial [0 #00aa00 0.5 #ff7700 1 #8b00ff]');
        expect(result).toHaveLength(1);
        const cmd = result[0];
        expect(cmd.type).toBe('GRADIENT');
        if (cmd.type !== 'GRADIENT') return;
        expect(cmd.gradientType).toBe('radial');
        expect(cmd.stops).toHaveLength(3);
        expect(cmd.stops[0].offset).toBe(parseFloat('0'));
        expect(cmd.stops[0].color).toBe('#00aa00');
    });

    it('throws when GRADIENT has only 1 stop (Req 1.4)', () => {
        expect(() => parse('GRADIENT linear [0 #ff0000]')).toThrow(
            'GRADIENT requires at least 2 color stops'
        );
    });

    it('throws when GRADIENT has 0 stops (Req 1.4)', () => {
        expect(() => parse('GRADIENT linear []')).toThrow(
            'GRADIENT requires at least 2 color stops'
        );
    });

    it('throws when GRADIENT is missing "[" before stops (Req 1.3)', () => {
        expect(() => parse('GRADIENT linear 0 #ff0000 1 #0000ff')).toThrow(
            'GRADIENT expects "[" before color stops'
        );
    });

    it('throws when GRADIENT stop offset is greater than 1 (Req 1.5)', () => {
        expect(() => parse('GRADIENT linear [0 #ff0000 1.5 #0000ff]')).toThrow(
            'Gradient stop offset must be between 0 and 1'
        );
    });

    it('throws when GRADIENT stop offset is negative (Req 1.5)', () => {
        expect(() => parse('GRADIENT linear [-0.1 #ff0000 1 #0000ff]')).toThrow(
            'Gradient stop offset must be between 0 and 1'
        );
    });

    it('throws when GRADIENT kind is unknown (Req 1.2)', () => {
        expect(() => parse('GRADIENT diagonal [0 #ff0000 1 #0000ff]')).toThrow(
            'GRADIENT expects "linear" or "radial"'
        );
    });

    it('throws when GRADIENT kind is missing entirely (Req 1.2)', () => {
        expect(() => parse('GRADIENT [0 #ff0000 1 #0000ff]')).toThrow(
            'GRADIENT expects "linear" or "radial"'
        );
    });
});

describe('Parser — CLIPCIRCLE command', () => {
    it('parses CLIPCIRCLE 400 300 185 correctly (Req 2.1, 8.2, 8.6)', () => {
        const result = parse('CLIPCIRCLE 400 300 185');
        expect(result).toHaveLength(1);
        const cmd = result[0];
        expect(cmd.type).toBe('CLIPCIRCLE');
        if (cmd.type !== 'CLIPCIRCLE') return;
        expect(cmd.cx).toBe(400);
        expect(cmd.cy).toBe(300);
        expect(cmd.radius).toBe(185);
    });

    it('throws when CLIPCIRCLE is missing a numeric parameter (Req 2.2)', () => {
        expect(() => parse('CLIPCIRCLE 400 300')).toThrow(
            'CLIPCIRCLE'
        );
    });
});

describe('Parser — CLIPELLIPSE command', () => {
    it('parses CLIPELLIPSE 400 300 100 80 correctly (Req 3.1, 8.3, 8.6)', () => {
        const result = parse('CLIPELLIPSE 400 300 100 80');
        expect(result).toHaveLength(1);
        const cmd = result[0];
        expect(cmd.type).toBe('CLIPELLIPSE');
        if (cmd.type !== 'CLIPELLIPSE') return;
        expect(cmd.cx).toBe(400);
        expect(cmd.cy).toBe(300);
        expect(cmd.rx).toBe(100);
        expect(cmd.ry).toBe(80);
    });

    it('throws when CLIPELLIPSE is missing a numeric parameter (Req 3.2)', () => {
        expect(() => parse('CLIPELLIPSE 400 300 100')).toThrow(
            'CLIPELLIPSE'
        );
    });
});

describe('Parser — ENDCLIP command', () => {
    it('parses ENDCLIP as { type: "ENDCLIP" } (Req 4.1, 8.4)', () => {
        const result = parse('ENDCLIP');
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ type: 'ENDCLIP' });
    });

    it('parses ENDCLIP inside a sequence correctly (Req 4.1)', () => {
        const result = parse('CLIPCIRCLE 400 300 100\nENDCLIP');
        expect(result).toHaveLength(2);
        expect(result[1]).toEqual({ type: 'ENDCLIP' });
    });
});

describe('Parser — ELLIPSEARC command', () => {
    it('parses ELLIPSEARC 150 185 -90 90 correctly, including negative startAngle (Req 5.1, 8.5, 8.6)', () => {
        const result = parse('ELLIPSEARC 150 185 -90 90');
        expect(result).toHaveLength(1);
        const cmd = result[0];
        expect(cmd.type).toBe('ELLIPSEARC');
        if (cmd.type !== 'ELLIPSEARC') return;
        expect(cmd.rx).toBe(150);
        expect(cmd.ry).toBe(185);
        expect(cmd.startAngle).toBe(-90);
        expect(cmd.endAngle).toBe(90);
    });

    it('parses ELLIPSEARC with positive angles (Req 5.1)', () => {
        const result = parse('ELLIPSEARC 185 185 0 360');
        expect(result).toHaveLength(1);
        const cmd = result[0];
        expect(cmd.type).toBe('ELLIPSEARC');
        if (cmd.type !== 'ELLIPSEARC') return;
        expect(cmd.startAngle).toBe(0);
        expect(cmd.endAngle).toBe(360);
    });

    it('parses ELLIPSEARC with both angles negative (Req 5.1)', () => {
        const result = parse('ELLIPSEARC 100 80 -180 -90');
        expect(result).toHaveLength(1);
        const cmd = result[0];
        expect(cmd.type).toBe('ELLIPSEARC');
        if (cmd.type !== 'ELLIPSEARC') return;
        expect(cmd.startAngle).toBe(-180);
        expect(cmd.endAngle).toBe(-90);
    });

    it('throws when ELLIPSEARC is missing a numeric parameter (Req 5.2)', () => {
        expect(() => parse('ELLIPSEARC 150 185 -90')).toThrow(
            'ELLIPSEARC'
        );
    });
});

describe('Parser — round-trip integrity (Req 8.1–8.6)', () => {
    it('GRADIENT: stop offsets equal parseFloat of source tokens (Req 8.6)', () => {
        const result = parse('GRADIENT linear [0.25 #aabbcc 0.75 #112233]');
        const cmd = result[0];
        expect(cmd.type).toBe('GRADIENT');
        if (cmd.type !== 'GRADIENT') return;
        expect(cmd.stops[0].offset).toBe(parseFloat('0.25'));
        expect(cmd.stops[0].color).toBe('#aabbcc');
        expect(cmd.stops[1].offset).toBe(parseFloat('0.75'));
        expect(cmd.stops[1].color).toBe('#112233');
    });

    it('CLIPCIRCLE: parameters equal parseFloat of source tokens (Req 8.2)', () => {
        const result = parse('CLIPCIRCLE 123 456 78');
        const cmd = result[0];
        expect(cmd.type).toBe('CLIPCIRCLE');
        if (cmd.type !== 'CLIPCIRCLE') return;
        expect(cmd.cx).toBe(parseFloat('123'));
        expect(cmd.cy).toBe(parseFloat('456'));
        expect(cmd.radius).toBe(parseFloat('78'));
    });

    it('CLIPELLIPSE: parameters equal parseFloat of source tokens (Req 8.3)', () => {
        const result = parse('CLIPELLIPSE 200 150 90 60');
        const cmd = result[0];
        expect(cmd.type).toBe('CLIPELLIPSE');
        if (cmd.type !== 'CLIPELLIPSE') return;
        expect(cmd.cx).toBe(parseFloat('200'));
        expect(cmd.cy).toBe(parseFloat('150'));
        expect(cmd.rx).toBe(parseFloat('90'));
        expect(cmd.ry).toBe(parseFloat('60'));
    });

    it('ELLIPSEARC: angles equal parseFloat of source tokens including negatives (Req 8.5)', () => {
        const result = parse('ELLIPSEARC 70 185 -90 90');
        const cmd = result[0];
        expect(cmd.type).toBe('ELLIPSEARC');
        if (cmd.type !== 'ELLIPSEARC') return;
        expect(cmd.startAngle).toBe(parseFloat('-90'));
        expect(cmd.endAngle).toBe(parseFloat('90'));
    });
});
