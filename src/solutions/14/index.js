import input from './input';
import { sum } from '../../util';

const parseInput = () =>
  input
    .split('\n')
    .map(line => line.match(/(.*) => (\d+) ([A-Z]+)/iu).slice(1))
    .reduce(
      (acc, [recipe, amount, chemical]) => ({
        ...acc,
        [chemical]: {
          amount: Number(amount),
          recipe: recipe
            .split(', ')
            .map(c => c.split(' '))
            .map(([amount, chemical]) => ({ amount: Number(amount), chemical }))
        }
      }),
      {}
    );

const getOreRequirements = (recipes, chemical, quantity, leftovers = {}) => {
  const quantityNeeded = quantity - (leftovers[chemical] || 0);
  if (quantityNeeded <= 0) {
    leftovers[chemical] -= quantity;
    return 0;
  }
  const quantityProduced = recipes[chemical].amount;
  const times = Math.ceil(quantityNeeded / quantityProduced);
  leftovers[chemical] = quantityProduced * times - quantityNeeded;
  return recipes[chemical].recipe
    .map(({ chemical, amount }) =>
      chemical === 'ORE'
        ? amount * times
        : getOreRequirements(recipes, chemical, amount * times, leftovers)
    )
    .reduce(sum);
};

export default {
  part1() {
    return getOreRequirements(parseInput(), 'FUEL', 1);
  },
  part2() {
    const trillion = 1000000000000;
    let i = 0;
    const run = step => {
      let result;
      do {
        i += step;
        result = getOreRequirements(parseInput(), 'FUEL', i);
      } while (result < trillion);
      i -= step;
    };
    let step = trillion / 10;
    do {
      run(step);
      step /= 10;
    } while (step >= 1);
    return i;
  }
};
