import { isString } from './types';

export const makeArray = (ySize, xSize, fill) => {
  const arr = [];
  for (let y = 0; y < ySize; y++) {
    if (xSize) {
      arr.push([]);
      for (let x = 0; x < xSize; x++) {
        arr[y].push(fill);
      }
    } else {
      arr.push(fill);
    }
  }
  return arr;
};

export const output2dArray = arr => arr.map(line => line.join('')).join('\n');

export const fastMax = arr => arr.reduce((max, v) => (max >= v ? max : v), -Infinity);

export const fastMin = arr => arr.reduce((max, v) => (max <= v ? max : v), Infinity);

export const sum = (a, b) => a + b;

export const sortNum = (a, b) => a - b;

export const nTimes = (n, cb) => {
  for (let i = 0; i < n; i++) cb();
};

export const range = (start, stop) => {
  const result = [];
  const numOrCharCode = n => (isString(n) ? n.charCodeAt(0) : n);
  for (let i = numOrCharCode(start); i <= numOrCharCode(stop); i++) {
    result.push(isString(start) ? String.fromCharCode(i) : i);
  }
  return result;
};

export class InfiniteGrid {
  constructor(fill) {
    this.fill = fill;
    this.grid = new Map();
  }

  get bounds() {
    const cells = this.getSetCells();
    const minX = fastMin(cells.map(({ x }) => x));
    const maxX = fastMax(cells.map(({ x }) => x));
    const minY = fastMin(cells.map(({ y }) => y));
    const maxY = fastMax(cells.map(({ y }) => y));
    return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } };
  }

  key(x, y) {
    return `${x},${y}`;
  }

  set(x, y, value) {
    this.grid.set(this.key(x, y), value);
  }

  get(x, y) {
    return this.grid.has(this.key(x, y)) ? this.grid.get(this.key(x, y)) : this.fill;
  }

  getSetCells() {
    return [...this.grid.entries()]
      .map(([pos, value]) => [...pos.split(',').map(Number), value])
      .map(([x, y, value]) => ({ x, y, value }));
  }

  toString() {
    let output = '';
    const { min, max } = this.bounds;
    for (let y = min.y; y <= max.y; y++) {
      output += '\n';
      for (let x = min.x; x <= max.x; x++) {
        output += this.get(x, y);
      }
    }
    return output.trim();
  }
}
