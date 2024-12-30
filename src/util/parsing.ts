/**
 * Splits a string into an array of strings, filtering out empty strings.
 *
 * @param str The string to split.
 * @param [delimiter='\n'] The delimiter to split the string on.
 */
export function splitFilter(
    str: string,
    delimiter: string | RegExp = '\n',
): string[] {
    return str.split(delimiter).filter((s) => s);
}

export function parseStringBlock(str: string): string[][] {
    return splitFilter(str).map((s) => splitFilter(s, ''));
}

/**
 * Splits a string into an array of strings, filtering out empty strings,
 * then parses each string into a number.
 *
 * @param str The string to split.
 * @param [delimiter=',']  The delimiter to split the string on.
 */
export function parseNumberList(
    str: string,
    delimiter: string | RegExp = ',',
): number[] {
    return splitFilter(str, delimiter).map(Number);
}

/**
 * Get numbers from a string, including negative numbers.
 */
export function getNumbers(str: string): number[] {
    return str.match(/-?\d+/g)?.map(Number) ?? [];
}
/**
 * Get numbers from a multiline string, including negative numbers.
 */
export function getMultilineNumbers(str: string): number[] {
    return str.match(/-?\d+/gm)?.map(Number) ?? [];
}

/**
 * Get numbers from each line of a string, including negative numbers.
 */
export function getNumbersForEachLine(str: string): number[][] {
    return splitFilter(str).map(getNumbers);
}
