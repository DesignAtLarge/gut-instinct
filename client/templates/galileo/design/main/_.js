import './_.jade';
import Helper from '../helper';

Template.gaExperimentDesign.onCreated(function() {

    // Cache the instance
    let inst = Template.instance();
    this.design = new ReactiveVar(undefined);

    /////////////////////////
    if (this.data.design_cause === undefined) {
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
    } else {
        this.design_cause = this.data.design_cause;
        this.design_relation = this.data.design_relation
        this.design_effect = this.data.design_effect;
        this.design_mechanism = this.data.design_mechanism;
        this.design_related_works = this.data.design_related_works;

        this.design_cause_measure = this.data.design_cause_measure;
        this.design_effect_measure = this.data.design_effect_measure

        this.design_condition_experimental = this.data.design_condition_experimental;
        this.design_condition_control = this.data.design_condition_control;

        this.design_criteria_exclusion = this.data.design_criteria_exclusion;
        this.design_criteria_inclusion = this.data.design_criteria_inclusion;
    }

    //////////////////////////

    this.expId = new ReactiveVar(undefined);
    this.guestMode = new ReactiveVar(false);

    this.editableExclusionCriteria = new ReactiveArray();
    this.editableInclusionCriteria = new ReactiveArray();
    this.editableControlSteps = new ReactiveArray();
    this.editableExperimentalSteps = new ReactiveArray();
    this.editableExperimentalPrepSteps = new ReactiveArray();
    this.editableControlPrepSteps = new ReactiveArray();

    this.causeOhDataSourceIds = new ReactiveVar(null);
    this.effectOhDataSourceIds = new ReactiveVar(null);

    if (!Meteor.userId()) {
        this.guestMode.set(true);
    }

    // Fetch the design Info, this is in autorun becuase designId is a reactive variable,
    Tracker.autorun(function() {
        if (inst.data.designId) {
            Meteor.call("galileo.experiments.design.get", inst.data.designId.get(), function(err, result) {
                if (result) {
                    inst.design.set(result);
                    inst.expId.set(result["exp_id"]);

                    /////////////////
                    inst.design_cause.set(result.cause)
                    inst.design_relation.set(result.relation)
                    inst.design_effect.set(result.effect)
                    inst.design_mechanism.set(result.mechanism)
                    if (result.related_works) {
                        inst.design_related_works.set(result.related_works)
                    } else {
                        inst.design_related_works.set("None")
                    }

                    inst.design_cause_measure.set(result.cause_measure)
                    inst.design_effect_measure.set(result.effect_measure)

                    inst.design_condition_experimental.set(result.condition.experimental)
                    inst.design_condition_control.set(result.condition.control)

                    inst.design_criteria_exclusion.set(result.criteria.exclusion)
                    inst.design_criteria_inclusion.set(result.criteria.inclusion)
                    ////////////////

                    //console.log(inst);

                    inst.editableExclusionCriteria.set(Helper.getEditableExclusionList(result));
                    inst.editableInclusionCriteria.set(Helper.getEditableInclusionList(result));

                    inst.editableControlSteps.set(Helper.getEditableSteps(result.condition && result.condition.control));
                    inst.editableExperimentalSteps.set(Helper.getEditableSteps(result.condition && result.condition.experimental));
                    inst.editableExperimentalPrepSteps.set(Helper.getEditablePrepSteps(result.condition && result.condition.experimental));
                    inst.editableControlPrepSteps.set(Helper.getEditablePrepSteps(result.condition && result.condition.control));

                    if (result.cause_measure && result.cause_measure.ohDataSourceIds && result.cause_measure.ohDataSourceIds.length > 0) {
                        inst.causeOhDataSourceIds.set(result.cause_measure.ohDataSourceIds);
                    }
                    if (result.effect_measure && result.effect_measure.ohDataSourceIds && result.effect_measure.ohDataSourceIds.length > 0) {
                        inst.effectOhDataSourceIds.set(result.effect_measure.ohDataSourceIds);
                    }
                }
            });
        }
    });
});

