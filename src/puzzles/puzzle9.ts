import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';

export const puzzle9 = new Puzzle({
    day: 9,
    parseInput: (fileData) => {
        return splitFilter(fileData)[0]!;
    },
    part1: (data) => {
        let decompressed = '';
        for (let i = 0; i < data.length; i++) {
            const char = data[i]!;
            if (char === '(') {
                const match = findMarker(data.slice(i));
                if (!match) {
                    decompressed += char;
                } else {
                    const [fullMatch, nChars, repCount] = match as [
                        string,
                        string,
                        string,
                    ];
                    const start = i + fullMatch.length;
                    const end = start + parseInt(nChars, 10);
                    const toRepeat = data.slice(start, end);
                    decompressed += toRepeat.repeat(parseInt(repCount, 10));
                    i = end - 1;
                }
            } else {
                decompressed += char;
            }
        }
        return decompressed.length;
    },
    part2: (data) => {
        const chars = data.split('');
        const weights = Array<number>(chars.length).fill(1);

        let sum = 0;
        let i = 0;

        while (i < chars.length) {
            const char = chars[i]!;
            if (char === '(') {
                const match = findMarker(data.slice(i));
                if (match) {
                    const [fullMatch, nChars, repCount] = match as [
                        string,
                        string,
                        string,
                    ];
                    const startOfStringToRepeat = i + fullMatch.length;
                    const endOfStringToRepeat =
                        startOfStringToRepeat + Number(nChars);
                    const nRepeats = Number(repCount);

                    for (
                        let j = startOfStringToRepeat;
                        j < endOfStringToRepeat;
                        j++
                    ) {
                        weights[j] = nRepeats * weights[j]!;
                    }
                    i = startOfStringToRepeat;
                } else {
                    sum += weights[i]!;
                    i++;
                }
            } else {
                sum += weights[i]!;
                i++;
            }
        }

        return sum;
    },
});

function findMarker(data: string) {
    return data.match(/\((\d+)x(\d+)\)/);
}
