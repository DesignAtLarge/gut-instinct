import './_.jade'
import FeedbackSourceHelper from "../FeedbackSourceHelper";

Template.gaExperimentFeedback.rendered = function() {
    $(".card-frame").fadeIn();
    $(".edit-design-btn").hide();
};

Template.gaExperimentFeedback.onCreated(function() {
    let self = this;
    this.exp = new ReactiveVar(null);

    this.lazyLoadExpId = new ReactiveVar(null);
    this.lazyLoadExpCreatorId = new ReactiveVar(null);

    this.designId = new ReactiveVar(null);
    this.guestMode = new ReactiveVar(false);
    this.feedbackMode = new ReactiveVar(false);
    this.userCount = new ReactiveVar(0);
    this.examples = new ReactiveVar(null);
    this.step = new ReactiveVar(1);
    this.focus = new ReactiveVar("hypothesis");
    this.showNext = new ReactiveVar(true);
    this.reviewers = new ReactiveArray();

    if (!Meteor.userId()) {
        this.guestMode.set(true);
    }

    if (this.data.expCreatorId) {
        self.lazyLoadExpCreatorId.set(this.data.expCreatorId);
    }

    self.lazyLoadExpId.set(this.data.id);

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
                self.userCount.set(result.length);
                self.reviewers.set(result);
            }
        });
    }
});

Template.gaExperimentFeedback.helpers({
    isAdmin: function() {
        return Meteor.user().profile.is_admin && !Template.instance().exp.get().feedback_users.includes(Meteor.userId());
    },
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
    showNext: function() {
        return Template.instance().showNext.get();
    },
    getExpId: function() {
        return Template.instance().lazyLoadExpId.get();
    },
    getExpCreatorID: function() {
        return Template.instance().lazyLoadExpCreatorId.get();
    },
    designId: function() {
        return Template.instance().designId;
    },
    getDesignId: function() {
        return Template.instance().designId.get();
    },
    focus: function() {
        return Template.instance().focus;
    },
    focusing: function(section) {
        return Template.instance().focus.get() === section;
    },
    step: function() {
        if (isCurrentUserCreator(Template.instance())) {
            return 100000;
        } else {
            return Template.instance().step.get();
        }
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
        let instance = Template.instance();
        if (instance.guestMode.get()) {
            return false;
        }

        // allow edits only if current user is the owner
        let exp = instance.exp.get();
        console.log()
        return exp && exp.user_id === Meteor.userId() && exp.status !== 10;
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
    },
    isCreator: function() {
        let currentUser = Meteor.userId();
        let creator = Template.instance().lazyLoadExpCreatorId.get();
        if (creator === undefined) {
            return;
        }
        return currentUser === creator;
    },
    numberOfReviewer: function() {
        let users = Template.instance().userCount.get();
        return users;
    },
    nameOfReviewers: function() {
        return Template.instance().reviewers.get();
    },
    getFeedbackRequest: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            let expDesign = exp.design;
            return expDesign.feedback_request;
        }
    },
});

Template.gaExperimentFeedback.events({
    'click .edit-design-btn': function(event, instance) {
        if (!(event.target.classList.contains('cancel') || event.target.classList.contains('accept'))) {
            let set2 = new Set($(".edit-design-btn.hide"));
            let set1 = new Set($(".edit-design-btn"));
            let arr = Array.from(new Set([...set1].filter(x => !set2.has(x))));

            arr2 = [];

            for (var i = 0; i < arr.length; i++) {
                if (Array.from(arr[i].classList).includes("accept")) {
                    arr2.push(arr[i])
                }
            }

            for (var i = 0; i < arr2.length; i++) {
                if (arr2[i].parentElement !== event.target.parentElement) {
                    if (arr2[i].parentElement.classList.contains('design-section')) {
                        arr2[i].parentElement.style.borderColor = "red";
                        arr2[i].parentElement.classList.add("remind");
                    } else {
                        arr2[i].parentElement.parentElement.style.borderColor = "red";
                        arr2[i].parentElement.parentElement.classList.add("remind");
                    }
                }
            }
        } else if (Array.from($(".remind")).length > 0) {
            $(".remind").css("border-color", "");
            $(".remind").removeClass('remind');
        }
    },
    "click #finishReview": function(event, instance) {
        if (confirm('Are you done reviewing this experiment?')) {

            window.location.href = "/galileo/browse";

            let expId = instance.exp.get()._id;
            let pilotId = instance.data.pilotId;

            Meteor.call('galileo.feedback.finishReviewing', expId, function(error, result) {
                FeedbackSourceHelper.notifyExpCreatorOfReview(expId, pilotId, function(err) {
                    if (!err) {
                        Materialize.toast("Thank you for your review.", 3000, "toast rounded");
                    }
                });
            });
        }
    },
    "click #finishReadingReview": function() {
        window.location.href = "/galileo/me/dashboard";
    },
    "click #finishReadingAdmin": function() {
        window.location.href = "/galileo/browse";
    },
    "click #cancel-review": function() {
        history.back();
    },
    "click #top-back-button": function() {
        history.back();
    },
    'click #sign-in': function() {
        localStorage.setItem("loginRedirectUrl", window.location.pathname);
        window.location.href = "/galileo/signup/"
    },
    "click #next": function() {
        if (Meteor.userId()) {
            var inst = Template.instance();
            switch (inst.focus.get()) {
                case "hypothesis":
                    inst.focus.set("measure_cause");
                    inst.step.set(inst.step.get() + 1);
                    break;
                case "measure_cause":
                    inst.focus.set("measure_effect");
                    break;
                case "measure_effect":
                    inst.focus.set("condition_experimental");
                    inst.step.set(inst.step.get() + 1);
                    break;
                case "condition_experimental":
                    inst.focus.set("condition_control");
                    break;
                case "condition_control":
                    inst.focus.set("criteria_exclusion");
                    inst.step.set(inst.step.get() + 1);
                    break;
                case "criteria_exclusion":
                    inst.focus.set("criteria_inclusion");
                    //inst.showNext.set(false);
                    break;
                case "criteria_inclusion":
                    inst.focus.set("overall");
                    inst.showNext.set(true);
                    break;
            }
        } else {
            window.location.href = "/galileo/signup/";
        }
    },
    'click #editFeedbackReq': function() {
        $("#editDiv").show();
    },
    'click #cancelFeedbackReq': function() {
        $("#editDiv").hide();
    },
    "keyup #feedbackReqText": function(event) {
        if ($(event.target).val().length > 0) {
            $("#saveFeedbackReq").show();
            $("#cancelFeedbackReq").hide();
        } else {
            $("#saveFeedbackReq").hide();
            $("#cancelFeedbackReq").show();
        }
    },
    'click #saveFeedbackReq': function(event) {
        let request = $("#feedbackReqText").val().trim();
        let designId = $(event.target).attr("design-id");
        Meteor.call('galileo.experiments.design.setFeedbackRequest', designId, request);
        $("#editDiv").hide();
        Materialize.toast("You have successfully update the feedback request", 3000, "toast rounded");
        location.reload();
    },
});


function isCurrentUserCreator(instance) {
    if (instance.guestMode.get()) {
        return false;
    }

    // allow edits only if current user is the owner
    let exp = instance.exp.get();
    return ((exp && exp.user_id === Meteor.userId()) || (Meteor.user().profile.is_admin && !exp.get().feedback_users.includes(Meteor.userId())))
}
