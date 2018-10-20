import './_.jade';

import {
    Session
} from 'meteor/session';

let maxDisplay = 8;

let phases = [{
        id: 0,
        text: "1",
        description: "Introduction",
        beginCard: 1
    },
    {
        id: 1,
        text: "2",
        description: "Provide your hypothesis",
        beginCard: 2
    },
    {
        id: 2,
        text: "3",
        description: "Design an experiment",
        beginCard: 8
    },
    // {
    //     id: 3,
    //     text: "3",
    //     description : "Pilot your experiment",
    //     beginCard : 13
    // },
    // {
    //     id: 4,
    //     text: "4",
    //     description : "Experiment logistics",
    //     beginCard : 20
    // }
];

Reload._onMigrate(function() {
    return [false];
});

Template.gaEducationDemo.onRendered(function() {
    showNextCard(this);
});

Template.gaEducationDemo.onCreated(function() {

    Session.setDefault('isDemo', true);

    var inst = this;

    // Basic UI element variables
    this.currentDisplay = new ReactiveVar(0);
    this.progress = new ReactiveVar(0.0);
    this.showStep = new ReactiveVar(true);
    Meteor.call("galileo.tour.isTouring", function(err, is) {
        inst.showStep.set(is);
    });

    // Experiment Variables
    this.exp = {};
    this.exp.expId = new ReactiveVar(undefined);
    this.exp.designId = new ReactiveVar(undefined);
    this.exp.intuition = new ReactiveVar(undefined);
    this.exp.cause = new ReactiveVar(undefined);
    this.exp.relation = new ReactiveVar(undefined);
    this.exp.effect = new ReactiveVar(undefined);
    this.exp.mechanism = new ReactiveVar(undefined);

    this.exp.variablesIdentified = new ReactiveVar(false);

    this.exp.causeMeasure = new ReactiveVar(undefined);

    this.exp.effectMeasure = new ReactiveVar(undefined);

    this.exp.hasInclusionCriteria = new ReactiveVar(false);
    this.exp.inclusionCriteria = new ReactiveArray();
    this.exp.hasExclusionCriteria = new ReactiveVar(false);
    this.exp.exclusionCriteria = new ReactiveArray();

    this.exp.controlCondition = new ReactiveVar(undefined);
    this.exp.experimentalCondition = new ReactiveVar(undefined);
    this.exp.controlSteps = new ReactiveArray();
    this.exp.experimentalSteps = new ReactiveArray();

    this.exp.instructions = new ReactiveArray();

    this.examples = {};
    this.examples.rawData = new ReactiveVar(undefined);

    // Fetch all the examples by current template
    Meteor.call("galileo.examples.getExamples", "gaCreateDemo", function(err, resp) {
        console.log("wow" + err)
        if (resp) {
            inst.examples.rawData.set(resp);
        }
    });

    // If there's intuition specified
    if (this.data && this.data.intuitionId) {

        // Load intuition by id
        Meteor.call("galileo.intuition.getIntuitionById", this.data.intuitionId, function(err, intuition) {
            inst.exp.intuition.set(intuition.intuition);
        });
    } else if (this.data && this.data.expId) {

        // If there's experiment id specified
        Meteor.call("galileo.experiments.getExperiment", this.data.expId, function(err, exp) {

            if (exp) {

                // First setup IDs
                inst.exp.expId.set(exp._id);
                inst.exp.designId.set(exp.curr_design_id);

                // Then setup experiment design data
                let d = exp.design;

                inst.exp.intuition.set(d.intuition);
                inst.exp.cause.set(d.cause);
                inst.exp.relation.set(d.relation);
                inst.exp.effect.set(d.effect);
                inst.exp.mechanism.set(d.mechanism);
                inst.exp.variablesIdentified.set(d.variables_identified);
                inst.exp.causeMeasure.set(d.cause_measure && d.cause_measure);
                inst.exp.effectMeasure.set(d.effect_measure && d.effect_measure);
                inst.exp.inclusionCriteria.set(d.criteria && d.criteria.inclusion);
                inst.exp.exclusionCriteria.set(d.criteria && d.criteria.exclusion);
                inst.exp.controlCondition.set(d.condition && d.condition.control && d.condition.control.description);
                inst.exp.experimentalCondition.set(d.condition && d.condition.experimental && d.condition.experimental.description);
                inst.exp.controlSteps.set(d.condition && d.condition.control && d.condition.control.steps);
                inst.exp.experimentalSteps.set(d.condition && d.condition.experimental && d.condition.experimental.steps);
                inst.exp.instructions.set(d.instructions);

                // Then move the user to the progress group
                Meteor.call("galileo.experiments.getDesignProgress", exp._id, function(err, progress) {
                    if (progress != undefined) {
                        refreshDisplay(inst, progress);
                        Materialize.toast('Progress Loaded', 1500, 'toast rounded');
                    }
                });
            } else {
                alert("Experiment doesn't exists");
                window.location.href = "/galileo/createdemo"
            }
        });
    }
});

