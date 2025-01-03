import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';

type Register = 'a' | 'b' | 'c' | 'd';
type Operation = 'cpy' | 'inc' | 'dec' | 'jnz' | 'tgl' | 'addProduct';

class Instruction {
    string: string;
    op: Operation;
    x: string | number;
    y: string | number | undefined;
    z: string | number | undefined;

    constructor(
        str: string,
        {
            clearRegistersAfter,
        }: {
            clearRegistersAfter?: string[];
        } = {},
    ) {
        this.string = str;

        const [op, x, y, z] = str.split(' ');

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

        if (z !== undefined) {
            if (op !== 'addProduct') {
                throw new Error('z is only allowed for addProduct');
            }
            const zNum = Number.parseInt(z);
            if (!Number.isNaN(zNum)) {
                throw new Error('z must be a register');
            }
            this.z = z;
        }
    }

    toString() {
        return this.string;
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

    getValue(x: string | number) {
        return typeof x === 'number' ? x : this.registers[x as Register];
    }

    run() {
        let i = 0;
        let iterations = 0;
        while (i < this.instructions.length) {
            const instruction = this.instructions[i];
            if (!instruction) {
                break;
            }
            const { op, x, y } = instruction;

            switch (op) {
                case 'cpy': {
                    if (y && typeof y === 'string') {
                        this.registers[y as Register] = this.getValue(x);
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
                    if (this.getValue(x) === 0) {
                        i++;
                    } else {
                        i += this.getValue(y!);
                    }
                    break;
                }
                case 'tgl': {
                    const targetInstruction =
                        this.instructions[i + this.getValue(x)];

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
                case 'addProduct': {
                    this.registers[instruction.z as Register] +=
                        this.getValue(x) * this.getValue(y!);
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
        return optimize(
            splitFilter(fileData).map((line) => new Instruction(line)),
        );
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

const noop = new Instruction('jnz 0 0');

function findAddProduct(instructions: Instruction[], i: number) {
    const instruction = instructions[i]!;
    if (instruction.op !== 'cpy') {
        return null;
    }

    const input1 = instruction.x;
    const inputRegister = instruction.y as Register;
    const nextTwoInstructions = instructions.slice(i + 1, i + 3);
    const incInstruction = nextTwoInstructions.find(
        (instr) => instr.op === 'inc',
    );
    const decInstructionInner = nextTwoInstructions.find(
        (instr) => instr.op === 'dec' && instr.x === inputRegister,
    );
    const thirdInstruction = instructions[i + 3];
    if (
        !(
            incInstruction &&
            decInstructionInner &&
            thirdInstruction?.op === 'jnz' &&
            thirdInstruction.x === inputRegister &&
            thirdInstruction.y === -2
        )
    ) {
        return null;
    }

    const targetRegister = incInstruction.x as Register;
    const decInstructionOuter = instructions[i + 4];
    const lastInstruction = instructions[i + 5];
    if (
        !(
            decInstructionOuter &&
            decInstructionOuter.op === 'dec' &&
            lastInstruction &&
            lastInstruction.op === 'jnz' &&
            decInstructionOuter.x === lastInstruction.x &&
            lastInstruction.y === -5
        )
    ) {
        return null;
    }

    const input2 = decInstructionOuter.x;

    if (typeof input2 !== 'string') {
        return null;
    }

    return [
        new Instruction(`addProduct ${input1} ${input2} ${targetRegister}`),
        new Instruction(`cpy 0 ${inputRegister}`),
        new Instruction(`cpy 0 ${input2}`),
        noop,
        noop,
        noop,
    ];
}

function optimize(instructions: Instruction[]): Instruction[] {
    const optimized: Instruction[] = [];
    let i = 0;
    while (i < instructions.length) {
        const instruction = instructions[i]!;

        const addProductInstructions = findAddProduct(instructions, i);
        if (addProductInstructions) {
            optimized.push(...addProductInstructions);
            i += addProductInstructions.length;
            continue;
        }

        optimized.push(instruction);
        i++;
    }
    return optimized;
}
