import './_.jade';

Template.gaMeIntuitions.onCreated(function() {
    var inst = this;
    inst.intuitions = new ReactiveArray();
    Meteor.call("galileo.intuition.getMyIntuitions", function(err, result) {
        if (err) {
            alert("Server Connection Error")
        } else {
            inst.intuitions.set(result);
        }
    });
});

Template.gaMeIntuitions.helpers({
    hasIntuition: function() {
        return Template.instance().intuitions.length() > 0;
    },
    intuitions: function() {
        return Template.instance().intuitions.get();
    }
});