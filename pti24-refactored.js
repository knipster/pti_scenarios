/**
 * pti24-refactored.js
 *
 * Self-contained PTI 2.4 doubles rating update, refactored from pti24.js and
 * the score parser in calculator2.html. No dependencies; works in the browser
 * (global `pti24`) and in Node (`require('./pti24-refactored.js')`).
 *
 * Usage:
 *   pti24([
 *     { pti: 20.0, sigma: 3.2, breakDays: 7 },   // Team 1, player
 *     { pti: 22.0, sigma: 3.2, breakDays: 14 },  // Team 1, partner
 *     { pti: 21.0, sigma: 3.2, breakDays: 0 },   // Team 2, opponent 1
 *     { pti: 23.0, sigma: 3.2 }                  // Team 2, opponent 2 (breakDays defaults to 0)
 *   ], "6-3, 4-6, 6-2");
 *
 * Looping over a list of matches:
 *   matches.forEach(function (m) {
 *     var r = pti24(m.players, m.score);
 *     m.adjustments = r.players.map(function (p) { return p.delta; });
 *   });
 *
 * Players may also be given as arrays: [pti, sigma, breakDays].
 * The score is written from Team 1's side, sets separated by commas.
 * Lower PTI is better, so winners' PTIs go down and losers' go up.
 *
 * Returns:
 *   {
 *     players: [{ pti, sigma, delta, sigmaDelta }, ...],  // same order as input
 *     sets:    [{ winner: 1|2, gamePct }, ...]            // sets that were parsed
 *   }
 * With no parsable sets, PTIs are returned unchanged (delta 0).
 *
 * Note: the original calculator always uses breakDays = 0, which still adds
 * about 0.002 to sigma. Pass real breakDays to apply the time decay.
 */
