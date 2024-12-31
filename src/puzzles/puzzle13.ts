import { Puzzle } from './Puzzle';
import { getNumbers } from '~/util/parsing';
import { sum } from '~/util/arithmetic';
import { Maze } from '~/types/Maze';
import { GridCoordinateSet } from '~/types/Grid';

export const puzzle13 = new Puzzle({
    day: 13,
    parseInput: (fileData, { example }) => {
        const favoriteNumber = getNumbers(fileData)[0]!;
        const maze = new Maze({
            width: example ? 10 : 50,
            height: example ? 7 : 50,
        });
        maze.forEach((node) => {
            if (!node) return;

            const { row, col } = node;

            const n =
                col * col +
                3 * col +
                2 * col * row +
                row +
                row * row +
                favoriteNumber;
            const binary = n.toString(2).split('').map(Number);
            const numOnes = sum(binary);

            node.obstacle = numOnes % 2 === 1;
        });
        return {
            favoriteNumber,
            maze,
            isExample: example,
        };
    },
    part1: ({ maze, isExample }) => {
        return maze.score({
            start: { row: 1, col: 1 },
            end: isExample ? { row: 4, col: 7 } : { row: 39, col: 31 },
        });
    },
    part2: ({ maze }) => {
        const maxSteps = 50;
        const reachable = new GridCoordinateSet();
        const start = { row: 1, col: 1 };
        maze.forEach((node) => {
            if (!node || Maze.manhattanDistance(start, node) > maxSteps) {
                return;
            }
            if (maze.score({ start, end: node }) <= maxSteps) {
                reachable.add(node);
            }
        });
        return reachable.size;
    },
});
