import { Grid, GridCoordinate, GridNode } from '~/types/Grid';
import { Queue } from '~/types/Queue';
import { parseStringBlock } from '~/util/parsing';

export class MazeNode extends GridNode {
    char?: string;
    obstacle: boolean;
    bestScore = Infinity;
    isBestPath = false;

    constructor({
        row,
        col,
        obstacle = false,
    }: GridCoordinate & {
        obstacle?: boolean;
    }) {
        super({ row, col });
        this.obstacle = obstacle;
    }

    toString() {
        if (this.obstacle) {
            return '#';
        }

        if (this.bestScore !== Infinity) {
            return this.bestScore.toString().slice(-1);
        }

        if (this.char) {
            return this.char;
        }

        return '.';
    }
}

export class Maze extends Grid<MazeNode> {
    hasScores = false;
    hasBestPath = false;

    constructor({ width, height }: { width: number; height: number }) {
        super({
            maxX: width - 1,
            maxY: height - 1,
            defaultValue: (row, col) => new MazeNode({ row, col }),
        });
    }

    static fromMazeString(
        block: string,
        {
            obstacleChar = '#',
            startChar = 'S',
            endChar = 'E',
        }: {
            obstacleChar?: string;
            startChar?: string;
            endChar?: string;
        } = {},
    ) {
        const data = parseStringBlock(block);
        const width = Math.max(...data.map((row) => row.length));
        const height = data.length;
        const maze = new Maze({
            width,
            height,
        });

        const obstacles: MazeNode[] = [];
        const nonObstacles: MazeNode[] = [];
        let start: MazeNode | undefined;
        let end: MazeNode | undefined;

        if (obstacleChar) {
            maze.forEach((node, row, col) => {
                if (node) {
                    node.char = data[row]?.[col];
                    node.obstacle = node.char === obstacleChar;
                    if (node.obstacle) {
                        obstacles.push(node);
                    } else {
                        nonObstacles.push(node);
                    }
                    if (node.char === startChar) {
                        start = node;
                    }
                    if (node.char === endChar) {
                        end = node;
                    }
                }
            });
        }

        return {
            maze,
            obstacles,
            nonObstacles,
            start,
            end,
        };
    }

    score({
        start: startCoord,
        end: endCoord,
        resetAfter = true,
    }: {
        start: GridCoordinate;
        end: GridCoordinate;
        resetAfter?: boolean;
    }) {
        if (this.hasScores || this.hasBestPath) {
            this.resetScores();
        }

        const start = this.get(startCoord)!;
        const end = this.get(endCoord)!;

        const queue = new Queue<MazeNode>();
        start.bestScore = 0;
        queue.add(start);

        queue.process((node) => {
            if (node === end) {
                queue.reset();
                return;
            }

            const score = node.bestScore;
            const neighbors = this.getOrthogonalNeighborsOf(node.row, node.col);
            neighbors.forEach((neighbor) => {
                if (neighbor.bestScore <= score + 1 || neighbor.obstacle) {
                    return;
                }

                neighbor.bestScore = score + 1;

                queue.add(neighbor);
            });
        });

        const score = end.bestScore;

        if (resetAfter) {
            this.resetScores();
        } else {
            this.hasScores = true;
        }

        return score;
    }

    findBestPath({
        start: startCoord,
        end: endCoord,
    }: {
        start: GridCoordinate;
        end: GridCoordinate;
    }) {
        this.score({
            start: startCoord,
            end: endCoord,
            resetAfter: false,
        });
        const queue = new Queue<MazeNode>();
        queue.add(this.get(endCoord)!);
        queue.process((node) => {
            if (node === this.get(startCoord)) {
                queue.reset();
                return;
            }
            const neighbors = this.getOrthogonalNeighborsOf(node.row, node.col);
            const bestNeighbor = this.getOrthogonalNeighborsOf(
                node.row,
                node.col,
            ).reduce((best, neighbor) => {
                if (best && neighbor.bestScore < best.bestScore) {
                    return neighbor;
                }
                return best;
            }, neighbors[0]);
            if (bestNeighbor) {
                bestNeighbor.isBestPath = true;
                queue.add(bestNeighbor);
            } else {
                queue.reset();
            }
        });
        this.hasBestPath = true;
    }

    resetScores() {
        this.forEach((node) => {
            if (node) {
                node.bestScore = Infinity;
            }
        });
        this.hasBestPath = false;
    }

    drawWithScores() {
        let longestScore = 0;
        this.forEach((node) => {
            if (node && node.bestScore !== Infinity) {
                const score = node.bestScore.toString();
                if (score.length > longestScore) {
                    longestScore = score.length;
                }
            }
        });
        const padding = longestScore + 1;
        this.draw((node) => {
            if (!node) {
                return ''.padEnd(padding, ' ');
            }
            if (node.bestScore === Infinity) {
                return '#'.repeat(longestScore).padEnd(padding, ' ');
            }
            return this.hasBestPath
                ? (node.isBestPath
                      ? node.bestScore.toString()
                      : '#'.repeat(longestScore)
                  ).padEnd(padding, ' ')
                : node.bestScore.toString().padEnd(padding, ' ');
        });
    }
}
