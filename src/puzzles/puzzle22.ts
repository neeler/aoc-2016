import { Puzzle } from './Puzzle';
import { getNumbersForEachLine } from '~/util/parsing';
import { Grid, GridCoordinate, GridNode } from '~/types/Grid';
import { CustomSet } from '~/types/CustomSet';
import { StateMachine } from '~/types/StateMachine';
import { PriorityQueue } from '~/types/PriorityQueue';
import { Maze } from '~/types/Maze';

class Node extends GridNode {
    size: number;
    used: number;
    avail: number;

    constructor({
        row,
        col,
        size,
        used,
        avail,
    }: GridCoordinate & {
        size: number;
        used: number;
        avail: number;
    }) {
        super({ row, col });
        this.size = size;
        this.used = used;
        this.avail = avail;
    }
}

class State {
    steps: number;
    sourceNode: Node;
    dataByNode: Map<string, number>;
    emptyNode: Node;
    goalNode: Node;
    score: number;
    distanceToGoal: number;
    distanceBetweenEmptyAndSource: number;
    bestPossibleSteps: number;
    key: string;
    walls: Set<Node>;

    constructor({
        steps,
        sourceNode,
        dataByNode,
        emptyNode,
        goalNode,
        walls,
    }: {
        steps: number;
        sourceNode: Node;
        dataByNode: Map<string, number>;
        emptyNode: Node;
        goalNode: Node;
        walls: Set<Node>;
    }) {
        this.steps = steps;
        this.sourceNode = sourceNode;
        this.dataByNode = dataByNode;
        this.emptyNode = emptyNode;
        this.goalNode = goalNode;
        this.walls = walls;
        this.distanceToGoal = Grid.manhattanDistance(sourceNode, goalNode);
        this.bestPossibleSteps = steps + this.distanceToGoal;
        this.distanceBetweenEmptyAndSource = Grid.manhattanDistance(
            sourceNode,
            emptyNode,
        );
        this.score =
            10 * this.distanceToGoal +
            1000 * this.distanceBetweenEmptyAndSource;
        this.key = `${sourceNode.toString()}|${emptyNode.toString()}`;
    }

    swap(nodeA: Node, nodeB: Node): State {
        const nextState: State = new State({
            steps: this.steps + 1,
            sourceNode: nodeA === this.sourceNode ? nodeB : this.sourceNode,
            dataByNode: new Map(this.dataByNode),
            emptyNode: nodeA,
            goalNode: this.goalNode,
            walls: this.walls,
        });

        const nodeAString = nodeA.toString();
        const nodeBString = nodeB.toString();

        const newDataInNodeB =
            (this.dataByNode.get(nodeAString) ?? 0) +
            (this.dataByNode.get(nodeBString) ?? 0);

        nextState.dataByNode.set(nodeAString, 0);
        nextState.dataByNode.set(nodeBString, newDataInNodeB);

        return nextState;
    }

    draw(grid: Grid<Node>) {
        grid.draw((node) => {
            if (node === this.sourceNode) {
                return 'G';
            } else if (node === this.emptyNode) {
                return '_';
            } else if (node === this.goalNode) {
                return 'E';
            } else if (node && this.walls.has(node)) {
                return '#';
            } else {
                return '.';
            }
        });
    }
}

