const obj = ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'].reduce(
  (obj, name) => {
    obj[`is${name}`] = a => Object.prototype.toString.call(a) === `[object ${name}]`;
    return obj;
  },
  {
    isGenerator: a =>
      a instanceof
      function*() {
        yield;
      }.constructor
  }
);
export const { isArguments, isFunction, isString, isNumber, isDate, isRegExp, isGenerator } = obj;
