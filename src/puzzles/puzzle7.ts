import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';

export const puzzle7 = new Puzzle({
    day: 7,
    parseInput: (fileData) => {
        return splitFilter(fileData).map((ip) => {
            const hypernets = ip.match(/\[(\w+)]/g) ?? [];
            const supernets = ip.split(/\[\w+]/g);
            return {
                ip,
                hypernets,
                supernets,
            };
        });
    },
    part1: (ips) => {
        return ips.filter(({ hypernets, supernets }) => {
            return (
                hypernets.every((h) => !hasAbba(h)) &&
                supernets.some((n) => hasAbba(n))
            );
        }).length;
    },
    part2: (ips) => {
        return ips.filter(({ hypernets, supernets }) => {
            const abas = supernets.flatMap(findAbas);
            if (abas.length === 0) {
                return false;
            }
            const targetBabs = abas.map(abaToBab);
            const babs = new Set(hypernets.flatMap(findAbas));
            return targetBabs.some((bab) => babs.has(bab));
        }).length;
    },
});

function hasAbba(s: string) {
    for (let i = 0; i < s.length - 3; i++) {
        if (s[i] === s[i + 3] && s[i + 1] === s[i + 2] && s[i] !== s[i + 1]) {
            return true;
        }
    }
    return false;
}

function findAbas(s: string) {
    const abas: string[] = [];
    for (let i = 0; i < s.length - 2; i++) {
        if (s[i] === s[i + 2] && s[i] !== s[i + 1]) {
            abas.push(s.slice(i, i + 3));
        }
    }
    return abas;
}

function abaToBab(aba: string) {
    if (aba.length !== 3) {
        throw new Error(`Invalid ABA: ${aba}`);
    }
    return aba[1]! + aba[0]! + aba[1]!;
}
