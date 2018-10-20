import './_.jade';

import {
    Questions,
    UserMetrics,
    UserEmail
} from '../../../../imports/api/models.js';

Template.welcome_step1_orig.rendered = function() {

}

Template.welcome_step1_orig.onCreated(function() {
    this.error = new ReactiveVar('');
    this.state = new ReactiveDict();
    this.state.set('signin', true);
    this.state.set('signup', false);
});

Template.welcome_step1_orig.helpers({
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

Template.welcome_step1_orig.events({
    'submit form': function(event) {
        event.preventDefault();
        var currentUser = Meteor.user().username;

        console.log("storing agid");

        var emailID = UserEmail.insert({
            username: currentUser,
            agree: 1,
            email: "",
            agid: event.target.agid.value
        });

        // this.go('/welcome_step2');
        //window.location.href = '/welcome_step2';
        window.location.href = '/gutboard';
    }
});