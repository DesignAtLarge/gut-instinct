import './_.jade'

Template.gaPreTest.events({
    'click #finish-pre-test-btn': function(event) {
        Meteor.call("galileo.tour.finishPretest", function(err) {
            if (err) {
                alert("Server Connection Error");
            } else {
                window.location.href = "/galileo/intuition";
            }
        });
    }
});