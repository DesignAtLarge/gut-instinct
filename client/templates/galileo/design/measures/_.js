import './_.jade';
import Helper from '../helper';
import {
    MeasureType
} from "../../../../../imports/api/ga-models/constants";

Template.gaExperimentDesignMeasures.onCreated(function() {
    this.design = this.data.design;
    this.design_cause_measure = this.data.design_cause_measure;
    this.design_effect_measure = this.data.design_effect_measure;
    this.design_cause = this.data.design_cause;
    this.design_effect = this.data.design_effect;
});

Template.gaExperimentDesignMeasures.helpers({
    focusingCause: function() {
        if (Template.instance().data.focus) {
            return Template.instance().data.focus.get() === "measure_cause";
        }
    },
    focusingEffect: function() {
        if (Template.instance().data.focus) {
            return Template.instance().data.focus.get() === "measure_effect";
        }
    },
    cause: function() {
        let design_cause = Template.instance().design_cause.get();
        if (design_cause) {
            return design_cause;
        }
    },
    effect: function() {
        let design_effect = Template.instance().design_effect.get();
        if (design_effect) return design_effect;
    },
    causeMeasureDetails: function() {
        let design_cause_measure = Template.instance().design_cause_measure.get();
        if (design_cause_measure && design_cause_measure.unit) return design_cause_measure.unit;
        return "";
    },
    hasCauseUnit: function() {
        let design_cause_measure = Template.instance().design_cause_measure.get();
        if (design_cause_measure && design_cause_measure.unit) return " in ";
        return "";
    },
    effectMeasureDetails: function() {
        let design_effect_measure = Template.instance().design_effect_measure.get();
        if (design_effect_measure && design_effect_measure.unit) return design_effect_measure.unit;
        return "";
    },
    hasEffectUnit: function() {
        let design_effect_measure = Template.instance().design_effect_measure.get();
        if (design_effect_measure && design_effect_measure.unit) return " in ";
        return "";
    },
    isCauseRateScaleType: function() {
        let design_cause_measure = Template.instance().design_cause_measure.get();
        if (design_cause_measure && design_cause_measure.type === MeasureType.RATE && design_cause_measure.unit === "")
            return " on a scale of 1 to 5 (1 being slow, 5 being fast)";
        return "";
    },
    hasEffectRating: function() {
        let design_effect_measure = Template.instance().design_effect_measure.get();
        if (design_effect_measure && design_effect_measure.minRating && design_effect_measure.maxRating) {
            return " on a scale of 1 to 5 (1 being " + design_effect_measure.minRating +
                " and 5 being " + design_effect_measure.maxRating + ")";

        }
        return "";
    },
    causeMeasureType: function() {
        let design_cause_measure = Template.instance().design_cause_measure.get();
        if (design_cause_measure && design_cause_measure.type) {
            return Helper.measureTextFromType(design_cause_measure.type);
        }
    },
    causeMeasureFrequency: function() {
        let design_cause_measure = Template.instance().design_cause_measure.get();
        if (design_cause_measure) return design_cause_measure && design_cause_measure.frequency;
    },
    causeMeasureTime: function() {
        let design_cause_measure = Template.instance().design_cause_measure.get();
        if (design_cause_measure) return design_cause_measure && Helper.transcribeTime(design_cause_measure.time);
    },
    causeMeasureReminder: function() {
        let design_cause_measure = Template.instance().design_cause_measure.get();
        if (design_cause_measure) return design_cause_measure && design_cause_measure.reminderText;
    },
    effectMeasureType: function() {
        let design_effect_measure = Template.instance().design_effect_measure.get();
        if (design_effect_measure && design_effect_measure.type) {
            return Helper.measureTextFromType(design_effect_measure.type);
        }
    },
    effectMeasureFrequency: function() {
        let design_effect_measure = Template.instance().design_effect_measure.get();
        if (design_effect_measure) return design_effect_measure && design_effect_measure.frequency;
    },
    effectMeasureTime: function() {
        let design_effect_measure = Template.instance().design_effect_measure.get();
        if (design_effect_measure) return design_effect_measure && Helper.transcribeTime(design_effect_measure.time);
    },
    effectMeasureReminder: function() {
        let design_effect_measure = Template.instance().design_effect_measure.get();
        if (design_effect_measure) return design_effect_measure && design_effect_measure.reminderText;
    },
    isBristol: function() {
        let design_effect_measure = Template.instance().design_effect_measure.get();
        if (design_effect_measure) {
            if (design_effect_measure && design_effect_measure.type && (design_effect_measure.type === MeasureType.BRISTOL)) {
                return true;
            }
        }
        return false;
    }

});

