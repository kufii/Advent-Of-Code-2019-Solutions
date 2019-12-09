const expandMemory = (nums, pos) =>
  pos >= nums.length && nums.push(...[...'0'.repeat(pos - nums.length + 1)].map(Number));

const getAtAddress = (nums, pos) => (expandMemory(nums, pos), nums[pos]);

const setAtAddress = (nums, base, mode, pos, value) => (
  expandMemory(nums, pos), (nums[mode === 2 ? pos + base : pos] = value)
);

const getNum = (nums, base, mode, num) =>
  mode === 1 ? num : getAtAddress(nums, num + (mode === 2 ? base : 0));

const OPS = {
  1: {
    fn: (nums, base, [mode1, mode2, modeAddress], num1, num2, address) =>
      setAtAddress(
        nums,
        base,
        modeAddress,
        address,
        getNum(nums, base, mode1, num1) + getNum(nums, base, mode2, num2)
      ),
    params: 3
  },
  2: {
    fn: (nums, base, [mode1, mode2, modeAddress], num1, num2, address) =>
      setAtAddress(
        nums,
        base,
        modeAddress,
        address,
        getNum(nums, base, mode1, num1) * getNum(nums, base, mode2, num2)
      ),
    params: 3
  },
  3: {
    fn: (nums, base, [modeAddress], address, input) =>
      setAtAddress(nums, base, modeAddress, address, input.shift()),
    params: 1,
    input: true
  },
  4: {
    fn: (nums, base, [mode], num) => getNum(nums, base, mode, num),
    params: 1,
    output: true
  },
  5: {
    fn: (nums, base, [mode1, mode2], num1, num2) =>
      getNum(nums, base, mode1, num1) ? getNum(nums, base, mode2, num2) : null,
    params: 2,
    flow: true
  },
  6: {
    fn: (nums, base, [mode1, mode2], num1, num2) =>
      !getNum(nums, base, mode1, num1) ? getNum(nums, base, mode2, num2) : null,
    params: 2,
    flow: true
  },
  7: {
    fn: (nums, base, [mode1, mode2, modeAddress], num1, num2, address) =>
      setAtAddress(
        nums,
        base,
        modeAddress,
        address,
        getNum(nums, base, mode1, num1) < getNum(nums, base, mode2, num2) ? 1 : 0
      ),
    params: 3
  },
  8: {
    fn: (nums, base, [mode1, mode2, modeAddress], num1, num2, address) =>
      setAtAddress(
        nums,
        base,
        modeAddress,
        address,
        getNum(nums, base, mode1, num1) === getNum(nums, base, mode2, num2) ? 1 : 0
      ),
    params: 3
  },
  9: {
    fn: (nums, base, [mode], num) => base + getNum(nums, base, mode, num),
    params: 1,
    base: true
  }
};

const readOp = code =>
  code
    .toString()
    .padStart(5, '0')
    .match(/(\d)(\d)(\d)(\d\d)/u)
    .slice(1)
    .map(Number)
    .reverse();

export default function*(program, ...input) {
  let base = 0;
  let pos = 0;
  while (program[pos] !== 99) {
    const [op, ...modes] = readOp(program[pos]);
    const params = program.slice(pos + 1, pos + 1 + OPS[op].params);
    if (OPS[op].input) {
      const inp = yield;
      if (inp) input = Array.isArray(inp) ? inp : [inp];
    }
    const result = OPS[op].fn(program, base, modes, ...params, input);
    if (OPS[op].output) yield result;
    if (OPS[op].base) base = result;
    pos = OPS[op].flow && result != null ? result : pos + 1 + OPS[op].params;
  }
}
