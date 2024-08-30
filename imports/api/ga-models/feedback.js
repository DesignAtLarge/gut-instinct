import {
    Meteor
} from 'meteor/meteor';
import {
    Experiments
} from './experiments';
import {
    ExperimentStatus,
    NotificationType
} from './constants';

export const Feedbacks = new Meteor.Collection("ga_feedbacks");
export const FeedbackOptions = new Meteor.Collection("ga_feedback_options");
export const FeedbackSuggestions = new Meteor.Collection("ga_feedback_suggestions");

Meteor.methods({
    /**
     * User related
     */
    'galileo.feedback.canFeedback': function(expId) {
        return canFeedback(Meteor.userId(), expId);
    },
    'galileo.feedback.isFeedbacking': function(expId, calledFrom) {
        console.log('is feedback meteor call, from = ' + calledFrom);
        return isFeedbacking(Meteor.userId(), expId);
    },

    'galileo.feedback.joinAsReviewer': function(expId) {
        if (isFeedbacking(Meteor.userId(), expId)) {
            throw new Meteor.Error("Sorry, you are already reviewing this experiment");
        } else if (canFeedback(Meteor.userId(), expId)) {
            // // update reviewers list in experiment table
            // Experiments.update({ "_id": expId }, {
            //     $addToSet: {
            //         "feedback_users": Meteor.userId()
            //     }
            // });

            // update which experiments are being reviewed in users table
            Meteor.users.update({
                "_id": Meteor.userId()
            }, {
                $push: {
                    "galileo.feedback_experiments": expId
                }
            });
        } else {
            console.log('can"t review');
            throw new Meteor.Error("Sorry, you can't review this experiment");
        }
    },
    'galileo.feedback.finishReviewing': function(expId) {
        // update reviewers list in experiment table
        Experiments.update({
            "_id": expId
        }, {
            $addToSet: {
                "feedback_users": Meteor.userId()
            }
        });
    },
    'galileo.feedback.notifyExpCreatorOfReview': function(expId) {
        // if review criteria is met, update experiment status
        // TODO: replace with getExperiment meteor call if we need access to cause, effect etc from design
        let exp = Experiments.findOne({
            "_id": expId
        });

        if (exp.status > ExperimentStatus.REVIEWED) {
            // if experiment was already reviewed, then status will only be updated to piloted
            // no need to process further
            return;
        }

        let status = ExperimentStatus.REVIEW_ONGOING;
        if (exp.feedback_users && exp.feedback_users.length >= 2) {
            status = ExperimentStatus.REVIEWED;
        }

        if (exp.status === status) {
            // if still no change in status then return
            return;
        }

        Experiments.update({
            "_id": expId
        }, {
            $set: {
                "status": status
            }
        });

        let url = "/galileo/me/experiment/" + expId + "/design"
        let username = Meteor.call("users.getUsername");
        let message = "[" + username + "] just reviewed your experiment";
        Meteor.call("galileo.experiments.sendEmail", expId, NotificationType.REVIEW_ON_MY_EXP, message, url, function(err) {
            if (err) {
                console.error(err);
            }
        });

        if (status === ExperimentStatus.REVIEWED) {
            let message = "Your experiment has been reviewed by 2 people";
            let url = "/galileo/me/dashboard";
            Meteor.call("galileo.experiments.sendEmail", exp._id, NotificationType.EXP_REVIEW_COMPLETE, message, url, function(err) {
                if (err) {
                    Materialize.toast(err, 3000, "toast rounded");
                }
            });
        }
    },

    /**
     * Overall Feedback
     */
    'galileo.feedback.getOverallReviewComments': function(expId) {
        return Feedbacks.find({
            "exp_id": expId,
            "field": null
        }).fetch();
    },
    'galileo.feedback.addOverallReviewComments': function(expId, content) {
        let feedback = generateFeedbackObject(expId, Meteor.userId(), null, content);
        feedback.username = Meteor.call("users.getUsername");
        feedback._id = Feedbacks.insert(feedback);
        return feedback;
    },
    'galileo.feedback.upVoted': function(feedbackId) {
        let feedbacks = Feedbacks.find({
            _id: feedbackId
        }, {
            fields: {
                up_votes: 1
            },
            limit: 1
        }).fetch();
        if (feedbacks && feedbacks.length > 0) {
            let feedback = feedbacks[0];
            return feedback && feedback["up_votes"].indexOf(Meteor.userId()) >= 0;
        } else {
            return false;
        }
    },
    'galileo.feedback.downVoted': function(feedbackId) {
        let feedbacks = Feedbacks.find({
            _id: feedbackId
        }, {
            fields: {
                down_votes: 1
            },
            limit: 1
        }).fetch();
        if (feedbacks && feedbacks.length > 0) {
            let feedback = feedbacks[0];
            return feedback && feedback["down_votes"].indexOf(Meteor.userId()) >= 0;
        } else {
            return false;
        }
    },
    'galileo.feedback.upVote': function(feedbackId) {
        if (!Meteor.call("galileo.feedback.upVoted", feedbackId)) {
            Meteor.call("galileo.feedback.cancelDownVote", feedbackId);
            Feedbacks.update({
                _id: feedbackId
            }, {
                $push: {
                    "up_votes": Meteor.userId()
                }
            });
        }
    },
    'galileo.feedback.downVote': function(feedbackId) {
        if (!Meteor.call("galileo.feedback.downVoted", feedbackId)) {
            Meteor.call("galileo.feedback.cancelUpVote", feedbackId);
            Feedbacks.update({
                _id: feedbackId
            }, {
                $push: {
                    "down_votes": Meteor.userId()
                }
            });
        }
    },
    'galileo.feedback.cancelUpVote': function(feedbackId) {
        if (Meteor.call("galileo.feedback.upVoted", feedbackId)) {
            Feedbacks.update({
                _id: feedbackId
            }, {
                $pull: {
                    "up_votes": Meteor.userId()
                }
            });
        }
    },
    'galileo.feedback.cancelDownVote': function(feedbackId) {
        if (Meteor.call("galileo.feedback.downVoted", feedbackId)) {
            Feedbacks.update({
                _id: feedbackId
            }, {
                $pull: {
                    "down_votes": Meteor.userId()
                }
            });
        }
    },
    'galileo.feedback.markUnresolved': function(feedbackId) {
        // TODO
    },
    'galileo.feedback.markResolved': function(feedbackId) {
        // TODO
    },

    /**
     * Detailed Feedback
     */
    'galileo.feedback.getDetailFeedback': function(expId, field) {
        // console.log("in getDetailFeedback with expId: " + expId)

        let regexQuery = field + ".*";
        let dbResult = Feedbacks.find({
            "exp_id": expId,
            "field": {
                $regex: regexQuery
            }
        }).fetch();

        console.log("in getDetailFeedback: " + dbResult)
        return dbResult;
    },
    'galileo.feedback.addDetailFeedback': function(expId, field, content) {
        let feedback = generateFeedbackObject(expId, Meteor.userId(), field, content);
        feedback.username = Meteor.call("users.getUsername");
        feedback._id = Feedbacks.insert(feedback);
        return feedback;
    },
    'galileo.feedback.updateDetailFeedback': function(commentId, userId, content) {
        Feedbacks.update({
            _id: commentId,
            user_id: userId
        }, {
            $set: {
                content: content
            }
        });
    },


    /**
     * Detailed Feedback Options
     */
    'galileo.feedback.options.get': function(expId, field) {
        return FeedbackOptions.find({
            "exp_id": expId,
            "field": field
        }).fetch();
    },
    'galileo.feedback.options.agree': function(expId, field, option) {
        let item = getOptionObject(expId, field, option);
        if (item) {
            if (item.agrees.indexOf(Meteor.userId()) === -1) {
                FeedbackOptions.update({
                    _id: item._id
                }, {
                    $push: {
                        "agrees": Meteor.userId()
                    }, // add user id to agrees list, remove user id from disagrees list
                    $pull: {
                        "disagrees": Meteor.userId()
                    }
                });
            }
        } else {
            item = generateFeedbackOptionObject(expId, field, option);
            item.agrees.push(Meteor.userId());
            FeedbackOptions.insert(item);
        }
    },
    'galileo.feedback.options.cancelAgree': function(expId, field, option) {
        let item = getOptionObject(expId, field, option);
        if (item && item.agrees.indexOf(Meteor.userId()) >= 0) {
            FeedbackOptions.update({
                _id: item._id
            }, {
                $pull: {
                    "agrees": Meteor.userId()
                }
            });
        }
    },
    'galileo.feedback.options.disagree': function(expId, field, option) {
        let item = getOptionObject(expId, field, option);
        if (item) {
            if (item.disagrees.indexOf(Meteor.userId()) === -1) {
                FeedbackOptions.update({
                    _id: item._id
                }, {
                    $push: {
                        "disagrees": Meteor.userId()
                    }, // add user id to disagrees list, remove user id from agrees list
                    $pull: {
                        "agrees": Meteor.userId()
                    }
                });
            }
        } else {
            item = generateFeedbackOptionObject(expId, field, option);
            item.disagrees.push(Meteor.userId());
            FeedbackOptions.insert(item);
        }
    },
    'galileo.feedback.options.cancelDisagree': function(expId, field, option) {
        let item = getOptionObject(expId, field, option);
        if (item && item.disagrees.indexOf(Meteor.userId()) >= 0) {
            FeedbackOptions.update({
                _id: item._id
            }, {
                $pull: {
                    "disagrees": Meteor.userId()
                }
            });
        }
    },

    /**
     * Suggestions related API
     */
    'galileo.feedback.suggestions.add': function(expId, field, cause, relation, effect) {
        FeedbackSuggestions.insert({
            "exp_id": expId,
            "user_id": Meteor.userId(),
            "username": Meteor.call("users.getUsername"),
            "field": field,
            "date_time": new Date(),
            "cause": cause,
            "relation": relation,
            "effect": effect,
            "used": false
        });
    },
    'galileo.feedback.suggestions.get': function(expId, field) {
        return FeedbackSuggestions.find({
            "exp_id": expId,
            "field": field
        }).fetch();
    }
});

