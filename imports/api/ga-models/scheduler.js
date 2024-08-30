// We want to send messages close to the start each hour, so these are arranged in a specific order of importance

// 0. Experiments more important than pilots
// 1. Check for all experiments or pilots that can start
// 2. Check for all experiments or pilots that have ended
// 3. Send reminders to only the currently ongoing experiments (experiments after being filtered out in 1 and 2 step)
// 4. Send beginning of day reminders, these don't really need to be close to beginning of the hour


// Experiment related ==>

SyncedCron.add({
    name: "Check Experiment Run Started",
    schedule: (p) => p.recur().on(0).minute().every(1).hour(),
    job: () => Meteor.call("galileo.run.checkExperimentStart")
});

SyncedCron.add({
    name: "Check Experiment Ended",
    schedule: (p) => p.recur().on(1).minute().every(1).hour(),
    job: () => Meteor.call("galileo.run.checkExperimentEnd")
});

SyncedCron.add({
    name: "Send Participation Notification Messages",
    schedule: (p) => p.recur().on(2).minute().every(1).hour(),
    job: () => Meteor.call("galileo.run.sendCauseEffectMessage")
});


SyncedCron.add({
    name: "Send Participation Intervention Messages",
    schedule: (p) => p.recur().on(3).minute().every(1).hour(),
    job: () => Meteor.call('galileo.run.sendInterventionMessage')
})


// Pilot related ==>

SyncedCron.add({
    name: "Check If a Single Pilot Ended",
    schedule: (p) => p.recur().on(3).minute().every(1).hour(),
    job: () => Meteor.call("galileo.pilot.checkIfSinglePilotEnded")
});

SyncedCron.add({
    name: "Send Pilot Notification Messages",
    schedule: (p) => p.recur().on(4).minute().every(1).hour(),
    job: () => Meteor.call("galileo.pilot.sendCauseEffectMessage")
});

SyncedCron.add({
    name: "Check If Both Pilots Ended",
    schedule: (p) => p.recur().on(5).minute().every(1).hour(),
    job: () => Meteor.call("galileo.pilot.checkIfPilotsEndedPerExperiment")
});



// Start of day reminders ==>

SyncedCron.add({
    name: "Send Start of Day Message to Participants",
    schedule: (p) => p.recur().on(6).minute().every(1).hour(),
    job: () => Meteor.call("galileo.run.sendStartOfDayMessage")
});

SyncedCron.add({
    name: "Check Experiment Run 1 day before start date",
    schedule: (p) => p.recur().on(7).minute().every(1).hour(),
    job: () => Meteor.call("galileo.run.check1DayBeforeExpStart")
});

SyncedCron.add({
    name: "Send Start of Day Message to Pilots",
    schedule: (p) => p.recur().on(8).minute().every(1).hour(),
    job: () => Meteor.call("galileo.pilot.sendStartOfDayMessage")
});

SyncedCron.add({
    name: "Check Experiment Run 2 days before start date",
    schedule: (p) => p.recur().on(9).minute().every(1).hour(),
    job: () => Meteor.call("galileo.run.check2DayBeforeExpStart")
});

SyncedCron.add({
    name: "Check halfway through experiment",
    schedule: (p) => p.text('at 10:00am'), // this will run at 10am every day
    job: () => Meteor.call("galileo.run.checkHalfwayThroughExp")
});

SyncedCron.add({
    name: "Check new participants and exps email",
    schedule: (p) => p.recur().on(10).minute().every(1).hour(), // this will check the db for when to send out the daily email
    job: () => Meteor.call("galileo.experiments.sendMorningNewEmail")
});

// SyncedCron.add({
//     name: "Check new users and exps weekly email ",
//     schedule: (p) => p.text('on the first day of the week'),
//     job: () => Meteor.call("galileo.experiments.sendWeeklyNewsEmail")
// });

SyncedCron.add({
    name: "Check 3 days old incomplete experiments",
    schedule: (p) => p.text('at 10:00pm'), // this will run at 10am every day
    job: () => Meteor.call("galileo.experiments.checkIncompleteExp")
});


SyncedCron.start();
