export function SolutionTemplate(day: number) {
    return `import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';

export const puzzle${day} = new Puzzle({
    day: ${day},
    parseInput: (fileData) => {
        return splitFilter(fileData);
    },
    part1: (data) => {
        console.log(data);
    },
    part2: (data) => {
        //
    },
});
`;
}
