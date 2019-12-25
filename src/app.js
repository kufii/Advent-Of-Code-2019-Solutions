import m from 'mithril';
import z from 'zaftig';
import Header from './components/header';
import SolutionLoader from './components/solution-loader';

export default () => {
  z.global`
    $font-family 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;

    html, body {
      height 100%
    }

    html, button, input, select, textarea, .pure-g [class *= "pure-u"] {
      ff $font-family
    }
  `;
  return {
    view: () =>
      m(
        'div.container' +
          z`
          height 100%
          display flex
          flex-flow column
        `,
        [m(Header), m(SolutionLoader)]
      )
  };
};
