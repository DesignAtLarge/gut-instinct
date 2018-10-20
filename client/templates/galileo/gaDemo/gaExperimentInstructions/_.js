import './_.jade';

Template.gaExperimentInstructions.rendered = function() {};

Template.gaExperimentInstructions.onCreated(function() {
    this.controlGroupInstructions = new ReactiveArray();
    this.expGroupInstructions = new ReactiveArray();
    this.expGroupPrepInstructions = new ReactiveArray();
    this.controlGroupPrepInstructions = new ReactiveArray();

    this.nextDisabled = new ReactiveVar(true);


    this.proceedChecklistClicked = new ReactiveVar(false);
    this.proceedControlstepsClicked = new ReactiveVar(false);
    this.proceedPrepstepsClicked = new ReactiveVar(false);
    this.proceedControlPrepstepsClicked = new ReactiveVar(false);

    //Step 1 forcing functions
    this.noGroups = new ReactiveVar(false);
    this.hideProceedToStep2 = new ReactiveVar(false);

    //Step 2 forcing functions
    this.hideStep2 = new ReactiveVar(false);
    this.proceedToStep2BtnClicked = new ReactiveVar(false);

});

Template.gaExperimentInstructions.helpers({
    //Step 1 forcing functions
    noGroups: function() {
        let control = Template.instance().data.controlCondition.get();
        let experimental = Template.instance().data.experimentalCondition.get();
        return (!control || !experimental);
    },
    //Step 2 forcing functions
    hideStep2: function() {
        return !Template.instance().proceedToStep2BtnClicked.get();
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
    controlCondition: function() {
        return Template.instance().data.controlCondition.get();
    },
    experimentalCondition: function() {
        return Template.instance().data.experimentalCondition.get();
    },
    controlGroupInstructions: function() {
        return Template.instance().controlGroupInstructions;
    },
    expGroupInstructions: function() {
        return Template.instance().expGroupInstructions;
    },
    expGroupPrepInstructions: function() {
        return Template.instance().expGroupPrepInstructions;
    },
    controlGroupPrepInstructions: function() {
        return Template.instance().controlGroupPrepInstructions;
    },

    hideChecklist: function() {
        return !Template.instance().proceedChecklistClicked.get();
    },
    hideControlSteps: function() {
        return !Template.instance().proceedControlstepsClicked.get();
    },
    hidePrepsteps: function() {
        return !Template.instance().proceedPrepstepsClicked.get();
    },
    hideControlPrepsteps: function() {
        return !Template.instance().proceedControlPrepstepsClicked.get();
    },
    proceedChecklistClicked: function() {
        return Template.instance().proceedChecklistClicked.get();
    },
    proceedControlstepsClicked: function() {
        return Template.instance().proceedControlstepsClicked.get();
    },
    proceedPrepstepsClicked: function() {
        return Template.instance().proceedPrepstepsClicked.get();
    },
    proceedControlPrepstepsClicked: function() {
        return Template.instance().proceedControlPrepstepsClicked.get();
    },
    hideProceedChecklist: function() {
        return Template.instance().proceedChecklistClicked.get();
    },
    hideProceedControlsteps: function() {
        return Template.instance().proceedControlstepsClicked.get();
    },
    hideProceedPrepsteps: function() {
        return Template.instance().proceedPrepstepsClicked.get();
    },
    hideCProceedControlPrepsteps: function() {
        return Template.instance().proceedControlPrepstepsClicked.get();
    },
    timeStamp: function() {
        return true;
    },
    type: function() {
        return "finishProvideSteps";
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
        return getExample(exampleStage);
    },
});

Template.gaExperimentInstructions.events({
    'show .card-frame': function() {
        let controlSteps = Template.instance().data.controlSteps.get();
        if (controlSteps != null && controlSteps.length > 0) {
            // Add array and push empty string to the end
            let iarr = controlSteps.slice();
            iarr.push("");

            // Set the template variables
            Template.instance().controlGroupInstructions.set(iarr.map((str, id) => {
                return {
                    'id': id,
                    'checked': false,
                    'text': str,
                    'fixed': false
                }
            }));
        } else {
            Template.instance().controlGroupInstructions.set(defaultControlInstructions());
        }

        let experimentalSteps = Template.instance().data.experimentalSteps.get();
        if (experimentalSteps != null && experimentalSteps.length > 0) {
            // Add array and push empty string to the end
            let iarr = experimentalSteps.slice();
            iarr.push("");

            // Set the template variables
            Template.instance().expGroupInstructions.set(iarr.map((str, id) => {
                return {
                    'id': id,
                    'checked': false,
                    'text': str,
                    'fixed': false
                }
            }));
        } else {
            Template.instance().expGroupInstructions.set(defaultExperimentInstructions());
        }

        let experimentalPrepSteps = Template.instance().data.experimentalPrepSteps.get();
        if (experimentalPrepSteps != null && experimentalPrepSteps.length > 0) {
            // Add array and push empty string to the end
            let iarr = experimentalPrepSteps.slice();
            iarr.push("");

            // Set the template variables
            Template.instance().expGroupPrepInstructions.set(iarr.map((str, id) => {
                return {
                    'id': id,
                    'checked': false,
                    'text': str,
                    'fixed': false
                }
            }));
        } else {
            Template.instance().expGroupPrepInstructions.set(defaultPrepInstructions());
        }

        let controlPrepSteps = Template.instance().data.controlPrepSteps.get();
        if (controlPrepSteps != null && controlPrepSteps.length > 0) {
            // Add array and push empty string to the end
            let iarr = controlPrepSteps.slice();
            iarr.push("");

            // Set the template variables
            Template.instance().controlGroupPrepInstructions.set(iarr.map((str, id) => {
                return {
                    'id': id,
                    'checked': false,
                    'text': str,
                    'fixed': false
                }
            }));
        } else {
            Template.instance().controlGroupPrepInstructions.set(defaultControlPrepInstructions());
        }

    },
    'input #control-input': function(event, instance) {

        let control = $("#control-input").val();
        instance.data.controlCondition.set(control.trim());

    },
    'input #experimental-input': function(event, instance) {
        let experiment = $(event.target).val();
        instance.data.experimentalCondition.set(experiment.trim());
    },
    'click .next-action': function() {

        let inst = Template.instance();
        let designId = inst.data.designId.get();

        let control = inst.data.controlCondition.get();
        let experimental = inst.data.experimentalCondition.get();

        let controlGroupInstructions = getCriteria(inst.controlGroupInstructions.get());
        let expGroupInstructions = getCriteria(inst.expGroupInstructions.get());
        let expGroupPrepInstructions = getCriteria(inst.expGroupPrepInstructions.get());
        let controlGroupPrepInstructions = getCriteria(inst.controlGroupPrepInstructions.get());

        inst.data.controlSteps.set(controlGroupInstructions);
        inst.data.experimentalSteps.set(expGroupInstructions);
        inst.data.experimentalPrepSteps.set(expGroupPrepInstructions);
        inst.data.controlPrepSteps.set(controlGroupPrepInstructions);


        Meteor.call("galileo.experiments.design.setConditionInstructions", designId, control, controlGroupInstructions, experimental, expGroupInstructions, expGroupPrepInstructions, controlGroupPrepInstructions);

    },


    //Step 2 forcing function:
    'click #proceedToStep2-btn': function(event, instance) {

        // Click the button
        instance.proceedToStep2BtnClicked.set(true);
        instance.hideProceedToStep2.set(true);

        var list = document.querySelectorAll('.option-input');
        for (var i = 0; i < list.length; ++i) {
            list[i].style.width = "86%";
        }
        scrollTo('.step2-addsteps');
    },

    'click #checklist-btn': function(event, instance) {

        // Click the button
        instance.proceedChecklistClicked.set(true);

        scrollTo('.checklist');
    },
    'click #control-steps-btn': function(event, instance) {

        // Click the button
        instance.proceedControlstepsClicked.set(true);

        scrollTo('#exp_control_steps');
    },
    'click #exp-prepsteps-btn': function(event, instance) {

        // Click the button
        instance.proceedPrepstepsClicked.set(true);

        scrollTo('#exp_prep_steps');
    },
    'click #control-prepsteps-btn': function(event, instance) {

        // Click the button
        instance.proceedControlPrepstepsClicked.set(true);

        scrollTo('#control_prep_steps');
    },
    'change .check': function(event) {
        let checked1 = $('#cause-minimal-check').is(":checked");
        let checked2 = $('#cause-confound-check').is(":checked");
        let checked3 = $('#step-understandable-check').is(":checked");
        let checked4 = $('#minor-lifestyle-tweak').is(":checked");
        let checked5 = $('#safe-check').is(":checked");
        let nextDisabled = !checked1 || !checked2 || !checked3 || !checked4 || !checked5;
        //console.log(nextDisabled);
        //console.log(Template.instance().nextDisabled);
        Template.instance().nextDisabled.set(nextDisabled);
    }
});

function getCriteria(criteriaArr) {
    let a = [];
    for (let i = 0; i < criteriaArr.length; i++) {
        let criterion = criteriaArr[i];
        let text = criterion.text.trim();
        if (text.length > 0) {
            a.push(criterion.text);
        }
    }
    return a;
}


function defaultControlInstructions() {
    return [
        optionDict(1, '', "e.g. " + getExample("8-0-0")),
        optionDict(2, '', "e.g. " + getExample("8-0-1")),
        optionDict(3, '', "e.g. " + getExample("8-0-2")),
        optionDict(4, '', "e.g. " + getExample("8-0-3")),
        optionDict(5, '', "e.g. " + getExample("8-0-4")),
    ];
}

function defaultExperimentInstructions() {
    return [
        // optionDict(1, '', "e.g. " + getExample("8-1-0")),
        optionDict(1, '', "e.g. " + getExample("8-1-1")),
        optionDict(2, '', "e.g. " + getExample("8-1-2")),
        optionDict(3, '', "e.g. " + getExample("8-1-3")),
        optionDict(4, '', "e.g. " + getExample("8-1-4")),
        optionDict(5, '', "e.g. " + getExample("8-1-5")),
    ];
}

function defaultPrepInstructions() {
    return [
        optionDict(1, '', "e.g. " + getExample("8-2-0")),
    ];
}

function defaultControlPrepInstructions() {
    return [
        optionDict(1, '', "e.g. " + getExample("8-3-0")),
    ];
}

function getExample(exampleStage) {
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
}


function optionDict(id, text = '', placeholder = 'Add another step', fixed = false) {
    return {
        'id': id,
        'checked': false,
        'text': text,
        'fixed': fixed,
        'placeholder': placeholder
    }
}

//vineet added functions
function scrollTo(element) {
    // calling with timeout 0 beause we need to wait until element is visible
    setTimeout(function() {
        $('html, body').animate({
            scrollTop: $(element).offset().top - 100
            //scrollTop: $(element).offset().top + 100
        }, 500)
    }, 0);
}

function focusOn(element) {
    // calling with timeout 0 beause we need to wait until element is visible
    setTimeout(function() {
        $(element).focus();
    }, 0);
}