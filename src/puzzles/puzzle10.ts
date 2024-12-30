import { Puzzle } from './Puzzle';
import { getNumbers, splitFilter } from '~/util/parsing';
import { product } from '~/util/arithmetic';

class Bot {
    id: number;
    private readonly chips: number[] = [];
    lowBot?: Bot;
    lowOutput?: OutputBin;
    highBot?: Bot;
    highOutput?: OutputBin;
    receivedChipsFrom = new Map<number, Set<Bot>>();

    constructor({ id }: { id: number }) {
        this.id = id;
    }

    receiveChip(chip: number, from?: Bot) {
        if (this.chips.length >= 2) {
            throw new Error(`Bot ${this.id} already has two chips.`);
        }
        this.chips.push(chip);
        if (from) {
            if (!this.receivedChipsFrom.has(chip)) {
                this.receivedChipsFrom.set(chip, new Set());
            }
            this.receivedChipsFrom.get(chip)!.add(from);
        }

        if (this.chips.length === 2) {
            if (this.lowBot) {
                this.giveChip(this.getLow(), this.lowBot);
            } else if (this.lowOutput) {
                this.giveChip(this.getLow(), this.lowOutput);
            }
            if (this.highBot) {
                this.giveChip(this.getHigh(), this.highBot);
            } else if (this.highOutput) {
                this.giveChip(this.getHigh(), this.highOutput);
            }
        }
    }

    private giveChip(chip: number, recipient: Bot | OutputBin) {
        const index = this.chips.indexOf(chip);
        if (index === -1) {
            throw new Error(`Bot ${this.id} does not have chip ${chip}.`);
        }
        this.chips.splice(index, 1);
        recipient.receiveChip(chip, this);
    }

    private getLow() {
        return Math.min(...this.chips);
    }

    private getHigh() {
        return Math.max(...this.chips);
    }
}

class OutputBin {
    id: number;
    chips: number[] = [];
    receivedChipsFrom = new Map<number, Set<Bot>>();

    constructor({ id }: { id: number }) {
        this.id = id;
    }

    receiveChip(chip: number, from: Bot) {
        this.chips.push(chip);

        if (!this.receivedChipsFrom.has(chip)) {
            this.receivedChipsFrom.set(chip, new Set());
        }
        this.receivedChipsFrom.get(chip)!.add(from);
    }
}

export const puzzle10 = new Puzzle({
    day: 10,
    parseInput: (fileData, { example }) => {
        const bots = new Set<Bot>();
        const botsById = new Map<number, Bot>();

        const bins = new Set<OutputBin>();
        const binsById = new Map<number, OutputBin>();

        const getBot = (id: number) => {
            const bot = botsById.get(id) ?? new Bot({ id });
            botsById.set(id, bot);
            bots.add(bot);
            return bot;
        };

        const getBin = (id: number) => {
            const bin = binsById.get(id) ?? new OutputBin({ id });
            binsById.set(id, bin);
            bins.add(bin);
            return bin;
        };

        const chipsToGiveToBots: { chip: number; bot: Bot }[] = [];

        splitFilter(fileData).forEach((line) => {
            const numbers = getNumbers(line);
            if (numbers.length === 2) {
                const [value, botId] = numbers as [number, number];
                chipsToGiveToBots.push({
                    chip: value,
                    bot: getBot(botId),
                });
            } else if (numbers.length === 3) {
                const [, recipient1, recipient2] = line.match(
                    /bot \d+ gives low to (\w+) \d+ and high to (\w+) \d+/,
                )!;
                const [botId, lowRecipient, highRecipient] = numbers as [
                    number,
                    number,
                    number,
                ];
                const bot = getBot(botId);
                if (recipient1 === 'bot') {
                    bot.lowBot = getBot(lowRecipient);
                } else {
                    bot.lowOutput = getBin(lowRecipient);
                }
                if (recipient2 === 'bot') {
                    bot.highBot = getBot(highRecipient);
                } else {
                    bot.highOutput = getBin(highRecipient);
                }
            } else {
                throw new Error(`Invalid input: ${line}`);
            }
        });

        return {
            bots,
            botsById,
            bins,
            binsById,
            chipsToGiveToBots,
            isExample: example,
        };
    },
    part1: ({ bots, bins, chipsToGiveToBots, isExample }) => {
        const chipsToCompare = isExample ? [2, 5] : [17, 61];
        for (const { chip, bot } of chipsToGiveToBots) {
            bot.receiveChip(chip);
        }

        const botChains = chipsToCompare.map((chip) => {
            const bin = [...bins].find((bin) => bin.chips.includes(chip))!;
            const chain: Bot[] = [...bin.receivedChipsFrom.get(chip)!];
            let botsToInspect = new Set(chain);

            do {
                const nextBots = new Set<Bot>();
                for (const bot of botsToInspect) {
                    const parentBots = bot.receivedChipsFrom.get(chip);
                    if (parentBots) {
                        for (const parentBot of parentBots) {
                            if (!chain.includes(parentBot)) {
                                chain.push(parentBot);
                                nextBots.add(parentBot);
                            }
                        }
                    }
                }
                chain.push(...nextBots);
                botsToInspect = nextBots;
            } while (botsToInspect.size > 0);

            return chain;
        });

        const indexesPerChip = botChains.map((chain) => {
            const indexes = new Map<Bot, number>();
            for (const [iBot, bot] of chain.entries()) {
                if (!indexes.has(bot)) {
                    indexes.set(bot, iBot);
                }
            }
            return indexes;
        });

        const botsInBothChains = new Map<Bot, number>();
        for (const bot of bots) {
            if (indexesPerChip.every((indexes) => indexes.has(bot))) {
                botsInBothChains.set(
                    bot,
                    indexesPerChip.reduce(
                        (sum, indexes) => sum + indexes.get(bot)!,
                        0,
                    ),
                );
            }
        }

        const mostRelevantBot = [...botsInBothChains.entries()].reduce(
            (current, next) => (next[1] < current[1] ? next : current),
        )[0];

        return mostRelevantBot.id;
    },
    part2: ({ chipsToGiveToBots, binsById }) => {
        for (const { chip, bot } of chipsToGiveToBots) {
            bot.receiveChip(chip);
        }
        const targetBins = [0, 1, 2].reduce<OutputBin[]>((bins, id) => {
            const bin = binsById.get(id);
            if (bin) {
                bins.push(bin);
            }
            return bins;
        }, []);

        return product(Array.from(targetBins).map((bin) => bin.chips[0]!));
    },
});
