export const ExperimentStatus = {
    CREATED: 0,
    DESIGNED: 1,
    OPEN_FOR_REVIEW: 2,
    REVIEW_ONGOING: 3,
    REVIEWED: 4,
    OPEN_FOR_PILOT: 5,
    PILOT_ONGOING: 6,
    PILOTED: 7,
    READY_TO_RUN: 8,
    PREPARING_TO_START: 9,
    STARTED: 10,
    FINISHED: 11,
    ANALYSIS_REQUESTED: 12,
    ANALYSIS_FINISHED: 13
};

export const PilotStatus = {
    PREPARING: 0,
    ONGOING: 1,
    ENDED: 2
};

export const ParticipationSlotStatus = {
    PREPARING: 0,
    SENT: 1,
    COMPLETE: 2,
    FOLLOW_COMPLETE: 3,
    ERROR: 4
};

export const MeasureType = {
    ABS_PRES: "Absence/Presence",
    AMOUNT: "Amount",
    RATING: "Rating",
    RATE: "Rate", //Speed
    FREQUENCY: "Frequency",
    BRISTOL: "Bristol"
};

export const ConditionGroup = {
    CONTROL: 0,
    EXPERIMENTAL: 1
};

export const ParticipationStatus = {
    PASSED_CRITERIA_HASNT_AGREED: -1,
    CONSENTED: 0,
    FAILED_CRITERIA: 1,
    PASSED_CRITERIA: 2,
    PREPARING: 3,
    STARTED: 4,
    FINISHED: 5,
    WAITLIST: 6,
    DROPPED: 7
};

export const ErrorMessage = {
    EXP_START: "exp-started",
    EXP_END: "exp-ended",
    MISSING_PHONE: "missing-phone-number",
    IS_REVIEWER_CANNOT_JOIN: "You are reviewing this experiment. You cannot review and participate in the same experiment."
};


export const NotificationType = {

    // NOTIFICATION SENT TO EVERYONE
    ON_BOARDING: "v1_welcome_to_galileo",

    // EMAILS SENT TO PARTICIPANTS
    PILOT_STARTED_FOR_PARTICIPANT: "pilot_started_for_participant",
    PILOT_COMPLETED_PARTICIPANT: "pilot_completed_participant",
    RUN_STARTED_FOR_PARTICIPANT: "run_started_for_participant",
    RUN_1DAY_BEFORE: "run_1day_before",
    RUN_2DAYS_BEFORE: "run_2days_before",
    START_DAY_MESSAGE: "start_day_message",
    MEASURE_DATA: "measure_data",
    RUN_HALFWAY_PARTICIPANT_LESS_THAN_50: "run_halfway_participant_less_than_50",
    RUN_HALFWAY_PARTICIPANT_MORE_THAN_50: "run_halfway_participant_more_than_50",
    RUN_COMPLETED_PARTICIPANT: "run_completed_participant",
    RUN_REMIND_PARTICIPANT: "run_remind_participant",
    RUN_COMPLETED_THANK_YOU: "run_completed_thank_you",
    RUN_STOP_PARTICIPATION: "run_stop_participation",


    // NOTIFICATION SENT TO EXP CREATOR
    INCOMPLETE_EXP_3DAYS: "incomplete_exp_3days",
    REVIEW_ON_MY_EXP: "review_on_my_exp",
    EXP_REVIEW_COMPLETE: "exp_review_complete",
    NEW_PILOT_PARTICIPANT: "new_pilot_participant",
    NEW_RUN_PARTICIPANT: "new_run_participant",
    PILOT_COMPLETED_CREATOR: "pilot_completed_creator",
    PILOT_REVIEWED: "pilot_reviewed",
    RUN_COMPLETED_CREATOR: "run_completed_creator",
    RUN_BEFORE_STARTED_CREATOR: "run_before_started_creator",
    RUN_CREATOR_HALFWAY: "run_creator_halfway",

    // NOTIFICATION SENT TO GUT INSTINCT ADMIN
    NEW_EXPERIMENT_CREATED: "new_exp_created",

    CLARIFICATION_NOTIFY_CREATOR: "clarification_notify_creator",
    CLARIFICATION_NOTIFY_PARTICIPANT: "clarification_notify_participant",
    REQUEST_DATA_ANALYSIS: "request_data_analysis",
    NEW_EXPS_PARTICIPANTS: "new_exps_participants",
    NEW_EXPS_WEEKLY_UPDATE: "new_exps_weekly_update"
};

export const OptionString = new Mongo.Collection('const_review_rubric');

