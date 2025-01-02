import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import { mod } from '~/util/arithmetic';

type Instruction =
    | { type: 'swapPosition'; x: number; y: number }
    | { type: 'swapLetter'; x: string; y: string }
    | { type: 'rotateBasedOn'; x: string }
    | { type: 'rotate'; dir: 'left' | 'right'; steps: number }
    | { type: 'reverse'; x: number; y: number }
    | { type: 'move'; x: number; y: number };

export const puzzle21 = new Puzzle({
    day: 21,
    parseInput: (fileData) => {
        return splitFilter(fileData).map((line): Instruction => {
            const words = line.split(' ');
            switch (words[0]) {
                case 'swap': {
                    switch (words[1]) {
                        case 'position': {
                            return {
                                type: 'swapPosition',
                                x: Number(words[2]),
                                y: Number(words[5]),
                            };
                        }
                        case 'letter': {
                            return {
                                type: 'swapLetter',
                                x: words[2]!,
                                y: words[5]!,
                            };
                        }
                    }
                    break;
                }
                case 'rotate': {
                    switch (words[1]) {
                        case 'left':
                        case 'right': {
                            return {
                                type: 'rotate',
                                dir: words[1] as 'left' | 'right',
                                steps: Number(words[2]),
                            };
                        }
                        case 'based': {
                            return {
                                type: 'rotateBasedOn',
                                x: words[6]!,
                            };
                        }
                    }
                    break;
                }
                case 'reverse': {
                    return {
                        type: 'reverse',
                        x: Number(words[2]),
                        y: Number(words[4]),
                    };
                }
                case 'move': {
                    return {
                        type: 'move',
                        x: Number(words[2]),
                        y: Number(words[5]),
                    };
                }
            }
            throw new Error(`Invalid instruction: ${line}`);
        });
    },
    part1: (instructions, { example }) => {
        return instructions
            .reduce(
                (password, instruction) => {
                    switch (instruction.type) {
                        case 'swapPosition': {
                            return swap(password, instruction.x, instruction.y);
                        }
                        case 'swapLetter': {
                            return swap(
                                password,
                                password.indexOf(instruction.x),
                                password.indexOf(instruction.y),
                            );
                        }
                        case 'rotate': {
                            return rotate(
                                password,
                                instruction.dir === 'left'
                                    ? instruction.steps
                                    : -instruction.steps,
                            );
                        }
                        case 'rotateBasedOn': {
                            return rotateBasedOnIndex(password, instruction.x);
                        }
                        case 'reverse': {
                            return reverseBetween(
                                password,
                                instruction.x,
                                instruction.y,
                            );
                        }
                        case 'move': {
                            const char = password.splice(instruction.x, 1)[0]!;
                            password.splice(instruction.y, 0, char);
                            return password;
                        }
                    }
                },
                (example ? 'abcde' : 'abcdefgh').split(''),
            )
            .join('');
    },
    part2: (instructions, { example }) => {
        return instructions
            .reverse()
            .reduce(
                (password, instruction) => {
                    // console.log(password.join(''), instruction);
                    switch (instruction.type) {
                        case 'swapPosition': {
                            // Doesn't change
                            return swap(password, instruction.x, instruction.y);
                        }
                        case 'swapLetter': {
                            // Doesn't change
                            return swap(
                                password,
                                password.indexOf(instruction.x),
                                password.indexOf(instruction.y),
                            );
                        }
                        case 'rotate': {
                            // Switch direction
                            return rotate(
                                password,
                                instruction.dir === 'right'
                                    ? instruction.steps
                                    : -instruction.steps,
                            );
                        }
                        case 'rotateBasedOn': {
                            // Find the rotation that produced the current password
                            for (let i = 0; i < password.length; i++) {
                                const rotated = rotate(password, i);
                                if (
                                    rotateBasedOnIndex(
                                        rotated,
                                        instruction.x,
                                    ).join('') === password.join('')
                                ) {
                                    return rotated;
                                }
                            }
                            throw new Error(
                                `Could not find rotation for ${instruction.x}`,
                            );
                        }
                        case 'reverse': {
                            // Doesn't change
                            return reverseBetween(
                                password,
                                instruction.x,
                                instruction.y,
                            );
                        }
                        case 'move': {
                            const char = password.splice(instruction.y, 1)[0]!;
                            password.splice(instruction.x, 0, char);
                            return password;
                        }
                    }
                },
                (example ? 'decab' : 'fbgdceah').split(''),
            )
            .join('');
    },
});

function reverseBetween(password: string[], x: number, y: number): string[] {
    const oldPassword = password.slice();
    for (let i = x; i <= y; i++) {
        password[i] = oldPassword[y - i + x]!;
    }
    return password;
}

function swap(password: string[], x: number, y: number): string[] {
    let firstLetter = password[x]!;
    password[x] = password[y]!;
    password[y] = firstLetter;
    return password;
}

function rotate(password: string[], steps: number): string[] {
    return password.map((_, i) => password[mod(i + steps, password.length)]!);
}

function rotateBasedOnIndex(password: string[], x: string): string[] {
    const index = password.indexOf(x);
    return rotate(password, -(1 + index + (index >= 4 ? 1 : 0)));
}
