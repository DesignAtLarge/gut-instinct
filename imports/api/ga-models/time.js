import {
    Meteor
} from "meteor/meteor";

export const TimeUtil = {
    withinTime: function(start, end) {
        let now = (new Date()).getTime();
        return now > start && now < end;
    },
    previousDay: function(time) {
        let previous = new Date(time);
        this.setToStartOfDay(previous);
        previous.setTime(previous.getTime() - 1000 * 60 * 60 * 24);
        return previous;
    },
    setToStartOfDay: function(time) {
        time.setHours(0);
        time.setMinutes(0);
        time.setSeconds(0);
        time.setMilliseconds(0);
        return time;
    },
    getDay: function(startDate) {
        let now = (new Date()).getTime();
        this.setToStartOfDay(startDate);
        let diff = now - startDate.getTime();
        return floor(diff / 1000 / 60 / 60 / 24);
    },
    inSameDay: function(t1, t2) {
        let nt1 = new Date(t1),
            nt2 = new Date(t2);
        return this.setToStartOfDay(nt1).getTime() === this.setToStartOfDay(nt2).getTime();
    }
};

const TIME_OFFSET = -7;

export const Time = class {

    constructor(dt) {

        if (!dt) {
            this.time = new Date();
        } else if (dt instanceof Date) {
            this.time = dt;
        } else if (dt instanceof Time) {
            this.time = dt.getDate();
        } else if (dt instanceof Number) {
            this.time = new Date(dt);
        } else {
            throw new Error("Incompatible Type.");
        }
    }

    getDate() {
        return this.time;
    }

    minus(ts) {
        if (ts instanceof Number) {
            return new Time(this.time.getTime() - ts);
        } else if (ts instanceof TimeSpan) {
            return new Time(this.time.getTime() - ts.getMilliSeconds());
        } else {
            throw new Error("Incompatible Type.");
        }
    }

    addMilliSecond(ms) {
        this.time = new Date(this.time.getTime() + ms);
        return this;
    }

    addSecond(s) {
        return this.addMilliSecond(s * 1000);
    }

    addMinute(m) {
        return this.addSecond(m * 60);
    }

    addHour(h) {
        return this.addMinute(h * 60);
    }

    addDay(d) {
        return this.addHour(d * 24);
    }

    addMonth(m) {
        return this.addDay(m * 30);
    }

    addYear(y) {
        return this.addDay(y * 365);
    }

    addTimeSpan(ts) {
        if (!(ts instanceof TimeSpan)) {
            throw new Error("Incompatible Type. Expected TimeSpan Class");
        }
        return this.addMilliSecond(ts.getMilliSeconds());
    }

    setToStartOfDay() {
        this.time.setHours(0);
        this.time.setMinutes(0);
        this.time.setSeconds(0);
        this.time.setMilliseconds(0);
        return this;
    }

    getStartOfDay() {
        let s = new Time(this);
        return s.setToStartOfDay();
    }

    inSameDay(t) {
        if (t instanceof Number || t instanceof Date) {
            t = new Time(t);
        } else if (t instanceof Time) {

        } else {
            throw new Error("Incompatible Type.");
        }
        return this.getStartOfDay().getTime() === t.getStartOfDay().getTime();
    }

    static getNowInGmt() {
        if (Meteor.settings.debug_mode) {
            return (new Time()).addHour(-TIME_OFFSET); // localhost is giving PST, but prod server will give GMT, so for debugging uncomment this line and convert to GMT first
        } else {
            return new Time();
        }
    }
};

export const TimeSpan = class {
    constructor(dt1, dt2) {
        this.setStart(dt1);
        this.setEnd(dt2);
    }

    setStart(dt) {
        if (dt instanceof Date) {
            this.start = dt;
        } else if (dt instanceof Time) {
            this.start = dt.getDate();
        } else {
            throw new Error("Invalid Input. Expected Date or Time Class");
        }
    }

    setEnd(dt) {
        if (dt instanceof Date) {
            this.end = dt;
        } else if (dt instanceof Time) {
            this.end = dt.getDate();
        } else {
            throw new Error("Invalid Input. Expected Date or Time Class");
        }
    }

    getMilliSeconds() {
        return this.end.getTime() - this.start.getTime();
    }

    getSeconds() {
        return this.getMilliSeconds() / 1000;
    }

    getMinutes() {
        return this.getSeconds() / 60;
    }

    getHours() {
        return this.getMinutes() / 60;
    }

    getDays() {
        return this.getHours() / 24;
    }

    getMonths() {
        return this.getDays() / 30;
    }

    getYears() {
        return this.getDays() / 365;
    }

    within(dt) {
        let ts;
        if (dt instanceof Time) {
            ts = dt.getDate().getTime();
        } else if (dt instanceof Date) {
            ts = dt.getTime();
        } else {
            ts = dt;
        }
        let startts = this.start.getTime();
        let endts = this.end.getTime();
        return ts >= startts && ts <= endts;
    }
};