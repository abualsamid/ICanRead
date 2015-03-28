'use strict';

// Inspiration: http://bl.ocks.org/insin/317108e9df278c350f30
// Inspiration: https://github.com/winkler1/SillySay
var Firebase = require('firebase');
var React = require('react');
var Hammer = require('hammerjs');
var FIREBASE_URL = 'https://crackling-torch-9272.firebaseio.com/';
var Register = require('./register');

var speechSettings = {
  rate: 0.1, // 0.1-10
  pitch: 1, // 0-2
  lang: 'en-US'
};

// TODO: Gear icon, expand/collapse.
var SettingsPanel = React.createClass({
  render() {
    var voices = speechSynthesis.getVoices();

    {
      JSON.stringify(voices)
    }
    return <div className='row'>

    </div>
  }
});

// Some words don't get pronounced correctly.
var phoneticSpelling = {
  monkey: 'monkey',
  Misha: 'Meesha',
  Obi: 'Ohbee'
}

var WordButton = React.createClass({
  propTypes: {
    wordClicked: React.PropTypes.func.isRequired,
    nextWord: React.PropTypes.func.isRequired,
    word: React.PropTypes.string.isRequired,
    color: React.PropTypes.string.isRequired
  },

  wordClicked() {
    this.props.wordClicked(this.props.word);
  },
  prevWord() {
    this.props.nextWord(-1);
  },
  nextWord() {
    this.props.nextWord(1);
  },

  render() {
    var labelStyles = { padding: '20px', fontSize: 'x-large', color: 'white', width: '100%'};

    return (
      <div className='col-md-12 col-xs-12 WordButton'>
        <a className="left carousel-control" href="javascript:void(0);" role="button" onClick={this.prevWord}>
          <span className="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
          <span className="sr-only">Previous</span>
        </a>
        <a className="right carousel-control" href="javascript:void(0);" role="button" onClick={this.nextWord}>
          <span className="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
          <span className="sr-only">Next</span>
        </a>
        <button className='btn btn-primary text-capitalized text-center'
          style={labelStyles}
          onClick={this.wordClicked}>
          {this.props.word}
        </button>
      </div>
    );
  }
});

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

// Render a collection of words as big buttons.
var SoundBoard = React.createClass({
  propTypes: {
    wordClicked: React.PropTypes.func.isRequired,
    words: React.PropTypes.array.isRequired,
    color: React.PropTypes.string.isRequired
  },
  getInitialState() {
    return ({
      index: 0,
      length: this.props.words.length,
  })},

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      length: nextProps.words.length
    });
  },

  componentDidMount() {
    setTimeout(() => {
      var self = this;
      var hammerTime= new Hammer(document.getElementById('swipe'));
      hammerTime.on('panleft panright tap press swiperight swipeleft', function(ev) {
        self.nextWord( (ev.type=="panleft" || ev.type=="swipeleft")?-1:1 );
      })

    },300);
  },

  nextWord(dir) {
    dir = dir || 1;
    var index = this.state.index + dir;
    if (index<0) {
      if (this.state.length==0) {
        index=0;
      } else {
        index = this.state.length - 1;
      }
    } else {
      if (index>=this.state.length) {
        index=0;
      }
    }
    this.setState({index: index});
    console.log('new index is ', index);
  },
  renderWordButtons() {
    var index = this.state.index || 0;
    var word = this.props.words[index] || "Hi";
    return (
      <WordButton key={index}
        color={this.props.color}
        word={word}
        wordClicked={this.props.wordClicked}
        nextWord = {this.nextWord}
      />
    );

  },
  render() {
    return (
      <div className='row' id='swipe'>
          {this.renderWordButtons()}
      </div>
    );
  }
});


var WordForm = React.createClass({

  props: {
    submitHandler: React.PropTypes.func.isRequired
  },

  handleSubmit(e) {
    var word, wordInputNode;
    e.preventDefault();
    wordInputNode = this.refs.wordInput.getDOMNode();
    word = wordInputNode.value;
    this.props.submitHandler(word);
    wordInputNode.value = '';
  },

  render() {
    var formStyle = {
      marginTop: 10
    };
    return (
      <div className='row'>
        <form className='form-inline' onSubmit={this.handleSubmit} >
          <div className='form-group'>
            <input type='text' ref='wordInput' placeholder='word'/>

          </div>
          <button className='btn btn-primary' type='submit'>
            Add New Word
          </button>
        </form>
      </div>

    );
  }
});

