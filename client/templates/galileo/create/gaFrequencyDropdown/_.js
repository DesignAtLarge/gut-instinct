import './_.jade';

Template.gaFrequencyDropdown.rendered = function() {
    $('select').material_select();
    $('.dropdown-button').dropdown({
        // inDuration: 300,
        // outDuration: 225,
        constrainWidth: false, // Does not change width of dropdown to that of the activator
        //hover: true, // Activate on hover
        // gutter: 0, // Spacing from edge
        alignment: 'right', // Displays dropdown with edge aligned to the left of button
        stopPropagation: true // Stops event propagation
    });

};

Template.gaFrequencyDropdown.onCreated(function() {});

Template.gaFrequencyDropdown.helpers({});

Template.gaFrequencyDropdown.events({
    'click .frequency-dropdown-option': function(event, instance) {
        let labelId = '#frequency-label-' + this.id;
        let textId = '#frequency-text-' + this.id;

        $(labelId).removeClass('hide');
        $(labelId).removeClass("unchosen");
        $(textId).addClass('hide');
        $(labelId).text(event.target.innerText);
    },

    'click .frequency-dropdown-option-custom': function(event, instance) {
        let labelId = '#frequency-label-' + this.id;
        let textId = '#frequency-text-' + this.id;
        $(labelId).addClass('hide');
        $(textId).removeClass('hide');
    },

    'click .dropdown-div': function(event, instance) {
        // if text box is visible, clicking on div should do nothing
        let textId = '#frequency-text-' + this.id;
        if ($(textId).is(":visible")) {
            return;
        }

        let buttonId = '#dropdown-button-' + this.id;
        $(buttonId).dropdown('open');
    }
});