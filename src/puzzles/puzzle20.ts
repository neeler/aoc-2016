import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';

export const puzzle20 = new Puzzle({
    day: 20,
    parseInput: (fileData) => {
        return mergeRanges(
            splitFilter(fileData).map(
                (line) => line.split('-').map(Number) as [number, number],
            ),
        );
    },
    part1: (blacklist) => {
        let lowestAvailable = 0;

        for (const [start, end] of blacklist) {
            if (lowestAvailable >= start) {
                lowestAvailable = end + 1;
            }
        }

        return lowestAvailable;
    },
    part2: (blacklist, { example }) => {
        const maxIp = example ? 9 : 4294967295;

        let nAvailable = 0;
        let lowestAvailable = 0;

        for (const [start, end] of blacklist) {
            if (lowestAvailable < start) {
                nAvailable += start - lowestAvailable;
            }
            lowestAvailable = end + 1;
        }

        if (lowestAvailable <= maxIp) {
            nAvailable += maxIp - lowestAvailable + 1;
        }

        return nAvailable;
    },
});

function mergeRanges(ranges: [number, number][]): [number, number][] {
    if (ranges.length === 0) {
        return [];
    }

    const [firstRange, ...sortedRanges] = ranges.toSorted(([a], [b]) => a - b);

    const merged: [number, number][] = [];

    let currentRange = firstRange!;

    for (const [start, end] of sortedRanges) {
        if (start <= currentRange[1] + 1) {
            // start is within current range
            currentRange[1] = Math.max(currentRange[1], end);
        } else {
            // start is outside current range
            merged.push(currentRange);
            currentRange = [start, end];
        }
    }

    if (currentRange) {
        merged.push(currentRange);
    }

    return merged;
}
