import {
    Meteor
} from 'meteor/meteor';

import {
    ViewedExamples
} from './../models.js';

Meteor.methods({
    'user.updateHasAddedQuestion' () {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.added_one_ques': true
            }
        });
    },
    'user.updateIntroCompleted' () {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.intro_completed': true
            }
        });
    },
    'user.updateGuideCompleted' () {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.guide_completed': true
            }
        });
    },
    'user.updateProfileTouredTopics' () {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.toured.topics': true
            }
        });
    },
    'user.updateProfileTouredPersonalTagQuestion' () {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.toured.personal_tag_question': true
            }
        });
    },
    'user.updateProfileTouredPersonalQuestionModule' () {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.toured.personal_question_module': true
            }
        });
    },
    'user.updateProfileTouredGuideQuestionInfo' () {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.toured.guide_question_info': true
            }
        });
    },
    'user.updateProfileDiscussed' (discussed) {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.discussed': discussed
            }
        });
    },
    'user.updateProfileTouredGutBoardSlider' () {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.toured.gutboard_slider': true
            }
        });
    },
    'user.updateProfileQuestions' (qID, created_at) {
        Meteor.users.update(Meteor.userId(), {
            $push: {
                'profile.questions': {
                    hash: CryptoJS.MD5(qID).toString(),
                    created_at: created_at
                }
            }
        });
    },
    'user.updateProfileQuestionsAnswered' (qID, choices, type, index) {
        let questions_answered = Meteor.user().profile.questions_answered || {};

        qID = qID._str;

        if (type == "layer_2")
            questions_answered[CryptoJS.MD5(qID).toString() + "-" + type + "-index" + index] = {
                choice_indices: choices,
                type: type,
                index: index
            };
        else
            questions_answered[CryptoJS.MD5(qID).toString() + "-" + type] = {
                choice_indices: choices,
                type: type
            };

        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.questions_answered': questions_answered
            }
        });

        // Meteor.users.update(Meteor.userId(), {
        //     $push: {
        //         'profile.questions_answered': {
        //             hash: CryptoJS.MD5(qID).toString(),
        //             choice_indices: choices,
        //             type: type
        //         }
        //     }
        // });
    },
    'user.fetchUser' () {
        return Meteor.user();
    },
    'user.updatePretestStatus' () {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.took_pretest': true
            }
        });
    },
    'user.updatePosttestStatus' () {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.took_posttest': true
            }
        });
    },
    'user.completedSurvey' () {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.completed_survey': true
            }
        });
    },
    'user.clickedFinishSurvey' () {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.clicked_finish_survey_button': true
            }
        });
    },
    'user.beganSurvey' () {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.began_survey': true
            }
        });
    },
    'user.viewedExamples' () {
        ViewedExamples.insert({
            "user_id": Meteor.user()._id,
            "conditon": Meteor.user().profile.condition,
            "created_at": new Date()
        });
    }
});