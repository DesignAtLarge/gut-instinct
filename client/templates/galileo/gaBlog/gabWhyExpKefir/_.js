import './_.jade';

Template.gabWhyExpKefir.onCreated(function() {
    Session.setDefault('isDemo', true);

    let inst = Template.instance();
    inst.form = new ReactiveVar(undefined);

    Meteor.call('galileo.boards.getGoogleForm', "KEFIR", function(err, result) {
        inst.form.set(result)
        $("title").html("Galileo | Why Exp Kefir");
    });
});

Template.gabWhyExpKefir.helpers({
    "form": function() {
        return Template.instance().form.get();
    }
});

Template.gabWhyExpKefir.events({
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
            Materialize.toast("Thank you for submitting. You'll be hearing from us soon!", 5000, "toast rounded");
        });
    },


});