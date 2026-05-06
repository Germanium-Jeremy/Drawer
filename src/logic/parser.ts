interface Point {
    x: number;
    y: number;
}

export type Command =
    | { type: 'FORWARD'; value: number }
    | { type: 'BACKWARD'; value: number }
    | { type: 'LEFT'; value: number }
    | { type: 'RIGHT'; value: number }
    | { type: 'PENUP' }
    | { type: 'PENDOWN' }
    | { type: 'COLOR'; value: string }
    | { type: 'WIDTH'; value: number }
    | { type: 'REPEAT'; count: number; commands: Command[] }
    | { type: 'CLEAR' }
    | { type: 'CIRCLE'; radius: number }
    | { type: 'SETXY'; x: number; y: number }
    | { type: 'HOME' }
    | { type: 'ARC'; radius: number; startAngle: number; endAngle: number }
    | { type: 'ELLIPSE'; rx: number; ry: number }
    | { type: 'POLYGON'; points: Point[] }

type Token =
    | { type: 'WORD'; value: string }
    | { type: 'NUMBER'; value: number }
    | { type: 'LBRACKET' }
    | { type: 'RBRACKET' }
    | { type: 'SEMICOLON' };

function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    while (i < input.length) {
        const char = input[i];
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        if (char === ';') {
            tokens.push({ type: 'SEMICOLON' });
            i++;
            continue;
        }
        if (char === '[') {
            tokens.push({ type: 'LBRACKET' });
            i++;
            continue;
        }
        if (char === ']') {
            tokens.push({ type: 'RBRACKET' });
            i++;
            continue;
        }
        if (char === '-' || /[0-9]/.test(char)) {
            let numStr = '';
            if (char === '-') {
                numStr += '-';
                i++;
            }

            // const match = input.slice(i).match(/^-?\d+(\.\d+)?/);
            // consider this comment to update a line here

            while (i < input.length && /[0-9.]/.test(input[i])) {
                numStr += input[i];
                i++;
            }
            const val = parseFloat(numStr);
            if (isNaN(val)) {
                throw new Error(`Invalid number format: "${numStr}"`);
            }
            tokens.push({ type: 'NUMBER', value: val });
            continue;
        }
        if (/[a-zA-Z#]/.test(char)) {
            let wordStr = '';
            while (i < input.length && /[a-zA-Z0-9#]/.test(input[i])) {
                wordStr += input[i];
                i++;
            }
            tokens.push({ type: 'WORD', value: wordStr });
            continue;
        }
        throw new Error(`Unexpected character: "${char}" at position ${i}`);
    }
    return tokens;
}

export function parse(input: string): Command[] {
    const tokens = tokenize(input);
    let index = 0;

    // Helper to read a numeric token and advance the cursor.
    function expectNumber(cmdName: string): number {
        const token = tokens[index];
        if (!token || token.type !== 'NUMBER') {
            throw new Error(`Command "${cmdName}" expects a numeric parameter`);
        }
        index++;
        return token.value;
    }

    // Helper to read a word token and advance the cursor.
    function expectWord(cmdName: string): string {
        const token = tokens[index];
        if (!token || token.type !== 'WORD') {
            throw new Error(`Command "${cmdName}" expects a text parameter`);
        }
        index++;
        return token.value;
    }

    // Ensures a command is properly terminated (semicolon, bracket, next command, or EOF).
    function expectTerminator(cmdName: string) {
        if (index >= tokens.length) return; // end of input
        const next = tokens[index];
        if (next.type === 'SEMICOLON') {
            index++; // consume semicolon
            return;
        }
        if (next.type === 'RBRACKET' || next.type === 'WORD') {
            // Accept closing bracket or start of next command as terminator.
            return;
        }
        throw new Error(`Expected ";", end of command (']' or another command) or end of input after "${cmdName}" command, but got "${next.type}"`);
    }

    function parseCommands(inRepeat = false): Command[] {
        const commands: Command[] = [];
        while (index < tokens.length) {
            const token = tokens[index];
            if (token.type === 'RBRACKET') {
                if (!inRepeat) {
                    throw new Error(`Unexpected closing bracket "]" at token index ${index}`);
                }
                break;
            }
            const cmd = parseCommand();
            if (cmd) commands.push(cmd);
        }
        return commands;
    }

    function parseCommand(): Command | null {
        if (index >= tokens.length) return null;
        const token = tokens[index];
        if (token.type === 'SEMICOLON') {
            index++;
            return null;
        }
        if (token.type !== 'WORD') {
            throw new Error(`Expected command word, but got token type "${token.type}" at index ${index}`);
        }
        const cmdWord = token.value.toLowerCase();
        index++;
        switch (cmdWord) {
            case 'forward':
            case 'fd': {
                const valToken = tokens[index];
                if (!valToken || valToken.type !== 'NUMBER') {
                    throw new Error(`Command "${cmdWord}" expects a number parameter`);
                }
                index++;
                expectTerminator(cmdWord);
                return { type: 'FORWARD', value: valToken.value };
            }
            case 'backward':
            case 'bk': {
                const valToken = tokens[index];
                if (!valToken || valToken.type !== 'NUMBER') {
                    throw new Error(`Command "${cmdWord}" expects a number parameter`);
                }
                index++;
                expectTerminator(cmdWord);
                return { type: 'BACKWARD', value: valToken.value };
            }
            case 'left':
            case 'lt': {
                const valToken = tokens[index];
                if (!valToken || valToken.type !== 'NUMBER') {
                    throw new Error(`Command "${cmdWord}" expects a number parameter`);
                }
                index++;
                expectTerminator(cmdWord);
                return { type: 'LEFT', value: valToken.value };
            }
            case 'right':
            case 'rt': {
                const valToken = tokens[index];
                if (!valToken || valToken.type !== 'NUMBER') {
                    throw new Error(`Command "${cmdWord}" expects a number parameter`);
                }
                index++;
                expectTerminator(cmdWord);
                return { type: 'RIGHT', value: valToken.value };
            }
            case 'penup':
            case 'pu': {
                expectTerminator(cmdWord);
                return { type: 'PENUP' };
            }
            case 'pendown':
            case 'pd': {
                expectTerminator(cmdWord);
                return { type: 'PENDOWN' };
            }
            case 'color':
            case 'col': {
                const valToken = tokens[index];
                if (!valToken || valToken.type !== 'WORD') {
                    throw new Error(`Command "${cmdWord}" expects a color name or hex code`);
                }
                index++;
                expectTerminator(cmdWord);
                return { type: 'COLOR', value: valToken.value };
            }
            case 'width':
            case 'w': {
                const valToken = tokens[index];
                if (!valToken || valToken.type !== 'NUMBER') {
                    throw new Error(`Command "${cmdWord}" expects a number parameter`);
                }
                if (valToken.value < 0) throw new Error(`Width can't be less that 0`);
                index++;
                expectTerminator(cmdWord);
                return { type: 'WIDTH', value: valToken.value };
            }
            case 'clear':
            case 'cs': {
                expectTerminator(cmdWord);
                return { type: 'CLEAR' };
            }
            case 'repeat':
            case 'rep': {
                const countToken = tokens[index];
                if (!countToken || countToken.type !== 'NUMBER') {
                    throw new Error(`Command "repeat" expects a repeat count parameter`);
                }
                index++;
                const bracketToken = tokens[index];
                if (!bracketToken || bracketToken.type !== 'LBRACKET') {
                    throw new Error(`Command "repeat" expects a opening bracket "[" for loop body`);
                }
                index++;
                const loopCommands = parseCommands(true);
                const endBracketToken = tokens[index];
                if (!endBracketToken || endBracketToken.type !== 'RBRACKET') {
                    throw new Error(`Expected closing bracket "]" for repeat block`);
                }
                index++;
                expectTerminator('repeat');
                return { type: 'REPEAT', count: countToken.value, commands: loopCommands };
            }
            case 'circle':
            case 'c': {
                const valToken = tokens[index];
                if (!valToken || valToken.type !== 'NUMBER') {
                    throw new Error(`Command "${cmdWord}" expects a numeric radius`);
                }
                index++;
                expectTerminator(cmdWord);
                return { type: 'CIRCLE', radius: valToken.value };
            }
            case 'setxy': {
                const x = expectNumber(cmdWord);
                const y = expectNumber(cmdWord);
                expectTerminator(cmdWord);
                return { type: 'SETXY', x, y };
            }
            case 'home': {
                expectTerminator(cmdWord);
                return { type: 'HOME' };
            }
            case 'arc': {
                const radius = expectNumber(cmdWord);
                const startAngle = expectNumber(cmdWord);
                const endAngle = expectNumber(cmdWord);
                expectTerminator(cmdWord);
                return { type: 'ARC', radius, startAngle, endAngle };
            }
            case 'ellipse': {
                const rx = expectNumber(cmdWord);
                const ry = expectNumber(cmdWord);
                expectTerminator(cmdWord);
                return { type: 'ELLIPSE', rx, ry };
            }
            case 'polygon': {
                const start = tokens[index];
                if (!start || start.type !== 'LBRACKET') {
                    throw new Error('polygon expects "["');
                }
                index++;
                const points: Point[] = [];
                while (index < tokens.length && tokens[index].type !== 'RBRACKET') {
                    const x = expectNumber('polygon');
                    const y = expectNumber('polygon');
                    points.push({ x, y });
                }
                if (index >= tokens.length || tokens[index].type !== 'RBRACKET') {
                    throw new Error('polygon missing closing "]"');
                }
                index++; // consume closing bracket
                expectTerminator(cmdWord);
                return { type: 'POLYGON', points };
            }
            default:
                throw new Error(`Unknown command: "${cmdWord}"`);
        }
    }

    const parsed = parseCommands();
    if (index < tokens.length) {
        throw new Error(`Unexpected token at end of commands: "${tokens[index].type}"`);
    }
    return parsed.filter((cmd): cmd is Command => cmd !== null);
}