# ShakeSearch

Welcome to the Pulley Shakesearch Take-home Challenge! In this repository,
you'll find a simple web app that allows a user to search for a text string in
the complete works of Shakespeare.

You can see a live version of the app at
https://pulley-shakesearch.onrender.com/. Try searching for "Hamlet" to display
a set of results.

In it's current state, however, the app is in rough shape. The search is
case sensitive, the results are difficult to read, and the search is limited to
exact matches.

## Your Mission

Improve the app! Think about the problem from the **user's perspective**
and prioritize your changes according to what you think is most useful.

You can approach this with a back-end, front-end, or full-stack focus.

## Evaluation

We will be primarily evaluating based on how well the search works for users. A search result with a lot of features (i.e. multi-words and mis-spellings handled), but with results that are hard to read would not be a strong submission.

## Submission

1. Fork this repository and send us a link to your fork after pushing your changes.
2. Render (render.com) hosting, the application deploys cleanly from a public url.
3. In your submission, share with us what changes you made and how you would prioritize changes if you had more time.

## Improvements

**Highlight matches** - make the matching query more visible in the results

**Number matches** - show the user the total number of results the query generated. Number each result to allow for easier differentitation

**Show containing work** - shows the specific work from which the match was retrieved

**Case sensitivity** - added the option for case sensitive or insensitive search

**Whole word match** - added the option to match whole word rather than partial

**Multiple words** - multiple words can be matched

**Reading Panel** - the ability for the user to click on a query match and see a larger context around that match. Includes the ability to move forward and backward in the text starting from the match location

If I spent more time I would prioritize the following (in order):

1.) Give the user the ability to select a specific work to search within
2.) handle misspellings - in the case that there was no match found the system could suggest potential options for similar items found in the text
3.) scroll automatically in reader to match
4.) wouldn't page break on words

Functionalties #1 and #2 would improve the user's ability to quicky find what he or she is looking for, while #3 and #4 are visual / usability improvements
