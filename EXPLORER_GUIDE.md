# PTI History Explorer: User Guide

## Overview

The PTI History Explorer (`pti_interactive.html`) replays a set of doubles matches through the PTI rating math and charts how each player's rating moved. You can then change starting ratings, add breaks, leave matches out or link duplicate player ids, and see the whole history recalculate instantly.

Lower PTI is better. Everything runs in your browser and nothing is uploaded.

The **Data** column on the left is where you load the sample data or your own two CSV files. The button at the left end of the header opens and closes it. The rest of the page has four parts, top to bottom:

- **Ratings over time**: the chart, with its controls and the predictive accuracy line.
- **Players**: every player, with search, sorting and the columns for start, now and change.
- **Breaks** and **Linked players**: the edits you've made, side by side with the players table on wide screens.
- **Matches for shown players**: every match played by the players on the chart, with a filter and a checkbox to leave each one out.

## Loading data

Click **Load sample data** to try the explorer with 10 fictional players and 90 matches. If you were given a password for shared data, click **Password** next to it and enter it there (see [tools/SHARING.md](tools/SHARING.md)). To use your own data, load two CSV files: starting ratings and matches.

There are three ways to load each file:

- Drop it on its box, or click the box to choose it from disk.
- Type a URL in the box underneath and click **Load URLs**.
- Put both URLs in the page address: `pti_interactive.html?ratings=ratings.csv&matches=matches.csv`. A URL on another site only works if that site allows cross-origin requests.

Once both files load, the status line reports how many players and matches were read and how long it took. It also says how many rating rows were skipped and how many matches couldn't be rated. The Data column then collapses to a slim rail showing the number of players (PTI) and matches (MAT), written as 75k or 1.2M once they pass a thousand or a million. Hover over the rail for the full status line, and click it or the header button to open the column again. On a phone the column opens as a drawer over the page and has no rail; tap outside it or **Hide** to close it.

### CSV format

Click the **CSV format** link next to **Data** on the page for a short version of this.

**Starting ratings** has one row per player. It needs the columns `id`, `pti` and `sigma`, and can also have `name` and `lastPlayed`.

- `lastPlayed` is the date of the player's last match before the history starts. It is used for the time gap before their first match.
- If the sigma is an official "Start Sigma", it already includes that gap, so leave `lastPlayed` empty.

```csv
id,name,pti,sigma,lastPlayed
1001,Alex Rivera,32.5,4.1,
1002,Sam Patel,28.0,5.2,2025-08-14
```

**Matches** has one row per match, oldest first, with the columns `date`, `player1id`, `player2id`, `player3id`, `player4id` and `score`.

- Players 1 and 2 are one team, and players 3 and 4 the other.
- The score is from team 1's side, with sets separated by commas. Put the score in quotes.
- Dates can be `YYYY-MM-DD` or `M/D/YYYY`.

```csv
date,player1id,player2id,player3id,player4id,score
2025-09-06,1001,1002,1003,1004,"6-3, 4-6, 1-0"
```

## The chart

The chart draws one line per shown player: a starting point (●) and then their rating after each match. When data loads, the five players with the most matches in the last 90 days of the data are shown. Add `?player=` and a player id to the page address to start with just that player instead. Players with placeholder names (🔒) are never picked for you. You can show up to 8 at a time from the Players table.

Click a name in the legend above the chart to hide or show that line. Hover any point to see the player, the match date and their PTI and sigma. When Show original is on, the tooltip also shows the original values.

### Chart controls

| Control | What it does |
| --- | --- |
| PTI / Sigma | Chart each player's PTI or their sigma (rating uncertainty). |
| By match # / By date | **By match #** spaces the dates the shown players played evenly, with no gaps for quiet weeks. **By date** uses a true calendar axis. |
| Y-axis scale: Fit data / Min 30 / Custom | **Fit data** fits the axis to the shown lines. **Min 30** (the default) shows at least 30 PTI points and grows like Fit data when the lines need more. **Custom** shows exactly the number of PTI points you type in the box next to it. The scale applies to PTI; Sigma always fits its data. |
| Move / Add break | Sets what a click on the chart does. See Editing ratings. |
| Show original | Overlays each shown player's history as it was loaded, before any of your edits, as a faded dashed line. |
| Better = up | Flips the axis so lower (better) PTI is at the top. |

