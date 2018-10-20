import {
    Meteor
} from 'meteor/meteor';
import {
    UserEmail
} from '../models';
import {
    HTTP
} from 'meteor/http'
import {
    NotificationType
} from "./constants";
import Twilio from "../twilio";
import n from 'normalize-strings';

export const Notifications = new Mongo.Collection('ga_notifications');


Meteor.methods({
    //TODO: this should be broken separately into notification and email,
    //TODO: or figure out what medium of notif to apply to which notif types
    'galileo.notification.new': function(userId, msg, url, type, args) {
        // First get the user and check if the user exists
        let users = Meteor.users.find({
            _id: userId
        }, {
            fields: {
                "username": 1,
                "galileo.notification": 1
            }
        }).fetch();


        if (!users || users.length === 0) {
            throw new Meteor.Error("user-not-exists");
        }

        let user = users[0];
        if (type !== NotificationType.ON_BOARDING && type !== NotificationType.MEASURE_DATA && type !== NotificationType.START_DAY_MESSAGE && type !== NotificationType.RUN_HALFWAY_PARTICIPANT_MORE_THAN_50 && type !== NotificationType.RUN_HALFWAY_PARTICIPANT_LESS_THAN_50 && type !== NotificationType.RUN_BEFORE_STARTED_CREATOR && type !== NotificationType.RUN_CREATOR_HALFWAY) {
            // Then insert the notification into the database
            Notifications.insert({
                "user_id": userId,
                "message": msg,
                "url": url,
                "read": false,
                "post_time": new Date(),
                "read_time": undefined
            });
        }

        if (args && url) {
            let fullURL = Meteor.absoluteUrl();
            fullURL = fullURL.substring(0, fullURL.length - 1);
            args.url = fullURL + url;
        }

        // Send email notification
        let email = getEmail(user);
        let userNotificationSettings = user && user.galileo && user.galileo.notification;
        let canNotify = canEmailNotify(userNotificationSettings, type);

        console.log('email for ' + user.username + ' = ' + email + ' with type = ' + type);
        console.log('canNotify for ' + user.username + ' and ' + type + ' = ' + canNotify);

        if (email && canNotify) {
            emailNotify(user, email, type, args);
        }
    },
    'galileo.notification.readNotification': function(notiId) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        Notifications.update(notiId, {
            $set: {
                "read": true,
                "read_time": new Date()
            }
        });
    },
    'galileo.notification.sendEmailToExpert': function(email, field) {
        console.log("called this function " + email);
        let content = "Hello! Here is a new created experiment relates to the " + field + ".";
        let type = NotificationType.CLARIFICATION_NOTIFY_CREATOR;
        let args = {
            content: content,
            name: field
        };
        emailNotify(null, email, type, args);
    },
    'galileo.notification.markAllRead': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        Notifications.update({
            "user_id": Meteor.userId(),
            "read": false
        }, {
            $set: {
                "read": true,
                "read_time": new Date()
            }
        }, {
            multi: true
        });
    },
    'galileo.notification.getUnreadNotifications': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        return Notifications.find({
            "user_id": Meteor.userId(),
            "read": false
        }, {
            sort: {
                "post_time": -1
            }
        }).fetch();
    },
    'galileo.notification.getAllNotifications': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        return Notifications.find({
            "user_id": Meteor.userId()
        }, {
            sort: {
                "post_time": -1
            }
        }).fetch();
    },
    'galileo.console.emailNotify': function(email, type, args) {
        emailNotify(null, email, type, args);
    },
    'galileo.console.testSms': function(countryCode, phone, msg) {
        console.log('sending sms');
        Twilio.sendSMS(countryCode, phone, msg);
    },
    'galileo.notification.newExperimentCreated': function(expTitle, ownerName) {
        let domain = this.connection.httpHeaders.host;
        let args = {
            username: ownerName,
            expTitle: expTitle,
            url: 'https://' + domain + '/galileo/browse',
        };
        emailNotify(null, "gutinstinct@ucsd.edu", NotificationType.NEW_EXPERIMENT_CREATED, args);
    },
    'galileo.notification.sendThankYouEmail': function(expId, content, bottom_text) {
        let exp = Meteor.call('galileo.experiments.getExperiment', expId);
        let expDesign = exp.design;

        let expTitle = "Does " + expDesign.cause + " affect " + expDesign.effect + "?";

        let type = NotificationType.RUN_COMPLETED_THANK_YOU;

        let fullURL = Meteor.absoluteUrl();
        fullURL = fullURL.substring(0, fullURL.length - 1);
        let url = fullURL + "/galileo/me/dashboard";

        for (var i = 0; i < exp.run_users.length; i++) {
            let user_id = Meteor.call('galileo.run.getParticipantMapToUser', expId, exp.run_users[i]);
            let user = Meteor.users.find({
                _id: user_id
            }, {
                fields: {
                    "username": 1,
                    'galileo.country': 1
                }
            }).fetch()[0];

            let username = user.username;
            let toEmail = getEmail(user);

            let args = {
                username: username,
                expTitle: expTitle,
                expId: expId,
                pilotOrExp: "experiment",
                content: content,
                country: user.galileo.country,
                url: url,
                bottom: bottom_text
            };

            emailNotify(null, toEmail, type, args);
        }

        Meteor.call('galileo.experiments.setSentThankYou', expId);
        console.log("Sent thank you Emails");
    },
    'galileo.notification.sendDataAnalysisRequest': function(expId, content) {
        // let content = "Data Analysis Request from the creator: " +  expDesign.username + " of the experiment: " + expTitle + ".";
        let type = NotificationType.REQUEST_DATA_ANALYSIS;
        let args = {
            content: content,
            name: 'Vineet'
        };
        emailNotify(null, "gutinstinct@ucsd.edu", type, args);
        Meteor.call('galileo.experiments.requestDataAnalysis', expId);
    },
    'galileo.notification.sendRemindParticipantEmail': function(partId, content) {
        console.log("send remind participant email to: " + partId);
        let type = NotificationType.RUN_REMIND_PARTICIPANT;
        let user = Meteor.users.find({
            _id: partId
        }, {
            fields: {
                "username": 1,
            }
        }).fetch()[0];

        let toEmail = getEmail(user);

        let args = {
            username: user.username,
            content: content
        };
        emailNotify(null, toEmail, type, args);
    },
    'galileo.notification.sendStopParticipationNoticeEmail': function(userId, expId, reason) {
        let type = NotificationType.RUN_STOP_PARTICIPATION;

        let exp = Meteor.call('galileo.experiments.getExperiment', expId);
        let expDesign = exp.design;

        let expName = "Does " + expDesign.cause + " affect " + expDesign.effect + "?";

        let user = Meteor.users.find({
            _id: userId
        }, {
            fields: {
                "username": 1,
            }
        }).fetch()[0];

        let toEmail = getEmail(user);
        let args = {
            username: user.username,
            expName: expName,
            reason: reason
        };
        emailNotify(null, toEmail, type, args);
    },
    'galileo.notification.sendClarificationNoticeEmail': function(userId, content, isCreator, expId) {
        let exp = Meteor.call("galileo.experiments.getExperiment", expId)

        console.log("content in email is: " + content);
        let type = "";
        let msg = "";
        if (isCreator) {
            type = NotificationType.CLARIFICATION_NOTIFY_CREATOR;
            let title = exp.design.cause + " " + exp.design.relation + " " + exp.design.effect;
            msg = "A clarification question was asked about your experiment [" + title + "]"
        } else {
            let creator = exp.username;
            let title = exp.design.cause + " affects " + exp.design.effect;
            type = NotificationType.CLARIFICATION_NOTIFY_PARTICIPANT;
            msg = "[" + creator + "] just responded to your clarification question about experiment [" + title + "]"
        }

        let user = Meteor.users.find({
            _id: userId
        }, {
            fields: {
                "username": 1,
            }
        }).fetch()[0];
        let args = {
            content: content,
            name: user.username
        };

        let url = "/galileo/me/dashboard";

        Meteor.call("galileo.notification.new", userId, msg, url, type, args);

    },
});

