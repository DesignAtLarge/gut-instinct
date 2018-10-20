import {
    Meteor
} from 'meteor/meteor';
import '../imports/api/models.js';
import '../imports/api/server/master.js';
// import { mail_url } from '../settings_key_dev.json'
// var sslRootCAs = require('ssl-root-cas/latest')
// sslRootCAs.inject()

import '../imports/api/ga-models/master.js';

const PERMISSION = {
    USER: 0,
    SUDO_ADMIN: 1
};

Meteor.startup(() => {
    // TimeSync.loggingEnabled = false;
    // process.env.MAIL_URL = mail_url;

    Accounts.urls.resetPassword = function(token) {
        return Meteor.absoluteUrl('reset-password/' + token);
    };

    Accounts.emailTemplates.resetPassword = {
        from: () => "gutinstinct@ucsd.edu",
        subject: () => "Reset Your Account Password",
        text: (user, url) => {
            const newUrl = url.replace("#/reset-password", "reset-password");
            return `Click the link below to reset your password:\n\n${newUrl}`;
        }
    };
});

ServiceConfiguration.configurations.remove({
    service: "facebook"
});

ServiceConfiguration.configurations.insert({
    service: 'facebook',
    appId: Meteor.settings.facebook.appId,
    secret: Meteor.settings.facebook.secret
});

ServiceConfiguration.configurations.remove({
    service: "google"
});

ServiceConfiguration.configurations.insert({
    service: 'google',
    clientId: Meteor.settings.google.appId,
    secret: Meteor.settings.google.secret
});

// ServiceConfiguration.configurations.remove({
//     service: "reddit"
// });
//
// ServiceConfiguration.configurations.insert({
//     service: 'reddit',
//     appId: Meteor.settings.reddit.appId,
//     secret: Meteor.settings.reddit.secret
// });

ServiceConfiguration.configurations.remove({
    service: 'coursera'
});

ServiceConfiguration.configurations.insert({
    service: 'coursera',
    clientId: Meteor.settings.coursera.appId,
    secret: Meteor.settings.coursera.secret
});


ServiceConfiguration.configurations.remove({
    service: 'openhumans'
});

ServiceConfiguration.configurations.insert({
    service: 'openhumans',
    clientId: Meteor.settings.openhumans.appId,
    secret: Meteor.settings.openhumans.secret
});


Slingshot.fileRestrictions("myImageUploads", {
    allowedFileTypes: /.*/i,
    maxSize: 10 * 1024 * 1024,
});


Slingshot.createDirective("myImageUploads", Slingshot.S3Storage, {
    AWSAccessKeyId: Meteor.settings.awsPrivateAccessID,
    AWSSecretAccessKey: Meteor.settings.awsPrivateAccessKey,
    bucket: "gut-instinct",
    acl: "public-read",
    region: "us-east-1",

    authorize: function() {
        if (!this.userId) {
            var message = "Please login before posting images";
            throw new Meteor.Error("Login Required", message);
        }

        return true;
    },

    key: function(file) {
        var currentUserId = Meteor.user().username;
        return "topicUpload/" + currentUserId + "/" + file.name;
    }

});


Slingshot.fileRestrictions("myQuestionUploads", {
    allowedFileTypes: /.*/i,
    maxSize: 10 * 1024 * 1024,
});


Slingshot.createDirective("myQuestionUploads", Slingshot.S3Storage, {
    AWSAccessKeyId: Meteor.settings.awsPrivateAccessID,
    AWSSecretAccessKey: Meteor.settings.awsPrivateAccessKey,
    bucket: "gut-instinct",
    acl: "public-read",
    region: "us-east-1",

    authorize: function() {
        if (!this.userId) {
            var message = "Please login before posting images";
            throw new Meteor.Error("Login Required", message);
        }

        return true;
    },

    key: function(file) {
        var currentUserId = Meteor.user().username;
        return "questionUpload/" + currentUserId + "/" + file.name;
    }

});

Accounts.onCreateUser(function(options, user) {
    updateCurrentAccount(user);
    return user;
});

