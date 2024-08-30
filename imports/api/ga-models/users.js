import {
    Meteor
} from 'meteor/meteor';
import {
    NotificationType
} from "./constants";

Meteor.methods({
    'galileo.users.isCreator': function(expId) {

    },
    'galileo.users.canFeedback': function(expId) {

    },
    'galileo.users.canPilot': function(expId) {

    },
    'galileo.users.canJoin': function(expId) {

    },
    'galileo.users.sendOnBoardingEmail': function() {
        console.log('~~~~~sendOnBoardingEmail beginning');
        let user = Meteor.user();

        if (!user) {
            return;
        }

        // let domain =  Meteor.absoluteUrl().slice(0,-1);
        let domain = this.connection.httpHeaders.host;
        console.log(domain);

        let args = {
            userName: user.username,
            expEntranceLink: 'https://' + domain + '/galileo/entrance',
            expBrowseLink: 'https://' + domain + '/galileo/browse',
            expDesignLink: 'https://' + domain + '/galileo/createdemo',
            loginLink: 'https://' + domain + '/galileo/signup',
        };

        console.log(args);

        Meteor.call("galileo.notification.new", user._id, null, null, NotificationType.ON_BOARDING, args); // send the email
    }
});