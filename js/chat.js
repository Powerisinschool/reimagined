$(function() {
    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    $('#sendbtn').click(function(event) {
        event.preventDefault();
        sendMessage();
        socket.emit('stop typing');
        typing = false;
    })

    // Declaration of Variables
    var window = $(window)
    var $messages = $('#chatcon'); // Messages area
    var $inputMessage = $('#chat-id-1-input'); // Input message input box
     // Message
    var username = $('#username').val();
    var recipient = $('#uniqueid').val();
    var recipientNames = $('#recnames').val();
    var connected = true;
    var typing = false;
    var currentInput = $inputMessage.focus();

    var socket = io();
    socket.on('rec message', function(msg){
        //$('#chatcon').html(msg);
    });

    var $currentMessages = {};

    /*var data = {}
    data[recipient] = recipient;
    $.ajax({
        url: "/get_messages/" + recipient,
        method: "POST",
        dataType: "json",
        data: data,
        success: function(response) {
            console.log(response);
            $messages.html('');
            for (i = 0; i < response.length; i++) {
                console.log(response[i]);
                var repose = response[i];
                $currentMessages[repose.id] = true;
                if (repose.sender === username) {
                    addChatMessage({
                        username: username,
                        message: repose.message
                    });
                } else {
                    addRecMessage({
                        username: username,
                        message: repose.message,
                        id: repose.id
                    });
                }
            }
            if (document.querySelector('.end-of-chat')) {
                document.querySelector('.end-of-chat').scrollIntoView();
            }
            for (respo in response) {
                console.log(response[respo]);
            }
            console.log("I am a user");
        },
        error: function() {
            alertUserError('Please reload the page as there was a problem');
        }
    })*/

    const alertUserError = function(msg) {
        $('#modalBody').text(msg);
        $('#errorModal').modal('show');
    }

    socket.emit('get messages', { recipient: recipient, username: username });

    // When the messages get in handle and update info to the user
    socket.on('messages parse', (response) => {
        $messages.html('');
        for (i = 0; i < response.length; i++) {
            console.log(response[i]);
            var repose = response[i];
            $currentMessages[repose.id] = true;
            if (repose.sender === username) {
                addChatMessage({
                    username: username,
                    message: repose.message
                });
            } else {
                addRecMessage({
                    username: username,
                    message: repose.message,
                    id: repose.id
                });
            }
        }
        if (document.querySelector('.end-of-chat')) {
            document.querySelector('.end-of-chat').scrollIntoView();
        }
    })

    // Alert the user of the fundamental error
    socket.on('error', (err) => {
        alertUserError(err + '! Please reload the page to fix the problem');
    });

    // Get all new messages and update to the user
    const getNewMessages = function() {
        socket.emit('req new messages', { recipient: recipient, username: username })
    }

    // Sends a chat message
    const sendMessage = () => {
        var message = $inputMessage.val();
        console.log('Enter was pressed')
        console.log(message)
        // if there is a non-empty message and a socket connection
        if (message) {
            console.log('Mehn!');
            $inputMessage.text('');
            addChatMessage({
                username: username,
                message: message
            });
            if (document.querySelector('.end-of-chat')) {
                document.querySelector('.end-of-chat').scrollIntoView();
            }
            // tell server to execute 'new message' and send along one parameter
            //socket.emit('new message', message);
            socket.emit('chat message', { username: $('#username').val(), recipient: $('#uniqueid').val(), message: $('#chat-id-1-input').val() });
            $('#chat-id-1-input').val('');
        }
    }

    // Adds the visual sent message to the message list
    const addChatMessage = (data) => {
        // Don't fade the message in if there is an 'X was typing'
        /*var $typingMessages = getTypingMessages(data);
        options = options || {};
        if ($typingMessages.length !== 0) {
            options.fade = false;
            $typingMessages.remove();
        }*/
        var options = options || {};
        options.fade = false;

        var $messageBodyDiv = $('<div class="message-body">')
        .html(`
            <div class="message-row">
                <div class="d-flex align-items-center justify-content-end">
                    <!-- Message: dropdown -->
                    <div class="dropdown">
                        <a class="text-muted opacity-60 mr-3" href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-three-dots-vertical" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                            </svg>
                        </a>

                        <div class="dropdown-menu" style="">
                            <a class="dropdown-item d-flex align-items-center" href="#">
                                Edit <span class="ml-auto fe-edit-3"></span>
                            </a>
                            <a class="dropdown-item d-flex align-items-center" href="#">
                                Share <span class="ml-auto fe-share-2"></span>
                            </a>
                            <a class="dropdown-item d-flex align-items-center" href="#">
                                Delete <span class="ml-auto fe-trash-2"></span>
                            </a>
                        </div>
                    </div>
                    <!-- Message: dropdown -->
                    <!-- Message: content -->
                    <div class="message-content bg-primary text-white">
                        <div>${cleanInput(data.message)}</div>

                        <div class="mt-1">
                            <small class="opacity-65">Me</small>
                        </div>
                    </div>
                    <!-- Message: content -->
                </div>
            </div>
        `);
        var typingClass = data.typing ? 'typing' : '';
        var $messageDiv = $('<div class="message message-right">')
        .append($messageBodyDiv);
        addMessageElement($messageDiv, options);
    }

    // Adds the visual sent message to the message list
    const addRecMessage = (data) => {
        var noRepetition = $(`#${data.id}`).val();
        if (!noRepetition) {
            var options = options || {};
            options.fade = false;

            var $messageBodyDiv = $('<div class="message-body">')
            .html(`
                <div class="message-row">
                    <div class="d-flex align-items-center">
                        <!-- Message: content -->
                        <div class="message-content bg-light">
                            <h6 class="mb-2">${recipientNames}</h6>
                            <div>${cleanInput(data.message)}</div>

                            <div class="mt-1">
                                <small class="opacity-65">Secured</small>
                            </div>
                        </div>
                        <!-- Message: content -->
                        <input style="display: none;" value="${cleanInput(data.message)}" id="${data.id}">
                        <!-- Message: dropdown -->
                        <div class="dropdown">
                            <a class="text-muted opacity-60 ml-3" href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <svg width="1em" height="1em" viewBox="0 0 16 16" class="icon-md bi bi-three-dots-vertical" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                                </svg>
                            </a>

                            <div class="dropdown-menu" style="">
                                <a class="dropdown-item d-flex align-items-center" href="#">
                                    Edit <span class="ml-auto fe-edit-3"></span>
                                </a>
                                <a class="dropdown-item d-flex align-items-center" href="#">
                                    Share <span class="ml-auto fe-share-2"></span>
                                </a>
                                <a class="dropdown-item d-flex align-items-center" href="#">
                                    Delete <span class="ml-auto fe-trash-2"></span>
                                </a>
                            </div>
                        </div>
                        <!-- Message: dropdown -->
                    </div>
                </div>
            `);
            var typingClass = data.typing ? 'typing' : '';
            var $messageDiv = $('<div class="message">')
            .append($messageBodyDiv);
            addMessageElement($messageDiv, options);
        }
    }

    const addMessageElement = (el, options) => {
        var $el = $(el);
    
        // Setup default options
        if (!options) {
          options = {};
        }
        if (typeof options.fade === 'undefined') {
          options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
          options.prepend = false;
        }
    
        // Apply options
        if (options.fade) {
          $el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
          $messages.prepend($el);
        } else {
          $messages.append($el);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
        if (document.querySelector('.end-of-chat')) {
            document.querySelector('.end-of-chat').scrollIntoView();
        }
    }

    const cleanInput = (input) => {
        return $('<div/>').text(input).html();
    }

    // Updates the typing event
    const updateTyping = () => {
        if (connected) {
        if (!typing) {
            typing = true;
            socket.emit('typing');
        }
        lastTypingTime = (new Date()).getTime();

        setTimeout(() => {
            var typingTimer = (new Date()).getTime();
            var timeDiff = typingTimer - lastTypingTime;
            if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
            socket.emit('stop typing');
            typing = false;
            }
        }, TYPING_TIMER_LENGTH);
        }
    }

    $inputMessage.keypress(function(event) {
        // Auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
          currentInput.focus();
        }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            event.preventDefault();
            sendMessage();
            socket.emit('stop typing');
            typing = false;
        }
    });

    $inputMessage.on('input', () => {
        updateTyping();
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', (response) => {
        for (i = 0; i < response.length; i++) {
            console.log(response[i]);
            var repose = response[i];
            $currentMessages[repose.id] = true;
            if (repose.sender !== username) {
                var noRepetition = $(`#${repose.id}`).val();
                if (!noRepetition) addRecMessage({ username: username, message: repose.message, id: repose.id });
            }
        }
    });

    const userOnline = () => {
        $('#onlinetext').text('Online').addClass('user-select-none');
        $('#onlinedot').addClass('d-block');
        $('#onlinedot').addClass('d-inline-block');
        $('#recnames').addClass('mb-n1');
        $('#reconlinein').addClass('avatar-online');
    }

    const userOffline = (ha) => {
        var lastseen = moment(ha).fromNow()
        $('#onlinetext').text(`Last Seen ${lastseen.toString()}`).addClass('user-select-none');
        $('#onlinedot').addClass('d-none');
        $('#onlinedot').removeClass('d-inline-block');
        $('#recnames').removeClass('mb-n1');
        $('#reconlinein').removeClass('avatar-online');
    }

    socket.on('online indicator', (results) => {
        switch (results.online) {
            case 'Y':
                userOnline();
                break;
        
            default:
                userOffline(results.lastseen);
                break;
        }
    })

    setInterval(getNewMessages, 2000);
    setInterval(() => {
        socket.emit('get activity', { recipient: recipient })
    }, 2000);
});