import './_.jade';



Template.gaShareEmailInviteJoinModal.rendered = function() {
    setTimeout(function() {
        $('select').material_select();
    }, 0);
};

Template.gaShareEmailInviteJoinModal.onCreated(function() {
    let inst = this;


});


Template.gaShareEmailInviteJoinModal.helpers({
    getMessage: function() {
        let args = $('#email-text-box').html();
        return args;
    }
});

Template.gaShareEmailInviteJoinModal.events({
    "click #edit-content": function() {
        toggleEditButton('content');
        makeEditable();
    },

    "click #accept-edit-content": function(event, instance) {
        toggleEditButton('content');
        makeUneditable();
    },

    "click #cancel-edit-content": function(event, instance) {
        toggleEditButton('content');
        makeUneditable();
    },

    "click #copyEmailContent": function(event) {
        copyToClipboardEmail("#email-text-box");
        var userInput = $("#email-text-box").html();
        var subject = encodeURIComponent("Please join the experiment I created on Galileo");
        var content = encodeURIComponent(userInput);
        var dest = "mailto:?subject=" + subject + "&body=" + content;
        window.location.href = dest;
    }
});

function toggleEditButton(id) {
    $('#' + id + '-div').toggleClass('hide');
    $('#' + id + '-editable').toggleClass('hide');

    $('#accept-edit-' + id).toggleClass('hide');
    $('#cancel-edit-' + id).toggleClass('hide');
    $('#edit-' + id).toggleClass('hide');
}

function makeEditable() {
    let $contentTextbox = $('#email-text-box');
    $contentTextbox.attr('contenteditable', 'true');
    $contentTextbox.focus();
    $contentTextbox.addClass('reminder-editable');
}

function makeUneditable() {
    let $contentTextbox = $('#email-text-box');
    $contentTextbox.attr('contenteditable', 'false');
    $contentTextbox.removeClass('reminder-editable');
}

function copyToClipboardEmail(element) {
    let $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).html()).select();
    document.execCommand("copy");
    $temp.remove();
}