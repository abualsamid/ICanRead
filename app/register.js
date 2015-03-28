'use strict';

var React = require('react');

var Register = React.createClass({

  getInitialState() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    return ({ localMediaStream: null});
  },

  render() {
    return (
      <div>
        <video autoPlay id='videoStream' className="videostream"  style={{display: 'hidden'}}></video>
        <hr />
        <button id='btnRegister' className='btn btn-primary text-capitalized text-center' onClick={this.register}> Register My Photo</button>
        <br/>
        <img src="" id='registrationImage' />
        <canvas className='canvas' id='canvas' ></canvas>

      </div>
    );
  },


  componentDidMount() {
    document.querySelector('video').addEventListener('click', this.snapshot, false);
  },

  snapshot() {
    function sizeCanvas() {
      // video.onloadedmetadata not firing in Chrome so we have to hack.
      // See crbug.com/110938.
      setTimeout(function() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        img.height = video.videoHeight;
        img.width = video.videoWidth;
      }, 1);
    };
    console.log('snapshotting...');

    var video = document.querySelector('video');
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var img=document.getElementById('registrationImage');
    var btn = document.getElementById('btnRegister');
    if (this.state.localMediaStream) {
      console.log('getting into the snapshot');
      try {
        sizeCanvas();

        ctx.drawImage(video, 0, 0);
        // "image/webp" works in Chrome.
        // Other browsers will fall back to image/png.
        img.src = canvas.toDataURL('image/webp');
        img.style.display="block";

      } catch(x) {alert(x);}

      try {video.pause();} catch(x) {alert(x)};
      try {this.state.localMediaStream.stop();} catch(x) {alert(x)}; // does not do anything in chrome.
      try {video.style.display='none';} catch(x) {}
    }
  },

  register() {
    var video = document.querySelector('video');
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var img=document.getElementById('registrationImage');
    var btn = document.getElementById('btnRegister');

    video.display="block";
    btn.display="hidden";

    try {video.style.display='block';} catch(x) {}

    function errorCallback(e) {
      if (e.code == 1) {
        alert('User denied access to their camera');
      } else {
        alert('getUserMedia() not supported in your browser.');
      }
      //e.target.src = 'http://www.html5rocks.com/en/tutorials/video/basics/Chrome_ImF.ogv';
    };
    function successCallback(stream) {
      if (video.mozSrcObject !== undefined) {
          video.mozSrcObject = stream;
      } else {
          video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
      };
      this.setState({localMediaStream:stream});

      try { video.play()} catch(x) {console.log('error starting video' + x);}
    };

    img.src="";
    img.width=0;
    try {
      navigator.getUserMedia({video: true}, successCallback.bind(this), errorCallback.bind(this));

    } catch(x) {
      console.log(x);
      errorCallback({target: video});

    }


  }
});
module.exports  = Register;
