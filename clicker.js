var clickerButton = document.querySelector('.clicker'),
    countSpan = document.querySelector('.count'),
    upgradeOl = document.querySelector('ol'),
    upgradeButtons = upgradeOl.querySelectorAll('li button'),
    upgradeLis = upgradeOl.querySelectorAll('li');

var upgrades = [
  { cost: 10, effect: { name: 'tickAddition', amount: 1, }, },
  { cost: 100, effect: { name: 'clickMultiplier', amount: 2, }, },
  { cost: 1000, effect: { name: 'tickAddition', amount: 5, }, },
  { cost: 10000, effect: { name: 'clickMultiplier', amount: 2, }, },
  { cost: 100000, effect: { name: 'tickAddition', amount: 10, }, },
];

var gameState = {
  count: 0,
  tickInc: 0,
  clickInc: 1,
  purchased: [false, false, false, false, false],
};

/******************
 * Upgrade logic
 */

var applyUpgrade = {
  tickAddition: function (gs, amt) {
    gs.tickInc += amt;
    return gs;
  },

  clickMultiplier: function (gs, amt) {
    gs.clickInc *= amt;
    return gs;
  },
};

/******************
 * Handlers
 */

var handlers = {
  dispatch: function (gs, e) {
    return this['_' + e.event](gs, e.data);
  },

  _tick: function (gs) {
    gs.count += gs.tickInc;
    return gs;
  },

  _click: function (gs) {
    gs.count += gs.clickInc;
    return gs;
  },

  _upgrade: function (gs, idx) {
    var clickedUpgrade = upgrades[idx];

    if (clickedUpgrade.cost <= gs.count) {
      gs.count -= clickedUpgrade.cost;
      gs.purchased[idx] = true;
      var applyFunc = applyUpgrade[clickedUpgrade.effect.name];
      applyFunc(gs, clickedUpgrade.effect.amount);
    }

    return gs;
  },
};

/******************
 * Renderer
 */

var render = function (gs) {
  countSpan.textContent = gs.count;

  upgrades.forEach(function (upgrade, idx) {
    upgradeLis[idx].style.display = (upgrade.cost <= gs.count && !gs.purchased[idx]) ?
      'block'
    :
      'none'
  });
};

/******************
 * Click streams
 */

var clickerClick$ = Rx.Observable
  .fromEvent(clickerButton, 'click')
  .map(function () {
    return { event: 'click' };
  });

var upgradesClick$ = Rx.Observable
  .fromEvent(upgradeButtons, 'click')
  .map(function (e) {
    return {
      event: 'upgrade',
      data: parseInt(e.target.className, 10),
    };
  });

/******************
 * Game loop
 */

var tick = function () {
  return { event: 'tick' };
};

Rx.Observable
  .interval(1000)
  .map(tick)
  .startWith(gameState)
  .merge(clickerClick$)
  .merge(upgradesClick$)
  .scan(handlers.dispatch.bind(handlers))
  .subscribe(render);
