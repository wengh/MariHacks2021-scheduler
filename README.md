# MariHacks2021-scheduler
Challenge: https://docs.google.com/spreadsheets/d/1EMK5Nl3WKDuZpXMJWORDGYW_U2WAvUncjpiyKl2s-_A/edit#gid=787734152

## Inspiration
* Some of our group members had thought about creating a school scheduler before but never made one, so this was a chance for us to get some actual experience in creating a scheduler algorithm and using it to create schedules in Google Sheets. 
* We also thought this would be a great way to help the SVI group and those who take time out of their day to volunteer to help patients.

## What it does
* For a specific language, the scheduler takes in an input of volunteer non-availabilities from Google Forms and creates weekly volunteer schedules from that data, including first and second on-calls for different shifts of each day. 
* The scheduler dashboard displays the current on-call volunteers and the on-call volunteers for the next shift of the day. 
* Temporary modifications of non-availabilities for up to 4 weeks in advance are supported.
* New input and output schedule sheets can be created with a template.

## How we built it
* The scheduler is based on a greedy algorithm (takes the best immediate solution) combined with a priority queue based on factors such as:
    * The number of available hours a volunteer has in a week.
    * How many hours of first on-calls and second on-calls they've already been assigned for the week.
    * How much time elapsed since they were last assigned.
* The code for our project was done in JavaScript, and we used the Google Apps Script platform so our code could interact with Google Sheets.

## Challenges we ran into
* Initially, we made our code in Python, but we couldn't get that code to run without having some sort of backend, so we translated the Python code to JavaScript so we could use it in Google Apps Script. 
* Also, none of us had used Google Apps Script before, so we needed to learn the functions for interacting with the spreadsheet.

## Accomplishments that we're proud of
* We're proud that our code works and is able to create schedules that are similar to the sample schedules given, in terms of how the work hours are spread among volunteers.
* We're also proud that we managed to pull this off in such a short time.
* We're glad that hopefully our project will help those working in the SVI group so they can manage things more efficiently.

## What we learned
* We learned how to use Google Apps Script to create interactive spreadsheets.
* We learned how to use Excel / Google Sheet cell formulas at a very advanced level.
* We also learned how to make a scheduling algorithm that finds a very practical solution while being efficient. Hopefully we can use this in the future to create a course scheduler for schools that students could use to create their schedules for a semester.

## What's next for SVI Scheduler
* We're very open to feedback from the SVI group and admins, and we're willing to help in case any issues are found in our scheduler. 
