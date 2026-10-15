/**
 * pti24-engine.js
 *
 * Fast PTI 2.4 history engine for large data sets (hundreds of thousands of
 * matches). Same math and results as pti24() / pti24History(), but:
 *   - matches, players and set scores are compiled once into typed arrays,
 *     so a full run allocates nothing per match;
 *   - after an edit (a starting rating, or a break/override before a match)
 *     only the matches downstream of that edit are recalculated. A match is
 *     redone only when one of its players' ratings actually changed, and the
 *     pass stops as soon as no player is left with a changed rating.
 *
 * Usage:
 *   var eng = new PtiEngine(players, matches);
 *     players: [{ id, pti, sigma, lastPlayed? }]
 *     matches: [{ date, player1id, player2id, player3id, player4id, score }]
 *              or columns { date: [], player1id: [], ..., score: [] }
 *   eng.runAll();
 *   eng.setStart(playerIndex, pti, sigma);         // returns { recalculated, ms }
 *   eng.setOverride(pos, pti, sigma);              // pos = match * 4 + slot
 *   eng.clearOverride(pos);
 *   eng.row(k)                                     // a pti24History-style result row
 *
 * Positions: each match has 4 slots (player1..player4), so slot s of match k
 * is pos = 4 * k + s. endPti[pos] / endSigma[pos] hold that player's rating
 * after the match; prev[pos] is the same player's previous position (or -1).
 */
