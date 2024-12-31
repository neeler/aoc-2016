import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';

export const puzzle16 = new Puzzle({
    day: 16,
    parseInput: (fileData, { example }) => {
        return {
            data: splitFilter(fileData, '').map((c) => c === '1'),
            isExample: example,
        };
    },
    part1: ({ data, isExample }) => {
        const length = isExample ? 20 : 272;
        return print(calculateChecksum(generateData(data, length)));
    },
    part2: ({ data, isExample }) => {
        const length = isExample ? 20 : 35651584;
        return print(calculateChecksum(generateData(data, length)));
    },
});

function generateData(data: boolean[], discLength: number) {
    const a = data;
    const b = a.toReversed().map((x) => !x);
    const nextData = [...a, false, ...b];
    if (nextData.length < discLength) {
        return generateData(nextData, discLength);
    }
    return nextData.slice(0, discLength);
}

function calculateChecksum(data: boolean[]) {
    const nextData: boolean[] = [];
    for (let i = 0; i < data.length; i += 2) {
        nextData.push(data[i] === data[i + 1]);
    }
    if (nextData.length % 2 === 0) {
        return calculateChecksum(nextData);
    }
    return nextData;
}

function print(data: boolean[]) {
    return data.map((x) => (x ? '1' : '0')).join('');
}
