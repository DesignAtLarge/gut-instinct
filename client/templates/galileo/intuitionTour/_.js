import './_.jade';

var requireIntuitionAmount = 3;

Template.gaIntuition.rendered = function() {
    // $('head').append('<script type="text/javascript">(function() {var s = document.createElement("script");s.type = "text/javascript";s.async = true;s.src = "//api.usersnap.com/load/"+"cc169915-34b6-4265-a3a6-9c5e7578f37e.js";var x = document.getElementsByTagName("script")[0];x.parentNode.insertBefore(s, x);})();</script>');
    $('.collapsible').collapsible();
    $("#curr-intuition-amount").html(requireIntuitionAmount);
}

Template.gaIntuition.onCreated(function() {

    var inst = this;

    this.intuitions = new ReactiveArray();
    this.sampleTopics = new ReactiveArray();

    this.startTime = new Date();

    Meteor.call("galileo.intuition.getFirstThreeIntuitions", function(err, ints) {
        inst.intuitions.set(ints);
    });

    Meteor.call("galileo.intuition.getTopics", function(err, topics) {
        inst.sampleTopics.set(topics)
    });
});

Template.gaIntuition.helpers({
    intuitions: function() {
        return Template.instance().intuitions.get();
    },
    amountRemaining: function() {
        return Math.max(0, requireIntuitionAmount - Template.instance().intuitions.get().length);
    },
    completed: function() {
        return Template.instance().intuitions.get().length >= requireIntuitionAmount;
    },
    sampleTopics: function() {
        return Template.instance().sampleTopics.get();
    },
    hasSampleTopics: function() {
        return Template.instance().sampleTopics.length() > 0;
    },
    nextDisabled: function() {
        return Template.instance().intuitions.get().length < requireIntuitionAmount;
    }
});

Template.gaIntuition.events({
    "click .info-mark": function(event) {
        var $elem = $(event.currentTarget);
        var $target = $("#" + $elem.attr("data-target"));
        $target.slideToggle();
    },
    'click #intuition-Examples-btn': function(event, instance) {
        // $('#hypothesis-badExamples-btn').addClass('hide');
        $('#intuition-Examples-div').removeClass('hide');
    },
    'submit #intuition-input-form': function(event, instance) {

        // First cache the instance
        var inst = Template.instance();

        var intuition = $("#intuition-input").val();
        var tags = $("#intuition-tags").val();
        var mechanism = $("#intuition-mechanism").val();
        if (intuition.length <= 10) {
            Materialize.toast("Your intuition has to be at least 10 characters long", 4000, 'toast');
        } else if (tags.split("#").length == 0) {
            Materialize.toast("Please provide at least one tag", 4000, 'toast');
        } else if (mechanism.length <= 10) {
            Materialize.toast("Your mechanism has to be at least 10 characters long", 4000, 'toast');
        } else {
            Meteor.call("galileo.intuition.hasIntuition", intuition, function(err, has) {
                if (err) {
                    alert("Server Connection Error");
                }
                if (has) {
                    Materialize.toast("This intuition is already existed", 4000, 'toast');
                } else {
                    Meteor.call("galileo.intuition.addIntuition", intuition, tags, mechanism, function(err, result) {
                        if (err) {
                            alert("Server Connection Error");
                        } else {
                            if (result) {

                                $("#intuition-input").val("");
                                $("#intuition-tags").val("");
                                $("#intuition-mechanism").val("");

                                inst.intuitions.push({
                                    "intuition": intuition,
                                    "tags": tags.split("#").map(str => str.trim()).filter(str => str != ""),
                                    "mechanism": mechanism
                                });

                                if (inst.intuitions.length() >= requireIntuitionAmount) {
                                    var timeDiff = (new Date()).getTime() - inst.startTime.getTime();
                                    Meteor.call("galileo.profile.setIntuitionTime", timeDiff);
                                    Meteor.call("galileo.tour.finishIntuition");
                                }
                            } else {
                                Materialize.toast("Add intuition failed. Please try again later", 4000, 'toast');
                            }
                        }
                    });
                }
            });
        }
        return false;
    },
    'click .galileo-topic': function(event) {
        var li = $(event.currentTarget);
        li.children("ol").slideToggle(500);
    }
})