(function (root) {
  'use strict';

  // Fitted PTI 2.4 constants (same as pti24-refactored.js)
  var TAU = 0.012565086385508734, TAU2 = TAU * TAU;
  var TWO_BETA_SQUARED = 32;
  var MAX_SIGMA = 5.328067859319834;
  var TIME_RATE = 0.013214883335727136, TIME_SCALE = 0.7170782493781991, TIME_SHIFT = 435.6036467141399;
  var SCORE_SCALE = 4.820362954958707, SURPRISE_FACTOR = 1.005368928469052;
  var PTI_SCALE = 0.851, PTI_SHIFT = 4.87;

  var DAY_MS = 86400000, NO_DAY = -2147483648;
  // A change smaller than this doesn't count as "changed" when deciding what to
  // recalculate next. Displayed values are 2 decimals; this is ~1e-10 of that.
  var EPS = 1e-12;

  // Sigma added for a break of d days, precomputed for 0..LUT_DAYS-1
  var LUT_DAYS = 20000, DECAY = new Float64Array(LUT_DAYS);
  function decayOf(days) { return TIME_SCALE / (1 + Math.exp(-TIME_RATE * (days - TIME_SHIFT))); }
  for (var d = 0; d < LUT_DAYS; d++) DECAY[d] = decayOf(d);

  // Whole UTC day number (same rules as pti24-history.js)
  function toDay(v) {
    if (v === undefined || v === null || v === '') return NO_DAY;
    if (v instanceof Date) return Math.floor(Date.UTC(v.getFullYear(), v.getMonth(), v.getDate()) / DAY_MS);
    var s = String(v).trim(), m;
    if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s))) return Math.floor(Date.UTC(+m[1], m[2] - 1, +m[3]) / DAY_MS);
    if ((m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s))) return Math.floor(Date.UTC(+m[3], m[1] - 1, +m[2]) / DAY_MS);
    var t = Date.parse(s);
    return isNaN(t) ? NO_DAY : Math.floor(t / DAY_MS);
  }

  // "6-3, 4-6, 1-0" -> [winner, gamePct, winner, gamePct, ...] (winner 1 = team 1)
  function parseSets(score) {
    var out = [], parts = score.split(',');
    for (var j = 0; j < parts.length; j++) {
      var g = parts[j].trim().split('-');
      if (g.length !== 2) continue;
      var a = parseInt(g[0], 10), b = parseInt(g[1], 10);
      if (isNaN(a) || isNaN(b)) continue;
      var total = a + b;
      out.push(a > b ? 1 : 2, total > 1 ? Math.max(a, b) / total : 0.54);
    }
    return out;
  }

  // Status of each match
  var OK = 0, NO_SETS = 1, UNKNOWN_PLAYER = 2, BAD_DATE = 3, SAME_PLAYER = 4;

  function PtiEngine(players, matches) {
    var np = players.length, i, k, s;
    this.ids = new Array(np);
    this.index = new Map();
    this.initPti = new Float64Array(np);
    this.initSigma = new Float64Array(np);
    this.lastDay = new Int32Array(np);
    for (i = 0; i < np; i++) {
      var p = players[i];
      this.ids[i] = String(p.id);
      this.index.set(this.ids[i], i);
      this.initPti[i] = +p.pti;
      this.initSigma[i] = +p.sigma;
      this.lastDay[i] = toDay(p.lastPlayed);
    }

    // Accept rows or columns
    var cols = Array.isArray(matches) ? {
      date: matches.map(function (m) { return m.date; }),
      player1id: matches.map(function (m) { return m.player1id; }),
      player2id: matches.map(function (m) { return m.player2id; }),
      player3id: matches.map(function (m) { return m.player3id; }),
      player4id: matches.map(function (m) { return m.player4id; }),
      score: matches.map(function (m) { return m.score; })
    } : matches;
    var n = cols.date.length, pcols = [cols.player1id, cols.player2id, cols.player3id, cols.player4id];
    this.n = n; this.np = np;
    this.dates = cols.date; this.scores = cols.score; this.rawIds = pcols;
    this.day = new Int32Array(n);
    this.status = new Uint8Array(n);
    this.pl = new Int32Array(4 * n).fill(-1);

    // Set scores -> (winner, winner's share of games), as in pti24().
    // Scores repeat a lot, so each distinct score string is parsed once.
    var setOff = new Int32Array(n + 1), win = [], pct = [], scoreCache = new Map();
    for (k = 0; k < n; k++) {
      setOff[k] = win.length;
      var sc = String(cols.score[k] || ''), sets = scoreCache.get(sc);
      if (!sets) { sets = parseSets(sc); scoreCache.set(sc, sets); }
      for (var j = 0; j < sets.length; j += 2) { win.push(sets[j]); pct.push(sets[j + 1]); }
    }
    setOff[n] = win.length;
    this.setOff = setOff;
    this.setWin = Uint8Array.from(win);
    this.setPct = Float64Array.from(pct);

    // Players per slot, and each player's chain of positions
    this.prev = new Int32Array(4 * n).fill(-1);
    this.firstPos = new Int32Array(np).fill(-1);
    this.lastPos = new Int32Array(np).fill(-1);
    this.count = new Int32Array(np);
    var dayCache = new Map();
    for (k = 0; k < n; k++) {
      var base = 4 * k, st = OK;
      for (s = 0; s < 4; s++) {
        var idx = this.index.get(String(pcols[s][k]));
        if (idx === undefined) st = UNKNOWN_PLAYER; else this.pl[base + s] = idx;
      }
      if (st === OK && (this.pl[base] === this.pl[base + 1] || this.pl[base] === this.pl[base + 2] || this.pl[base] === this.pl[base + 3] ||
          this.pl[base + 1] === this.pl[base + 2] || this.pl[base + 1] === this.pl[base + 3] || this.pl[base + 2] === this.pl[base + 3])) st = SAME_PLAYER;
      var ds = cols.date[k], dv = dayCache.get(ds);
      if (dv === undefined) { dv = toDay(ds); dayCache.set(ds, dv); }
      this.day[k] = dv;
      if (st === OK && this.day[k] === NO_DAY) st = BAD_DATE;
      if (st === OK && setOff[k + 1] === setOff[k]) st = NO_SETS;
      this.status[k] = st;
      if (st > NO_SETS) continue;  // not rated: changes nobody's rating
      for (s = 0; s < 4; s++) {
        i = this.pl[base + s];
        this.prev[base + s] = this.lastPos[i];
        if (this.firstPos[i] < 0) this.firstPos[i] = base + s;
        this.lastPos[i] = base + s;
        this.count[i]++;
      }
    }

    this.endPti = new Float64Array(4 * n);
    this.endSigma = new Float64Array(4 * n);
    this.ovPti = new Map();    // pos -> PTI set just before that match
    this.ovSigma = new Map();  // pos -> sigma set just before that match
    this.hasOv = new Uint8Array(4 * n);  // quick check before the Map lookups
    this._dirty = new Uint8Array(np);
    this._perf = new Float64Array(4);
    this._vol = new Float64Array(4);
    this._old = new Float64Array(8);
  }

  var P = PtiEngine.prototype;

  P.rated = function (k) { return this.status[k] <= NO_SETS; };
  P.startPti = function (pos) {
    if (this.hasOv[pos]) { var o = this.ovPti.get(pos); if (o !== undefined) return o; }
    var pv = this.prev[pos];
    return pv >= 0 ? this.endPti[pv] : this.initPti[this.pl[pos]];
  };
  P.startSigma = function (pos) {
    if (this.hasOv[pos]) { var o = this.ovSigma.get(pos); if (o !== undefined) return o; }
    var pv = this.prev[pos];
    return pv >= 0 ? this.endSigma[pv] : this.initSigma[this.pl[pos]];
  };
  P.breakDays = function (pos) {
    var pv = this.prev[pos], last = pv >= 0 ? this.day[pv >> 2] : this.lastDay[this.pl[pos]];
    return last === NO_DAY ? 0 : Math.max(0, this.day[pos >> 2] - last);
  };

  // Rate match k from its players' current start values (writes endPti/endSigma)
  P.compute = function (k) {
    var base = 4 * k, perf = this._perf, vol = this._vol, s;
    if (this.status[k] === NO_SETS) {
      for (s = 0; s < 4; s++) { this.endPti[base + s] = this.startPti(base + s); this.endSigma[base + s] = this.startSigma(base + s); }
      return;
    }
    for (s = 0; s < 4; s++) {
      var pos = base + s, days = this.breakDays(pos);
      perf[s] = (this.startPti(pos) - PTI_SHIFT) / PTI_SCALE;
      vol[s] = Math.min(this.startSigma(pos) + (days < LUT_DAYS ? DECAY[days] : decayOf(days)), MAX_SIGMA);
    }
    for (var q = this.setOff[k], qe = this.setOff[k + 1]; q < qe; q++) {
      var pct = this.setPct[q], t1 = this.setWin[q] === 1;
      var w0 = t1 ? 0 : 2, w1 = t1 ? 1 : 3, l0 = t1 ? 2 : 0, l1 = t1 ? 3 : 1;
      for (s = 0; s < 4; s++) vol[s] = Math.sqrt(TAU2 + vol[s] * vol[s]);
      var lPerf = perf[l0] + perf[l1], wPerf = perf[w0] + perf[w1];
      var lVar = vol[l0] * vol[l0] + vol[l1] * vol[l1];
      var wVar = vol[w0] * vol[w0] + vol[w1] * vol[w1];
      var ciq = Math.sqrt(lVar + wVar + TWO_BETA_SQUARED);
      var gameScale = SCORE_SCALE * (pct - 0.5) + 0.7;
      var lPiq = 1 / (1 + Math.exp((wPerf - lPerf) / ciq));
      var wPiq = 1 / (1 + Math.exp((lPerf - wPerf) / ciq));
      var surprise = Math.abs(pct - lPiq);
      adjust(perf, vol, l0, l1, lVar, ciq, lPiq, 1 - lPiq, gameScale, surprise);  // losers' PTI goes up
      adjust(perf, vol, w0, w1, wVar, ciq, wPiq, -wPiq, gameScale, surprise);     // winners' PTI goes down
    }
    for (s = 0; s < 4; s++) { this.endPti[base + s] = PTI_SCALE * perf[s] + PTI_SHIFT; this.endSigma[base + s] = vol[s]; }
  };

  function adjust(perf, vol, a, b, teamVar, ciq, piq, omega, gameScale, surprise) {
    var sstc = teamVar / ciq;
    var gamma = Math.sqrt(teamVar) / ciq;
    var delta = (gamma * sstc / ciq) * piq * (1 - piq) * (SURPRISE_FACTOR - surprise);
    var share = vol[a] * vol[a] / teamVar;
    perf[a] += share * sstc * omega * gameScale;
    vol[a] *= Math.sqrt(1 - share * delta);
    share = vol[b] * vol[b] / teamVar;
    perf[b] += share * sstc * omega * gameScale;
    vol[b] *= Math.sqrt(1 - share * delta);
  }

  // Rate every match from scratch
  P.runAll = function () {
    var t = now();
    for (var k = 0; k < this.n; k++) if (this.status[k] <= NO_SETS) this.compute(k);
    return { recalculated: this.n, ms: now() - t };
  };

  // Recalculate from match fromK, starting with the given players marked as changed
  P.update = function (fromK, players, eps) {
    if (eps === undefined) eps = EPS;
    var t = now(), dirty = this._dirty, old = this._old, pl = this.pl;
    var endPti = this.endPti, endSigma = this.endSigma, left = 0, done = 0, k, s;
    dirty.fill(0);
    for (s = 0; s < players.length; s++) if (players[s] >= 0 && !dirty[players[s]]) { dirty[players[s]] = 1; left++; }
    for (k = fromK; k < this.n && left > 0; k++) {
      var base = 4 * k;
      if (this.status[k] > NO_SETS) continue;
      if (!(dirty[pl[base]] | dirty[pl[base + 1]] | dirty[pl[base + 2]] | dirty[pl[base + 3]])) continue;
      for (s = 0; s < 4; s++) { old[s] = endPti[base + s]; old[4 + s] = endSigma[base + s]; }
      this.compute(k);
      done++;
      for (s = 0; s < 4; s++) {
        var i = pl[base + s];
        var changed = Math.abs(endPti[base + s] - old[s]) > eps || Math.abs(endSigma[base + s] - old[4 + s]) > eps;
        if (changed && !dirty[i]) { dirty[i] = 1; left++; }
        else if (!changed && dirty[i]) { dirty[i] = 0; left--; }
      }
    }
    return { recalculated: done, ms: now() - t };
  };

  P.setStart = function (i, pti, sigma) {
    this.initPti[i] = pti; this.initSigma[i] = sigma;
    return this.firstPos[i] < 0 ? { recalculated: 0, ms: 0 } : this.update(this.firstPos[i] >> 2, [i]);
  };
  // pti or sigma may be null to leave that value alone
  P.setOverride = function (pos, pti, sigma) {
    if (pti === null || pti === undefined) this.ovPti.delete(pos); else this.ovPti.set(pos, +pti);
    if (sigma === null || sigma === undefined) this.ovSigma.delete(pos); else this.ovSigma.set(pos, +sigma);
    this.hasOv[pos] = this.ovPti.has(pos) || this.ovSigma.has(pos) ? 1 : 0;
    return this.update(pos >> 2, [this.pl[pos]]);
  };
  P.clearOverride = function (pos) { return this.setOverride(pos, null, null); };
  P.clearOverrides = function () { this.ovPti.clear(); this.ovSigma.clear(); this.hasOv.fill(0); return this.runAll(); };

  // Position of player i in match k, or -1
  P.posOf = function (i, k) {
    for (var s = 0; s < 4; s++) if (this.pl[4 * k + s] === i) return 4 * k + s;
    return -1;
  };
  // All positions of player i, oldest first
  P.positions = function (i) {
    var out = new Array(this.count[i]), j = out.length, pos = this.lastPos[i];
    while (pos >= 0 && j > 0) { out[--j] = pos; pos = this.prev[pos]; }
    return out;
  };
  P.currentPti = function (i) { return this.lastPos[i] >= 0 ? this.endPti[this.lastPos[i]] : this.initPti[i]; };
  P.currentSigma = function (i) { return this.lastPos[i] >= 0 ? this.endSigma[this.lastPos[i]] : this.initSigma[i]; };

  P.error = function (k) {
    switch (this.status[k]) {
      case NO_SETS: return 'No sets in score; ratings unchanged';
      case BAD_DATE: return 'Missing or invalid date';
      case SAME_PLAYER: return 'Same player appears twice';
      case UNKNOWN_PLAYER:
        var self = this, miss = this.rawIds.map(function (c) { return String(c[k]); })
          .filter(function (id) { return !self.index.has(id); });
        return 'No starting rating for: ' + miss.join(', ');
    }
    return null;
  };

  // One match as a pti24History-style row
  P.row = function (k) {
    var r = {
      date: this.dates[k], player1id: this.rawIds[0][k], player2id: this.rawIds[1][k],
      player3id: this.rawIds[2][k], player4id: this.rawIds[3][k], score: this.scores[k]
    };
    var err = this.error(k);
    if (this.status[k] <= NO_SETS) {
      for (var s = 0; s < 4; s++) {
        var pos = 4 * k + s, n = 'player' + (s + 1), sp = this.startPti(pos);
        r[n + 'StartPti'] = sp;
        r[n + 'StartSigma'] = this.startSigma(pos);
        r[n + 'BreakDays'] = this.breakDays(pos);
        r[n + 'EndPti'] = this.endPti[pos];
        r[n + 'EndSigma'] = this.endSigma[pos];
        r[n + 'Delta'] = this.endPti[pos] - sp;
      }
    }
    if (err) r.error = err;
    return r;
  };

  function now() { return typeof performance !== 'undefined' ? performance.now() : Date.now(); }

  PtiEngine.toDay = toDay;
  root.PtiEngine = PtiEngine;
  if (typeof module !== 'undefined' && module.exports) module.exports = PtiEngine;
})(typeof globalThis !== 'undefined' ? globalThis : this);
