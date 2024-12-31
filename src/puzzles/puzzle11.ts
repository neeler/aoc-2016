import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import { PriorityQueue } from '~/types/PriorityQueue';
import { Queue } from '~/types/Queue';

class GameState {
    chipsPerFloor: Map<number, Set<string>>;
    generatorsPerFloor: Map<number, Set<string>>;
    elements: Set<string>;
    floor: number;
    steps: number;

    constructor({
        chipsPerFloor,
        generatorsPerFloor,
        elements,
        floor,
        steps,
    }: {
        chipsPerFloor: Map<number, Set<string>>;
        generatorsPerFloor: Map<number, Set<string>>;
        elements: Set<string>;
        floor: number;
        steps: number;
    }) {
        this.chipsPerFloor = chipsPerFloor;
        this.generatorsPerFloor = generatorsPerFloor;
        this.elements = elements;
        this.floor = floor;
        this.steps = steps;
    }

    clone() {
        const nextChipsPerFloor = new Map<number, Set<string>>();
        const nextGeneratorsPerFloor = new Map<number, Set<string>>();
        for (const [floor, chips] of this.chipsPerFloor.entries()) {
            nextChipsPerFloor.set(floor, new Set(chips));
        }
        for (const [floor, generators] of this.generatorsPerFloor.entries()) {
            nextGeneratorsPerFloor.set(floor, new Set(generators));
        }
        return new GameState({
            chipsPerFloor: nextChipsPerFloor,
            generatorsPerFloor: nextGeneratorsPerFloor,
            elements: this.elements,
            floor: this.floor,
            steps: this.steps,
        });
    }

