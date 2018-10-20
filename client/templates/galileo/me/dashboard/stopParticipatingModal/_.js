import './_.jade';

Template.gaStopParticipatingModal.rendered = function() {};

Template.gaStopParticipatingModal.onCreated(function() {
    // Needed for Material tabs
    $(document).ready(function() {
        $('ul.tabs').tabs();
    });
    let inst = this;
    this.participation = new ReactiveVar();
    this.myPaticipateExp = new ReactiveVar(undefined);
    Meteor.call("galileo.experiments.getParticipatingExpByUser", Meteor.userId(), function(err, resultExp) {
        if (err) {
            throw err;
        }
        //console.log("my participating exp in meteor call: " + JSON.stringify(resultExp));
        if (resultExp) {
            inst.myPaticipateExp.set(resultExp);
            inst.participation.set(resultExp.pResult);
        }
    });
});


Template.gaStopParticipatingModal.helpers({
    getClarifications: function() {
        let exp = Template.instance().myPaticipateExp.get();
        if (exp == undefined) {
            return;
        }
        let expClarification = exp.clarification;
        return expClarification;
    },
    getExpCreatorId: function() {
        let exp = Template.instance().myPaticipateExp.get();
        if (exp == undefined) {
            return;
        }
        return exp.user_id;
    },
    getExpId: function() {
        let exp = Template.instance().myPaticipateExp.get();
        if (exp == undefined) {
            return;
        }
        return exp._id;
    }
});

Template.gaStopParticipatingModal.events({
    'click #stop-participating-btn': function(event) {
        let expCreatorId = $(event.target).attr("exp-creator-id");
        let content = $("#stop-participating-input").val().trim();
        let targetExpID = $(event.target).attr("exp-id");
        // participant ask question so that the email receicer is exp creator
        // console.log("experiment creator id: " + expCreatorId);
        // console.log("adding clarification content: " + content);
        // console.log("adding clarification index: " + index);
        // console.log("adding clarification targetExpID: " + targetExpID);
        if (content.length <= 10) {
            event.preventDefault();
            Materialize.toast("You have to provide more words", 3000, "toast rounded");
        } else {
            Meteor.call('galileo.experiments.stopParticipating', Meteor.userId(), targetExpID, content);

            // Notify the creator that someone has droppped the experiment
            Meteor.call('galileo.notification.sendStopParticipationNoticeEmail', expCreatorId, targetExpID, content);
            Materialize.toast("Successfully Stopped Participating", 3000, "toast rounded");
        }
    }
});
