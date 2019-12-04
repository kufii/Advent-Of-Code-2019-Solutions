import input from './input';
import { range } from '../../util';

const parseInput = () => range(...input.split('-').map(Number));

const meets = pass => pass.match(/(\d)\1/u) && pass === [...pass].sort().join('');

const meets2 = pass =>
  meets(pass) &&
  pass
    .replace(/((\d)\2*)/gu, '$1,')
    .split(',')
    .some(str => str.length === 2);

export default {
  part1: () =>
    '# of passwords that meet criteria: ' +
    parseInput()
      .map(String)
      .filter(meets).length,
  part2: () =>
    '# of passwords that meet criteria: ' +
    parseInput()
      .map(String)
      .filter(meets2).length
};