    isValid() {
        for (const [floor, chips] of this.chipsPerFloor.entries()) {
            const generators = this.generatorsPerFloor.get(floor)!;
            for (const chip of chips) {
                if (!generators.has(chip)) {
                    if (generators.size > 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    get floorScore() {
        let score = 0;
        for (const [floor, chips] of this.chipsPerFloor.entries()) {
            score += chips.size * (4 - floor);
        }
        for (const [floor, generators] of this.generatorsPerFloor.entries()) {
            score += generators.size * (4 - floor);
        }
        return score;
    }

    get score() {
        return this.steps * this.floorScore;
    }

    isComplete() {
        return this.floorScore === 0;
    }

    get floorStrings() {
        return Array.from({ length: 4 }, (_, i) => {
            const floor = 4 - i;
            let elevator = this.floor === floor ? 'E ' : '. ';
            const components: string[] = [];
            for (const element of this.elements) {
                components.push(
                    this.generatorsPerFloor.get(floor)?.has(element)
                        ? `${element.slice(0, 1).toUpperCase()}G`
                        : '. ',
                );
                components.push(
                    this.chipsPerFloor.get(floor)?.has(element)
                        ? `${element.slice(0, 1).toUpperCase()}M`
                        : '. ',
                );
            }
            return `F${floor} ${elevator} ${components.join(' ')}`;
        });
    }

    get key() {
        return this.floorStrings.join(':');
    }

    draw() {
        console.log(`
Steps: ${this.steps}
${this.floorStrings.join('\n')}`);
    }

    move({
        chips = [],
        generators = [],
        dFloor,
    }: {
        chips?: string[];
        generators?: string[];
        dFloor: number;
    }) {
        const nextFloor = this.floor + dFloor;

        if (nextFloor < 1 || nextFloor > 4) {
            throw new Error(`Invalid floor to move to: ${dFloor}`);
        }

        if (chips.length + generators.length === 0) {
            throw new Error('Must have at least one item to move');
        }

        if (chips.length + generators.length > 2) {
            throw new Error("Can't move more than two items at a time");
        }

        const nextState = this.clone();
        nextState.floor = nextFloor;
        nextState.steps++;

        for (const chip of chips) {
            nextState.chipsPerFloor.get(this.floor)!.delete(chip);
            nextState.chipsPerFloor.get(nextFloor)!.add(chip);
        }
        for (const generator of generators) {
            nextState.generatorsPerFloor.get(this.floor)!.delete(generator);
            nextState.generatorsPerFloor.get(nextFloor)!.add(generator);
        }

        return nextState;
    }

    get nextStates() {
        const states: GameState[] = [];

        const chipsOnFloor = this.chipsPerFloor.get(this.floor)!;
        const generatorsOnFloor = this.generatorsPerFloor.get(this.floor)!;

        const lowestFloorWithStuff = Math.min(
            ...Array.from(this.chipsPerFloor.entries())
                .filter(([, chips]) => chips.size > 0)
                .map(([floor]) => floor),
            ...Array.from(this.generatorsPerFloor.entries())
                .filter(([, generators]) => generators.size > 0)
                .map(([floor]) => floor),
        );

        if (lowestFloorWithStuff < this.floor) {
            // Try going down - only take one thing
            for (const chip of chipsOnFloor) {
                states.push(this.move({ chips: [chip], dFloor: -1 }));
            }
            for (const generator of generatorsOnFloor) {
                states.push(this.move({ generators: [generator], dFloor: -1 }));
            }
        }

        if (this.floor < 4) {
            // Try going up - take one or two things

            // Can only combine chips with generators if they're the same element
            for (const element of Array.from(chipsOnFloor).filter((chip) =>
                generatorsOnFloor.has(chip),
            )) {
                states.push(
                    this.move({
                        chips: [element],
                        generators: [element],
                        dFloor: 1,
                    }),
                );
            }

            for (const chip of chipsOnFloor) {
                states.push(this.move({ chips: [chip], dFloor: 1 }));
            }

            if (chipsOnFloor.size > 1) {
                const allPossiblePairs = Array.from(chipsOnFloor).reduce<
                    [string, string][]
                >((pairs, chip, index, array) => {
                    for (let i = index + 1; i < array.length; i++) {
                        pairs.push([chip, array[i]!]);
                    }
                    return pairs;
                }, []);
                for (const pair of allPossiblePairs) {
                    states.push(this.move({ chips: pair, dFloor: 1 }));
                }
            }

            for (const generator of generatorsOnFloor) {
                states.push(this.move({ generators: [generator], dFloor: 1 }));
            }

            if (generatorsOnFloor.size > 1) {
                const allPossiblePairs = Array.from(generatorsOnFloor).reduce<
                    [string, string][]
                >((pairs, generator, index, array) => {
                    for (let i = index + 1; i < array.length; i++) {
                        pairs.push([generator, array[i]!]);
                    }
                    return pairs;
                }, []);
                for (const pair of allPossiblePairs) {
                    states.push(this.move({ generators: pair, dFloor: 1 }));
                }
            }
        }

        return states.filter((state) => state.isValid());
    }
}

export const puzzle11 = new Puzzle({
    day: 11,
    parseInput: (fileData) => {
        const elements = new Set<string>();
        const chipsPerFloor = new Map<number, Set<string>>();
        const generatorsPerFloor = new Map<number, Set<string>>();

        for (let i = 1; i <= 4; i++) {
            chipsPerFloor.set(i, new Set());
            generatorsPerFloor.set(i, new Set());
        }

        splitFilter(fileData).forEach((line, index) => {
            const floor = index + 1;
            for (const chip of line
                .matchAll(/(\w+)-compatible microchip/g)
                .map((match) => match[1]!)) {
                const chipsOnFloor = chipsPerFloor.get(floor)!;
                chipsOnFloor.add(chip);
                elements.add(chip);
                chipsPerFloor.set(floor, chipsOnFloor);
            }
            for (const generator of line
                .matchAll(/(\w+) generator/g)
                .map((match) => match[1]!)) {
                const generatorsOnFloor = generatorsPerFloor.get(floor)!;
                generatorsOnFloor.add(generator);
                elements.add(generator);
                generatorsPerFloor.set(floor, generatorsOnFloor);
            }
            return floor;
        });

        return {
            elements,
            chipsPerFloor,
            generatorsPerFloor,
        };
    },
    part1: ({ elements, chipsPerFloor, generatorsPerFloor }) => {
        return findMinSteps({
            elements,
            chipsPerFloor,
            generatorsPerFloor,
        });
    },
    part2: ({ elements, chipsPerFloor, generatorsPerFloor }) => {
        for (const element of ['elerium', 'dilithium']) {
            elements.add(element);
            chipsPerFloor.get(1)!.add(element);
            generatorsPerFloor.get(1)!.add(element);
        }
        return findMinSteps({
            elements,
            chipsPerFloor,
            generatorsPerFloor,
            usePriorityQueue: true,
        });
    },
});

function findMinSteps({
    elements,
    chipsPerFloor,
    generatorsPerFloor,
    usePriorityQueue = false,
}: {
    elements: Set<string>;
    chipsPerFloor: Map<number, Set<string>>;
    generatorsPerFloor: Map<number, Set<string>>;
    usePriorityQueue?: boolean;
}) {
    const queue = usePriorityQueue
        ? new PriorityQueue<GameState>({
              compare: (a, b) => a.score - b.score,
          })
        : new Queue<GameState>();

    const initialState = new GameState({
        chipsPerFloor,
        generatorsPerFloor,
        elements,
        floor: 1,
        steps: 0,
    });
    queue.add(initialState);

    const bestStepsForState = new Map<string, number>();
    bestStepsForState.set(initialState.key, 0);

    let minSteps = Infinity;
    queue.process((state) => {
        if (state.isComplete()) {
            minSteps = Math.min(minSteps, state.steps);
            return;
        }

        if (state.steps >= minSteps - 1) {
            return;
        }

        const nextStates = state.nextStates;
        for (const nextState of nextStates) {
            const bestSeenSteps =
                bestStepsForState.get(nextState.key) ?? Infinity;
            if (nextState.steps < bestSeenSteps) {
                queue.add(nextState);
                bestStepsForState.set(nextState.key, nextState.steps);
            }
        }
    });
    return minSteps;
}
