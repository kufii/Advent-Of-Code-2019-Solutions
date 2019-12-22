import input from './input';
import { range } from '../../util';
import { modInv, modPow } from 'bigint-crypto-utils';

const parseInput = () =>
  input
    .split('\n')
    .map(line =>
      (
        line.match(/(cut) (-?\d+)/u) ||
        line.match(/(deal) with increment (\d+)/u) || [null, 'reverse', 1]
      ).slice(1)
    )
    .map(([type, n]) => ({ type, n: Number(n) }));

const getDeck = (num = 10007) => range(0, num - 1);

const reverse = cards => cards.reverse();

const deal = (cards, num) => {
  const stack = new Array(cards.length);
  let i = 0;
  while (cards.length) {
    stack[i % stack.length] = cards.shift();
    i += num;
  }
  return stack;
};

const cut = (cards, num) => {
  if (num >= 0) {
    const stack = cards.splice(0, num);
    return [...cards, ...stack];
  } else {
    const stack = cards.splice(num, Math.abs(num));
    return [...stack, ...cards];
  }
};

const getCardAt = (index, instructions, cards, repeats) => {
  let offsetDiff = BigInt(0);
  let incrementMul = BigInt(1);
  instructions.forEach(({ type, n }) => {
    if (type === 'reverse') {
      incrementMul = -incrementMul % cards;
      offsetDiff = (offsetDiff + incrementMul) % cards;
    } else if (type === 'cut') {
      offsetDiff = (offsetDiff + BigInt(n) * incrementMul) % cards;
    } else {
      incrementMul = (incrementMul * modInv(BigInt(n), cards)) % cards;
    }
  });

  const increment = modPow(incrementMul, repeats, cards);
  const offset =
    (offsetDiff * (BigInt(1) - increment) * modInv((BigInt(1) - incrementMul) % cards, cards)) %
    cards;

  return Number((offset + increment * index) % cards);
};

export default {
  part1() {
    let cards = getDeck();
    parseInput().forEach(
      ({ type, n }) =>
        (cards =
          type === 'reverse' ? reverse(cards) : type === 'deal' ? deal(cards, n) : cut(cards, n))
    );
    return 'Position of card 2019: ' + cards.indexOf(2019);
  },
  part2() {
    const instructions = parseInput();

    return (
      'Card at position 2020: ' +
      getCardAt(BigInt(2020), instructions, BigInt(119315717514047), BigInt(101741582076661))
    );
  }
};
