import { Template } from 'meteor/templating';

import './login.html';

Template.login.onCreated(function () {
    // Initialization code
});

Template.login.helpers({
    signin: function() {
        return Template.instance().state.get('signin');
    },
    signup: function() {
        return Template.instance().state.get('signup');
    },
    error_message: function() {
        return Template.instance().error.get();
    },
    s4tg: function() { //vineet - this does not need to be fixed using qcondition - this shows
        //up on login screen
        return _.first(_.sortBy(Questions.find({}).fetch(), function(question) {
            return -question.upvote_count;
        }), 3);
    },
    getInstance: function() {
        return Template.instance();
    },
    getAlerts: function() {
        alert("fearfawfa");
    },
    getRandomIntInclusive: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
});

Template.login.events({
    'submit form': function(event, instance) {
        event.preventDefault();
        const username = event.target.username.value;
        const password = event.target.password.value;

        //getAlerts();

        if (instance.state.get('signin')) {
            handleLogin(username, password, instance);
        } else if (instance.state.get('signup')) {
            handleCreateUser(username, password, instance);
        }
    },
    'click #login-facebook': function(event, instance) {
        event.preventDefault();
        Meteor.loginWithFacebook({
            requestPermissions: ['public_profile, email']
        }, function(err) {
            if (err) {
                handleBasicError(err, instance);
            }
        });
    },
    'click #login-google': function(event, instance) {
        console.log("LOGIN WITH GOOGLE");
        event.preventDefault();

        // THIS IS NEEDED FOR GOOGLE DRIVE ACCESS, CHECK IN LATER
        // Meteor.loginWithGoogle({
        //     forceApprovalPrompt: true,
        //     requestOfflineToken: true,
        //     requestPermissions: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file']}, function(err){
        Meteor.loginWithGoogle({
            requestPermissions: ['profile', 'email']
        }, function(err) {
            if (err) {
                handleBasicError(err, instance);
            }
        });
    },
    'click #login-coursera': function(e) {
        e.preventDefault();

        Meteor.loginWithCoursera(function(err) {
            if (err) {
                handleBasicError(err, instance);
            }
        });
    },
    'click .toggle': function(event, instance) {
        console.log('TOGGLE');
        event.preventDefault();
        const state = {
            signin: instance.state.get('signin'),
            signup: instance.state.get('signup')
        };
        instance.state.set('signin', !state.signin);
        instance.state.set('signup', !state.signup);
    },
    'click .to-login': function(event) {
        handleClickToLogin(event)
    }
});

