export class SlidingWindow<T> {
    readonly windowSize: number;
    readonly window: T[] = [];

    constructor({ windowSize }: { windowSize: number }) {
        this.windowSize = windowSize;
    }

    push(value: T) {
        this.window.push(value);
        if (this.window.length > this.windowSize) {
            this.window.shift();
        }
    }

    getFullWindow() {
        if (this.window.length < this.windowSize) {
            return undefined;
        }

        return this.window;
    }
}
