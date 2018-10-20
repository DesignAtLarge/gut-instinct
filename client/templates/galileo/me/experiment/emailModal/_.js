import './_.jade';



Template.gaShareEmailModal.rendered = function() {
    setTimeout(function() {
        $('select').material_select();
    }, 0);
};

Template.gaShareEmailModal.onCreated(function() {
    let inst = this;


});


Template.gaShareEmailModal.helpers({
    // geturl: function () {
    //     let url = $('#inviteReviewLink').val();
    //     console.log("got url with: " + url);
    //     return url;
    // },
    // username:function () {
    //     return Meteor.user().username;
    // },
    // url:function () {
    //     let baseurl = "http://localhost:3000";
    //     let user_exp = Template.instance().myOngoingExp.get();
    //     let expId = "";
    //     user_exp.forEach(function (element) {
    //         expId = element._id;
    //     });
    //     return baseurl + "/galileo/me/experiment/" + expId + "/my_participation";
    // },
    getMessage: function() {
        let args = $('#reminder-text-box').html();
        return args;
    }
});

Template.gaShareEmailModal.events({
    "click #edit-email": function() {
        toggleEditButton('email');
        makeEditable();
    },

    "click #accept-edit-email": function(event, instance) {
        toggleEditButton('email');
        makeUneditable();
    },

    "click #cancel-edit-email": function(event, instance) {
        toggleEditButton('email');
        makeUneditable();
    },

    "click #copyEmail": function(event) {
        copyToClipboardEmail("#reminder-text-box");
        var userInput = $("#reminder-text-box").html();
        var subject = encodeURIComponent("Please review the experiment I created on Galileo");
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
    let $reminderTextbox = $('#reminder-text-box');
    $reminderTextbox.attr('contenteditable', 'true');
    $reminderTextbox.focus();
    $reminderTextbox.addClass('reminder-editable');
}

function makeUneditable() {
    let $reminderTextbox = $('#reminder-text-box');
    $reminderTextbox.attr('contenteditable', 'false');
    $reminderTextbox.removeClass('reminder-editable');
}

function copyToClipboardEmail(element) {
    let $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).html()).select();
    document.execCommand("copy");
    $temp.remove();
}