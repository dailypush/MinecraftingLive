$(document).ready(function() {
    var channels = ["waldo0240", "notch", "dream", "minecraft"];
    var index = 0;
    var checkChannel = function() {
      if (index >= channels.length) {
        new Twitch.Embed("twitch-embed", {
          width: 854,
          height: 480,
          channel: "minecraft",
          allowfullscreen: true,
          layout: "video",
          autoplay: true,
          muted: false,
          parent: ["minecrafting.live"]
        });
        return;
      }
      var channel = channels[index];
      $.getJSON("https://api.twitch.tv/kraken/streams/" + channel + "?client_id=q6750mt57tam2vu6s9gze2bm0jxlle", function(data) {
        if (data.stream !== null) {
          new Twitch.Embed("twitch-embed", {
            width: 854,
            height: 480,
            channel: channel,
            allowfullscreen: true,
            layout: "video",
            autoplay: true,
            muted: false,
            parent: ["minecrafting.live"]
          });
        } else {
          index++;
          checkChannel();
        }
      });
    };
    checkChannel();
  });
  