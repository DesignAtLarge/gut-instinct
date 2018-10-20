import './_.jade';

Template.gaEmailDropdown.rendered = function() {
    $('select').material_select();
    $('.dropdown-button').dropdown({
        // inDuration: 300,
        // outDuration: 225,
        constrainWidth: false, // Does not change width of dropdown to that of the activator
        //hover: true, // Activate on hover
        // gutter: 0, // Spacing from edge
        alignment: 'right', // Displays drop down with edge aligned to the left of button
        stopPropagation: true // Stops event propagation
    });

};

Template.gaEmailDropdown.onCreated(function() {
    this.causePrevTimeDisabled = new ReactiveVar(undefined);
    this.effectPrevTimeDisabled = new ReactiveVar(undefined);
    if (Template.instance().data.id === "thank-email") {
        localStorage.setItem("sendTo", "missingDataYesterday");
    } else {
        localStorage.setItem("sendTo", "allPart");
    }
});

Template.gaEmailDropdown.helpers({});

Template.gaEmailDropdown.events({
    'click .frequency-dropdown-option': function(event, instance) {
        let labelId = '#' + this.id;
        let textId = '#frequency-text-' + this.id;
        let $label = $(labelId);
        $label.removeClass('hide');
        $label.removeClass("unchosen");
        $label.trigger("select");
        $label.text(event.target.innerText);
        $label.attr("data-value", $(event.target).attr("data-value"));
        $(textId).addClass('hide');

        let currDropDown = Template.instance().data.id;
        let causePrevTimeDisabled = Template.instance().causePrevTimeDisabled.get();
        let effectPrevTimeDisabled = Template.instance().effectPrevTimeDisabled.get();
        let dataValue = $label.attr("data-value");

        if (currDropDown === 'reminder-email') {
            disableTime(dataValue, causePrevTimeDisabled);
            Template.instance().causePrevTimeDisabled.set(dataValue);

        } else if (currDropDown === 'thank-email') {
            disableTime(dataValue, effectPrevTimeDisabled);
            Template.instance().effectPrevTimeDisabled.set(dataValue);
        }

        try {
            Template.instance().data.time.set(dataValue);
        } catch (err) {}

        if (dataValue === "0") {
            localStorage.setItem("sendTo", "missingDataYesterday");
        } else if (dataValue === "1") {
            localStorage.setItem("sendTo", "hasDataYesterday");
        } else if (dataValue === "2") {
            localStorage.setItem("sendTo", "missingDataToday");
        } else if (dataValue === "3") {
            localStorage.setItem("sendTo", "hasDataToday");
        } else {
            localStorage.setItem("sendTo", "allPart");
        }
    },

    'click .dropdown-div': function(event, instance) {
        // if text box is visible, clicking on div should do nothing
        let textId = '#frequency-text-' + this.id;
        if ($(textId).is(":visible")) {
            return;
        }
        let buttonId = '#dropdown-button-' + this.id;
        $(buttonId).dropdown('open');
        console.log("you click div of dropdown");
    }
});

function disableTime(dataValue, prevDisabled) {
    let list = document.querySelectorAll(".frequency-dropdown-option");
    list.forEach(function(element) {
        let value = element.getAttribute('data-value');
        if (value === dataValue) {
            element.classList.add('disabled');
        }

        if (value === prevDisabled) {
            element.classList.remove('disabled');
        }
    });

}