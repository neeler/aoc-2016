import { Queue } from '~/types/Queue';
import { ProcessStruct } from '~/types/ProcessStruct';

export interface StateMachineConfig<TData extends object> {
    isEnd: (state: TData) => boolean;
    onEnd: (
        state: TData,
        options: {
            stop: () => void;
        },
    ) => void;
    nextStates: (state: TData) => TData[];
    queueType?: new () => ProcessStruct<TData>;
}

export class StateMachine<TData extends object> {
    readonly isEnd: (state: TData) => boolean;
    readonly onEnd: (
        state: TData,
        options: {
            stop: () => void;
        },
    ) => void;
    readonly nextStates: (state: TData) => TData[];
    readonly QueueClass: {
        new (): ProcessStruct<TData>;
    };

    constructor({
        isEnd,
        onEnd,
        nextStates,
        queueType = Queue<TData>,
    }: StateMachineConfig<TData>) {
        this.isEnd = isEnd;
        this.onEnd = onEnd;
        this.nextStates = nextStates;
        this.QueueClass = queueType;
    }

    run({ start }: { start: TData }) {
        const queue = new this.QueueClass();
        queue.add(start);

        queue.process((state) => {
            if (this.isEnd(state)) {
                this.onEnd(state, {
                    stop: () => queue.reset(),
                });
                return;
            }

            for (const nextState of this.nextStates(state)) {
                queue.add(nextState);
            }
        });
    }
}