function getEmail(user) {
    let userEmailProfile = UserEmail.findOne({
        "username": user.username
    });
    if (userEmailProfile && userEmailProfile.email) {
        return userEmailProfile.email;
    } else {
        return undefined;
    }
}

function canEmailNotify(userNotificationSettings, type) {
    // TODO
    console.log('settings');
    console.log(userNotificationSettings);
    switch (type) {
        case NotificationType.ON_BOARDING:
            return true;
        case NotificationType.NEW_EXPERIMENT_CREATED:
            return true;
        case NotificationType.REVIEW_ON_MY_EXP:
            return userNotificationSettings["onMyExp"];
            // case "feedback_on_following_exp": return userNotificationSettings["onFollowingExp"];
            // case "feedback_on_my_exp": return userNotificationSettings["onJoinedExp"];
            // case "feedback_on_piloted_exp": return userNotificationSettings["onPilotedExp"];
            // case "feedback_on_feedbacked_exp": return userNotificationSettings["onFeedbackProvidedExp"];
            // case "on_new_exp_created": return setting["userNotificationSettings"];
        default:
            return true;
    }
}

function emailNotify(user, email, type, args) {
    asciiArgs = scanAscii(args);
    HTTP.call("post", Meteor.settings.galileoEmailAPI + "sendEmail", {
        data: {
            "token": Meteor.settings.emailToken,
            "type": type,
            "email": email,
            "args": asciiArgs
        }
    }, function(err, res) {
        // callback added to make this call async
        // needed because sending email is heavy operation
    });
}

// tail recursion to deep loop json obj
function scanAscii(obj) {
    var k;
    if (obj instanceof Object) {
        for (k in obj){
            if (obj.hasOwnProperty(k)){
                obj[k] = scanAscii( obj[k] );
            }
        }
    } else {
        if(obj && (typeof obj) == "string") {
            obj = n(removeEmojis(obj));
        }
    };
    return obj;
};

function removeEmojis(string) {
  var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|[\ud83c[\ude50\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

  return string.replace(regex, '');
}
