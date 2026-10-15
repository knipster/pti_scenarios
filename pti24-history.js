/**
 * pti24-history.js
 *
 * Runs PTI 2.4 through an ordered list of doubles matches, carrying each
 * player's PTI and sigma from one match to the next, and returns the matches
 * with start/end PTI, sigma and break days added for all four players.
 *
 * Needs pti24() from pti24-refactored.js: load that file first in the browser,
 * or keep both files in the same folder in Node.
 *
 * Usage:
 *   var result = pti24History(
 *     {                                   // starting ratings, by player id
 *       alice: { pti: 20.0, sigma: 3.2, lastPlayed: '2026-09-01' },  // lastPlayed optional
 *       bob:   { pti: 22.0, sigma: 3.2 },
 *       carol: { pti: 21.0, sigma: 3.2 },
 *       dave:  { pti: 23.0, sigma: 3.2 }
 *     },
 *     [                                   // matches, oldest first
 *       { date: '2026-10-01', player1id: 'alice', player2id: 'bob',
 *         player3id: 'carol', player4id: 'dave', score: '6-3, 4-6, 6-2' }
 *     ]
 *   );
 *
 * Players 1 and 2 are one team, 3 and 4 the other; the score is written from
 * team 1's side. Matches are processed in the order given.
 *
 * Returns { matches, ratings }:
 *   matches  copies of the input rows (all original fields kept) with, for each
 *            player N = 1..4:
 *              playerNStartPti, playerNStartSigma, playerNBreakDays,
 *              playerNEndPti, playerNEndSigma, playerNDelta
 *            A row that can't be rated (unknown player, missing date) gets an
 *            `error` field instead and changes nobody's rating.
 *   ratings  each player's rating after the last match:
 *            { id: { pti, sigma, lastPlayed, matches } }
 *
 * Optional third argument { overrides: [...] } sets a player's rating at a
 * point in the history, e.g. to model a discontinuity:
 *   { id: 'alice', matchIndex: 12, pti: 18.5 }      // sigma, or both, also allowed
 * The override replaces the player's PTI and/or sigma just before
 * matches[matchIndex] is rated; later matches build on the new value.
 *
 * Dates may be YYYY-MM-DD (optionally followed by a time) or M/D/YYYY.
 *
 * Break days are whole days since the player's previous match (or their
 * starting lastPlayed). A player with no earlier date gets 0, as the
 * calculator does. If a starting sigma is an official "Start Sigma" (which
 * already includes the time decay), leave lastPlayed out for that player.
 */
(function (root) {
  var pti24 = root.pti24 || (typeof require === 'function' && require('./pti24-refactored.js'));
  var DAY_MS = 86400000;

  // Whole UTC day number, so break days don't depend on the viewer's time zone
  function toDay(d) {
    if (d === undefined || d === null || d === '') return null;
    if (d instanceof Date) return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS);
    var s = String(d).trim(), m;
    if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s))) return Math.floor(Date.UTC(+m[1], m[2] - 1, +m[3]) / DAY_MS);
    if ((m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s))) return Math.floor(Date.UTC(+m[3], m[1] - 1, +m[2]) / DAY_MS);
    var t = Date.parse(s);
    return isNaN(t) ? null : Math.floor(t / DAY_MS);
  }

  function pti24History(initialRatings, matches, options) {
    var overrides = {};  // matchIndex -> [override, ...]
    ((options && options.overrides) || []).forEach(function (o) {
      (overrides[o.matchIndex] = overrides[o.matchIndex] || []).push(o);
    });

    var ratings = {};
    Object.keys(initialRatings).forEach(function (id) {
      var r = initialRatings[id];
      ratings[id] = { pti: +r.pti, sigma: +r.sigma, lastPlayed: r.lastPlayed || null, matches: 0 };
    });

    var rows = matches.map(function (m, index) {
      (overrides[index] || []).forEach(function (o) {
        var r = ratings[o.id];
        if (!r) return;
        if (o.pti !== undefined && o.pti !== null) r.pti = +o.pti;
        if (o.sigma !== undefined && o.sigma !== null) r.sigma = +o.sigma;
      });
      var row = Object.assign({}, m);
      var ids = [m.player1id, m.player2id, m.player3id, m.player4id];
      var day = toDay(m.date);

      var missing = ids.filter(function (id) { return !ratings[id]; });
      if (missing.length) { row.error = 'No starting rating for: ' + missing.join(', '); return row; }
      if (day === null) { row.error = 'Missing or invalid date'; return row; }

      var players = ids.map(function (id) {
        var r = ratings[id], last = toDay(r.lastPlayed);
        return { pti: r.pti, sigma: r.sigma, breakDays: last === null ? 0 : Math.max(0, day - last) };
      });
      var result = pti24(players, m.score);

      ids.forEach(function (id, i) {
        var n = 'player' + (i + 1), p = result.players[i];
        row[n + 'StartPti'] = players[i].pti;
        row[n + 'StartSigma'] = players[i].sigma;
        row[n + 'BreakDays'] = players[i].breakDays;
        row[n + 'EndPti'] = p.pti;
        row[n + 'EndSigma'] = p.sigma;
        row[n + 'Delta'] = p.delta;
        ratings[id] = { pti: p.pti, sigma: p.sigma, lastPlayed: m.date, matches: ratings[id].matches + 1 };
      });
      if (!result.sets.length) row.error = 'No sets in score; ratings unchanged';
      return row;
    });

    return { matches: rows, ratings: ratings };
  }

  root.pti24History = pti24History;
  if (typeof module !== 'undefined' && module.exports) module.exports = pti24History;
})(typeof globalThis !== 'undefined' ? globalThis : this);
