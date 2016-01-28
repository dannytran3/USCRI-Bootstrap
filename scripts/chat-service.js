// we want to dispose all the previous conversations added event listeners because
// in this demo site, we don't want to samples interfere with each other.
var registeredListeners = registeredListeners || [];
registeredListeners.forEach(function (listener) {
    listener.dispose();
});
registeredListeners = [];

/**
 * This script demonstrates how to send instant messages
 * with the SkypeWeb Conversation model.
 */
$(function () {
    'use strict';

    var client = window.skypeWebApp;
    var chatService;
    var xHistory = $('#messageHistory');
    var incomingMessageCount = 0;
    client.conversationsManager.conversations.get().then(function(conversationsArray){
        if(conversationsArray && conversationsArray.length > 0) {
            $('#status').text('Disconnected existed conversation.');
            conversationsArray.forEach(function (element, index, array) {
                console.log("Closing existed conversation...");
                element.chatService.stop();
            })
        }
    });
    
    var addedListener = client.conversationsManager.conversations.added(function (conversation) {
        var con = client.conversationsManager.conversations(0);
        if(con && con.chatService.state() == "Connected")
            return;

        chatService = conversation.chatService;
        chatService.accept.enabled.when(true, function () {
            // instead of using chatService.accept.enabled.changed, selfParticipant.chat.state.changed should also work.
            // conversation.selfParticipant.chat.state.changed(function (state) {
            var fAccept = confirm("Accept this IM invitation?");
            if (fAccept) {
                incomingMessageCount = 0;
                chatService.accept();
                $(".conversation-con").show();
                $(".creds").hide();
            } else {
                chatService.reject();
            }

            conversation.historyService.activityItems.added(function (message) {
                incomingMessageCount++;
                if (incomingMessageCount != 2) {
                     xHistory.append(XMessage(message));
                     xHistory.animate({ scrollTop:xHistory[0].scrollHeight }, "fast");
                }
            });
        });
    });

    registeredListeners.push(addedListener);

    var removedListener = client.conversationsManager.conversations.removed(function (conversation) {
        console.log('one conversation is removed');
    });
        
    registeredListeners.push(removedListener);
    
    $('#btn-start-messaging').click(function () {
        startInstantMessaging();
    });

    $('#chat-to').keypress(function(evt){
        if (evt.keyCode == 13)
            startInstantMessaging();
    });

    $("#btn-send-message").click(function(){
        sendMessage();
    });

    $('#input-message').on('keypress', function (evt) {
        if (evt.keyCode == 13)
            sendMessage();
    });

    function sendMessage(){
        var message = $("#input-message").val();
        if (message) {
            chatService.sendMessage(message).catch(function () {
                console.log('Cannot send the message');
            });
        }
        $("#input-message").val("");
    }

    function startInstantMessaging() {

        var pSearch = client.personsAndGroupsManager.createPersonSearchQuery();

        pSearch.limit(1);
        pSearch.text($('#chat-to').val());

        pSearch.getMore().then(function (sr) {
            if (sr.length < 1)
                throw new Error('Contact not found');
            return sr[0].result;
        }).then(function (contact) {
            $(".conversation-con").show();
            $(".creds").hide();

            var conversation = client.conversationsManager.getConversation(contact);
            chatService = conversation.chatService;

            conversation.selfParticipant.chat.state.when("Connected", function (state) {
                addNotification('Conversation state: ' + state);
                addNotification('Now you can send messages');

                conversation.historyService.activityItems.added(function (message) {
                    xHistory.append(XMessage(message));
                    xHistory.animate({ scrollTop:xHistory[0].scrollHeight }, "fast");
                });
            });

            chatService.start().then(function () {
               chatService.sendMessage('How are you?');
            });

        }).then(null, function (error) {
            console.error(error);
            addNotification('Search failed ' + error);
        });

        function addNotification(text) {
            //$('<div>').addClass('notification').text(text).appendTo(xHistory);
        }
    }

   // returns a DOM element attached to the Message model
    function XMessage(message) {
        var xTitle = $('<div>').addClass('sender');
        var xStatus = $('<div>').addClass('status');
        var xText = $('<div>').addClass('text').text(message.text());
        var xMessage = $('<div>').addClass('message');

        xMessage.append(xTitle, xStatus, xText);

        if (message.sender) {
            message.sender.displayName.get().then(function (displayName) {
                xTitle.text(displayName);
            });
        }

        message.status.changed(function (status) {
            //xStatus.text(status);
        });

        return xMessage;
    }

    $('#stop').click(function () {
        chatService.stop();
        $(".conversation-con").hide();
        $(".creds").show();
        $('#stopbtns').hide();
    });
});
