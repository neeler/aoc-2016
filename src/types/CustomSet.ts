/**
 * Essentially it's a Set where you can define what is used
 * to determine identity/equality.
 *
 * Really it's a wrapper around a Map.
 */
export class CustomSet<TData, TKey = string> {
    private itemMap = new Map<TKey, TData>();

    constructor(
        private readonly config: {
            getKey: (item: TData) => TKey;
        },
    ) {}

    static fromArray<TData, TKey = string>(
        arr: TData[],
        getKey: (item: TData) => TKey,
    ) {
        const customSet = new CustomSet<TData, TKey>({ getKey });
        arr.forEach((item) => customSet.add(item));
        return customSet;
    }

    add(item: TData) {
        const key = this.config.getKey(item);

        if (!this.itemMap.has(key)) {
            this.itemMap.set(key, item);
        }
    }

    get(key: TKey) {
        return this.itemMap.get(key);
    }

    getLike(item: TData) {
        return this.get(this.config.getKey(item));
    }

    delete(item: TData) {
        const key = this.config.getKey(item);
        this.deleteKey(key);
    }

    clear() {
        this.itemMap = new Map<TKey, TData>();
    }

    has(item: TData) {
        return this.hasKey(this.config.getKey(item));
    }

    hasKey(key: TKey) {
        return this.itemMap.has(key);
    }

    deleteKey(key: TKey) {
        if (this.itemMap.has(key)) {
            this.itemMap.delete(key);
        }
    }

    keys() {
        return [...this.itemMap.keys()];
    }

    values() {
        return [...this.itemMap.values()];
    }

    get size() {
        return this.itemMap.size;
    }
}
