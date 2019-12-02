import input from './input';
import dedent from 'dedent';

const getInput = () => input.split(',').map(Number);

const run = ints => {
  let position = 0;
  while (ints[position] !== 99) {
    const op = ints[position];
    const num1 = ints[ints[position + 1]];
    const num2 = ints[ints[position + 2]];
    const outputPos = ints[position + 3];
    ints[outputPos] = op === 1 ? num1 + num2 : num1 * num2;
    position += 4;
  }
  return ints[0];
};

export default {
  part1() {
    const ints = getInput();
    ints[1] = 12;
    ints[2] = 2;
    return 'Result of program: ' + run(ints);
  },
  part2() {
    const expected = 19690720;
    for (let noun = 0; noun <= 99; noun++) {
      for (let verb = 0; verb <= 99; verb++) {
        const ints = getInput();
        ints[1] = noun;
        ints[2] = verb;
        if (run(ints) === expected) {
          return dedent`
            Result is ${expected} with noun ${noun} and verb ${verb}.
            100 * noun + verb: ${100 * noun + verb}.
          `;
        }
      }
    }
  }
};
