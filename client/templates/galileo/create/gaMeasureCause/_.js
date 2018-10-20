import './_.jade';
import {
    OpenHumansDataList
} from "../../../../../imports/api/ga-models/constants";

let selectedMeasureId = "";

Template.gaMeasureCause.onCreated(function() {
    this.nextDisabled = new ReactiveVar(true);
});

Template.gaMeasureCause.helpers({
    nextDisabled: function() {
        return Template.instance().nextDisabled.get();
    },
    cause: function() {
        return Template.instance().data.cause.get()
    },
    relation: function() {
        return Template.instance().data.relation.get()
    },
    effect: function() {
        return Template.instance().data.effect.get()
    },
    causeVariable: function() {
        return Template.instance().data.cause;
    },
    causeOhDataSourceIdsVar: function() {
        return Template.instance().data.causeOhDataSourceIds;
    },
    showOhDataSources: function() {
        let ids = Template.instance().data.causeOhDataSourceIds.get();
        return (ids && ids.length > 0);
    },
    timeStamp: function() {
        return true;
    },
    type: function() {
        return "finishMeasureCause";
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
    isOpenHumans: isOpenHumans(),

});

Template.gaMeasureCause.events({
    'show .card-frame': function() {
        let inst = Template.instance();
        let data = inst.data;

        $('.resizing-input').find('input').each(function() {
            let $this = $(this);
            resizeForText.call($this, $this.val())
        });


        let causeMeasure = data.causeMeasure.get();
        if (causeMeasure !== undefined) {
            let $checked = $("input:checked.measureCause-checkbox");
            let id = causeMeasure.type;
            let type = id === "Absence/Presence" ? "Absence" : id;
            if ($checked.length > 0 && $checked.attr("id").split("-")[1] === type) {

            } else {

                // First check the checkbox
                if (type !== undefined) {
                    type = type.toLowerCase();
                }
                let $checkbox = $("#cause-" + type + "-checkbox");
                $checkbox.trigger("click");

                //Enter measurement value for type == Amount
                if (type === "amount") {
                    $("#cause-amount-unit")[0].value = causeMeasure.unit;
                }

                //Enter the meausurement value for type == Route
                if (type === "rate") {
                    if (causeMeasure.unit.length > 0) {
                        $("#cause-rate-number-checkbox").click();
                        $("#cause-rate-unit")[0].value = causeMeasure.unit;
                    } else {
                        $("#cause-rate-scale-checkbox").click();

                    }
                }

                // Then select the frequency value
                let $freqs = $("#dropdown-cause-" + type + " li a");
                for (let i = 0; i < $freqs.length; i++) {
                    if ($freqs.eq(i).text() === causeMeasure.frequency) {
                        $freqs.eq(i).trigger("click");
                    }
                }

                // Finally select the notification time
                let $times = $("#dropdown-cause-" + type + "-time li a");
                for (let i = 0; i < $times.length; i++) {
                    if ($times.eq(i).text() === causeMeasure.time) {
                        $times.eq(i).trigger("click");
                    }
                }
            }
        }
    },
    "click .measureCause-checkbox": function(event) {

        let prevSelectedDropdown = '#' + selectedMeasureId + '-dropdown';

        $(prevSelectedDropdown).addClass('hide');

        let idArr = event.target.id.split('-');
        selectedMeasureId = idArr[0] + '-' + idArr[1];

        let curSelectedDropdown = '#' + selectedMeasureId + '-dropdown';
        $(curSelectedDropdown).removeClass('hide');


        validate();
    },
    'click .next-action': function(event, instance) {
        let ohCauseDataIds = instance.data.causeOhDataSourceIds.get();
        if (isOpenHumans() && (ohCauseDataIds === null || ohCauseDataIds === undefined)) {
            showOpenHumansModal(instance);
            event.stopPropagation();
            return;
        }

        // Get data
        let measure = getMeasurementValues(selectedMeasureId);
        if (isOpenHumans()) {
            measure.ohDataSourceIds = ohCauseDataIds;
        }

        // Update the parameters
        instance.data.causeMeasure.set(measure);

        // Update the database
        Meteor.call('galileo.experiments.design.setCause', instance.data.designId.get(), instance.data.cause.get());
    },

    'click .ohDataSourceNames': function(event, instance) {
        showOpenHumansModal(instance);
    },

    //handling validation for drop down buttons
    'click .frequency-dropdown-option': function() {
        validate();
    },

    'click .frequency-dropdown-option-custom': function() {
        validate();
    },

    'focusout #measureCause-editableText': function(event, instance) {
        let $this = $('#measureCause-editableText');
        let val = $this.val().trim();
        instance.data.cause.set(val);
    },

    'click #measureCause-editableIcon': function() {
        //TODO: make clickable
        $('#measureCause-editableText').focus();
    },
    'click #cause-amount-checkbox': function() {
        $('#cause-amount-unit').focus();
    },
    'click #cause-rate-number-checkbox': function() {
        $('#cause-rate-unit').focus();
    },
    'input #cause-rate-unit': function(event) {
        let disable = ($(event.target).val().trim().length === 0);
        Template.instance().nextDisabled.set(disable);
    },
    'input #cause-amount-unit': function(event) {
        let disable = ($(event.target).val().trim().length === 0);
        Template.instance().nextDisabled.set(disable);
    },
    'click .cause-rate-radio': function() {
        validate();
    },

    'keypress #measureCause-editableText': function(e) {
        if (e.which && e.charCode) {
            let c = String.fromCharCode(e.keyCode | e.charCode);
            let $this = $('#measureCause-editableText');
            resizeForText.call($this, $this.val() + c);
        }
    },
    'input #measureCause-editableText': function(e) {
        if (e.keyCode === 8 || e.keyCode === 46) {
            let $this = $('#measureCause-editableText');
            resizeForText.call($this, $this.val());
        }
    },
    // Backspace event only fires for keyup
    'keyup #measureCause-editableText': function(e, instance) {
        let $this = $('#measureCause-editableText');
        if (e.keyCode === 8 || e.keyCode === 46) {
            resizeForText.call($this, $this.val());
        } else if (e.keyCode === 13) {
            // enter pressed, so save text
            instance.data.cause.set($this.val());
        }

        validate();
    }
});


function getMeasurementValues(id) {
    let idArr = id.split('-');
    let type = idArr[1];

    let frequency = "";

    let textId = '#frequency-text-cause-' + type;
    if ($(textId).is(":visible")) {
        frequency = $(textId).val().trim();
    } else {
        let labelId = '#frequency-label-cause-' + type;
        frequency = $(labelId).text().trim();
    }

    let timeId = '#cause-' + type + '-time';
    let time = $(timeId).text().trim();
    let unit = null;

    // 1st letter should be upper case
    type = type.charAt(0).toUpperCase() + type.slice(1);

    if (type === 'Absence') {
        type = 'Absence/Presence';
    } else if (type === "Amount") {
        unit = $("#cause-amount-unit").val().trim();
    } else if (type === "Rate") {
        unit = $("#cause-rate-unit").val().trim();
    }

    return {
        'type': type,
        'frequency': frequency,
        'time': time,
        'unit': unit,
    };
}

function validate() {
    let disable = false;

    if ($('#measureCause-editableText').val().trim() === "") {
        Template.instance().nextDisabled.set(true);
        return;
    }

    if ($("input:checked.measureCause-checkbox").length === 0) {
        Template.instance().nextDisabled.set(true);
        return;
    }

    let x = getMeasurementValues(selectedMeasureId);

    if (x.type === "Amount") {
        let unit = x.unit;
        if (unit === null || unit === "") {
            disable = true;
        }
    } else if (x.type === "Rate") {
        if ($("#cause-rate-number-checkbox").is(":checked")) {
            let unit = x.unit;
            if (unit === null || unit === "") {
                disable = true;
            }
        } else if ($("#cause-rate-scale-checkbox").is(":checked") === false) {
            disable = true;
        }
    }

    Template.instance().nextDisabled.set(disable);
    // if(disable === false) {
    // $('html, body').animate({
    //     scrollTop: $(document).height()
    // }, 500)
    // }
}

// Resize based on text if text.length > 0
// Otherwise resize based on the placeholder
function resizeForText(text) {
    let $this = $(this);
    if (!text.trim()) {
        text = $this.attr('placeholder').trim();
    }
    let $span = $this.parent().find('span');
    $span.text(text);
    let $inputSize = $span.width();
    $this.css("width", $inputSize);
}

function isOpenHumans() {
    return (localStorage.mendelcode_ga === "OPENHUMANS");
}

function showOpenHumansModal(instance) {
    let ohModal = $('#openhumans-data-modal-cause');
    ohModal.modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        ready: function() {
            ohModal.trigger('show');
        },
        complete: function() {
            scrollTo('#causeDataSources');
        },
    });

    ohModal.modal('open');
}

function scrollTo(element) {
    // calling with timeout 0 beause we need to wait until element is visible
    setTimeout(function() {
        $('html, body').animate({
            scrollTop: $(element).offset().top - 100
        }, 500)
    }, 0);
}