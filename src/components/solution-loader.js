import m from 'mithril';
import z from 'zaftig';
import Select from './select';
import solutions from '../solutions';
import { isGenerator } from '../types';

export default () => {
  let day = localStorage.getItem('day') || 0;
  let loading = false;
  let output = '';

  let interval;
  let intervalRunning = false;

  const stopInterval = () => {
    clearInterval(interval);
    intervalRunning = false;
  };

  const runGenerator = gen => {
    const data = gen();
    output = '';
    interval = setInterval(() => {
      const { value, done } = data.next();
      done ? stopInterval() : (output = value && value.toString());
      m.redraw();
    }, solutions[day].interval || 0);
    intervalRunning = true;
  };

  const changeDay = newDay => {
    stopInterval();
    day = newDay;
    localStorage.setItem('day', day);
    output = '';
  };

  const load = fn => {
    stopInterval();
    loading = true;
    m.redraw();
    Promise.resolve(fn())
      .then(data => {
        loading = false;
        isGenerator(data) ? runGenerator(data) : (output = data.toString());
      })
      .then(m.redraw)
      .catch(err => {
        output = 'Error';
        loading = false;
        console.error(err);
        m.redraw();
      });
  };

  const loadButton = (text, onclick) =>
    m(
      'button.pure-button.pure-button-primary' + z`m 4 2`,
      {
        type: 'button',
        disabled: loading,
        onclick
      },
      text
    );

  return {
    view: () =>
      m('div' + z`text-align center; p 1em`, [
        m(
          'form.pure-form',
          m('fieldset', [
            m('label', 'Day: '),
            m(Select, {
              options: solutions.map((_, index) => ({
                value: index,
                text: `Day ${index + 1}`
              })),
              selected: day,
              onselect: changeDay
            }),
            m('div', [
              loadButton('Part 1', () => load(solutions[day].part1)),
              loadButton('Part 2', () => load(solutions[day].part2))
            ]),
            m(
              'div',
              { hidden: !intervalRunning },
              m('button.pure-button', { onclick: stopInterval }, 'Stop!')
            )
          ])
        ),
        m(
          'pre' +
            z`
            line-height 1em;
            padding 5px;
            overflow visible;
          `,
          loading ? 'Loading...' : output
        )
      ])
  };
};
