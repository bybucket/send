const html = require('choo/html');

module.exports = function(state, emit) {
  const fade = state.layout ? '' : 'effect--fadeIn';
  return html`
  <div id="page-one" class="${fade}">
    <div class="title">${state.translate('welcomeHeader')}</div>
  </div>
  `;
};
