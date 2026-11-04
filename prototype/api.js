/* Lane E (George). Page side of the AI wiring: talks to server/index.ts and draws the real results.
   Loaded by prototype/index.html. If the server isn't there (GitHub Pages, Firebase, file://) GW.live stays false
   and the page runs its scripted demo exactly as before. All AI text is escaped before it touches the DOM.
   It fills the page's existing elements in place (it never replaces the whole sheet), so the page's own
   listeners and ids keep working. */
(function () {
  'use strict';

  var LABELS = {
    financialStability: 'Financial stability',
    longTermSustainability: 'Long-term sustainability',
    roomInMarket: 'Room in the market',
    skillsAndAbility: 'Skills and ability'
  };
  var KEYS = Object.keys(LABELS);
  var DOT = { 'Not viable yet': 'notviable', 'Needs work': 'needswork', 'Promising': 'promising', 'Strong': 'strong' }; // Lane C's data-r values
  var TICK = '<svg class="i" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>';
  var SCALE = ['Not viable yet', 'Needs work', 'Promising', 'Strong'];

  var GW = (window.GW = { live: false, maxRounds: 1, sessionId: null });

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $q(sel) { return document.querySelector(sel); }
  function setHTML(sel, html) { var n = $q(sel); if (n) n.innerHTML = html; }
  function range(r, pre, post) {
    if (!r) return '';
    var a = pre + r.min + post, b = pre + r.max + post;
    return r.min === r.max ? a : a + ' to ' + b;
  }
  function ul(items) {
    return items && items.length ? '<ul>' + items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>' : '';
  }
  function num(n) { return n == null ? '' : '<span class="sc num">' + n + '/100</span>'; } // no number in the scripted examples

  /* ---------- Calls ---------- */
  function call(path, body) {
    return fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok) { var e = new Error(j.message || 'Request failed'); e.status = r.status; e.code = j.error; throw e; }
          return j;
        });
      });
  }

  /* Asks the server if the AI is on. Never takes longer than 2.5 seconds, so a slow or missing server can't hold the page up. */
  GW.init = function () {
    var health = fetch('/api/health', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { GW.live = !!(j && j.ai); GW.maxRounds = (j && j.maxRounds) || 1; })
      .catch(function () { GW.live = false; });
    var limit = new Promise(function (r) { setTimeout(r, 2500); });
    return Promise.race([health, limit]);
  };
  GW.reset = function () { GW.sessionId = null; };

  /* The prototype's answer keys -> the contract's IntakeAnswers (src/types/roadmap.ts). */
  GW.intake = function (a) {
    return { idea: (GW.ctx || '') + a.idea, customer: a.who, howItMakesMoney: a.earns, budget: a.budget, hoursPerWeek: a.hours, skills: a.skills, stage: a.stage, location: a.location };
  };
  GW.followups = function (a, followUps, round) {
    return call('/api/followups', { sessionId: GW.sessionId, intake: GW.intake(a), followUps: followUps, round: round })
      .then(function (j) { GW.sessionId = j.sessionId; return j.round; });
  };
  GW.plan = function (a, followUps) {
    return call('/api/plan', { sessionId: GW.sessionId, intake: GW.intake(a), followUps: followUps })
      .then(function (j) { GW.sessionId = j.sessionId; return { preview: j.preview, numbers: j.numbers }; });
  };
  GW.unlock = function () { return call('/api/unlock', { sessionId: GW.sessionId }); };
  GW.improved = function () {
    return call('/api/improved-plan', { sessionId: GW.sessionId }).then(function (j) { return j.improvedPlan; });
  };

  /* ---------- Snapshot of the fictional example, so it can be put back after a real run ---------- */
  var SNAP = ['#overall', '#score .scale', '#score .scores', '#score .watch-list', '#score .notice', '#score .pay ul',
    '#plan .mini', '#plan .groups', '#roadmap .sub', '#line', '#assumptions ul', '#advice p', '#ibpBody'];
  var snap = {}, snapR = null;
  GW.snapshot = function () {
    SNAP.forEach(function (s) { var n = $q(s); if (n) snap[s] = n.innerHTML; });
    var ov = $q('#overall'); snapR = ov && ov.getAttribute('data-r');
  };
  function restore(sels) { sels.forEach(function (s) { if (snap[s] != null) setHTML(s, snap[s]); }); }
  function extras(show) { // the two lines only the real verdict has
    ['#overallNum', '#overallWhy'].forEach(function (s) { var n = $q(s); if (n) { n.hidden = !show; if (!show) n.textContent = ''; } });
  }
  GW.restoreScore = function () {
    restore(['#overall', '#score .scale', '#score .scores', '#score .watch-list', '#score .notice', '#score .pay ul']);
    var ov = $q('#overall'); if (ov && snapR) ov.setAttribute('data-r', snapR);
    extras(false);
  };
  GW.restorePlan = function () {
    restore(['#plan .mini', '#plan .groups', '#roadmap .sub', '#line', '#assumptions ul', '#advice p', '#ibpBody']);
    var total = $q('#plan .total'); if (total) total.hidden = false;
    var line = $q('#line'); if (line) line.style.removeProperty('--n');
  };

  /* ---------- Score page (free preview) ---------- */
  GW.renderPreview = function (p, nums) {
    nums = nums || { scores: {} };
    var v = p.verdict;
    var ov = $q('#overall');
    if (ov) { ov.textContent = v.overall.rating; ov.setAttribute('data-r', DOT[v.overall.rating] || ''); }
    extras(true);
    $q('#overallNum').textContent = nums.overall == null ? '' : nums.overall + ' out of 100';
    $q('#overallNum').hidden = nums.overall == null;
    $q('#overallWhy').textContent = v.overall.reason;

    setHTML('#score .scale', SCALE.map(function (w) {
      return w === v.overall.rating ? '<li class="on" aria-current="true" data-r="' + DOT[w] + '">' + w + '</li>' : '<li data-r="' + DOT[w] + '">' + w + '</li>';
    }).join(''));
    setHTML('#score .scores', KEYS.map(function (k) {
      var r = v.scores[k];
      return '<div><dt>' + LABELS[k] + ' ' + num(nums.scores[k]) + '</dt><dd data-r="' + (DOT[r.rating] || '') + '">' + esc(r.rating) + '</dd><p>' + esc(r.reason) + '</p></div>';
    }).join(''));
    setHTML('#score .watch-list', v.topRisks.map(function (r, i) {
      return '<li><span class="watch-n" aria-hidden="true">' + (i + 1) + '</span><div><p class="watch-t">' + esc(r.title) + '</p><p class="watch-d">' + esc(r.detail) + '</p></div></li>';
    }).join(''));

    var advice = (p.professionalAdvice || []).map(function (a) {
      return esc(a.topic) + ': ' + esc(a.why) + ' Ask ' + esc(a.whoToAsk) + '.';
    }).join(' ');
    var support = (p.localSupport || []).filter(function (l) { return /^https?:\/\//.test(l.link); }).map(function (l) {
      return '<a href="' + esc(l.link) + '" rel="noopener">' + esc(l.name) + '</a>: ' + esc(l.whatItOffers);
    }).join(' ');
    setHTML('#score .notice',
      '<p><strong>What it can’t know</strong>' + ((p.limits || []).map(esc).join(' ') || 'Local rules, insurance and exact prices. Check these before you spend.') + '</p>' +
      '<p><strong>When to get proper advice</strong>' + (advice || 'Speak to an accountant or adviser before signing anything or taking a loan.') + (support ? '<br>' + support : '') + '</p>' +
      ((p.assumptions || []).length ? '<p><strong>What this assumes</strong>' + p.assumptions.map(esc).join(' ') + '</p>' : ''));

    var lk = p.locked, improvements = 0;
    KEYS.forEach(function (k) { improvements += lk.improvementCounts[k] || 0; });
    setHTML('#score .pay ul',
      '<li>' + TICK + '<span><b>What to improve</b>' + improvements + ' suggestions across the four scores, each with a cheap way to check it works.</span></li>' +
      '<li>' + TICK + '<span><b>A roadmap</b>' + lk.roadmapSteps + ' short steps with the time and cost of each, sized to your budget and your week.</span></li>' +
      '<li>' + TICK + '<span><b>An improved business plan</b>Who it’s for, what you sell, the money and the risks, written for your idea' +
        (lk.otherRisks ? ', plus ' + lk.otherRisks + ' more risk' + (lk.otherRisks === 1 ? '' : 's') : '') + '.</span></li>');
  };

  /* ---------- Full plan ---------- */
  GW.renderUnlocked = function (u, nums, imp) {
    nums = nums || { scores: {} };
    var v = u.verdict;
    setHTML('#plan .mini',
      '<div><dt>Overall</dt><dd data-r="' + (DOT[v.overall.rating] || '') + '">' + esc(v.overall.rating) + num(nums.overall) + '</dd></div>' +
      KEYS.map(function (k) {
        var r = v.scores[k].rating;
        return '<div><dt>' + LABELS[k] + '</dt><dd data-r="' + (DOT[r] || '') + '">' + esc(r) + num(nums.scores[k]) + '</dd></div>';
      }).join(''));

    setHTML('#plan .groups', KEYS.map(function (k) {
      var items = (u.improvements[k] || []).map(function (i) {
        return '<p class="what">' + esc(i.title) + '</p><p><b>Why:</b> ' + esc(i.why) + '</p><p><b>Check it cheaply:</b> ' + esc(i.cheapCheck) + '</p>';
      }).join('') || '<p>Nothing to change here yet.</p>';
      return '<div class="group"><div class="group-h"><h3>' + LABELS[k] + ' ' + num(nums.scores[k]) + '</h3><span data-r="' + (DOT[v.scores[k].rating] || '') + '">' + esc(v.scores[k].rating) + '</span></div>' + items + '</div>';
    }).join(''));

    var total = $q('#plan .total'); if (total) total.hidden = true; // the example's "16 weeks, £140" line only fits the example
    setHTML('#roadmap .sub', 'Short steps, in order. Each one tests the idea before more money goes in.');
    var line = $q('#line');
    if (line) line.style.setProperty('--n', Math.max(1, Math.min(u.roadmap.length, 5)));
    setHTML('#line', u.roadmap.map(function (r) {
      return '<li class="stop"><span class="dot" aria-hidden="true"></span><h3>' + esc(r.title) + '</h3>' +
        '<p class="meta num"><span>' + range(r.weeks, '', '') + ' weeks</span><span>' + range(r.costGBP, '£', '') + '</span><span>' + esc(r.hoursPerWeek) + ' h/wk</span></p>' +
        '<p class="body">' + esc(r.firstStep) + '</p><p class="body"><b>Test:</b> ' + esc(r.cheapTest) + '</p><p class="body"><b>Go on if:</b> ' + esc(r.goSignal) + '</p></li>';
    }).join(''));

    setHTML('#assumptions ul', (u.assumptions || []).map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') || '<li>No assumptions to flag.</li>');
    var support = (u.localSupport || []).filter(function (l) { return /^https?:\/\//.test(l.link); }).map(function (l) {
      return '<a href="' + esc(l.link) + '" rel="noopener">' + esc(l.name) + '</a>: ' + esc(l.whatItOffers);
    }).join(' ');
    setHTML('#advice p',
      (u.professionalAdvice || []).map(function (a) { return esc(a.topic) + ': ' + esc(a.why) + ' Ask ' + esc(a.whoToAsk) + '.'; }).join(' ') +
      (support ? ' ' + support : ''));

    GW.renderIbp(imp.state, imp.plan);
  };

  /* The improved business plan: ghosts while call 2 is writing, a retry if it failed. */
  GW.renderIbp = function (state, p) {
    if (state === 'pending') {
      setHTML('#ibpBody', '<div class="ghost" style="width:92%"></div><div class="ghost" style="width:80%"></div><div class="ghost" style="width:86%"></div>');
    } else if (state === 'failed') {
      setHTML('#ibpBody', '<p>The improved business plan didn’t finish writing. Your improvements and roadmap above are complete. <button class="linkbtn" type="button" id="retryImproved">Try again</button></p>');
    } else if (state === 'done' && p) {
      var cost = function (c) { return esc(c.item || c.title) + ' (' + range(c.costGBP, '£', '') + ')'; };
      setHTML('#ibpBody',
        '<h3>Who it’s for</h3><p>' + esc(p.positioning.customer) + '</p>' +
        '<h3>Your niche</h3><p>' + esc(p.positioning.niche) + ' ' + esc(p.positioning.whyYou) + '</p>' +
        '<h3>What you sell</h3>' + ul((p.offer || []).map(function (o) { return '<b>' + esc(o.title) + '</b> ' + esc(o.detail); })) +
        '<h3>Pricing</h3><p>' + esc(p.pricing.approach) + '</p><p>' + esc(p.pricing.working) + '</p>' +
        '<h3>Finding your first customers</h3>' + ul((p.findingCustomers || []).map(function (f) { return '<b>' + esc(f.title) + '</b> ' + esc(f.firstAction) + ' (' + range(f.costGBP, '£', '') + ')'; })) +
        '<h3>The money</h3>' + ul((p.money.startupCosts || []).map(function (c) { return 'Start-up: ' + cost(c); }).concat((p.money.monthlyCosts || []).map(function (c) { return 'Monthly: ' + cost(c); }))) +
        '<p>' + esc(p.money.breakEven) + '</p>' +
        '<h3>Running it week to week</h3>' + ul((p.runningIt || []).map(function (r) { return '<b>' + esc(r.title) + '</b> ' + esc(r.detail); })) +
        '<h3>Milestones</h3>' + ul((p.milestones || []).map(function (m) { return '<b>' + esc(m.by) + ':</b> ' + esc(m.goal) + ' (' + esc(m.measure) + ')'; })) +
        '<h3>What must be true</h3>' + ul((p.mustBeTrue || []).map(esc)) +
        '<h3>When to stop</h3>' + ul((p.stopSignals || []).map(esc)) +
        '<h3>Risks and how to respond</h3>' + ul((p.risksAndResponses || []).map(function (r) { return '<b>' + esc(r.risk) + '</b> ' + esc(r.response); })));
    } else {
      setHTML('#ibpBody', '');
    }
  };
})();
