import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';

export const puzzle6 = new Puzzle({
    day: 6,
    parseInput: (fileData) => {
        const messages = splitFilter(fileData);
        const characterCountsPerPosition = messages.reduce(
            (acc, message) => {
                for (const [index, char] of message.split('').entries()) {
                    const charMap = acc[index]!;
                    charMap.set(char, (charMap.get(char) ?? 0) + 1);
                }
                return acc;
            },
            Array.from(
                {
                    length: messages[0]!.length,
                },
                () => new Map<string, number>(),
            ),
        );
        return {
            messages,
            characterCountsPerPosition,
        };
    },
    part1: ({ characterCountsPerPosition }) => {
        return characterCountsPerPosition
            .map((charMap) => {
                const entries = [...charMap.entries()];
                const maxCount = Math.max(
                    ...entries.map(([_, count]) => count),
                );
                return entries.find(([_, count]) => count === maxCount)![0];
            })
            .join('');
    },
    part2: ({ characterCountsPerPosition }) => {
        return characterCountsPerPosition
            .map((charMap) => {
                const entries = [...charMap.entries()];
                const minCount = Math.min(
                    ...entries.map(([_, count]) => count),
                );
                return entries.find(([_, count]) => count === minCount)![0];
            })
            .join('');
    },
});
