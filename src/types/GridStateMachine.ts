import { StateMachine, StateMachineConfig } from '~/types/StateMachine';
import { Direction, Grid, GridCoordinate, GridNode } from '~/types/Grid';

export type GridStateMachineState<TData extends object> = TData & {
    grid: Grid<GridNode>;
    node: GridNode;
};

export type GridStateMachineConfig<TData extends object> = Omit<
    StateMachineConfig<GridStateMachineState<TData>>,
    'nextStates'
> & {
    grid: Grid<GridNode>;
    getValidMoves: (state: GridStateMachineState<TData>) => Direction[];
    getNextState: (data: {
        state: GridStateMachineState<TData>;
        direction: Direction;
        nextNode: GridNode;
    }) => TData & {
        node: GridNode;
    };
};

export class GridStateMachine<TData extends object> extends StateMachine<
    GridStateMachineState<TData>
> {
    readonly grid: Grid<GridNode>;

    constructor({
        isEnd,
        onEnd,
        queueType,
        grid,
        getValidMoves,
        getNextState,
    }: GridStateMachineConfig<TData>) {
        super({
            isEnd,
            onEnd,
            nextStates: (state) => {
                return getValidMoves(state).reduce<
                    GridStateMachineState<TData>[]
                >((states, direction) => {
                    const nextNode = grid.getNeighborInDirection(
                        state.node.row,
                        state.node.col,
                        direction,
                    );
                    if (nextNode) {
                        const nextState = getNextState({
                            state,
                            direction,
                            nextNode,
                        });
                        states.push({
                            ...nextState,
                            grid,
                        });
                    }
                    return states;
                }, []);
            },
            queueType,
        });

        this.grid = grid;
    }

    walk({ start, data }: { start: GridCoordinate; data: TData }) {
        const node = this.grid.get(start);
        if (!node) {
            throw new Error('Invalid start coordinates');
        }
        this.run({
            start: {
                ...data,
                node,
                grid: this.grid,
            },
        });
    }
}
