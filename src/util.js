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

export const maxBy = cb => (a, b) => (cb(b) > cb(a) ? b : a);

export const minBy = cb => (a, b) => (cb(b) < cb(a) ? b : a);

export const dijkstra = (graph, source) => {
  const nodes = new Set(Object.keys(graph));
  const dist = new Map();
  const prev = new Map();

  [...nodes].forEach(node => dist.set(node, Infinity));
  dist.set(source, 0);

  while (nodes.size) {
    const closest = [...nodes].reduce(minBy(n => dist.get(n)));
    nodes.delete(closest);
    graph[closest].forEach(neighbor => {
      const alt = dist.get(closest) + 1;
      if (alt < dist.get(neighbor)) {
        dist.set(neighbor, alt);
        prev.set(neighbor, closest);
      }
    });
  }

  return [dist, prev];
};
