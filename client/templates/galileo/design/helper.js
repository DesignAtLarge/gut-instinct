import {
    MeasureType
} from "../../../../imports/api/ga-models/constants";

module.exports = {
    transcribeTime(t) {
        let reminderTime = parseInt(t);
        return (reminderTime === 12) ? "12:00 noon" : reminderTime > 12 ? ((reminderTime - 12) + " pm ") : (reminderTime + " am ");
    },
    toggleEditButton(id) {
        $('#' + id + '-div').toggleClass('hide');
        $('#' + id + '-editable').toggleClass('hide');

        $('#accept-edit-' + id).toggleClass('hide');
        $('#cancel-edit-' + id).toggleClass('hide');
        $('#edit-' + id).toggleClass('hide');
    },
    getEditableExclusionList(exclusion) {
        let exclusionCriteria = exclusion;
        if (exclusionCriteria && exclusionCriteria.length > 0) {
            let arr = exclusionCriteria.map(function(str, id) {
                return {
                    'id': id + 1,
                    'checked': false,
                    'text': str,
                    'fixed': id < 4
                }
            });
            arr.push({
                id: arr.length + 1,
                checked: false,
                text: '',
                placeholder: 'Add another criterion',
                fixed: false
            });
            return arr;
        }
    },
    getEditableInclusionList(inclusion) {
        let inclusionCriteria = inclusion;
        let arr = [];
        if (inclusionCriteria && inclusionCriteria.length > 0) {
            arr = inclusionCriteria.map(function(str, id) {
                return {
                    'id': id + 1,
                    'checked': false,
                    'text': str,
                    'fixed': false
                }
            });
        }

        arr.push({
            id: arr.length + 1,
            checked: false,
            text: '',
            placeholder: 'Add another criterion',
            fixed: false
        });
        return arr;
    },
    getEditableSteps(condition) {
        let arr = [];
        if (condition && condition.steps && condition.steps.length > 0) {
            arr = condition.steps.map(function(str, id) {
                return {
                    'id': id + 1,
                    'checked': false,
                    'text': str,
                    'fixed': false
                }
            });
        }
        // in case there's no step, edit button should give the option to add one
        arr.push({
            id: arr.length + 1,
            checked: false,
            text: '',
            placeholder: 'Add another step',
            fixed: false
        });
        return arr;
    },
    getEditablePrepSteps(condition) {
        let arr = [];
        if (condition && condition.prep_steps && condition.prep_steps.length > 0) {
            arr = condition.prep_steps.map(function(str, id) {
                return {
                    'id': id + 1,
                    'checked': false,
                    'text': str,
                    'fixed': false
                }
            });
        }
        // in case there's no step, edit button should give the option to add one
        arr.push({
            id: arr.length + 1,
            checked: false,
            text: '',
            placeholder: 'Add another step',
            fixed: false
        });
        return arr;
    },
    getTextArrayFromEditableList(editableList) {
        let a = [];
        for (let i = 0; i < editableList.length; i++) {
            let editItem = editableList[i];
            let text = editItem.text.trim();
            if (text.length > 0) {
                a.push(editItem.text);
            }
        }
        return a;
    },
    getReminderText(variable, measure) {
        if (variable === undefined || variable === null || measure === undefined || measure === null) {
            return "";
        }

        let type = measure.type;
        if (type === MeasureType.ABS_PRES) {
            return "Was " + variable + " absent or present in your day today? Reply Yes for present, No for absent.";
        } else if (type === MeasureType.AMOUNT) {
            return "What was the amount of " + variable + " today? Please provide your answer in " + measure.unit + ".";
        } else if (type === MeasureType.RATE) {
            let qn = "What was the speed of " + variable + " today?";
            if (measure.unit) {
                qn = qn + "Please provide your answer in " + measure.unit + ".";
            } else {
                qn = qn + "Please provide your answer on a scale of 1 to 5 (1 means really slow, 5 means really fast)";
            }
            return qn;
        } else if (type === MeasureType.FREQUENCY) {
            return "What was the frequency of " + variable + " today?";
        } else if (type === MeasureType.RATING) {
            return "How would you rate " + variable + " today? Please provide your answer on a scale of 1 to 5 (1 means " + measure.minRating + ", 5 means " + measure.maxRating + ")";
        } else if (type === MeasureType.BRISTOL) {
            return "How would you classify " + variable + " on the Bristol Stool Chart? Please refer to the chart here (https://en.wikipedia.org/wiki/Bristol_stool_scale) and reply with a value between 1 to 7.";
        }
    },

    measureTextFromType(measureType) {
        switch (measureType) {
            case MeasureType.ABS_PRES:
                return MeasureType.ABS_PRES;
            case MeasureType.AMOUNT:
                return MeasureType.AMOUNT;
            case MeasureType.RATE:
                return "Speed";
            case MeasureType.FREQUENCY:
                return MeasureType.FREQUENCY;
            case MeasureType.RATING:
                return MeasureType.RATING;
            case MeasureType.BRISTOL:
                return "Bristol Scale value";
            default:
                return "";
        }
    }
};