function getBasicProfileJson() {
    return {
        is_admin: false,
        consent_agreed: false,
        permission_group: PERMISSION.USER,
        toured: {
            articles: false,
            bookmark: false,
            consent: false,
            guide_question_bin: false,
            guide_question_info: false,
            guide_question_module: false,
            guide_question_result: false,
            gutboard: false,
            gutboard_slider: false,
            gutboard_slider_addq: false,
            landing: false,
            learn_discussions: false,
            personal_question: false,
            personal_question_bin: false,
            personal_question_module: false,
            personal_tag_question: false,
            problems: false,
            qmodule: false,
            tag: false,
            topics: false,
            tutorial: false,
            username_page: false,
        },
        topics_investigated: {},
        answered: {},
        discussed: {},
        voted: {},
        learn_questions_viewed: {},
        learn_questions_answered: {},
        learn_questions_discussed: {},
        ethics_completed: false
    }
}

function updateCurrentAccount(user) {
    let basicProfile = getBasicProfileJson();
    // 1 -> no train and no learn, yes ask
    // 2 -> no train and yes learn, yes ask
    // 3 -> yes train and no learn, yes ask
    // 4 -> yes train and yes learn, yes ask
    // 5 -> condition 3 w/out questions
    // 6 -> condition 4 w/out questions

    // 7 -> no train, no asking, yes learn

    // Conditions with no prior questions
    // 8 -> no train and no learn, yes ask
    // 9 -> no train and yes learn, yes ask
    // 10 -> yes train and no learn, yes ask w/ examples on gutboard
    // 11 -> yes train and yes learn, yes ask w/ examples on gutboard
    let randomCondition = getRandomCondition();
    basicProfile.condition = randomCondition;
    console.log("condition is " + randomCondition);
    basicProfile.guide_completed = false;
    basicProfile.intro_completed = false;


    if (randomCondition === 1 || randomCondition === 2 || randomCondition === 5 || randomCondition === 8 || randomCondition === 9) {
        basicProfile.guide_completed = true;
    }

    basicProfile.source = getUserSource(user);

    user.profile = basicProfile;
}

/* shuffle array */
function shuffle(arra1) {
    let ctr = arra1.length,
        temp, index;

    // While there are elements in the array
    while (ctr > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * ctr);
        // Decrease ctr by 1
        ctr--;
        // And swap the last element with it
        temp = arra1[ctr];
        arra1[ctr] = arra1[index];
        arra1[index] = temp;
    }
    return arra1;
}

//var prev_cond = 11;
let usedAllConditions = false;
let currentRandomArray = shuffle([8, 9, 10, 11]);
let currentIndex = 0;

function getRandomCondition() {
    //const cond_min = 1;
    //const cond_min = 2;
    //const cond_max = 4;
    //let randomCondition = Math.floor(Math.random() * (cond_max - cond_min + 1)) + cond_min;
    //randomCondition = getRandomIntInclusive(1,3);
    //console.log("randomCondition is"+randomCondition);
    //return randomCondition;

    /* Alternate between conditions 5 and 6 */
    // if (prev_cond == 5) {
    //     prev_cond = 6;
    //     return prev_cond;
    // } else {
    //     prev_cond = 5;
    //     return prev_cond;
    // }


    /* Alternate between conditions 1, 2, 3, 4, 5, 6 */
    /* Mod 6 goes from 0 to 5, so we need an offset of 1  */
    // curr_cond = prev_cond;
    // prev_cond = (++prev_cond)%6;
    // return curr_cond + 1;


    /* Repeat randomize array of numbers 8, 9 ,10, 11 then follow order for next 4 users.*/
    if (usedAllConditions) {
        usedAllConditions = false;
        currentRandomArray = shuffle([8, 9, 10, 11]);
        return currentRandomArray[currentIndex++ % 4];
    } else {
        let index = currentIndex % 4;
        currentIndex++;
        if (index === 3) usedAllConditions = true;
        return currentRandomArray[index];
    }
}

function getUserSource(user) {
    // source - origin of user
    // source = 1 is reserved for the original users, for whom we created the login details
    // source = 1 is reserved for people who will signup with email in future
    let source = 2;
    if (user.services.google) {
        source = 3;
    } else if (user.services.facebook) {
        source = 4;
    } else if (user.services.coursera) {
        source = 5;
    } else if (user.services.edx) {
        // This field is for the future, we don't have edx login yet
        source = 6;
    } else if (user.services.openhumans) {
        source = 7;
    }
    return source;
}