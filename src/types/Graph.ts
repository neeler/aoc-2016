import { Queue } from '~/types/Queue';
import { PriorityQueue } from '~/types/PriorityQueue';

export class Graph {
    nodes = new Set<GraphNode>();
    nodesByName = new Map<string, GraphNode>();
    distances = new Map<string, Map<string, number>>();

    addNode(node: GraphNode) {
        this.nodes.add(node);
        this.nodesByName.set(node.name, node);
    }

    addNodeByName(name: string) {
        const node = this.getNodeByName(name) ?? new GraphNode(name);
        this.addNode(node);
        return node;
    }

    getNodeByName(name: string) {
        return this.nodesByName.get(name);
    }

    getDistance(node1: GraphNode, node2: GraphNode) {
        return this.distances.get(node1.name)?.get(node2.name) ?? Infinity;
    }

    linkNodes(node1: GraphNode, node2: GraphNode, distance: number) {
        if (!this.distances.has(node1.name)) {
            this.distances.set(node1.name, new Map());
        }
        this.distances.get(node1.name)!.set(node2.name, distance);

        if (!this.distances.has(node2.name)) {
            this.distances.set(node2.name, new Map());
        }
        this.distances.get(node2.name)!.set(node1.name, distance);

        node1.linkTo(node2, distance);
        node2.linkTo(node1, distance);
    }

    linkNodesByName(n1: string, n2: string, distance: number) {
        const node1 = this.addNodeByName(n1);
        const node2 = this.addNodeByName(n2);
        this.linkNodes(node1, node2, distance);
        node1.linkTo(node2, distance);
        node2.linkTo(node1, distance);
    }

    forEachNode(callback: (node: GraphNode) => void) {
        this.nodes.forEach(callback);
    }

    get size() {
        return this.nodes.size;
    }

    /**
     * Dijkstra's algorithm
     */
    getShortestPath({
        startingNode,
        targetNode,
    }: {
        startingNode: GraphNode;
        targetNode: GraphNode;
    }) {
        const start = startingNode ?? [...this.nodes][0]!;
        const unvisitedNodes = new Set(this.nodes);
        const distances = new Map<GraphNode, number>();
        this.nodes.forEach((node) =>
            distances.set(node, node === start ? 0 : Infinity),
        );
        while (unvisitedNodes.size > 0) {
            const currentNode = [...unvisitedNodes].reduce((a, b) =>
                distances.get(a)! < distances.get(b)! ? a : b,
            );
            if (
                currentNode === targetNode ||
                distances.get(currentNode) === Infinity
            ) {
                break;
            }

            currentNode.forEachNeighbor((neighbor, distanceToNeighbor) => {
                if (!unvisitedNodes.has(neighbor)) {
                    return;
                }
                distances.set(
                    neighbor,
                    Math.min(
                        distances.get(neighbor)!,
                        distances.get(currentNode)! + distanceToNeighbor,
                    ),
                );
            });

            unvisitedNodes.delete(currentNode);
        }

        return distances.get(targetNode)!;
    }

    /**
     * Traveling Salesman Problem
     * Allows for custom priority and stat comparison functions,
     * for example to find the shortest or longest path.
     */
    getOptimalFullPath({
        priorityCompare,
        initialStat,
        statCompare,
        returnToStart = false,
    }: {
        priorityCompare: (a: number, b: number) => number;
        initialStat: number;
        statCompare: (a: number, b: number) => number;
        returnToStart?: boolean;
    }) {
        const queue = new PriorityQueue<{
            nodesVisited: Set<GraphNode>;
            currentNode: GraphNode;
            distance: number;
            startNode: GraphNode;
        }>({
            compare: (a, b) => priorityCompare(a.distance, b.distance),
        });
        if (returnToStart) {
            const firstNode = [...this.nodes][0]!;
            queue.add({
                nodesVisited: new Set([firstNode]),
                currentNode: firstNode,
                distance: 0,
                startNode: firstNode,
            });
        } else {
            this.forEachNode((node) => {
                queue.add({
                    nodesVisited: new Set([node]),
                    currentNode: node,
                    distance: 0,
                    startNode: node,
                });
            });
        }
        let bestStat = initialStat;
        queue.process(({ nodesVisited, currentNode, distance, startNode }) => {
            if (
                nodesVisited.size === this.size &&
                (!returnToStart || currentNode === startNode)
            ) {
                bestStat = statCompare(distance, bestStat);
                return;
            }

            currentNode.forEachNeighbor((neighbor, distanceToNeighbor) => {
                if (
                    nodesVisited.has(neighbor) &&
                    (!returnToStart ||
                        neighbor !== startNode ||
                        nodesVisited.size !== this.size)
                ) {
                    return;
                }
                queue.add({
                    nodesVisited: new Set([...nodesVisited, neighbor]),
                    currentNode: neighbor,
                    distance: distance + distanceToNeighbor,
                    startNode,
                });
            });
        });
        return bestStat;
    }
}

export class GraphNode {
    distancesTo = new Map<GraphNode, number>();

    constructor(public name: string) {}

    linkTo(node: GraphNode, distance: number) {
        this.distancesTo.set(node, distance);
    }

    neighbors() {
        return Array.from(this.distancesTo.keys());
    }

    forEachNeighbor(callback: (node: GraphNode, distance: number) => void) {
        this.distancesTo.forEach((distance, node) => {
            callback(node, distance);
        });
    }
}
