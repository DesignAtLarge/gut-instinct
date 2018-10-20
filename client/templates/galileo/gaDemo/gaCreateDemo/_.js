import './_.jade';

import {
    Session
} from 'meteor/session';

let maxDisplay = 7;

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

Template.gaCreateDemo.onRendered(function() {
    showNextCard(this);
});

Template.gaCreateDemo.onCreated(function() {

    Session.setDefault('isDemo', true);

    let inst = this;

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
    this.exp.related_works = new ReactiveVar(undefined);

    this.exp.variablesIdentified = new ReactiveVar(false);

    this.exp.causeMeasure = new ReactiveVar(undefined);
    this.exp.causeOhDataSourceIds = new ReactiveVar(undefined);

    this.exp.effectMeasure = new ReactiveVar(undefined);
    this.exp.effectOhDataSourceIds = new ReactiveVar(undefined);

    this.exp.hasInclusionCriteria = new ReactiveVar(false);
    this.exp.inclusionCriteria = new ReactiveArray();
    this.exp.hasExclusionCriteria = new ReactiveVar(false);
    this.exp.exclusionCriteria = new ReactiveArray();

    this.exp.controlCondition = new ReactiveVar(undefined);
    this.exp.experimentalCondition = new ReactiveVar(undefined);
    this.exp.controlSteps = new ReactiveArray();
    this.exp.experimentalSteps = new ReactiveArray();
    this.exp.experimentalPrepSteps = new ReactiveArray();
    this.exp.controlPrepSteps = new ReactiveArray();

    /////////////////////////
    this.design_cause = new ReactiveVar(undefined);
    this.design_relation = new ReactiveVar(undefined);
    this.design_effect = new ReactiveVar(undefined);
    this.design_mechanism = new ReactiveVar(undefined);
    this.design_related_works = new ReactiveVar(undefined);

    this.design_cause_measure = new ReactiveVar(undefined);
    this.design_effect_measure = new ReactiveVar(undefined);

    this.design_condition_experimental = new ReactiveVar(undefined);
    this.design_condition_control = new ReactiveVar(undefined);

    this.design_criteria_exclusion = new ReactiveVar(undefined);
    this.design_criteria_inclusion = new ReactiveVar(undefined);

    //////////////////////////

    this.examples = {};
    this.examples.rawData = new ReactiveVar(undefined);

    // Fetch all the examples by current template
    Meteor.call("galileo.examples.getExamples", "gaCreateDemo", function(err, resp) {
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

                /////////////////
                inst.design_cause.set(d.cause)
                inst.design_relation.set(d.relation)
                inst.design_effect.set(d.effect)
                inst.design_mechanism.set(d.mechanism)
                inst.design_related_works.set(d.related_works)

                inst.design_cause_measure.set(d.cause_measure)
                inst.design_effect_measure.set(d.effect_measure)

                inst.design_condition_experimental.set(d.condition.experimental)
                inst.design_condition_control.set(d.condition.control)

                inst.design_criteria_exclusion.set(d.criteria.exclusion)
                inst.design_criteria_inclusion.set(d.criteria.inclusion)
                ////////////////

                inst.exp.intuition.set(d.intuition);
                inst.exp.cause.set(d.cause);
                inst.exp.relation.set(d.relation);
                inst.exp.effect.set(d.effect);
                inst.exp.mechanism.set(d.mechanism);
                inst.exp.related_works.set(d.related_works);
                inst.exp.variablesIdentified.set(d.variables_identified);
                inst.exp.causeMeasure.set(d.cause_measure && d.cause_measure);
                inst.exp.causeOhDataSourceIds.set(d.cause_measure && d.cause_measure && d.cause_measure.ohDataSourceIds);
                inst.exp.effectMeasure.set(d.effect_measure && d.effect_measure);
                inst.exp.effectOhDataSourceIds.set(d.effect_measure && d.effect_measure && d.effect_measure.ohDataSourceIds);
                inst.exp.inclusionCriteria.set(d.criteria && d.criteria.inclusion);
                inst.exp.exclusionCriteria.set(d.criteria && d.criteria.exclusion);
                inst.exp.controlCondition.set(d.condition && d.condition.control && d.condition.control.description);
                inst.exp.experimentalCondition.set(d.condition && d.condition.experimental && d.condition.experimental.description);
                inst.exp.controlSteps.set(d.condition && d.condition.control && d.condition.control.steps);
                inst.exp.experimentalSteps.set(d.condition && d.condition.experimental && d.condition.experimental.steps);
                inst.exp.experimentalPrepSteps.set(d.condition && d.condition.experimental && d.condition.experimental.prep_steps);
                inst.exp.controlPrepSteps.set(d.condition && d.condition.control && d.condition.control.prep_steps);

                // Then move the user to the progress group
                Meteor.call("galileo.experiments.getDesignProgress", exp._id, function(err, progress) {
                    if (progress !== undefined) {
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

Template.gaCreateDemo.helpers({
    /////////////////////////////

    design_cause: function() {
        return Template.instance().exp.cause;
    },
    design_relation: function() {
        return Template.instance().exp.relation;
    },
    design_effect: function() {
        return Template.instance().exp.effect;
    },
    design_mechanism: function() {
        return Template.instance().exp.mechanism;
    },

    design_related_works: function() {
        return Template.instance().exp.related_works;
    },

    design_cause_measure: function() {
        return Template.instance().exp.causeMeasure;
    },
    design_effect_measure: function() {
        return Template.instance().exp.effectMeasure;
    },

    design_condition_experimental: function() {
        let condition_experimental = new ReactiveVar();
        condition_experimental.description = Template.instance().exp.experimentalCondition.get();
        condition_experimental.steps = Template.instance().exp.experimentalSteps.get();
        condition_experimental.prep_steps = Template.instance().exp.experimentalPrepSteps.get();

        return condition_experimental;
    },
    design_condition_control: function() {
        let condition_control = new ReactiveVar();
        condition_control.description = Template.instance().exp.controlCondition.get();
        condition_control.steps = Template.instance().exp.controlSteps.get();
        condition_control.prep_steps = Template.instance().exp.controlPrepSteps.get();
        condition_control.set(condition_control);

        return condition_control;
    },

    design_criteria_exclusion: function() {
        return Template.instance().exp.exclusionCriteria;
    },
    design_criteria_inclusion: function() {
        return Template.instance().exp.inclusionCriteria;
    },

    /////////////////////////////

    /**
     * Page Elem Helpers
     */
    phases: function() {
        return phases;
    },
    isCurrentPhase: function(phase) {
        let curr = Template.instance().currentDisplay.get();
        if (phase.id + 1 === phases.length) {
            return curr >= phase.beginCard;
        } else {
            return curr >= phase.beginCard && curr < phases[phase.id + 1].beginCard;
        }
    },
    isLaterPhase: function(phase) {
        let curr = Template.instance().currentDisplay.get();
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
        let inst = Template.instance();
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
    related_works: function() {
        return Template.instance().exp.related_works;
    },
    variablesIdentified: function() {
        return Template.instance().exp.variablesIdentified;
    },
    causeMeasure: function() {
        return Template.instance().exp.causeMeasure;
    },
    causeOhDataSourceIds: function() {
        return Template.instance().exp.causeOhDataSourceIds;
    },
    effectMeasure: function() {
        return Template.instance().exp.effectMeasure;
    },
    effectOhDataSourceIds: function() {
        return Template.instance().exp.effectOhDataSourceIds;
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
    experimentalPrepSteps: function() {
        return Template.instance().exp.experimentalPrepSteps;
    },
    controlPrepSteps: function() {
        return Template.instance().exp.controlPrepSteps;
    },
    examples: function() {
        return Template.instance().examples.rawData;
    }
});

Template.gaCreateDemo.events({
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
        let inst = Template.instance();

        // Check if this is the last display
        if (inst.currentDisplay.get() === maxDisplay) {

            if (localStorage.getItem("allowFinish") === "1") {
                // enable finish
                // Then mark the experiment as finished
                Meteor.call("galileo.experiments.setDesignedOrOpenForReview", inst.exp.expId.get(), function(err, res) {
                    if (err) throw new Error(err);
                    let qn = "Does " + inst.exp.cause.get() + " affect " + inst.exp.effect.get() + " ?";
                    Meteor.call("galileo.notification.newExperimentCreated", qn, Meteor.user().username);
                });

                if (localStorage.getItem("send") === "1") {
                    let email = localStorage.getItem("email");
                    let word = localStorage.getItem("word");
                    Meteor.call("galileo.notification.sendEmailToExpert", email, word);
                }
                window.location.href = "/galileo/me/experiment/" + inst.exp.expId.get() + "/info";
                return;
            } else if (localStorage.getItem("allowFinish") == "2") {
                Materialize.toast("Please provide a more in depth request to reviewers", 3000, "toast rounded");
                return;
            } else {
                console.log("email to send: " + localStorage.getItem("email"));
                Materialize.toast('You can not include the word antibiotics in the experiment design', 4000, 'toast rounded');
                return;
            }


            // If the user is still touring, then let him finish the create
            // Meteor.call("galileo.tour.isTouring", function (err, is) {
            //     if (is) {
            //         Meteor.call("galileo.tour.finishCreate");
            //
            //         window.location.href = "/galileo/browse";
            //     }
            //     else {
            //         window.location.href = "/galileo/me/created_experiments";
            //     }
            // });

        }

        // If not, show the next card
        showNextCard(inst);

        // Save the progress
        Meteor.call("galileo.experiments.setDesignProgress", inst.exp.expId.get(), inst.currentDisplay.get());
    },
    'click .back-action': function(event) {

        pauseAllVideos();

        // Cache the instance
        let inst = Template.instance();

        // Check if this is the first display
        if (inst.currentDisplay.get() === 1) {
            alert("This is the first step. Please provide required details to proceed");
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
    let curr = parseInt(inst.currentDisplay.get());

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
    let curr = parseInt(inst.currentDisplay.get());

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
    // let curr = inst.currentDisplay.get();
    // let phase = getPhaseIndex(curr);
    // let p = ((curr - phases[phase].beginCard) / getPhaseLength(phase)) * 100;
    // inst.progress.set(p);
    let curr = inst.currentDisplay.get();
    let p = (curr / maxDisplay) * 100;
    inst.progress.set(p);
}

function getPhaseIndex(cardId) {
    for (let i = 0; i < phases.length; i++) {
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