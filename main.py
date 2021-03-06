from functools import total_ordering
import csv


class ShiftPeriods:
    def __init__(self, periods):
        self.periods = periods


monitor_shift_periods = ShiftPeriods([4, 4, 4, 3])
interpreter_shift_periods = ShiftPeriods([3, 4, 4, 4])

shift_period_from_string = {
    "9 am - 12 pm": 0,
    "12 pm - 4 pm": 1,
    "4 pm - 8 pm": 2,
    "8 pm - 12 am": 3,

    "9 am - 1 pm": 0,
    "1 pm - 5 pm": 1,
    "5 pm - 9 pm": 2,
    "9 pm - 12 am": 3,
}

def make_2d_array(value, h, w):
    return [[value] * w for i in range(h)]

@total_ordering  # make this support sorting
class Person:
    def __init__(self):
        # availability[d][s] is True => person is available at shift s in day d
        # example: [[True, False, False, True], [False, False, True, True], ...]
        self.availability = make_2d_array(True, 7, 4)
        self.assigned = make_2d_array(0, 7, 4)  # -1 means not assigned
        self.assigned_hour = 0
        
        self.available_hours = 15 * 7
        self.name = ''
        self.lang = ''
        self.shift_periods = interpreter_shift_periods
        self.extra_priority = 0

    def set_unavailability(self, day, shift):  # sets a shift available
        self.availability[day][shift] = False
        self.available_hours -= self.shift_periods.periods[shift]

    def update_available_hours(self):
        # calculates the amount of available hours
        self.available_hours = 0
        for day in self.availability:
            for shift in range(len(day)):
                if day[shift]:
                    self.available_hours += self.shift_periods.periods[shift]

    def set_unavailability_from_str(self, day, string):
        periods = string.split(',')
        # print(periods)
        for period in periods:
            if period:
                self.set_unavailability(day, shift_period_from_string[period.strip()])

    second_call_factor = 0.2  # by how much should we reduce the priority when we have the second call

    def add_assigned_hour(self, day, shift, oncall):
        self.assigned[day][shift] = oncall + 1
        shift_period = self.shift_periods.periods[shift]
        self.extra_priority += shift_period / (oncall * Person.second_call_factor + 1)
        self.assigned_hour += shift_period

    def priority(self):
        # return -100/self.available_hours + self.assigned_hour
        return self.extra_priority * 1000 + self.available_hours
        # avail hours, assigned hours,

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name

    def __eq__(self, other):  # equality
        return self.priority() == other.priority()

    def __lt__(self, other):  # lower than
        return self.priority() < other.priority()


def calculate(people, number_of_people_per_shift):
    for d in range(7):
        people.sort()
        for s in range(4):
            selected = []
            for i in range(len(people)):
                if not (people[i].availability[d][s] and len(selected) < number_of_people_per_shift):
                    people[i - len(selected)] = people[i]  # move the unselected people forward
                else:
                    people[i].add_assigned_hour(d, s, len(selected))
                    selected.append(people[i])
            for i in range(len(selected)):
                people[-i - 1] = selected[i]  # place selected people at the back of the queue
            print(selected)


filename = 'data.csv'
people = []
with open(filename, newline='') as csvfile:
    data = tuple(csv.reader(csvfile, delimiter=',', quotechar='"'))
    for row in data:
        if not row[0]:
            continue  # skip if row doesn't contain valid data
        p = Person()
        p.shift_periods = interpreter_shift_periods
        p.name = row[0]
        p.language = row[1]
        for day in range(7):
            # print(day, row[2 + day])
            p.set_unavailability_from_str(day, row[2 + day])
        people.append(p)

calculate(people, 2)

for p in people:
    print(p.name, p.assigned_hour, p.assigned)
