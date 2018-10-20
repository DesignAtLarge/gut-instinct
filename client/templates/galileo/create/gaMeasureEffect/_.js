import './_.jade';
import {
    MeasureType,
    OpenHumansDataList
} from "../../../../../imports/api/ga-models/constants";

Template.gaMeasureEffect.rendered = function() {};

let selectedMeasureId = "";

Template.gaMeasureEffect.onCreated(function() {
    this.nextDisabled = new ReactiveVar(true);
});

Template.gaMeasureEffect.helpers({
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
    effectVariable: function() {
        return Template.instance().data.effect;
    },
    effectOhDataSourceIdsVar: function() {
        return Template.instance().data.effectOhDataSourceIds;
    },
    showOhDataSources: function() {
        let ids = Template.instance().data.effectOhDataSourceIds.get();
        return (ids && ids.length > 0);
    },
    timeStamp: function() {
        return true;
    },
    type: function() {
        return "finishMeasureEffect";
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

    showBristol: function() {
        return isKombucha() || isKefir()
    }
});

Template.gaMeasureEffect.events({
    'click #bristol-stool': function() {
        $("#image-modal").modal('open');
    },
    'show .card-frame': function() {
        let inst = Template.instance();
        let data = inst.data;

        $('.resizing-input').find('input').each(function() {
            let $this = $(this);
            resizeForText.call($this, $this.val())
        });

        let effectMeasure = data.effectMeasure.get();
        if (effectMeasure !== undefined) {
            let $checked = $("input:checked.measureEffect-checkbox");
            let id = effectMeasure.type;
            let type = id === "Absence/Presence" ? "Absence" : id;
            if ($checked.length > 0 && $checked.attr("id").split("-")[1] === type) {

            } else {

                // First check the checkbox
                if (type !== undefined) {
                    type = type.toLowerCase();
                }
                let $checkbox = $("#effect-" + type + "-checkbox");
                $checkbox.trigger("click");

                //Enter measurement value for type == Amount
                if (type === "amount") {
                    $("#effect-amount-unit")[0].value = effectMeasure.unit;
                }

                //Enter the meausurement value for type == Route
                if (type === "rate") {
                    if (effectMeasure.unit.length > 0) {
                        $("#effect-rate-number-checkbox").click();
                        $("#effect-rate-unit")[0].value = effectMeasure.unit;
                    } else {
                        $("#effect-rate-scale-checkbox").click();

                    }
                }

                //Enter measurement value for type == Rating
                if (type === "rating") {
                    $("#effect-rating-min")[0].value = effectMeasure.minRating;
                    $("#effect-rating-max")[0].value = effectMeasure.maxRating;
                }

                // Then select the frequency value
                let $freqs = $("#dropdown-effect-" + type + " li a");
                for (let i = 0; i < $freqs.length; i++) {
                    if ($freqs.eq(i).text() === effectMeasure.frequency) {
                        $freqs.eq(i).trigger("click");
                    }
                }

                // Finally select the notification time
                let $times = $("#dropdown-effect-" + type + "-time li a");
                for (let i = 0; i < $times.length; i++) {
                    if ($times.eq(i).text() === effectMeasure.time) {
                        $times.eq(i).trigger("click");
                    }
                }
            }
        }
    },
    "click .measureEffect-checkbox": function(event) {
        let prevSelectedDropdown = '#' + selectedMeasureId + '-dropdown';

        $(prevSelectedDropdown).addClass('hide');

        let idArr = event.target.id.split('-');
        selectedMeasureId = idArr[0] + '-' + idArr[1];

        let curSelectedDropdown = '#' + selectedMeasureId + '-dropdown';
        $(curSelectedDropdown).removeClass('hide');

        validate();
    },

    'click .ohDataSourceNames': function(event, instance) {
        showOpenHumansModal(instance);
    },

    'click .next-action': function(event, instance) {
        let ohEffectDataIds = instance.data.effectOhDataSourceIds.get();
        if (isOpenHumans() && (ohEffectDataIds === null || ohEffectDataIds === undefined)) {
            showOpenHumansModal(instance);
            event.stopPropagation();
            return;
        }

        // Get data
        let measure = getMeasurementValues(selectedMeasureId);
        if (isOpenHumans()) {
            measure.ohDataSourceIds = ohEffectDataIds;
        }

        // Update the parameters
        instance.data.effectMeasure.set(measure);

        // Update the database
        Meteor.call('galileo.experiments.design.setEffect', instance.data.designId.get(), instance.data.effect.get());
    },

    //handling validation for drop down buttons
    'click .frequency-dropdown-option': function() {
        validate();
    },

    'click .frequency-dropdown-option-custom': function() {
        validate();
    },

    'focusout #measureEffect-editableText': function(event, instance) {
        let $this = $('#measureEffect-editableText');
        let val = $this.val().trim();
        instance.data.effect.set(val);
    },

    'click #measureEffect-editableIcon': function() {
        //TODO: make clickable
        $('#measureEffect-editableText').focus();
    },

    'input #effect-rate-unit': function(event) {
        disableNextIfEmpty(event);
    },
    'input #effect-amount-unit': function(event) {
        disableNextIfEmpty(event);
    },
    'input #effect-rating-min': function(event) {
        disableNextIfEmpty(event);
    },
    'input #effect-rating-max': function(event) {
        disableNextIfEmpty(event);
    },
    'click .effect-rate-radio': function() {
        validate();
    },
    'click #effect-amount-checkbox': function() {
        $("#effect-amount-unit").focus();
    },
    'click #effect-rating-checkbox': function() {
        $('#effect-rating-min').focus();
    },
    'click #effect-rate-number-checkbox': function() {
        $('#effect-rate-unit').focus();
    },

    'keypress #measureEffect-editableText': function(e) {
        if (e.which && e.charCode) {
            let c = String.fromCharCode(e.keyCode | e.charCode);
            let $this = $('#measureEffect-editableText');
            resizeForText.call($this, $this.val() + c);
        }
    },
    'input #measureEffect-editableText': function(e) {
        if (e.keyCode === 8 || e.keyCode === 46) {
            let $this = $('#measureEffect-editableText');
            resizeForText.call($this, $this.val());
        }
    },
    // Backspace event only fires for keyup
    'keyup #measureEffect-editableText': function(e, instance) {
        let $this = $('#measureEffect-editableText');
        if (e.keyCode === 8 || e.keyCode === 46) {
            resizeForText.call($this, $this.val());
        } else if (e.keyCode === 13) {
            // enter pressed, so save text
            instance.data.effect.set($this.val());
        }

        validate();
    }

});

function getMeasurementValues(id) {
    let idArr = id.split('-');
    let type = idArr[1];

    let frequency = "";

    let textId = '#frequency-text-effect-' + type;
    if ($(textId).is(":visible")) {
        frequency = $(textId).val().trim();
    } else {
        let labelId = '#frequency-label-effect-' + type;
        frequency = $(labelId).text().trim();
    }

    let timeId = '#effect-' + type + '-time';
    let time = $(timeId).text().trim();

    let unit = null;
    let minRating = null;
    let maxRating = null;

    // 1st letter should be upper case
    type = type.charAt(0).toUpperCase() + type.slice(1);

    if (type === 'Absence') {
        type = MeasureType.ABS_PRES;
    } else if (type === MeasureType.AMOUNT) {
        unit = $("#effect-amount-unit").val().trim();
    } else if (type === MeasureType.RATE) {
        if ($("#effect-rate-number-checkbox").is(":checked")) {
            unit = $("#effect-rate-unit").val().trim();
        } else if ($("#effect-rate-scale-checkbox").is(":checked")) {
            minRating = "very slow";
            maxRating = "very fast";
        }
    } else if (type === MeasureType.RATING) {
        minRating = $("#effect-rating-min").val().trim();
        maxRating = $("#effect-rating-max").val().trim();
    }

    return {
        'type': type,
        'frequency': frequency,
        'time': time,
        'unit': unit,
        'minRating': minRating,
        'maxRating': maxRating,
    };
}

function validate() {
    let disable = false;

    if ($('#measureEffect-editableText').val().trim() === "") {
        Template.instance().nextDisabled.set(true);
        return;
    }

    if ($("input:checked.measureEffect-checkbox").length === 0) {
        Template.instance().nextDisabled.set(true);
        return;
    }

    let x = getMeasurementValues(selectedMeasureId);

    if (x.type === MeasureType.AMOUNT) {
        let unit = x.unit;
        if (unit === null || unit === "") {
            disable = true;
        }
    } else if (x.type === MeasureType.RATING) {
        let minRating = x.minRating;
        let maxRating = x.maxRating;
        if (minRating === null || minRating === "" || maxRating === null || maxRating === "") {
            disable = true;
        }
    } else if (x.type === MeasureType.RATE) {
        if ($("#effect-rate-number-checkbox").is(":checked")) {
            let unit = x.unit;
            if (unit === null || unit === "") {
                disable = true;
            }
        } else if ($("#effect-rate-scale-checkbox").is(":checked") === false) {
            disable = true;
        }
    }

    Template.instance().nextDisabled.set(disable);
    if (disable === false) {
        //scroll to bottom of page
        // $('html, body').animate({
        //     scrollTop: $(document).height()
        // }, 500)
    }
}

function disableNextIfEmpty(event) {
    let disable = ($(event.target).val().trim().length === 0);
    Template.instance().nextDisabled.set(disable);
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

function isKombucha() {
    return (localStorage.mendelcode_ga === "KOMBUCHA");
}

function isKefir() {
    return (localStorage.mendelcode_ga === "KEFIR");
}

function showOpenHumansModal(instance) {
    let ohModal = $('#openhumans-data-modal-effect');
    ohModal.modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        ready: function() {
            ohModal.trigger('show');
        },
        complete: function() {
            scrollTo('#effectDataSources');
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