if (!gremlin)
    gremlin = { };

function constructUrl(server, url) {
    if (url.indexOf("://") >= 0) return url;
    if (server.indexOf("://") < 0) server = "http://" + server;
    if (server.substr(-1) == "/") {
        server = server.substr(0, server.length - 1);
    }
    if (url.charAt(0) === "/") url = url.substr(1);

    return server + "/" + url;
}

function call(server, url, method, data, username, password, successCallback, completeCallback) {

    //var client = gremlin.createClient();
    //
    //client.on('open', function() {
    //    console.log("Connection to Gremlin Server established!");
    //});
    //
    //var query = client.stream(data);
    //var results = [];
    //var i = 0;
    //
    //query.on('data', function(d) {
    //    results[i++] = JSON.stringify(d, null, 3);
    //});
    //
    //query.on('end', function(d) {
    //    var value = '[]';
    //    if (results.length > 1) {
    //        value = '['+results.join(',')+']'
    //    } else if (results.length === 1) {
    //        value = results[0];
    //    }
    //    completeCallback(value);
    //});
    //
    //query.on('error', function(e) {
    //    completeCallback(e.message);
    //});


    url = constructUrl(server, url);
    var uname_password_re = /^(https?:\/\/)?(?:(?:(.*):)?(.*?)@)?(.*)$/;
    var url_parts = url.match(uname_password_re);

    url = url_parts[1] + url_parts[4];
    url += 'tp/gremlin/execute?script='+encodeURIComponent(data);
    $.ajax({
        url: url,
        headers: {
            "Authorization": "Basic " + btoa(username + ":" + password)
        },
        password: password,
        username: username,
        crossDomain: true,
        type: method,
        dataType: "json",
        complete: completeCallback,
        success: successCallback
    });
}

function submitCurrentRequest() {
    var req = gremlin.utils.getCurrentRequest();
    if (!req) return;

    $("#notification").text("Calling...").css("visibility", "visible");
    gremlin.output.getSession().setValue('');

    var server = $("#server").val(),
        url = req.url,
        method = req.method,
        data = req.data;

    var username = $('#username').val();
    var password = $('#password').val();
    var time = new Date().getTime();

    //call(server, url, method, data, username, password, null, function (results) {
    //    $("#notification").text("").css("visibility", "hidden");
    //    $('#time').html((new Date().getTime() - time)+ 'ms');
    //    gremlin.output.getSession().setValue(results);
    //});


    call(server, url, method, data, username, password, null, function (xhr, status) {
            $("#notification").text("").css("visibility", "hidden");
            if (typeof xhr.status == "number" &&
                ((xhr.status >= 400 && xhr.status < 600) ||
                    (xhr.status >= 200 && xhr.status < 300)
                )) {
                $('#time').html((new Date().getTime() - time)+ 'ms');
                // we have someone on the other side. Add to history
                gremlin.history.addToHistory(server, url, method, data);


                var value = xhr.responseText;
                try {
                    value = JSON.stringify(JSON.parse(value), null, 3);
                }
                catch (e) {

                }
                gremlin.output.getSession().setValue(value);
            }
            else {
                gremlin.output.getSession().setValue("Request failed to get to the server (status code: " + xhr.status + "):" + xhr.responseText);
            }

        }
    );

    saveEditorState();
}



function copyToClipboard(value) {
    var currentActive = document.activeElement;
    var clipboardStaging = $("#clipboardStaging");
    clipboardStaging.val(value);
    clipboardStaging.select();
    document.execCommand("Copy", false);
    $(currentActive).focus(); // restore focus.
}

function copyAsCURL() {
    var req = gremlin.utils.getCurrentRequest();
    if (!req) return;

    var server = $("#server").val(),
        url = req.url,
        method = req.method,
        data = req.data;

    var url = constructUrl(server, url);

    url += 'tp/gremlin/execute?script='+encodeURIComponent(data);

    var curl = 'curl -X' + method + ' "' + url + '"';

    //console.log(curl);
    copyToClipboard(curl);
}


var CURRENT_REQ_RANGE = null;


function saveEditorState() {
    try {
        var content = gremlin.editor.getValue();
        var server = $("#server").val();
        var username = $("#username").val();
        var password = $("#password").val();
        gremlin.history.saveCurrentEditorState(server, username, password, content);
    }
    catch (e) {
        console.log("Ignoring saving error: " + e)
    }
}

function updateEditorActionsBar() {
    var editor_actions = $("#editor_actions");

    if (CURRENT_REQ_RANGE) {
        var row = CURRENT_REQ_RANGE.start.row;
        var column = CURRENT_REQ_RANGE.start.column;
        var session = gremlin.editor.session;
        var firstLine = session.getLine(row);
        var offset = 0;
        if (firstLine.length > session.getScreenWidth() - 5) {
            // overlap first row
            if (row > 0) row--; else row++;
        }
        var screen_pos = gremlin.editor.renderer.textToScreenCoordinates(row, column);
        offset += screen_pos.pageY - 3;
        var end_offset = gremlin.editor.renderer.textToScreenCoordinates(CURRENT_REQ_RANGE.end.row,
            CURRENT_REQ_RANGE.end.column).pageY;

        offset = Math.min(end_offset, Math.max(offset, 47));
        if (offset >= 47) {
            editor_actions.css("top", Math.max(offset, 47));
            editor_actions.css('visibility', 'visible');
        }
        else {
            editor_actions.css("top", 0);
            editor_actions.css('visibility', 'hidden');
        }
    }
    else {
        editor_actions.css("top", 0);
        editor_actions.css('visibility', 'hidden');
    }

}

