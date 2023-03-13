
var users = ["waldo0240", "notch", "dream"]; // Replace this array with the Twitch usernames you want to retrieve data for
var client_id = "q6750mt57tam2vu6s9gze2bm0jxlle";

for (var i = 0; i < users.length; i++) {
  var username = users[i];
  var url = "https://api.twitch.tv/helix/users?login=" + username;

  $jQuery.ajax({
    url: url,
    headers: {
      "Client-ID": client_id
    },
    success: function(data) {
      var user = data.data[0];

      var html = "<h2>" + user.display_name + "</h2>";
      html += "<p>Status: " + (user.offline ? "Offline" : "Online") + "</p>";
      html += "<img src='" + user.profile_image_url + "' alt='" + user.display_name + "' />";

      $("#" + user.login).html(html);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("Error: " + textStatus + " " + errorThrown);
    }
  });
}
