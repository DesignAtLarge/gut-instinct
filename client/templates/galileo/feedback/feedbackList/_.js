import './_.jade';
import FeedbackSourceHelper from "../FeedbackSourceHelper";

Template.gaExperimentFeedbackList.onCreated(function() {
    let self = this;
    this.feedbacks = new ReactiveArray();
    FeedbackSourceHelper.getOverallReviewComments(self.data.expId, self.data.pilotId, function(err, fbs) {
        if (err) {
            alert("Server Connection Error");
        } else {
            self.feedbacks.set(fbs);
        }
    });
});

Template.gaExperimentFeedbackList.helpers({
    hasComment: function() {
        return Template.instance().feedbacks.length() > 0;
    },
    comments: function() {
        return Template.instance().feedbacks.get();
    },
    commentAmount: function() {
        return Template.instance().feedbacks.length();
    }
});

Template.gaExperimentFeedbackList.events({
    "submit #submit-comment-form": function() {
        let inst = Template.instance();
        let $input = $("#comment-input");
        let comment = $input.val().trim();
        if (comment === "") {
            alert("You cannot submit a blank comment");
            return false;
        }

        FeedbackSourceHelper.addOverallReviewComments(inst.data.expId, inst.data.pilotId, comment, function(err, result) {
            if (err) {
                alert("Server Connection Error");
            } else {
                inst.feedbacks.push(result);
                $input.val("");

            }
        });
        return false;
    }
});