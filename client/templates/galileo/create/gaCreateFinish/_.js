import "./_.jade";
import {
    Session
} from 'meteor/session';

Template.gaCreateFinish.onCreated(function() {

    let isDemo = false;
    if (Session.get('isDemo')) {
        isDemo = true
    }
    this.isDemo = new ReactiveVar(isDemo);
});

Template.gaCreateFinish.onRendered(function() {
    setTimeout(function() {
        $('#exp_created_text').trigger('autoresize');
    }, 0);
});

Template.gaCreateFinish.helpers({
    expId: function() {
        return Template.instance().data.expId.get();
    },
    cause: function() {
        return Template.instance().data.cause.get();
    },
    effect: function() {
        return Template.instance().data.effect.get();
    },
    isDemo: function() {
        return Template.instance().isDemo.get();
    },
    inviteReviewerLink: function() {
        return getInviteReviewerLink();
    },
    getIframeUrl: function() {
        var url = getInviteReviewerLink();
        return getIFrameInviteLink(url);
    },
    getProtocol: function() {
        return location.protocol;
    },
    getHost: function() {
        return location.host;
    },
    getPath: function() {
        return location.pathname.split('/')[1];
    }
});

function getInviteReviewerLink() {
    let expId = Template.instance().data.expId.get();
    let getUrl = window.location;
    let baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
    var url = baseUrl + "/share/review/" + expId;
    return url;
}

function getIFrameInviteLink(url) {
    var iframeUrl = url.replace(/\//g, '%2F');
    iframeUrl = iframeUrl.replace(/:/g, '%3A');
    return iframeUrl;
}

Template.gaCreateFinish.events({
    'show .card-frame': function() {
        focusOn("#exp_created_text");
        // $('#exp_created_text').focus();
    },
    'click .next-action': function(event, instance) {

        if (Template.instance().isDemo.get() === false) {
            return;
        }

        // only process email in demo mode
        // if($('#emailExp').hasClass('valid') === false) {
        //     alert('Please enter a valid email');
        //     event.stopPropagation();
        // }
        // else {
        //     let designId = instance.data.designId.get();
        //     Meteor.call('galileo.experiments.design.setCreatorEmail',designId,$('#emailExp').val());
        // }
    }
});

function focusOn(element) {
    // calling with timeout 0 beause we need to wait until element is visible
    setTimeout(function() {
        $(element).focus();
    }, 0);
}