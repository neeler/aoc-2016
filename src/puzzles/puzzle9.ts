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
        let totalChars = 0;
        let marker = findMarker(data);
        let decompressed = data;

        while (marker) {
            const markerIndex = marker?.index ?? 0;
            totalChars += markerIndex;
            if (markerIndex > 0) {
                decompressed = decompressed.slice(markerIndex);
            }

            const [fullMatch, nChars, repCount] = marker as [
                string,
                string,
                string,
            ];
            const start = fullMatch.length;
            const end = start + parseInt(nChars, 10);
            const toRepeat = decompressed.slice(start, end);
            const nRepeats = parseInt(repCount, 10);
            if (findMarker(toRepeat)) {
                const decompressedSegment = toRepeat.repeat(nRepeats);
                decompressed = decompressedSegment + decompressed.slice(end);
            } else {
                totalChars += toRepeat.length * nRepeats;
                decompressed = decompressed.slice(end);
            }

            marker = findMarker(decompressed);
        }

        return totalChars + decompressed.length;
    },
});

function findMarker(data: string) {
    return data.match(/\((\d+)x(\d+)\)/);
}
