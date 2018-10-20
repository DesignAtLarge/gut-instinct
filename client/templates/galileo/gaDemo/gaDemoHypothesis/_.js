import './_.jade';

Template.gaDemoHypothesis.rendered = function() {};

Template.gaDemoHypothesis.onCreated(function() {
    this.proceedClicked = new ReactiveVar(false);
    this.proceedClicked2 = new ReactiveVar(false);
    this.proceedClicked3 = new ReactiveVar(false);
    this.nextDisabled = new ReactiveVar(true);
    this.backOnly = new ReactiveVar(true);

    focusOn("#hypothesis-intuition-input");
});

Template.gaDemoHypothesis.helpers({
    proceedClicked: function() {
        return Template.instance().proceedClicked.get();
    },
    proceedClicked2: function() {
        return Template.instance().proceedClicked2.get();
    },
    proceedClicked3: function() {
        return Template.instance().proceedClicked3.get();
    },
    hideProceed: function() {
        return Template.instance().proceedClicked.get() && Template.instance().data.intuition.get().trim() !== "";
    },
    hideProceed2: function() {
        return Template.instance().proceedClicked2.get();
    },
    hideProceed3: function() {
        return Template.instance().proceedClicked3.get()
    },
    hideImproveHypo: function() {
        return !Template.instance().proceedClicked2.get();
    },
    hideImproveMechanism: function() {
        return !Template.instance().proceedClicked3.get();
    },
    hideHypothesisForm: function() {
        return !Template.instance().proceedClicked.get() || Template.instance().data.intuition.get().trim() === "";
    },
    nextDisabled: function() {
        let related_works = Template.instance().data.related_works.get();
        return noHypothesis() || noMechanism() || related_works == undefined || related_works.trim() === "";
    },
    backOnly: function() {
        return Template.instance().backOnly.get();
    },
    noIntuition: function() {
        let inst = Template.instance();
        let intuition = inst.data.intuition.get();
        return !intuition || intuition.trim() === "";
    },
    hasIntuition: function() {
        let inst = Template.instance();
        let intuition = inst.data.intuition.get();
        return intuition && intuition.trim() !== "";
    },
    intuition: function() {
        return Template.instance().data.intuition.get();
    },
    cause: function() {
        return Template.instance().data.cause.get();
    },
    relation: function() {
        return Template.instance().data.relation.get();
    },
    effect: function() {
        return Template.instance().data.effect.get();
    },
    mechanism: function() {
        return Template.instance().data.mechanism.get();
    },
    related_works: function () {
        return Template.instance.data.related_works.get();
    },
    noHypothesis: function() {
        return noHypothesis();
    },
    noMechanism: function() {
        return noMechanism();
    },
    timeStamp: function() {
        return true;
    },
    type: function() {
        return "finishIntuition";
    },
    getDesignId: function() {
        return Template.instance().data.designId.get();
    },
    googleScholar: function() {
        let link = "https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q="
        if (Template.instance().data.cause.get() != undefined && Template.instance().data.relation.get() != undefined && Template.instance().data.effect.get() != undefined) {

            let cause_arr = Template.instance().data.cause.get().trim().split(" ");
            let relation_arr = Template.instance().data.relation.get().trim().split(" ");
            let effect_arr = Template.instance().data.effect.get().trim().split(" ");

            let arr = cause_arr.concat(relation_arr.concat(effect_arr));

            for (i = 0; i < arr.length-1; i++) {
                link = link + arr[i] + "+"
            }

            link = link + arr[arr.length-1] + "&btnG="

            return link;
        }
    },
    /*  Example Stage format
    3: Measure Cause
    0-0-0
    ^
    The Current Step its on

    0-0-0
      ^
      The 1st position or y position

    0-0-0
        ^
        The 2nd position or x position
    */
    getExamples: function(exampleStage) {
        let mendel = localStorage.mendelcode_ga;

        // TODO: shift this logic to server call later
        if (mendel === undefined) {
            mendel = "DEFAULT";
        }

        let rawExamples = Template.instance().data.examples.get();
        if (rawExamples === undefined) {
            return "";
        }

        let fetchedData = rawExamples.filter((obj) => obj.stage_id === exampleStage);
        let fetchedData1 = fetchedData.filter((obj) => obj.mendel_code === mendel);
        if (fetchedData1 && fetchedData1.length > 0) {
            return fetchedData1[0].data;
        } else {
            // if mendel not found, return default
            return fetchedData.filter((obj) => obj.mendel_code === "DEFAULT")[0].data;
        }
    },
});

