import './_.html';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import {
    Session
} from 'meteor/session'

Template.gaIdentifyVariables.rendered = function () {

};

Template.gaIdentifyVariables.onCreated(function () {
    var inst = this;
    this.nextDisabled = new ReactiveVar(true);
});

Template.gaIdentifyVariables.helpers({
    hypothesisDescription() {
        return `Cause is also known as the 'independent variable', or the 'manipulation'. An independent variable is
    something that you will modify throughout your experiment. As you manipulate this variable, you will measure your
    dependent variable over a period of time. At the end of your experiment, you will analyze how your dependent
    variable behaves with respect to different values of the independent variable.`
    },
    effectDescription() {
        return `Effect is also known as the dependent variable. A dependent variable is something that you cannot
    directly modify or control. This is something you measure as you manipulate the independent variable.`;
    },
    relationDescription() {
        return `Relation is what links together a cause and an effect. A few examples of relation could be - 
        'Cause increases Effect', 'Cause results in presence of Effect', 'Cause reduces Effect' etc.`;
    },
    nextDisabled: function () {
        return Template.instance().nextDisabled.get();
    }
});

Template.gaIdentifyVariables.events({
    'show .card-frame': function (event, instance) {
        var inst = Template.instance();
        if (instance.data.variablesIdentified.get()) {
            $("input.check:not(:checked)").trigger("click");
        }
    },
    'click .next-action': function (event, instance) {
        if (!instance.nextDisabled.get()) {
            Meteor.call("galileo.experiments.design.setVariableIdentified", instance.data.designId.get());
        }
    },
    'change .check': function (event) {
        var target = $(event.target);
        target.toggleClass("active");

        var flag = true;
        var checkList = $(".check");
        for (var i = 0; i < checkList.length; i++) {
            if (!checkList.eq(i).hasClass("active")) {
                flag = false;
            }
        }
        if (flag) {
            Template.instance().nextDisabled.set(false);
        } else {
            Template.instance().nextDisabled.set(true);
        }
    }
});