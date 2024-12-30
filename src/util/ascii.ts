import { Grid } from '~/types/Grid';

const smallLettersPresented = 'ABCDEFGHIJKLOPRSUYZ'.split('');
const rawSmallLetters = `
.##..###...##..###..####.####..##..#..#.###....##.#..#.#.....##..###..###...###.#..#.#...#####
#..#.#..#.#..#.#..#.#....#....#..#.#..#..#......#.#.#..#....#..#.#..#.#..#.#....#..#.#...#...#
#..#.###..#....#..#.###..###..#....####..#......#.##...#....#..#.#..#.#..#.#....#..#..#.#...#.
####.#..#.#....#..#.#....#....#.##.#..#..#......#.#.#..#....#..#.###..###...##..#..#...#...#..
#..#.#..#.#..#.#..#.#....#....#..#.#..#..#...#..#.#.#..#....#..#.#....#.#.....#.#..#...#..#...
#..#.###...##..###..####.#.....###.#..#.###...##..#..#.####..##..#....#..#.###...##....#..####`.trim();
const smallLetterGrid = Grid.fromStringBlock(rawSmallLetters);
const smallLettersToChars = new Map<string, string>();
const smallLetterWidth = 5;
for (const [iLetter, letter] of smallLettersPresented.entries()) {
    const rows: string[] = [];
    for (let row = 0; row < smallLetterGrid.height; row++) {
        rows.push(
            smallLetterGrid
                .getRow(row)
                .slice(
                    iLetter * smallLetterWidth,
                    (iLetter + 1) * smallLetterWidth,
                )
                .join(''),
        );
    }
    smallLettersToChars.set(rows.join(''), letter);
}

/**
 * Get a small ASCII character from a 5x6 grid of characters.
 */
export function getSmallAsciiCharacter(character: string[]): string {
    return smallLettersToChars.get(character.join('')) ?? '?';
}

const bigLettersPresented = 'ABCEFGHJKLNPRXZ'.split('');
const rawBigLetters = `
..##...#####...####..######.######..####..#....#....###.#....#.#......#....#.#####..#####..#....#.######.
.#..#..#....#.#....#.#......#......#....#.#....#.....#..#...#..#......##...#.#....#.#....#.#....#......#.
#....#.#....#.#......#......#......#......#....#.....#..#..#...#......##...#.#....#.#....#..#..#.......#.
#....#.#....#.#......#......#......#......#....#.....#..#.#....#......#.#..#.#....#.#....#..#..#......#..
#....#.#####..#......#####..#####..#......######.....#..##.....#......#.#..#.#####..#####....##......#...
######.#....#.#......#......#......#..###.#....#.....#..##.....#......#..#.#.#......#..#.....##.....#....
#....#.#....#.#......#......#......#....#.#....#.....#..#.#....#......#..#.#.#......#...#...#..#...#.....
#....#.#....#.#......#......#......#....#.#....#.#...#..#..#...#......#...##.#......#...#...#..#..#......
#....#.#....#.#....#.#......#......#...##.#....#.#...#..#...#..#......#...##.#......#....#.#....#.#......
#....#.#####...####..######.#.......###.#.#....#..###...#....#.######.#....#.#......#....#.#....#.######.`.trim();
const bigLetterGrid = Grid.fromStringBlock(rawBigLetters);
const bigLettersToChars = new Map<string, string>();
const bigLetterWidth = 7;
for (const [iLetter, letter] of bigLettersPresented.entries()) {
    const rows: string[] = [];
    for (let row = 0; row < bigLetterGrid.height; row++) {
        rows.push(
            bigLetterGrid
                .getRow(row)
                .slice(iLetter * bigLetterWidth, (iLetter + 1) * bigLetterWidth)
                .join(''),
        );
    }
    bigLettersToChars.set(rows.join(''), letter);
}

/**
 * Get a large ASCII character from a 7x10 grid of characters.
 */
export function getBigAsciiCharacter(character: string[]): string {
    return bigLettersToChars.get(character.join('')) ?? '?';
}
