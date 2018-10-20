import './_.jade';

import {
    LearnQuestions,
    LearnDiscussions
} from '../../../../imports/api/models.js';

Template.learn_problem.rendered = function() {
    try {
        const toured = Meteor.user().profile.toured.learn_discussions || false;
        if (!toured) {
            introJs().setOption('showProgress', true).onchange(function(target) {
                Meteor.users.update(Meteor.userId(), {
                    $set: {
                        'profile.toured.learn_discussions': true
                    }
                });
                // sessionStorage.setItem('novice', false);
            }).start();
        }
    } catch (e) {}
}

Template.learn_problem.onCreated(function() {
    this.hashcode = '';
})

Template.learn_problem.helpers({
    init: function(hashcode) {
        Template.instance().hashcode = hashcode;
        try {
            const answered = Meteor.user().profile.learn_questions_answered;
            const self = LearnQuestions.find({
                hashcode: hashcode
            }).fetch()[0];
            const number_of_choices = self.choices.length;

            if (!answered[hashcode] || !(answered[hashcode].is_correct || answered[hashcode].attempted >=
                    number_of_choices)) {
                // window.location.replace("/problems");
            }
        } catch (e) {}
    },
    question: function() {
        const hashcode = Template.instance().hashcode;
        const learn_question = LearnQuestions.find({
            hashcode: hashcode
        }).fetch()[0];
        return learn_question ? learn_question : {};
    },
    discussions: function() {
        const hashcode = Template.instance().hashcode;
        const learn_discussions = LearnDiscussions.find({
            learn_question: hashcode
        }).fetch();
        return learn_discussions ? learn_discussions.reverse() : [];
    },
    answered: function() {
        try {
            const hashcode = Template.instance().hashcode;
            const learn_questions_answered = Meteor.user().profile.learn_questions_answered[hashcode];
            if (learn_questions_answered) {
                learn_questions_answered.hashcode = hashcode;
            }
            return learn_questions_answered ? [learn_questions_answered] : [];
        } catch (e) {
            return [];
        }
    },
    chose: function(index) {
        try {
            const hashcode = Template.instance().hashcode;
            const learn_questions_answered = Meteor.user().profile.learn_questions_answered[hashcode];
            if (_.isUndefined(learn_questions_answered)) {
                return false;
            }
            return learn_questions_answered.chose == index;
        } catch (e) {
            return false;
        }
    },
    isUserExpert: function() {
        return (Meteor.user().username === 'expert') || (Meteor.user().username === 'knightlab');
    }
});

Template.learn_problem.events({
    'submit form': function(event, instance) {
        event.preventDefault();
        const created_at = new Date();
        // const user_metric = UserMetrics.find({ user_id: Meteor.userId() }).fetch()[0];
        var discussed = Meteor.user().profile.learn_questions_discussed || {};
        var cID = LearnDiscussions.insert({
            learn_question: instance.hashcode,
            text: event.target.comment.value,
            owner: {
                _id: Meteor.user()._id,
                username: Meteor.user().username
            },
            created_at: created_at
        });
        LearnDiscussions.update(cID, {
            $set: {
                hashcode: CryptoJS.MD5(cID).toString()
            }
        });

        // try {
        //     Questions.update(instance._id, {
        //         $push: {
        //             comments: {
        //                 $each: [{
        //                     hashcode: CryptoJS.MD5(cID).toString(),
        //                     text: event.target.comment.value,
        //                     created_at: created_at,
        //                 }],
        //                 $sort: { created_at: -1 }
        //             }
        //         },
        //     });
        // } catch (e) {}

        discussed[instance.hashcode] = true;

        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.learn_questions_discussed': discussed
            }
        });

        // UserMetrics.update({ _id: user_metric._id }, {
        //     $set: {
        //         number_of_comments: user_metric.number_of_comments + 1
        //     }
        // });

        event.target.comment.value = '';
    }
});