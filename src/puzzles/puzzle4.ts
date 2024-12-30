import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import { mod } from '~/util/arithmetic';

export const puzzle4 = new Puzzle({
    day: 4,
    parseInput: (fileData, { example }) => {
        const rooms = splitFilter(fileData).map((line) => {
            const id = Number(line.match(/(\d+)/)![1]);
            const name = line.match(/([a-z-]+)-/)![1]!;
            const characterCount = name.split('').reduce((acc, char) => {
                if (char !== '-') {
                    acc.set(char, (acc.get(char) ?? 0) + 1);
                }
                return acc;
            }, new Map<string, number>());
            const checksum = line.match(/\[(.*)]/)![1]!;
            return {
                id,
                name,
                characterCount,
                checksum,
            };
        });
        return {
            rooms,
            isExample: example,
        };
    },
    part1: ({ rooms }) => {
        return rooms.reduce((sum, { id, checksum, characterCount }) => {
            const sorted = [...characterCount.entries()]
                .sort(([char1, count1], [char2, count2]) => {
                    if (count1 === count2) {
                        return char1.localeCompare(char2);
                    }
                    return count2 - count1;
                })
                .map(([char]) => char)
                .join('');
            return sorted.slice(0, 5) === checksum ? sum + id : sum;
        }, 0);
    },
    part2: ({ rooms, isExample }) => {
        const hyphenCode = '-'.charCodeAt(0);
        const aCode = 'a'.charCodeAt(0);
        const codeWidth = 'z'.charCodeAt(0) - aCode + 1;
        const decryptedRooms = rooms.map(({ id, name }) => {
            const codes = Array.from(name).map((char) => char.charCodeAt(0));
            return {
                id,
                name: codes
                    .map((code) => {
                        if (code === hyphenCode) {
                            return ' ';
                        }
                        return String.fromCharCode(
                            aCode + mod(code - aCode + id, codeWidth),
                        );
                    })
                    .join(''),
            };
        });
        return decryptedRooms.find(({ name }) =>
            name.includes(isExample ? 'very encrypted name' : 'object storage'),
        )?.id;
    },
});
