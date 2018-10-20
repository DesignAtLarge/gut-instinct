import './_.jade'
import FeedbackSourceHelper from "../FeedbackSourceHelper";

Template.gaExperimentFeedbackItem.rendered = function() {

};

Template.gaExperimentFeedbackItem.onCreated(function() {

    let data = Template.instance().data;

    this.upvoted = new ReactiveVar(data.feedback.up_votes && data.feedback.up_votes.indexOf(Meteor.userId()) >= 0);
    this.downvoted = new ReactiveVar(data.feedback.down_votes && data.feedback.down_votes.indexOf(Meteor.userId()) >= 0);
    this.upvoteAmount = new ReactiveVar(data.feedback.up_votes.length);
    this.downvoteAmount = new ReactiveVar(data.feedback.down_votes.length);
});

Template.gaExperimentFeedbackItem.helpers({
    upvoteAmount: function() {
        return Template.instance().upvoteAmount.get();
    },
    downvoteAmount: function() {
        return Template.instance().downvoteAmount.get();
    },
    upvoted: function() {
        return Template.instance().upvoted.get();
    },
    downvoted: function() {
        return Template.instance().downvoted.get();
    },
    upvoteClass: function() {
        if (Template.instance().upvoted.get()) {
            return "fa-thumbs-up";
        } else {
            return "fa-thumbs-o-up";
        }
    },
    downvoteClass: function() {
        if (Template.instance().downvoted.get()) {
            return "fa-thumbs-down";
        } else {
            return "fa-thumbs-o-down";
        }
    }
});

Template.gaExperimentFeedbackItem.events({
    "click .up-vote": function(event, inst) {
        let data = inst.data;
        if (inst.upvoted.get()) {

            inst.upvoted.set(false);

            let upvoteIndex = data.feedback.up_votes.indexOf(Meteor.userId());
            if (upvoteIndex >= 0) {
                data.feedback.up_votes.splice(upvoteIndex, 1);
                inst.upvoteAmount.set(inst.upvoteAmount.get() - 1);
            }

            FeedbackSourceHelper.cancelUpVote(data.feedback._id, inst.data.pilotId);
        } else {

            let downvoteIndex = data.feedback.down_votes.indexOf(Meteor.userId());
            if (downvoteIndex >= 0) {
                data.feedback.down_votes.splice(downvoteIndex, 1);
                inst.downvoteAmount.set(inst.downvoteAmount.get() - 1);
            }

            data.feedback.up_votes.push(Meteor.userId());
            inst.upvoteAmount.set(inst.upvoteAmount.get() + 1);

            inst.upvoted.set(true);
            inst.downvoted.set(false);

            FeedbackSourceHelper.upVote(data.feedback._id, inst.data.pilotId);
        }
    },
    "click .down-vote": function(event, inst) {
        let data = inst.data;
        if (inst.downvoted.get()) {

            inst.downvoted.set(false);

            let downvoteIndex = data.feedback.down_votes.indexOf(Meteor.userId());
            if (downvoteIndex >= 0) {
                data.feedback.down_votes.splice(downvoteIndex, 1);
                inst.downvoteAmount.set(inst.downvoteAmount.get() - 1);
            }
            FeedbackSourceHelper.cancelDownVote(data.feedback._id, inst.data.pilotId);
        } else {

            let upvoteIndex = data.feedback.up_votes.indexOf(Meteor.userId());
            if (upvoteIndex >= 0) {
                data.feedback.up_votes.splice(upvoteIndex, 1);
                inst.upvoteAmount.set(inst.upvoteAmount.get() - 1);
            }

            data.feedback.down_votes.push(Meteor.userId());
            inst.downvoteAmount.set(inst.downvoteAmount.get() + 1);

            inst.downvoted.set(true);
            inst.upvoted.set(false);

            FeedbackSourceHelper.downVote(data.feedback._id, inst.data.pilotId);
        }
    }
})