/* Lane E (George). Wording for the two extra audiences: "I run a business already" and "I'm an investor".
   Loaded by prototype/index.html. The starting-a-business flow is untouched and lives in index.html itself.
   Everything here is FICTIONAL demo content (hackathon rule): no real people, firms, figures or organisations.
   The example verdicts use the same shape as the real AI reply (src/types/roadmap.ts), so the page draws them with
   the same code. Nothing here calls an AI: with the AI server on, real results replace these examples. */
(function () {
  'use strict';
  var NS = ['Not sure', 'That’s fine, we’ll work around it'];
  var K = ['financialStability', 'longTermSustainability', 'roomInMarket', 'skillsAndAbility'];
  function each(v) { var o = {}; K.forEach(function (k) { o[k] = v; }); return o; }
  function scores(r) { var o = {}; K.forEach(function (k, i) { o[k] = { rating: r[i][0], reason: r[i][1] }; }); return o; }
  function rating(r) { var o = {}; K.forEach(function (k, i) { o[k] = { rating: r[i][0] }; }); return o; }
  function R(min, max) { return { min: min, max: max }; }

  /* ---------------- I run a business already ---------------- */
  var existingScores = [
    ['Promising', 'Takings cover rent and parts most months, but one quiet month would leave you with no reserve.'],
    ['Promising', 'Repeat customers are a solid base, but nearly all the work comes from one person and one postcode.'],
    ['Promising', 'Few shops nearby repair e-bikes, which is a gap, but a bigger firm could close it.'],
    ['Strong', 'Three years of trading shows you can fix bikes, price jobs and keep customers.']
  ];
  var existing = {
    card: ['I run a business', 'Check one that’s trading'],
    ctx: '[An existing business that is already trading, not a new idea] ',
    h1: 'Is your business built to last?',
    lede: 'An honest check on a business you already run: where the money is tight, what depends on you, and what to fix first.',
    label: 'Your business, in a sentence',
    ph: 'For example: a bike repair shop in Gateshead',
    btn: 'Check my business',
    chips: ['A bike repair shop in Gateshead', 'A café with two staff in Durham', 'A bookkeeping firm with 12 clients'],
    sheet: { idea: 'Bike repair shop, Gateshead. Trading over 3 years.', overall: 'Promising', scores: ['Promising', 'Promising', 'Promising', 'Strong'] },
    rows: { idea: 'Business', who: 'Customers', earns: 'Earns', budget: 'Monthly money', hours: 'Hours', stage: 'Trading' },
    r1: {
      who: { q: 'Who are your customers today?', help: 'Pick the closest group. You can choose only one.' },
      earns: { q: 'How does it make money now?', help: 'The main way, not every way.' },
      budget: { short: 'Money', q: 'Roughly how much comes in each month?', help: 'Takings before costs. A rough range is fine.',
        opts: [['Under £2,000 a month', 'Small and tight'], ['£2,000 to £10,000 a month', 'Steady but modest'], ['Over £10,000 a month', 'A bigger operation'], NS] },
      hours: { q: 'How many hours a week do you put in?', help: 'Your own hours, not your staff’s.',
        opts: [['Under 20 hours', 'Alongside other work'], ['20 to 40 hours', 'Close to full-time'], ['Over 40 hours', 'Full-time and then some'], NS] },
      stage: { short: 'Trading', q: 'How long has it been trading?', help: 'Honest is best.',
        opts: [['Under a year', 'Still finding customers'], ['1 to 3 years', 'Customers are coming back'], ['Over 3 years', 'A settled business'], NS] },
      skills: { q: 'What experience do you and your team have?', help: 'Jobs you’ve done, things you’re good at. A sentence is plenty.', ph: 'For example: I have repaired bikes for ten years' },
      location: { q: 'Where do you trade?', help: 'A town or area in the North East, for example Gateshead or Durham.' }
    },
    why: 'You said you already run this, so these are about your monthly money, repeat customers and how much depends on you.',
    routes: [
      { q: 'What does a typical month bring in and cost you?', why: 'Your margin decides how long you could cope with a quiet spell.', text: true, ph: 'e.g. about £3,000 in, £2,400 out' },
      { q: 'How many of your customers come back?', why: 'Repeat customers make a business steadier.', chips: ['Most do', 'About half', 'Few', 'Not sure'] },
      { q: 'What would happen if you took two weeks off?', why: 'It shows how much depends on you.', chips: ['It runs fine', 'It slows right down', 'It stops', 'Not sure'] }
    ],
    seed: { idea: 'Bike repair shop, Gateshead', who: 'Local people', earns: 'Charging for my time', budget: '£2,000 to £10,000 a month', hours: '20 to 40 hours', stage: 'Over 3 years' },
    summary: function (a) {
      var p = [a.idea || 'Your business'];
      if (a.stage && a.stage !== 'Not sure') p.push('Trading: ' + a.stage);
      if (a.hours && a.hours !== 'Not sure') p.push(a.hours + ' a week');
      return p.join('. ') + '.';
    },
    title: 'Bike repair shop, Gateshead',
    heads: { imp: 'What to fix first', road: 'The next 90 days', ibp: 'Plan to strengthen the business', tocImp: 'What to fix first', tocRoad: 'Next 90 days', tocIbp: 'Plan to strengthen it' },
    preview: {
      verdict: {
        overall: { rating: 'Promising', reason: 'A steady business with loyal customers. The thin cushion for a bad month is what to fix first.' },
        scores: scores(existingScores),
        topRisks: [
          { title: 'Winter dips', detail: 'Repairs fall away in the dark months but the rent does not.' },
          { title: 'Everything depends on you', detail: 'If you are ill or away, no money comes in.' }
        ]
      },
      professionalAdvice: [{ topic: 'Tax and VAT', why: 'Turnover near the VAT limit changes your prices and paperwork.', whoToAsk: 'an accountant' }],
      localSupport: [],
      limits: ['Your local rent, rates and exact prices.', 'Whether the figures you gave are complete.'],
      assumptions: ['Your takings and costs are as you described them.', 'Your rent and rates stay about the same.'],
      locked: { improvementCounts: each(1), roadmapSteps: 4, otherRisks: 2, improvedPlan: true }
    },
    unlocked: {
      verdict: { overall: { rating: 'Promising' }, scores: rating(existingScores) },
      improvements: {
        financialStability: [{ title: 'Build a one-month cash cushion', why: 'One quiet month should not be a crisis.', cheapCheck: 'Move a fixed sum aside each week and see whether you miss it.' }],
        longTermSustainability: [{ title: 'Offer a spring and autumn service plan', why: 'It turns one-off jobs into repeat income.', cheapCheck: 'Offer it to your next 10 customers and count how many say yes.' }],
        roomInMarket: [{ title: 'Try e-bike repairs on a few jobs', why: 'Few nearby shops do them, so there may be less competition.', cheapCheck: 'Advertise it for two weeks and count enquiries before buying any kit.' }],
        skillsAndAbility: [{ title: 'Write down how you price a job', why: 'It makes your quality easier to repeat and to hand on.', cheapCheck: 'Ask a friend to quote a job from your notes alone.' }]
      },
      roadmap: [
        { title: 'Build the cushion', weeks: R(1, 8), costGBP: R(0, 0), hoursPerWeek: 1, firstStep: 'Pick a weekly amount you can set aside.', cheapTest: 'Do it for four weeks.', goSignal: 'You can still pay every bill on time.' },
        { title: 'Launch a service plan', weeks: R(3, 6), costGBP: R(0, 20), hoursPerWeek: 2, firstStep: 'Write a one-line plan with one fixed price.', cheapTest: 'Offer it to ten customers.', goSignal: 'Three or more say yes.' },
        { title: 'Test e-bike repairs', weeks: R(5, 10), costGBP: R(0, 100), hoursPerWeek: 3, firstStep: 'Post an offer in two local groups.', cheapTest: 'Count real enquiries over two weeks.', goSignal: 'At least five enquiries.' },
        { title: 'Plan for time off', weeks: R(8, 12), costGBP: R(0, 0), hoursPerWeek: 1, firstStep: 'Choose one trusted person to cover simple jobs.', cheapTest: 'Take one quiet week off.', goSignal: 'Bookings are still handled while you are away.' }
      ],
      assumptions: ['Your figures are accurate.', 'Your rent and rates stay about the same.', 'You can set aside a small amount each week.'],
      professionalAdvice: [{ topic: 'Tax and VAT', why: 'Turnover near the VAT limit changes your prices and paperwork.', whoToAsk: 'an accountant' }],
      localSupport: []
    },
    ibp: '<h3>Where the business stands</h3><p>A three-year-old repair shop with steady local customers and a good reputation. It is sound, but it has no reserve and depends entirely on you.</p>' +
      '<h3>What to protect</h3><p>Your repeat customers and your name for reliable work. Anything you add should not put that at risk.</p>' +
      '<h3>The next 90 days</h3><p>Build a one-month cushion, offer a service plan to regulars, and try e-bike repairs on a small scale before buying equipment.</p>' +
      '<h3>The money</h3><p>The steps above cost very little. Do not spend on kit or stock until the service plan and e-bike enquiries show real demand. Check current prices yourself first.</p>' +
      '<h3>Risks and what you’ll do about them</h3><p>Winter dips: sell service plans before autumn. Illness or time away: arrange cover for simple jobs. A bigger firm moving in: keep your regulars close and stay personal.</p>'
  };

  /* ---------------- I'm an investor ---------------- */
  var investorScores = [
    ['Needs work', 'The plan assumes 12 paid jobs a week from month two. Nobody has tested that, and £50,000 would last about nine months if it is wrong.'],
    ['Needs work', 'Repair demand is steady, but van-based work is hard to grow without hiring skilled mechanics.'],
    ['Promising', 'Few competitors visit homes, but nothing stops a bigger firm copying the idea.'],
    ['Promising', 'Two founders with repair experience, but neither has managed staff or a budget this size.']
  ];
  var investor = {
    card: ['I’m an investor', 'Weigh up a business to back'],
    ctx: '[An investor assessing someone else’s business to decide whether to put money in; the answers describe that business and the investor’s intended stake] ',
    h1: 'Is it worth backing?',
    lede: 'An honest first look at a business you’re thinking of investing in: what the pitch assumes, where the risks are, and what to check before you commit money.',
    label: 'The business, in a sentence',
    ph: 'For example: mobile bike repair vans across Tyneside',
    btn: 'Check this business',
    chips: ['Mobile bike repair vans across Tyneside', 'A weekend bakery supplying local cafés', 'Bookkeeping software for small firms'],
    sheet: { idea: 'Mobile bike repair vans, Tyneside. £50,000 for 20%.', overall: 'Needs work', scores: ['Needs work', 'Needs work', 'Promising', 'Promising'] },
    rows: { idea: 'Business', who: 'Customers', earns: 'Earns', budget: 'Putting in', hours: 'Tied up', stage: 'Stage' },
    r1: {
      who: { q: 'Who are the business’s customers?', help: 'Pick the closest group. You can choose only one.' },
      earns: { q: 'How does the business make money?', help: 'The main way, not every way.' },
      budget: { short: 'Investing', q: 'How much are you thinking of putting in?', help: 'Money you could afford to lose. A rough range is fine.',
        opts: [['Under £10,000', 'A small stake'], ['£10,000 to £100,000', 'A meaningful stake'], ['Over £100,000', 'A large stake'], NS] },
      hours: { short: 'Tied up', q: 'How long could your money be tied up?', help: 'The time before you’d expect to get it back or sell.',
        opts: [['Under 2 years', 'A quick return'], ['2 to 5 years', 'The usual range'], ['Over 5 years', 'Patient money'], NS] },
      stage: { q: 'How far along is the business?', help: 'As far as you know. Any stage is fine.',
        opts: [['Just a pitch', 'Nothing built or sold yet'], ['Early sales', 'A few paying customers'], ['Trading and growing', 'Steady, with real accounts'], NS] },
      skills: { q: 'What do you know about the founders?', help: 'Their experience and track record. A sentence is plenty.', ph: 'For example: two ex-mechanics, first business' },
      location: { q: 'Where is the business based?', help: 'A town or area, for example Gateshead or Newcastle.' }
    },
    why: 'You are weighing up a business to back, so these are about proof of paying customers, the terms and the founders’ own stake.',
    routes: [
      { q: 'Have any customers paid yet, outside friends and family?', why: 'Real payments tell you more than a forecast.', chips: ['Yes, several', 'Just one or two', 'No', 'Not sure'] },
      { q: 'What are the founders asking for, and for how big a share?', why: 'It sets how much the business must grow for you to get your money back.', text: true, ph: 'e.g. £50,000 for 20%' },
      { q: 'How much have the founders put in themselves?', why: 'Founders with their own money at risk tend to take more care.', chips: ['A lot', 'Some', 'Nothing', 'Not sure'] }
    ],
    seed: { idea: 'Mobile bike repair vans, Tyneside', who: 'Local people', earns: 'Charging for my time', budget: '£10,000 to £100,000', hours: '2 to 5 years', stage: 'Early sales' },
    summary: function (a) {
      var p = [a.idea || 'This business'];
      if (a.budget && a.budget !== 'Not sure') p.push(a.budget + ' to invest');
      if (a.hours && a.hours !== 'Not sure') p.push(a.hours + ' tied up');
      return p.join('. ') + '.';
    },
    title: 'Mobile bike repair vans, Tyneside',
    heads: { imp: 'What to check before investing', road: 'Checks over the next 6 weeks', ibp: 'Investment view', tocImp: 'What to check', tocRoad: 'Checks and assumptions', tocIbp: 'Investment view' },
    preview: {
      verdict: {
        overall: { rating: 'Needs work', reason: 'The idea is reasonable, but the pitch rests on forecasts rather than paying customers. Test those before committing money.' },
        scores: scores(investorScores),
        topRisks: [
          { title: 'Demand is a forecast, not a result', detail: 'The figures come from the pitch, not from paying customers.' },
          { title: 'The money runs out before there is proof', detail: 'At the planned spend, the first real test lands near the end of the cash.' }
        ]
      },
      professionalAdvice: [
        { topic: 'Terms and valuation', why: 'The share on offer and your rights if it goes wrong decide what you get back.', whoToAsk: 'a solicitor' },
        { topic: 'The accounts', why: 'Figures in a pitch are the founders’ own.', whoToAsk: 'an accountant' }
      ],
      localSupport: [],
      limits: ['Whether the founders’ figures are accurate.', 'The wider market, and any rules for running the vans.'],
      assumptions: ['The pitch figures are correct as given.', 'No other funding is promised alongside yours.'],
      locked: { improvementCounts: each(1), roadmapSteps: 4, otherRisks: 2, improvedPlan: true }
    },
    unlocked: {
      verdict: { overall: { rating: 'Needs work' }, scores: rating(investorScores) },
      improvements: {
        financialStability: [{ title: 'Ask for the first 20 paying jobs', why: 'Paid jobs prove the weekly figure the plan relies on.', cheapCheck: 'Ask the founders for invoices from a trial month.' }],
        longTermSustainability: [{ title: 'Find out how they will hire mechanics', why: 'Growth depends on skilled people who are hard to find.', cheapCheck: 'Ask what they would pay and where they would look.' }],
        roomInMarket: [{ title: 'Check who else visits homes', why: 'If a larger firm can copy the idea, your share is worth less.', cheapCheck: 'Search local listings and call two competitors as a customer.' }],
        skillsAndAbility: [{ title: 'Speak to the founders’ past customers', why: 'It shows how they work when no one is watching.', cheapCheck: 'Ask for two references and call them.' }]
      },
      roadmap: [
        { title: 'See real customers', weeks: R(1, 2), costGBP: R(0, 0), hoursPerWeek: 2, firstStep: 'Ask for invoices and two customer contacts.', cheapTest: 'Call both customers.', goSignal: 'Both would pay again.' },
        { title: 'Check the numbers', weeks: R(2, 3), costGBP: R(0, 400), hoursPerWeek: 3, firstStep: 'Ask for the bank statements behind the forecast.', cheapTest: 'Have an accountant read them.', goSignal: 'The figures match what was pitched.' },
        { title: 'Test the founders', weeks: R(3, 5), costGBP: R(0, 0), hoursPerWeek: 2, firstStep: 'Spend a day on the job with them.', cheapTest: 'Watch how they handle a hard customer.', goSignal: 'They stay calm and honest.' },
        { title: 'Stage the money', weeks: R(5, 6), costGBP: R(0, 600), hoursPerWeek: 2, firstStep: 'Ask a solicitor about releasing money in stages.', cheapTest: 'Agree what each stage must achieve.', goSignal: 'The founders accept staged funding.' }
      ],
      assumptions: ['The pitch figures are correct as given.', 'No other funding is promised alongside yours.', 'The founders will share their accounts and customers.'],
      professionalAdvice: [
        { topic: 'Terms and valuation', why: 'The share on offer and your rights if it goes wrong decide what you get back.', whoToAsk: 'a solicitor' },
        { topic: 'The accounts', why: 'Figures in a pitch are the founders’ own.', whoToAsk: 'an accountant' }
      ],
      localSupport: []
    },
    ibp: '<h3>The case for</h3><p>Repair demand is steady, few rivals visit homes, and the founders know the work. A mobile model keeps costs low.</p>' +
      '<h3>The case against</h3><p>The weekly job figure is untested, the team has not run staff, and a bigger firm could copy the idea.</p>' +
      '<h3>What would need to be true</h3><p>Paying customers book about as often as forecast, the vans cost what the plan says, and the founders can hire good mechanics.</p>' +
      '<h3>How to stage the money</h3><p>Release it in parts. A small amount for a first van and a trial period, then more only once paid jobs match the forecast. Take legal advice on the terms first.</p>' +
      '<h3>When to walk away</h3><p>If the founders will not share invoices or accounts, if the trial month falls well short of the forecast, or if they will not accept staged funding.</p>'
  };

  window.AUD = { existing: existing, investor: investor };
})();
