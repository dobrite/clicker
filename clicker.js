var clickerButton = document.querySelector('.clicker'),
    countSpan = document.querySelector('.count');

var gameState = {
  count: 0
};

var clickerClickStream = Rx.Observable.fromEvent(clickerButton, 'click');
var gameLoop = Rx.Observable.interval(1000);

gameLoop
  .merge(clickerClickStream)
  .startWith(gameState)
  .scan(function (gs, _) {
    gs.count += 1;
    return gs
  })
  .subscribe(function(gs) {
    countSpan.textContent = gs.count;
});
