export function countCharacters(s: string) {
    const charCounts = new Map<string, number>();

    for (const char of s.split('')) {
        charCounts.set(char, (charCounts.get(char) ?? 0) + 1);
    }

    return charCounts;
}