var SentenceBuilder = React.createClass({
  propTypes: {
    words: React.PropTypes.array.isRequired
  },

  render() {
    return (
      <div style={{textAlign: 'center', padding: 10}}>
        { this.props.words.join(' ') }
      </div>
    );
  }
});
var INITIAL_SUBJECTS = [
  'Bassel',
  'I',
  'Mommy',
  'Asia',
  'Monkey',
  'Luka',
  'The cat',
  'The ball',
  'My Book',
  'My car'
];
var INITIAL_OBJECTS = [
  'Silly',
  'a monkey',
  'the hat',
  'a ball',
  'the book',
  'his car',
  'snow',
  'blue','red','yellow'
];
var INITIAL_VERBS = [
  'is',
  'in',
  'has',
  'can','ran to',
  'jump',

];
var App = React.createClass({

  wordClicked(word) {
    var utterance = new SpeechSynthesisUtterance();
    utterance.lang = speechSettings.lang;
    utterance.pitch = speechSettings.pitch;
    utterance.rate = speechSettings.rate;
    utterance.text = phoneticSpelling[word] || word;
    utterance.volume = 0.7; // 0 to 1
    speechSynthesis.speak(utterance);
    if (this.recording()) {
      this.setState({sentence: this.state.sentence.concat([word])});
    }
  },
  prevWord() {
    console.log('prev');
  },

  toArray(obj) {
    obj = obj || {};
    return Object.keys(obj).map((key) => obj[key]);
  },

  componentDidMount() {
    var hashKey = "BasselCanRead" // TODO: setup hashed url fragment for firebase

    this.firebaseRef = new Firebase(FIREBASE_URL);

    this.subjectsRef = this.firebaseRef.child(`${hashKey}/subjects`);
    this.subjectsRef.on('value', (snapshot) => {
      setTimeout(() => {
        var subjects = this.toArray(snapshot.val());
        console.log('got subjects from firebase: ', subjects);
        this.setState({subjects});
        this.setState({words: this.state.words.concat(subjects)});
        if (!subjects.length) {
          this.subjectsRef.set(INITIAL_SUBJECTS); // SEED Firebase initially
        }
      }, 0);
    });

    this.verbsRef = this.firebaseRef.child(`${hashKey}/verbs`);
    this.verbsRef.on('value', (snapshot) => {
      setTimeout(() => {
        var verbs = this.toArray(snapshot.val());
        this.setState({verbs});
        this.setState({words: this.state.words.concat(verbs)});

        if (!verbs.length) {
          this.verbsRef.set(INITIAL_VERBS); // SEED Firebase initially
        }
      }, 0);
    });


    this.objectsRef = this.firebaseRef.child(`${hashKey}/objects`);
    this.objectsRef.on('value', (snapshot) => {
      setTimeout(() => {
        var objects = this.toArray(snapshot.val());
        this.setState({objects});
        this.setState({words: this.state.words.concat(objects)});

        if (!objects.length) {
          this.objectsRef.set(INITIAL_OBJECTS); // SEED Firebase initially
        }
      }, 0);
    });

    this.sentenceRef = this.firebaseRef.child(`${hashKey}/sentences`);
    this.sentenceRef.on('value', (snapshot) => {

      setTimeout(() => {
        //debugger;
        var sentences = this.toArray(snapshot.val());
        this.setState({sentences});

        if (!sentences.length) {
          this.sentenceRef.set([]); // SEED Firebase initially
        }
      }, 0);
    });



  },

  getInitialState() {
    return ({
      sentence: null,
      sentences: [],
      subjects: [],
      verbs:[],
      objects: [],
      words: []
    });
  },

  _shuffleWords() {
    this.setState({subjects: shuffle(this.state.words)});
  },

  handleWordInputSubmit(word) {
    this.wordsRef.push(word);
  },

  saveRecording() {
    var words = this.state.sentence;
    if (words.length > 1) {
      this.sentenceRef.push(words.join(' '));
    }
    this.setState({sentence: null});
  },

  recording() {
    return (this.state.sentence !== null);
  },

  startRecording() {
    this.setState({sentence: []});
  },

  renderSentenceBuilder() {
    if (this.recording()) {
      return (
        <SentenceBuilder words={this.state.sentence} />
      );
    }
  },

  renderSentenceBuilderButton() {
    var stopStyles = {
      width: '100%',
      backgroundColor: 'rgb(202, 60, 60)',
      fontSize: '200%',
      color: '#fff'
    };

    var startStyles = {
      width: '100%',
      backgroundColor: 'rgb(28, 184, 65)',
      fontSize: '200%',
      color: '#fff'
    }

    if (this.recording()) {
      return (
        <button onClick={this.saveRecording}
          className='pure-button'
          style={stopStyles}>
        STOP
        </button>
      );
    } else {
      return (
        <button onClick={this.startRecording}
          className='pure-button'
          style={startStyles}>
        RECORD
        </button>
      );
    }
  },

  render() {

    return (
      <div className='container'>
        <SettingsPanel/>
        <Register />
        <WordForm submitHandler={this.handleWordInputSubmit}/>

        <SoundBoard wordClicked={this.wordClicked}  words={this.state.words} color='#0078e7' />
        <hr />

        <div className='row' >
          {this.renderSentenceBuilderButton()}
        </div>
        <div className='row' >
          {this.renderSentenceBuilder()}
        </div>
        < hr/>

      </div>
    );

    //<button onClick={this._shuffleWords}>Shuffle</button>
  }
});

module.exports = App;
