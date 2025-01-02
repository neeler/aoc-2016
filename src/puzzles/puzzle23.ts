import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import { range } from '~/util/range';

type Register = 'a' | 'b' | 'c' | 'd';
type Operation = 'cpy' | 'inc' | 'dec' | 'jnz' | 'tgl';

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

    constructor(private instructions: Instruction[]) {}

    run() {
        let i = 0;
        let iterations = 0;
        while (i < this.instructions.length) {
            if (
                range(i, i + 6)
                    .map((i) => this.instructions[i])
                    .join('\n') ===
                [
                    'cpy b c',
                    'inc a',
                    'dec c',
                    'jnz c -2',
                    'dec d',
                    'jnz d -5',
                ].join('\n')
            ) {
                this.registers.a = this.registers.b * this.registers.d;
                this.registers.c = 0;
                this.registers.d = 0;
                i += 6;
                continue;
            }
            if (
                range(i, i + 3)
                    .map((i) => this.instructions[i])
                    .join('\n') === ['dec d', 'inc c', 'jnz d -2'].join('\n')
            ) {
                this.registers.c += this.registers.d;
                this.registers.d = 0;
                i += 3;
                continue;
            }
            if (
                range(i, i + 3)
                    .map((i) => this.instructions[i])
                    .join('\n') === ['inc a', 'dec d', 'jnz d -2'].join('\n')
            ) {
                this.registers.a += this.registers.d;
                this.registers.d = 0;
                i += 3;
                continue;
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
                    } else {
                        console.log('skipping inc', instruction.toString());
                    }
                    break;
                }
                case 'dec': {
                    if (typeof x === 'string') {
                        this.registers[x as Register]--;
                        i++;
                    } else {
                        console.log('skipping dec', instruction.toString());
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
            }
            iterations++;
        }
    }
}

export const puzzle23 = new Puzzle({
    day: 23,
    parseInput: (fileData) => {
        return splitFilter(fileData).map((line) => new Instruction(line));
    },
    part1: (instructions) => {
        const computer = new Computer(instructions);
        computer.registers.a = 7;
        computer.run();
        return computer.registers.a;
    },
    part2: (instructions) => {
        const computer = new Computer(instructions);
        computer.registers.a = 12;
        computer.run();
        return computer.registers.a;
    },
});
