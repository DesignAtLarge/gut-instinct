import "./_.jade";

Template.fileUploadBtn.rendered = function() {
    initiate(this.data.id);
}

Template.fileUploadBtn.events({
    "initiate input": function(event) {
        initiate(Template.instance().data.id);
    }
});

function initiate(id) {

    // First cache all the elements
    var $input = $("#" + id);
    var $outer = $input.parent();

    // Get the size
    var height = $outer.outerHeight();
    var width = $outer.outerWidth();
    var horpad = (width - $outer.width()) / 2;

    // Set the sizes
    $input.css({
        "margin-left": -horpad,
        "margin-top": -height,
        "height": height,
        "width": width
    });
}