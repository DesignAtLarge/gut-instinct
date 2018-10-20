import './_.jade';
import {
    MeasureType
} from "../../../../imports/api/ga-models/constants";

Template.gaExperimentDesignOld.onCreated(function() {

    // Cache the instance
    let inst = Template.instance();
    this.design = new ReactiveVar(undefined);
    this.expId = new ReactiveVar(undefined);
    this.guestMode = new ReactiveVar(false);

    this.editableExclusionCriteria = new ReactiveArray();
    this.editableInclusionCriteria = new ReactiveArray();
    this.editableControlSteps = new ReactiveArray();
    this.editableExperimentalSteps = new ReactiveArray();
    this.editableExperimentalPrepSteps = new ReactiveArray();

    this.suggestingHypothesis = new ReactiveVar(false);

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

                    inst.editableExclusionCriteria.set(getEditableExclusionList(result));
                    inst.editableInclusionCriteria.set(getEditableInclusionList(result));

                    inst.editableControlSteps.set(getEditableSteps(result.condition && result.condition.control));
                    inst.editableExperimentalSteps.set(getEditableSteps(result.condition && result.condition.experimental));
                    inst.editableExperimentalPrepSteps.set(getEditablePrepSteps(result.condition && result.condition.experimental));

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

Template.gaExperimentDesignOld.helpers({
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
    feedbackStep: function() {

    },
    showResults: function() {
        return Template.instance().data.showResults;
    },
    expId: function() {
        return Template.instance().expId;
    },
    intuition: function() {
        let design = Template.instance().design.get();
        if (design) return design.intuition;
    },
    hypothesis: function() {
        let design = Template.instance().design.get();
        if (design) return design.cause + " " + design.relation + " " + design.effect;
    },
    cause: function() {
        let design = Template.instance().design.get();
        if (design) {
            return design.cause;
        }
    },
    causeVariable: function() {
        let design = Template.instance().design.get();
        if (design) {
            return new ReactiveVar(design.cause);
        }
    },
    causeMeasureDetails: function() {
        let design = Template.instance().design.get();
        if (design && design.cause_measure && design.cause_measure.unit) return design.cause_measure.unit;
        return "";
    },
    hasCauseUnit: function() {
        let design = Template.instance().design.get();
        if (design && design.cause_measure && design.cause_measure.unit) return " in ";
        return "";
    },
    effectMeasureDetails: function() {
        let design = Template.instance().design.get();
        if (design && design.effect_measure && design.effect_measure.unit) return design.effect_measure.unit;
        return "";
    },
    hasEffectUnit: function() {
        let design = Template.instance().design.get();
        if (design && design.effect_measure && design.effect_measure.unit) return " in ";
        return "";
    },
    isCauseRateScaleType: function() {
        let design = Template.instance().design.get();
        if (design && design.cause_measure && design.cause_measure.type === MeasureType.RATE && design.cause_measure.unit === "")
            return " on a scale of 1 to 5 (1 being slow, 5 being fast)";
        return "";
    },
    hasEffectRating: function() {
        let design = Template.instance().design.get();
        if (design && design.effect_measure && design.effect_measure.minRating && design.effect_measure.maxRating) {
            return " on a scale of 1 to 5 (1 being " + design.effect_measure.minRating +
                " and 5 being " + design.effect_measure.maxRating + ")";

        }
        return "";
    },
    relation: function() {
        let design = Template.instance().design.get();
        if (design) return design.relation;
    },
    effect: function() {
        let design = Template.instance().design.get();
        if (design) return design.effect;
    },
    effectVariable: function() {
        let design = Template.instance().design.get();
        if (design) {
            return new ReactiveVar(design.effect);
        }
    },
    mechanism: function() {
        let design = Template.instance().design.get();
        if (design) return design.mechanism;
    },
    causeMeasureType: function() {
        let design = Template.instance().design.get();
        if (design) {
            switch (design.cause_measure && design.cause_measure.type) {
                case MeasureType.ABS_PRES:
                    return MeasureType.ABS_PRES;
                case MeasureType.AMOUNT:
                    return MeasureType.AMOUNT;
                case MeasureType.RATE:
                    return "Speed";
                case MeasureType.FREQUENCY:
                    return "Frequency";
            }
        }
    },
    causeMeasureFrequency: function() {
        let design = Template.instance().design.get();
        if (design) return design.cause_measure && design.cause_measure.frequency;
    },
    causeMeasureTime: function() {
        let design = Template.instance().design.get();
        if (design) return design.cause_measure && transcribeTime(design.cause_measure.time);
    },
    causeMeasureReminder: function() {
        let design = Template.instance().design.get();
        if (design) return design.cause_measure && design.cause_measure.reminderText;
    },
    causeOhDataSourceIdsVar: function() {
        return Template.instance().causeOhDataSourceIds;
    },
    showCauseOhDataSources: function() {
        let ids = Template.instance().causeOhDataSourceIds.get();
        return (ids && ids.length > 0);
    },
    effectMeasureType: function() {
        let design = Template.instance().design.get();
        if (design) {
            switch (design.effect_measure && design.effect_measure.type) {
                case MeasureType.ABS_PRES:
                    return MeasureType.ABS_PRES;
                case MeasureType.AMOUNT:
                    return MeasureType.AMOUNT;
                case MeasureType.RATE:
                    return "Speed";
                case MeasureType.FREQUENCY:
                    return MeasureType.FREQUENCY;
                case MeasureType.RATING:
                    return MeasureType.RATING;
            }
        }
    },
    effectMeasureFrequency: function() {
        let design = Template.instance().design.get();
        if (design) return design.effect_measure && design.effect_measure.frequency;
    },
    effectMeasureTime: function() {
        let design = Template.instance().design.get();
        if (design) return design.effect_measure && transcribeTime(design.effect_measure.time);
    },
    effectMeasureReminder: function() {
        let design = Template.instance().design.get();
        if (design) return design.effect_measure && design.effect_measure.reminderText;
    },
    effectOhDataSourceIdsVar: function() {
        return Template.instance().effectOhDataSourceIds;
    },
    showEffectOhDataSources: function() {
        let ids = Template.instance().effectOhDataSourceIds.get();
        return (ids && ids.length > 0);
    },
    hasInclusionCriteria: function() {
        let design = Template.instance().design.get();
        if (design) return design.criteria && design.criteria.inclusion && design.criteria.inclusion.length > 0;
    },
    hasExclusionCriteria: function() {
        let design = Template.instance().design.get();
        if (design) return design.criteria && design.criteria.exclusion && design.criteria.exclusion.length > 0
    },
    inclusionCriteria: function() {
        let design = Template.instance().design.get();
        if (design) {
            //todo: setting here for the case when we're editing experiment from summary in create flow, tracker autorun method doesn't set this correctly
            Template.instance().editableInclusionCriteria.set(getEditableInclusionList(design));
            return design.criteria && design.criteria.inclusion;
        }
    },
    editableInclusionCriteria: function() {
        return Template.instance().editableInclusionCriteria;
    },
    exclusionCriteria: function() {
        let design = Template.instance().design.get();
        if (design) {
            //todo: setting here for the case when we're editing experiment from summary in create flow, tracker autorun method doesn't set this correctly
            Template.instance().editableExclusionCriteria.set(getEditableExclusionList(design));
            return design.criteria && design.criteria.exclusion;
        }
    },
    editableExclusionCriteria: function() {
        return Template.instance().editableExclusionCriteria;
    },
    controlCondition: function() {
        let design = Template.instance().design.get();
        if (design) {
            //todo: setting here for the case when we're editing experiment from summary in create flow, tracker autorun method doesn't set this correctly
            return design.condition && design.condition.control && design.condition.control.description;
        }
    },
    experimentalCondition: function() {
        let design = Template.instance().design.get();
        if (design) return design.condition && design.condition.experimental && design.condition.experimental.description;
    },
    controlExperimentalCondition: function() {
        let design = Template.instance().design.get();
        if (design && design.condition && design.condition.control && design.condition.experimental) {
            return design.condition.control.description + " and " + design.condition.experimental.description;
        }
    },
    controlSteps: function() {
        let design = Template.instance().design.get();
        if (design) {
            //todo: setting here for the case when we're editing experiment from summary in create flow, tracker autorun method doesn't set this correctly
            let control = design.condition && design.condition.control;
            Template.instance().editableControlSteps.set(getEditableSteps(control));
            return control && control.steps;
        }
    },
    editableControlSteps: function() {
        return Template.instance().editableControlSteps;
    },
    experimentalSteps: function() {
        let design = Template.instance().design.get();
        if (design) {
            //todo: setting here for the case when we're editing experiment from summary in create flow, tracker autorun method doesn't set this correctly
            let experimental = design.condition && design.condition.experimental;
            Template.instance().editableExperimentalSteps.set(getEditableSteps(experimental));
            return experimental && experimental.steps;
        }
    },
    experimentalPrepSteps: function() {
        let design = Template.instance().design.get();
        if (design) {
            //todo: setting here for the case when we're editing experiment from summary in create flow, tracker autorun method doesn't set this correctly
            let experimental = design.condition && design.condition.experimental;
            Template.instance().editableExperimentalPrepSteps.set(getEditablePrepSteps(experimental));
            return experimental && experimental.prep_steps;
        }
    },
    editableExperimentalSteps: function() {
        return Template.instance().editableExperimentalSteps;
    },
    editableExperimentalPrepSteps: function() {
        return Template.instance().editableExperimentalPrepSteps;
    },
    isGuestMode: function() {
        return Template.instance().guestMode.get();
    },
    suggestingHypothesis: function() {
        return Template.instance().suggestingHypothesis.get();
    },
    ohViewOnly: function() {
        return !Template.instance().data.allowEdits;
    }
});

Template.gaExperimentDesignOld.events({
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
        localStorage.setItem("loginRedirectUrl", window.location.pathname);
        window.location.href = "/galileo/signup/";
    },

    "click #edit-hypothesis": function() {
        toggleEditButton('mechanism');
        toggleEditButton('hypothesis');
    },

    "click #accept-edit-hypothesis": function(event, instance) {
        toggleEditButton('hypothesis');
        toggleEditButton('mechanism');

        let design = instance.design.get();

        design.cause = $("#cause-text").val().trim();
        design.relation = $("#relation-text").val().trim();
        design.effect = $("#effect-text").val().trim();
        design.mechanism = $("#mechanism-text").val().trim();
        instance.design.set(design);

        Meteor.call('galileo.experiments.edit.updateHypothesis', design.exp_id, design.cause, design.relation, design.effect, design.mechanism);
    },

    "click #cancel-edit-hypothesis": function(event, instance) {
        toggleEditButton('hypothesis');
        toggleEditButton('mechanism');

        let design = instance.design.get();
        $("#cause-text").text(design.cause);
        $("#relation-text").text(design.relation);
        $("#effect-text").text(design.effect);
        $("#mechanism-text").text(design.effect);
    },

    "click #edit-suggest-hypothesis": function(event, instance) {
        toggleEditButton('suggest-hypothesis');
        toggleEditButton('hypothesis');

        instance.suggestingHypothesis.set(!instance.suggestingHypothesis.get());
    },

    "click #accept-edit-suggest-hypothesis": function(event, instance) {
        toggleEditButton('suggest-hypothesis');
        toggleEditButton('hypothesis');

        let design = instance.design.get();

        let cause = $("#cause-text").val().trim();
        let relation = $("#relation-text").val().trim();
        let effect = $("#effect-text").val().trim();

        Meteor.call('galileo.feedback.suggestions.add', design.exp_id, "hypothesis", cause, relation, effect);

        $("#detail-feedback-btn-hypothesis").trigger("update");
        instance.suggestingHypothesis.set(false);
    },

    "click #cancel-edit-suggest-hypothesis": function(event, instance) {
        toggleEditButton('suggest-hypothesis');
        toggleEditButton('hypothesis');

        let design = instance.design.get();
        $("#cause-text").text(design.cause);
        $("#relation-text").text(design.relation);
        $("#effect-text").text(design.effect);

        instance.suggestingHypothesis.set(false);
    },
    "click #edit-cause": function() {
        toggleEditButton('cause');

        let design = Template.instance().design.get();

        let type = design.cause_measure.type;

        switch (type) {
            case MeasureType.ABS_PRES:
                $("#cause-absence-checkbox-edit").click();
                break;
            case MeasureType.AMOUNT:
                $("#cause-amount-checkbox-edit").click();
                break;
            case MeasureType.RATE:
                $("#cause-rate-checkbox-edit").click();
                if (design.cause_measure.unit.length > 0) {
                    $("#cause-rate-number-checkbox-edit").click();
                    $("#cause-rate-unit-edit")[0].value = design.cause_measure.unit;
                } else {
                    $("#cause-rate-scale-checkbox-edit").click();
                }
                break;
            case MeasureType.FREQUENCY:
                $("#cause-frequency-checkbox-edit").click();
                break;
        }

        let str = $("#cause-message")[0].innerText;

        str = str.replace(/^"(.*)"$/, '$1');

        $("#cause-message-textarea")[0].value = str;
        $(".cause-edit").toggleClass('hide');
        $("#cause-message").toggleClass('hide');
        $("#cause-reminder-time-bullet").toggleClass('hide');
        $("#edit-cause-measure-type").toggleClass('hide');
        $("#cause-measure-type").toggleClass('hide');

        let time = Array.from($(".frequency-dropdown-option")).filter(obj => obj.dataset.value === "" + design.cause_measure.time + "")[0];

        let textId = '#frequency-text-' + "cause-amount-time";
        let $label = $("#cause-amount-time")
        $label.removeClass("unchosen");
        $label.trigger("select");
        $label.text(time.innerText);
        $label.attr("data-value", design.cause_measure.time);
        $(textId).addClass('hide');

        design.temp_cause_measure = new ReactiveVar(undefined);

        design.temp_cause_measure.frequency = design.cause_measure.frequency;
        design.temp_cause_measure.reminderText = design.cause_measure.reminderText;
        design.temp_cause_measure.time = design.cause_measure.time;
        design.temp_cause_measure.type = design.cause_measure.type;
        design.temp_cause_measure.unit = design.cause_measure.unit;
    },

    "click #accept-edit-cause": function(event, instance) {
        toggleEditButton('cause');

        let design = instance.design.get();

        let reminderText = $("#cause-message-textarea")[0].value;

        let reminderTime = $("#cause-amount-time").attr("data-value");

        design.cause_measure.unit = design.temp_cause_measure.unit;
        design.cause_measure.reminderText = reminderText;
        design.cause_measure.time = reminderTime;
        design.cause_measure.type = design.temp_cause_measure.type;

        Template.instance().design.set(design);

        $(".cause-edit").toggleClass('hide');

        $("#cause-message-textarea")[0].value = "";

        $("#cause-message").toggleClass('hide');

        $("#cause-reminder-time-bullet").toggleClass('hide');

        $("#edit-cause-measure-type").toggleClass('hide');

        $("#cause-measure-type").toggleClass('hide');

        Meteor.call('galileo.experiments.edit.updateCauseMeasure', design.exp_id, reminderTime, reminderText, design.cause_measure.type, design.cause_measure.unit);
    },

    "click #cancel-edit-cause": function(event, instance) {
        toggleEditButton('cause');

        $(".cause-edit").toggleClass('hide');

        $("#cause-message-textarea")[0].value = "";

        $("#cause-message").toggleClass('hide');

        $("#cause-reminder-time-bullet").toggleClass('hide');

        $("#edit-cause-measure-type").toggleClass('hide');

        $("#cause-measure-type").toggleClass('hide');

        $("#edit-cause-measure-type")[0].innerText = Template.instance().design.get().cause_measure.type;

    },

    "click #edit-cause-measure-type": function(event, instance) {
        $("#edit-cause-modal").modal('open');

        let design = Template.instance().design.get();

        let type = design.temp_cause_measure.type;

        switch (type) {
            case MeasureType.ABS_PRES:
                $("#cause-absence-checkbox-edit").click();
                break;
            case MeasureType.AMOUNT:
                $("#cause-amount-checkbox-edit").click();
                $("#cause-amount-unit-edit")[0].value = design.temp_cause_measure.unit;
                break;
            case MeasureType.RATE:
                $("#cause-rate-checkbox-edit").click();
                if (design.temp_cause_measure.unit.length > 0) {
                    $("#cause-rate-number-checkbox-edit").click();
                    $("#cause-rate-unit-edit")[0].value = design.temp_cause_measure.unit;
                } else {
                    $("#cause-rate-scale-checkbox-edit").click();
                }
                break;
            case MeasureType.FREQUENCY:
                $("#cause-frequency-checkbox-edit").click();
                break;
        }

    },

    "click #change-cause-measurement-type-modal": function(event, instance) {
        let design = Template.instance().design.get();

        let type = design.temp_cause_measure;

        let cause = design.cause;

        let origRemind = getReminderText(cause, type);

        $("#edit-cause-modal").modal('close');

        let newType;

        if ($("#cause-absence-checkbox-edit").hasClass('selected')) {
            newType = MeasureType.ABS_PRES;
        } else if ($("#cause-amount-checkbox-edit").hasClass('selected')) {
            newType = MeasureType.AMOUNT;
        } else if ($("#cause-rate-checkbox-edit").hasClass('selected')) {
            newType = MeasureType.RATE;
        } else if ($("#cause-frequency-checkbox-edit").hasClass('selected')) {
            newType = MeasureType.FREQUENCY;
        }



        switch (newType) {
            case MeasureType.ABS_PRES:
                design.temp_cause_measure.unit = "";
                break;
            case MeasureType.AMOUNT:
                design.temp_cause_measure.unit = $("#cause-amount-unit-edit")[0].value;
                break;
            case MeasureType.RATE:
                if ($("#cause-rate-unit-edit")[0].value.length > 0) {
                    design.temp_cause_measure.unit = $("#cause-rate-unit-edit")[0].value;
                } else {
                    design.temp_cause_measure.unit = "";
                }
                break;
            case "frequency":
                design.temp_cause_measure.unit = "";
                break;
        }

        if (newType === MeasureType.RATE) {
            $("#edit-cause-measure-type")[0].innerText = "Speed";
            $("#measureType-cause-amount-time")[0].innerText = "Speed";
        } else {
            $("#edit-cause-measure-type")[0].innerText = newType;
            $("#measureType-cause-amount-time")[0].innerText = newType;
        }


        design.temp_cause_measure.type = newType;

        newType = design.temp_cause_measure;

        let newRemind = getReminderText(cause, newType);

        let currentMessage = $("#cause-message-textarea")[0].value;

        currentMessage = currentMessage.replace(origRemind, newRemind);

        $("#cause-message-textarea")[0].value = currentMessage;


    },

    "click #cancel-cause-measurement-type-modal": function(event, instance) {
        $("#edit-cause-modal").modal('close')
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

    "click #edit-effect": function() {
        toggleEditButton('effect');

        let design = Template.instance().design.get();

        let type = design.effect_measure.type;

        switch (type) {
            case MeasureType.ABS_PRES:
                $("#effect-absence-checkbox-edit").click();
                break;
            case MeasureType.AMOUNT:
                $("#effect-amount-checkbox-edit").click();
                break;
            case MeasureType.RATE:
                $("#effect-rate-checkbox-edit").click();
                if (design.effect_measure.unit.length > 0) {
                    $("#effect-rate-number-checkbox-edit").click();
                    $("#effect-rate-unit-edit")[0].value = design.effect_measure.unit;
                } else {
                    $("#effect-rate-scale-checkbox-edit").click();
                }
                break;
            case MeasureType.RATING:
                $("#effect-rating-checkbox-edit").click();
                $("#effect-rating-min-edit")[0].value = design.effect_measure.minRating;
                $("#effect-rating-max-edit")[0].value = design.effect_measure.maxRating;
                break;
            case MeasureType.FREQUENCY:
                $("#effect-frequency-checkbox-edit").click();
                break;
        }

        let str = $("#effect-message")[0].innerText;

        str = str.replace(/^"(.*)"$/, '$1');

        $("#effect-message-textarea")[0].value = str;
        $(".effect-edit").toggleClass('hide');
        $("#effect-message").toggleClass('hide');
        $("#effect-reminder-time-bullet").toggleClass('hide');
        $("#edit-effect-measure-type").toggleClass('hide');
        $("#effect-measure-type").toggleClass('hide');

        let time = Array.from($(".frequency-dropdown-option")).filter(obj => obj.dataset.value === "" + design.effect_measure.time + "")[0];

        let textId = '#frequency-text-' + "effect-amount-time";
        let $label = $("#effect-amount-time")
        $label.removeClass("unchosen");
        $label.trigger("select");
        $label.text(time.innerText);
        $label.attr("data-value", design.effect_measure.time);
        $(textId).addClass('hide');

        design.temp_effect_measure = new ReactiveVar(undefined);

        design.temp_effect_measure.frequency = design.effect_measure.frequency;
        design.temp_effect_measure.reminderText = design.effect_measure.reminderText;
        design.temp_effect_measure.time = design.effect_measure.time;
        design.temp_effect_measure.type = design.effect_measure.type;
        design.temp_effect_measure.unit = design.effect_measure.unit;
        design.temp_effect_measure.minRating = design.effect_measure.minRating;
        design.temp_effect_measure.maxRating = design.effect_measure.maxRating;
    },

    "click #accept-edit-effect": function(event, instance) {
        toggleEditButton('effect');

        let design = instance.design.get();

        let reminderText = $("#effect-message-textarea")[0].value;

        let reminderTime = $("#effect-amount-time").attr("data-value");

        design.effect_measure.unit = design.temp_effect_measure.unit;
        design.effect_measure.reminderText = reminderText;
        design.effect_measure.time = reminderTime;
        design.effect_measure.type = design.temp_effect_measure.type;
        design.effect_measure.minRating = design.temp_effect_measure.minRating;
        design.effect_measure.maxRating = design.temp_effect_measure.maxRating;

        Template.instance().design.set(design);

        $(".effect-edit").toggleClass('hide');

        $("#effect-message-textarea")[0].value = "";

        $("#effect-message").toggleClass('hide');

        $("#effect-reminder-time-bullet").toggleClass('hide');

        $("#edit-effect-measure-type").toggleClass('hide');

        $("#effect-measure-type").toggleClass('hide');

        Meteor.call('galileo.experiments.edit.updateEffectMeasure', design.exp_id, reminderTime, reminderText, design.effect_measure.type, design.effect_measure.unit, design.effect_measure.minRating, design.effect_measure.maxRating);
    },

    "click #cancel-edit-effect": function(event, instance) {
        toggleEditButton('effect');

        $(".effect-edit").toggleClass('hide');

        $("#effect-message-textarea")[0].value = "";

        $("#effect-message").toggleClass('hide');

        $("#effect-reminder-time-bullet").toggleClass('hide');

        $("#edit-effect-measure-type").toggleClass('hide');

        $("#effect-measure-type").toggleClass('hide');

        $("#edit-effect-measure-type")[0].innerText = Template.instance().design.get().effect_measure.type;

    },

    "click #edit-effect-measure-type": function(event, instance) {
        $("#edit-effect-modal").modal('open');

        let design = Template.instance().design.get();

        let type = design.temp_effect_measure.type;

        switch (type) {
            case MeasureType.ABS_PRES:
                $("#effect-absence-checkbox-edit").click();
                break;
            case MeasureType.AMOUNT:
                $("#effect-amount-checkbox-edit").click();
                $("#effect-amount-unit-edit")[0].value = design.temp_effect_measure.unit;
                break;
            case MeasureType.RATE:
                $("#effect-rate-checkbox-edit").click();
                if (design.temp_effect_measure.unit.length > 0) {
                    $("#effect-rate-number-checkbox-edit").click();
                    $("#effect-rate-unit-edit")[0].value = design.temp_effect_measure.unit;
                } else {
                    $("#effect-rate-scale-checkbox-edit").click();
                }
                break;
            case MeasureType.RATING:
                $("#effect-rating-checkbox-edit").click();
                $("#effect-rating-min-edit")[0].value = design.temp_effect_measure.minRating;
                $("#effect-rating-max-edit")[0].value = design.temp_effect_measure.maxRating;
                break;
            case MeasureType.FREQUENCY:
                $("#effect-frequency-checkbox-edit").click();
                break;
        }

    },

    "click #change-effect-measurement-type-modal": function(event, instance) {
        let design = Template.instance().design.get();

        let type = design.temp_effect_measure;

        let effect = design.effect;

        let origRemind = getReminderText(effect, type);

        $("#edit-effect-modal").modal('close');

        let newType;

        if ($("#effect-absence-checkbox-edit").hasClass('selected')) {
            newType = MeasureType.ABS_PRES;
        } else if ($("#effect-amount-checkbox-edit").hasClass('selected')) {
            newType = MeasureType.AMOUNT;
        } else if ($("#effect-rating-checkbox-edit").hasClass('selected')) {
            newType = MeasureType.RATING;
        } else if ($("#effect-rate-checkbox-edit").hasClass('selected')) {
            newType = MeasureType.RATE;
        } else if ($("#effect-frequency-checkbox-edit").hasClass('selected')) {
            newType = MeasureType.FREQUENCY;
        }


        switch (newType) {
            case MeasureType.ABS_PRES:
                design.temp_effect_measure.unit = "";
                design.temp_effect_measure.minRating = null;
                design.temp_effect_measure.maxRating = null;
                break;
            case MeasureType.AMOUNT:
                design.temp_effect_measure.unit = $("#effect-amount-unit-edit")[0].value;
                design.temp_effect_measure.minRating = null;
                design.temp_effect_measure.maxRating = null;
                break;
            case MeasureType.RATE:
                design.temp_effect_measure.minRating = null;
                design.temp_effect_measure.maxRating = null;
                if ($("#effect-rate-unit-edit")[0].value.length > 0) {
                    design.temp_effect_measure.unit = $("#effect-rate-unit-edit")[0].value;
                } else {
                    design.temp_effect_measure.unit = "";
                }
                break;
            case MeasureType.RATING:
                design.temp_effect_measure.minRating = $("#effect-rating-min-edit")[0].value;
                design.temp_effect_measure.maxRating = $("#effect-rating-max-edit")[0].value;
                design.temp_effect_measure.unit = "";
                break;
            case MeasureType.FREQUENCY:
                design.temp_effect_measure.minRating = null;
                design.temp_effect_measure.maxRating = null;
                design.temp_effect_measure.unit = "";
                break;
        }

        if (newType === MeasureType.RATE) {
            $("#edit-effect-measure-type")[0].innerText = "Speed";
            $("#measureType-effect-amount-time")[0].innerText = "Speed";
        } else {
            $("#edit-effect-measure-type")[0].innerText = newType;
            $("#measureType-effect-amount-time")[0].innerText = newType;
        }

        design.temp_effect_measure.type = newType;

        newType = design.temp_effect_measure;

        let newRemind = getReminderText(effect, newType);

        let currentMessage = $("#effect-message-textarea")[0].value;

        currentMessage = currentMessage.replace(origRemind, newRemind);

        $("#effect-message-textarea")[0].value = currentMessage;


    },

    "click #cancel-effect-measurement-type-modal": function(event, instance) {
        $("#edit-effect-modal").modal('close')
    },

    "click #effect-absence-checkbox-edit": function(event, instance) {
        $("#effect-amount-dropdown-edit").addClass('hide');
        $("#effect-rate-dropdown-edit").addClass('hide');
        $("#effect-rating-dropdown-edit").addClass('hide');

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

        $("#effect-absence-checkbox-edit").removeClass('selected');
        $("#effect-amount-checkbox-edit").removeClass('selected');
        $("#effect-rating-checkbox-edit").removeClass('selected');
        $("#effect-rate-checkbox-edit").removeClass('selected');
        $("#effect-frequency-checkbox-edit").addClass('selected');
    },

    "click .frequency-dropdown-option": function(event, instance) {
        let time_obj = event.currentTarget;

        let time_words = time_obj.outerText;

        let cause_effect_regex = new RegExp('-cause-');

        let id_parent = time_obj.parentElement.parentElement.id;

        let isCause = cause_effect_regex.test(id_parent);

        let cause_effect;

        if (isCause) {
            cause_effect = "cause";
        } else {
            cause_effect = "effect"
        }

        let currentMessage = $("#" + cause_effect + "-message-textarea")[0].value;

        currentMessage = currentMessage.replace(/(?:[0-9]+:00\s(?:am|pm|a\.m\.|p\.m\.))|(?:12:00 noon)/, time_words);

        $("#" + cause_effect + "-message-textarea")[0].value = currentMessage;


    },

    "click #edit-exclusion": function() {
        toggleEditButton('exclusion');
    },

    "click #accept-edit-exclusion": function(event, instance) {
        toggleEditButton('exclusion');

        let design = instance.design.get();

        let ec = getTextArrayFromEditableList(instance.editableExclusionCriteria.get());
        design.criteria.exclusion = ec;
        instance.design.set(design);

        Meteor.call("galileo.experiments.edit.updateExclusionCriteria", design.exp_id, ec);
    },

    "click #cancel-edit-exclusion": function(event, instance) {
        toggleEditButton('exclusion');

        let design = instance.design.get();
        let arr = getEditableExclusionList(design);
        instance.editableExclusionCriteria.set(arr);
    },

    "click #edit-inclusion": function() {
        toggleEditButton('inclusion');
    },

    "click #accept-edit-inclusion": function(event, instance) {
        toggleEditButton('inclusion');

        let design = instance.design.get();

        let ec = getTextArrayFromEditableList(instance.editableInclusionCriteria.get());
        design.criteria.inclusion = ec;
        instance.design.set(design);

        Meteor.call("galileo.experiments.edit.updateInclusionCriteria", design.exp_id, ec);
    },

    "click #cancel-edit-inclusion": function(event, instance) {
        toggleEditButton('inclusion');

        let design = instance.design.get();
        let arr = getEditableInclusionList(design);
        instance.editableInclusionCriteria.set(arr);
    },



    "click #edit-control": function() {
        toggleEditButton('control');
    },

    "click #accept-edit-control": function(event, instance) {
        toggleEditButton('control');

        let design = instance.design.get();

        design.condition.control.steps = getTextArrayFromEditableList(instance.editableControlSteps.get());
        design.condition.control.description = $("#control-text").val().trim();
        instance.design.set(design);

        Meteor.call("galileo.experiments.edit.updateConditionInstructions", design.exp_id, design);
    },

    "click #cancel-edit-control": function(event, instance) {
        toggleEditButton('control');

        let design = instance.design.get();
        let arr = getEditableSteps(design.condition.control);
        instance.editableControlSteps.set(arr);
    },



    "click #edit-experimental": function() {
        toggleEditButton('experimental');
    },

    "click #accept-edit-experimental": function(event, instance) {
        toggleEditButton('experimental');

        let design = instance.design.get();

        design.condition.experimental.steps = getTextArrayFromEditableList(instance.editableExperimentalSteps.get());
        design.condition.experimental.prep_steps = getTextArrayFromEditableList(instance.editableExperimentalPrepSteps.get());
        design.condition.experimental.description = $("#experimental-text").val().trim();
        instance.design.set(design);

        Meteor.call("galileo.experiments.edit.updateConditionInstructions", design.exp_id, design);
    },

    "click #cancel-edit-experimental": function(event, instance) {
        toggleEditButton('experimental');

        let design = instance.design.get();
        let arr = getEditableSteps(design.condition.experimental);
        let prepArr = getEditablePrepSteps(design.condition.experimental);
        instance.editableExperimentalSteps.set(arr);
        instance.editableExperimentalPrepSteps.set(prepArr);
    },

    'click #ohDataSourceNames-causeSummary': function() {
        showOpenHumansModal('causeSummary');
    },

    'click #ohDataSourceNames-effectSummary': function() {
        showOpenHumansModal('effectSummary');
    },
});

function transcribeTime(t) {
    return (t == 12) ? "12:00 noon" : t > 12 ? ((t - 12) + " pm ") : (t + " am ");
}



function toggleEditButton(id) {
    $('#' + id + '-div').toggleClass('hide');
    $('#' + id + '-editable').toggleClass('hide');

    $('#accept-edit-' + id).toggleClass('hide');
    $('#cancel-edit-' + id).toggleClass('hide');
    $('#edit-' + id).toggleClass('hide');
}


function getEditableExclusionList(design) {
    let exclusionCriteria = design.criteria && design.criteria.exclusion;
    if (exclusionCriteria && exclusionCriteria.length > 0) {
        let arr = exclusionCriteria.map(function(str, id) {
            return {
                'id': id + 1,
                'checked': false,
                'text': str,
                'fixed': id < 4
            }
        });
        arr.push({
            id: arr.length + 1,
            checked: false,
            text: '',
            placeholder: 'Add another criterion',
            fixed: false
        });
        return arr;
    }
}


function getEditableInclusionList(design) {
    let inclusionCriteria = design.criteria && design.criteria.inclusion;
    let arr = [];
    if (inclusionCriteria && inclusionCriteria.length > 0) {
        arr = inclusionCriteria.map(function(str, id) {
            return {
                'id': id + 1,
                'checked': false,
                'text': str,
                'fixed': false
            }
        });
    }
    // in case there's no inclusion criteria, edit button should give the option to add one
    arr.push({
        id: arr.length + 1,
        checked: false,
        text: '',
        placeholder: 'Add another criterion',
        fixed: false
    });
    return arr;
}


function getEditableSteps(condition) {
    let arr = [];
    if (condition && condition.steps && condition.steps.length > 0) {
        arr = condition.steps.map(function(str, id) {
            return {
                'id': id + 1,
                'checked': false,
                'text': str,
                'fixed': false
            }
        });
    }
    // in case there's no step, edit button should give the option to add one
    arr.push({
        id: arr.length + 1,
        checked: false,
        text: '',
        placeholder: 'Add another step',
        fixed: false
    });
    return arr;
}

function getEditablePrepSteps(condition) {
    let arr = [];
    if (condition && condition.prep_steps && condition.prep_steps.length > 0) {
        arr = condition.prep_steps.map(function(str, id) {
            return {
                'id': id + 1,
                'checked': false,
                'text': str,
                'fixed': false
            }
        });
    }
    // in case there's no step, edit button should give the option to add one
    arr.push({
        id: arr.length + 1,
        checked: false,
        text: '',
        placeholder: 'Add another step',
        fixed: false
    });
    return arr;
}



function getTextArrayFromEditableList(editableList) {
    let a = [];
    for (let i = 0; i < editableList.length; i++) {
        let editItem = editableList[i];
        let text = editItem.text.trim();
        if (text.length > 0) {
            a.push(editItem.text);
        }
    }
    return a;
}

function getReminderText(variable, measure) {
    if (variable === undefined || variable === null || measure === undefined || measure === null) {
        return "";
    }

    let type = measure.type;
    if (type === MeasureType.ABS_PRES) {
        return "Was " + variable + " absent or present in your day today? Reply Yes for present, No for absent.";
    } else if (type === MeasureType.AMOUNT) {
        return "What was the amount of " + variable + " today? Please provide your answer in " + measure.unit + ".";
    } else if (type === MeasureType.RATE) {
        let qn = "What was the speed of " + variable + " today?";
        if (measure.unit) {
            qn = qn + "Please provide your answer in " + measure.unit + ".";
        } else {
            qn = qn + "Please provide your answer on a scale of 1 to 5 (1 means really slow, 5 means really fast)";
        }
        return qn;
    } else if (type === MeasureType.FREQUENCY) {
        return "What was the frequency of " + variable + " today?";
    } else if (type === MeasureType.RATING) {
        return "How would you rate " + variable + " today? Please provide your answer on a scale of 1 to 5 (1 means " + measure.minRating + ", 5 means " + measure.maxRating + ")";
    }
}


function showOpenHumansModal(causeOrEffect) {
    let ohModal = $('#openhumans-data-modal-' + causeOrEffect);
    let inst = Template.instance();
    let design = Template.instance().design.get();
    ohModal.modal({
        dismissible: false, // Modal can be dismissed by clicking outside of the modal
        ready: function() {
            ohModal.trigger('show');
        },
        complete: function() {
            Meteor.call('galileo.experiments.edit.updateOpenHumansDataSources',
                design.exp_id,
                inst.causeOhDataSourceIds.get(),
                inst.effectOhDataSourceIds.get());
        }
    });

    ohModal.modal('open');
}