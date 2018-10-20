import './_.jade';

Template.gaWhyCareModal.rendered = function() {};

Template.gaWhyCareModal.onCreated(function() {
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


Template.gaWhyCareModal.helpers({
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

Template.gaWhyCareModal.events({
    'input .why-care-questions': function(event) {
        let minLength = 5;
        let shouldDisplay = $("#why-care-first-question").val().trim().length > minLength && $("#why-care-second-question").val().trim().length > minLength && $("#why-care-third-question").val().trim().length > minLength;
        if (shouldDisplay) {
            console.log("setting button status to true");
            $("#save-whyCare-btn").removeClass("disabled");
        } else {
            $("#save-whyCare-btn").addClass("disabled");
        }
    },
    'click #save-whyCare-btn': function() {

        // Meteor.call("galileo.experiments.updateShareInfo", Template.instance().expId.get(), $("#share-info-first-question").val(), $("#share-info-second-question").val(), $("#share-info-third-question").val());
        Materialize.toast('Your answers have been saved!', 3000, 'toast rounded');
    }
});