### Predictive accuracy

The line under the chart title shows how well the ratings predict results. It is the share of matches won by the team with the lower combined PTI going into the match. Only rated, included matches count, and matches with level team ratings or no decided sets are skipped.

The number in parentheses is the same measure for the ratings as originally loaded. The current figure turns green when your edits predict better than the original and red when they predict worse. It is followed by how many more or fewer matches are predicted correctly (for example "+3 correct") and the number of matches counted.

## Editing ratings

Every edit recalculates the whole history, so you see right away how one change ripples through later matches for every player.

### Starting ratings

In **Move** mode, drag a player's first point (●) up or down to change their starting PTI. On the Sigma chart, the same drag changes their starting sigma. You can also type an exact value in the **Start PTI** or **Start sigma** box in the Players table.

### Breaks

A break (◆) sets a player's PTI, sigma or both just before a chosen match, for example after an injury or a long layoff.

1. Switch the chart to **Add break**, then click one of the player's match points. Shift-click does the same in Move mode.
2. Drag the break up or down to set its value.
3. Fine-tune it in the **Breaks** list. Each break shows the player, the match number, date and score, with PTI and Sigma boxes. A box left empty (it says "keep") leaves that value as calculated.
4. Remove a break with its **Remove** button, or double-click it on the chart.

A break on an excluded match stays in the list but does nothing until the match is included again.

### Start spread

To see how much a player's starting PTI matters, click **Start spread** under the chart. It starts with the first shown player; pick another shown player in the list that appears next to it. The chart adds dashed lines in their colour, each replaying their history from a different starting PTI with the same starting sigma. **lines** sets how many (2 to 6, 4 by default) and **every** sets the PTI between them (5 by default), so 4 lines every 5 PTI start at −10, −5, +5 and +10 from the current start. A note under the buttons says how far apart the lines are at the start and after the last match, which shows how quickly they converge. On the PTI chart, labels mark the lowest and highest starting PTI and the lowest and highest PTI after the last match, across the player's own line and the spread lines. Click **Start spread** again to turn it off and hide its controls.

Hover a spread line for its PTI after each match and how far it is from the player's own line. Click a spread line's start point (●) to make that the player's starting PTI; the spread then re-centres on it. The spread follows all your other edits, and goes into shared links.

### Undoing edits

- **Reset starting ratings** puts every starting PTI and sigma back to the values in the file.
- **Remove all breaks** deletes every break.
- Turn on **Show original** to compare your edited lines with the history as loaded.

## Players and linked ids

The Players table lists every player, with their starting and current ratings. Click a player's name to put them on the chart (up to 8), and click it again to take them off. A shown player has a dot in their line's colour next to their name, and players not on the chart have an empty ring. Shown players are listed first. **Clear shown** takes everyone off the chart.

Type in **Search players** to find players by name or id, and click or tap its × to clear it. Click a column header to sort by it, and click again to reverse the order. The table lists up to 200 rows at a time, so search or sort to reach the rest.

| Column | Meaning |
| --- | --- |
| Player | Name and id. Click it to show or hide the player on the chart. |
| Matches | Matches the player is in. |
| Now PTI | Rating after the player's last match, with all your edits. |
| Start PTI, Start sigma | Starting rating. Edit the boxes to change it. |
| Now sigma | Sigma after the player's last match, with all your edits. |
| Change | Now PTI minus Start PTI. |
| Δ Original | Now PTI minus the player's last PTI in the history as loaded. It shows what your edits did to that player. |

In the Change and Δ Original columns, green means the PTI went down (better) and red means it went up (worse).

### Partners and opponents

