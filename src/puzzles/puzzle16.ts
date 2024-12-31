import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';

export const puzzle16 = new Puzzle({
    day: 16,
    parseInput: (fileData, { example }) => {
        return {
            seed: splitFilter(fileData, '').map((c) => c === '1'),
            isExample: example,
        };
    },
    part1: ({ seed, isExample }) => {
        const length = isExample ? 20 : 272;
        let data = seed;
        while (data.length < length) {
            data = generateData(data);
        }
        return print(checksum(data.slice(0, length)));
    },
    part2: ({ seed, isExample }) => {
        const length = isExample ? 20 : 35651584;
        let data = seed;
        while (data.length < length) {
            data = generateData(data);
        }
        return print(checksum(data.slice(0, length)));
    },
});

function generateData(data: boolean[]) {
    const a = data;
    return a.concat(
        [false],
        a.toReversed().map((x) => !x),
    );
}

function checksum(data: boolean[]) {
    let nIterations = 1;
    let nBits = 2;
    while ((data.length / 2 ** nIterations) % 2 === 0) {
        nIterations++;
        nBits *= 2;
    }
    const nextData: boolean[] = [];
    for (let i = 0; i < data.length; i += nBits) {
        const maxBit = i + nBits;
        let nTrue = 0;
        for (let j = i; j < maxBit; j++) {
            if (data[j]) {
                nTrue++;
            }
        }
        nextData.push(nTrue % 2 === 0);
    }
    return nextData;
}

function print(data: boolean[]) {
    return data.map(Number).join('');
}
