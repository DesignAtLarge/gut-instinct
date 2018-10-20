import './_.jade';

Template.gaFollowupModal.rendered = function() {};

Template.gaFollowupModal.onCreated(function() {
    // Needed for Material tabs
    $(document).ready(function() {
        $('ul.tabs').tabs();
    });
    let inst = this;
    this.myParticipateExp = new ReactiveVar(undefined);

    let exp_id = inst.data.exp_id
    let interval = setInterval(function() {
        if (exp_id == undefined) {
            exp_id = inst.data.exp_id;
        }
        else {
            clearInterval(interval);

            Meteor.call("galileo.experiments.getExperiment", exp_id, function(err, resultExp) {
                if (err) {
                    throw err;
                }
                //console.log("my participating exp in meteor call: " + JSON.stringify(resultExp));
                if (resultExp) {
                    inst.myParticipateExp.set(resultExp);
                }
            });
            
        }
    }, 100);
});

Template.gaFollowupModal.helpers({
    followupMessage: function() {
        let isCause = $('#followup-modal-' + Template.instance().data.exp_id).data('isCause');

        let exp = Template.instance().myParticipateExp.get();
        if (exp && exp.design) {
            let cause_followup = exp.design.followup_message_cause;
            let effect_followup = exp.design.followup_message_effect;
            
            if (isCause && cause_followup && cause_followup !== undefined && cause_followup.length > 0) {
                return cause_followup;
            }
            else if (!isCause && effect_followup && effect_followup !== undefined && effect_followup.length > 0) {
                return effect_followup;
            }
            else {
                "Add more details about your activity in the past day to improve the quality of your results. Did you do something unique? Tell us more..."
            }
        }
    }
});

Template.gaFollowupModal.events({
    "click #submit-followup": function(event, instance) {
        let inst = Template.instance();

        let isCause = $('#followup-modal-' + inst.data.exp_id).data('isCause');
        let exp_id = Template.instance().data.exp_id;
        let user_id = Template.instance().data.user_id;
        let day = $('#followup-modal-' + inst.data.exp_id).data('day');

        let type = "cause";
        if (!isCause) {
            type = "effect";
        }

        let val = $("#followupMessageText-" + exp_id).val()
        Meteor.call("galileo.run.updateDataUserId", user_id, type, day, val, exp_id, function (err, result) {
            if (!err) {
                Materialize.toast("Thank you for submitting your data", 3000, "toast rounded");
            }
            else {
                console.log(err);
            }
        });

        $("#followup-modal-" + exp_id).modal('close');
        $("#followupMessageText-" + exp_id).val("")
    }
});