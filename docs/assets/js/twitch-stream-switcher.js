$(document).ready(function() {
var client_id = "q6750mt57tam2vu6s9gze2bm0jxlle";
var channels = ["waldo0240", "notch", "dream", "minecraft"];
var index = 0;

var options = {
  width: 854,
  height: 480,
  channel: "minecraft",
  parent: ["minecrafting.live"]
};

var checkChannel = function() {
  if (index >= channels.length) {
    var player = new Twitch.Player("twitch-player", options);
    player.setVolume(0.5);
    return;
  }

  options.channel = channels[index];

  $.getJSON("https://api.twitch.tv/kraken/streams/" + options.channel + "?client_id="+ client_id, function(data) {
    if (data.stream !== null) {
      var player = new Twitch.Player("twitch-player", options);
      player.setVolume(0.5);
    } else {
      index++;
      checkChannel();
    }
  });
};

checkChannel();
});
