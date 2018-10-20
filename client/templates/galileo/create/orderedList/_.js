import "./_.jade";

Template.gaOrderedList.rendered = function() {

}

Template.gaOrderedList.onCreated(function() {
    var inst = Template.instance();
    var arr = inst.data.array;
    if (arr.get().length == 0) {
        arr.push(" ");
    }
});

Template.gaOrderedList.helpers({
    array: function() {
        return Template.instance().data.array.get().map((str, id) => {
            return {
                index: id,
                value: str
            };
        });
    },
    addDisabled: function() {
        var inst = Template.instance();
        var arr = inst.data.array.get();
        return arr[arr.length - 1].trim() == "";
    }
});

Template.gaOrderedList.events({
    "input .ordered-list-input": function(event, instance) {
        var $elem = $(event.currentTarget);
        var val = $elem.val();
        var id = $elem.attr("data-id");
        Template.instance().data.array.set(id, val);
    },
    "click .ordered-list-delete": function(event, instance) {
        var $elem = $(event.currentTarget);
        var $inputElem = $elem.siblings("input");
        var id = $inputElem.attr("data-id");
        var arr = Template.instance().data.array.get();
        arr.splice(id, 1);
        Template.instance().data.array.set(arr);
    },
    "click .ordered-list-add": function(event, instance) {
        var inst = Template.instance();
        var arr = inst.data.array.get();
        if (arr[arr.length - 1].trim() != "") {
            inst.data.array.push(" ");
        }
        return false;
    }
});