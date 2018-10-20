import './_.jade';

import {
    UserEmail
} from '../../../../imports/api/models.js';

Template.welcome_step2.rendered = function() {

    function validateEmail() {
        var email = $("#userEmail").value;
        console.log("checking email value --> " + email);
        var re =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    function dummyEmailAddress() {
        $("#userEmail").val("do-not-reply@example.com");
    }
}

Template.welcome_step2.onCreated(function() {

    function validateEmail() {
        var email = $("#userEmail").value;
        console.log("checking email value --> " + email);
        var re =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    function dummyEmailAddress() {
        //alert("hello");
        $("#userEmail").val("do-not-reply@example.com");
    }

    this.error = new ReactiveVar('');
    this.state = new ReactiveDict();
    this.state.set('signin', true);
    this.state.set('signup', false);
});

Template.welcome_step2.helpers({
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

Template.welcome_step2.events({
    'submit form': function(event) {
        event.preventDefault();
        var currentUser = Meteor.user().username;

        // console.log("storing agid");

        var fetchResult = UserEmail.findOne({
            "username": currentUser
        });

        if (fetchResult == undefined) {
            var emailID = UserEmail.insert({
                username: currentUser,
                agree: 1,
                email: $("#userEmail").val(),
                agid: $("#agid").val()
            });
        } else {
            UserEmail.update(fetchResult._id, {
                $set: {
                    email: $("#userEmail").val(),
                    agid: $("#agid").val()
                }
            });
        }

        // this.go('/welcome_step2');
        window.location.href = '/telluswhatyouknow';
    }
});