import {
    Meteor
} from 'meteor/meteor';
import {
    ExperimentStatus
} from "./constants";

export const Boards = new Mongo.Collection('ga_boards');

Meteor.methods({
    'galileo.boards.getGoogleForm': function(mendelCode) {
        let x = Boards.find({
            "status": 1,
            "mendel_code": mendelCode
        }, {
            "google_form_id": 1
        }).fetch();
        return x[0].google_form_id;
    },
    'galileo.boards.getBoards': function() {
        return Boards.find({
            status: 1,
        }).fetch();
    },

    'galileo.boards.getMendelName': function(mendelCode) {
        let x = Boards.find({
            "status": 1,
            "mendel_code": mendelCode
        }, {
            "mendel_name": 1
        }).fetch();

        if (x.length > 0) {
            return x[0].mendel_name;
        } else {
            return "";
        }
    },

    'galileo.boards.getBoardsWithStats': function() {
        return Boards.find({
            status: 1,
        }).map((board) => {
            board.exp_count = Meteor.call("galileo.experiments.getSingleMendelExpNum", board.mendel_code);
            board.user_count = Meteor.call("galileo.experiments.getSingleMendelUserNum", board.mendel_code);
            return board;
        });
    },
    'galileo.boards.getBlogBoard': function(blogName) {
        let x = Boards.find({
            "blog": blogName
        }, {
            "mendel_code": 1
        }).fetch();

        return x[0].mendel_code;
    }
});


function generateBoardObject(mendelCode) {
    return {
        "mendel_code": mendelCode,
        "mendel_name": "",
        "img": "",
        "note": "",
        "hint": "",
        "google_form_id": "",
        "versions": [{
            "create_data_time": new Date()
        }],
        "status": 1
    }
}