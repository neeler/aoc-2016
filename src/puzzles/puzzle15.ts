import { Puzzle } from './Puzzle';
import { getNumbersForEachLine } from '~/util/parsing';
import { mod } from '~/util/arithmetic';

interface Disc {
    nPositions: number;
    initialPosition: number;
    relativePosition: number;
}

export const puzzle15 = new Puzzle({
    day: 15,
    parseInput: (fileData) => {
        return getNumbersForEachLine(fileData).map((line, index): Disc => {
            const [, nPositions, , initialPosition] = line as [
                number,
                number,
                number,
                number,
            ];
            return {
                nPositions,
                initialPosition,
                relativePosition: mod(initialPosition + index + 1, nPositions),
            };
        });
    },
    part1: (discs) => {
        return findButtonPressTime(discs);
    },
    part2: (discs) => {
        discs.push({
            nPositions: 11,
            initialPosition: 0,
            relativePosition: mod(discs.length + 1, 11),
        });
        return findButtonPressTime(discs);
    },
});

function findButtonPressTime(discs: Disc[]): number {
    let i = 0;
    while (true) {
        if (
            discs.every(
                (disc) => mod(i + disc.relativePosition, disc.nPositions) === 0,
            )
        ) {
            return i;
        }
        i++;
    }
}