export const puzzle22 = new Puzzle({
    day: 22,
    parseInput: (fileData) => {
        let biggestRow = 0;
        let biggestCol = 0;
        const nodes = getNumbersForEachLine(fileData)
            .slice(2)
            .map(([col, row, size, used, avail]) => {
                const node = new Node({
                    row: row!,
                    col: col!,
                    size: size!,
                    used: used!,
                    avail: avail!,
                });
                biggestRow = Math.max(biggestRow, row!);
                biggestCol = Math.max(biggestCol, col!);
                return node;
            });
        const grid = new Grid<Node>({
            maxX: biggestCol,
            maxY: biggestRow,
        });
        for (const node of nodes) {
            grid.setAt(node.row, node.col, node);
        }
        return {
            nodes,
            grid,
        };
    },
    part1: ({ nodes }) => {
        return getValidSwapPairs(nodes).size;
    },
    part2: ({ nodes, grid }) => {
        const initialSourceNode = grid.getAt(0, grid.width - 1)!;
        const goalNode = grid.getAt(0, 0)!;

        let initialEmptyNode: Node | undefined;
        const neighborsByNode = new Map<Node, Node[]>();

        const validSwapPairs = getValidSwapPairs(nodes);
        const validNodes = new Set<Node>();
        for (const [nodeA, nodeB] of validSwapPairs.values()) {
            validNodes.add(nodeA);
            validNodes.add(nodeB);
        }
        const walls = new Set<Node>();
        for (const node of nodes) {
            if (!validNodes.has(node)) {
                walls.add(node);
            }
        }

        for (const node of nodes) {
            const neighbors = grid.getOrthogonalNeighborsOf(node.row, node.col);
            neighborsByNode.set(
                node,
                neighbors.filter((n) => validNodes.has(n)),
            );
            if (node.used > 0) {
                for (const neighbor of neighbors) {
                    if (node.used > 0 && node.used <= neighbor.avail) {
                        if (initialEmptyNode === undefined) {
                            initialEmptyNode = neighbor;
                        } else if (initialEmptyNode !== neighbor) {
                            throw new Error('Multiple empty nodes');
                        }
                    }
                }
            }
        }

        if (!initialEmptyNode) {
            throw new Error('No empty node found');
        }

        const maze = new Maze({
            width: grid.width,
            height: grid.height,
        });
        for (const wall of walls) {
            maze.get(wall)!.obstacle = true;
        }
        maze.findBestPath({
            start: initialEmptyNode,
            end: initialSourceNode,
        });

        const bestStepsPerState = new Map<string, number>();

        let fewestSteps = Infinity;
        const initialDataByNode = new Map<string, number>();
        nodes.forEach((node) => {
            initialDataByNode.set(node.toString(), node.used);
        });

        const initialState = new State({
            steps: 0,
            sourceNode: initialSourceNode,
            dataByNode: initialDataByNode,
            emptyNode: initialEmptyNode,
            goalNode,
            walls,
        });
        bestStepsPerState.set(initialState.key, 0);

        class StateQueue extends PriorityQueue<State> {
            constructor() {
                super({
                    compare: (stateA, stateB) => stateA.score - stateB.score,
                });
            }
        }

        const machine = new StateMachine<State>({
            queueType: StateQueue,
            isEnd: ({ sourceNode }) =>
                sourceNode.row === 0 && sourceNode.col === 0,
            onEnd: ({ steps }) => {
                fewestSteps = Math.min(fewestSteps, steps);
            },
            nextStates: (state) => {
                const bestStepsForThisState =
                    bestStepsPerState.get(state.key) ?? Infinity;

                if (
                    state.steps > bestStepsForThisState ||
                    state.bestPossibleSteps >= fewestSteps
                ) {
                    return [];
                }

                const nextStates: State[] = [];

                const dataAvail = state.emptyNode.size;

                const allNeighbors = neighborsByNode.get(state.emptyNode) ?? [];

                const optimalNeighbors =
                    state.distanceBetweenEmptyAndSource > 2
                        ? allNeighbors.filter(
                              (node) => maze.get(node)?.isBestPath,
                          )
                        : allNeighbors;

                for (const nodeA of optimalNeighbors) {
                    const dataInNodeA =
                        state.dataByNode.get(nodeA.toString()) ?? 0;

                    if (dataInNodeA === 0 || dataInNodeA > dataAvail) {
                        continue;
                    }

                    const nextState = state.swap(nodeA, state.emptyNode);

                    const bestSteps =
                        bestStepsPerState.get(nextState.key) ?? Infinity;

                    if (
                        nextState.steps >= bestSteps ||
                        nextState.bestPossibleSteps >= fewestSteps
                    ) {
                        continue;
                    }

                    bestStepsPerState.set(nextState.key, nextState.steps);
                    nextStates.push(nextState);
                }

                return nextStates;
            },
        });

        machine.run({
            start: initialState,
        });

        return fewestSteps;
    },
});

function getValidSwapPairs(nodes: Node[]) {
    const pairsSeen = new CustomSet<[Node, Node]>({
        getKey: (nodes) => {
            const sortedNodes = nodes.toSorted((a, b) => {
                return a.row + a.col - (b.row + b.col);
            });
            return sortedNodes
                .map((node) => node.row + ',' + node.col)
                .join('|');
        },
    });
    for (const nodeA of nodes) {
        if (nodeA.used === 0) {
            continue;
        }
        for (const nodeB of nodes) {
            if (nodeA !== nodeB && nodeB.avail >= nodeA.used) {
                pairsSeen.add([nodeA, nodeB]);
            }
        }
    }
    return pairsSeen;
}
