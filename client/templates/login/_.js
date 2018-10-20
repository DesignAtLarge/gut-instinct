import './_.jade';

import {
    Questions,
    UserMetrics
} from '../../../imports/api/models.js';

Template.login.rendered = function() {
    $('#login-slider').slick();

    $('.sign_in').hide();

};

Template.login.onCreated(function() {
    this.error = new ReactiveVar('');
    this.state = new ReactiveDict();
    this.state.set('signin', true);
    this.state.set('signup', false);
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


function handleClickToLogin(event) {
    //highlights user clicked questions
    $('#attention-getter-words').text('Want to know the answer? Login to view!');
    $('#attention-getter-words').css({
        'font-size': '16pt'
    });
    $('#click-login-btn').hide();
    $(event.target).parent().siblings().hide();
    $(event.target).css({
        'font-size': '18pt'
    });
    $('.description').css({
        'width': '65%'
    });
    $('.description').find('h1').css({
        'text-align': 'left'
    });

    $('.sign_in').show();
}

function handleBasicError(err, instance) {
    instance.error.set(err.reason);
    console.error(instance.error.get());
}


function handleLogin(username, password, instance) {
    Meteor.loginWithPassword(username, password, function(err) {
        if (err) {
            handleBasicError(err, instance);
        } else {
            instance.error.set("");
            const user_metric = UserMetrics.find({
                user_id: Meteor.userId()
            }).fetch()[0];
            user_metric.login_counter++;
            UserMetrics.update({
                _id: user_metric._id
            }, {
                $set: {
                    login_counter: user_metric.login_counter
                }
            });
        }
    });
}

function handleCreateUser(username, password, instance) {
    Accounts.createUser({
        username: username,
        password: password
    }, function(err) {
        if (err) {
            handleBasicError(err, instance);
            return;
        } else {
            UserMetrics.insert({
                user_id: Meteor.userId(),
                username: Meteor.user().username,
                login_counter: 0,
                visit_counter: {
                    gutboard: 0,
                    tutorial: 0,
                    topics: 0,
                    problems: 0,
                    articles: 0
                },
                time_spent: [],
                number_of_questions: 0,
                number_of_comments: 0,
                number_of_science_articles: 0
            });
        }
        // sessionStorage.setItem("novice", true);
        instance.error.set("");
    });
}