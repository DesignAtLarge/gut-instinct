import './_.jade';

Template.textModal.rendered = function() {
    $(document).ready(function() {
        $('.modal').modal();
    });
};

Template.textModal.onCreated(function() {});

Template.textModal.helpers({});


Template.textModal.events({
    "keyup .textarea-sms": function(event, instance) {
        let element = $(".textarea-sms");
        if (parseInt(element.height()) < 485) {
            element[0].style.height = "5px";
            if (parseInt(element[0].scrollHeight + 3) < 485) {
                element[0].style.height = (element[0].scrollHeight + 3) + "px";
            } else {
                element[0].style.height = "485px";
            }
        }
    },
    "click #cancel": function() {
        $(".modal").modal('close');
    },
    "click .changeMessage": function(event, instance) {
        $("#" + instance.data.id + "-text").text($("#" + instance.data.id)[0].value);
        $(".modal").modal('close');
    }
});