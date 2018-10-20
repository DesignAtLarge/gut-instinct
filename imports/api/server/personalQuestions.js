import {
    Meteor
} from 'meteor/meteor';

import {
    PersonalQuestions
} from './../models.js';


Meteor.methods({
    'personalQuestions.fetchPersonalQuestionsByTag' (currentQueryTag) {
        var fetch = (PersonalQuestions.find({
            "tag": currentQueryTag
        }).fetch());
        return fetch;
    },
    'personalQuestions.pushAnswers' (targetID, targetUser, userRes) {
        PersonalQuestions.update({
            _id: targetID
        }, {
            $push: {
                answers: {
                    username: targetUser,
                    response: userRes
                }
            }
        });

    },
    'personalQuestions.setAnswers' (targetID, targetUser, userRes) {
        var index = 0;

        var responses = PersonalQuestions.findOne({
            _id: targetID
        }).answers;

        for (var i = 0; i < responses.length; i++) {
            if (targetUser === responses[i].username) {
                responses[i].response = userRes;
            }
        }

        PersonalQuestions.update({
            _id: targetID
        }, {
            $set: {
                answers: responses
            }
        });

    },
    'personalQuestions.pushChoices' (targetID, currentCluster, newIndex, newFeedback, newText, newAuthor) {
        PersonalQuestions.update({
            _id: targetID
        }, {
            $push: {
                choices: {
                    cluster: currentCluster,
                    index: newIndex,
                    feedback: newFeedback,
                    text: newText,
                    author: newAuthor
                }
            }
        });
    },
    'personalQuestions.addOption' (targetID, currentCluster, newIndex, newFeedback, newText, newAuthor) {
        PersonalQuestions.update({
            _id: targetID
        }, {
            $push: {
                choices: {
                    cluster: currentCluster,
                    author: newAuthor,
                    index: newIndex,
                    feedback: newFeedback,
                    text: newText

                }
            }
        });
    },
});