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
    | { type: 'CLEAR' };

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

    function parseCommands(): Command[] {
        const commands: Command[] = [];
        while (index < tokens.length) {
            const token = tokens[index];
            if (token.type === 'RBRACKET') {
                break;
            }
            const cmd = parseCommand();
            if (cmd) {
                commands.push(cmd);
            }
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
                expectSemicolon(cmdWord);
                return { type: 'FORWARD', value: valToken.value };
            }
            case 'backward':
            case 'bk': {
                const valToken = tokens[index];
                if (!valToken || valToken.type !== 'NUMBER') {
                    throw new Error(`Command "${cmdWord}" expects a number parameter`);
                }
                index++;
                expectSemicolon(cmdWord);
                return { type: 'BACKWARD', value: valToken.value };
            }
            case 'left':
            case 'lt': {
                const valToken = tokens[index];
                if (!valToken || valToken.type !== 'NUMBER') {
                    throw new Error(`Command "${cmdWord}" expects a number parameter`);
                }
                index++;
                expectSemicolon(cmdWord);
                return { type: 'LEFT', value: valToken.value };
            }
            case 'right':
            case 'rt': {
                const valToken = tokens[index];
                if (!valToken || valToken.type !== 'NUMBER') {
                    throw new Error(`Command "${cmdWord}" expects a number parameter`);
                }
                index++;
                expectSemicolon(cmdWord);
                return { type: 'RIGHT', value: valToken.value };
            }
            case 'penup':
            case 'pu': {
                expectSemicolon(cmdWord);
                return { type: 'PENUP' };
            }
            case 'pendown':
            case 'pd': {
                expectSemicolon(cmdWord);
                return { type: 'PENDOWN' };
            }
            case 'color':
            case 'col': {
                const valToken = tokens[index];
                if (!valToken || valToken.type !== 'WORD') {
                    throw new Error(`Command "${cmdWord}" expects a color name or hex code`);
                }
                index++;
                expectSemicolon(cmdWord);
                return { type: 'COLOR', value: valToken.value };
            }
            case 'width':
            case 'w': {
                const valToken = tokens[index];
                if (!valToken || valToken.type !== 'NUMBER') {
                    throw new Error(`Command "${cmdWord}" expects a number parameter`);
                }
                if (valToken.value < 0) throw new Error(`Width can't be less that 0`)
                index++;
                expectSemicolon(cmdWord);
                return { type: 'WIDTH', value: valToken.value };
            }
            case 'clear':
            case 'cs': {
                expectSemicolon(cmdWord);
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

                const loopCommands = parseCommands();

                const endBracketToken = tokens[index];
                if (!endBracketToken || endBracketToken.type !== 'RBRACKET') {
                    throw new Error(`Expected closing bracket "]" for repeat block`);
                }
                index++;
                expectSemicolon('repeat');

                return { type: 'REPEAT', count: countToken.value, commands: loopCommands };
            }
            default:
                throw new Error(`Unknown command: "${cmdWord}"`);
        }
    }

    function expectSemicolon(cmdName: string) {
        if (index >= tokens.length) {
            throw new Error(`Expected semicolon ";" at the end of "${cmdName}" command`);
        }
        if (tokens[index].type !== 'SEMICOLON') {
            throw new Error(`Expected semicolon ";" after "${cmdName}" command parameters, got "${tokens[index].type === 'WORD' ? tokens[index] : tokens[index].type}"`);
        }
        index++;
    }

    const parsed = parseCommands();
    if (index < tokens.length) {
        throw new Error(`Unexpected token at end of commands: "${tokens[index].type}"`);
    }

    // Filter out null elements (which happen when we parse plain SEMICOLONs)
    return parsed.filter(cmd => cmd !== null) as Command[];
}
