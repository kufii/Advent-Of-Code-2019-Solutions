import input from './input';
import dedent from 'dedent';

const getInput = () => input.split(',').map(Number);

const run = (noun, verb) => {
  const ints = getInput();
  ints[1] = noun;
  ints[2] = verb;
  let pos = 0;
  while (ints[pos] !== 99) {
    const [op, num1Pos, num2Pos, outputPos] = ints.slice(pos, pos + 4);
    const num1 = ints[num1Pos];
    const num2 = ints[num2Pos];
    ints[outputPos] = op === 1 ? num1 + num2 : num1 * num2;
    pos += 4;
  }
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
