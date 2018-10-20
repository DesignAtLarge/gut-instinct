import './_.jade';

Template.gabTutorial.onCreated(function() {});

Template.gabTutorial.helpers({});

Template.gabTutorial.events({
    'click #designExp': function() {
        if (Meteor.user()) {
            window.location.href = '/galileo/createdemo'
        } else {
            $('.modal').modal('open');
        }
    },

    'click #submitBtn': function() {
        let email = $("#interestedEmail").val();
        let op1 = $('#option1').is(':checked');
        let op2 = $('#option2').is(':checked');
        let op3 = $('#option3').is(':checked');

        let interestArray = [op1, op2, op3];
        Meteor.call('galileo.openhumanssurvey.submit', email, interestArray, function(res, err) {
            console.log(res);
            console.log(err);
            Materialize.toast("Thank you for submitting. You'll be hearing from us soon!", 5000, "toast rounded");
        });
    },


});