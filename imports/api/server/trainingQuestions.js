import {
    Meteor
} from 'meteor/meteor';

import {
    TrainingQuestions,
    UserGuideResponse
} from './../models.js';


Meteor.methods({
    'trainingQuestions.fetchTrainingQuestions' () {
        var fetchResult = TrainingQuestions.find({}).fetch();
        var targetUser = Meteor.user().username;
        return fetchResult;
    },
    'trainingQuestions.insertTrainingQuestionResponses' (checkResponse, currentDBReasonResponse, questionIndex) {
        if (typeof UserGuideResponse.findOne({
                username: Meteor.user().username
            }) === 'undefined') {
            let newCheck = [
                [],
                []
            ];
            let newReason = ["", ""];
            newCheck[questionIndex] = checkResponse;
            newReason[questionIndex] = currentDBReasonResponse;
            UserGuideResponse.insert({
                username: Meteor.user().username,
                check_response: newCheck,
                reason_response: newReason
            });
        } else {
            let newCheck = UserGuideResponse.findOne({
                username: Meteor.user().username
            }).check_response;
            let newReason = UserGuideResponse.findOne({
                username: Meteor.user().username
            }).reason_response;

            newCheck[questionIndex] = checkResponse;
            newReason[questionIndex] = currentDBReasonResponse;
            UserGuideResponse.update({
                username: Meteor.user().username
            }, {
                $set: {
                    check_response: newCheck,
                    reason_response: newReason
                }

            });
        }
    },
    'trainingQuestions.getUserResponse' (i) {
        var userResArr = TrainingQuestions.findOne({
            index: i
        }).user_response;

        return userResArr;
    },
    'trainingQuestions.getCorrectChoice' (i) {
        var correct_choice = TrainingQuestions.findOne({
            index: i
        }).correct_answer_index;

        return correct_choice;
    },
    'trainingQuestions.getCorrectReason' (i) {
        var correct_solution = TrainingQuestions.findOne({
            index: i
        }).correct_reason;

        return correct_solution;
    },

});