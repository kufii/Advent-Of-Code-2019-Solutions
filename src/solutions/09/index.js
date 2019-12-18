import input from './input';
import intcode, { parse } from '../intcode';

const run = mode => [...intcode(parse(input), mode)].pop();

export default {
  part1: () => 'BOOST keycode: ' + run(1),
  part2: () => 'Distress signal coordinates: ' + run(2)
};
