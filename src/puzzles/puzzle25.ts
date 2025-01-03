import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';

type Register = 'a' | 'b' | 'c' | 'd';
type Operation =
    | 'cpy'
    | 'inc'
    | 'dec'
    | 'jnz'
    | 'tgl'
    | 'addProduct'
    | 'out'
    | 'addQuotient';

class Instruction {
    string: string;
    op: Operation;
    x: string | number;
    y: string | number | undefined;
    z: string | number | undefined;
    a: string | undefined;

    constructor(str: string) {
        this.string = str;

        const [op, x, y, z, a] = str.split(' ');

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
            if (!['addProduct', 'addQuotient'].includes(this.op)) {
                throw new Error(
                    'z is only allowed for addProduct or addQuotient',
                );
            }
            const zNum = Number.parseInt(z);
            if (!Number.isNaN(zNum)) {
                throw new Error('z must be a register');
            }
            this.z = z;
        }

        if (a !== undefined) {
            if (this.op !== 'addQuotient') {
                throw new Error('a is only allowed for addQuotient');
            }
            const aNum = Number.parseInt(a);
            if (!Number.isNaN(aNum)) {
                throw new Error('a must be a register');
            }
            this.a = a;
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
    output: number[] = [];
    statesSeen = new Set<string>();

    constructor(private instructions: Instruction[]) {}

    getValue(x: string | number) {
        return typeof x === 'number' ? x : this.registers[x as Register];
    }

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

            const { op, x, y, z, a } = instruction;

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
                    this.registers[z as Register] +=
                        this.getValue(x) * this.getValue(y!);
                    i++;
                    break;
                }
                case 'addQuotient': {
                    const flooredResult = Math.floor(
                        this.getValue(x) / this.getValue(y!),
                    );
                    const remainder =
                        this.getValue(x) - this.getValue(y!) * flooredResult;
                    this.registers[z as Register] += Math.floor(
                        this.getValue(x) / this.getValue(y!),
                    );
                    this.registers[a as Register] =
                        remainder === 0 ? this.getValue(y!) : remainder;
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
        return optimize(
            splitFilter(fileData).map((line) => new Instruction(line)),
        );
    },
    part1: (instructions) => {
        let i = 0;
        while (true) {
            const computer = new Computer(instructions);
            computer.registers.a = i;
            try {
                computer.run();
            } catch (err) {
                const outputLength = computer.output.length;
                const nRepetitionsExpected = Math.floor(outputLength / 2);
                if (
                    computer.output.join('') ===
                    '01'.repeat(nRepetitionsExpected)
                ) {
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

function findAddQuotient(instructions: Instruction[], i: number) {
    const instruction = instructions[i]!;
    if (instruction.op !== 'cpy') {
        return null;
    }

    const innerInput = instruction.x;
    const innerInputRegister = instruction.y as Register;

    const conditionalJump = instructions[i + 1];
    if (conditionalJump?.op !== 'jnz' || conditionalJump.y !== 2) {
        return null;
    }

    const conditionValue = conditionalJump.x;
    if (typeof conditionValue !== 'string') {
        return null;
    }

    const jumpOut = instructions[i + 2];
    if (jumpOut?.string !== 'jnz 1 6') {
        return null;
    }

    const nextTwoInstructions = instructions.slice(i + 3, i + 5);
    if (nextTwoInstructions.some((instr) => instr.op !== 'dec')) {
        return null;
    }

    const decInstructionMatchingInput = nextTwoInstructions.find(
        (instr) => instr.x === innerInputRegister,
    );
    const decInstructionNotMatchingInput = nextTwoInstructions.find(
        (instr) => instr.x !== innerInputRegister,
    );
    if (
        !decInstructionMatchingInput ||
        !decInstructionNotMatchingInput ||
        decInstructionNotMatchingInput.x !== conditionValue
    ) {
        return null;
    }

    const mainInput = decInstructionNotMatchingInput.x;
    const nextJump = instructions[i + 5];
    if (nextJump?.string !== `jnz ${innerInputRegister} -4`) {
        return null;
    }

    const incInstruction = instructions[i + 6];
    if (incInstruction?.op !== 'inc') {
        return null;
    }
    const targetRegister = incInstruction.x as Register;

    const lastJump = instructions[i + 7];
    if (lastJump?.string !== 'jnz 1 -7') {
        return null;
    }

    return [
        new Instruction(
            `addQuotient ${mainInput} ${innerInput} ${targetRegister} ${innerInputRegister}`,
        ),
        new Instruction(`cpy 0 ${conditionValue}`),
        noop,
        noop,
        noop,
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

        const addQuotientInstructions = findAddQuotient(instructions, i);
        if (addQuotientInstructions) {
            optimized.push(...addQuotientInstructions);
            i += addQuotientInstructions.length;
            continue;
        }

        optimized.push(instruction);
        i++;
    }
    return optimized;
}
