import input from './input';
import intcode, { parse } from '../intcode';

export default {
  part1: () => 'Diagnostic code with input 1: ' + [...intcode(parse(input), 1)].pop(),
  part2: () => 'Diagnostic code with input 5: ' + [...intcode(parse(input), 5)].pop()
};
