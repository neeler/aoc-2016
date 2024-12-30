import { Puzzle } from './Puzzle';
import { getNumbers, splitFilter } from '~/util/parsing';
import {
    ClockwiseRotation,
    CounterClockwiseRotation,
    Direction,
    DirectionKeys,
    Grid,
    GridCoordinate,
    GridCoordinateSet,
} from '~/types/Grid';

export const puzzle1 = new Puzzle({
    day: 1,
    parseInput: (fileData) => {
        return splitFilter(fileData, ', ').map((line) => {
            const turn = line[0]!;
            const distance = getNumbers(line)[0]!;
            return { turn, distance };
        });
    },
    part1: (instructions) => {
        let position: GridCoordinate = { row: 0, col: 0 };
        let direction: Direction = DirectionKeys.up;
        for (const { turn, distance } of instructions) {
            if (turn === 'L') {
                direction = CounterClockwiseRotation[direction];
            } else {
                direction = ClockwiseRotation[direction];
            }
            position = Grid.getCoordsInDirection(
                position.row,
                position.col,
                direction,
                distance,
            );
        }
        return Grid.manhattanDistance(position, { row: 0, col: 0 });
    },
    part2: (instructions) => {
        let position: GridCoordinate = { row: 0, col: 0 };
        let direction: Direction = DirectionKeys.up;
        const visited = new GridCoordinateSet();
        visited.add(position);
        for (const { turn, distance } of instructions) {
            if (turn === 'L') {
                direction = CounterClockwiseRotation[direction];
            } else {
                direction = ClockwiseRotation[direction];
            }
            for (let i = 0; i < distance; i++) {
                position = Grid.getCoordsInDirection(
                    position.row,
                    position.col,
                    direction,
                );
                if (visited.has(position)) {
                    return Grid.manhattanDistance(position, { row: 0, col: 0 });
                }
                visited.add(position);
            }
        }
        throw new Error('No position visited twice.');
    },
});
