import './_.jade';

Template.gaCompensatePeopleModal.rendered = function() {};

Template.gaCompensatePeopleModal.onCreated(function() {
    // Needed for Material tabs
    $(document).ready(function() {
        $('ul.tabs').tabs();
    });
    let inst = this;
    this.first = new ReactiveVar("");
    this.second = new ReactiveVar("");
    this.third = new ReactiveVar("");
    this.exp = new ReactiveVar();
    this.expId = new ReactiveVar();
    if (this.data.expId) {
        Meteor.call("galileo.experiments.getExperimentByExpId", this.data.expId.get(), function(err, exp) {
            if (err) {
                console.log(err);
            }
            inst.exp.set(exp);
            inst.expId.set(exp._id);
        })
    }
});


Template.gaCompensatePeopleModal.helpers({
    hasFirstShareInfo: function() {
        let exp = Template.instance().exp.get();
        if (exp && exp.shareInfo) {
            return exp.shareInfo["who are you"];
        }
    },
    hasSecondShareInfo: function() {
        let exp = Template.instance().exp.get();
        if (exp && exp.shareInfo) {
            return exp.shareInfo["what world would learn"];
        }
    },
    hasThirdShareInfo: function() {
        let exp = Template.instance().exp.get();
        if (exp && exp.shareInfo) {
            return exp.shareInfo["expected time"];
        }
    },
});

Template.gaCompensatePeopleModal.events({
    'input .compensate-ppl-questions': function(event) {
        let minLength = 5;
        let shouldDisplay = $("#compensate-ppl-first-question").val().trim().length > minLength && $("#compensate-ppl-second-question").val().trim().length > minLength && $("#compensate-ppl-third-question").val().trim().length > minLength;
        if (shouldDisplay) {
            console.log("setting button status to true");
            $("#save-compensatePpl-btn").removeClass("disabled");
        } else {
            $("#save-compensatePpl-btn").addClass("disabled");
        }
    },
    'click #save-compensatePpl-btn': function() {

        // Meteor.call("galileo.experiments.updateShareInfo", Template.instance().expId.get(), $("#share-info-first-question").val(), $("#share-info-second-question").val(), $("#share-info-third-question").val());
        Materialize.toast('Your answers have been saved!', 3000, 'toast rounded');
    }
});
