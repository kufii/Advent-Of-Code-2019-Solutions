import input from './input';
import dedent from 'dedent';
import intcode from '../intcode';

const parseInput = () => input.split(',').map(Number);

const run = (noun, verb) => {
  const ints = parseInput();
  ints[1] = noun;
  ints[2] = verb;
  Array.from(intcode(ints));
  return ints[0];
};

export default {
  part1: () => 'Result of program: ' + run(12, 2),
  part2() {
    const expected = 19690720;
    for (let noun = 0; noun <= 99; noun++) {
      for (let verb = 0; verb <= 99; verb++) {
        if (run(noun, verb) === expected) {
          return dedent`
            Result is ${expected} with noun ${noun} and verb ${verb}.
            100 * noun + verb: ${100 * noun + verb}.
          `;
        }
      }
    }
  }
};
