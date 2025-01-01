import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';

export const puzzle18 = new Puzzle({
    day: 18,
    parseInput: (fileData, { example }) => {
        const firstRow = splitFilter(fileData, '');
        return {
            firstRow,
            isExample: example,
        };
    },
    part1: ({ firstRow, isExample }) => {
        return countSafeTiles(firstRow, isExample ? 10 : 40);
    },
    part2: ({ firstRow, isExample }) => {
        return countSafeTiles(firstRow, isExample ? 10 : 400000);
    },
});

function countSafeTiles(firstRow: string[], height: number) {
    let nSafe = 0;

    let previousRow = firstRow.map((value) => value === '^');
    nSafe += previousRow.filter((isTrap) => !isTrap).length;

    for (let row = 1; row < height; row++) {
        previousRow = previousRow.map((_, col) => {
            const left = previousRow[col - 1] ?? false;
            const center = previousRow[col] ?? false;
            const right = previousRow[col + 1] ?? false;

            const isTrap =
                (left && center && !right) ||
                (center && right && !left) ||
                (left && !center && !right) ||
                (!left && !center && right);

            if (!isTrap) {
                nSafe++;
            }

            return isTrap;
        });
    }

    return nSafe;
}
