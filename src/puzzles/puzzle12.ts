import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';

type Register = 'a' | 'b' | 'c' | 'd';
type Operation = 'cpy' | 'inc' | 'dec' | 'jnz';

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
        while (i < this.instructions.length) {
            const instruction = this.instructions[i];
            if (!instruction) {
                break;
            }
            const { op, x, y } = instruction;
            switch (op) {
                case 'cpy': {
                    this.registers[y as Register] =
                        typeof x === 'number'
                            ? x
                            : this.registers[x as Register];
                    i++;
                    break;
                }
                case 'inc': {
                    this.registers[x as Register]++;
                    i++;
                    break;
                }
                case 'dec': {
                    this.registers[x as Register]--;
                    i++;
                    break;
                }
                case 'jnz': {
                    if (this.registers[x as Register] === 0) {
                        i++;
                    } else {
                        i +=
                            typeof y === 'number'
                                ? y
                                : this.registers[y as Register];
                    }
                    break;
                }
            }
        }
    }
}

export const puzzle12 = new Puzzle({
    day: 12,
    parseInput: (fileData) => {
        return splitFilter(fileData).map((line) => new Instruction(line));
    },
    part1: (instructions) => {
        const computer = new Computer(instructions);
        computer.run();
        return computer.registers.a;
    },
    part2: (instructions) => {
        const computer = new Computer(instructions);
        computer.registers.c = 1;
        computer.run();
        return computer.registers.a;
    },
});
