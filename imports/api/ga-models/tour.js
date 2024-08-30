/**
 * API for all the tour related functions
 * Only need [Meteor.users] access
 */

import {
    Experiments
} from './experiments';
import {
    Intuitions
} from './intuitions';

const TOUR = [
    "intro",
    "pretest",
    "intuition",
    "intuition_board",
    "create"
];

Meteor.methods({
    'galileo.tour.startedTouring': function() {
        var user = getUser();
        return user.galileo.tour.started;
    },
    'galileo.tour.startTour': function() {
        getUser();
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'galileo.tour.started': true
            }
        });
    },
    'galileo.tour.isTouring': function() {
        var user = getUser();
        if (!user.galileo.tour.started) {
            return false;
        }
        var tourProgress = user.galileo.tour.progress;
        for (var i = 0; i < TOUR.length; i++) {
            if (!tourProgress[TOUR[i]]) {
                return true;
            }
        }
        return false;
    },
    'galileo.tour.getProgress': function() {
        var user = getUser();
        var tourProgress = user.galileo.tour.progress;
        for (var i = 0; i < TOUR.length; i++) {
            if (!tourProgress[TOUR[i]]) {
                return TOUR[i];
            }
        }
        return "";
    },
    'galileo.tour.finishedTouring': function() {
        var user = getUser();
        if (!user.galileo.tour.started) {
            return false;
        }
        var tourProgress = user.galileo.tour.progress;
        for (var i = 0; i < TOUR.length; i++) {
            if (!tourProgress[TOUR[i]]) {
                return false;
            }
        }
        return true;
    },
    'galileo.tour.setSelectedIntuitionId': function(id) {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                "galileo.tour.selected_intuition_id": id
            }
        });
    },
    'galileo.tour.getSelectedIntuitionId': function() {
        var user = getUser();
        return user.galileo.tour.selected_intuition_id;
    },
    'galileo.tour.getSelectedIntuitionInfo': function() {
        var user = getUser();
        var id = user.galileo.tour.selected_intuition_id;
        if (id) {
            var int = Intuitions.findOne({
                "_id": id
            });
            return int;
        }
    },
    'galileo.tour.setDesignedExperimentId': function(id) {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                "galileo.tour.designed_experiment_id": id
            }
        });
    },
    'galileo.tour.getDesignedExperimentId': function() {
        var user = getUser();
        return user.galileo.tour.designed_experiment_id;
    },
    'galileo.tour.getDesignedExperimentInfo': function() {
        var user = getUser();
        var id = user.galileo.tour.designed_experiment_id;
        if (id) {
            var exp = Experiments.findOne({
                "_id": id
            });
            return exp;
        } else {
            return undefined;
        }
    },
    'galileo.tour.finishedIntro': function() {
        var user = getUser();
        return user.galileo.tour.progress.intro;
    },
    'galileo.tour.finishIntro': function() {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                "galileo.tour.progress.intro": true
            }
        });
    },
    'galileo.tour.finishedPretest': function() {
        var user = getUser();
        return user.galileo.tour.progress.pretest;
    },
    'galileo.tour.finishPretest': function() {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                "galileo.tour.progress.pretest": true
            }
        });
    },
    'galileo.tour.canPretest': function() {
        return Meteor.call("galileo.tour.finishedIntro");
    },
    'galileo.tour.finishedIntuition': function() {
        var user = getUser();
        return user.galileo.tour.progress.intuition;
    },
    'galileo.tour.finishIntuition': function() {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                "galileo.tour.progress.intuition": true
            }
        });
    },
    'galileo.tour.canIntuition': function() {
        return Meteor.call("galileo.tour.finishedPretest");
    },
    'galileo.tour.finishedIntuitionBoard': function() {
        var user = getUser();
        return user.galileo.tour.progress.intuition_board;
    },
    'galileo.tour.finishIntuitionBoard': function() {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                "galileo.tour.progress.intuition_board": true
            }
        });
    },
    'galileo.tour.canIntuitionBoard': function() {
        return Meteor.call("galileo.tour.finishedIntuition");
    },
    'galileo.tour.finishedCreate': function() {
        var user = getUser();
        return user.galileo.tour.progress.create;
    },
    'galileo.tour.finishCreate': function() {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                "galileo.tour.progress.create": true
            }
        });
    },
    'galileo.tour.canCreate': function() {
        return Meteor.call("galileo.tour.finishedIntuitionBoard");
    },
    'galileo.tour.finishedFeedback': function() {
        var user = getUser();
        return user.galileo.tour.progress.feedback;
    },
    'galileo.tour.finishFeedback': function() {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                "galileo.tour.progress.feedback": true
            }
        });
    },
    'galileo.tour.canFeedback': function() {
        return Meteor.call("galileo.tour.finishedCreate");
    },
    'galileo.tour.hasNotifiedFinish': function() {
        var user = getUser();
        return user.galileo.tour.finish_notified;
    },
    'galileo.tour.notifyFinish': function() {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                "galileo.tour.finish_notified": true
            }
        });
    },
    'galileo.tour.needTourBanner': function(pathname) {
        return Meteor.call("galileo.tour.isTouring") && !isTouringPages(pathname);
    }
});

function getUser() {
    if (!Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
    }
    var user = Meteor.users.findOne({
        _id: Meteor.userId()
    });
    if (!user) {
        throw new Meteor.Error("user-not-found");
    }
    return user;
}

function isTouringPages(pathname) {
    if (pathname.indexOf("/galileo/landing") >= 0 ||
        pathname.indexOf("/galileo/intro") >= 0 ||
        pathname.indexOf("/galileo/pretest") >= 0 ||
        pathname.indexOf("/galileo/intuition") >= 0 ||
        pathname.indexOf("/galileo/intuition_board") >= 0 ||
        pathname.indexOf("/galileo/create") >= 0) {
        return true;
    } else {
        return false;
    }
}