function MAKE_SCHEDULE(thing) {
  
}

function make_2d_array(value, h, w) {
    return new Array(h).fill(0).map(() => new Array(w).fill(0));
}

const monitor_shift_periods = [4, 4, 4, 3];
const interpreter_shift_periods = [3, 4, 4, 4];

shift_period_from_str = {
    "9 am - 12 pm": 0,
    "12 pm - 4 pm": 1,
    "4 pm - 8 pm": 2,
    "8 pm - 12 am": 3,

    "9 am - 1 pm": 0,
    "1 pm - 5 pm": 1,
    "5 pm - 9 pm": 2,
    "9 pm - 12 am": 3,
}

class Person {
    constructor() {
        this.availability = make_2d_array(true, 7, 4);
        this.assigned = make_2d_array(0, 7, 4); // 0 means unassigned
        this.assigned_hours = 0;
        this.available_hours = 15 * 7;
        this.base_priority = 0;
        this.name = 'name';
        this.lang = 'lang';
        this.shift_periods = interpreter_shift_periods;
    }

    set_unavailability(day, shift) {
        this.availability[day][shift] = false;
        this.available_hours -= this.shift_periods[shift];
    }

    set_unavailability_from_str(self, day, str) {
        periods = str.split(',');
        for (period in periods) {
            if (period != '')
                this.set_unavailability(day, shift_period_from_str[period.trim()]);
        };
    }

    const second_call_factor = 0.2; // by how much should we reduce the priority when we have the second call

    add_assigned_hour(day, shift, call) {
        this.assigned[day][shift] = call + 1;
        const shift_period = this.shift_periods.periods[shift];
        this.base_priority += shift_period / (call * second_call_factor + 1);
        this.assigned_hours += shift_period;
    }

    priority() {
        return this.base_priority * 1000 + this.available_hours;
    }

    static calculate_schedule(people, number_of_people_per_shift) {
        people = [...people]; // shallow copy
        for (d = 0; d < 7; d++) {
            people.sort((lhs, rhs) => {
                l = lhs.priority();
                r = rhs.priority();
                if (l < r) return -1;
                if (l > r) return 1;
                return 0;
            });
            for (s = 0; s < 4; s++) {
                let selected = [];
                for (i = 0; i < people.length; i++) {
                    if (!people[i].availability[d][s] || selected.length >= number_of_people_per_shift) {
                        people[i - selected.length] = people[i]; // move the unselected people forward
                    } else {
                        people[i].add_assigned_hour(d, s, selected);
                        selected.push(people[i]);
                    }
                }
                for (i = 0; i < selected.length; i++) {
                    people[people.length - i - 1] = selected[i]; // place selected people at the back of the queue
                }
            }
        }
    }
}