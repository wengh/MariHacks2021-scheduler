function make_2d_array(value, h, w) {
    return new Array(h).fill(value).map(() => new Array(w).fill(value));
}

const monitor_shift_periods = [4, 4, 4, 3];
const interpreter_shift_periods = [3, 4, 4, 4];

const shift_period_from_str = {
    "9 am - 12 pm": 0,
    "12 pm - 4 pm": 1,
    "4 pm - 8 pm": 2,
    "8 pm - 12 am": 3,

    "9 am - 1 pm": 0,
    "1 pm - 5 pm": 1,
    "5 pm - 9 pm": 2,
    "9 pm - 12 am": 3,
}

let second_call_factor = 0.2; // by how much should we reduce the priority when we have the second call
let less_consecutive_factor = 0.5; // by how much should we reduce the priority when we have the second call

class Person {
    constructor() {
        this.availability = make_2d_array(true, 7, 4);
        this.assigned = make_2d_array(0, 7, 4); // 0 means unassigned
        this.assigned_hours = 0;
        this.available_hours = 15 * 7;
        this.base_priority = 0;
        this.time_since_last_shift = 10;
        this.name = 'name';
        this.lang = 'lang';
        this.shift_periods = interpreter_shift_periods;
    }

    set_unavailability(day, shift) {
        if (shift === undefined) {
            throw 'Shift period is invalid! Make sure that they are formatted as follows: "9 am - 12 pm"';
        }
        this.availability[day][shift] = false;
        this.available_hours -= this.shift_periods[shift];
    }

    set_unavailability_from_str(day, str) {
        let periods = str.split(',');
        periods.forEach(period => {
            if (period != '')
                this.set_unavailability(day, shift_period_from_str[period.trim()]);
        });
    }

    add_assigned_hour(day, shift, call) {
        this.assigned[day][shift] = call + 1;
        const shift_period = this.shift_periods[shift];
        this.base_priority += shift_period / (call * second_call_factor + 1);
        this.assigned_hours += shift_period;
    }

    priority() {
        return 1000 * (this.base_priority - this.time_since_last_shift * less_consecutive_factor) + this.available_hours;
    }
}

function sort_people_by_priority(people) {
  people.sort((lhs, rhs) => {
    l = lhs.priority();
    r = rhs.priority();
    if (l < r) return -1;
    if (l > r) return 1;
    return 0;
  });
}

function calculate_schedule(people, number_of_people_per_shift) {
    people = [...people]; // shallow copy
    for (d = 0; d < 7; d++) {
        for (s = 0; s < 4; s++) {
            sort_people_by_priority(people);
            let selected = [];
            for (i = 0; i < people.length; i++) {
                if (!people[i].availability[d][s] || selected.length >= number_of_people_per_shift) {
                    people[i].time_since_last_shift++;
                } else {
                    selected.push(people[i]);
                }
            }
            sort_people_by_priority(selected);
            for (i = 0; i < selected.length; i++) {
                selected[i].time_since_last_shift = 0;
                selected[i].add_assigned_hour(d, s, i);
            }
        }
        for (i = 0; i < people.length; i++) {
            people[i].time_since_last_shift += 3;
        }
    }
}

/**
 * Calculates the shifts from non-availability data.
 *
 * @param  {'INPUT: Mandarin'!K2:S}  non_availabilities                Range that represents non-availabilities. Must have a width of 9. Each row represents a person; the 1st column contains the person's name; the 2nd column is unused; the 3rd - 9th columns contain non-availabilities for each day of the week.
 * @param  {2}                       number_of_people_per_shift        Positive integer: the number of people to select per shift.
 * @param  {N3:N6}                   shift_periods                     Range with height 4 and width 1: the length of each of the 4 shifts in a day.
 * @param  {0.2}                     second_call_priority_factor       Optional number: 0 means that second call has same weight as first call; 1 means that second call has half the weight of first call.
 * @param  {0.5}                     less_consecutive_priority_factor  Optional number: weight of time since last shift. 0 means that we do not care about time between shifts and only attempt to better balance total working time. High value means that we do not care about total working time and only try to minimize consecutive shifts.
 * @return                                                             Table with width 7 and height 4 * number_of_people_per_shift: people on call for each time period.
 * @customfunction
 */
