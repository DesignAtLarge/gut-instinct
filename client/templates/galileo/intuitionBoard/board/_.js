import './_.jade'

Template.gaIntuitionBoard.rendered = function() {

}

Template.gaIntuitionBoard.onCreated(function() {

    var self = this;

    this.intuitions = new ReactiveArray();
    Meteor.call("galileo.intuition.getIntuitions", function(err, result) {
        if (err) {
            alert("Server Connection Error")
        } else {
            self.intuitions.set(result);
        }
    });

    this.tags = new ReactiveArray();
    this.filter = new ReactiveVar(undefined);
    Meteor.call("galileo.intuition.getIntuitionTags", function(err, result) {
        if (err) {

        } else {
            self.tags.set(result);
        }
    });

    this.showStep = new ReactiveVar(true);
    Meteor.call("galileo.tour.isTouring", function(err, is) {
        self.showStep.set(is);
    });
});

Template.gaIntuitionBoard.helpers({
    showStep: function() {
        return Template.instance().showStep.get();
    },
    intuitions: function() {
        var inst = Template.instance();
        var intuitions = inst.intuitions.get();
        if (intuitions) {
            var filter = inst.filter.get();
            if (filter) {
                return intuitions.filter((intuition) => {
                    if (intuition.tags && intuition.tags instanceof Array) {
                        return intuition.tags.indexOf(filter) != -1;
                    } else {
                        return false;
                    }
                });
            } else {
                return intuitions;
            }
        } else {
            return [];
        }
    },
    tags: function() {
        return Template.instance().tags.get();
    },
    hasIntuition: function() {
        return Template.instance().intuitions.get().length > 0;
    }
});

Template.gaIntuitionBoard.events({
    "click .intuition-header": function() {

    },
    "click .add-intuition-btn": function(event) {
        var $elem = $(event.currentTarget);
        $elem.find("i").toggleClass("fa-rotate-180");
        $elem.siblings(".add-intuition-form").slideToggle();
    },
    "click .filter-tag": function(event) {
        var $tag = $(event.currentTarget);
        $tag.toggleClass("active").siblings(".tag").removeClass("active");
        if ($tag.hasClass("active")) {
            Template.instance().filter.set($tag.text());
        } else {
            Template.instance().filter.set(undefined);
        }
    },
    'submit .add-intuition-form': function(event, instance) {

        // First cache the instance
        var inst = Template.instance();
        var $form = $(event.currentTarget);
        var id = $form.attr("id");
        var idls = id.split("-");
        var num = idls[idls.length - 1];

        var intuition = $("#intuition-input-" + num).val();
        var tags = $("#intuition-tags-" + num).val();
        var mechanism = $("#intuition-mechanism-" + num).val();
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

                    $("#intuition-input-btn-" + num).addClass("disabled");

                    Meteor.call("galileo.intuition.addIntuition", intuition, tags, mechanism, function(err, result) {
                        if (err) {
                            alert("Server Connection Error");
                        } else {
                            if (result) {

                                $("#intuition-input-" + num).val("");
                                $("#intuition-tags-" + num).val("");
                                $("#intuition-mechanism-" + num).val("");

                                window.location.reload();
                            } else {
                                $("#intuition-input-btn-" + num).removeClass("disabled");
                                Materialize.toast("Add intuition failed. Please try again later", 4000, 'toast');
                            }
                        }
                    });
                }
            });
        }
        return false;
    },
});