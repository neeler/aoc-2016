import { Puzzle } from './Puzzle';
import { Maze, MazeNode } from '~/types/Maze';
import { StateMachine } from '~/types/StateMachine';
import { getMultilineNumbers } from '~/util/parsing';

export const puzzle24 = new Puzzle({
    day: 24,
    parseInput: (fileData) => {
        const nodesToVisit = getMultilineNumbers(fileData);
        const { maze, start } = Maze.fromMazeString(fileData, {
            obstacleChar: '#',
            startChar: '0',
        });
        if (!start) {
            throw new Error('No start found in maze');
        }
        const nodesById = new Map<number, MazeNode>();
        nodesToVisit.forEach((id) => {
            const node = maze.find((node) => node.char === id.toString());
            if (!node) {
                throw new Error(`Node ${id} not found in maze`);
            }
            nodesById.set(id, node);
        });
        const distanceBetweenNodes = new Map<string, number>();
        nodesById.forEach((nodeA, idA) => {
            nodesById.forEach((nodeB, idB) => {
                if (idA === idB) {
                    return 0;
                }
                const distance = maze.score({
                    start: nodeA,
                    end: nodeB,
                });
                distanceBetweenNodes.set(`${idA},${idB}`, distance);
                distanceBetweenNodes.set(`${idB},${idA}`, distance);
            });
        });
        return {
            maze,
            start,
            nodesToVisit,
            nodesById,
            distanceBetweenNodes,
        };
    },
    part1: ({ start, nodesToVisit, nodesById, distanceBetweenNodes }) => {
        let minSteps = Infinity;

        const machine = new StateMachine<{
            nodesVisited: Set<number>;
            steps: number;
            current: MazeNode;
        }>({
            isEnd: ({ nodesVisited }) => nodesVisited.size === nodesById.size,
            onEnd: ({ steps }) => {
                minSteps = Math.min(minSteps, steps);
            },
            nextStates: ({ nodesVisited, steps, current }) => {
                if (steps >= minSteps) {
                    return [];
                }
                const nodesRemaining = nodesToVisit.filter(
                    (node) => !nodesVisited.has(node),
                );
                return nodesRemaining.map((node) => {
                    const next = nodesById.get(node)!;
                    return {
                        nodesVisited: new Set([...nodesVisited, node]),
                        steps:
                            steps +
                            distanceBetweenNodes.get(
                                `${current.char},${next.char}`,
                            )!,
                        current: next,
                    };
                });
            },
        });

        machine.run({
            start: {
                nodesVisited: new Set([0]),
                steps: 0,
                current: start,
            },
        });

        return minSteps;
    },
    part2: ({ start, nodesToVisit, nodesById, distanceBetweenNodes }) => {
        let minSteps = Infinity;

        const machine = new StateMachine<{
            nodesVisited: Set<number>;
            steps: number;
            current: MazeNode;
        }>({
            isEnd: ({ nodesVisited, current }) =>
                nodesVisited.size === nodesById.size && current === start,
            onEnd: ({ steps }) => {
                minSteps = Math.min(minSteps, steps);
            },
            nextStates: ({ nodesVisited, steps, current }) => {
                if (steps >= minSteps) {
                    return [];
                }
                const nodesRemaining = nodesToVisit.filter(
                    (node) => !nodesVisited.has(node),
                );
                if (nodesRemaining.length === 0) {
                    return [
                        {
                            nodesVisited,
                            steps:
                                steps +
                                distanceBetweenNodes.get(
                                    `${current.char},${start.char}`,
                                )!,
                            current: start,
                        },
                    ];
                }
                return nodesRemaining.map((node) => {
                    const next = nodesById.get(node)!;
                    return {
                        nodesVisited: new Set([...nodesVisited, node]),
                        steps:
                            steps +
                            distanceBetweenNodes.get(
                                `${current.char},${next.char}`,
                            )!,
                        current: next,
                    };
                });
            },
        });

        machine.run({
            start: {
                nodesVisited: new Set([0]),
                steps: 0,
                current: start,
            },
        });

        return minSteps;
    },
});
