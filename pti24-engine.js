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

  // "6-3, 6-6(7-5), 1-0" -> [winner, gamePct, winner, gamePct, ...] (winner 1 = team 1).
  // Sets count as APTA counts them (same rules as pti24-refactored.js):
  //   - a finished set (either side has 6+ games, games not tied): share of games;
  //   - games tied (6-6), or at most one game played with tiebreak points (a match
  //     tiebreak, 1-0(10-8) or 0-0(10-8)): 0.54 to the tiebreak winner;
  //   - 1-0 or 0-1 with no tiebreak points: 0.54 to the side with the game;
  //   - anything else unfinished (5-4, 2-0, 3-3(7-5)) doesn't count.
  // "(x-y)" is the tiebreak points from the same side as the games; a suffix
  // without a dash, as in "7-6(5)", is ignored.
  function parseSets(score) {
    var out = [], parts = score.split(',');
    for (var j = 0; j < parts.length; j++) {
      var part = parts[j], open = part.indexOf('('), x = 0, y = 0;
      if (open >= 0) {
        var t = part.slice(open + 1).replace(')', '').split('-');
        if (t.length === 2) {
          x = parseInt(t[0], 10); y = parseInt(t[1], 10);
          if (isNaN(x) || isNaN(y)) x = y = 0;
        }
        part = part.slice(0, open);
      }
      var g = part.trim().split('-');
      if (g.length !== 2) continue;
      var a = parseInt(g[0], 10), b = parseInt(g[1], 10);
      if (isNaN(a) || isNaN(b) || a + b + x + y === 0) continue;
      if (a < 6 && b < 6) {
        if (x + y === 0) { if (a + b === 1) out.push(a > b ? 1 : 2, 0.54); }
        else if (a + b <= 1 && x !== y) out.push(x > y ? 1 : 2, 0.54);
      } else if (a !== b) out.push(a > b ? 1 : 2, Math.max(a, b) / (a + b));
      else if (x !== y) out.push(x > y ? 1 : 2, 0.54);
    }
    return out;
  }

  // Status of each match
  var OK = 0, NO_SETS = 1, UNKNOWN_PLAYER = 2, BAD_DATE = 3, SAME_PLAYER = 4;
  var EXCLUDED = 128;  // flag added to status while a match is left out of the calculation
  var CLASH = 64;      // flag added while linked ids would put one player in a match twice

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
    this.next = new Int32Array(4 * n).fill(-1);
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
        if (this.lastPos[i] >= 0) this.next[this.lastPos[i]] = base + s;
        if (this.firstPos[i] < 0) this.firstPos[i] = base + s;
        this.lastPos[i] = base + s;
        this.count[i]++;
      }
    }

    // Linked ids: origPl keeps each slot's own id, pl holds the id it rates as
    this.origPl = this.pl.slice();
    this.origFirst = this.firstPos.slice();
    this.origLast = this.lastPos.slice();
    this.origPrev = this.prev.slice();  // each id's history as loaded, before exclusions and links
    this.root = new Int32Array(np);
    for (i = 0; i < np; i++) this.root[i] = i;
    this._force = new Uint8Array(n);
    this._forced = 0;

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
    var force = this._force;  // matches that must be redone whatever their players' state
    for (k = fromK; k < this.n && (left > 0 || this._forced > 0); k++) {
      var base = 4 * k, f = force[k];
      if (f) { force[k] = 0; this._forced--; }
      if (this.status[k] > NO_SETS) continue;
      if (!f && !(dirty[pl[base]] | dirty[pl[base + 1]] | dirty[pl[base + 2]] | dirty[pl[base + 3]])) continue;
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

  // Leave match k out of the calculation: its players' histories skip it, as if
  // it was never played (break days are counted from their previous match).
  P.isExcluded = function (k) { return (this.status[k] & EXCLUDED) !== 0; };
  P.isClash = function (k) { return (this.status[k] & CLASH) !== 0; };
  P.exclude = function (k) {
    if (this.status[k] > NO_SETS) return { recalculated: 0, ms: 0 };  // already excluded, or never rated
    var base = 4 * k, players = [];
    for (var s = 0; s < 4; s++) {
      var pos = base + s, i = this.pl[pos], pv = this.prev[pos], nx = this.next[pos];
      if (nx >= 0) this.prev[nx] = pv; else this.lastPos[i] = pv;
      if (pv >= 0) this.next[pv] = nx; else this.firstPos[i] = nx;
      this.prev[pos] = this.next[pos] = -1;
      this.count[i]--;
      players.push(i);
    }
    this.status[k] |= EXCLUDED;
    return this.update(k + 1, players);
  };
  P.include = function (k) {
    if (!this.isExcluded(k)) return { recalculated: 0, ms: 0 };
    this.status[k] &= ~EXCLUDED;
    if (this.status[k] > NO_SETS) return { recalculated: 0, ms: 0 };  // still clashing
    var base = 4 * k, players = [];
    for (var s = 0; s < 4; s++) {
      var pos = base + s, i = this.pl[pos], pv = this.lastPos[i], nx = -1;
      while (pv > pos) { nx = pv; pv = this.prev[pv]; }  // walk back to the player's match before this one
      this.prev[pos] = pv; this.next[pos] = nx;
      if (pv >= 0) this.next[pv] = pos; else this.firstPos[i] = pos;
      if (nx >= 0) this.prev[nx] = pos; else this.lastPos[i] = pos;
      this.count[i]++;
      players.push(i);
    }
    // Rate k, then always redo each player's next match: its start now comes
    // from k, even when k's own result matches what it was before exclusion.
    var t = now();
    this.compute(k);
    var res = this.update(k + 1, players);
    return { recalculated: res.recalculated + 1, ms: now() - t };
  };

  // Link ids so their matches form one history. The id with the earliest
  // match keeps its starting PTI and sigma; the others' starts are unused
  // until they are unlinked.
  P.linkedTo = function (i) { return this.root[i]; };
  P.group = function (i) {
    var r = this.root[i], out = [];
    for (var j = 0; j < this.np; j++) if (this.root[j] === r) out.push(j);
    return out;
  };
  P.link = function (a, b) {
    var ra = this.root[a], rb = this.root[b];
    if (ra === rb) return { recalculated: 0, ms: 0 };
    var members = this.group(a).concat(this.group(b));
    return this._regroup([members], members);
  };
  // Take id i out of its group
  P.unlink = function (i) {
    var rest = this.group(i).filter(function (j) { return j !== i; });
    if (!rest.length) return { recalculated: 0, ms: 0 };
    return this._regroup([[i], rest], rest.concat([i]));
  };
  P._regroup = function (groups, affected) {
    var t = now(), n = this.n, np = this.np, s, k, j, i;
    var fromK = n, roots = [];
    for (j = 0; j < affected.length; j++) {
      var fp = this.firstPos[this.root[affected[j]]];
      if (fp >= 0) fromK = Math.min(fromK, fp >> 2);
    }
    // New roots: the member with the earliest match of its own
    var origFirst = this.origFirst;
    groups.forEach(function (g) {
      var r = g[0];
      for (j = 1; j < g.length; j++) {
        var a = origFirst[g[j]], b = origFirst[r];
        if (a >= 0 && (b < 0 || a < b)) r = g[j];
      }
      for (j = 0; j < g.length; j++) this.root[g[j]] = r;
      roots.push(r);
    }, this);
    var self = this, force = this._force;
    function redo(m) { if (!force[m]) { force[m] = 1; self._forced++; } if (m < fromK) fromK = m; }
    var hit = new Uint8Array(np);
    for (j = 0; j < affected.length; j++) {
      i = affected[j]; hit[i] = 1;
      this.firstPos[i] = this.lastPos[i] = -1; this.count[i] = 0;
    }
    var pl = this.pl, op = this.origPl, prev = this.prev, next = this.next, st = this.status;
    for (k = 0; k < n; k++) {
      var base = 4 * k, touched = false;
      for (s = 0; s < 4; s++) {
        var o = op[base + s];
        if (o >= 0 && hit[o]) { pl[base + s] = this.root[o]; touched = true; }
      }
      if (!touched || (st[k] & 63) > NO_SETS) continue;  // never rated
      var clash = pl[base] === pl[base + 1] || pl[base] === pl[base + 2] || pl[base] === pl[base + 3] ||
        pl[base + 1] === pl[base + 2] || pl[base + 1] === pl[base + 3] || pl[base + 2] === pl[base + 3];
      var was = st[k] > NO_SETS;
      if (clash) st[k] |= CLASH; else st[k] &= ~CLASH;
      var now_ = st[k] > NO_SETS;
      if (was && now_) continue;  // still out of the calculation
      if (!was && now_) {
        // Leaves the calculation: unlink the players this rebuild doesn't touch
        for (s = 0; s < 4; s++) {
          var pos = base + s;
          if (hit[op[pos]]) continue;
          var pv = prev[pos], nx = next[pos], q = pl[pos];
          if (nx >= 0) prev[nx] = pv; else this.lastPos[q] = pv;
          if (pv >= 0) next[pv] = nx; else this.firstPos[q] = nx;
          prev[pos] = next[pos] = -1; this.count[q]--;
          if (nx >= 0) redo(nx >> 2);  // their next match now follows on from an earlier one
        }
        continue;
      }
      if (now_) continue;
      for (s = 0; s < 4; s++) {
        pos = base + s; q = pl[pos];
        if (was && !hit[op[pos]]) {
          // Rejoins the calculation: relink a player outside the rebuild
          pv = this.lastPos[q]; nx = -1;
          while (pv > pos) { nx = pv; pv = prev[pv]; }
          prev[pos] = pv; next[pos] = nx;
          if (pv >= 0) next[pv] = pos; else this.firstPos[q] = pos;
          if (nx >= 0) prev[nx] = pos; else this.lastPos[q] = pos;
          this.count[q]++;
          redo(k);
          if (nx >= 0) redo(nx >> 2);
          continue;
        }
        if (!hit[op[pos]]) continue;
        // Rebuilt chain: append in match order
        prev[pos] = this.lastPos[q]; next[pos] = -1;
        if (this.lastPos[q] >= 0) next[this.lastPos[q]] = pos; else this.firstPos[q] = pos;
        this.lastPos[q] = pos; this.count[q]++;
        redo(k);
      }
    }
    var res = this.update(fromK, roots);
    return { recalculated: res.recalculated, ms: now() - t };
  };

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
  // Positions of id i in its history as loaded, oldest first
  P.origPositions = function (i) {
    var out = [], pos = this.origLast[i];
    while (pos >= 0) { out.push(pos); pos = this.origPrev[pos]; }
    return out.reverse();
  };
  P.currentPti = function (i) { return this.lastPos[i] >= 0 ? this.endPti[this.lastPos[i]] : this.initPti[i]; };
  P.currentSigma = function (i) { return this.lastPos[i] >= 0 ? this.endSigma[this.lastPos[i]] : this.initSigma[i]; };

  P.error = function (k) {
    if (this.status[k] & EXCLUDED) return 'Excluded from the calculation';
    if (this.status[k] & CLASH) return 'Linked players appear in the same match';
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
  // Predictive accuracy: in how many rated matches the team with the lower
  // summed pre-match PTI (the favourite) won. Matches with a level set count or
  // level team ratings are skipped. With origEnd/origInit (endPti and initPti
  // snapshotted after the first run) the same matches are also scored on the
  // ratings as originally loaded.
  P.predictive = function (origEnd, origInit) {
    var cur = { won: 0, n: 0 }, orig = { won: 0, n: 0 };
    var status = this.status, setOff = this.setOff, setWin = this.setWin, hasOv = this.hasOv;
    var prev = this.prev, end = this.endPti, init = this.initPti, pl = this.pl, oPrev = this.origPrev, oPl = this.origPl;
    for (var k = 0; k < this.n; k++) {
      if (status[k] !== OK) continue;
      var sets = 0;
      for (var j = setOff[k]; j < setOff[k + 1]; j++) sets += setWin[j] === 1 ? 1 : -1;
      if (!sets) continue;
      var b = 4 * k, win = sets > 0 ? 1 : 2, t1 = 0, t2 = 0, o1 = 0, o2 = 0, s, pos, pv, v;
      for (s = 0; s < 4; s++) {
        pos = b + s;
        if (hasOv[pos]) v = this.startPti(pos);
        else { pv = prev[pos]; v = pv >= 0 ? end[pv] : init[pl[pos]]; }
        if (s < 2) t1 += v; else t2 += v;
        if (origEnd) {
          pv = oPrev[pos]; v = pv >= 0 ? origEnd[pv] : origInit[oPl[pos]];
          if (s < 2) o1 += v; else o2 += v;
        }
      }
      if (t1 !== t2) { cur.n++; if ((t1 < t2 ? 1 : 2) === win) cur.won++; }
      if (origEnd && o1 !== o2) { orig.n++; if ((o1 < o2 ? 1 : 2) === win) orig.won++; }
    }
    return { current: cur, original: orig };
  };

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
  PtiEngine.EXCLUDED = EXCLUDED;
  PtiEngine.CLASH = CLASH;
  root.PtiEngine = PtiEngine;
  if (typeof module !== 'undefined' && module.exports) module.exports = PtiEngine;
})(typeof globalThis !== 'undefined' ? globalThis : this);