Template.gaEducationDemo.helpers({

    /**
     * Page Elem Helpers
     */
    phases: function() {
        return phases;
    },
    isCurrentPhase: function(phase) {
        var curr = Template.instance().currentDisplay.get();
        if (phase.id + 1 == phases.length) {
            return curr >= phase.beginCard;
        } else {
            return curr >= phase.beginCard && curr < phases[phase.id + 1].beginCard;
        }
    },
    isLaterPhase: function(phase) {
        var curr = Template.instance().currentDisplay.get();
        return phase.beginCard > curr;
    },
    showStep: function() {
        return Template.instance().showStep.get();
    },
    progress: function() {
        return Template.instance().progress.get();
    },

    /**
     * Experiment Variable Helpers.
     * All of these
     */
    expId: function() {
        return Template.instance().exp.expId;
    },
    designId: function() {
        return Template.instance().exp.designId;
    },
    intuition: function() {
        return Template.instance().exp.intuition;
    },
    hypothesis: function() {
        var inst = Template.instance();
        return inst.exp.cause.get() + " " + inst.exp.relation.get() + " " + inst.exp.effect.get();
    },
    cause: function() {
        return Template.instance().exp.cause;
    },
    relation: function() {
        return Template.instance().exp.relation;
    },
    effect: function() {
        return Template.instance().exp.effect;
    },
    mechanism: function() {
        return Template.instance().exp.mechanism;
    },
    variablesIdentified: function() {
        return Template.instance().exp.variablesIdentified;
    },
    causeMeasure: function() {
        return Template.instance().exp.causeMeasure;
    },
    effectMeasure: function() {
        return Template.instance().exp.effectMeasure;
    },
    inclusionCriteria: function() {
        return Template.instance().exp.inclusionCriteria;
    },
    exclusionCriteria: function() {
        return Template.instance().exp.exclusionCriteria;
    },
    controlCondition: function() {
        return Template.instance().exp.controlCondition;
    },
    experimentalCondition: function() {
        return Template.instance().exp.experimentalCondition;
    },
    controlSteps: function() {
        return Template.instance().exp.controlSteps;
    },
    experimentalSteps: function() {
        return Template.instance().exp.experimentalSteps;
    },
    instructions: function() {
        return Template.instance().exp.instructions;
    },
    examples: function() {
        return Template.instance().examples.rawData;
    }
});

