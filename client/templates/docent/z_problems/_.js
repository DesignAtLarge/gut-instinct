import './_.jade';

import {
    LearnQuestions,
    UserMetrics
} from '../../../../imports/api/models.js';

Template.problems.rendered = function() {
    try {
        const user_metric = UserMetrics.find({
            user_id: Meteor.userId()
        }).fetch()[0];
        const toured = Meteor.user().profile.toured.problems || false;

        user_metric.visit_counter.problems++;
        UserMetrics.update({
            _id: user_metric._id
        }, {
            $set: {
                visit_counter: user_metric.visit_counter
            }
        });

        if (!toured) {
            introJs().setOption('showProgress', true).onchange(function(target) {
                Meteor.users.update(Meteor.userId(), {
                    $set: {
                        'profile.toured.problems': true
                    }
                });
                // sessionStorage.setItem('novice', false);
            }).start();
        }
    } catch (e) {}
}

Template.problems.onCreated(function() {
    this.currentHashcode = "";
    this.user = Meteor.user();
    this.questions = null;
    this.totalScore = new ReactiveVar(0);
});

Template.problems.helpers({
    init: function() {
        var time = parseInt(new Date().getTime() / 86400000);
        time = time % 3;
        const viewed = Meteor.user().profile.learn_questions_viewed || {};
        if (!viewed[time]) {
            viewed[time] = true;
            Meteor.users.update(Meteor.userId(), {
                $set: {
                    'profile.learn_questions_viewed': viewed
                }
            });
        }
        // return LearnQuestions.find({}).fetch().reverse();
        // Template.instance().questions = LearnQuestions.find({}).fetch().reverse();
        // Template.instance().questions = LearnQuestions.find({}).fetch().slice(8 * time, (8 * time) + 8);
        // Template.instance().questions = _.shuffle(LearnQuestions.find({}).fetch());
    },
    questions: function() {
        // return LearnQuestions.find({});


        return LearnQuestions.find({}).fetch().reverse();
        // return result;
        // return Template.instance().questions;
    },
    answered_tag_question: function(hashcode) {
        try {
            const learn_questions_answered = Meteor.user().profile.learn_questions_answered[hashcode];
            if (learn_questions_answered) {
                learn_questions_answered.hashcode = hashcode;
            }
            return learn_questions_answered ? [learn_questions_answered] : [];
        } catch (e) {
            return [];
        }
    },
    chose: function(hashcode, index) {
        try {
            const learn_questions_answered = Meteor.user().profile.learn_questions_answered[hashcode];
            if (_.isUndefined(learn_questions_answered)) {
                return false;
            }
            return learn_questions_answered.chose == index;
        } catch (e) {
            return false;
        }
    },
    saveHashcode: function() {
        Template.instance().currentHashcode = this.hashcode;
    },
    getHashcode: function() {
        return Template.instance().currentHashcode;
    },
    isFirstElement: function() {
        var self = this;
        return _.isEqual(self, Template.instance().questions[0]);
    },
    attempts: function(hashcode) {
        var answered = Meteor.user().profile.learn_questions_answered;
        if (!answered[hashcode]) {
            return 0;
        }
        return answered[hashcode].attempted;
    },
    usedAllAttempts: function(hashcode) {
        try {

            var answered = Meteor.user().profile.learn_questions_answered;
            var self = LearnQuestions.find({
                hashcode: hashcode
            }).fetch()[0];
            const number_of_choices = self.choices.length;
            if (answered[hashcode] && (answered[hashcode].is_correct || answered[hashcode].attempted >= number_of_choices)) {
                return true
            } else {
                return false;
            }
        } catch (e) {
            return true;
        }
    },
    score: function() {
        try {
            var self = Meteor.user().profile.learn_questions_answered;
            var score = 0;
            for (var key in self) {
                if (!self.hasOwnProperty(key)) {
                    continue;
                }
                if (self[key].is_correct) {
                    score++;
                }
            }
            return {
                numeric: score,
                percentage: (score * 100 / Template.instance().totalScore.get()).toFixed(2)
            };
        } catch (e) {
            return {
                numeric: 0,
                percentage: 0
            };
        }

    },
    possible_total_score: function() {
        try {
            result = LearnQuestions.find({}).fetch().length;
            // var self = Meteor.user().profile.learn_questions_viewed || {};
            // var result = 0;
            // if (self[0]) {
            //     result += 8;
            // }
            // if (self[1]) {
            //     result += 8;
            // }
            // if (self[2]) {
            //     result += 8;
            // }
            Template.instance().totalScore.set(result);
            return result;
        } catch (e) {
            return 0;
        }
    }
});

Template.problems.events({
    'click .answer-learn-question': function(event, instance) {
        event.preventDefault();
        var self = this;
        const correct_answer = $('#' + self.hashcode + '-' + self.correct_answer);
        const learn_questions_answered = Meteor.user().profile.learn_questions_answered || {};
        instance.currentHashcode = self.hashcode;
        if (correct_answer.is(':checked')) {
            // $('#' + self.hashcode + '-feedback').text('');
            // $('#' + self.hashcode + '-feedback').css({ 'color': '#4CAF50' });
            if (learn_questions_answered[self.hashcode]) {
                learn_questions_answered[self.hashcode].is_correct = true;
                learn_questions_answered[self.hashcode].chose = self.correct_answer;
                learn_questions_answered[self.hashcode].attempted++;
            } else {
                learn_questions_answered[self.hashcode] = {
                    is_correct: true,
                    chose: self.correct_answer,
                    attempted: 1
                };
            }
        } else {
            var i = 0;
            for (i = 0; i < self.choices.length; i++) {
                if ($('#' + self.hashcode + '-' + i).is(':checked')) {
                    if (learn_questions_answered[self.hashcode]) {
                        learn_questions_answered[self.hashcode].is_correct = false;
                        learn_questions_answered[self.hashcode].chose = i;
                        learn_questions_answered[self.hashcode].attempted++;
                    } else {
                        learn_questions_answered[self.hashcode] = {
                            is_correct: false,
                            chose: i,
                            attempted: 1
                        };
                    }
                    break;
                }
            }
            // $('#' + self.hashcode + '-feedback').text('');
            // $('#' + self.hashcode + '-feedback').css({ 'color': '#F44336' });
        }

        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.learn_questions_answered': learn_questions_answered
            }
        });
    }
});