export function isUndefined(value: any): value is undefined {
    return value === undefined;
}

export function isNull(value: any): value is null {
    return value === null;
}

export function isNullish(value: any): value is null | undefined {
    return isUndefined(value) || isNull(value);
}
