import "./_.jade";

Template.gaExperimentStartTime.onCreated(function() {
    this.nextDisabled = new ReactiveVar(true);
});

Template.gaExperimentStartTime.events({
    "click .next-action": function(event, instance) {
        var expId = Session.get("currentExperimentId");
        var date = new Date(Date.parse($("#date-input").val()));
        Meteor.call("galileo.experiments.setStartDate", expId, date, function(err) {
            if (err) {
                console.log(err);
                alert("Server Error");
            }
        });
    }
});