function highlighCurrentRequestAndUpdateActionBar() {
    var session = gremlin.editor.getSession();
    var new_current_req_range = gremlin.utils.getCurrentRequestRange();

    if (new_current_req_range == null && CURRENT_REQ_RANGE == null) return;
    if (new_current_req_range != null && CURRENT_REQ_RANGE != null &&
        new_current_req_range.start.row == CURRENT_REQ_RANGE.start.row &&
        new_current_req_range.end.row == CURRENT_REQ_RANGE.end.row
    ) {
        // same request, now see if we are on the first line and update the action bar
        var cursorRow = gremlin.editor.getCursorPosition().row;
        if (cursorRow == CURRENT_REQ_RANGE.start.row) {
            updateEditorActionsBar();
        }
        return; // nothing to do..
    }

    if (CURRENT_REQ_RANGE) {
        session.removeMarker(CURRENT_REQ_RANGE.marker_id);
    }

    CURRENT_REQ_RANGE = new_current_req_range;
    if (CURRENT_REQ_RANGE) {
        CURRENT_REQ_RANGE.marker_id = session.addMarker(CURRENT_REQ_RANGE, "ace_snippet-marker", "text");
    }
    updateEditorActionsBar();
}

function init() {

    gremlin.editor = ace.edit("editor");
    ace.require("ace/mode/gremlin");
    gremlin.editor.getSession().setMode("ace/mode/gremlin");
    gremlin.editor.setShowPrintMargin(false);
    gremlin.editor.getSession().setFoldStyle('markbeginend');
    gremlin.editor.getSession().setUseWrapMode(true);

    gremlin.editor.commands.addCommand({
        name: 'send to elasticsearch',
        bindKey: {win: 'Ctrl-Enter', mac: 'Command-Enter'},
        exec: submitCurrentRequest
    });

    gremlin.editor.commands.addCommand({
        name: 'copy as cUrl',
        bindKey: {win: 'Ctrl-Shift-C', mac: 'Command-Shift-C'},
        exec: copyAsCURL
    });

    gremlin.editor.getSession().on('tokenizerUpdate', function (e) {
        highlighCurrentRequestAndUpdateActionBar();
    });

    gremlin.editor.getSession().selection.on('changeCursor', function (e) {
        highlighCurrentRequestAndUpdateActionBar();
    });

    var save_generation = 0;

    function get_save_callback(for_generation) {
        return function () {
            if (save_generation == for_generation) {
                saveEditorState();
            }
        }
    }

    gremlin.editor.getSession().on("change", function (e) {
        setTimeout(get_save_callback(++save_generation), 500);
    });

    gremlin.editor.getSession().on("changeScrollTop", updateEditorActionsBar);


    gremlin.output = ace.edit("output");
    gremlin.output.getSession().setMode("ace/mode/json");
    gremlin.output.getSession().setFoldStyle('markbeginend');
    gremlin.output.setTheme("ace/theme/monokai");
    gremlin.output.getSession().setUseWrapMode(true);
    gremlin.output.setShowPrintMargin(false);
    gremlin.output.setReadOnly(true);

    var editorElement = $("#editor"),
        outputElement = $("#output"),
        editorActions = $("#editor_actions");


    editorElement.resizable(
        {
            autoHide: false,
            handles: 'e',
            start: function (e, ui) {
                editor_resizebar = $(".ui-resizable-e").addClass("active");
            },
            stop: function (e, ui) {
                editor_resizebar = $(".ui-resizable-e").removeClass("active");

                var parent = ui.element.parent();
                var editorSize = ui.element.outerWidth();
                outputElement.css("left", editorSize);
                editorActions.css("margin-right", -editorSize + 3);
                gremlin.editor.resize(true);
                gremlin.output.resize(true);
            }
        });

    gremlin.history.init();

    $("#send").tooltip();
    $("#send").click(function (e) {
        submitCurrentRequest();
        e.preventDefault();
    });

    $("#copy_as_curl").click(function (e) {
        copyAsCURL();
        e.preventDefault();
    });

    $("#auto_indent").click(function (e) {
        autoIndent();
        e.preventDefault();
    });

    var last_editor_state = gremlin.history.getSavedEditorState();
    if (last_editor_state) {
        resetToValues(last_editor_state.server, last_editor_state.username, last_editor_state.password, last_editor_state.content);
    }

    gremlin.editor.focus();
    highlighCurrentRequestAndUpdateActionBar();
    updateEditorActionsBar();

}
function resetToValues(server, username, password, content) {
    if (server != null) {
        $("#server").val(server);
    }
    if (username != null) {
        $("#username").val(username);
    }
    if (password != null) {
        $("#password").val(password);
    }
    if (content != null) {
        gremlin.editor.getSession().setValue(content);
    }
    gremlin.output.getSession().setValue("");
}

$(document).ready(init);




