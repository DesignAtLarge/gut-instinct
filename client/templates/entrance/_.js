import './_.jade';

import {
    Questions,
    UserMetrics,
    UserEmail
} from '../../../imports/api/models.js';

Template.entrance.rendered = function() {

}

Template.entrance.onCreated(function() {});

Template.entrance.helpers({
    isIntroCompleted: function() {
        try {
            if (Meteor.user()) {
                const intro_completed = Meteor.user().profile.intro_completed;
                //console.log("intro_completed check in isintrocompleted is " + intro_completed);
                //alert("hanging in");
                return intro_completed;
            }
        } catch (e) {}
    },
    isGuideCompleted: function() {
        try {
            if (Meteor.user()) {
                const guide_completed = Meteor.user().profile.guide_completed;
                //console.log("intro_completed check in isintrocompleted is " + intro_completed);
                //alert("hanging in");
                return guide_completed;
            }
        } catch (e) {}
    },
    getNewQuestionCountsbyCondition: function(currentMendel) {
        try {
            if (Meteor.user()) {
                //var fetchArr = Questions.find({}).fetch();
                //get user condition first
                ucondition = 0;
                if (Meteor.user()) {
                    ucondition = Meteor.user().profile.condition;
                    //console.log("my condition is in (getnewquestions) " + ucondition);
                } else {
                    console.log("meteor user not ready - my condition is in (getnewquestions) " + ucondition);
                }
                var db_question;

                if (ucondition == 0) {
                    db_question = _.sortBy(Questions.find({}).fetch(), function(object) {
                        return object.created_at.getTime();
                    }).reverse();
                } else if (ucondition == 1 || ucondition == 2 || ucondition == 5 || ucondition == 6 || ucondition == 8 || ucondition == 9 || ucondition == 10 || ucondition == 11) {
                    db_question = _.sortBy(Questions.find({

                        $or: [{
                                $and: [{
                                    mendel_id: currentMendel
                                }, {
                                    qcondition: ucondition
                                }]
                            },
                            {
                                /* Remove expert questions */
                                qcondition: ucondition
                            }
                        ]
                    }).fetch(), function(object) {
                        return object.created_at.getTime();
                    }).reverse();
                } else {
                    db_question = _.sortBy(Questions.find({

                        $or: [{
                                //$or: [{
                                $and: [{
                                    mendel_id: currentMendel
                                }, {
                                    qcondition: ucondition
                                }]

                                //}, {
                                //    mendel_id: "expertMendel"
                                //},]
                            },
                            {
                                // $or: [{
                                //     qcondition: ucondition
                                // }, {
                                qcondition: 0
                                // }]
                            }
                        ]
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

                return db_question.length;
            }
        } catch (e) {}
    },
    getUsersCounts: function(currentMendel) {
        try {
            if (Meteor.user()) {
                //var fetchArr = Questions.find({}).fetch();
                //get user condition first
                ucondition = 0;
                if (Meteor.user()) {
                    ucondition = Meteor.user().profile.condition;
                    //console.log("my condition is in (getnewquestions) " + ucondition);
                } else {
                    console.log("meteor user not ready - my condition is in (getnewquestions) " + ucondition);
                }

                var db_user;
                if (ucondition == 0) {
                    db_user = Meteor.users.find({
                        "profile.toured.username_page": true
                    }).fetch();

                } else {
                    db_user = Meteor.users.find({
                        $and: [{
                            $or: [{
                                "profile.condition": ucondition
                            }, {
                                "profile.condition": 0
                            }]
                        }, {
                            "profile.toured.username_page": true
                        }]
                    }).fetch();
                }

                // if (ucondition == 0) {
                //     db_user = _.uniq(Questions.find({}, {
                //         sort: {owner: 1}, fields: {owner: true}
                //     }).fetch().map(function(x) {
                //         return x.owner._id;
                //     }), true);;
                //  } else if (ucondition == 1 || ucondition == 2) {
                //     db_user = _.uniq(Questions.find({
                //         $and: [{
                //             $or: [{
                //                 mendel_id: currentMendel
                //             }, {
                //                 mendel_id: "expertMendel"
                //             }]
                //         },
                //             {
                //                 qcondition: ucondition
                //             }
                //         ]
                //     }, {
                //         sort: {owner: 1}, fields: {owner: true}
                //     }).fetch().map(function(x) {
                //         return x.owner._id;
                //     }), true);
                // } else {
                //     db_user = _.uniq(Questions.find({
                //         $and: [{
                //             $or: [{
                //                 mendel_id: currentMendel
                //             }, {
                //                 mendel_id: "expertMendel"
                //             }]
                //         },
                //             {
                //                 $or: [{
                //                     qcondition: ucondition
                //                 }, {
                //                     qcondition: 0
                //                 }]
                //             }
                //         ]
                //     }, {
                //         sort: {owner: 1}, fields: {owner: true}
                //     }).fetch().map(function(x) {
                //         return x.owner._id;
                //     }), true);
                // }
                return db_user.length;
            }
        } catch (e) {}
    },
    tookPretest: function() {
        try {
            if (Meteor.user()) {
                let taken = Meteor.user().profile.took_pretest;
                if (!taken) return false;
                else return true;
            }
        } catch (e) {}

    }

});

Template.entrance.events({

});