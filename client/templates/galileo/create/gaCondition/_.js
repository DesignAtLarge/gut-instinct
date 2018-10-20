import "./_.jade"

Template.gaCondition.rendered = function() {

}

Template.gaCondition.onCreated(function() {
    this.nextDisabled = new ReactiveVar(true);
});

Template.gaCondition.helpers({
    hypothesis: function() {
        return Template.instance().data.hypothesis;
    },
    controlCondition: function() {
        return Template.instance().data.controlCondition.get();
    },
    experimentalCondition: function() {
        return Template.instance().data.experimentalCondition.get();
    },
    controlSteps: function() {
        return Template.instance().data.controlSteps;
    },
    experimentalSteps: function() {
        return Template.instance().data.experimentalSteps;
    },
    nextDisabled: function() {
        return Template.instance().nextDisabled.get();
    }
});

Template.gaCondition.events({
    "show .card-frame": function() {
        var inst = Template.instance();
        if (inst.data.controlSteps.length() == 0) {
            inst.data.controlSteps.push(" ");
        }
        if (inst.data.experimentalSteps.length() == 0) {
            inst.data.experimentalSteps.push(" ");
        }
        check(inst);
    },
    "input input": function() {

        var inst = Template.instance();

        var control = $("#control-input").val().trim();
        var experimental = $("#experimental-input").val().trim();

        inst.data.controlCondition.set(control);
        inst.data.experimentalCondition.set(experimental);

        check(inst);
    },
    "click .next-action": function(event) {

        // Cache the instance
        var inst = Template.instance();

        // Get the values
        var designId = Template.instance().data.designId.get();
        var control = $("#control-input").val().trim();
        var experimental = $("#experimental-input").val().trim();

        if (control == "") {
            alert("Please add the Control Condition");
            event.stopPropagation();
            return;
        }
        if (experimental == "") {
            alert("Please add the Experimental Condition");
            event.stopPropagation();
            return;
        }

        var cs = processArray(inst.data.controlSteps.get());
        var es = processArray(inst.data.experimentalSteps.get());

        if (cs.length == 0) {
            alert("Please add at least one step for control condition");
            event.stopPropagation();
            return;
        }
        if (es.length == 0) {
            alert("Please add at least one step for experimental condition");
            event.stopPropagation();
            return;
        }

        inst.data.controlCondition.set(control);
        inst.data.experimentalCondition.set(experimental);

        Meteor.call("galileo.experiments.design.setControlCondition", designId, control);
        Meteor.call("galileo.experiments.design.setExperimentalCondition", designId, experimental);
        Meteor.call("galileo.experiments.design.setControlSteps", designId, cs);
        Meteor.call("galileo.experiments.design.setExperimentalSteps", designId, es);
    }
});

function check(inst) {

    var control = inst.data.controlCondition.get();
    var experimental = inst.data.experimentalCondition.get();

    if (control == "" || experimental == "") {
        inst.nextDisabled.set(true);
        return;
    }

    //
    if (inst.data.controlSteps.get().length == 0 ||
        inst.data.experimentalSteps.get().length == 0) {
        inst.nextDisabled.set(true);
        return;
    }

    //
    var controlStepPass = false;
    var controlSteps = inst.data.controlSteps.get();
    for (var i = 0; i < controlSteps.length; i++) {
        if (controlSteps[i].trim() != "") {
            controlStepPass = true;
            break;
        }
    }
    var experimentalStepPass = false;
    var experimentalSteps = inst.data.experimentalSteps.get();
    for (var i = 0; i < experimentalSteps.length; i++) {
        if (experimentalSteps[i].trim() != "") {
            experimentalStepPass = true;
            break;
        }
    }
    if (controlStepPass && experimentalStepPass) {
        inst.nextDisabled.set(false);
    } else {
        inst.nextDisabled.set(true);
    }
}

function processArray(arr) {
    var newarr = [];
    for (var i = 0; i < arr.length; i++) {
        var str = arr[i].trim();
        if (str != "") {
            newarr.push(str);
        }
    }
    return newarr;
}