// export const OptionString = {
//     // hypothesis field
//     CAUSE_SPECIFIC: "Is the cause specific?",
//     EFFECT_SPECIFIC: "Is the effect specific?",
//     RELATION_CLEAR: "Is the relation between cause and effect clear?",
//     HYPOTHESIS_CONCRETE: "Is the hypothesis concrete i.e. it either holds or it does not hold?",
//     MECHANISM: "Is this mechanism the most plausible explanation?",
//
//     // measure_cause and measure_effect fields
//     MEASURE_CAUSE: "Can the experiment participants correctly measure the cause?",
//     CHOICE_APPROPRIATE_CAUSE: "Is this choice of measurement appropriate for the cause?",
//     REMINDER_CONVENIENT: "Is the time of reminder convenient for the participants?",
//     REMINDER_APPROPRIATE: "Is the time of reminder appropriate to receive correct data?",
//     MEASURE_EFFECT: "Can the experiment participants correctly measure the effect?",
//     CHOICE_APPROPRIATE_EFFECT: "Is this choice of measurement appropriate for the effect?",
//
// //ensuring experimental conditions are fine
//     ARE_STEPS_CLEAR: "Are all the steps clear enough so all the participants interpret them consistently?",
//     IS_STEP_SAFE: "Is every step safe for participants? Please point out any step that asks participants to abstain from food, water, medication, or suggests extreme increase in physical activity!",
//     DAILY_ACTIVITIES: "People's daily activities can influence the cause measure. Do the steps account for this issue (called confounds)? For example, if an experiment studies the effect of coffee on sleep, participants should not drink soda (since soda has caffeine too).",
//
// // comparing condition_control and condition_experimental fields
//     CC_APPROPRIATE: "Is the control condition appropriate compared to the experimental condition? E.g. If comparing the effect of eating cabbage on bloatedness, control condition participants can eat lettuce/broccoli rather than not eating food at all.",
//     CC_DIFFER: "Do the control and experimental conditions differ in ONLY one step that manipulates the cause?",
//
//
//     CAN_PART_PERFORM: "Can participants perform all the steps in either condition in a reasonable time?",
//     //EVERY_STEP: "Does every step require participants to make ONLY minor tweaks in their lifestyle?",
//
//
//     // criteria_exclusion field
//     POTENTIAL_HARM: "Does this list exclude all participants who might be harmed from participating in the experiment (in both Control and Experimental conditions)?",
//     INFORMED_CONSENT: "Does this list exclude all participants who might not be able to provide informed consent to participate?",
//     ADHERENCE: "Does this list exclude participants who might not adhere to the steps for every day of the suggested duration? E.g. long-term smokers might struggle to avoid smoking in an experiment that studies the effect of smoking vs. non-smoking.",
//     GAIN: "Does this list exclude all participants who might not gain from the results of the experiment and the knowledge created?",
//
//     // criteria_inclusion field
//     APPROPRIATE_RESULTS: "Does the Inclusion Criteria include people whose participation will provide the most appropriate results? (E.g. for an experiment that tests the effect of regular coffee drinking, regular coffee drinkers should be included)",
// }

