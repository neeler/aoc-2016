import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import { PriorityQueue } from '~/types/PriorityQueue';
import { StateMachine } from '~/types/StateMachine';

class GameState {
    readonly chipsPerFloor: Map<number, Set<string>>;
    readonly generatorsPerFloor: Map<number, Set<string>>;
    readonly elements: Set<string>;
    readonly floor: number;
    readonly steps: number;
    readonly floorScore: number;
    readonly score: number;
    readonly key: string;
    readonly bestPossibleSteps: number;
    readonly lowestFloorWithStuff: number;

    constructor({
        chipsPerFloor,
        generatorsPerFloor,
        elements,
        floor,
        steps,
        lowestFloorWithStuff,
    }: {
        chipsPerFloor: Map<number, Set<string>>;
        generatorsPerFloor: Map<number, Set<string>>;
        elements: Set<string>;
        floor: number;
        steps: number;
        lowestFloorWithStuff: number;
    }) {
        this.chipsPerFloor = chipsPerFloor;
        this.generatorsPerFloor = generatorsPerFloor;
        this.elements = elements;
        this.floor = floor;
        this.steps = steps;
        this.lowestFloorWithStuff = lowestFloorWithStuff;

        let bestPossibleSteps = this.steps;
        let floorScore = 0;
        for (const [floor, chips] of chipsPerFloor.entries()) {
            const distanceFromTop = 4 - floor;
            const distanceFromCurrent = Math.abs(floor - this.floor);
            bestPossibleSteps +=
                Math.ceil(chips.size / 2) *
                (distanceFromTop + distanceFromCurrent);
            floorScore += chips.size * distanceFromTop;
        }
        for (const [floor, generators] of generatorsPerFloor.entries()) {
            const distanceFromTop = 4 - floor;
            const distanceFromCurrent = Math.abs(floor - this.floor);
            bestPossibleSteps +=
                Math.ceil(generators.size / 2) *
                (distanceFromTop + distanceFromCurrent);
            floorScore += generators.size * distanceFromTop;
        }
        this.bestPossibleSteps = bestPossibleSteps;
        this.floorScore = floorScore;
        this.score = steps * floorScore;

        this.key = `${floor}|${Array.from(
            {
                length: 4,
            },
            (_, i) => {
                const chipsOnFloor = this.chipsPerFloor.get(i + 1)!;
                const generatorsOnFloor = this.generatorsPerFloor.get(i + 1)!;
                let individualChips = 0;
                let individualGenerators = 0;
                let pairs = 0;
                for (const element of elements) {
                    if (
                        chipsOnFloor.has(element) &&
                        generatorsOnFloor.has(element)
                    ) {
                        pairs++;
                    } else if (chipsOnFloor.has(element)) {
                        individualChips++;
                    } else if (generatorsOnFloor.has(element)) {
                        individualGenerators++;
                    }
                }
                return `${individualChips},${individualGenerators},${pairs}`;
            },
        ).join('|')}`;
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

        const nextChipsPerFloor = new Map<number, Set<string>>();
        const nextGeneratorsPerFloor = new Map<number, Set<string>>();
        for (const [floor, chips] of this.chipsPerFloor.entries()) {
            nextChipsPerFloor.set(floor, new Set(chips));
        }
        for (const [floor, generators] of this.generatorsPerFloor.entries()) {
            nextGeneratorsPerFloor.set(floor, new Set(generators));
        }
        for (const chip of chips) {
            nextChipsPerFloor.get(this.floor)!.delete(chip);
            nextChipsPerFloor.get(nextFloor)!.add(chip);
        }
        for (const generator of generators) {
            nextGeneratorsPerFloor.get(this.floor)!.delete(generator);
            nextGeneratorsPerFloor.get(nextFloor)!.add(generator);
        }

        // Reject if the new state is invalid
        for (const [floor, chips] of nextChipsPerFloor.entries()) {
            const generators = nextGeneratorsPerFloor.get(floor)!;
            for (const chip of chips) {
                if (!generators.has(chip)) {
                    if (generators.size > 0) {
                        // Invalid state
                        return null;
                    }
                }
            }
        }

        return new GameState({
            chipsPerFloor: nextChipsPerFloor,
            generatorsPerFloor: nextGeneratorsPerFloor,
            elements: this.elements,
            floor: nextFloor,
            steps: this.steps + 1,
            lowestFloorWithStuff:
                nextFloor > this.floor &&
                (nextChipsPerFloor.get(this.lowestFloorWithStuff)?.size ?? 0) +
                    (nextGeneratorsPerFloor.get(this.lowestFloorWithStuff)
                        ?.size ?? 0) ===
                    0
                    ? nextFloor
                    : this.lowestFloorWithStuff,
        });
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

class StatePriorityQueue extends PriorityQueue<GameState> {
    constructor() {
        super({
            compare: (a, b) => a.score - b.score,
        });
    }
}

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
    let minSteps = Infinity;
    const bestStepsForState = new Map<string, number>();

    const machine = new StateMachine<GameState>({
        queueType: usePriorityQueue ? StatePriorityQueue : undefined,
        isEnd: (state) => state.floorScore === 0,
        onEnd: (state) => {
            minSteps = Math.min(minSteps, state.steps);
        },
        nextStates: (state) => {
            if (state.bestPossibleSteps >= minSteps) {
                return [];
            }

            const states: (GameState | null)[] = [];

            const chipsOnFloor = state.chipsPerFloor.get(state.floor)!;
            const generatorsOnFloor = state.generatorsPerFloor.get(
                state.floor,
            )!;

            if (state.lowestFloorWithStuff < state.floor) {
                // Try going down - only take one thing
                for (const chip of chipsOnFloor) {
                    states.push(state.move({ chips: [chip], dFloor: -1 }));
                }
                for (const generator of generatorsOnFloor) {
                    states.push(
                        state.move({ generators: [generator], dFloor: -1 }),
                    );
                }
            }

            if (state.floor < 4) {
                // Try going up - take one or two things

                // Can only combine chips with generators if they're the same element
                for (const element of chipsOnFloor) {
                    if (generatorsOnFloor.has(element)) {
                        states.push(
                            state.move({
                                chips: [element],
                                generators: [element],
                                dFloor: 1,
                            }),
                        );
                    }
                }

                for (const chip of chipsOnFloor) {
                    states.push(state.move({ chips: [chip], dFloor: 1 }));
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
                        states.push(state.move({ chips: pair, dFloor: 1 }));
                    }
                }

                for (const generator of generatorsOnFloor) {
                    states.push(
                        state.move({ generators: [generator], dFloor: 1 }),
                    );
                }

                if (generatorsOnFloor.size > 1) {
                    const allPossiblePairs = Array.from(
                        generatorsOnFloor,
                    ).reduce<[string, string][]>(
                        (pairs, generator, index, array) => {
                            for (let i = index + 1; i < array.length; i++) {
                                pairs.push([generator, array[i]!]);
                            }
                            return pairs;
                        },
                        [],
                    );
                    for (const pair of allPossiblePairs) {
                        states.push(
                            state.move({ generators: pair, dFloor: 1 }),
                        );
                    }
                }
            }

            return states.reduce<GameState[]>((nextStates, nextState) => {
                if (!nextState) {
                    return nextStates;
                }

                const bestSeenSteps =
                    bestStepsForState.get(nextState.key) ?? Infinity;
                if (nextState.steps < bestSeenSteps) {
                    bestStepsForState.set(nextState.key, nextState.steps);
                    nextStates.push(nextState);
                }

                return nextStates;
            }, []);
        },
    });

    const initialState = new GameState({
        chipsPerFloor,
        generatorsPerFloor,
        elements,
        floor: 1,
        steps: 0,
        lowestFloorWithStuff: 1,
    });
    bestStepsForState.set(initialState.key, 0);
    machine.run({
        start: initialState,
    });

    return minSteps;
}
