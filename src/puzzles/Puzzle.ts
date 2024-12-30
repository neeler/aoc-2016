import kleur from 'kleur';
import { year } from '~/constants';
import { Timer } from '~/util/Timer';
import { readDataFile } from '~/util/readDataFile';

interface FileProcessorOptions {
    example?: boolean;
    puzzle?: boolean;
    part: number;
}

type FileProcessor<TData> = (
    fileData: string,
    options: FileProcessorOptions,
) => TData;

interface PuzzleConfig<TData> {
    day: number;
    parseInput: FileProcessor<TData>;
    example1?: (data: TData) => any;
    part1: (data: TData) => any;
    example2?: (data: TData) => any;
    part2: (data: TData) => any;
    skipExample?: boolean;
    skipPart1?: boolean;
    skipPart2?: boolean;
}

export class Puzzle<TData = string> {
    constructor(private readonly config: PuzzleConfig<TData>) {}

    private processFile(fileData: string, options: FileProcessorOptions) {
        return this.config.parseInput(fileData.trim(), options);
    }

    getExampleData({ part }: { part: number }) {
        const data = readDataFile(`puzzle${this.config.day}-example.txt`);
        if (!data) {
            return undefined;
        }
        return this.processFile(data, { example: true, part });
    }

    getPuzzleData({ part }: { part: number }) {
        const data = readDataFile(`puzzle${this.config.day}-input.txt`);
        if (!data) {
            return undefined;
        }
        return this.processFile(data, { puzzle: true, part });
    }

    async run({
        example = false,
        mainProblem = true,
    }: { example?: boolean; mainProblem?: boolean } = {}) {
        if (!(example || mainProblem)) {
            return;
        }

        const timer = new Timer();
        console.log(
            kleur.magenta(`
AoC ${year} Day ${this.config.day}
`),
        );

        if (!this.config.skipPart1) {
            timer.reset();
            const exampleData = example
                ? this.getExampleData({ part: 1 })
                : undefined;
            if (exampleData) {
                const result = await (
                    this.config.example1 ?? this.config.part1
                )(exampleData);

                printResult({
                    part: 1,
                    label: 'Example',
                    result,
                    timer,
                });
            }

            timer.reset();
            const puzzleData = mainProblem
                ? this.getPuzzleData({ part: 1 })
                : undefined;
            if (puzzleData) {
                const result = await this.config.part1(puzzleData);

                printResult({
                    part: 1,
                    label: 'Input',
                    result,
                    timer,
                });
            }
        }

        if (!this.config.skipPart2) {
            timer.reset();
            const exampleData = example
                ? this.getExampleData({ part: 2 })
                : undefined;
            if (exampleData) {
                const result = await (
                    this.config.example2 ?? this.config.part2
                )(exampleData);

                printResult({
                    part: 2,
                    label: 'Example',
                    result,
                    timer,
                });
            }

            timer.reset();
            const puzzleData = mainProblem
                ? this.getPuzzleData({ part: 2 })
                : undefined;
            if (puzzleData) {
                const result = await this.config.part2(puzzleData);

                printResult({
                    part: 2,
                    label: 'Input',
                    result,
                    timer,
                });
            }
        }
    }
}

function printResult({
    part,
    label,
    result,
    timer,
    indent = '  ',
}: {
    part: number;
    label: 'Example' | 'Input';
    result: number;
    timer: Timer;
    indent?: string;
}) {
    console.log(
        kleur.bold().magenta(`${indent}Part ${part} `) + kleur.blue(label),
    );

    if (result === undefined) {
        console.log(kleur.yellow(`${indent}Not solved yet.`));
    } else {
        console.log(
            kleur.white(`${indent}Result `) + kleur.bold().green(result),
        );
        console.log(kleur.white(`${indent}Ran for ${timer.time}`));
    }

    console.log('');
}
