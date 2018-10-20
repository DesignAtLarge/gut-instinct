import './_.jade';

function initiateActive(section) {

    // TRICK! Put the event to the end of the queue
    setTimeout(function() {
        $("#ga-myexp-section-list li a[href='" + section + "']").parent().addClass("active");
    }, 0);
}
Template.gaMeExperimentMaster.onRendered(function() {
    let section = this.data.section;
});
Template.gaMeExperimentMaster.onCreated(function() {

    let self = this;
    let section = this.data.section;

    // Initiate hypothesis to show on the top of the page
    this.hypo = new ReactiveVar();
    this.exp = new ReactiveVar(undefined);
    Meteor.call("galileo.experiments.getHypothesis", this.data.id, function(err, hypo) {
        let hypoQuestion = "Does " + hypo + "?";
        self.hypo.set(hypoQuestion);
    });
    Meteor.call("galileo.experiments.getExperiment", self.data.id, function(err, result) {
        self.exp.set(result);
    });
    // Initiate creator flag
    this.isCreator = new ReactiveVar(false);
    Meteor.call("galileo.experiments.isCreator", this.data.id, function(err, is) {
        self.isCreator.set(is);
        initiateActive(section);
    });

    // Initiate pilot flag
    this.isPilot = new ReactiveVar(false);
    this.finishedPilot = new ReactiveVar(false);
    Meteor.call("galileo.pilot.isPilot", this.data.id, function(err, is) {
        self.isPilot.set(is);
        initiateActive(section);
    });
    Meteor.call("galileo.pilot.hasPiloted", this.data.id, function(err, is) {
        self.finishedPilot.set(is);
        initiateActive(section);
    });

    // Initiate feedback flag
    this.isFeedbacking = new ReactiveVar(false);
    Meteor.call("galileo.feedback.isFeedbacking", this.data.id, 'experiment/master', function(err, is) {
        self.isFeedbacking.set(is);
        initiateActive(section);
    });

    // Initiate Participation flag
    this.isParticipant = new ReactiveVar(false);
    Meteor.call("galileo.run.isParticipant", this.data.id, function(err, is) {
        self.isParticipant.set(is);
        initiateActive(section);
    });
});
Template.gaMeExperimentMaster.helpers({
    hypothesis: function() {
        return Template.instance().hypo.get();
    },
    experimentObjective: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return "Study the effect of " + exp.design.cause + " on " + exp.design.effect;
        }
    },
    experimentObjectiveQuestion: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return "Does " + exp.design.cause + " " + exp.design.relation + " " + exp.design.effect + "?";
        }
    },
    type: function() {
        if (Template.instance().isCreator.get()) {
            return "created";
        } else if (Template.instance().isPilot.get()) {
            return "pilot";
        }
    },
    isCreator: function() {
        return Template.instance().isCreator.get();
    },
    isPilot: function() {
        return Template.instance().isPilot.get();
    },
    finishedPilot: function() {
        return Template.instance().finishedPilot.get();
    },
    isFeedbacking: function() {
        return Template.instance().isFeedbacking.get();
    },
    canSeeDesign: function() {
        let ic = Template.instance().isCreator.get(),
            fp = Template.instance().finishedPilot.get(),
            ife = Template.instance().isFeedbacking.get();
        return ic || fp || ife;
    },
    canSeePilotSheets: function() {
        let ic = Template.instance().isCreator.get(),
            fp = Template.instance().finishedPilot.get();
        return ic || fp;
    },
    isParticipant: function() {
        return Template.instance().isParticipant.get();
    },
    isOnStatusPage: function() {
        let currentURLParts = window.location.href.split('/');
        var lastSegment = currentURLParts.pop() || currentURLParts.pop(); // handle potential trailing slash
        return lastSegment === "info";
    },
    isOnPilotDataPage: function() {
        let currentURLParts = window.location.href.split('/');
        var lastSegment = currentURLParts.pop() || currentURLParts.pop(); // handle potential trailing slash
        return lastSegment === "pilot_sheets";
    },
});
Template.gaMeExperimentMaster.events({
    "click #current-status-btn": function(event, instance) {
        event.preventDefault();
        let newURL = getPageBySegment("/info");
        window.open(newURL, "_self");
    },
    "click #deign-reviews-btn": function(event, instance) {
        event.preventDefault();
        let newURL = getPageBySegment("/design");
        window.open(newURL, "_blank");
    },
    "click #pilot-data-btn": function(event, instance) {
        event.preventDefault();
        let newURL = getPageBySegment("/pilot_sheets");
        window.open(newURL, "_self");
    },
    "click #my-pilot-btn": function(event, instance) {
        event.preventDefault();
        let newURL = getPageBySegment("/my_pilot");
        window.open(newURL, "_self");
    },
    "click #my-participation-btn": function(event, instance) {
        event.preventDefault();
        let newURL = getPageBySegment("/my_participation");
        window.open(newURL, "_self");
    },
    "click #goBackBtn": function() {
        window.history.go(-1);
    }
});

function getPageBySegment(seg) {
    var currentURL = window.location.href;
    currentURL = currentURL.replace(/\/[^\/]*$/, seg);
    return currentURL;
}