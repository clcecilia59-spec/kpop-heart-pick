(function () {
  'use strict';

  var STORAGE_KEY = 'kpop-heart-pick-v5';
  var data = window.IDOL_DATA;
  var logic = window.AppLogic;
  var screens = Array.prototype.slice.call(document.querySelectorAll('[data-screen]'));
  var state = createInitialState();
  var preloadedImages = [];
  var isTransitioning = false;

  var els = {
    progressCurrent: document.getElementById('progress-current'),
    progressBar: document.querySelector('.progress-track'),
    progressFill: document.querySelector('.progress-fill'),
    ratingStage: document.getElementById('rating-photo-stage'),
    ratingImage: document.getElementById('rating-image'),
    mysteryLabel: document.getElementById('mystery-label'),
    styleLabel: document.getElementById('style-label'),
    ratingStatus: document.getElementById('rating-status'),
    duelGrid: document.getElementById('duel-grid'),
    resultTitle: document.getElementById('result-title'),
    resultSubtitle: document.getElementById('result-subtitle'),
    winnerCard: document.getElementById('winner-card'),
    topThreeGrid: document.getElementById('top-three-grid'),
    contrastCopy: document.getElementById('contrast-copy'),
    styleBars: document.getElementById('style-bars')
  };

  function createInitialState() {
    return { screen: 'intro', round: [], index: 0, ratings: {}, duelWinnerId: null, completedAt: null };
  }

  function preloadPhotos() {
    data.photos.forEach(function (photo) {
      var image = new Image();
      image.src = photo.image;
      preloadedImages.push(image);
    });
  }

  function preloadPhoto(photo, onReady) {
    var image = new Image();
    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      onReady();
    }
    image.addEventListener('load', finish);
    image.addEventListener('error', finish);
    image.src = photo.image;
    preloadedImages.push(image);
    if (image.complete && image.naturalWidth) finish();
  }

  function renderRatingWhenReady(onReady) {
    var expectedIndex = state.index;
    var photo = state.round[expectedIndex];
    if (!photo) return finishRatings();
    preloadPhoto(photo, function () {
      if (state.index !== expectedIndex) return;
      renderRating();
      saveState();
      if (onReady) onReady();
    });
  }

  function saveState() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { /* storage is optional */ }
  }

  function loadState() {
    try {
      var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      if (saved && Array.isArray(saved.round) && saved.round.length === 12 && saved.ratings) {
        state = saved;
        if (state.screen === 'rating' && state.index >= 12) state.screen = 'duel';
        return true;
      }
    } catch (error) { /* ignore invalid state */ }
    return false;
  }

  function showScreen(name) {
    state.screen = name;
    screens.forEach(function (screen) {
      screen.classList.toggle('is-active', screen.getAttribute('data-screen') === name);
    });
    window.scrollTo(0, 0);
    saveState();
  }

  function startRound() {
    state = createInitialState();
    state.screen = 'rating';
    state.round = logic.buildRound(data);
    state.round.slice(1).forEach(function (photo) {
      preloadPhoto(photo, function () {});
    });
    renderRatingWhenReady(function () { showScreen('rating'); });
  }

  function renderRating() {
    var photo = state.round[state.index];
    if (!photo) return finishRatings();
    var current = String(state.index + 1).padStart(2, '0');
    els.progressCurrent.textContent = current;
    els.progressBar.setAttribute('aria-valuenow', String(state.index + 1));
    els.progressFill.style.width = (((state.index + 1) / 12) * 100) + '%';
    els.ratingStage.setAttribute('data-person', photo.personId);
    els.ratingStage.setAttribute('data-style', photo.styleId);
    els.ratingImage.src = photo.image;
    els.ratingImage.alt = '第 ' + (state.index + 1) + ' 张待评分 K-pop 男团成员造型照片';
    els.mysteryLabel.textContent = 'MYSTERY ' + current;
    els.styleLabel.textContent = photo.styleLabel;
    els.ratingStatus.textContent = '';
    document.querySelectorAll('[data-score]').forEach(function (button) {
      var active = state.ratings[photo.id] === Number(button.getAttribute('data-score'));
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      button.disabled = false;
    });
    isTransitioning = false;
    document.querySelector('[data-action="skip"]').disabled = false;
    document.querySelector('[data-action="back"]').disabled = state.index === 0;
  }

  function rateCurrent(score) {
    if (isTransitioning) return;
    isTransitioning = true;
    document.querySelectorAll('[data-score]').forEach(function (button) { button.disabled = true; });
    document.querySelector('[data-action="skip"]').disabled = true;
    document.querySelector('[data-action="back"]').disabled = true;
    var photo = state.round[state.index];
    state.ratings[photo.id] = score;
    els.ratingStatus.textContent = score === 4 ? '本命级心动，记下了 ♥' : '已记录你的第一感觉';
    window.setTimeout(function () {
      state.index += 1;
      if (state.index >= state.round.length) finishRatings();
      else renderRatingWhenReady();
    }, 180);
  }

  function skipCurrent() {
    if (isTransitioning) return;
    isTransitioning = true;
    var photo = state.round[state.index];
    delete state.ratings[photo.id];
    state.index += 1;
    if (state.index >= state.round.length) finishRatings();
    else renderRatingWhenReady();
  }

  function backOne() {
    if (isTransitioning || state.index <= 0) return;
    isTransitioning = true;
    state.index -= 1;
    renderRatingWhenReady();
  }

  function finishRatings() {
    var finalists = logic.selectFinalists(state.round, state.ratings);
    if (finalists.length < 2) return showResults();
    renderDuel(finalists);
    showScreen('duel');
  }

  function renderDuel(finalists) {
    els.duelGrid.innerHTML = '';
    finalists.forEach(function (photo, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'duel-card';
      button.setAttribute('data-photo-id', photo.id);
      button.setAttribute('aria-label', '选择候选 ' + (index + 1) + ' 为心动冠军');
      button.innerHTML = '<span class="duel-photo" data-person="' + photo.personId + '" data-style="' + photo.styleId + '"><img src="' + photo.image + '" alt="候选 ' + (index + 1) + ' 造型照片"><span class="duel-number">0' + (index + 1) + '</span></span><span class="duel-cta">选这张 <b>♥</b></span>';
      button.addEventListener('click', function () {
        state.duelWinnerId = photo.id;
        showResults();
      });
      els.duelGrid.appendChild(button);
    });
  }

  function showResults() {
    state.completedAt = new Date().toISOString();
    renderResults();
    showScreen('result');
  }

  function renderResults() {
    var result = logic.buildResult(data, state.round, state.ratings, state.duelWinnerId);
    els.winnerCard.innerHTML = '';
    els.topThreeGrid.innerHTML = '';
    els.styleBars.innerHTML = '';

    if (result.validCount < 1) {
      els.resultTitle.textContent = '你的心动雷达还没启动';
      els.resultSubtitle.textContent = '这一轮都跳过了。换一批，再凭直觉选几张吧。';
      els.winnerCard.innerHTML = '<div class="empty-result">没有有效评分，暂时无法选出冠军。</div>';
      els.contrastCopy.textContent = '至少完成 2 张评分后，才能生成风格偏好。';
      return;
    }

    var favorite = result.favoriteStyle;
    els.resultTitle.textContent = result.closeCall ? '你是多风格心动体质' : '你的关键词：' + favorite.keyword;
    els.resultSubtitle.textContent = result.validCount < 6 ? '这轮有效评分较少，结果先作为轻量预览。' : favorite.result;

    var winner = result.winner;
    els.winnerCard.innerHTML = '<div class="winner-photo" data-person="' + winner.photo.personId + '" data-style="' + winner.photo.styleId + '"><img src="' + winner.photo.image + '" alt="' + winner.photo.alt + '"><span class="crown">TODAY\'S PICK</span></div><div class="winner-copy"><span>今日心动冠军</span><h3>' + winner.photo.personName + '</h3><p>' + winner.photo.group + ' · ' + winner.photo.styleLabel + ' · ' + winner.score + ' 分</p></div>';

    result.topThree.forEach(function (entry, index) {
      var item = document.createElement('article');
      item.className = 'top-item';
      item.innerHTML = '<div class="top-photo" data-person="' + entry.photo.personId + '" data-style="' + entry.photo.styleId + '"><img src="' + entry.photo.image + '" alt="' + entry.photo.alt + '"><span>0' + (index + 1) + '</span></div><h4>' + entry.photo.personName + '</h4><p>' + entry.photo.styleLabel + ' · ' + entry.score + ' 分</p>';
      els.topThreeGrid.appendChild(item);
    });

    if (result.contrast) {
      els.contrastCopy.textContent = '你给 ' + result.contrast.personName + ' 的「' + result.contrast.highStyle + '」比「' + result.contrast.lowStyle + '」高出 ' + result.contrast.gap + ' 分。同一个人，造型真的会改变心动值。';
    } else {
      els.contrastCopy.textContent = result.closeCall ? '你的前两种风格得分非常接近，这一轮没有单一答案。' : '这一轮你对「' + favorite.label + '」的平均心动值最高，风格比团名更先抓住了你的注意力。';
    }

    result.styleAverages.forEach(function (style) {
      var row = document.createElement('div');
      row.className = 'style-row';
      var percent = style.count ? Math.round((style.average / 4) * 100) : 0;
      row.innerHTML = '<div class="style-row-label"><span>' + style.label + '</span><b>' + (style.count ? style.average.toFixed(1) : '—') + '</b></div><div class="style-track"><span style="width:' + percent + '%"></span></div>';
      els.styleBars.appendChild(row);
    });
  }

  function clearSaved() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (error) { /* no-op */ }
    state = createInitialState();
    showScreen('intro');
  }

  document.addEventListener('click', function (event) {
    var scoreButton = event.target.closest('[data-score]');
    if (scoreButton) return rateCurrent(Number(scoreButton.getAttribute('data-score')));
    var actionButton = event.target.closest('[data-action]');
    if (!actionButton) return;
    var action = actionButton.getAttribute('data-action');
    if (action === 'start' || action === 'replay' || action === 'restart') startRound();
    if (action === 'back') backOne();
    if (action === 'skip') skipCurrent();
    if (action === 'skip-duel') showResults();
    if (action === 'home') showScreen('intro');
    if (action === 'clear') clearSaved();
  });

  preloadPhotos();

  if (loadState()) {
    if (state.screen === 'rating') renderRating();
    if (state.screen === 'duel') {
      var restoredFinalists = logic.selectFinalists(state.round, state.ratings);
      if (restoredFinalists.length >= 2) renderDuel(restoredFinalists); else state.screen = 'result';
    }
    if (state.screen === 'result') renderResults();
    showScreen(state.screen);
  }
}());