Template.gaExperimentDesign.helpers({
    getExamples: function(exampleStage) {
        let mendel = localStorage.mendelcode_ga;

        if (mendel === undefined) {
            mendel = "DEFAULT";
        }

        let rawExamples = Template.instance().data.examples;

        if (!rawExamples) {
            return "";
        }

        let fetchedData = rawExamples.filter((obj) => obj.stage_id === exampleStage);
        let fetchedData1 = fetchedData.filter((obj) => obj.mendel_code === mendel);
        if (fetchedData1 && fetchedData1.length > 0) {
            return fetchedData1[0].data;
        } else {
            // if mendel not found, return default
            return fetchedData.filter((obj) => obj.mendel_code === "DEFAULT")[0].data;
        }
    },
    allowFeedback: function() {
        return Template.instance().data.allowFeedback;
    },
    isReviewer: function() {
        let inst = Template.instance();
        return !(inst.data.allowEdits) && inst.data.allowFeedback;
    },
    isFeedbackMode: function() {
        return Template.instance().data.isFeedbackMode;
    },
    isGuestMode: function() {
        return Template.instance().guestMode.get();
    },
    showResults: function() {
        return Template.instance().data.showResults;
    },
    expId: function() {
        return Template.instance().expId;
    },
    design: function() {
        return Template.instance().design;
    },

    /////////////////////////////

    design_cause: function() {
        return Template.instance().design_cause;
    },
    design_relation: function() {
        return Template.instance().design_relation;
    },
    design_effect: function() {
        return Template.instance().design_effect;
    },
    design_mechanism: function() {
        return Template.instance().design_mechanism;
    },
    design_related_works: function() {
        return Template.instance().design_related_works;
    },

    design_cause_measure: function() {
        return Template.instance().design_cause_measure;
    },
    design_effect_measure: function() {
        return Template.instance().design_effect_measure;
    },

    design_condition_experimental: function() {
        Template.instance().design_condition_experimental.set(Template.instance().design_condition_experimental);
        return Template.instance().design_condition_experimental;
    },
    design_condition_control: function() {
        Template.instance().design_condition_control.set(Template.instance().design_condition_control);
        return Template.instance().design_condition_control;
    },

    design_criteria_exclusion: function() {
        return Template.instance().design_criteria_exclusion;
    },
    design_criteria_inclusion: function() {
        return Template.instance().design_criteria_inclusion;
    },

    /////////////////////////////

    editableControlSteps: function() {
        return Template.instance().editableControlSteps;
    },
    editableExperimentalSteps: function() {
        return Template.instance().editableExperimentalSteps;
    },
    editableExperimentalPrepSteps: function() {
        return Template.instance().editableExperimentalPrepSteps;
    },
    editableControlPrepSteps: function() {
        return Template.instance().editableControlPrepSteps;
    },
    editableInclusionCriteria: function() {
        return Template.instance().editableInclusionCriteria;
    },
    editableExclusionCriteria: function() {
        return Template.instance().editableExclusionCriteria;
    },
    showMeasures: function() {
        let inst = Template.instance();
        return inst.data.step ? (inst.data.step > 1) : true;
    },
    showConditions: function() {
        let inst = Template.instance();
        return inst.data.step ? (inst.data.step > 2) : true;
    },
    showCriteria: function() {
        let inst = Template.instance();
        return inst.data.step ? (inst.data.step > 3) : true;
    },


    //Cause Effect Measure Modal Related
    cause: function() {
        let design = Template.instance().design.get();
        return (design && design.cause);
    },
    effect: function() {
        let design = Template.instance().design.get();
        return (design && design.effect);
    },


    // OH Related
    causeVariable: function() {
        let design = Template.instance().design.get();
        if (design) {
            return new ReactiveVar(design.cause);
        }
    },
    effectVariable: function() {
        let design = Template.instance().design.get();
        if (design) {
            return new ReactiveVar(design.effect);
        }
    },
    ohViewOnly: function() {
        return !Template.instance().data.allowEdits;
    },
    causeOhDataSourceIdsVar: function() {
        return Template.instance().causeOhDataSourceIds;
    },
    showCauseOhDataSources: function() {
        let ids = Template.instance().causeOhDataSourceIds.get();
        return (ids && ids.length > 0);
    },
    effectOhDataSourceIdsVar: function() {
        return Template.instance().effectOhDataSourceIds;
    },
    showEffectOhDataSources: function() {
        let ids = Template.instance().effectOhDataSourceIds.get();
        return (ids && ids.length > 0);
    },
    showBristol: function() {
        return (localStorage.mendelcode_ga === "KOMBUCHA" || localStorage.mendelcode_ga === "KEFIR");
    }
});

