var socket = io('http://localhost:8081');
var connectSocket = function() {
    var username = $("input.username").val();
    if (!username.trim().length) {
        alert("Enter valid username");
        return;
    }
    socket.emit('init', username);
    $(".usernameBox").hide();
    $(".mainContainer").show();
    $(".myUsername").text(username);
};
var sendMessage = function() {
    var toUsername = $("select.toUserSelectBox").val();
    var message = $("input.message").val();
    if (!toUsername || !toUsername.trim().length || !message.trim().length) {
        alert("Enter valid username & message");
        return false;
    }
    $("div.message").append("<p class='sent'>Me: <b>" + message + "</b> - " + toUsername + "</p>").scrollTop($("div.message")[0].scrollHeight);
    socket.emit('notification', {
        to: toUsername,
        message: message
    });
    $("input.message").val("").focus();
}
socket.on('notification', function(data) {
    $("div.message").append("<p class='received'>" + data.from + ": <b>" + data.message + "</b></p>").scrollTop($("div.message")[0].scrollHeight);
    console.error(data);
});
socket.on('userDisconnected', function(userObj) {
    $("div.message").append("<p> User Disconnected: <b>" + userObj.username + "</b></p>").scrollTop($("div.message")[0].scrollHeight);;
    $(".toUserSelectBox option[value='" + userObj.username + "']").remove();
});
socket.on('userJoined', function(data) {
    $("div.message").append("<p> New User Joined: <b>" + data.username + "</b></p>").scrollTop($("div.message")[0].scrollHeight);;
    $('.toUserSelectBox').append($('<option/>', {
        value: data.username,
        text: data.username
    }));
});
socket.on('connectedUsersList', function(alreadyConnectedUserList) {
    alreadyConnectedUserList.forEach(function(username) {
        $('.toUserSelectBox').append($('<option/>', {
            value: username,
            text: username
        }));
    });
});