Template.gaExperimentDesignMeasures.events({
    'click #cause-message-textarea-text': function() {
        $("#cause-message-textarea-modal").modal('open');

        let element = $(".textarea-sms");
        if (parseInt(element.height()) < 485) {
            element[0].style.height = "5px";
            if (parseInt(element[0].scrollHeight + 3) < 485) {
                element[0].style.height = (element[0].scrollHeight + 3) + "px";
            } else {
                element[0].style.height = "485px";
            }
        }
    },
    'click #effect-message-textarea-text': function() {
        $("#effect-message-textarea-modal").modal('open');

        let element = $(".textarea-sms");
        if (parseInt(element.height()) < 485) {
            element[0].style.height = "5px";
            if (parseInt(element[0].scrollHeight + 3) < 485) {
                element[0].style.height = (element[0].scrollHeight + 3) + "px";
            } else {
                element[0].style.height = "485px";
            }
        }
    },
    'click #bristol-stool': function() {
        $("#image-modal").modal('open');
    },
    "click #cause-measure-block": function() {
        Template.instance().data.focus.set("measure_cause");
    },
    "click #effect-measure-block": function() {
        Template.instance().data.focus.set("measure_effect");
    },
    "click #edit-cause": function() {
        Helper.toggleEditButton('cause');

        let design = Template.instance().design.get();

        let design_cause_measure = Template.instance().design_cause_measure.get();

        let type = design_cause_measure.type;


        switch (type) {
            case MeasureType.ABS_PRES:
                $("#cause-absence-checkbox-edit").click();
                break;
            case MeasureType.AMOUNT:
                $("#cause-amount-checkbox-edit").click();
                break;
            case MeasureType.RATE:
                $("#cause-rate-checkbox-edit").click();
                if (design_cause_measure.unit.length > 0) {
                    $("#cause-rate-number-checkbox-edit").click();
                    $("#cause-rate-unit-edit")[0].value = design_cause_measure.unit;
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
        $("#cause-message-textarea-text")[0].textContent = str;
        $(".cause-edit").toggleClass('hide');
        $("#cause-message").toggleClass('hide');
        $("#cause-reminder-time-bullet").toggleClass('hide');
        $("#edit-cause-measure-type").toggleClass('hide');
        $("#cause-measure-type").toggleClass('hide');

        let time = Array.from($(".frequency-dropdown-option")).filter(obj => obj.dataset.value === "" + design_cause_measure.time + "")[0];

        let textId = '#frequency-text-' + "cause-amount-time";
        let $label = $("#cause-amount-time");
        $label.removeClass("unchosen");
        $label.trigger("select");
        $label.text(time.innerText);
        $label.attr("data-value", design_cause_measure.time);
        $(textId).addClass('hide');

        design.temp_cause_measure = new ReactiveVar(undefined);

        design.temp_cause_measure.frequency = design_cause_measure.frequency;
        design.temp_cause_measure.reminderText = design_cause_measure.reminderText;
        design.temp_cause_measure.time = design_cause_measure.time;
        design.temp_cause_measure.type = design_cause_measure.type;
        design.temp_cause_measure.unit = design_cause_measure.unit;
    },

    "click #accept-edit-cause": function(event, instance) {
        Helper.toggleEditButton('cause');

        let design = instance.design.get();

        let reminderText = $("#cause-message-textarea")[0].value;

        let reminderTime = $("#cause-amount-time").attr("data-value");

        design.cause_measure.unit = design.temp_cause_measure.unit;
        design.cause_measure.reminderText = reminderText;
        design.cause_measure.time = reminderTime;
        design.cause_measure.type = design.temp_cause_measure.type;

        Template.instance().design_cause_measure.set(design.cause_measure);
        //Template.instance().design.set(design);

        $(".cause-edit").toggleClass('hide');

        $("#cause-message-textarea")[0].value = "";

        $("#cause-message").toggleClass('hide');

        $("#cause-reminder-time-bullet").toggleClass('hide');

        $("#edit-cause-measure-type").toggleClass('hide');

        $("#cause-measure-type").toggleClass('hide');

        Meteor.call('galileo.experiments.edit.updateCauseMeasure', design.exp_id, reminderTime, reminderText, design.cause_measure.type, design.cause_measure.unit);
    },

    "click #cancel-edit-cause": function(event, instance) {
        Helper.toggleEditButton('cause');

        $(".cause-edit").toggleClass('hide');

        $("#cause-message-textarea")[0].value = "";

        $("#cause-message").toggleClass('hide');

        $("#cause-reminder-time-bullet").toggleClass('hide');

        $("#edit-cause-measure-type").toggleClass('hide');

        $("#cause-measure-type").toggleClass('hide');

        $("#edit-cause-measure-type")[0].innerText = Helper.measureTextFromType(Template.instance().design_cause_measure.get().type);

    },

    "click #edit-cause-measure-type": function(event, instance) {
        let $editCauseModal = $("#edit-cause-modal");
        $editCauseModal.modal();
        $editCauseModal.modal('open');

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

    "save #cause-measure-block": function() {
        let design = Template.instance().design.get();

        let type = design.temp_cause_measure;

        let cause = Template.instance().design.get().cause;

        let origRemind = Helper.getReminderText(cause, type);

        let design_cause_measure = Template.instance().design_cause_measure.get();

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

        let newText = Helper.measureTextFromType(newType);
        $("#edit-cause-measure-type")[0].innerText = newText;
        $("#measureType-cause-amount-time")[0].innerText = newText;

        design.temp_cause_measure.type = newType;

        newType = design.temp_cause_measure;

        let newRemind = Helper.getReminderText(cause, newType);

        let $causeMessageText = $("#cause-message-textarea");
        let currentMessage = $causeMessageText[0].value;
        let currentMessageTemp = currentMessage.replace(origRemind, newRemind);

        let time = Array.from($(".frequency-dropdown-option")).filter(obj => obj.dataset.value === "" + design_cause_measure.time + "")[0].text;
        let user = Meteor.user().username;

        if (currentMessageTemp == $causeMessageText[0].value) {
            currentMessage = "Hello from " + user + "! This is your " + time + " reminder to measure " + design.cause + " today. " + newRemind;
        } else {
            currentMessage = currentMessageTemp;
        }
        $causeMessageText[0].value = currentMessage;
        $("#cause-message-textarea-text").text(currentMessage);

        $("#edit-cause-modal").modal('close');
    },

    "cancel #cause-measure-block": function() {
        $("#edit-cause-modal").modal('close')
    },

    "click #edit-effect": function() {
        Helper.toggleEditButton('effect');

        let design = Template.instance().design.get();

        let type = design.effect_measure.type;

        let design_effect_measure = Template.instance().design_effect_measure.get();

        switch (type) {
            case MeasureType.ABS_PRES:
                $("#effect-absence-checkbox-edit").click();
                break;
            case MeasureType.AMOUNT:
                $("#effect-amount-checkbox-edit").click();
                break;
            case MeasureType.RATE:
                $("#effect-rate-checkbox-edit").click();
                if (design_effect_measure.unit.length > 0) {
                    $("#effect-rate-number-checkbox-edit").click();
                    $("#effect-rate-unit-edit")[0].value = design_effect_measure.unit;
                } else {
                    $("#effect-rate-scale-checkbox-edit").click();
                }
                break;
            case MeasureType.RATING:
                $("#effect-rating-checkbox-edit").click();
                $("#effect-rating-min-edit")[0].value = design_effect_measure.minRating;
                $("#effect-rating-max-edit")[0].value = design_effect_measure.maxRating;
                break;
            case MeasureType.FREQUENCY:
                $("#effect-frequency-checkbox-edit").click();
                break;
        }

        let str = $("#effect-message")[0].innerText;

        str = str.replace(/^"(.*)"$/, '$1');

        $("#effect-message-textarea")[0].value = str;
        $("#effect-message-textarea-text")[0].textContent = str;
        $(".effect-edit").toggleClass('hide');
        $("#effect-message").toggleClass('hide');
        $("#effect-reminder-time-bullet").toggleClass('hide');
        $("#edit-effect-measure-type").toggleClass('hide');
        $("#effect-measure-type").toggleClass('hide');

        let time = Array.from($(".frequency-dropdown-option")).filter(obj => obj.dataset.value === "" + design_effect_measure.time + "")[0];

        let textId = '#frequency-text-' + "effect-amount-time";
        let $label = $("#effect-amount-time");
        $label.removeClass("unchosen");
        $label.trigger("select");
        $label.text(time.innerText);
        $label.attr("data-value", design_effect_measure.time);
        $(textId).addClass('hide');

        design.temp_effect_measure = new ReactiveVar(undefined);

        design.temp_effect_measure.frequency = design_effect_measure.frequency;
        design.temp_effect_measure.reminderText = design_effect_measure.reminderText;
        design.temp_effect_measure.time = design_effect_measure.time;
        design.temp_effect_measure.type = design_effect_measure.type;
        design.temp_effect_measure.unit = design_effect_measure.unit;
        design.temp_effect_measure.minRating = design_effect_measure.minRating;
        design.temp_effect_measure.maxRating = design_effect_measure.maxRating;
    },

    "click #accept-edit-effect": function(event, instance) {
        Helper.toggleEditButton('effect');

        let design = instance.design.get();

        let reminderText = $("#effect-message-textarea")[0].value;

        let reminderTime = $("#effect-amount-time").attr("data-value");

        design.effect_measure.unit = design.temp_effect_measure.unit;
        design.effect_measure.reminderText = reminderText;
        design.effect_measure.time = reminderTime;
        design.effect_measure.type = design.temp_effect_measure.type;
        design.effect_measure.minRating = design.temp_effect_measure.minRating;
        design.effect_measure.maxRating = design.temp_effect_measure.maxRating;

        Template.instance().design_effect_measure.set(design.effect_measure);
        //Template.instance().design.set(design);

        $(".effect-edit").toggleClass('hide');

        $("#effect-message-textarea")[0].value = "";

        $("#effect-message").toggleClass('hide');

        $("#effect-reminder-time-bullet").toggleClass('hide');

        $("#edit-effect-measure-type").toggleClass('hide');

        $("#effect-measure-type").toggleClass('hide');

        Meteor.call('galileo.experiments.edit.updateEffectMeasure', design.exp_id, reminderTime, reminderText, design.effect_measure.type, design.effect_measure.unit, design.effect_measure.minRating, design.effect_measure.maxRating);
    },

    "click #cancel-edit-effect": function(event, instance) {
        Helper.toggleEditButton('effect');

        $(".effect-edit").toggleClass('hide');

        $("#effect-message-textarea")[0].value = "";

        $("#effect-message").toggleClass('hide');

        $("#effect-reminder-time-bullet").toggleClass('hide');

        $("#edit-effect-measure-type").toggleClass('hide');

        $("#effect-measure-type").toggleClass('hide');

        $("#edit-effect-measure-type")[0].innerText = Helper.measureTextFromType(Template.instance().design_effect_measure.get().type);

    },

    "click #edit-effect-measure-type": function() {

        let $editEffectModal = $("#edit-effect-modal");
        $editEffectModal.modal();
        $editEffectModal.modal('open');

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
            case MeasureType.BRISTOL:
                $("#effect-bristol-checkbox-edit").click();
                break;
        }

    },

    "save #effect-measure-block": function() {
        let design = Template.instance().design.get();

        let type = design.temp_effect_measure;

        let effect = Template.instance().design_effect.get();

        let origRemind = Helper.getReminderText(effect, type);

        let design_effect_measure = Template.instance().design_effect_measure.get();


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
        } else if ($("#effect-bristol-checkbox-edit").hasClass('selected')) {
            newType = MeasureType.BRISTOL;
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
            case MeasureType.BRISTOL:
                design.temp_effect_measure.unit = "";
                design.temp_effect_measure.minRating = null;
                design.temp_effect_measure.maxRating = null;
                break;
        }

        let newText = Helper.measureTextFromType(newType);
        $("#edit-effect-measure-type")[0].innerText = newText;
        $("#measureType-effect-amount-time")[0].innerText = newText;

        design.temp_effect_measure.type = newType;

        newType = design.temp_effect_measure;

        let newRemind = Helper.getReminderText(effect, newType);

        let $effectMessageText = $("#effect-message-textarea");
        let currentMessage = $effectMessageText[0].value;
        let currentMessageTemp = currentMessage.replace(origRemind, newRemind);

        let time = Array.from($(".frequency-dropdown-option")).filter(obj => obj.dataset.value === "" + design_effect_measure.time + "")[0].text;
        let user = Meteor.user().username;

        if (currentMessageTemp == $effectMessageText[0].value) {
            currentMessage = "Hello from " + user + "! This is your " + time + " reminder to measure " + effect + " today. " + newRemind;
        } else {
            currentMessage = currentMessageTemp;
        }
        $effectMessageText[0].value = currentMessage;
        $("#effect-message-textarea-text").text(currentMessage);

        $("#edit-effect-modal").modal('close');
    },

    "cancel #effect-measure-block": function() {
        $("#edit-effect-modal").modal('close')
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
        $("#" + cause_effect + "-message-textarea-text").text(currentMessage);
    },

    'click #ohDataSourceNames-causeSummary': function() {
        showOpenHumansModal('causeSummary');
    },

    'click #ohDataSourceNames-effectSummary': function() {
        showOpenHumansModal('effectSummary');
    }
});

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
            // $(".modal-overlay").remove();
            Meteor.call('galileo.experiments.edit.updateOpenHumansDataSources',
                design.exp_id,
                inst.data.causeOhDataSourceIdsVar.get(),
                inst.data.effectOhDataSourceIdsVar.get());
        }
    });

    ohModal.modal('open');
}
