import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';

type Register = 'a' | 'b' | 'c' | 'd';
type Operation = 'cpy' | 'inc' | 'dec' | 'jnz' | 'tgl' | 'out';

class Instruction {
    op: Operation;
    x: string | number;
    y: string | number | undefined;

    constructor(str: string) {
        const [op, x, y] = str.split(' ');

        this.op = op as Operation;

        if (x === undefined) {
            throw new Error('x is undefined');
        }
        const xNum = Number.parseInt(x);
        this.x = Number.isNaN(xNum) ? x : xNum;

        if (y !== undefined) {
            const yNum = Number.parseInt(y);
            this.y = Number.isNaN(yNum) ? y : yNum;
        }
    }

    toString() {
        return `${this.op} ${this.x} ${this.y ?? ''}`.trim();
    }
}

class Computer {
    readonly registers = {
        a: 0,
        b: 0,
        c: 0,
        d: 0,
    };
    output: number[] = [];
    statesSeen = new Set<string>();

    constructor(private instructions: Instruction[]) {}

    getStateKey(iInstruction: number) {
        return `${iInstruction}:${Object.values(this.registers).join(',')}`;
    }

    run() {
        let i = 0;
        let iterations = 0;
        while (i < this.instructions.length) {
            const stateKey = this.getStateKey(i);
            if (this.statesSeen.has(stateKey)) {
                throw new Error('Infinite loop detected');
            }

            const instruction = this.instructions[i];
            if (!instruction) {
                break;
            }
            const { op, x, y } = instruction;
            switch (op) {
                case 'cpy': {
                    if (y && typeof y === 'string') {
                        this.registers[y as Register] =
                            typeof x === 'number'
                                ? x
                                : this.registers[x as Register];
                    } else {
                        console.log('skipping cpy', instruction.toString());
                    }
                    i++;
                    break;
                }
                case 'inc': {
                    if (typeof x === 'string') {
                        this.registers[x as Register]++;
                        i++;
                    }
                    break;
                }
                case 'dec': {
                    if (typeof x === 'string') {
                        this.registers[x as Register]--;
                        i++;
                    }
                    break;
                }
                case 'jnz': {
                    const xVal =
                        typeof x === 'number'
                            ? x
                            : this.registers[x as Register];
                    if (xVal === 0) {
                        i++;
                    } else {
                        i +=
                            typeof y === 'number'
                                ? y
                                : this.registers[y as Register];
                    }
                    break;
                }
                case 'tgl': {
                    const targetInstruction =
                        this.instructions[
                            i +
                                (typeof x === 'number'
                                    ? x
                                    : this.registers[x as Register])
                        ];
                    switch (targetInstruction?.op) {
                        case 'inc':
                            targetInstruction.op = 'dec';
                            break;
                        case 'dec':
                        case 'tgl':
                            targetInstruction.op = 'inc';
                            break;
                        case 'jnz':
                            targetInstruction.op = 'cpy';
                            break;
                        case 'cpy':
                            targetInstruction.op = 'jnz';
                            break;
                    }
                    i++;
                    break;
                }
                case 'out': {
                    this.output.push(
                        typeof x === 'number'
                            ? x
                            : this.registers[x as Register],
                    );
                    i++;
                    break;
                }
            }
            iterations++;

            this.statesSeen.add(stateKey);
        }
    }
}

export const puzzle25 = new Puzzle({
    day: 25,
    parseInput: (fileData) => {
        return splitFilter(fileData).map((line) => new Instruction(line));
    },
    part1: (instructions) => {
        let i = 0;
        while (true) {
            const computer = new Computer(instructions);
            computer.registers.a = i;
            try {
                computer.run();
            } catch (err) {
                if (computer.output.join('') === '01'.repeat(6)) {
                    return i;
                }
            }
            i++;
        }
    },
    part2: () => {
        return true;
    },
});
