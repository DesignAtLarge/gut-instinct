import './_.jade';
import {
    NotificationType
} from "../../../../imports/api/ga-models/constants";

Template.gaConsole.onCreated(function() {
    this.result = new ReactiveVar();
});

Template.gaConsole.helpers({
    result: function() {
        let res = Template.instance().result.get();
        return res ? res : "No Result Right Now";
    }
});

Template.gaConsole.events({
    "click #check-single-pilot-end": function(event) {
        let inst = Template.instance();
        Meteor.call("galileo.pilot.checkIfSinglePilotEnded", function(err, updated) {
            if (err) inst.result.set(err);
            else inst.result.set(JSON.stringify(updated));
        });
    },
    "click #check-all-pilots-end": function(event) {
        let inst = Template.instance();
        Meteor.call("galileo.pilot.checkIfPilotsEndedPerExperiment", function(err, updated) {
            if (err) {
                inst.result.set(err);
            } else {
                inst.result.set(JSON.stringify(updated))
            }
        });
    },
    "click #send-cause-effect-pilot": function() {
        let inst = Template.instance();
        Meteor.call("galileo.pilot.sendCauseEffectMessage", function(err, updated) {
            if (err) {
                inst.result.set(err);
            } else {
                inst.result.set(JSON.stringify(updated))
            }
        });
    },


    "click #check-experiment-end": function(event) {
        let inst = Template.instance();
        Meteor.call("galileo.run.checkExperimentEnd", function(err, updated) {
            if (err) inst.result.set(err);
            else inst.result.set(JSON.stringify(updated));
        });
    },
    "click #check-experiment-start": function(event) {
        let inst = Template.instance();
        Meteor.call("galileo.run.checkExperimentStart", function(err, updated) {
            if (err) {
                inst.result.set(err);
            } else {
                inst.result.set(JSON.stringify(updated))
            }
        });
    },
    "click #check-experiment-run-day1": function() {
        let inst = Template.instance();
        Meteor.call("galileo.run.check1DayBeforeExpStart", function(err, updated) {
            if (err) {
                inst.result.set(err);
            } else {
                inst.result.set(JSON.stringify(updated))
            }
        });
    },
    "click #send-cause-effect-msg ": function() {
        let inst = Template.instance();
        Meteor.call("galileo.run.sendCauseEffectMessage", function(err, updated) {
            if (err) {
                inst.result.set(err);
            } else {
                inst.result.set(JSON.stringify(updated))
            }
        });
    },
    "click #send-morning-msg-pilot ": function() {
        let inst = Template.instance();
        Meteor.call("galileo.pilot.sendStartOfDayMessage", function(err, updated) {
            if (err) {
                inst.result.set(err);
            } else {
                inst.result.set(JSON.stringify(updated))
            }
        });
    },
    "click #send-morning-msg-exp ": function() {
        let inst = Template.instance();
        Meteor.call("galileo.run.sendStartOfDayMessage", function(err, updated) {
            if (err) {
                inst.result.set(err);
            } else {
                inst.result.set(JSON.stringify(updated))
            }
        });
    },

    "click #send-test-email": function() {
        let args = {
            creatorName: "test-exp-creator",
            otherUser: "test-email",
            expTitle: "test-title",
            expId: "test-id",
            duration: 7,
            startDate: "24 March, 2018",
            pilotOrExp: "experiment",
            url: "https://google.com"
        };

        let toEmail = "toEmail";
        let type = NotificationType.RUN_STARTED_FOR_PARTICIPANT;

        let inst = Template.instance();
        Meteor.call('galileo.console.emailNotify', toEmail, type, args, function(err, updated) {
            if (err) {
                inst.result.set(err);
            } else {
                inst.result.set(JSON.stringify(updated))
            }
        });
    },

    "click #send-remind-email": function() {
        let args = {
            creator: "test-exp-creator",
            username: "dingmei",
            otherUser: "test-email",
            expTitle: "test-title",
            expId: "test-id",
            duration: 7,
            category: "cause",
            title: "drinking",
            pilotOrExp: "experiment",
            url: "https://google.com"
        };

        let toEmail = "d3gu@ucsd.edu";
        let type = NotificationType.RUN_REMIND_PARTICIPANT;

        let inst = Template.instance();
        Meteor.call('galileo.console.emailNotify', toEmail, type, args, function(err, updated) {
            if (err) {
                inst.result.set(err);
            } else {
                inst.result.set(JSON.stringify(updated))
            }
        });
    },

    "click #send-remind-email": function() {
        let args = {
            creator: "test-exp-creator",
            username: "dingmei",
            otherUser: "test-email",
            expTitle: "test-title",
            expId: "test-id",
            duration: 7,
            category: "cause",
            title: "drinking",
            pilotOrExp: "experiment",
            url: "https://google.com"
        };

        let toEmail = "d3gu@ucsd.edu";
        let type = NotificationType.RUN_REMIND_PARTICIPANT;

        let inst = Template.instance();
        Meteor.call('galileo.console.emailNotify', toEmail, type, args, function(err, updated) {
            if (err) {
                inst.result.set(err);
            } else {
                inst.result.set(JSON.stringify(updated))
            }
        });
    },

    "click #send-test-sms": function() {
        let inst = Template.instance();
        let countryCode = "+55"; //brazil
        let phoneNumber = "enter phone here"; //brazil
        Meteor.call('galileo.console.testSms', countryCode, phoneNumber, "hi, tushar here", function(err, updated) {
            console.log('inside meteor call');
            if (err) {
                inst.result.set(err);
            } else {
                inst.result.set(JSON.stringify(updated))
            }
        });
    },
    "click #send-weekly-email-server": function () {
        Meteor.call("galileo.experiments.sendWeeklyNewsEmail", "1");
    },
    "click #send-weekly-email-server-dingmei": function () {
        Meteor.call("galileo.experiments.sendWeeklyNewsEmail", "1", "d3gu@ucsd.edu");
    },
    "click #send-weekly-email": function () {
        let expReviewList = [];
        let expToAdd = {
            mendel: "KOMBUCHA",
            title: "Does drink kombucha affect sleep?"
        }
        expReviewList.push(expToAdd);

        let expJoinList = [];
        let exp =  {
            mendel: "KEFIR",
            title: "Does drink kombucha affect digest?"
        }
        expJoinList.push(exp);

        let type = NotificationType.NEW_EXPS_WEEKLY_UPDATE;
        let args = {
            expsNeedReviewer: expReviewList,
            expsNeedJoin: expJoinList,
            numExps: expReviewList.length + expJoinList.length,
            newUsers: [],
            numUsers: 0
        };

        let toEmail = "d3gu@ucsd.edu";
        Meteor.call('galileo.console.emailNotify', toEmail, type, args, function(err, updated) {
            if (err) {
                console.log(err);
            } else {
                console.log("send weekly email is: " + updated);
            }
        });
    },
});
