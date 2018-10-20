import './_.jade'
import {
    FeedbackSourceHelper
} from "../FeedbackSourceHelper";

Template.gaExperimentFeedbackOld.rendered = function() {
    $(".card-frame").fadeIn();
};

Template.gaExperimentFeedbackOld.onCreated(function() {
    let self = this;
    this.exp = new ReactiveVar(null);
    this.designId = new ReactiveVar(null);
    this.guestMode = new ReactiveVar(false);
    this.feedbackMode = new ReactiveVar(false);
    this.userCount = new ReactiveVar(0);
    this.examples = new ReactiveVar(null);

    if (!Meteor.userId()) {
        this.guestMode.set(true);
    }

    Meteor.call("galileo.experiments.getExperiment", this.data.id, function(err, exp) {
        if (err) {
            alert("Server Connection Error");
        } else {

            self.exp.set(exp);
            self.designId.set(exp["curr_design_id"]);

            if (isCurrentUserCreator(self)) {
                Meteor.call("galileo.examples.getExamples", "gaCreateDemo", function(err, resp) {
                    if (resp) {
                        self.examples.set(resp);
                    }
                });
            } else {
                self.feedbackMode.set(true);
            }
        }
    });

    if (!this.data.pilotId) {
        Meteor.call('galileo.experiments.getFeedbackUsers', self.data.id, function(err, result) {
            if (err) {
                console.log("could not get userCount check exp id" + self.data.id);
            } else {
                self.userCount.set(result);
            }
        });
    }
});

Template.gaExperimentFeedbackOld.helpers({
    examples: function() {
        if (Template.instance().guestMode.get()) {
            return false;
        }

        // allow edits only if current user is the owner
        let exp = Template.instance().exp.get();
        let isOwner = (exp && exp.user_id === Meteor.userId());

        if (isOwner) {
            return Template.instance().examples.get();
        }
    },
    designId: function() {
        return Template.instance().designId;
    },
    isGuestMode: function() {
        return Template.instance().guestMode.get();
    },
    isFeedbackMode: function() {
        return Template.instance().feedbackMode.get();
    },
    userCount: function() {
        return Template.instance().userCount.get();
    },
    allowEdits: function() {
        return isCurrentUserCreator(Template.instance());
    },
    headline: function() {
        if (Template.instance().guestMode.get()) {
            return "Review the experiment";
        }

        // allow edits only if current user is the owner
        let exp = Template.instance().exp.get();
        if (exp && exp.user_id === Meteor.userId()) {
            if (Template.instance().data.pilotId) {
                return "See Pilot reviews and improve your experiment";
            }
            return "See the reviews and improve your experiment";
        }

        if (Template.instance().data.pilotId) {
            return "Provide Pilot Feedback";
        }

        return "Review the experiment";
    }
});

Template.gaExperimentFeedbackOld.events({
    "click #finish-review": function(event, instance) {
        if (confirm('Are you done reviewing this experiment?')) {

            window.location.href = "/galileo/browse";

            let expId = instance.exp.get()._id;
            let pilotId = instance.data.pilotId;

            FeedbackSourceHelper.notifyExpCreatorOfReview(expId, pilotId, function(err) {
                if (err) {
                    Materialize.toast(err, 3000, "toast rounded");
                }
            });
        }
    },
    "click #cancel-review": function() {
        history.back();
    },
    "click #top-back-button": function() {
        history.back();
    },
    'click #sign-in': function() {
        window.location.href = "/galileo/signup/"
    }

});


function isCurrentUserCreator(instance) {
    if (instance.guestMode.get()) {
        return false;
    }

    // allow edits only if current user is the owner
    let exp = instance.exp.get();
    return (exp && exp.user_id === Meteor.userId())
}