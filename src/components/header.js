import m from 'mithril';
import z from 'zaftig';

export default () => ({
  view: () =>
    m(
      'header' +
        z`
        ff 'Raleway', 'Helvetica Neue', Helvetica, Arial, sans-serif
        text-align center
        bb 1 solid #eee
        & h1 {
          font-weight normal
          color rgb(75, 75, 75)
          font-size 3em
        }
      `,
      m('h1', 'Advent of Code 2019')
    )
});
