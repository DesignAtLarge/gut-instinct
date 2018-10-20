import './_.jade';

Template.gaDiscussionModal.rendered = function() {};

Template.gaDiscussionModal.onCreated(function() {
    // Needed for Material tabs
    $(document).ready(function() {
        $('ul.tabs').tabs();
    });
    let inst = this;
    this.participation = new ReactiveVar();
    this.myPaticipateExp = new ReactiveVar(undefined);

    let start = true;

    setInterval(function() {
        let x = $("#discussion-modal")[0].attributes['exp_id']
        if (x != undefined) {
            x = x.value;
            Meteor.call("galileo.experiments.getExperiment", x, function(err, resultExp) {
                if (err) {
                    console.log("still runnning")
                }
                //console.log("my participating exp in meteor call: " + JSON.stringify(resultExp));
                if (resultExp) {
                    inst.myPaticipateExp.set(resultExp);
                }
            });

        }
    }, 1000);
});


Template.gaDiscussionModal.helpers({
    getDiscussion: function() {
        let exp = Template.instance().myPaticipateExp.get();
        if (exp == undefined) {
            return;
        }
        let expClarification = exp.discussion;
        if (expClarification && expClarification !== undefined) {
            return expClarification;
        }
    },
    getExpCreatorId: function() {
        let exp = Template.instance().myPaticipateExp.get();
        if (exp == undefined) {
            return;
        }
        return exp.user_id;
    },
});

Template.gaDiscussionModal.events({
    'click .comment': function(event, inst) {
        let index = parseInt(event.currentTarget.attributes.index.value);
        let message = $("#textarea-discussion-" + index).val().trim();


        if (message.length > 0) {
            $("#textarea-discussion-" + index).val("");

            Meteor.call("galileo.experiments.addDiscusionComment", Template.instance().myPaticipateExp.get()._id, Meteor.user(), index, message);
        } else {
            Materialize.toast("Please add more details to your comment", 4000);
        }
    },

    'click #newThread': function(event, inst) {
        let message = $("#textarea-new-thread").val().trim();
        if (message.length > 0) {
            $("#textarea-new-thread").val("");

            Meteor.call("galileo.experiments.addDiscusionThread", Template.instance().myPaticipateExp.get()._id, Meteor.user(), message);
        } else {
            Materialize.toast("Please add more details to your new discussion thread", 4000);
        }
    },
});