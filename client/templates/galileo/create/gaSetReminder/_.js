import './_.jade';
import {
    MeasureType
} from "../../../../../imports/api/ga-models/constants";
import Helper from '../../design/helper';


Template.gaSetReminder.rendered = function() {};


Template.gaSetReminder.onCreated(function() {
    this.nextDisabled = new ReactiveVar(true);
    this.causeTime = new ReactiveVar(undefined);
    this.effectTime = new ReactiveVar(undefined);
    this.timePicked = new ReactiveVar(false);
    this.backOnly = new ReactiveVar(true);
});

Template.gaSetReminder.helpers({
    hideValidTime: function() {
        return !Template.instance().timePicked.get();
    },
    backOnly: function() {
        return Template.instance().backOnly.get();
    },
    nextDisabled: function() {
        return Template.instance().nextDisabled.get();
    },
    cause: function() {
        return Template.instance().data.cause.get();
    },
    relation: function() {
        return Template.instance().data.relation.get();
    },
    effect: function() {
        return Template.instance().data.effect.get();
    },
    causeMeasureType: function() {
        let causeMeasure = Template.instance().data.causeMeasure.get();

        if ((causeMeasure && causeMeasure.type) === MeasureType.RATE) {
            return "Speed";
        } else if ((causeMeasure && causeMeasure.type) === MeasureType.BRISTOL) {
            return "Bristol Scale Value";
        } else {
            return causeMeasure && causeMeasure.type;
        }
    },
    effectMeasureType: function() {
        let effectMeasure = Template.instance().data.effectMeasure.get();

        if ((effectMeasure && effectMeasure.type) === MeasureType.RATE) {
            return "Speed";
        } else if ((effectMeasure && effectMeasure.type) === MeasureType.BRISTOL) {
            return "Bristol Scale Value";
        } else {
            return effectMeasure && effectMeasure.type;
        }
    },
    causeReminderQuestion: function() {
        let data = Template.instance().data;
        let causeMeasure = data.causeMeasure.get();
        if (causeMeasure) {
            let cause = data.cause.get();
            return Helper.getReminderText(cause, causeMeasure);
        }
        return "";
    },
    effectReminderQuestion: function() {
        let data = Template.instance().data;
        let effectMeasure = data.effectMeasure.get();
        if (effectMeasure) {
            let effect = data.effect.get();
            return Helper.getReminderText(effect, effectMeasure);
        }
        return "";
    },
    causeTimeVar: function() {
        return Template.instance().causeTime;
    },
    causeTimeText: function() {
        let t = Template.instance().causeTime.get();
        if (t !== undefined) {
            setTimeout(function() {
                $('#causeReminderTextArea').trigger('autoresize');
            }, 0);
        }
        return transcribeTime(parseInt(t));
    },
    causeTimeExists: function() {
        return Template.instance().causeTime.get() !== undefined;
    },
    causeMessageExists: function() {
        return Template.instance().data.causeMeasure.get().reminderText != undefined;
    },
    causeMessage: function() {
        return Template.instance().data.causeMeasure.get().reminderText;
    },
    effectTimeVar: function() {
        return Template.instance().effectTime;
    },
    effectTimeText: function() {
        let t = Template.instance().effectTime.get();
        if (t !== undefined) {
            setTimeout(function() {
                $('#effectReminderTextArea').trigger('autoresize');
            }, 0);
        }
        return transcribeTime(parseInt(t));
    },
    effectTimeExists: function() {
        return Template.instance().effectTime.get() !== undefined;
    },
    effectMessageExists: function() {
        return Template.instance().data.effectMeasure.get().reminderText != undefined;
    },
    effectMessage: function() {
        return Template.instance().data.effectMeasure.get().reminderText;
    },
    timeStamp: function() {
        return true;
    },
    type: function() {
        return "finishRemindTime";
    },
    getDesignId: function() {
        return Template.instance().data.designId.get();
    },
    /*  Example Stage format
    3: Measure Cause
    0-0-0
    ^
    The Current Step its on

    0-0-0
      ^
      The 1st position or y position

    0-0-0
        ^
        The 2nd position or x position
    */
    getExamples: function(exampleStage) {
        let mendel = localStorage.mendelcode_ga;

        if (mendel === undefined) {
            mendel = "DEFAULT";
        }

        let rawExamples = Template.instance().data.examples.get();

        if (rawExamples === undefined) {
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
    focusCause: function() {
        focusOn("#causeReminderTextArea");
    },
    focusEffect: function() {
        focusOn("#effectReminderTextArea");
    },
    username: function() {
        return Meteor.user().username;
    }

});

Template.gaSetReminder.events({
    'show .card-frame': function(event, instance) {
        let causeTime = instance.data.causeMeasure.get().time;
        let effectTime = instance.data.effectMeasure.get().time;

        if (causeTime !== undefined && causeTime !== null && causeTime !== "") {
            $('#dropdown-cause-time [data-value=' + causeTime + ']').click();
        }
        if (effectTime !== undefined && effectTime !== null && effectTime !== "") {
            $('#dropdown-effect-time [data-value=' + effectTime + ']').click()
        }
    },
    "click #edit-hypothesis-reminder": function() {
        toggleEditButton('hypothesis-reminder');
    },

    "click #accept-edit-hypothesis-reminder": function(event, instance) {
        toggleEditButton('hypothesis-reminder');

        instance.data.cause.set($("#hypothesis-input-cause2").val().trim());
        instance.data.relation.set($("#hypothesis-input-reln2").val().trim());
        instance.data.effect.set($("#hypothesis-input-effect2").val().trim());
    },

    "click #cancel-edit-hypothesis-reminder": function(event, instance) {
        toggleEditButton('hypothesis-reminder');

        $("#hypothesis-input-cause2").text(instance.data.cause.get());
        $("#hypothesis-input-reln2").text(instance.data.relation.get());
        $("#hypothesis-input-effect2").text(instance.data.effect.get());
    },
    'click .next-action': function(event, instance) {

        // Update the parameters
        let causeMeasure = instance.data.causeMeasure.get();
        let effectMeasure = instance.data.effectMeasure.get();

        causeMeasure.time = parseInt(instance.causeTime.get());
        effectMeasure.time = parseInt(instance.effectTime.get());

        causeMeasure.reminderText = $("#causeReminderTextArea").val().trim();
        effectMeasure.reminderText = $("#effectReminderTextArea").val().trim();


        // Update the local instance data
        instance.data.causeMeasure.set(causeMeasure);
        instance.data.effectMeasure.set(effectMeasure);

        let cause = instance.data.cause.get();
        let relation = instance.data.relation.get();
        let effect = instance.data.effect.get();

        // Update the server database
        Meteor.call('galileo.experiments.design.setHypothesis', instance.data.designId.get(), cause, relation, effect); //not setting mechanism
        Meteor.call('galileo.experiments.design.setCauseMeasure', instance.data.designId.get(), causeMeasure);
        Meteor.call('galileo.experiments.design.setEffectMeasure', instance.data.designId.get(), effectMeasure);
    },
    'change .check': function() {

        let checked1 = $('#best-scientific').is(":checked");
        let checked2 = $('#best-participants').is(":checked");
        let checked3 = $('#best-text').is(":checked");
        //let checked3 = $('#relation-defined-check').is(":checked");
        //let checked4 = $('#mechanism-defined-check').is(":checked");
        let nextDisabled = !checked1 || !checked2 || !checked3;
        //console.log(nextDisabled);
        //console.log(Template.instance().nextDisabled);
        Template.instance().nextDisabled.set(nextDisabled);
    },
    //handling validation for drop down buttons
    'click .frequency-dropdown-option': function(event, instance) {
        validate();
    },

    'click #editCauseReminderTextArea': function() {
        $('#causeReminderTextArea').attr('readonly', false);
        focusOn("#causeReminderTextArea");
    },
    'click #editEffectReminderTextArea': function() {
        $('#effectReminderTextArea').attr('readonly', false);
        focusOn("#effectReminderTextArea");
    },
});


function validate() {

    if ($('#cause-time').attr("data-value") === undefined || $('#effect-time').attr("data-value") === undefined) {

    } else {
        let causeTime = $('#cause-time').attr("data-value").trim();
        let effectTime = $('#effect-time').attr("data-value").trim();

        if (causeTime === 'Pick a time' || effectTime === 'Pick a time') {
            Template.instance().nextDisabled.set(true);
            Template.instance().timePicked.set(false);
            Template.instance().backOnly.set(true);
        } else {
            //Template.instance().nextDisabled.set(false);
            //scroll to bottom of page
            Template.instance().timePicked.set(true);
            Template.instance().backOnly.set(false);
            $('html, body').animate({
                scrollTop: $(document).height()
            }, 500);
        }
    }
}

function transcribeTime(t) {
    return (t == 12) ? "12:00 noon" : t > 12 ? ((t - 12) + ":00 pm") : (t + ":00 am");
}

function focusOn(element) {
    // calling with timeout 0 beause we need to wait until element is visible
    setTimeout(function() {
        $(element).focus();
    }, 0);
}

function toggleEditButton(id) {
    // $('#' + id + '-div').toggleClass('hide');
    $('#' + id + '-editable').toggleClass('hide');

    $('#accept-edit-' + id).toggleClass('hide');
    $('#cancel-edit-' + id).toggleClass('hide');
    $('#edit-' + id).toggleClass('hide');
}