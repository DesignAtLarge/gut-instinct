import {
    Meteor
} from "meteor/meteor";

module.exports = {
    /**
     * Overall Review comments
     */
    getOverallReviewComments: function(expId, pilotId, callback) {
        if (pilotId) {
            Meteor.call("galileo.pilotFeedback.getOverallReviewComments", expId, pilotId, callback);
        } else {
            Meteor.call("galileo.feedback.getOverallReviewComments", expId, callback);

        }
    },
    addOverallReviewComments: function(expId, pilotId, comment, callback) {
        if (pilotId) {
            Meteor.call("galileo.pilotFeedback.addOverallReviewComments", expId, pilotId, comment, callback);
        } else {
            Meteor.call("galileo.feedback.addOverallReviewComments", expId, comment, callback);
        }
    },
    upVote: function(feedbackId, pilotId, callback) {
        if (pilotId) {
            Meteor.call("galileo.pilotFeedback.upVote", feedbackId, callback);
        } else {
            Meteor.call("galileo.feedback.upVote", feedbackId, callback);
        }
    },
    downVote: function(feedbackId, pilotId, callback) {
        if (pilotId) {
            Meteor.call("galileo.pilotFeedback.downVote", feedbackId, callback);
        } else {
            Meteor.call("galileo.feedback.downVote", feedbackId, callback);
        }
    },
    cancelUpVote: function(feedbackId, pilotId, callback) {
        if (pilotId) {
            Meteor.call("galileo.pilotFeedback.cancelUpVote", feedbackId, callback);
        } else {
            Meteor.call("galileo.feedback.cancelUpVote", feedbackId, callback);
        }
    },
    cancelDownVote: function(feedbackId, pilotId, callback) {
        if (pilotId) {
            Meteor.call("galileo.pilotFeedback.cancelDownVote", feedbackId, callback);
        } else {
            Meteor.call("galileo.feedback.cancelDownVote", feedbackId, callback);
        }
    },


    /**
     * Detailed Review comments
     */
    getDetailedReviewComments: function(expId, field, pilotId, callback) {
        if (pilotId) {
            Meteor.call("galileo.pilotFeedback.getDetailFeedback", expId, field, pilotId, callback);
        } else {
            Meteor.call("galileo.feedback.getDetailFeedback", expId, field, callback);
        }
    },

    addDetailedReviewComments: function(expId, field, pilotId, content, callback) {
        if (pilotId) {
            Meteor.call("galileo.pilotFeedback.addDetailFeedback", expId, field, pilotId, content, callback);
        } else {
            Meteor.call("galileo.feedback.addDetailFeedback", expId, field, content, callback);
        }
    },

    updateDetailedReviewOptions: function(comment_id, user_id, feedback, pilotId, callback) {
        if (pilotId) {
            Meteor.call("galileo.pilotFeedback.updateDetailFeedback", comment_id, user_id, feedback, callback);
        } else {
            Meteor.call("galileo.feedback.updateDetailFeedback", comment_id, user_id, feedback, callback);
        }
    },


    /**
     * Detailed Feedback Options
     */
    getDetailedReviewOptions: function(expId, field, pilotId, callback) {
        if (pilotId) {
            Meteor.call("galileo.pilotFeedback.options.get", expId, field, pilotId, callback);
        } else {
            Meteor.call("galileo.feedback.options.get", expId, field, callback);
        }
    },


    agree: function(expId, field, pilotId, option, callback) {
        if (pilotId) {
            Meteor.call('galileo.pilotFeedback.options.agree', expId, field, pilotId, option, callback);
        } else {
            Meteor.call('galileo.feedback.options.agree', expId, field, option, callback);
        }
    },

    cancelAgree: function(expId, field, pilotId, option, callback) {
        if (pilotId) {
            Meteor.call('galileo.pilotFeedback.options.cancelAgree', expId, field, pilotId, option, callback);
        } else {
            Meteor.call('galileo.feedback.options.cancelAgree', expId, field, option, callback);
        }
    },

    disagree: function(expId, field, pilotId, option, callback) {
        if (pilotId) {
            Meteor.call('galileo.pilotFeedback.options.disagree', expId, field, pilotId, option, callback);
        } else {
            Meteor.call('galileo.feedback.options.disagree', expId, field, option, callback);
        }
    },

    cancelDisagree: function(expId, field, pilotId, option, callback) {
        if (pilotId) {
            Meteor.call('galileo.pilotFeedback.options.cancelDisagree', expId, field, pilotId, option, callback);
        } else {
            Meteor.call('galileo.feedback.options.cancelDisagree', expId, field, option, callback);
        }
    },

    /**
     * Notify experiment owner about Pilot Feedback
     */

    notifyExpCreatorOfReview: function(expId, pilotId, callback) {
        if (pilotId) {
            Meteor.call('galileo.pilotFeedback.notifyExpCreatorOfReview', expId, pilotId, callback);
        } else {
            Meteor.call('galileo.feedback.notifyExpCreatorOfReview', expId, callback);
        }
    },

    getSuggestions: function(expId, field, callback) {
        Meteor.call("galileo.feedback.suggestions.get", expId, field, callback);
    }


};