export class LinkedListNode<T> {
    public next: LinkedListNode<T> | null = null;
    public prev: LinkedListNode<T> | null = null;

    constructor(public value: T) {}
}

export class LinkedList<T> {
    head: LinkedListNode<T> | null = null;
    tail: LinkedListNode<T> | null = null;
    size = 0;
    readonly isCycle: boolean;

    constructor({ isCycle = false }: { isCycle?: boolean } = {}) {
        this.isCycle = isCycle;
    }

    append(value: T): LinkedListNode<T> {
        const node = new LinkedListNode(value);

        if (!this.head) {
            this.head = node;
            this.tail = node;
        } else {
            this.tail!.next = node;
            node.prev = this.tail;
            this.tail = node;
        }

        if (this.isCycle) {
            this.tail.next = this.head;
            this.head.prev = this.tail;
        }

        this.size++;

        return node;
    }

    remove(node: LinkedListNode<T>): void {
        if (node.prev) {
            node.prev.next = node.next;
        } else {
            this.head = node.next;
        }

        if (node.next) {
            node.next.prev = node.prev;
        } else {
            this.tail = node.prev;
        }

        this.size--;

        if (this.isCycle && this.size > 0) {
            this.tail!.next = this.head;
            this.head!.prev = this.tail;
        }
    }

    getNFrom(node: LinkedListNode<T>, n: number): LinkedListNode<T> | null {
        let current: LinkedListNode<T> | null = node;
        for (let i = 0; current && i < n; i++) {
            current = current.next;
        }

        return current;
    }

    toArray(): T[] {
        const arr: T[] = [];
        let current = this.head;

        while (current) {
            arr.push(current.value);
            current = current.next;
        }

        return arr;
    }
}
