import './_.jade';


Template.gaEntrance.rendered = function() {

};

Template.gaEntrance.onCreated(function() {

    let inst = this;
    this.board = new ReactiveVar(undefined);
    this.isLoading = new ReactiveVar(true);
    Meteor.call("galileo.boards.getBoardsWithStats", function(err, resp) {
        inst.isLoading.set(false);
        if (err) {
            console.log(err);
        }
        inst.board.set(resp);
        $("title").html("Galileo | Beta");
    });
});

Template.gaEntrance.helpers({
    isLoading: function() {
        return Template.instance().isLoading.get();
    },
    getBoard: function() {
        console.log("boards are: " + JSON.stringify(Template.instance().board.get()));
        return Template.instance().board.get();
    },
    boardInfo(mendel) {
        return mendel + "INFO";
    },
    getColunm: function() {
        let result = [];
        result.push(1);
        result.push(2);
        return result;
    },
});

Template.gaEntrance.events({
    'click .enterMendel': function(event) {
        let mendelID = event.currentTarget.id;
        localStorage.setItem("mendelcode_ga", mendelID);
        window.location.href = "/galileo/browse/" + mendelID;
        // $("title").html("Galileo | " + resp.mendel_code);
    }
});