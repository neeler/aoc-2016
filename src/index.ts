import kleur from 'kleur';
import { puzzle1 } from '~/puzzles';
import { Timer } from '~/util/Timer';

async function start() {
    const timer = new Timer();

    await puzzle1.run({
        example: true,
        mainProblem: true,
    });

    console.log(kleur.cyan(`All puzzles ran in ${timer.time}.`));
}

start();
