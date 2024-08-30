import {
    Meteor
} from 'meteor/meteor';
import {
    Experiments
} from './experiments';
import {
    Pilots
} from './pilot';
import {
    Participations
} from './run';
import {
    ExperimentStatus,
    ParticipationStatus
} from './constants';

const PHONE_NUM_REGEX = /^\d{10}$/;

const NUM_CONDITIONS = 2;

const DEFAULT_GALILEO_PROFILE = {
    notification: {
        onMyExp: true,
        onFollowingExp: true,
        onJoinedExp: true,
        onFeedbackProvidedExp: true,
        onNewExpAdded: true
    },
    tour: {
        started: false,
        finish_notified: false,
        progress: {
            pretest: false,
            intuition: false,
            intuition_board: false,
            create: false,
            feedback: false,
            pilot: false,
            run: false
        },
        selected_intuition_id: undefined,
        designed_experiment_id: undefined
    },
    feedback_experiments: [],
    finishedEthicsTraining: true // TODO remove once ethics is complete
};

Meteor.methods({
    'galileo.profile.setMendel': function(mendel) {
        Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                'mendelcode_ga': mendel
            }
        });
    },

    'galileo.profile.getMendel': function() {
        let mendel = Meteor.users.find({
            _id: Meteor.userId()
        }, {
            fields: {
                'mendelcode_ga': 1
            }
        }).fetch();

        if (mendel.length > 0) {
            return mendel[0].mendelcode_ga;
        } else {
            return "";
        }
    },

    'galileo.profile.hasProfile': function() {

        // Check user authorized
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        // Check if galileo exists in user object
        return ('galileo' in Meteor.user());
    },
    'galileo.profile.isAdmin': function() {

        // Check user authorized
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        // Check if galileo exists in user object
        return (Meteor.user().profile.is_admin);
    },
    'galileo.profile.hasPhoneNumber': function(expId) {
        let userId = Meteor.userId();
        let users = Meteor.users.find({
            _id: userId
        }, {
            fields: {
                "galileo.phone": 1,
                "galileo.remindByEmail": 1
            },
            limit: 1
        }).fetch();

        if (!users || users.length === 0) {
            //this is a bug on our part -- maybe we deleted something on the db we shouldn't have
            throw new Meteor.Error("Oops, we cannot find your account in our database. Please email us at gutinstinct@ucsd.edu");
        }

        let user = users[0];
        if (!user.galileo || (!user.galileo.remindByEmail && (!user.galileo.phone || user.galileo.phone === ""))) {
            return false;
        }
        return true;
    },
    'galileo.profile.hasUsername': function(userId) {
        let users = Meteor.users.find({
            _id: userId
        }, {
            fields: {
                "username": 1
            },
            limit: 1
        }).fetch();
        let user = users[0];
        if (!user.username || user.username === "") {
            return false;
        }
        return true;
    },
    'galileo.profile.hasEmail': function(userId) {
        let users = Meteor.users.find({
            _id: userId
        }, {
            fields: {
                "emails": 1
            },
            limit: 1
        }).fetch();
        let user = users[0];
        if (!user.emails || user.emails[0].address === "") {
            return false;
        }
        return true;
    },
    'galileo.profile.updateProfile': function() {
        // Check user authorized
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        // Check if the galileo profile has already existed
        if ('galileo' in Meteor.user()) {
            return;
        }

        // Generate random condition for the user
        let setobj = JSON.parse(JSON.stringify(DEFAULT_GALILEO_PROFILE));
        setobj.condition = Math.floor(Math.random() * NUM_CONDITIONS);

        // Get the current user and add the default galileo profile
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'galileo': setobj
            }
        });
    },

    /*
    'galileo.getUserByPhoneNumber': function(phone) {
        return Meteor.users.findOne({
            "galileo.phone": phone.substring(2)
        });
    },
    */

    //whatsapp implementation
    'galileo.getUserByPhoneNumber': function (phone) {
        if (phone.includes("whatsapp:")) {
            let whatsapp = Meteor.users.findOne({
                "galileo.phone": phone
            });

            return whatsapp;
        }
        else {
            let reg_phone = Meteor.users.findOne({
                "galileo.phone": phone.substring(2)
            });

            return reg_phone;
        }
    },


    'galileo.profile.deleteProfile': function() {
        Meteor.users.update(Meteor.userId(), {
            $unset: {
                'galileo': ""
            }
        });
    },
    'galileo.profile.getProfile': function(user_id) {
        // Check user authorized
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        if (user_id === undefined || user_id === null) {
            user_id = Meteor.userId();
        }
        return Meteor.users.find(user_id).fetch()[0].galileo;
    },
    'galileo.profile.getCtryFlagByArray': function(id_array) {
        let result = [];
        id_array.forEach(function(elt) {
            result.push(getFlagHelper("", elt));
        });
        return result;
    },
    'galileo.profile.getCtryFlag': function(username, user_id) {
        return getFlagHelper(username, user_id);
    },
    'galileo.profile.getExperimentStatsSidebar': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        let unfin = Meteor.call("galileo.profile.getUnfinishedExperiments").length;
        let create = Meteor.call("galileo.profile.getCreatedExperiments").length;
        let review = Meteor.call('galileo.profile.getReviewingExperiments').length;
        let participate = Meteor.call("galileo.profile.getParticipatingExperiments").length;
        let comp = Meteor.call("galileo.profile.getCompletedExperiments").length;
        let ongoing = Meteor.call("galileo.profile.getOngoingExperiments").length;
        let readyToRun = Meteor.call("galileo.profile.getReadyToRunExperiments").length;
        let underReview = Meteor.call("galileo.profile.getUnderReviewExperiments").length;

        let expStats = {
            unfinishedExps: unfin,
            createdExps: create,
            reviewingExps: review,
            participatingExps: participate,
            completedExps: comp,
            ongoingExps: ongoing,
            readyToRunExps: readyToRun,
            underReviewExps: underReview
        }

        return expStats;
    },
    'galileo.profile.getUnderReviewExperiments': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        return Experiments.find({
            "user_id": Meteor.userId(),
            "status": {
                $gte: ExperimentStatus.OPEN_FOR_REVIEW,
                $lte: ExperimentStatus.REVIEWED
            }
        }, {
            fields: {
                "_id": 1
            },
            sort: {
                "create_date_time": -1
            }
        }).fetch().map(exp => Meteor.call("galileo.experiments.getExperiment", exp._id));
    },
    'galileo.profile.getReadyToRunExperiments': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        return Experiments.find({
            "user_id": Meteor.userId(),
            "status": ExperimentStatus.READY_TO_RUN
        }, {
            fields: {
                "_id": 1
            },
            sort: {
                "create_date_time": -1
            }
        }).fetch().map(exp => Meteor.call("galileo.experiments.getExperiment", exp._id));
    },
    'galileo.profile.getCreatedExperiments': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        return Experiments.find({
            "user_id": Meteor.userId(),
            "status": {
                $gte: ExperimentStatus.DESIGNED
            }
        }, {
            fields: {
                "_id": 1
            },
            sort: {
                "create_date_time": -1
            }
        }).fetch().map(exp => Meteor.call("galileo.experiments.getExperiment", exp._id));
    },
    'galileo.profile.getCompletedExperiments': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        return Experiments.find({
            "user_id": Meteor.userId(),
            "status": {
                $gte: ExperimentStatus.FINISHED
            }
        }, {
            fields: {
                "_id": 1
            },
            sort: {
                "create_date_time": -1
            }
        }).fetch().map(exp => Meteor.call("galileo.experiments.getExperiment", exp._id));
    },
    'galileo.profile.getOngoingExperiments': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        return Experiments.find({
            "user_id": Meteor.userId(),
            "status": {
                $gte: ExperimentStatus.PREPARING_TO_START,
                $lt: ExperimentStatus.FINISHED
            }
        }, {
            fields: {
                "_id": 1
            },
            sort: {
                "create_date_time": -1
            }
        }).fetch().map(exp => Meteor.call("galileo.experiments.getExperiment", exp._id));
    },
    'galileo.profile.getPilotingExperiments': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        let expMap = {};

        Pilots.find({
            user_id: Meteor.userId()
        }, {
            fields: {
                _id: 1,
                exp_id: 1
            },
            sort: {
                user_endDate_inGmt: -1
            }
        }).fetch().map((pilot) => {
            if (!expMap[pilot.exp_id]) {
                expMap[pilot.exp_id] = Meteor.call("galileo.experiments.getExperiment", pilot.exp_id);
            }
        });

        return Object.values(expMap);
    },
    'galileo.profile.getUnfinishedExperiments': function() {

        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        let exps = Experiments.find({
            "user_id": Meteor.userId(),
            "status": ExperimentStatus.CREATED
        }, {
            fields: {
                _id: 1
            }
        }).fetch().map(exp => Meteor.call("galileo.experiments.getExperiment", exp._id));

        return exps
    },
    'galileo.profile.getReviewingExperiments': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        let users = Meteor.users.find({
            _id: Meteor.userId()
        }, {
            fields: {
                "galileo.feedback_experiments": 1
            }
        }).fetch();

        // console.log("get reviewing exp: " + users);

        if (users && users.length > 0) {
            let user = users[0];
            if (user && user.galileo && user.galileo.feedback_experiments && user.galileo.feedback_experiments.length > 0) {
                // console.log("ready to return reviewing exp: " + users);

                return user.galileo.feedback_experiments.map((exp_id) => {
                    // console.log("ready to return reviewing exp - get exp info with exp id: " + JSON.stringify(exp));
                    return Meteor.call("galileo.experiments.getExperiment", exp_id);
                }).filter((exp) => {
                    return exp; //to remove undefined or null values
                });
            } else {
                return [];
            }
        }
    },
    'galileo.profile.getParticipatingExperiments': function() {
        return Participations.find({
            "user_id": Meteor.userId()
        }, {
            fields: {
                "exp_id": 1
            }
        }).fetch().map((part) => Meteor.call("galileo.experiments.getExperiment", part.exp_id));
    },

    'galileo.profile.getPhone': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        let user = Meteor.user();
        if (!user) {
            throw new Meteor.Error("user-not-exists");
        }
        if (!user.galileo || !user.galileo.phone || user.galileo.phone === "") {
            return undefined;
        } else {
            return user.galileo.phone;
        }
    },
    'galileo.profile.setPhone': function(phone) {

        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        phone = phone.trim();
        if (!phone.match(PHONE_NUM_REGEX)) {
            throw new Meteor.Error('Invalid Phone Number');
        }

        Meteor.users.update(Meteor.userId(), {
            $set: {
                "galileo.phone": phone
            }
        });
    },
    'galileo.profile.setEmail': function(email) {

        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Meteor.users.update(Meteor.userId(), {
            $set: {
                "emails": [{
                    "address": email,
                    "verified": false
                }]
            }
        });
    },
    'galileo.profile.setUsername': function(username) {

        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Meteor.users.update(Meteor.userId(), {
            $set: {
                "username": username
            }
        });
    },
    'galileo.profile.setEmailReminder': function(boolVal) {

        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Meteor.users.update(Meteor.userId(), {
            $set: {
                "galileo.remindByEmail": boolVal
            }
        });
    },


    'galileo.profile.setCountry': function(country) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Meteor.users.update(Meteor.userId(), {
            $set: {
                "galileo.country": country
            }
        });
    },
    'galileo.profile.setCity': function(city) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        Meteor.users.update(Meteor.userId(), {
            $set: {
                "galileo.city": city
            }
        });
    },
    'galileo.profile.setTimeZone': function(timezone, isDst) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        Meteor.users.update(Meteor.userId(), {
            $set: {
                "galileo.timezone": timezone,
                "galileo.isDst": isDst
            }
        });
    },
    'galileo.profile.setTimeZoneOnly': function(timezone) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        Meteor.users.update(Meteor.userId(), {
            $set: {
                "galileo.timezone": timezone,
            }
        });
    },
    'galileo.profile.setIsDstOnly': function(isDst) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        Meteor.users.update(Meteor.userId(), {
            $set: {
                "galileo.isDst": isDst,
            }
        });
    },
    'galileo.profile.setInterest': function(interest) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Meteor.users.update(Meteor.userId(), {
            $set: {
                "galileo.interest": interest
            }
        });
    },
    'galileo.profile.getInterest': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        return Meteor.user().galileo.interest;
    },

    // TODO Deprecated
    'galileo.profile.setIntuitionTime': function(time) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        Meteor.users.update(Meteor.userId(), {
            $set: {
                "galileo.intuitionTime": time
            }
        })
    },

    //
    'users.hasUsername': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        return Meteor.user().username !== undefined;
    },
    'users.getUsername': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        return Meteor.user().username;
    },

    // TODO @Vineet
    'galileo.profile.updateEthicsCertificate': function(url) {
        let currentUserId = Meteor.userId();
        if (!currentUserId) {
            throw new Meteor.Error("not-authorized");
        }
        Meteor.users.update(currentUserId, {
            $set: {
                "galileo.ethicsCertificate": url,
                "galileo.finishedEthicsTraining": true
            }
        });

        //update all experiments created by user that were "designed" to become "open for review"
        Experiments.update({
            user_id: currentUserId,
            status: ExperimentStatus.DESIGNED
        }, {
            $set: {
                status: ExperimentStatus.OPEN_FOR_REVIEW
            }
        });
    },
    'galileo.profile.getEthicsCertificate': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        let user = Meteor.user();
        if (!user) {
            throw new Meteor.Error("user-not-found");
        }
        if (user.galileo && user.galileo.ethicsCertificate) {
            return user.galileo.ethicsCertificate;
        } else {
            return undefined;
        }
    },

    'galileo.profile.hasFinishedEthics': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized')
        }
        return Meteor.user().galileo.finishedEthicsTraining;
    },

    'galileo.profile.setUsernameToured': function() {
        console.log('marking username toured = true');
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.toured.username_page': true
            }
        });
    },

    //
    'galileo.profile.getNotificationSetting': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        return Meteor.user().galileo.notification;
    },
    'galileo.profile.notification.enableOnMyExp': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                'galileo.notification.onMyExp': true
            }
        });
    },
    'galileo.profile.notification.disableOnMyExp': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                'galileo.notification.onMyExp': false
            }
        });
    },
    'galileo.profile.notification.enableOnFollowingExp': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                'galileo.notification.onFollowingExp': true
            }
        });
    },
    'galileo.profile.notification.disableOnFollowingExp': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                'galileo.notification.onFollowingExp': false
            }
        });
    },
    'galileo.profile.notification.enableOnJoinedExp': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                'galileo.notification.onJoinedExp': true
            }
        });
    },
    'galileo.profile.notification.disableOnJoinedExp': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                'galileo.notification.onJoinedExp': false
            }
        });
    },
    'galileo.profile.notification.enableOnFeedbackProvidedExp': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                'galileo.notification.onFeedbackProvidedExp': true
            }
        });
    },
    'galileo.profile.notification.disableOnFeedbackProvidedExp': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                'galileo.notification.onFeedbackProvidedExp': false
            }
        });
    },
    'galileo.profile.notification.enableOnNewExpAdded': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                'galileo.notification.onNewExpAdded': true
            }
        });
    },
    'galileo.profile.notification.disableOnNewExpAdded': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                'galileo.notification.onNewExpAdded': false
            }
        });
    },
    'galileo.profile.getRelativeExperiments': function(userId) {
        let exps = [],
            participations = [],
            relativeExps = [],
            reviewing = [];
        exps = getExperimentsByUserHelper(userId);
        exps.forEach(function(exp) {
            relativeExps.push(exp);
        });
        reviewing = Experiments.find({
            feedback_users: userId,
            status: {
                $gte: ExperimentStatus.OPEN_FOR_REVIEW,
                $lte: ExperimentStatus.REVIEWED
            }
        }).fetch();
        reviewing.forEach(function(exp) {
            relativeExps.push(exp);
        })
        participations = Participations.find({
            user_id: userId,
            status: {
                $gte: ParticipationStatus.PASSED_CRITERIA,
                $lte: ParticipationStatus.FINISHED,
            }
        }).fetch();
        participations.forEach(function(p) {
            relativeExps.push(p);
        });
        return relativeExps;
    },
});