Template.gaExperimentDesign.events({
    "reload #experiment-design": function() {
        let inst = Template.instance();
        Meteor.call("galileo.experiments.design.get", inst.data.designId.get(), function(err, result) {
            inst.design.set(result);

            if (result.cause_measure && result.cause_measure.ohDataSourceIds && result.cause_measure.ohDataSourceIds.length > 0) {
                inst.causeOhDataSourceIds.set(result.cause_measure.ohDataSourceIds);
            }
            if (result.effect_measure && result.effect_measure.ohDataSourceIds && result.effect_measure.ohDataSourceIds.length > 0) {
                inst.effectOhDataSourceIds.set(result.effect_measure.ohDataSourceIds);
            }
        });
    },
    'click #sign-in': function() {
        window.location.href = "/galileo/signup/"
    },


    // ----- MEASURE CAUSE MODAL RELATED -----

    "click #cancel-cause-measurement-type-modal": function() {
        $('#cause-measure-block').trigger('cancel');
    },

    "click #change-cause-measurement-type-modal": function() {
        $('#cause-measure-block').trigger('save');
    },

    "click #cause-absence-checkbox-edit": function(event, instance) {
        $("#cause-amount-dropdown-edit").addClass('hide');
        $("#cause-rate-dropdown-edit").addClass('hide');

        $("#cause-absence-checkbox-edit").addClass('selected');
        $("#cause-amount-checkbox-edit").removeClass('selected');
        $("#cause-rate-checkbox-edit").removeClass('selected');
        $("#cause-frequency-checkbox-edit").removeClass('selected');
    },

    "click #cause-amount-checkbox-edit": function(event, instance) {
        $("#cause-amount-dropdown-edit").removeClass('hide');
        $("#cause-rate-dropdown-edit").addClass('hide');

        $("#cause-absence-checkbox-edit").removeClass('selected');
        $("#cause-amount-checkbox-edit").addClass('selected');
        $("#cause-rate-checkbox-edit").removeClass('selected');
        $("#cause-frequency-checkbox-edit").removeClass('selected');
    },

    "click #cause-rate-checkbox-edit": function(event, instance) {
        $("#cause-amount-dropdown-edit").addClass('hide');
        $("#cause-rate-dropdown-edit").removeClass('hide');

        $("#cause-absence-checkbox-edit").removeClass('selected');
        $("#cause-amount-checkbox-edit").removeClass('selected');
        $("#cause-rate-checkbox-edit").addClass('selected');
        $("#cause-frequency-checkbox-edit").removeClass('selected');
    },

    "click #cause-frequency-checkbox-edit": function(event, instance) {
        $("#cause-amount-dropdown-edit").addClass('hide');
        $("#cause-rate-dropdown-edit").addClass('hide');

        $("#cause-absence-checkbox-edit").removeClass('selected');
        $("#cause-amount-checkbox-edit").removeClass('selected');
        $("#cause-rate-checkbox-edit").removeClass('selected');
        $("#cause-frequency-checkbox-edit").addClass('selected');
    },


    // ----- MEASURE EFFECT MODAL RELATED -----

    "click #cancel-effect-measurement-type-modal": function() {
        $('#effect-measure-block').trigger('cancel');
    },

    "click #change-effect-measurement-type-modal": function() {
        $('#effect-measure-block').trigger('save');
    },

    "click #effect-absence-checkbox-edit": function(event, instance) {
        $("#effect-amount-dropdown-edit").addClass('hide');
        $("#effect-rate-dropdown-edit").addClass('hide');
        $("#effect-rating-dropdown-edit").addClass('hide');

        $("#effect-bristol-checkbox-edit").removeClass('selected');
        $("#effect-absence-checkbox-edit").addClass('selected');
        $("#effect-amount-checkbox-edit").removeClass('selected');
        $("#effect-rating-checkbox-edit").removeClass('selected');
        $("#effect-rate-checkbox-edit").removeClass('selected');
        $("#effect-frequency-checkbox-edit").removeClass('selected');
    },

    "click #effect-amount-checkbox-edit": function(event, instance) {
        $("#effect-amount-dropdown-edit").removeClass('hide');
        $("#effect-rate-dropdown-edit").addClass('hide');
        $("#effect-rating-dropdown-edit").addClass('hide');

        $("#effect-bristol-checkbox-edit").removeClass('selected');
        $("#effect-absence-checkbox-edit").removeClass('selected');
        $("#effect-amount-checkbox-edit").addClass('selected');
        $("#effect-rating-checkbox-edit").removeClass('selected');
        $("#effect-rate-checkbox-edit").removeClass('selected');
        $("#effect-frequency-checkbox-edit").removeClass('selected');
    },

    "click #effect-rating-checkbox-edit": function(event, instance) {
        $("#effect-amount-dropdown-edit").addClass('hide');
        $("#effect-rate-dropdown-edit").addClass('hide');
        $("#effect-rating-dropdown-edit").removeClass('hide');

        $("#effect-bristol-checkbox-edit").removeClass('selected');
        $("#effect-absence-checkbox-edit").removeClass('selected');
        $("#effect-amount-checkbox-edit").removeClass('selected');
        $("#effect-rating-checkbox-edit").addClass('selected');
        $("#effect-rate-checkbox-edit").removeClass('selected');
        $("#effect-frequency-checkbox-edit").removeClass('selected');
    },

    "click #effect-rate-checkbox-edit": function(event, instance) {
        $("#effect-amount-dropdown-edit").addClass('hide');
        $("#effect-rate-dropdown-edit").removeClass('hide');
        $("#effect-rating-dropdown-edit").addClass('hide');

        $("#effect-bristol-checkbox-edit").removeClass('selected');
        $("#effect-absence-checkbox-edit").removeClass('selected');
        $("#effect-amount-checkbox-edit").removeClass('selected');
        $("#effect-rating-checkbox-edit").removeClass('selected');
        $("#effect-rate-checkbox-edit").addClass('selected');
        $("#effect-frequency-checkbox-edit").removeClass('selected');
    },

    "click #effect-frequency-checkbox-edit": function(event, instance) {
        $("#effect-amount-dropdown-edit").addClass('hide');
        $("#effect-rate-dropdown-edit").addClass('hide');
        $("#effect-rating-dropdown-edit").addClass('hide');

        $("#effect-bristol-checkbox-edit").removeClass('selected');
        $("#effect-absence-checkbox-edit").removeClass('selected');
        $("#effect-amount-checkbox-edit").removeClass('selected');
        $("#effect-rating-checkbox-edit").removeClass('selected');
        $("#effect-rate-checkbox-edit").removeClass('selected');
        $("#effect-frequency-checkbox-edit").addClass('selected');
    },

    "click #effect-bristol-checkbox-edit": function(event, instance) {
        $("#effect-amount-dropdown-edit").addClass('hide');
        $("#effect-rate-dropdown-edit").addClass('hide');
        $("#effect-rating-dropdown-edit").addClass('hide');

        $("#effect-bristol-checkbox-edit").addClass('selected');
        $("#effect-absence-checkbox-edit").removeClass('selected');
        $("#effect-amount-checkbox-edit").removeClass('selected');
        $("#effect-rating-checkbox-edit").removeClass('selected');
        $("#effect-rate-checkbox-edit").removeClass('selected');
        $("#effect-frequency-checkbox-edit").removeClass('selected');
    },



});