function pti24(players, score) {
  // Fitted PTI 2.4 constants (from pti24.js)
  var TAU = 0.012565086385508734;           // per-set uncertainty added to sigma
  var TWO_BETA_SQUARED = 32;                // inherent randomness of the sport
  var MAX_SIGMA = 5.328067859319834;        // cap on sigma after time decay
  var TIME_RATE = 0.013214883335727136;     // time decay: logistic in days
  var TIME_SCALE = 0.7170782493781991;
  var TIME_SHIFT = 435.6036467141399;
  var SCORE_SCALE = 4.820362954958707;      // how much game share scales movement
  var SURPRISE_FACTOR = 1.005368928469052;  // sigma shrink for expected results
  var PTI_SCALE = 0.851, PTI_SHIFT = 4.87;  // PTI = 0.851 * perf + 4.87

  // Players -> internal { perf, vol }, sigma inflated by time since last match
  var ps = players.map(function (p) {
    var pti = Array.isArray(p) ? p[0] : p.pti;
    var sigma = Array.isArray(p) ? p[1] : p.sigma;
    var days = (Array.isArray(p) ? p[2] : p.breakDays) || 0;
    var decay = TIME_SCALE / (1 + Math.exp(-TIME_RATE * (days - TIME_SHIFT)));
    return {
      pti: +pti,
      sigma: +sigma,
      perf: (pti - PTI_SHIFT) / PTI_SCALE,
      vol: Math.min(+sigma + decay, MAX_SIGMA)
    };
  });

  // "6-4, 6-6(7-5), 1-0" -> [{ winner, gamePct }], gamePct = set winner's share of games.
  // Sets count as APTA counts them (same rules as parseSets in pti24-engine.js):
  //   - a finished set (either side has 6+ games, games not tied): share of games;
  //   - games tied (6-6), or at most one game played with tiebreak points (a match
  //     tiebreak, 1-0(10-8) or 0-0(10-8)): 0.54 to the tiebreak winner;
  //   - 1-0 or 0-1 with no tiebreak points: 0.54 to the side with the game;
  //   - anything else unfinished (5-4, 2-0, 3-3(7-5)) doesn't count.
  // "(x-y)" is the tiebreak points from the same side as the games; a suffix
  // without a dash, as in "7-6(5)", is ignored.
  var sets = [];
  String(score || '').split(',').forEach(function (s) {
    var open = s.indexOf('('), x = 0, y = 0;
    if (open >= 0) {
      var t = s.slice(open + 1).replace(')', '').split('-');
      if (t.length === 2) {
        x = parseInt(t[0], 10); y = parseInt(t[1], 10);
        if (isNaN(x) || isNaN(y)) x = y = 0;
      }
      s = s.slice(0, open);
    }
    var g = s.trim().split('-');
    if (g.length !== 2) return;
    var a = parseInt(g[0], 10), b = parseInt(g[1], 10);
    if (isNaN(a) || isNaN(b) || a + b + x + y === 0) return;
    if (a < 6 && b < 6) {
      if (x + y === 0) { if (a + b === 1) sets.push({ winner: a > b ? 1 : 2, gamePct: 0.54 }); }
      else if (a + b <= 1 && x !== y) sets.push({ winner: x > y ? 1 : 2, gamePct: 0.54 });
    } else if (a !== b) sets.push({ winner: a > b ? 1 : 2, gamePct: Math.max(a, b) / (a + b) });
    else if (x !== y) sets.push({ winner: x > y ? 1 : 2, gamePct: 0.54 });
  });

  // Apply each set in order
  sets.forEach(function (set) {
    var winners = set.winner === 1 ? [ps[0], ps[1]] : [ps[2], ps[3]];
    var losers = set.winner === 1 ? [ps[2], ps[3]] : [ps[0], ps[1]];

    [ps[0], ps[1], ps[2], ps[3]].forEach(function (p) {
      p.vol = Math.sqrt(TAU * TAU + p.vol * p.vol);
    });

    var lPerf = losers[0].perf + losers[1].perf;
    var wPerf = winners[0].perf + winners[1].perf;
    var lVar = losers[0].vol * losers[0].vol + losers[1].vol * losers[1].vol;
    var wVar = winners[0].vol * winners[0].vol + winners[1].vol * winners[1].vol;
    var ciq = Math.sqrt(lVar + wVar + TWO_BETA_SQUARED);   // total match uncertainty
    var gameScale = SCORE_SCALE * (set.gamePct - 0.5) + 0.7;

    var lPiq = 1 / (1 + Math.exp((wPerf - lPerf) / ciq));  // loser team's PIQ
    var wPiq = 1 / (1 + Math.exp((lPerf - wPerf) / ciq));  // winner team's PIQ
    var surprise = Math.abs(set.gamePct - lPiq);

    // Each team: shift = team variance share * omega; sigma shrinks by delta
    function adjust(team, teamVar, piq, omega) {
      var sstc = teamVar / ciq;
      var gamma = Math.sqrt(teamVar) / ciq;
      var delta = (gamma * sstc / ciq) * piq * (1 - piq) * (SURPRISE_FACTOR - surprise);
      team.forEach(function (p) {
        var share = p.vol * p.vol / teamVar;
        p.perf += share * sstc * omega * gameScale;
        p.vol *= Math.sqrt(1 - share * delta);
      });
    }
    adjust(losers, lVar, lPiq, 1 - lPiq);  // losers' PTI goes up
    adjust(winners, wVar, wPiq, -wPiq);    // winners' PTI goes down
  });

  return {
    players: ps.map(function (p) {
      var pti = sets.length ? PTI_SCALE * p.perf + PTI_SHIFT : p.pti;
      var sigma = sets.length ? p.vol : p.sigma;
      return { pti: pti, sigma: sigma, delta: pti - p.pti, sigmaDelta: sigma - p.sigma };
    }),
    sets: sets
  };
}

if (typeof module !== 'undefined' && module.exports) module.exports = pti24;
