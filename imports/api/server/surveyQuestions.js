import {
    Meteor
} from 'meteor/meteor';

import {
    SurveyQuestions,
    //TestQuestionsFR,
    UserSurveyResponse
} from '../../../imports/api/models.js';

Meteor.methods({
    'survey.getQuestions' () {
        return _.sortBy(SurveyQuestions.find({}).fetch(), function(object) {
            return object.index;
        });
    },
    'survey.setResponses' (userRes) {
        var checkExist = (typeof UserSurveyResponse.findOne({
            "username": Meteor.user().username
        }) !== 'undefined');


        if (checkExist) {
            var res = UserSurveyResponse.findOne({
                "username": Meteor.user().username
            });

            // var response = res.pretest_response;

            // for (var j = 0; j < userRes.length; j++) {
            //     var exists = false;
            //     for (var i = 0; i < response.length; i++) {
            //         if (response[i].question_index == userRes[j].question_index) {
            //             exists = true;
            //             response[i] = userRes[j];
            //         }
            //     }
            //     if (!exists)
            //         response.splice(userRes[j].question_index, 0, userRes[j]);
            // }

            var targetID = res._id;

            UserSurveyResponse.update({
                _id: targetID
            }, {
                $set: {
                    "survey_response": userRes
                }
            });

        } else {
            UserSurveyResponse.insert({
                "username": Meteor.user().username,
                "userid": Meteor.userId(),
                "condition": Meteor.user().profile.condition,
                "survey_response": userRes,
            });
        }
    },
    'survey.getResponse' () {
        var checkExist = (typeof UserSurveyResponse.findOne({
            "username": Meteor.user().username
        }) !== 'undefined');

        if (checkExist) {
            var res = UserSurveyResponse.findOne({
                "username": Meteor.user().username
            });
            return res["survey_response"];
        } else {
            return null;
        }
    }
});