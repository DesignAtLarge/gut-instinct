import './_.jade';

Template.editable.onCreated(function() {
    this.showInput = new ReactiveVar(false);
});

Template.editable.helpers({
    showValue: function() {
        return !this.showInput.get();
    },
    showInput: function() {
        return this.showInput.get();
    },
    value: function() {
        return Template.instance().data.value.get();
    }
});

Template.editable.events({
    "edit .editable": function() {

    },
    "submit .editable-form": function(event, instance) {

    }
});