Switch the table from **Players** to **Partners** or **Opponents** to see who one player played with or against, and what those matches did to their PTI. The lists are for the player picked in **of**, which starts as the first player you put on the chart. Only players on the chart can be picked.

| Column | Meaning |
| --- | --- |
| Player | Name and id. Click it to show or hide that partner or opponent on the chart. |
| Matches with / Matches against | Rated matches the two played together, or against each other. |
| Cumulative PTI contribution | The sum of the picked player's PTI changes in those matches, with all your edits. |
| Per match | Cumulative PTI contribution divided by the matches. |

Lower PTI is better, so a green (negative) contribution means those matches brought the picked player's PTI down, and red means they pushed it up. The last row adds up all of the player's matches, which is their whole PTI change; in Opponents each match has two opponents, so the opponents' contributions add up to twice that. Players in a restricted pool your password doesn't unlock are listed as 🔒 Restricted, without a name and can't be clicked, as in the Matches table. **Search players** filters these lists too.

### Linking duplicate ids

When one person has more than one player id, link the ids so their matches count as one history. Each group acts as one player: the id with the earliest match keeps its starting PTI and sigma, and the other ids continue from there.

- Show the players on the chart and click **Link shown**. If one group is already shown, the other shown players join it.
- Or type two or more ids in **Linked players** (for example `1001, 1002`) and click **New group**.

Each group card in Linked players lists its ids. Use **Add** to put more ids in, **Unlink** to give one id its own history back, or **Unlink all** to undo the group.

In the Players table, the extra ids of a group are greyed out with "Not used while linked to" the main id. Δ Original for a group compares with the most recent original PTI of any of its ids. A match where two linked ids play each other can't be rated, and the Matches table marks it that way.

## Matches

**Matches for shown players** lists every match played by a player on the chart. Each row shows the date, both teams and the score. The last column shows each shown player's PTI going in and coming out, the change, and their sigma.

Click the **Date** header to switch between oldest and newest first. The table lists up to 300 matches at a time.

### Finding partners and opponents

Type a name or id in **Filter by player** to list only the matches where that player took part, as a partner or an opponent. The count changes to "X of Y matches". Click or tap the × in the box to show all matches again. The filter only narrows the list and doesn't change any ratings.

### Leaving matches out

Untick a match's **Use** box to leave it out of the calculation, for example a retired or mis-entered match. Every rating after it recalculates, and the row is marked "Excluded from the calculation". Tick it again to put it back, or click **Include all** to restore every excluded match.

A match where two linked ids of the same player meet is marked "Not rated: linked players are both in this match".

## Sharing a view

Click **Share** in the header to copy a link to what you're looking at. The link holds the shown players and which of their lines are hidden, linked ids, starting rating and sigma changes, the start spread, breaks, excluded matches, the chart options, which players list is open (Players, Partners or Opponents) and for whom, how the tables are sorted, and the text in both search boxes. It doesn't hold the data itself; if the page was opened with `?ratings=` and `?matches=` URLs, those stay in the link. Add `&player=` and an id to a shared link to open the shared view with that one player added to the chart.

When someone opens the link, the page waits until they load a data set, then applies the view to it. Anything the data doesn't have, such as a player id or a match that isn't in it, is skipped, and the status line says how many items were skipped. Matches are found by their date and four player ids, so a link still works on a later export of the same data.

If the browser can't copy to the clipboard, the page shows the link in a box to copy by hand.

## Tips

- **Try a what-if:** show a player, drag their start point, and watch their partners' and opponents' lines move too. The predictive accuracy line tells you whether the change fits the results better.
- **Check a layoff:** add a break before a player's first match after the gap, then compare with Show original.
- **Find who they played:** show one player and type a partner's or opponent's name in Filter by player.
- **Speed:** the line next to the reset buttons shows how long the last recalculation took.
- **Theme:** the **Light Mode** / **Dark Mode** button in the header switches the colours. Your choice is remembered.
- **Small screens:** the header tucks away while you scroll, the chart gets shorter, and you can drag points with a finger. The tables scroll sideways when they don't fit.
