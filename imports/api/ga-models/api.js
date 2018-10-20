import {
    Meteor
} from "meteor/meteor";

Router.onBeforeAction(Iron.Router.bodyParser.urlencoded({
    extended: false
}));

// Galileo API http://gut-instinct.ucsd.edu/galileo/api/sms has been added
Router.route("/galileo/api/sms", {
    where: 'server'
}).post(function() {
    let phone = this.request.body["From"];
    let usersText = this.request.body["Body"];

    console.log('~~~~~~~~~~~~message received from ' + phone + '  with text = ' + usersText);
    // search user id by this phone number
    let user = Meteor.call("galileo.getUserByPhoneNumber", phone);
    if (user) {
        console.log('user found =' + user._id);
        let pilot = Meteor.call("galileo.pilot.getCurrentPilot", user._id);
        console.log("pilot")
        console.log(pilot)

        // search one participation that current user joined
        let participation = Meteor.call("galileo.run.getCurrentParticipationForUser", user._id);
        console.log("participation")
        console.log(participation)

        this.response.setHeader('Content-Type', 'application/xml');

        let message = "";
        if (pilot !== undefined && pilot !== null) {
            console.log('pilot found =' + pilot._id);
            message = Meteor.call("galileo.pilot.processMessageFromPilot", user, pilot, phone, usersText);
            this.response.end("<Response><Message>" + message + "</Message></Response>");
        } else if (participation !== undefined && participation !== null) {
            message = Meteor.call("galileo.run.processMessageFromParticipation", user, participation, phone, usersText);
            console.log('~~~~~~~~ message');
            console.log(message);
            this.response.end("<Response><Message>" + message + "</Message></Response>");
        } else if (participation === undefined) {
            console.log('~~~~~~~~ message');
            message = "Participation not found"
            console.log(message);
            this.response.end("<Response><Message>" + message + "</Message></Response>");
        }
    } else {
        console.log('user not found');
    }
});