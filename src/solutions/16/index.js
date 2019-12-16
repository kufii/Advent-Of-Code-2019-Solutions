import input from './input';
import { range, sum, nTimes } from '../../util';

const parseInput = (repeat = 1) => [...input.repeat(repeat)].map(Number);

const phase = nums =>
  range(0, nums.length - 1).map(cycle => {
    let num = 0;
    let add = true;
    for (let i = cycle; i < nums.length; i += (cycle + 1) * 2) {
      num += nums.slice(i, Math.min(i + cycle + 1, nums.length)).reduce(sum) * (add ? 1 : -1);
      add = !add;
    }
    return Math.abs(num) % 10;
  });

const phaseLastHalf = nums => {
  for (let i = nums.length - 1; i >= 0; i--) {
    nums[i] = ((nums[i + 1] || 0) + nums[i]) % 10;
  }
  return nums;
};

export default {
  part1() {
    let nums = parseInput();
    nTimes(100, () => (nums = phase(nums)));
    return 'First 8 digits after 100 phases: ' + nums.slice(0, 8).join('');
  },
  part2() {
    let nums = parseInput(10000);
    const offset = Number(nums.slice(0, 7).join(''));
    nums = nums.slice(offset);
    nTimes(100, () => (nums = phaseLastHalf(nums)));
    return 'First 8 digits after 100 phases: ' + nums.slice(0, 8).join('');
  }
};