Template.gaDemoHypothesis.events({
    'show .card-frame': function() {

        // Cache the instance
        let inst = Template.instance();

        // First load intuition from data if exists
        let intuition = inst.data.intuition.get();
        if (intuition) {
            $("#hypothesis-intuition-input").val(intuition);
            $("#hypothesis-intuition-input").trigger("input");
            $("#hypothesis-intuition-btn").trigger("click");
        }
    },
    'click #hypothesis-badExamples-btn': function(event, instance) {
        $('#hypothesis-badExamples-div').removeClass('hide');
    },
    'input #hypothesis-intuition-input': function(event, instance) {
        instance.data.intuition.set($(event.target).val());
    },
    'input #hypothesis-input-related-works' : function(event, instance) {
        instance.data.related_works.set($(event.target).val());
    },
    'input #hypothesis-input-cause': function(event, instance) {
        let text = $(event.target).val();
        if (text.length === 1) {
            text = text.toUpperCase()
        }
        instance.data.cause.set(text);
    },
    'input #hypothesis-input-reln': function(event, instance) {
        instance.data.relation.set($(event.target).val());
    },
    'input #hypothesis-input-effect': function(event, instance) {
        instance.data.effect.set($(event.target).val());
    },
    'input #hypothesis-input-mechanism': function(event, instance) {
        instance.data.mechanism.set($(event.target).val());
    },
    'click #hypothesis-intuition-btn': function(event, instance) {

        // Click the button
        instance.proceedClicked.set(true);

        scrollTo('.hypothesis-format');

        focusOn('#hypothesis-input-cause');
        let username = Meteor.user().username;
        console.log("before create username:  " + username);
        console.log("vineet");

        // If there's no expId then create a new experiment
        if (!instance.data.expId.get()) {
            let intuition = instance.data.intuition.get().trim();
            let mendel = localStorage.mendelcode_ga;
            Meteor.call("galileo.experiments.create", intuition, username, mendel, function(err, result) {
                if (!err) {

                    // Set design and experiment id
                    instance.data.designId.set(result.designId);
                    instance.data.expId.set(result.expId);

                    // Save experiment progress
                    Meteor.call("galileo.experiments.setDesignProgress", result.expId, instance.data.cardId);

                    // Update the URL so that if the user refresh they will go to the same step
                    window.history.pushState({}, "", "/galileo/createdemo?expid=" + result.expId);
                }
            });
        }
    },
    'click #hypothesis-improve-btn': function(event, instance) {
        instance.proceedClicked2.set(true);
        instance.backOnly.set(false);
        scrollTo('.improve-hypothesis');
        focusOn('#hypothesis-input-mechanism');
        $("#mechanism-container").addClass('glow');
    },
    'click #mechanism-improve-btn': function(event, instance) {
        instance.proceedClicked3.set(true);
        instance.backOnly.set(false);
        scrollTo('.improve-mechanism');
        focusOn('#hypothesis-input-related-works');
        $("#mechanism-container").removeClass('glow');
        $("#related-works-container").addClass('glow');
    },
    'click .next-action': function(event, instance) {

        // Cache the design id
        let designId = instance.data.designId.get();

        // First get all the input data
        let intuition = instance.data.intuition.get().trim();
        let cause = instance.data.cause.get().trim();
        let relation = instance.data.relation.get().trim();
        let effect = instance.data.effect.get().trim();
        let mechanism = instance.data.mechanism.get().trim();
        let related_works = instance.data.related_works.get().trim()

        // Then update the database
        Meteor.call("galileo.experiments.design.setIntuition", designId, intuition, function(err, result) {
            if (err) throw new Error(err);
        });
        Meteor.call("galileo.experiments.design.setHypothesis", designId, cause, relation, effect, mechanism, related_works, function(err, results) {
            if (err) throw new Error(err);
        });

        $("#related-works-container").removeClass('glow');
    },
    'change .check': function(event) {

        let checked1 = $('#cause-specific-check').is(":checked");
        let checked2 = $('#effect-specific-check').is(":checked");
        let checked3 = $('#relation-defined-check').is(":checked");
        let checked4 = $('#mechanism-defined-check').is(":checked");
        let nextDisabled = !checked1 || !checked2 || !checked3 || !checked4;
        Template.instance().nextDisabled.set(nextDisabled);
    },
    'click #edit-hypothesis-1': function() {
        // scrollTo('.hypothesis-format');
        $('html, body').animate({
            scrollTop: $('.hypothesis-format').offset().top - 100
        }, 500);

        focusOn('#hypothesis-input-cause');
    }
});

function scrollTo(element) {
    // calling with timeout 0 beause we need to wait until element is visible
    setTimeout(function() {
        $('html, body').animate({
            scrollTop: $(element).offset().top - 100
        }, 500)
    }, 0);
}

function focusOn(element) {
    // calling with timeout 0 beause we need to wait until element is visible
    setTimeout(function() {
        $(element).focus();
    }, 0);
}

function noHypothesis() {
    let inst = Template.instance();
    let c = inst.data.cause.get();
    let r = inst.data.relation.get();
    let e = inst.data.effect.get();
    return !c || !r || !e || c.trim() === "" || r.trim() === "" || e.trim() === "";
}

function noMechanism() {
    let inst = Template.instance();
    let mech = inst.data.mechanism.get();

    return !mech || mech.trim() === "";
}