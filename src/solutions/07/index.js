import input from './input';
import intcode, { parse } from '../intcode';
import { range, getPermutations } from '../../util';

const getThrusterSignal = (program, sequence) => {
  let result = 0;
  sequence.forEach(n => (result = [...intcode(program.slice(), [n, result])].pop()));
  return result;
};

const getThrusterFeedback = (program, sequence) => {
  const amplifiers = sequence.map(n => intcode(program.slice(), [n, 0]));
  let result;
  let i = 0;
  let value, done;

  while (!done) {
    ({ value, done } = amplifiers[i % sequence.length].next(result));
    if (value != null) result = value;
    i++;
  }

  return result;
};

export default {
  part1() {
    const program = parse(input);
    const sequences = [...getPermutations(range(0, 4))];
    return (
      'Highest thruster signal: ' +
      Math.max(...sequences.map(sequence => getThrusterSignal(program, sequence)))
    );
  },
  part2() {
    const program = parse(input);
    const sequences = [...getPermutations(range(5, 9))];
    return (
      'Highest thruster signal with feedback: ' +
      Math.max(...sequences.map(sequence => getThrusterFeedback(program, sequence)))
    );
  }
};
