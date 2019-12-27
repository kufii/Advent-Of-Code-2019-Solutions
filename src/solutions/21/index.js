import input from './input';
import intcode, { parse } from '../intcode';
import dedent from 'dedent';

const isAscii = num => num > 0 && num <= 128;

const run = script =>
  [...intcode(parse(input), script.trim() + '\n')]
    .filter(Boolean)
    .map(c => (isAscii(c) ? String.fromCodePoint(c) : c.toString()))
    .join('');

export default {
  part1: () =>
    run(dedent`
      NOT C J
      NOT B T
      OR T J
      NOT A T
      OR T J
      AND D J
      WALK
    `),
  part2: () =>
    run(dedent`
      NOT E T
      NOT H J
      AND T J
      NOT J J
      NOT C T
      AND T J
      NOT B T
      OR T J
      NOT A T
      OR T J
      AND D J
      RUN
    `)
};
