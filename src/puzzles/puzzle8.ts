import { Puzzle } from './Puzzle';
import { getNumbers, splitFilter } from '~/util/parsing';
import { Grid, GridNode } from '~/types/Grid';
import { mod } from '~/util/arithmetic';
import { getSmallAsciiCharacter } from '~/util/ascii';

interface Instruction {
    instruction: 'rect' | 'rotate column' | 'rotate row';
    a: number;
    b: number;
}

class Node extends GridNode {
    isOn = false;

    toString() {
        return this.isOn ? '#' : '.';
    }
}

export const puzzle8 = new Puzzle({
    day: 8,
    parseInput: (fileData, { example }) => {
        const instructions: Instruction[] = splitFilter(fileData).map(
            (line) => {
                const [a, b] = getNumbers(line) as [number, number];
                return {
                    instruction: line.startsWith('rect')
                        ? 'rect'
                        : line.includes('row')
                          ? 'rotate row'
                          : 'rotate column',
                    a,
                    b,
                };
            },
        );
        const grid = Grid.fromSize<Node>({
            width: example ? 7 : 50,
            height: example ? 3 : 6,
            defaultValue: (row, col) => new Node({ row, col }),
        });
        return {
            instructions,
            grid,
        };
    },
    part1: ({ instructions, grid }) => {
        runInstructions(grid, instructions);
        return grid.filter((node) => node.isOn).length;
    },
    part2: ({ instructions, grid }) => {
        runInstructions(grid, instructions);
        grid.draw();
        const characters: string[][] = [];
        for (let col = 0; col < grid.width; col += 5) {
            const pixels: string[][] = [];
            for (let row = 0; row < grid.height; row++) {
                pixels.push(
                    grid
                        .getRow(row)
                        .map((node) => (node?.isOn ? '#' : '.'))
                        .slice(col, col + 5),
                );
            }
            characters.push(pixels.map((row) => row.join('')));
        }
        return characters.map(getSmallAsciiCharacter).join('');
    },
});

function runInstructions(grid: Grid<Node>, instructions: Instruction[]) {
    instructions.forEach(({ instruction, a, b }) => {
        switch (instruction) {
            case 'rect': {
                for (let row = 0; row < b; row++) {
                    for (let col = 0; col < a; col++) {
                        grid.get({ row, col })!.isOn = true;
                    }
                }
                break;
            }
            case 'rotate row': {
                const row = a;
                const shift = b;
                const originalRow = grid
                    .getRow(row)
                    .map((node) => !!node?.isOn);
                for (let col = 0; col < grid.width; col++) {
                    grid.get({ row, col })!.isOn =
                        originalRow[mod(col - shift, grid.width)]!;
                }
                break;
            }
            case 'rotate column': {
                const col = a;
                const shift = b;
                const originalCol = grid
                    .getColumn(col)
                    .map((node) => !!node?.isOn);
                for (let row = 0; row < grid.height; row++) {
                    grid.get({ row, col })!.isOn =
                        originalCol[mod(row - shift, grid.height)]!;
                }
                break;
            }
        }
    });
}