Template.gaEducationDemo.events({
    'click .helpbtn': function(event) {
        let btnId = event.currentTarget.id;
        let res = btnId.split('-');
        let helpcardId = '#helpcard-' + res[1] + '-' + res[2];
        let $helpCard = $(helpcardId);

        if ($helpCard.hasClass("active")) {
            $helpCard.removeClass("active").slideToggle(200);
            return;
        }

        $('.helpcard.active').removeClass("active").hide();

        $helpCard.addClass("active").slideToggle(200);
    },
    'click .helpclose': function(event) {
        let cardId = event.target;
        $(cardId).closest('.card').removeClass("active").slideToggle(200);
    },
    'click .next-action': function(event) {

        pauseAllVideos();

        // Cache the instance
        var inst = Template.instance();

        // Check if this is the last display
        if (inst.currentDisplay.get() == maxDisplay) {

            // Then mark the experiment as finished
            Meteor.call("galileo.experiments.setDesignedOrOpenForReview", inst.exp.expId.get(), function(err, res) {
                if (err) throw new error;
            });

            // Alert the user
            alert("You have successfully designed an experiment! You will be redirected to your experiment view so you can complete the next steps and run your experiment!");

            // If the user is still touring, then let him finish the create
            Meteor.call("galileo.tour.isTouring", function(err, is) {
                if (is) {
                    Meteor.call("galileo.tour.finishCreate");

                    window.location.href = "/galileo/browse";
                } else {
                    window.location.href = "/galileo/me/created_experiments";
                }
            });

            // Return
            return;
        }

        // If not, show the next card
        showNextCard(inst);

        // Save the progress
        Meteor.call("galileo.experiments.setDesignProgress", inst.exp.expId.get(), inst.currentDisplay.get());
    },
    'click .back-action': function(event) {

        pauseAllVideos();

        // Cache the instance
        var inst = Template.instance();

        // Check if this is the first display
        if (inst.currentDisplay.get() == 1) {
            alert("This is the first step. Please provide required details to proceed!");
            return;
        }

        // Go to the previous card
        showPrevCard(inst);

        // Save the progress
        Meteor.call("galileo.experiments.setDesignProgress", inst.exp.expId.get(), inst.currentDisplay.get());
    }
});

function pauseAllVideos() {
    $(".tag-video").find('iframe').map(function(index, videoFrame) {
        videoFrame.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    });
}


function showNextCard(inst) {

    // Get the current display value
    var curr = parseInt(inst.currentDisplay.get());

    // First hide the previous one
    $("#card-" + curr).hide();

    // Then move on to the next one

    curr = curr + 1;
    //VINEET-TO remove after test
    //curr=2;
    inst.currentDisplay.set(curr);
    $("#card-" + curr).show().trigger("show");

    // Update progress and scroll
    updateProgress(inst);
    scrollToTop();
}

function showPrevCard(inst) {

    // Get the current display value
    var curr = parseInt(inst.currentDisplay.get());

    // First hide the original one
    $("#card-" + curr).hide();

    // Then move on to the previous display
    curr = curr - 1;
    inst.currentDisplay.set(curr);
    $("#card-" + curr).show().trigger("show");

    // Update and scroll
    updateProgress(inst);
    scrollToTop();
}

function refreshDisplay(inst, target) {

    // First hide the current display
    $("#card-" + inst.currentDisplay.get()).hide();

    // Then show the target display
    inst.currentDisplay.set(target);
    $("#card-" + target).show().trigger("show");

    // Then update the progress and scroll
    updateProgress(inst);
    scrollToTop();
}

function updateProgress(inst) {
    // var curr = inst.currentDisplay.get();
    // var phase = getPhaseIndex(curr);
    // let p = ((curr - phases[phase].beginCard) / getPhaseLength(phase)) * 100;
    // inst.progress.set(p);
    let curr = inst.currentDisplay.get();
    let p = (curr / maxDisplay) * 100;
    inst.progress.set(p);
}

function getPhaseIndex(cardId) {
    for (var i = 0; i < phases.length; i++) {
        if (i < phases.length - 1) {
            if (cardId >= phases[i].beginCard && cardId < phases[i + 1].beginCard) {
                return i;
            }
        } else {
            if (cardId >= phases[i].beginCard) {
                return i;
            }
        }
    }
    return -1;
}

function getPhaseLength(phase) {
    if (phase < phases.length - 1) {
        return phases[phase + 1].beginCard - phases[phase].beginCard;
    } else {
        return maxDisplay - phases[phase].beginCard;
    }
}

function scrollToTop() {
    $("html, body").animate({
        scrollTop: 0
    }, 300);
}