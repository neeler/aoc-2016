import { Puzzle } from './Puzzle';
import { getNumbers } from '~/util/parsing';
import { mod } from '~/util/arithmetic';
import { range } from '~/util/range';

export const puzzle19 = new Puzzle({
    day: 19,
    parseInput: (fileData) => {
        return getNumbers(fileData)[0]!;
    },
    part1: (nElves) => {
        if (nElves === 1) {
            return 1;
        }

        /**
         * The Josephus Problem
         * https://www.youtube.com/watch?v=uCsD3ZGzMgE
         */
        const nElvesBinary = nElves.toString(2);
        const powersOfTwo = nElvesBinary.length - 1;
        const leftover = nElves - 2 ** powersOfTwo;
        return 2 * leftover + 1;
    },
    part2: (nElves) => {
        const nElvesTernary = nElves.toString(3);
        const powersOfThree = nElvesTernary.length - 1;
        const leftover = nElves - 3 ** powersOfThree;

        if (leftover === 0) {
            return nElves;
        }

        if (leftover > 3 ** powersOfThree) {
            const leftoverPowersOfThree = Math.max(
                0,
                leftover.toString(3).length - 1,
            );
            const leftoverLeftover = Math.max(
                0,
                leftover - 3 ** leftoverPowersOfThree,
            );
            return leftover + leftoverLeftover;
        }

        return leftover;
    },
});

/**
 * Brute force solution for part 2.
 * I used this to observe the pattern and come up with the formula.
 * It can actually solve my input, though it takes a long time (16 minutes on my laptop).
 */
function bruteForceSolvePart2(nElves: number) {
    const elves = range(1, nElves + 1);

    let i = 0;
    let totalIterations = 0;

    while (elves.length > 1) {
        const nextElfIndex = mod(
            i + Math.floor(elves.length / 2),
            elves.length,
        );

        elves.splice(nextElfIndex, 1);

        i = mod(nextElfIndex > i ? i + 1 : i, elves.length);
        totalIterations++;
    }

    return elves[0]!;
}
