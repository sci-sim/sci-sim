var AudioPlayerFactory = function() {
    this.soundEnabled = true;
    // Determine if we can play sound in this browser
    if (!createjs.Sound.initializeDefaultPlugins()) {
        console.log("This browser does not support audio.");
        this.soundEnabled = false;
        return;
    }
    // createjs.FlashAudioPlugin.swfPath = "../src/soundjs/flashaudio";
    // createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashAudioPlugin]);
    createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin]);
    this.audioPath = "audio/";
    this.soundMap = {
        "heart_healthy_5001.mp3" : "HealthyHeart",
        "heart_unhealthy_5104.mp3" : "UnhealthyHeart",
        "lungs_healthy_6106.mp3" : "HealthyLungs",
        "lungs_unhealthy_6103.mp3" : "UnhealthyLungs"
    };
    var sounds = [];
    for(var soundFile in this.soundMap) {
        sounds.push({id: this.soundMap[soundFile], src: soundFile});
    }
    createjs.Sound.registerSounds(sounds, this.audioPath);
};

AudioPlayerFactory.prototype.createAudioPlayer = function(mp3, options) {
    if (this.soundEnabled) {
        var id = this.soundMap[mp3];
        return new AudioPlayer(id, options);
    }
    // TODO: Handle case when sound cannot be played in browser (possibly fall back to original link?)
};

AudioPlayerFactory.prototype.addListeners = function() {
    $('.audio-player-play').click(function(e) {
        var id = $(e.currentTarget).attr('id');
        createjs.Sound.play(id);
    });
};

var AudioPlayer = function(soundID, options) {
    this.soundID = soundID;
    this.player = $("<button>Click to Listen</button>");
    this.player.attr('id', soundID);
    // In the future, we can add more buttons etc... for play/pause
    this.player.attr('class', 'audio-player-play');
};

AudioPlayer.prototype.play = function() {
    // Currently unable to use since we need to attach listeners after rendering
    createjs.Sound.play(this.mp3);
};

AudioPlayer.prototype.getPlayerAsHTML = function() {
    return $('<div>').append(this.player.clone()).html();
};
