import "./_.jade";

Template.gaMeSidebar.rendered = function() {
    $("a[href='" + window.location.pathname + "']").addClass("active");
    $("a[data-href='" + window.location.pathname + "']").addClass("active");

    $(document).ready(function() {
        $('.tooltipped').tooltip({
            delay: 50
        });
    });

};

Template.gaMeSidebar.onCreated(function() {
    let inst = this;
    this.showPilot = new ReactiveVar(false);
    this.isLoaded = new ReactiveVar(false);
    this.unfinishedExps = new ReactiveVar(0);
    this.createdExps = new ReactiveVar(0);
    this.reviewingExps = new ReactiveVar(0);
    this.participatingExps = new ReactiveVar(0);
    this.completedExps = new ReactiveVar(0);
    this.ongoingExps = new ReactiveVar(0);
    this.readyToRunExps = new ReactiveVar(0);
    this.underReviewExps = new ReactiveVar(0);

    Meteor.call('galileo.profile.getExperimentStatsSidebar', function(err, result) {
        inst.unfinishedExps.set(result['unfinishedExps']);
        inst.createdExps.set(result['createdExps']);
        inst.reviewingExps.set(result['reviewingExps']);
        inst.participatingExps.set(result['participatingExps']);
        inst.completedExps.set(result['completedExps']);
        inst.ongoingExps.set(result['ongoingExps']);
        inst.readyToRunExps.set(result['readyToRunExps']);
        inst.underReviewExps.set(result['underReviewExps'])


        inst.isLoaded.set(true);
    })
});

Template.gaMeSidebar.helpers({
    "showPilot": function() {
        return Template.instance().showPilot.get();
    },
    "isLoaded": function() {
        return Template.instance().isLoaded.get();
    },
    "showUnfinishedExps": function() {
        return Template.instance().unfinishedExps.get() > 0;
    },
    "showCreatedExps": function() {
        return Template.instance().createdExps.get() > 0;
    },
    "showReviewingExps": function() {
        return Template.instance().reviewingExps.get() > 0;
    },
    "showParticipatingExps": function() {
        return Template.instance().participatingExps.get() > 0;
    },
    "showCompletedExps": function() {
        return Template.instance().completedExps.get() > 0;
    },
    "showOngoingExps": function() {
        return Template.instance().ongoingExps.get() > 0;
    },
    "showReadyToRunExps": function() {
        return Template.instance().readyToRunExps.get() > 0;
    },
    "showUnderReviewExps": function() {
        return Template.instance().underReviewExps.get() > 0;
    },
    "unfinishedExps": function() {
        return Template.instance().unfinishedExps.get();
    },
    "createdExps": function() {
        return Template.instance().createdExps.get();
    },
    "reviewingExps": function() {
        return Template.instance().reviewingExps.get();
    },
    "participatingExps": function() {
        return Template.instance().participatingExps.get();
    },
    "completedExps": function() {
        return Template.instance().completedExps.get();
    },
    "ongoingExps": function() {
        return Template.instance().ongoingExps.get();
    },
    "readyToRunExps": function() {
        return Template.instance().readyToRunExps.get();
    },
    "underReviewExps": function() {
        return Template.instance().underReviewExps.get();
    }
});

Template.gaMeSidebar.events({
    "click #hide": function(event, instance) {
        $("#ga-sidebar").addClass('hide');
        $("#ga-me-main").css("width", "100%")
        $("#ga-me-main").css("margin-left", "0px");
        $("#show").removeClass('hide');
        $("#hide").addClass('hide')
    },
    "click #show" : function (event, instance) {
        $("#ga-sidebar").removeClass('hide');
        $("#ga-me-main").css("width","");
        $("#ga-me-main").css("margin-left","");
        $("#hide").removeClass('hide');
        $("#show").addClass('hide')
    },
    "click #logout": function(event) {
        if (confirm("Are you sure you want to log out? You can just close the tab and open it later without having to log back in.")) {
            window.location.href = "/logout";
        }
    },
    // "click .help": function (event) {
    //     let $btn = $(event.currentTarget);
    //     let $target = $("#" + $btn.attr("data-target"));
    //
    //     if($target.hasClass('hide')) {
    //         // hide all
    //         $('.help-target').addClass('hide');
    //         // show only current target
    //         $target.removeClass('hide');
    //     }
    //     else {
    //         $target.addClass('hide');
    //     }
    //
    //     event.stopPropagation();
    // },
    "click .explist-a": function(event) {
        let $a = $(event.currentTarget);
        window.location.href = $a.attr("data-href");
    },

    "mouseenter .more-info": function(event) {
        let $a = $(event.currentTarget);
        let target = "#" + $a.attr("data-target");
        $(target).css({
            "display": "inline"
        })
    },

    "mouseleave .more-info": function(event) {
        let $a = $(event.currentTarget);
        let target = "#" + $a.attr("data-target");
        $(target).css({
            "display": "none"
        })
    },
    "click #ongoing-exp-btn": function(event) {
        let id = localStorage.getItem("galileo_ongoingexp_id");
        if (id == null) {
            alert("You don't have any ongoing experiment :(");
            window.location.href = "/galileo/me/dashboard";

            // return;
        } else {
            window.location.href = "/galileo/me/experiment/" + id + "/info";
        }
    },
    "click #underReview-exp-btn": function() {
        window.location.href = "/galileo/me/dashboard";
    },
    "click #readyToRun-exp-btn": function() {
        window.location.href = "/galileo/me/dashboard";
    },
    "click #completed-exp-btn": function() {
        window.location.href = "/galileo/me/dashboard";
    },
});