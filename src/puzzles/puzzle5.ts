import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import crypto from 'crypto';

export const puzzle5 = new Puzzle({
    day: 5,
    parseInput: (fileData) => {
        return splitFilter(fileData)[0]!;
    },
    part1: (doorId) => {
        const password: string[] = [];
        let i = 0;
        while (password.length < 8) {
            const hash = crypto
                .createHash('md5')
                .update(`${doorId}${i}`)
                .digest('hex');
            if (hash.startsWith('00000')) {
                password.push(hash[5]!);
            }
            i++;
        }
        return password.join('');
    },
    part2: (doorId) => {
        const password = Array(8).fill('x');
        const positionsSeen = new Set<number>();
        let i = 0;
        while (positionsSeen.size < 8) {
            const hash = crypto
                .createHash('md5')
                .update(`${doorId}${i}`)
                .digest('hex');
            if (hash.startsWith('00000')) {
                const position = parseInt(hash[5]!, 10);
                if (!positionsSeen.has(position) && position < 8) {
                    positionsSeen.add(position);
                    password[position] = hash[6]!;
                }
            }
            i++;
        }
        return password.join('');
    },
});
