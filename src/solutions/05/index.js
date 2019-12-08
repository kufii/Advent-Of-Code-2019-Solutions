import input from './input';
import intcode from '../intcode';

const parseInput = () => input.split(',').map(Number);

export default {
  part1: () => 'Diagnostic code with input 1: ' + [...intcode(parseInput(), 1)].pop(),
  part2: () => 'Diagnostic code with input 5: ' + [...intcode(parseInput(), 5)].pop()
};
