import './_.jade';

import {
    UserEmail
} from '../../../../imports/api/models.js';

Template.welcome.rendered = function() {

}

Template.welcome.onCreated(function() {
    this.error = new ReactiveVar('');
    this.state = new ReactiveDict();
    this.state.set('signin', true);
    this.state.set('signup', false);
});

Template.welcome.helpers({
    isEmailAsked: function() {
        var currentUser = Meteor.user().username;

        var fetchResult = UserEmail.findOne({
            "username": currentUser
        });

        if (fetchResult == undefined) {
            return false;
        } else {
            return true;
        }
    },
});

Template.welcome.events({

});