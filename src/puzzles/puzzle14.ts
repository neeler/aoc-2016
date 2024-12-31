import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import crypto from 'crypto';

export const puzzle14 = new Puzzle({
    day: 14,
    parseInput: (fileData) => {
        return splitFilter(fileData)[0]!;
    },
    part1: (salt) => {
        return getKey(salt, 64);
    },
    part2: (salt) => {
        return getKey(salt, 64, 2017);
    },
});

function calculateHash(str: string, iterations = 1) {
    if (iterations === 0) {
        return str;
    }

    return calculateHash(
        crypto.createHash('md5').update(str).digest('hex'),
        iterations - 1,
    );
}

function getKey(salt: string, iKey: number, hashIterations = 1) {
    let i = 0;

    const keys: { key: string; index: number; quintupletAt: number }[] = [];
    const keysUsed = new Set<string>();
    let highestRelevantKeyIndex = 0;

    const timeToHash = new Map<number, string>();
    const tripletsSeenAt = new Map<string, number[]>();

    while (keys.length < iKey || highestRelevantKeyIndex + 1000 > i) {
        const hash = calculateHash(`${salt}${i}`, hashIterations);

        const [, tripletCharacter] = hash.match(/(\w)\1{2}/) ?? [];
        if (tripletCharacter) {
            const seenAt = tripletsSeenAt.get(tripletCharacter) ?? [];
            seenAt.push(i);
            tripletsSeenAt.set(tripletCharacter, seenAt);
            timeToHash.set(i, hash);
        }

        const [, fiveTimeCharacter] = hash.match(/(\w)\1{4}/) ?? [];
        if (fiveTimeCharacter) {
            for (const time of tripletsSeenAt.get(fiveTimeCharacter) ?? []) {
                if (i - time <= 1000 && i !== time) {
                    const key = timeToHash.get(time)!;
                    if (!keysUsed.has(key)) {
                        keys.push({
                            key,
                            index: time,
                            quintupletAt: i,
                        });
                        keysUsed.add(key);
                        if (keys.length < iKey) {
                            highestRelevantKeyIndex = Math.max(
                                highestRelevantKeyIndex,
                                time,
                            );
                        }
                    }
                }
            }
        }

        i++;
    }

    const sortedKeys = keys.sort((a, b) => a.index - b.index);

    return sortedKeys[iKey - 1]!.index;
}
