module.exports = {
    "hypothesis": [
        "Is the cause specific?",
        "Is the effect specific?",
        "Is the relation between cause and effect clear?",
        //"Do you think this is true? Or should the alternate hypothesis be tested. Which is more likely?",
        "Is the hypothesis concrete i.e. it either holds or it does not hold?",
        "Is this mechanism the most plausible explanation?"
    ],
    "measure_cause": [
        "Is this choice of measurement appropriate for the cause?",
        "Can the experiment participants correctly measure the cause?",
        "Is the time of reminder convenient for the participants?",
        "Is the time of reminder appropriate to receive correct data?"
    ],
    "measure_effect": [
        "Is this choice of measurement appropriate for the effect?",
        "Can the experiment participants correctly measure the effect?",
        "Is the time of reminder convenient for the participants?",
        "Is the time of reminder appropriate to receive correct data?"
        //"Is this time convenient for people to provide information (e.g. asking people how sleepy they are, right before falling asleep is good, but also difficult to track since people might be too tired to provide this info)",
        //"and (separate bullet) this is the right time to ask for this data (example: ask people about their quality of sleep right after they wake up, not at noon) --- add good and bad examples for all of these"

    ],
    "condition_experimental": [
        "Are all the steps clear enough so all the participants interpret them consistently?",
        "Is every step safe for participants? Please point out any step that asks participants to abstain from food, water, medication, or suggests extreme increase in physical activity!",
        "People's daily activities can influence the cause measure. Do the steps account for this issue (called confounds)? For example, if an experiment studies the effect of coffee on sleep, participants should not drink soda (since soda has caffeine too).",
        //"Can participants perform all the steps in either condition in a reasonable time?",
        //"Does every step require participants to make ONLY minor tweaks in their lifestyle?",
        //"Which daily activities might need to be stopped?".
        //"If you wanted to replicate the experiment, would you add any more details to the steps?"
        //" ask people about specific ingredients, or to be as specific as needed. e.g. if you ask people to eat a grilled cheese sandwich, should they have salt and pepper",
        //"Do you expect to see a difference in the effect metric for control and experimental groups?",
        //If not, how might you change the groups?",
    ],
    "condition_control": [
        //"Do the control and experimental conditions vary the cause appropriately?",
        "Is the control condition appropriate compared to the experimental condition? E.g. If comparing the effect of eating cabbage on bloatedness, control condition participants can eat lettuce/broccoli rather than not eating food at all.",
        "Do the control and experimental conditions differ in ONLY one step that manipulates the cause?",

        "Are all the steps clear enough so all the participants interpret them consistently?",
        "Is every step safe for participants? Please point out any step that asks participants to abstain from food, water, medication, or suggests extreme increase in physical activity!",
        "People's daily activities can influence the cause measure. Do the steps account for this issue (called confounds)? For example, if an experiment studies the effect of coffee on sleep, participants should not drink soda (since soda has caffeine too).",
        "Can participants perform all the steps in either condition in a reasonable time?",
        //"Does every step require participants to make ONLY minor tweaks in their lifestyle?",
        //"Which daily activities might need to be stopped?".
        //"If you wanted to replicate the experiment, would you add any more details to the steps?"
        //" ask people about specific ingredients, or to be as specific as needed. e.g. if you ask people to eat a grilled cheese sandwich, should they have salt and pepper",
        //"Do you expect to see a difference in the effect metric for control and experimental groups?",
        //If not, how might you change the groups?",
    ],
    "criteria_exclusion": [
        "Does this list exclude all participants who might be harmed from participating in the experiment (in both Control and Experimental conditions)?", //potential_harm

        "Does this list exclude all participants who might not be able to provide informed consent to participate?", //Informed consent

        "Does this list exclude participants who might not adhere to the steps for every day of the suggested duration? E.g. long-term smokers might struggle to avoid smoking in an experiment that studies the effect of smoking vs. non-smoking.", //Adherence

        //"Does this list exclude all participants who might not gain from the results of the experiment and the knowledge created?"//GAIN
        //"Does the Exclusion Criteria include "
        //"Confounders: Are there participants for whom interpreting the data might be problematic due to other lifestyle factors? Please suggest adding them to the criteria (E.g. when studying the effect of coffee on quantity of sleep, it might help to exclude participants who do night shift work. or others who have never had coffee.",
    ],
    "criteria_inclusion": [
        "Does the Inclusion Criteria include people whose participation will provide the most appropriate results? (E.g. for an experiment that tests the effect of regular coffee drinking, regular coffee drinkers should be included)",
        //"Your experiments should be run by people who'll need to make minor changes to their lifestyle while keeping everything else the same.",

    ],
    "results": [
        "Do you understand these graphs?",
        "Which other graphs would you like to see?"
        //     //"promise to weigh all the findings instead of cherry-picking data that supports a particular point of view.",
        //     //"stakeholders must agree how they’ll proceed once the results are in",
    ],
    "overall": [
        "Assume that the experiment was run but it failed to complete. What might you improve in the experiment design to avoid this situation?",
        "Assume that the experiment was run to completion but it failed to find evidence for the hypothesis. What might you improve in the experiment design to improve the chance of finding an evidence for the hypothesis?",
        "Could you share some resources for the experiment designer to find other participants?",
    ]
};