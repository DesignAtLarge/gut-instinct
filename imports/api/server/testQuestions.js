import {
    Meteor
} from 'meteor/meteor';

import {
    TestQuestions,
    //TestQuestionsFR,
    UserTestResponse
} from '../../../imports/api/models.js';

Meteor.methods({
    'test.getQuestions' (pre_or_post) {
        return TestQuestions.find({
            type: pre_or_post
        }).fetch();
    },
    'test.setResponses' (pre_or_post, userRes) {
        var checkExist = (typeof UserTestResponse.findOne({
            "username": Meteor.user().username
        }) !== 'undefined');

        if (pre_or_post == "pre") {
            if (checkExist) {
                var res = UserTestResponse.findOne({
                    "username": Meteor.user().username
                });

                var response = res.pretest_response;

                for (var j = 0; j < userRes.length; j++) {
                    var exists = false;
                    for (var i = 0; i < response.length; i++) {
                        if (response[i].question_index == userRes[j].question_index) {
                            exists = true;
                            response[i] = userRes[j];
                        }
                    }
                    if (!exists)
                        response.splice(userRes[j].question_index, 0, userRes[j]);
                }

                var targetID = res._id;

                UserTestResponse.update({
                    _id: targetID
                }, {
                    $set: {
                        "pretest_response": response
                    }
                });

            } else {
                UserTestResponse.insert({
                    "username": Meteor.user().username,
                    "condition": Meteor.user().profile.condition,
                    "pretest_response": userRes,
                    "posttest_response": []
                });
            }
        } else {
            if (checkExist) {
                var res = UserTestResponse.findOne({
                    "username": Meteor.user().username
                });

                var response = res.posttest_response;

                for (var j = 0; j < userRes.length; j++) {
                    var exists = false;
                    for (var i = 0; i < response.length; i++) {
                        if (response[i].question_index == userRes[j].question_index) {
                            exists = true;
                            response[i] = userRes[j];
                        }
                    }
                    if (!exists)
                        response.splice(userRes[j].question_index, 0, userRes[j]);
                }

                var targetID = res._id;

                UserTestResponse.update({
                    _id: targetID
                }, {
                    $set: {
                        "posttest_response": response
                    }
                });

            } else {
                UserTestResponse.insert({
                    "username": Meteor.user().username,
                    "condition": Meteor.user().profile.condition,
                    "pretest_response": [],
                    "posttest_response": userRes
                });
            }
        }
    },
    'test.getResponses' (pre_or_post) {
        if (pre_or_post == "pre") {
            let obj = UserTestResponse.findOne({
                "username": Meteor.user().username
            });

            if (obj) return obj.pretest_response;
            else return obj;
        } else {
            let obj = UserTestResponse.findOne({
                "username": Meteor.user().username
            });

            if (obj) return obj.posttest_response;
            else return obj;
        }
    },
});