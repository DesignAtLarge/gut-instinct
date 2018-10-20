import './_.jade';

Template.gaShareSocialModal.rendered = function() {
    setTimeout(function() {
        $('select').material_select();
    }, 0);
};

Template.gaShareSocialModal.onCreated(function() {
    let inst = this;
});


Template.gaShareSocialModal.helpers({
    geturl: function() {
        let url = $('#inviteReviewLink').val();
        console.log("got url with: " + url);
        return url;
    },
    getReviewerIframeUrl: function() {
        let url = getReviewInviteLink();
        return getIFrameInviteLink(url);
    }
});

Template.gaShareSocialModal.events({
    "click #copy-and-share-btn": function(event) {

        let content = getInnerText(document.getElementById("social-reminder-text-box"));
        copyHelper(content);
        alert("The content is copied to your clipboard. Please click on the facebook share icon and paste to Facebook for sharing.");
        $("#fb-sharing-area").show();

        // TODO: seems like facebook blocked this hacky way... need user to click on the button instead of trigger by code
        // $("#u_0_1").click();
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

function getReviewInviteLink() {
    let expid = $("#exp-id-placeholder").attr("exp-data-id");
    let getUrl = window.location;
    let baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
    return baseUrl + "/share/review/" + expid;
}

function getIFrameInviteLink(url) {
    let iframeUrl = url.replace(/\//g, '%2F');
    iframeUrl = iframeUrl.replace(/:/g, '%3A');
    return iframeUrl;
}

function copyHelper(content) {
    const el = document.createElement('textarea');
    el.value = content;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

function getInnerText(el) {
    var sel, range, innerText = "";
    if (typeof document.selection != "undefined" && typeof document.body.createTextRange != "undefined") {
        range = document.body.createTextRange();
        range.moveToElementText(el);
        innerText = range.text;
    } else if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
        sel = window.getSelection();
        sel.selectAllChildren(el);
        innerText = "" + sel;
        sel.removeAllRanges();
    }
    return innerText;
}