function canFeedback(userId, expId) {
    if (Meteor.call('galileo.experiments.getExperiment', expId) === undefined) {
        throw new Meteor.Error("Could not find this experiment");
        return false;
    }

    if (Meteor.call("galileo.run.isParticipant", expId)) {
        console.log("failing here1?");
        throw new Meteor.Error("You are already a participant in this experiment");
        return false;
    }

    //should it be this call or negation of this.. - vineet?
    //actually, i'm taking off this condition entirely because we want to receive feedback and not push the review stage to pilot automatically
    // TODO: figure out if pilot users are to be counted as reviewers after pilot ends
    return !Meteor.call("galileo.pilot.isPilot", expId);
    //return true;
}

// TODO
function isFeedbacking(userId, expId) {
    let toReturn = false;
    console.log('is feedback METHOD');
    //no need to do this check
    //if (Meteor.call("galileo.experiments.isCreator", expId)) {
    //  return true;
    //}
    // let exp = Experiments.find({_id:expId},{
    //     fields:{
    //         feedback_users:1
    //     }
    // }).fetch()[0];
    let currUser = Meteor.users.find({
        _id: userId
    }, {
        fields: {
            'galileo.feedback_experiments': 1
        }
    }).fetch()[0];
    let feedback_exps = currUser.galileo.feedback_experiments;
    if (feedback_exps !== undefined && feedback_exps.length !== 0) {
        feedback_exps.forEach(function(exp) {
            if (exp === expId) {
                toReturn = true;
            }
        });
    } else {
        // TODO: figure out if pilot users are to be counted as reviewers after pilot ends
        // return Meteor.call("galileo.pilot.hasPiloted", expId);
    }
    return toReturn;
}

function generateFeedbackObject(expId, userId, field, content) {
    return {
        "exp_id": expId,
        "user_id": userId,
        "date_time": new Date(),
        "content": content,
        "up_votes": [],
        "down_votes": [],
        "field": field,
        "resolved": false
    };
}

function generateFeedbackOptionObject(expId, field, option) {
    return {
        "exp_id": expId,
        "field": field,
        "option": option,
        "agrees": [],
        "disagrees": []
    };
}

function getOptionObject(expId, field, option) {
    return FeedbackOptions.findOne({
        "exp_id": expId,
        "field": field,
        "option": option
    });
}