import './_.jade'

Template.exampleLayout.events({
    'click .example-header': function(event) {
        let target = $(event.currentTarget);
        target.children(".fa").toggleClass("fa-rotate-180");
        target.siblings(".example-body").slideToggle(200);
    }
});

Template.exampleLayoutNotHidden.events({
    'click .example-header': function(event) {
        let target = $(event.currentTarget);
        target.children(".fa").toggleClass("fa-rotate-180");
        target.siblings(".example-body").slideToggle(200);
    }
});