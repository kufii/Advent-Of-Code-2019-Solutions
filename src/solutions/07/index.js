import input from './input';
import intcode from '../intcode';
import { range } from '../../util';

const parseInput = () => input.split(',').map(Number);

const getThrusterSignal = (program, sequence) => {
  let result = 0;
  sequence.forEach(n => (result = [...intcode(program.slice(), n, result)].pop()));
  return result;
};

const getThrusterFeedback = (program, sequence) => {
  const p = program.slice();
  const amplifiers = sequence.map(n => intcode(p.slice(), n, 0));
  let result = 0;
  let i = 0;
  let value, done;

  while (!done) {
    ({ value, done } = amplifiers[i % sequence.length].next(result));
    if (value != null) result = value;
    i++;
  }

  return result;
};

const getPermutations = array => {
  const result = [];

  const p = (array, temp) => {
    let i, x;
    if (!array.length) result.push(temp);

    for (i = 0; i < array.length; i++) {
      x = array.splice(i, 1)[0];
      p(array, temp.concat(x));
      array.splice(i, 0, x);
    }
  };

  p(array, []);
  return result;
};

export default {
  part1() {
    const program = parseInput();
    const sequences = [...getPermutations(range(0, 4))];
    return (
      'Highest thruster signal: ' +
      Math.max(...sequences.map(sequence => getThrusterSignal(program, sequence)))
    );
  },
  part2() {
    const program = parseInput();
    const sequences = [...getPermutations(range(5, 9))];
    return (
      'Highest thruster signal with feedback: ' +
      Math.max(...sequences.map(sequence => getThrusterFeedback(program, sequence)))
    );
  }
};