function getExperimentsByUserHelper(targetUserID) {
    //console.log("in helper function getExperimentsByUserHelper");
    if (!targetUserID) {
        return null;
    } else {
        let syncfunc = Meteor.wrapAsync(function(callback) {
            Experiments.rawCollection().aggregate([ // Raw Collection returns the original mongo db collection so that we can do aggregate on it
                {
                    $match: { // First matching all the experiments that has status greater than merely created.
                        user_id: targetUserID
                    }
                },
                {
                    $lookup: { // Then look up the current experiment design in the "ga_experiment_designs" collection and put it in the local field as "design"
                        from: "ga_experiment_designs",
                        localField: "curr_design_id",
                        foreignField: "_id",
                        as: "design"
                    }
                },
                {
                    $unwind: "$design" // Follow up stage after look up. Since there will be only one experiment design, unwind stage will simply unwind { design: [{ /* design */ }] } to { design: {/* design */} }
                }
            ], callback);
        });
        return syncfunc();
    }
}

function getFlagHelper(username, user_id) {
    let ctry = "";
    if (username && username.length > 0) {
        ctry = Meteor.users.find({"username":username}).fetch()[0].galileo.country;
    } else {
        ctry = Meteor.users.find(user_id).fetch()[0].galileo.country;
    }

    let result = "";
    if (ctry && ctry.length > 0) {
        if (ctry == "USA") {
            result = "flag-icon-us";
        } else if (ctry == "CHN") {
            result = "flag-icon-cn";
        } else if (ctry == "MNE") {
            result = "flag-icon-me";
        } else if (ctry == "BRA") {
            result = "flag-icon-br";
        } else if (ctry == "NZL") {
            result = "flag-icon-nz";
        } else if (ctry == "CAN") {
            result = "flag-icon-ca";
        } else if (ctry == "GBR") {
            result = "flag-icon-gb";
        } else if (ctry == "IND") {
            result = "flag-icon-in";
        } else if (ctry == "EGY") {
            result = "flag-icon-eg";
        } else if (ctry == "AUS") {
            result = "flag-icon-au";
        } else if (ctry == "ESP") {
            result = "flag-icon-es";
        } else if (ctry == "NLD") {
            result = "flag-icon-nl";
        } else if (ctry == "DNK") {
            result = "flag-icon-dk";
        } else if (ctry == "ITA") {
            result = "flag-icon-it";
        } else {
            result = "flag-icon-aw";
        }
    }
    return result;
}
