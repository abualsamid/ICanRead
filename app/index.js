'use strict';

var React = require('react'),
    App = require('./app');

// No delay on clicks. https://www.npmjs.com/package/react-tap-event-plugin
var injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

// Spin up the speech code so there's not a delay on iPad when first playing words.
var utterance = new SpeechSynthesisUtterance();
utterance.volume=0;
speechSynthesis.speak(utterance);

React.render(<App />, document.getElementById('app'));
