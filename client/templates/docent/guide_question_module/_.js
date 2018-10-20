import './_.jade';

Template.guide_question_module.onCreated(function() {
    this.tag_editable = new ReactiveVar(false);
    this.tags = new ReactiveArray();
    this.first = new ReactiveVar(false);
});

Template.guide_question_module.rendered = function() {

    try {
        if (Meteor.user()) {
            const toured = Meteor.user().profile.toured.guide_question_module;
            if (!toured) {
                introJs().setOption('showProgress', true).onchange(function(target) {
                    Meteor.users.update(Meteor.userId(), {
                        $set: {
                            'profile.toured.guide_question_module': true
                        }
                    });
                }).start();
            }
        } else {
            console.log("Meteor user not created yet!");
        }
    } catch (e) {}


}

Template.guide_question_module.helpers({
    isIntroCompleted: function() {
        try {
            if (Meteor.user()) {
                const intro_completed = Meteor.user().profile.intro_completed;
                //console.log("intro_completed check in isintrocompleted is " + intro_completed);
                //alert("hanging in");
                return intro_completed;
            } else {
                console.log("Meteor user not created yet!");
            }
        } catch (e) {}
    },
});

Template.guide_question_module.events({
    'click .yes-radio': function(event) {
        var targetReasonID = this.index + "-reason";
        $("#" + targetReasonID).attr("placeholder", "This is a good question because");
    },
    'click .no-radio': function(event) {
        var targetReasonID = this.index + "-reason";
        $("#" + targetReasonID).attr("placeholder", "This is not a good question because");
    }
});