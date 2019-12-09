import input from './input';
import intcode from '../intcode';

const parseInput = () => input.split(',').map(Number);

const run = mode => [...intcode(parseInput(), mode)].pop();

export default {
  part1: () => 'BOOST keycode: ' + run(1),
  part2: () => 'Distress signal coordinates: ' + run(2)
};
