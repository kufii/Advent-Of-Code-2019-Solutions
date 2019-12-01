import m from 'mithril';
import z from 'zaftig';
import Header from './components/header';
import SolutionLoader from './components/solution-loader';

export default () => {
  z.global`
    $font-family 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;

    html, button, input, select, textarea, .pure-g [class *= "pure-u"] {
      ff $font-family
    }
  `;
  return { view: () => [m(Header), m('div.container', m(SolutionLoader))] };
};
