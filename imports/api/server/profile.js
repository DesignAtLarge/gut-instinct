import {
    Meteor
} from 'meteor/meteor';
import {
    UserEmail
} from './../models.js';


Meteor.methods({
    'profile.checkExist' (tryUserName) {
        return (typeof Meteor.users.findOne({
            "username": tryUserName
        }) !== 'undefined');
    },
    'profile.addUserName' (insertUserName) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Accounts.setUsername(Meteor.user()._id, insertUserName);
    },
    'profile.hasEmail' () {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        let currentEmailObj = UserEmail.findOne({
            username: Meteor.user().username
        });

        if (!currentEmailObj || currentEmailObj.email === "") return false;
        else return true;
    },
    'profile.insertFullProfile' (userName, email, agid) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        let currentEmailObj = UserEmail.findOne({
            username: Meteor.user().username
        });

        if (!currentEmailObj) {
            let tryEmail = email;

            if (tryEmail !== "") {
                currentEmailObj = UserEmail.insert({
                    username: userName,
                    email: tryEmail,
                    agid: agid,
                    location: "",
                    noticeSet: [1, 1, 1, 1, 1],
                    onboardingEmail: true
                });
                return true;
            } else {
                currentEmailObj = UserEmail.insert({
                    username: userName,
                    email: tryEmail,
                    agid: agid,
                    location: "",
                    noticeSet: [0, 0, 0, 0, 0],
                    onboardingEmail: false
                });
                return false;
            }
        } else {
            let targetID = currentEmailObj._id;

            if (email !== "")
                UserEmail.update(targetID, {
                    $set: {
                        username: userName,
                        email: email,
                        agid: agid,
                        location: "",
                        onboardingEmail: true
                    }
                });

            if (agid !== "")
                UserEmail.update(targetID, {
                    $set: {
                        username: userName,
                        agid: agid,
                        onboardingEmail: true
                    }
                });

            if (currentEmailObj.onboardingEmail)
                return false;
            else
                return true;
        }
    },
    'profile.setNotificationArray' (index, condition) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        let currentUserObj = UserEmail.findOne({
            username: Meteor.user().username
        });
        if ('noticeSet' in currentUserObj) {
            let updateNoticeSet = currentUserObj.noticeSet;
            updateNoticeSet[parseInt(index)] = parseInt(condition);

            console.log("setting new array " + updateNoticeSet);

            UserEmail.update(currentUserObj._id, {
                $set: {
                    noticeSet: updateNoticeSet
                }
            });

        } else {
            console.error("ERROR - set notification but user don't have notification array");
        }
    },
    'profile.getNotificationArrayOfUser' (username) {
        let currentUserObj = UserEmail.findOne({
            username: username
        });

        if ('noticeSet' in currentUserObj) {
            return currentUserObj.noticeSet;
        } else {
            return [0, 0, 0, 0, 0]
        }
    },
    'profile.getNotificationArray' () {
        let currentUserObj = UserEmail.findOne({
            username: Meteor.user().username
        });

        if ('noticeSet' in currentUserObj) {
            return currentUserObj.noticeSet;
        } else {
            return [0, 0, 0, 0, 0]
        }
    },
    'profile.deleteUser' () {
        Meteor.users.remove(Meteor.userId());
    },
    'profile.getUsername': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        return Meteor.user().username;
    },
    'profile.getEmail': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        let user = Meteor.user().findOne({_id: Meteor.userId()}, {
            fields: {
                'email[0].address': 1
            }
        });
        return user.email[0].address;
    },
    
    'profile.setGIInterest' (gi_interest) {
        UserEmail.update({
            username: Meteor.user().username
        }, {
            $set: {
                interest: gi_interest
            }
        });
    },
    'profile.getGIInterest' () {
        let currentUserObj = UserEmail.findOne({
            username: Meteor.user().username
        });
        let curr_interest = currentUserObj.interest;
        if (!curr_interest) curr_interest = "";
        return curr_interest;
    },
});
