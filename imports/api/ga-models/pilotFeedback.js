import {
    Meteor
} from 'meteor/meteor';
import {
    Experiments
} from './experiments';
import {
    ExperimentStatus,
    NotificationType,
    PilotStatus
} from './constants';
import {
    Pilots
} from "./pilot";

export const PilotFeedbacks = new Meteor.Collection("ga_pilotFeedbacks");
export const PilotFeedbackOptions = new Meteor.Collection("ga_pilotFeedback_options");

Meteor.methods({
    'galileo.pilotFeedback.notifyExpCreatorOfReview': function(expId, pilotId) {
        let url = "/galileo/pilotFeedback/" + expId + "/" + pilotId;
        let username = Meteor.call('users.getUsername');
        let message = "[" + username + "] provided feedback about Piloting your experiment.";
        Meteor.call("galileo.experiments.sendEmail", expId, NotificationType.PILOT_REVIEWED, message, url, function(err) {
            if (err) {
                console.error(err);
            }
        });
    },

    'galileo.pilotFeedback.getPilotIdsWithReview': function(expId) {
        let pilots = [];
        Pilots.find({
            exp_id: expId,
            status: PilotStatus.ENDED
        }, {
            fields: {
                _id: 1,
                group: 1,
                design_id: 1
            }
        }).forEach((completedPilot) => {
            if (PilotFeedbacks.find({
                    pilot_id: completedPilot._id
                }).count() > 0 ||
                PilotFeedbackOptions.find({
                    pilot_id: completedPilot._id
                }).count() > 0) {
                pilots.push(completedPilot);
            }
        });

        return pilots;
    },

    /**
     * Overall Feedback
     */
    'galileo.pilotFeedback.getOverallReviewComments': function(expId, pilotId) {
        return PilotFeedbacks.find({
            "exp_id": expId,
            "field": null,
            "pilot_id": pilotId
        }).fetch();
    },
    'galileo.pilotFeedback.addOverallReviewComments': function(expId, pilotId, content) {
        let feedback = generateFeedbackObject(expId, pilotId, Meteor.userId(), null, content);
        feedback.username = Meteor.call('users.getUsername');
        feedback._id = PilotFeedbacks.insert(feedback);
        return feedback;
    },
    'galileo.pilotFeedback.upVoted': function(feedbackId) {
        let feedbacks = PilotFeedbacks.find({
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
    'galileo.pilotFeedback.downVoted': function(feedbackId) {
        let feedbacks = PilotFeedbacks.find({
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
    'galileo.pilotFeedback.upVote': function(feedbackId) {
        if (!Meteor.call("galileo.pilotFeedback.upVoted", feedbackId)) {
            Meteor.call("galileo.pilotFeedback.cancelDownVote", feedbackId);
            PilotFeedbacks.update({
                _id: feedbackId
            }, {
                $push: {
                    "up_votes": Meteor.userId()
                }
            });
        }
    },
    'galileo.pilotFeedback.downVote': function(feedbackId) {
        if (!Meteor.call("galileo.pilotFeedback.downVoted", feedbackId)) {
            Meteor.call("galileo.pilotFeedback.cancelUpVote", feedbackId);
            PilotFeedbacks.update({
                _id: feedbackId
            }, {
                $push: {
                    "down_votes": Meteor.userId()
                }
            });
        }
    },
    'galileo.pilotFeedback.cancelUpVote': function(feedbackId) {
        if (Meteor.call("galileo.pilotFeedback.upVoted", feedbackId)) {
            PilotFeedbacks.update({
                _id: feedbackId
            }, {
                $pull: {
                    "up_votes": Meteor.userId()
                }
            });
        }
    },
    'galileo.pilotFeedback.cancelDownVote': function(feedbackId) {
        if (Meteor.call("galileo.pilotFeedback.downVoted", feedbackId)) {
            PilotFeedbacks.update({
                _id: feedbackId
            }, {
                $pull: {
                    "down_votes": Meteor.userId()
                }
            });
        }
    },

    /**
     * Detailed Feedback
     */
    'galileo.pilotFeedback.getDetailFeedback': function(expId, field, pilotId) {
        return PilotFeedbacks.find({
            "exp_id": expId,
            "field": field,
            "pilot_id": pilotId
        }).fetch();
    },
    'galileo.pilotFeedback.addDetailFeedback': function(expId, field, pilotId, content) {
        let feedback = generateFeedbackObject(expId, pilotId, Meteor.userId(), field, content);
        feedback.username = Meteor.call('users.getUsername');
        feedback._id = PilotFeedbacks.insert(feedback);
        return feedback;
    },
    'galileo.pilotFeedback.updateDetailFeedback': function(commentId, userId, content) {
        PilotFeedbacks.update({
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
    'galileo.pilotFeedback.options.get': function(expId, field, pilotId) {
        return PilotFeedbackOptions.find({
            "exp_id": expId,
            "field": field,
            "pilot_id": pilotId
        }).fetch();
    },
    'galileo.pilotFeedback.options.agree': function(expId, field, pilotId, option) {
        let item = getOptionObject(expId, field, pilotId, option);
        if (item) {
            if (item.agrees.indexOf(Meteor.userId()) === -1) {
                PilotFeedbackOptions.update({
                    _id: item._id
                }, {
                    $push: {
                        "agrees": Meteor.userId()
                    }
                });
            }
        } else {
            item = generateFeedbackOptionObject(expId, field, pilotId, option);
            item.agrees.push(Meteor.userId());
            PilotFeedbackOptions.insert(item);
        }
    },
    'galileo.pilotFeedback.options.cancelAgree': function(expId, field, pilotId, option) {
        let item = getOptionObject(expId, field, pilotId, option);
        if (item && item.agrees.indexOf(Meteor.userId()) >= 0) {
            PilotFeedbackOptions.update({
                _id: item._id
            }, {
                $pull: {
                    "agrees": Meteor.userId()
                }
            });
        }
    },
    'galileo.pilotFeedback.options.disagree': function(expId, field, pilotId, option) {
        let item = getOptionObject(expId, field, pilotId, option);
        if (item) {
            if (item.disagrees.indexOf(Meteor.userId()) === -1) {
                PilotFeedbackOptions.update({
                    _id: item._id
                }, {
                    $push: {
                        "disagrees": Meteor.userId()
                    }
                });
            }
        } else {
            item = generateFeedbackOptionObject(expId, field, pilotId, option);
            item.disagrees.push(Meteor.userId());
            PilotFeedbackOptions.insert(item);
        }
    },
    'galileo.pilotFeedback.options.cancelDisagree': function(expId, field, pilotId, option) {
        let item = getOptionObject(expId, field, pilotId, option);
        if (item && item.agrees.indexOf(Meteor.userId()) >= 0) {
            PilotFeedbackOptions.update({
                _id: item._id
            }, {
                $pull: {
                    "disagrees": Meteor.userId()
                }
            });
        }
    }
});


function generateFeedbackObject(expId, pilotId, userId, field, content) {
    return {
        "exp_id": expId,
        "pilot_id": pilotId,
        "user_id": userId,
        "date_time": new Date(),
        "content": content,
        "up_votes": [],
        "down_votes": [],
        "field": field,
        "resolved": false
    };
}

function generateFeedbackOptionObject(expId, field, pilotId, option) {
    return {
        "exp_id": expId,
        "field": field,
        "pilot_id": pilotId,
        "option": option,
        "agrees": [],
        "disagrees": []
    };
}

function getOptionObject(expId, field, pilotId, option) {
    return PilotFeedbackOptions.findOne({
        "exp_id": expId,
        "field": field,
        "pilot_id": pilotId,
        "option": option
    });
}