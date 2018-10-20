import {
    Meteor
} from 'meteor/meteor';

import {
    Questions,
    Bookmarks
} from './../models.js';


Meteor.methods({
    'questions.getQuestion' (currentHash) {
        return Questions.findOne({
            hash: currentHash
        });
    },
    'questions.getAllQuestions' () {
        return Questions.find({}).fetch();
    },
    'questions.getQuestionsByCondition' (ucondition, currentMendel) {
        var db_question;

        if (ucondition == 0) {
            /* expert condition*/
            db_question = _.sortBy(Questions.find({}).fetch(), function(object) {
                return object.created_at.getTime();
            }).reverse();
        } else if (ucondition == 1 || ucondition == 2 || ucondition == 5 || ucondition == 6) {
            /* conditions w/out prior questions */
            db_question = _.sortBy(Questions.find({

                $or: [{
                        $and: [{
                            mendel_id: currentMendel
                        }, {
                            qcondition: ucondition
                        }]
                    },
                    {
                        qcondition: ucondition
                    }
                ]
            }).fetch(), function(object) {
                return object.created_at.getTime();
            }).reverse();
        } else {
            db_question = _.sortBy(Questions.find({
                $or: [{
                        $and: [{
                            mendel_id: currentMendel
                        }, {
                            qcondition: ucondition
                        }]
                    },
                    {
                        qcondition: 0
                    }
                ]

                /* old logic for safekeeping :) */
                // $and: [{
                //     $or: [{
                //         mendel_id: currentMendel
                //     }, {
                //         mendel_id: "expertMendel"
                //     }]
                // },
                //     {
                //         $or: [{
                //             qcondition: ucondition
                //         }, {
                //             qcondition: 0
                //         }]
                //     }
                // ]
            }).fetch(), function(object) {
                return object.created_at.getTime();
            }).reverse();
        }
        return db_question;
    },
    'questions.getStarQuestionsByCondition' (ucondition, currentMendel) {
        if (ucondition == 0) {
            return _.sortBy(Questions.find({
                star_question: 1
            }).fetch(), function(object) {
                return object.created_at.getTime();
            }).reverse();
        } else if (ucondition == 1 || ucondition == 2 || ucondition == 5 || ucondition == 6) {
            return _.sortBy(Questions.find({
                $and: [{
                        star_question: 1
                    },
                    {
                        qcondition: ucondition
                    }
                ]
            }).fetch(), function(object) {
                return object.created_at.getTime();
            }).reverse();
        } else {
            return _.sortBy(Questions.find({
                $and: [{
                        star_question: 1
                    },
                    {
                        $or: [{
                                qcondition: ucondition
                            },
                            {
                                qcondition: 0
                            }
                        ]
                    }
                ]
            }).fetch(), function(object) {
                return object.created_at.getTime();
            }).reverse();
        }
    },
    'questions.getBookmarkedQuestions' () {
        var rawbk = Bookmarks.find({
            owner: {
                username: Meteor.user().username,
                _id: Meteor.user()._id,
            }
        }).fetch();

        var renderQuestion = [];
        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        for (var i = 0; i < rawbk.length; i++) {
            renderQuestion[i] = Questions.findOne({
                hash: rawbk[i]["typeid"]
            });
        }

        var returnRes = _.sortBy(renderQuestion, function(object) {
            return object.created_at.getTime();
        }).reverse();

        return returnRes;
    },
    'questions.getMyWrittenQuestions' (currentMendel) {
        return Questions.find(

            {
                $and: [{
                        owner: {
                            username: Meteor.user().username,
                            _id: Meteor.userId()
                        }
                    },
                    {
                        mendel_id: currentMendel
                    }
                ]


            }
        ).fetch();
    },
    'questions.insertQuestion' (username, userId, currentMendelCode, dbLayer1, dbLayer2, created_at, ucondition) {
        var qID = Questions.insert({
            hash: '',
            owner: {
                username: username,
                _id: userId
            },
            mendel_id: currentMendelCode,
            layer_1: dbLayer1,
            layer_2: dbLayer2,
            tags: [],
            comments: [],
            created_at: created_at,
            editable: false,
            layer_2_user_response: [],
            qcondition: ucondition
        });
        return qID;
    },
    'questions.setHash' (qID) {
        Questions.update(qID, {
            $set: {
                hash: CryptoJS.MD5(qID).toString()
            }
        });
    },
    'questions.setTags' (qID, tags) {
        Questions.update(qID, {
            $set: {
                tags: tags
            }
        });
    },
    'questions.pushTag' (qID, tagname) {
        Questions.update(qID, {
            $push: {
                tags: {
                    hash: CryptoJS.MD5(tagID).toString(),
                    name: tagname
                }
            }
        });
    },
    'questions.pushComment' (qID, cID, comment, created_at, s3URL, userURL) {
        Questions.update(qID, {
            $push: {
                comments: {
                    hashcode: CryptoJS.MD5(cID).toString(),
                    text: comment,
                    created_at: created_at,
                    owner: {
                        _id: Meteor.user()._id,
                        username: Meteor.user().username
                    },
                    attached_file: s3URL,
                    attached_url: userURL,
                }
            }
        });
    },
    'questions.setMechanism' (qID, cID, comment, created_at, s3URL, userURL) {
        Questions.update(qID, {
            $set: {
                "layer_1.mechanism": {
                    hashcode: CryptoJS.MD5(cID).toString(),
                    text: comment,
                    created_at: created_at,
                    owner: {
                        _id: Meteor.user()._id,
                        username: Meteor.user().username
                    },
                    feedback: {}
                }
            }
        });
    },
    'questions.updateMechanism' (qID, newMech) {
        Questions.update(qID, {
            $set: {
                "layer_1.mechanism": newMech
            }
        });
    },
    'questions.setFeedback' (qID, feedback, reviewer, created_at) {
        Questions.update(qID, {
            $set: {
                "layer_1.mechanism.feedback": {
                    text: feedback,
                    latestReviewer: {
                        reviewer: reviewer
                    },
                    created_at: created_at
                }
            }
        });

        Questions.update(qID, {
            $push: {
                "layer_1.mechanism.feedback.reviewers": {
                    reviewer: reviewer
                }
            }
        });
    },
});