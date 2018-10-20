import './_.jade';

import {
    Questions,
    UserMetrics
} from '../../../imports/api/models.js';

Template.landing.rendered = function() {

}

Template.landing.onCreated(function() {
    this.error = new ReactiveVar('');
    this.state = new ReactiveDict();
    this.state.set('signin', true);
    this.state.set('signup', false);
});

Template.landing.helpers({
    signin: function() {
        return Template.instance().state.get('signin');
    },
    signup: function() {
        return Template.instance().state.get('signup');
    },
    error_message: function() {
        return Template.instance().error.get();
    },
    s4tg: function() {
        return _.first(_.sortBy(Questions.find({}).fetch(), function(question) {
            return -question.upvote_count;
        }), 3);
    },
    getInstance: function() {
        return Template.instance();
    }
});

Template.landing.events({
    'submit form': function(event, instance) {
        event.preventDefault();
        const username = event.target.username.value;
        const password = event.target.password.value;
        if (instance.state.get('signin')) {
            Meteor.loginWithPassword(username, password, function(err) {
                if (err) {
                    instance.error.set(err.reason);
                    console.error(instance.error.get());
                } else {
                    instance.error.set("");
                    // const user_metric = UserMetrics.find({ user_id: Meteor.userId() }).fetch()[0];
                    // user_metric.login_counter++
                    // UserMetrics.update({ _id: user_metric._id }, {
                    //     $set: {
                    //         login_counter: user_metric.login_counter
                    //     }
                    // });
                }
            });
        } else if (instance.state.get('signup')) {
            Accounts.createUser({
                username: username,
                password: password,
                profile: {
                    condition: 0,
                    permission_group: PERMISSION.SUDO_ADMIN,
                    consent_agreed: false,
                    toured: {
                        articles: false,
                        bookmark: false,
                        consent: false,
                        guide_question_bin: false,
                        guide_question_info: false,
                        guide_question_module: false,
                        guide_question_result: false,
                        gutboard: false,
                        gutboard_slider: false,
                        landing: false,
                        learn_discussions: false,
                        personal_question: false,
                        personal_question_bin: false,
                        personal_question_module: false,
                        personal_tag_question: false,
                        problems: false,
                        qmodule: false,
                        tag: false,
                        topics: false,
                        tutorial: false,
                        welcome_step2: false
                    },
                    topics_investigated: {},
                    answered: {},
                    discussed: {},
                    voted: {},
                    learn_questions_viewed: {},
                    learn_questions_answered: {},
                    learn_questions_discussed: {}
                }
            }, function(err) {
                if (err) {
                    instance.error.set(err.reason);
                    console.error(instance.error.get());
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
    },
    'click .toggle': function(event, instance) {
        event.preventDefault();
        const state = {
            signin: instance.state.get('signin'),
            signup: instance.state.get('signup')
        };
        instance.state.set('signin', !state.signin);
        instance.state.set('signup', !state.signup);
    },
});