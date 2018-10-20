import './_.jade';

Template.checklist.rendered = function() {};


Template.checklist.onCreated(function() {
    this.checklistItems = Template.parentData(0).checklistItems;
});


Template.checklist.helpers({
    checklistItems: function() {
        return Template.instance().checklistItems.get();
    },
});

Template.checklist.events({
    'click .option-add': function(event, instance) {
        let id = $(event.currentTarget).attr('id');
        let index = parseInt(id.split('-')[3]);

        let options = Template.instance().checklistItems.get();

        let newItem = optionDict(index);
        options.splice(index, 0, newItem);

        for (let i = index; i < options.length; i++) {
            let o = options[i];
            o.id += 1;
        }

        // setting new option to array
        Template.instance().checklistItems.set(options);
        setTimeout(function() {
            $('#option-input-' + id.split('-')[2] + '-' + (index + 1)).focus();
        }, 100);

    },

    'click .option-delete': function(event) {
        let options = Template.instance().checklistItems.get();
        if (options.length <= 1)
            return;

        let optionId = event.currentTarget.id.split('-')[3];
        let index = findIndexOfOptionId(optionId);

        // create new options array with removed option
        options.splice(index, 1);
        for (let i = index; i < options.length; i++) {
            let o = options[i];
            o.id -= 1;
        }

        // set reduced options array to reactive array
        Template.instance().checklistItems.set(options);
    },

    'change .option-input': function(event) {
        // called when some change happens in text input, and then user leaves the element
        let options = Template.instance().checklistItems.get();
        let optionId = event.currentTarget.id.split('-')[3];
        let index = findIndexOfOptionId(optionId);
        options[index].text = event.target.value.trim();

        // set reduced options array to reactive array
        Template.instance().checklistItems.set(options);
    },
});


function optionDict(id, text = '') {
    return {
        'id': id,
        'checked': false,
        'text': text,
        'placeholder': "Add details here"
    }
}


function findIndexOfOptionId(id) {
    // converting to int before comparison
    id = parseInt(id);

    let options = Template.instance().checklistItems.get();
    for (let i = 0; i < options.length; i++) {
        if (options[i].id === id) {
            return i;
        }
    }
    return -1;
}