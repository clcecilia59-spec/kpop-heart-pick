(function () {
  'use strict';

  var STORAGE_KEY = 'kpop-heart-pick-v9';
  var data = window.IDOL_DATA;
  var logic = window.AppLogic;
  var screens = Array.prototype.slice.call(document.querySelectorAll('[data-screen]'));
  var state = createInitialState();
  var preloadedImages = [];
  var isTransitioning = false;
  var timerId = null;
  var lastShareText = '';

  var els = {
    progressCurrent: document.getElementById('progress-current'),
    progressTotal: document.getElementById('progress-total'),
    progressBar: document.querySelector('.rating-screen .progress-track'),
    progressFill: document.querySelector('.rating-screen .progress-fill'),
    ratingCard: document.getElementById('rating-card'),
    ratingStage: document.getElementById('rating-photo-stage'),
    ratingImage: document.getElementById('rating-image'),
    mysteryLabel: document.getElementById('mystery-label'),
    styleLabel: document.getElementById('style-label'),
    ratingStatus: document.getElementById('rating-status'),
    ratingTitle: document.getElementById('rating-title'),
    challengeKicker: document.getElementById('challenge-kicker'),
    timerWrap: document.getElementById('timer-wrap'),
    timerLabel: document.getElementById('timer-label'),
    timerFill: document.getElementById('timer-fill'),
    choiceCurrent: document.getElementById('choice-progress-current'),
    choiceTotal: document.getElementById('choice-progress-total'),
    choiceTrack: document.getElementById('choice-progress-track'),
    choiceFill: document.getElementById('choice-progress-fill'),
    choiceKicker: document.getElementById('choice-kicker'),
    choiceTitle: document.getElementById('choice-title'),
    choiceCopy: document.getElementById('choice-copy'),
    choiceGrid: document.getElementById('choice-grid'),
    choiceStatus: document.getElementById('choice-status'),
    duelGrid: document.getElementById('duel-grid'),
    resultTitle: document.getElementById('result-title'),
    resultSubtitle: document.getElementById('result-subtitle'),
    winnerCard: document.getElementById('winner-card'),
    topThreeGrid: document.getElementById('top-three-grid'),
    contrastCopy: document.getElementById('contrast-copy'),
    styleBars: document.getElementById('style-bars'),
    groupCopy: document.getElementById('group-copy'),
    groupBars: document.getElementById('group-bars'),
    resultStats: document.getElementById('result-stats'),
    streakToast: document.getElementById('streak-toast')
  };

  function createInitialState() {
    return { screen: 'intro', round: [], challenges: [], index: 0, answers: {}, finalWinnerId: null, completedAt: null };
  }

  function saveState() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { /* storage is optional */ }
  }

  function loadState() {
    try {
      var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      if (saved && Array.isArray(saved.challenges) && saved.challenges.length >= 20 && saved.answers) {
        state = saved;
        return true;
      }
    } catch (error) { /* ignore invalid state */ }
    return false;
  }

  function preloadPhotos() {
    data.photos.forEach(function (photo) {
      var image = new Image(); image.src = photo.image; preloadedImages.push(image);
    });
  }

  function stopTimer() {
    if (timerId) window.clearInterval(timerId);
    timerId = null;
    els.timerWrap.hidden = true;
  }

  function showScreen(name) {
    state.screen = name;
    screens.forEach(function (screen) { screen.classList.toggle('is-active', screen.getAttribute('data-screen') === name); });
    window.scrollTo(0, 0);
    saveState();
  }

  function startRound() {
    stopTimer();
    var plan = logic.buildChallengePlan(data);
    state = createInitialState();
    state.challenges = plan.challenges;
    state.round = logic.uniquePhotos(plan.challenges);
    state.screen = 'rating';
    renderCurrent();
  }

  function updateProgress(currentEl, totalEl, trackEl, fillEl) {
    var current = state.index + 1;
    var total = state.challenges.length;
    currentEl.textContent = String(current).padStart(2, '0');
    totalEl.textContent = '/ ' + total;
    trackEl.setAttribute('aria-valuemax', String(total));
    trackEl.setAttribute('aria-valuenow', String(current));
    fillEl.style.width = ((current / total) * 100) + '%';
  }

  function renderCurrent() {
    stopTimer();
    isTransitioning = false;
    if (state.index >= state.challenges.length) return finishChallenges();
    var challenge = state.challenges[state.index];
    if (challenge.type === 'duel' || challenge.type === 'style') renderChoice(challenge);
    else renderRating(challenge);
    saveState();
  }

  function renderRating(challenge) {
    showScreen('rating');
    updateProgress(els.progressCurrent, els.progressTotal, els.progressBar, els.progressFill);
    var photo = challenge.photos[0];
    var answer = state.answers[challenge.id];
    els.ratingStage.setAttribute('data-person', photo.personId);
    els.ratingStage.setAttribute('data-style', photo.styleId);
    els.ratingImage.src = photo.image;
    els.ratingImage.alt = '第 ' + (state.index + 1) + ' 题待评分 K-pop 男团成员造型照片';
    els.mysteryLabel.textContent = challenge.type === 'blind' ? 'WHO IS IT?' : 'MYSTERY ' + String(state.index + 1).padStart(2, '0');
    els.styleLabel.textContent = challenge.type === 'timed' ? '限时 3 秒' : photo.styleLabel;
    els.ratingCard.classList.toggle('is-blind', challenge.type === 'blind' && !answer);
    els.challengeKicker.textContent = challenge.type === 'blind' ? '神秘盲选' : (challenge.type === 'timed' ? '第一眼限时挑战' : '第一眼心动值');
    els.ratingTitle.textContent = challenge.type === 'blind' ? '只看氛围，你会心动吗？' : (challenge.type === 'timed' ? '3 秒内，凭直觉！' : '这一张，你给几分？');
    els.ratingStatus.textContent = answer ? revealCopy(photo, answer.score) : '';
    document.querySelectorAll('[data-score]').forEach(function (button) {
      var active = answer && answer.score === Number(button.getAttribute('data-score'));
      button.classList.toggle('is-selected', !!active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      button.disabled = false;
    });
    document.querySelector('.rating-screen [data-action="skip"]').disabled = false;
    document.querySelector('.rating-screen [data-action="back"]').disabled = state.index === 0;
    if (challenge.type === 'timed' && !answer) startTimer(challenge);
  }

  function startTimer(challenge) {
    var remaining = 30;
    els.timerWrap.hidden = false;
    els.timerFill.style.width = '100%';
    els.timerLabel.textContent = '3.0 秒';
    timerId = window.setInterval(function () {
      remaining -= 1;
      els.timerFill.style.width = Math.max(0, remaining / 30 * 100) + '%';
      els.timerLabel.textContent = (remaining / 10).toFixed(1) + ' 秒';
      if (remaining <= 0) {
        stopTimer();
        if (state.challenges[state.index] && state.challenges[state.index].id === challenge.id && !state.answers[challenge.id]) {
          els.ratingStatus.textContent = '时间到！直觉也需要一点勇气';
          window.setTimeout(advance, 420);
        }
      }
    }, 100);
  }

  function renderChoice(challenge) {
    showScreen('choice');
    updateProgress(els.choiceCurrent, els.choiceTotal, els.choiceTrack, els.choiceFill);
    var isStyle = challenge.type === 'style';
    els.choiceKicker.textContent = isStyle ? '反差风格挑战' : '心动二选一';
    els.choiceTitle.textContent = isStyle ? '同一个人，你更爱哪一面？' : '只能选一个';
    els.choiceCopy.textContent = isStyle ? '两种完全不同的氛围，选出更让你心动的造型。' : '别想太久，第一眼更想点开的就是答案。';
    els.choiceGrid.innerHTML = '';
    els.choiceStatus.textContent = '';
    challenge.photos.forEach(function (photo, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'duel-card';
      button.setAttribute('data-photo-id', photo.id);
      button.setAttribute('aria-label', '选择第 ' + (index + 1) + ' 张照片');
      button.innerHTML = '<span class="duel-photo" data-person="' + photo.personId + '" data-style="' + photo.styleId + '"><img src="' + photo.image + '" alt="候选造型照片"><span class="duel-number">0' + (index + 1) + '</span></span><span class="duel-cta">' + (isStyle ? photo.styleLabel : '选这张') + ' <b>♥</b></span>';
      if (state.answers[challenge.id] && state.answers[challenge.id].winnerId === photo.id) button.classList.add('is-selected');
      button.addEventListener('click', function () { chooseCurrent(photo.id); });
      els.choiceGrid.appendChild(button);
    });
    document.querySelector('.choice-screen [data-action="back"]').disabled = state.index === 0;
  }

  function revealCopy(photo, score) {
    if (score >= 4) return '本命级暴击：' + photo.personName + ' · ' + photo.group + ' ♥';
    if (score >= 3) return '被 ' + photo.personName + ' 的「' + photo.styleLabel + '」击中了';
    return '身份揭晓：' + photo.personName + ' · ' + photo.group;
  }

  function currentStreak() {
    var streak = 0;
    for (var i = state.index; i >= 0; i -= 1) {
      var challenge = state.challenges[i];
      var answer = state.answers[challenge.id];
      if (challenge.type === 'duel' || challenge.type === 'style') continue;
      if (!answer || answer.score < 3) break;
      streak += 1;
    }
    return streak;
  }

  function showToast(message) {
    els.streakToast.textContent = message;
    els.streakToast.classList.add('is-visible');
    window.setTimeout(function () { els.streakToast.classList.remove('is-visible'); }, 1400);
  }

  function rateCurrent(score) {
    if (isTransitioning) return;
    isTransitioning = true;
    stopTimer();
    var challenge = state.challenges[state.index];
    var photo = challenge.photos[0];
    state.answers[challenge.id] = { score: score };
    els.ratingCard.classList.remove('is-blind');
    els.ratingStatus.textContent = revealCopy(photo, score);
    document.querySelectorAll('[data-score]').forEach(function (button) { button.disabled = true; });
    var streak = currentStreak();
    if (streak >= 3) showToast('♥ ' + streak + ' 连心动！你的审美雷达启动了');
    window.setTimeout(advance, challenge.type === 'blind' ? 900 : 520);
  }

  function chooseCurrent(winnerId) {
    if (isTransitioning) return;
    isTransitioning = true;
    var challenge = state.challenges[state.index];
    var winner = challenge.photos.filter(function (photo) { return photo.id === winnerId; })[0];
    state.answers[challenge.id] = { winnerId: winnerId };
    Array.prototype.slice.call(els.choiceGrid.querySelectorAll('.duel-card')).forEach(function (card) {
      card.disabled = true;
      card.classList.toggle('is-selected', card.getAttribute('data-photo-id') === winnerId);
    });
    els.choiceStatus.textContent = challenge.type === 'style' ? '原来你更爱 ' + winner.personName + ' 的「' + winner.styleLabel + '」' : '第一眼选择：' + winner.personName + ' · ' + winner.group;
    window.setTimeout(advance, 720);
  }

  function advance() {
    isTransitioning = false;
    state.index += 1;
    renderCurrent();
  }

  function skipCurrent() {
    if (isTransitioning) return;
    stopTimer();
    var challenge = state.challenges[state.index];
    delete state.answers[challenge.id];
    advance();
  }

  function backOne() {
    if (isTransitioning || state.index <= 0) return;
    stopTimer();
    state.index -= 1;
    renderCurrent();
  }

  function finishChallenges() {
    stopTimer();
    var ratings = logic.buildRatings(state.challenges, state.answers);
    var finalists = logic.selectFinalists(state.round, ratings);
    if (finalists.length < 2) return showResults();
    renderFinalDuel(finalists);
    showScreen('duel');
  }

  function renderFinalDuel(finalists) {
    els.duelGrid.innerHTML = '';
    finalists.forEach(function (photo, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'duel-card final-card';
      button.innerHTML = '<span class="duel-photo" data-person="' + photo.personId + '" data-style="' + photo.styleId + '"><img src="' + photo.image + '" alt="' + photo.alt + '"><span class="duel-number">0' + (index + 1) + '</span></span><span class="duel-cta"><strong>' + photo.personName + '</strong><small>' + photo.group + '</small><b>选为冠军 ♥</b></span>';
      button.addEventListener('click', function () { state.finalWinnerId = photo.id; showResults(); });
      els.duelGrid.appendChild(button);
    });
  }

  function showResults() {
    state.completedAt = new Date().toISOString();
    renderResults();
    showScreen('result');
  }

  function renderResults() {
    var ratings = logic.buildRatings(state.challenges, state.answers);
    var result = logic.buildResult(data, state.round, ratings, state.finalWinnerId);
    els.winnerCard.innerHTML = ''; els.topThreeGrid.innerHTML = ''; els.styleBars.innerHTML = ''; els.groupBars.innerHTML = ''; els.resultStats.innerHTML = '';
    if (result.validCount < 1) {
      els.resultTitle.textContent = '你的心动雷达还没启动';
      els.resultSubtitle.textContent = '这一轮都跳过了，换一批再凭直觉选几张吧。';
      els.winnerCard.innerHTML = '<div class="empty-result">没有有效选择，暂时无法生成鉴定。</div>';
      return;
    }
    var favorite = result.favoriteStyle;
    var winner = result.winner;
    els.resultTitle.textContent = result.closeCall ? '你是全风格心动体质' : '你的关键词：' + favorite.keyword;
    els.resultSubtitle.textContent = favorite.result;
    els.winnerCard.innerHTML = '<div class="winner-photo" data-person="' + winner.photo.personId + '" data-style="' + winner.photo.styleId + '"><img src="' + winner.photo.image + '" alt="' + winner.photo.alt + '"><span class="crown">ULTIMATE PICK</span></div><div class="winner-copy"><span>终极心动冠军</span><h3>' + winner.photo.personName + '</h3><p>' + winner.photo.group + ' · ' + winner.photo.styleLabel + '</p></div>';
    els.resultStats.innerHTML = '<article><b>' + result.validCount + '</b><span>被比较的造型</span></article><article><b>' + result.focus + '%</b><span>本命浓度</span></article><article><b>' + favorite.label + '</b><span>最爱风格</span></article>';
    result.topThree.forEach(function (entry, index) {
      var item = document.createElement('article'); item.className = 'top-item';
      item.innerHTML = '<div class="top-photo" data-person="' + entry.photo.personId + '" data-style="' + entry.photo.styleId + '"><img src="' + entry.photo.image + '" alt="' + entry.photo.alt + '"><span>0' + (index + 1) + '</span></div><h4>' + entry.photo.personName + '</h4><p>' + entry.photo.styleLabel + ' · ' + entry.score.toFixed(1) + ' 分</p>';
      els.topThreeGrid.appendChild(item);
    });
    els.contrastCopy.textContent = result.closeCall ? '你的前两种风格得分非常接近，比起固定类型，你更容易被具体的人和瞬间击中。' : '「' + favorite.label + '」是你的高频心动开关，但最终冠军仍由你的终极二选一决定。';
    result.styleAverages.forEach(function (style) { appendBar(els.styleBars, style.label, style.average, style.count); });
    els.groupCopy.textContent = '这一轮中，' + result.favoriteGroup.name + ' 的平均心动值最高。它可能就是你自己都没发现的隐藏偏爱。';
    result.groupScores.slice(0, 3).forEach(function (group) { appendBar(els.groupBars, group.name, group.average, group.count); });
    lastShareText = '我的 K-pop 心动鉴定：' + winner.photo.personName + '（' + winner.photo.group + '）是终极心动冠军；关键词是「' + favorite.keyword + '」，隐藏偏爱是 ' + result.favoriteGroup.name + '。你也来测测看！';
  }

  function appendBar(container, label, average, count) {
    var row = document.createElement('div'); row.className = 'style-row';
    var percent = count ? Math.round((average / 4) * 100) : 0;
    row.innerHTML = '<div class="style-row-label"><span>' + label + '</span><b>' + (count ? average.toFixed(1) : '—') + '</b></div><div class="style-track"><span style="width:' + percent + '%"></span></div>';
    container.appendChild(row);
  }

  function shareResult() {
    if (!lastShareText) return;
    var text = lastShareText + '\n' + window.location.href.split('?')[0];
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { showToast('已复制心动鉴定，可以发给朋友啦'); });
    } else showToast('当前浏览器不支持复制，请截图分享');
  }

  function clearSaved() {
    stopTimer();
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
    if (action === 'share') shareResult();
  });

  preloadPhotos();
  if (loadState()) {
    if (state.screen === 'rating' || state.screen === 'choice') renderCurrent();
    else if (state.screen === 'duel') {
      var restoredRatings = logic.buildRatings(state.challenges, state.answers);
      var restoredFinalists = logic.selectFinalists(state.round, restoredRatings);
      if (restoredFinalists.length >= 2) { renderFinalDuel(restoredFinalists); showScreen('duel'); } else showResults();
    } else if (state.screen === 'result') { renderResults(); showScreen('result'); }
    else showScreen('intro');
  }
}());
