import input from './input';

const parseInput = () => input.split('\n').map(Number);

const getFuel = n => Math.max(Math.floor(n / 3 - 2), 0);

const getFuelTotal = n => {
  const fuel = getFuel(n);
  return fuel && fuel + getFuelTotal(fuel);
};

const sum = (a, b) => a + b;

export default {
  part1: () =>
    'Sum of the fuel requirements: ' +
    parseInput()
      .map(getFuel)
      .reduce(sum),
  part2: () =>
    'Sum of the fuel requirements: ' +
    parseInput()
      .map(getFuelTotal)
      .reduce(sum)
};
