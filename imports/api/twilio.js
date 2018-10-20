import {
    Meteor
} from "meteor/meteor";

const Twilio = require("twilio");
const client = Twilio(Meteor.settings.twilio.sid, Meteor.settings.twilio.token);

module.exports = {
    /**
     * E.G.
     *   sendSMS("+1", "1234567890", "This is the message body");
     *   sendSMS("1234567890", "This is the message body");
     */
    sendSMS: function() {
        try {
            if (arguments.length === 2) {
                sendWithoutCountryCode(arguments[0], arguments[1]);
            } else if (arguments.length === 3) {
                sendWithCountryCode(arguments[0], arguments[1], arguments[2]);
            } else {
                console.error("Invalid arguments in sendSMS");
            }
        } catch (e) {
            console.error(e);
        }
    }
};

function sendWithCountryCode(countryCode, phoneNum, message) {
    sendFromTwilio(countryCode + phoneNum, message);
}

function sendWithoutCountryCode(phoneNum, message) {
    if (phoneNum.includes("whatsapp:")) {
        sendFromTwilio(phoneNum, message);
    }
    else {
        sendFromTwilio("+1" + phoneNum, message);
    }
}

function sendFromTwilio(to, message) {
    if (to.includes("whatsapp:")) {
        send("whatsapp:+441618507453", to, message);
    }
    else {
        send(Meteor.settings.twilio.phone, to, message);
    }
}

function send(from, to, message) {
    client.messages.create({
        to: to,
        from: from,
        body: message,
    }, function(err, result) {
        if (err) {
            throw err;
        }
    });
}