export const OpenHumansDataList = [{
        id: 0,
        title: "Gut Instinct Text Messages [DEFAULT]",
        description: "Gut Instinct automatically sends text messages to participants to get their data. You get this feature by default!",
        imgName: "default.png",
        default: true
    },
    /*
    {
        id:1,
        title:"23andMe",
        description:"23andMe is a direct-to-consumer genetic testing company that tests about one million genetic locations",
        dataNeeded:"Raw 23andMe genotyping data",
        imgName:"23&me.png",
        url:"https://www.openhumans.org/activity/23andme-upload/"
    },
    */
    {
        id: 1,
        title: "Fitbit",
        description: "Connect your Fitbit account to add data from your Fitbit activity trackers and other Fitbit devices",
        dataNeeded: "Data from Fitbit devices, including steps, heart rate, and heart rate, if available.",
        imgName: "fitbit.png",
        url: "https://www.openhumans.org/activity/fitbit-connection/"
    },
    /*
    {
        id:3,
        title:"AncestryDNA",
        description:"Ancestry.com's AncestryDNA is a direct-to-consumer genetic testing product that tests about 700,000 genetic locations",
        dataNeeded:"Raw AncestryDNA genotyping data",
        imgName:"ancestry.png",
        url:"https://www.openhumans.org/activity/ancestrydna-upload/"
    },
    {
        id:4,
        title:"Gencove",
        description:"Your genome app - get your ancestry, microbiome, and more! Contribute your data to OpenHumans",
        dataNeeded:"Sequencing bam files",
        imgName:"gencove.png",
        url:"https://www.openhumans.org/activity/gencove/"
    },
    {
        id:5,
        title:"Twitter Archive Analyzer",
        description:"The TwArχiv is a Twitter Archive Analyzer. Upload your Twitter archive and get new insights",
        dataNeeded:"Zipped Twitter archives",
        imgName:"twarxiv.png",
        url:"https://www.openhumans.org/activity/twitter-archive-analyzer/"
    },
    */
    {
        id: 2,
        title: "Runkeeper",
        description: "RunKeeper is a free smartphone app for GPS fitness-tracking. You can use it to record GPS timepoint data for runs, walks, bicycling etc.",
        dataNeeded: "Activity data from your Runkeeper account",
        imgName: "runkeeper.png",
        url: "https://www.openhumans.org/activity/runkeeper-connection/"
    },
    /*
    {
        id:7,
        title:"openSNP",
        description:"openSNP allows you to put your genetic and phenotypic data into the public domain. Connect your openSNP account to Open Humans",
        dataNeeded:"Will upload a link to the openSNP user page for two-way connection",
        imgName:"opensnp.png",
        url:"https://www.openhumans.org/activity/opensnp/"
    },
    {
        id:8,
        title:"Nightscout Data Transfer",
        description:"A tool to easily enable upload of data from individual Nightscout databases to the Open Humans platform",
        dataNeeded:"Data from Nightscout: profile.json, entries.json, treatments.json, and devicestatus.json",
        imgName:"nightscout.png",
        url:"https://www.openhumans.org/activity/nightscout-data-transfer/"
    },
    */
    {
        id: 3,
        title: "Open Humans Healthkit Integration",
        description: "Integrate Apple Healthkit data with Open Humans and Gut Instinct.",
        dataNeeded: "HealthKit data from your iPhone or iPad (visible in the Health app)",
        imgName: "healthkit.png",
        url: "https://www.openhumans.org/activity/open-humans-healthkit-integration/"
    },
    {
        id: 4,
        title: "Moves connection",
        description: "Moves is an always-on steps and location logging app for iPhone and Android. It classifies activities as walking, cycling, running, transit",
        dataNeeded: "Moves GPS tracking",
        imgName: "moves.png",
        url: "https://www.openhumans.org/activity/moves-connection/"
    },
    /*
    {
        id:11,
        title:"OpenAPS Data Commons",
        description:"The OpenAPS Data Commons collects data from DIY closed loopers and facilitates research in partnership with the DIY closed loop community.",
        dataNeeded:"Data from any associated project research surveys (such as an engagement score or other QOL data gathered)\nope",
        imgName:"openaps.png",
        url:"https://www.openhumans.org/activity/openaps-data-commons/"
    },
    {
        id:12,
        title:"Genome/Exome Upload",
        description:"Do you have genome or exome data? You can upload genome, exome, and genotyping data in VCF format.",
        dataNeeded:"VCF files",
        imgName:"genome-exnome.png",
        url:"https://www.openhumans.org/activity/genomeexome-upload/"
    },
    {
        id:13,
        title:"Data Selfies",
        description:"You have data that doesn't fit into any of Open Human's existing projects? Use Data Selfies to share it nevertheless!",
        dataNeeded:"All the data",
        imgName:"dataselfies.png",
        url:"https://www.openhumans.org/activity/data-selfies/"
    },
    */
    {
        id: 5,
        title: "Nokia Health (Withings) Connection",
        description: "Add your Nokia Health (Withings) data to Open Humans and Gut Instinct",
        dataNeeded: "Personal and environmental tracking data: body weight, temp, fat/water/muscle %; blood pressure; heart rate; air temp/quality; sleep; steps\n",
        imgName: "nokia-health.png",
        url: "https://www.openhumans.org/activity/nokia-health-withings-connection/"
    },
    /*
    {
        id:15,
        title:"Nightscout Data Commons",
        description:"The Nightscout Data Commons collects data from Nightscout users and facilitates research in partnership with the DIY diabetes community.",
        dataNeeded:"Data from any associated project research survey such as demographics.",
        imgName:"nightscout-datacommons.jpg",
        url:"https://www.openhumans.org/activity/nightscout-data-commons/"
    },
    {
        id:16,
        title:"uBiome Upload",
        description:"uBiome is a company based in San Francisco that performs microbiome sequencing",
        dataNeeded:"Raw uBiome sequencing data",
        imgName:"ubiome.png",
        url:"https://www.openhumans.org/activity/ubiome-upload/"
    },
    {
        id:17,
        title:"GoViral",
        description:"GoViral aims to map the spread of viruses in your community with kits and surveys",
        dataNeeded:"survey data and possibly kit results",
        imgName:"goviral.png",
        url:"https://www.openhumans.org/activity/goviral/"
    },
    */
    {
        id: 6,
        title: "Jawbone Connection",
        description: "Jawbone made activity trackers. If you have Jawbone data, you can import it here",
        dataNeeded: "Steps, sleep, and heartrate data, if available",
        imgName: "jawbone.png",
        url: "https://www.openhumans.org/activity/jawbone-connection/"
    }
    /*
    {
        id:19,
        title:"FamilyTreeDNA integration",
        description:"A simple project that allows you to connect your FamilyTreeDNA data with Open Humans",
        dataNeeded:"FamilyTreeDNA raw genotyping data",
        imgName:"familytree.png",
        url:"https://www.openhumans.org/activity/familytreedna-integration/"
    }
    */
];
