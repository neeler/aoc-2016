import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import { DirectionKeys, Grid, GridCoordinate, GridNode } from '~/types/Grid';

const LetterToDirection = {
    U: DirectionKeys.up,
    D: DirectionKeys.down,
    L: DirectionKeys.left,
    R: DirectionKeys.right,
} as const;

class Node extends GridNode {
    value: string;
    isKey: boolean;

    constructor({ row, col, input }: GridCoordinate & { input: string }) {
        super({ row, col });
        this.value = input;
        this.isKey = input.trim().length > 0;
    }

    toString(): string {
        return this.value;
    }
}

export const puzzle2 = new Puzzle({
    day: 2,
    parseInput: (fileData) => {
        return splitFilter(fileData).map((line) => splitFilter(line, ''));
    },
    part1: (instructions) => {
        return getCode(
            Grid.stringToNodeGrid(
                `
123
456
789`,
                (data) => new Node(data),
            ),
            instructions,
        );
    },
    part2: (instructions) => {
        return getCode(
            Grid.stringToNodeGrid(
                `
  1
 234
56789
 ABC
  D`,
                (data) => new Node(data),
            ),
            instructions,
        );
    },
});

function getCode(keypad: Grid<Node>, instructions: string[][]): string {
    let code = '';
    let node = keypad.find((node) => node.value === '5')!;

    for (const line of instructions) {
        for (const instruction of line) {
            const direction =
                LetterToDirection[
                    instruction as keyof typeof LetterToDirection
                ];
            const nextNode = keypad.getNeighborInDirection(
                node.row,
                node.col,
                direction,
            );
            if (nextNode?.isKey) {
                node = nextNode;
            }
        }
        code += node.value;
    }

    return code;
}
