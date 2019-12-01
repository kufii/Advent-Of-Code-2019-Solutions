import input from './input';

const getInput = () => input.split('\n').map(Number);

const getFuel = n => Math.floor(n / 3 - 2);

const getFuelTotal = n => {
  const fuel = getFuel(n);
  return fuel > 0 ? fuel + getFuelTotal(fuel) : 0;
};

const sum = (a, b) => a + b;

export default {
  part1: () =>
    'Sum of the fuel requirements: ' +
    getInput()
      .map(getFuel)
      .reduce(sum),
  part2: () =>
    'Sum of the fuel requirements: ' +
    getInput()
      .map(getFuelTotal)
      .reduce(sum)
};
