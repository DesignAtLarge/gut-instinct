import './_.jade';

const STEPS = [{
        id: 0,
        title: "Finish Galileo Pretest",
        body: "Galileo Pretest is a survey for us to better understand what blah blah blah"
    },
    {
        id: 1,
        title: "Share Your Intuitions",
        body: "See examples and form your own intuitions"
    },
    {
        id: 2,
        title: "Select an intuition to begin desgining your experiment",
        body: "You can see a bunch of intuitions in the intuition board (including your own). Pick one and use it to design your experiment!"
    },
    {
        id: 3,
        title: "Design your own experiment",
        body: "Blah Blah Blah"
    },
    {
        id: 4,
        title: "Provide feedback on others' experiment designs",
        body: "Go to the experiment board and provide some feedback"
    },
    {
        id: 5,
        title: "Receive feedback and pilot your experiment",
        body: "Blah Blah Blah"
    },
    {
        id: 6,
        title: "Participate in an experiment!",
        body: "Blah Blah Blah Blah Blah Blah Again"
    }
]

Template.gaIntro.onCreated(function() {

});

Template.gaIntro.helpers({
    steps: function() {
        return STEPS;
    }
})

Template.gaIntro.events({

});