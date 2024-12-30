import { Puzzle } from './Puzzle';
import { getNumbersForEachLine } from '~/util/parsing';
import { Grid } from '~/types/Grid';

type Spec = [number, number, number];

export const puzzle3 = new Puzzle({
    day: 3,
    parseInput: (fileData) => {
        return getNumbersForEachLine(fileData) as Spec[];
    },
    part1: (specs) => {
        return specs.filter(isValidTriangle).length;
    },
    part2: (data) => {
        const grid = Grid.from2DArray<number, number>(
            data,
            ({ input }) => input,
        );
        const specs: Spec[] = [];
        for (let row = 0; row < grid.height; row += 3) {
            for (let col = 0; col < grid.width; col++) {
                specs.push([
                    grid.getAt(row, col)!,
                    grid.getAt(row + 1, col)!,
                    grid.getAt(row + 2, col)!,
                ]);
            }
        }
        return specs.filter(isValidTriangle).length;
    },
});

function isValidTriangle([a, b, c]: Spec): boolean {
    return a + b > c && a + c > b && b + c > a;
}
