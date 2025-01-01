import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import { Direction, DirectionKeys, Grid, GridNode } from '~/types/Grid';
import crypto from 'node:crypto';
import {
    GridStateMachine,
    GridStateMachineConfig,
} from '~/types/GridStateMachine';

const directionArray = [
    DirectionKeys.up,
    DirectionKeys.down,
    DirectionKeys.left,
    DirectionKeys.right,
];

const directionLetters = {
    [DirectionKeys.up]: 'U',
    [DirectionKeys.down]: 'D',
    [DirectionKeys.left]: 'L',
    [DirectionKeys.right]: 'R',
} as Record<Direction, string>;

class Machine extends GridStateMachine<{ path: string }> {
    constructor({
        passcode,
        onEnd,
    }: Pick<GridStateMachineConfig<{ path: string }>, 'onEnd'> & {
        passcode: string;
    }) {
        const grid = Grid.fromSize<GridNode>({
            width: 4,
            height: 4,
            defaultValue: (row, col) => new GridNode({ row, col }),
        });
        const end = grid.getAt(3, 3)!;

        super({
            grid,
            isEnd: ({ node }) => node === end,
            onEnd,
            getValidMoves: ({ path }) => {
                const hash = crypto
                    .createHash('md5')
                    .update(`${passcode}${path}`)
                    .digest('hex')
                    .slice(0, 4);
                return hash
                    .split('')
                    .reduce<Direction[]>((acc, char, index) => {
                        if (/[bcdef]/.test(char)) {
                            acc.push(directionArray[index]!);
                        }
                        return acc;
                    }, []);
            },
            getNextState: ({ state, direction, nextNode }) => ({
                path: state.path + directionLetters[direction]!,
                node: nextNode,
            }),
        });
    }
}

export const puzzle17 = new Puzzle({
    day: 17,
    parseInput: (fileData) => {
        return splitFilter(fileData)[0]!;
    },
    part1: (passcode) => {
        let bestPath = '';
        let shortestPathLength = Infinity;

        const stateMachine = new Machine({
            passcode,
            onEnd: ({ path }) => {
                if (path.length < shortestPathLength) {
                    shortestPathLength = path.length;
                    bestPath = path;
                }
            },
        });

        stateMachine.walk({
            start: { row: 0, col: 0 },
            data: { path: '' },
        });

        return bestPath;
    },
    part2: (passcode) => {
        let longestPath = '';
        let longestPathLength = 0;

        const stateMachine = new Machine({
            passcode,
            onEnd: ({ path }) => {
                if (path.length > longestPathLength) {
                    longestPathLength = path.length;
                    longestPath = path;
                }
            },
        });

        stateMachine.walk({
            start: { row: 0, col: 0 },
            data: { path: '' },
        });

        return longestPath.length;
    },
});
