import './_.jade';
import {
    Session
} from 'meteor/session'

Template.gaIdentifyVariables.rendered = function() {

};

Template.gaIdentifyVariables.onCreated(function() {
    var inst = this;
    this.nextDisabled = new ReactiveVar(true);
});

Template.gaIdentifyVariables.helpers({
    nextDisabled: function() {
        return Template.instance().nextDisabled.get();
    }
});

Template.gaIdentifyVariables.events({
    'show .card-frame': function(event, instance) {
        var inst = Template.instance();
        if (instance.data.variablesIdentified.get()) {
            $("input.check:not(:checked)").trigger("click");
        }
    },
    'click .next-action': function(event, instance) {
        if (!instance.nextDisabled.get()) {
            Meteor.call("galileo.experiments.design.setVariableIdentified", instance.data.designId.get());
        }
    },
    'change .check': function(event) {
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