function MAKE_SCHEDULE(non_availabilities, number_of_people_per_shift, shift_periods, second_call_priority_factor = 0.2, less_consecutive_priority_factor = 0.5) {
    second_call_factor = second_call_priority_factor;
    less_consecutive_factor = less_consecutive_priority_factor;
    let people = [];
    non_availabilities.forEach(row => {
        if (row[0] == '') return;
        let p = new Person();
        p.shift_periods = shift_periods;
        p.name = row[0];
        p.language = row[1];
        for (day = 0; day < 7; day++) {
            p.set_unavailability_from_str(day, row[2 + day]);
        }
        people.push(p);
    });
    calculate_schedule(people, number_of_people_per_shift);


    let ans = make_2d_array('', 4 * number_of_people_per_shift, 7);

    for (d = 0; d < 7; d++) {
        for (s = 0; s < 4; s++) {
            for (c = 0; c < number_of_people_per_shift; c++) {
                people.forEach(person => {
                    if (person.assigned[d][s] == c + 1) {
                        ans[s * number_of_people_per_shift + c][d] = person.name;
                    }
                });
            }
        }
    }

    return ans;
}

// use this for debugging outside of Google Apps Script environment
function debug() {
    const number_of_people_per_shift = 2;
    const shift_periods = interpreter_shift_periods;
    const data = [["MAND.01","Mandarin","9 am - 12 pm, 4 pm - 8 pm","9 am - 12 pm, 4 pm - 8 pm","9 am - 12 pm, 4 pm - 8 pm","9 am - 12 pm, 4 pm - 8 pm","9 am - 12 pm, 4 pm - 8 pm","9 am - 12 pm, 4 pm - 8 pm","9 am - 12 pm, 4 pm - 8 pm"],["MAND.03","Mandarin","9 am - 12 pm, 8 pm - 12 am","9 am - 12 pm, 8 pm - 12 am","9 am - 12 pm, 8 pm - 12 am","9 am - 12 pm, 8 pm - 12 am","9 am - 12 pm, 8 pm - 12 am","9 am - 12 pm, 8 pm - 12 am","9 am - 12 pm, 8 pm - 12 am"],["MAND.04","Mandarin","8 pm - 12 am","8 pm - 12 am","9 am - 12 pm, 8 pm - 12 am","4 pm - 8 pm, 8 pm - 12 am","9 am - 12 pm, 4 pm - 8 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am","8 pm - 12 am"],["MAND.05","Mandarin","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am"],["MAND.06","Mandarin","9 am - 12 pm, 12 pm - 4 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm","9 am - 12 pm, 12 pm - 4 pm","9 am - 12 pm, 12 pm - 4 pm, 8 pm - 12 am"],["MAND.08","Mandarin","9 am - 12 pm, 4 pm - 8 pm, 8 pm - 12 am","9 am - 12 pm","9 am - 12 pm","9 am - 12 pm","9 am - 12 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am"],["MAND.09","Mandarin","4 pm - 8 pm","12 pm - 4 pm, 4 pm - 8 pm","4 pm - 8 pm","","","12 pm - 4 pm","12 pm - 4 pm"],["MAND.10","Mandarin","4 pm - 8 pm, 8 pm - 12 am","4 pm - 8 pm, 8 pm - 12 am","4 pm - 8 pm, 8 pm - 12 am","4 pm - 8 pm, 8 pm - 12 am","9 am - 12 pm, 4 pm - 8 pm, 8 pm - 12 am","4 pm - 8 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am"],["MAND.11","Mandarin","9 am - 12 pm, 12 pm - 4 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am"],["MAND.12","Mandarin","9 am - 12 pm, 4 pm - 8 pm","9 am - 12 pm, 4 pm - 8 pm","9 am - 12 pm, 4 pm - 8 pm","9 am - 12 pm, 4 pm - 8 pm","9 am - 12 pm, 4 pm - 8 pm","9 am - 12 pm, 8 pm - 12 am","9 am - 12 pm, 8 pm - 12 am"],["MAND.13","Mandarin","8 pm - 12 am","8 pm - 12 am","8 pm - 12 am","8 pm - 12 am","8 pm - 12 am","8 pm - 12 am","8 pm - 12 am"],["MAND.14","Mandarin","9 am - 12 pm, 12 pm - 4 pm","9 am - 12 pm, 12 pm - 4 pm","9 am - 12 pm, 12 pm - 4 pm","9 am - 12 pm, 12 pm - 4 pm","9 am - 12 pm, 12 pm - 4 pm","12 pm - 4 pm","12 pm - 4 pm"],["MAND.15","Mandarin","8 pm - 12 am","8 pm - 12 am","8 pm - 12 am","8 pm - 12 am","8 pm - 12 am","8 pm - 12 am","8 pm - 12 am"],["MAND.18","Mandarin","9 am - 12 pm, 12 pm - 4 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am"],["MAND.19","Mandarin","12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am","12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am","9 am - 12 pm, 12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am","12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am","12 pm - 4 pm, 4 pm - 8 pm, 8 pm - 12 am"]];
    console.log(MAKE_SCHEDULE(data, number_of_people_per_shift, shift_periods));
}
