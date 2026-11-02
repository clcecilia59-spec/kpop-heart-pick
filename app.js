(function () {
  'use strict';

  var STORAGE_KEY = 'kpop-heart-pick-v12';
  var data = window.IDOL_DATA;
  var logic = window.AppLogic;
  var screens = Array.prototype.slice.call(document.querySelectorAll('[data-screen]'));
  var peopleById = {};
  data.people.forEach(function (person) { peopleById[person.id] = person; });
  var state = createInitialState();
  var timerId = null;
  var timerRemaining = 0;
  var isTransitioning = false;
  var lastShareText = '';

  var els = {
    firstCurrent: document.getElementById('first-current'), firstTotal: document.getElementById('first-total'), firstTrack: document.getElementById('first-track'), firstFill: document.getElementById('first-fill'),
    ratingStage: document.getElementById('rating-photo-stage'), ratingImage: document.getElementById('rating-image'), ratingMember: document.getElementById('rating-member'), ratingGroup: document.getElementById('rating-group'), ratingStatus: document.getElementById('rating-status'),
    styleCurrent: document.getElementById('style-current'), styleTotal: document.getElementById('style-total'), styleTrack: document.getElementById('style-track'), styleFill: document.getElementById('style-fill'), styleKicker: document.getElementById('style-kicker'), stylePair: document.getElementById('style-pair'), styleReaction: document.getElementById('style-reaction'),
    rosterCopy: document.getElementById('roster-copy'), rosterTicket: document.getElementById('roster-ticket'), nameGrid: document.getElementById('name-grid'), rosterStatus: document.getElementById('roster-status'), confirmRoster: document.getElementById('confirm-roster'),
    timedCurrent: document.getElementById('timed-current'), timedTotal: document.getElementById('timed-total'), timedTrack: document.getElementById('timed-track'), timedFill: document.getElementById('timed-fill'), timedGrid: document.getElementById('timed-grid'), timedStatus: document.getElementById('timed-status'), timerLabel: document.getElementById('timer-label'), timerFill: document.getElementById('timer-fill'),
    reviveGrid: document.getElementById('revive-grid'),
    gauntletCurrent: document.getElementById('gauntlet-current'), gauntletTotal: document.getElementById('gauntlet-total'), gauntletTrack: document.getElementById('gauntlet-track'), gauntletFill: document.getElementById('gauntlet-fill'), gauntletGrid: document.getElementById('gauntlet-grid'), gauntletStatus: document.getElementById('gauntlet-status'),
    resultTitle: document.getElementById('result-title'), resultSubtitle: document.getElementById('result-subtitle'), winnerCard: document.getElementById('winner-card'), resultStats: document.getElementById('result-stats'), topThreeGrid: document.getElementById('top-three-grid'), journeyCopy: document.getElementById('journey-copy'), streakToast: document.getElementById('streak-toast')
  };

  function createInitialState() {
    return {
      phase: 'intro', firstRound: [], firstIndex: 0, firstAnswers: {},
      styleRound: [], styleIndex: 0, styleAnswers: {},
      rosterPool: [], rosterSelected: [],
      timedDuels: [], timedIndex: 0, timedWinners: [], timedLosers: [], timedBye: null,
      duelRevivedId: null, gauntletOrder: [], gauntletIndex: 1, championId: null, gauntletWins: {}, completedAt: null
    };
  }

  function saveState() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { /* optional */ }
  }

  function loadState() {
    try {
      var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      if (saved && Array.isArray(saved.firstRound) && saved.firstRound.length === data.people.length && saved.firstAnswers) {
        state = saved; return true;
      }
    } catch (error) { /* ignore */ }
    return false;
  }

  function showScreen(name) {
    var changed = state.phase !== name;
    state.phase = name;
    screens.forEach(function (screen) { screen.classList.toggle('is-active', screen.getAttribute('data-screen') === name); });
    if (changed) window.scrollTo(0, 0);
    saveState();
  }

  function stopTimer() {
    if (timerId) window.clearInterval(timerId);
    timerId = null;
  }

  function updateProgress(currentEl, totalEl, trackEl, fillEl, index, total) {
    var current = Math.min(index + 1, Math.max(total, 1));
    currentEl.textContent = String(current).padStart(2, '0');
    totalEl.textContent = '/ ' + String(total).padStart(2, '0');
    trackEl.setAttribute('aria-valuemax', String(Math.max(total, 1)));
    trackEl.setAttribute('aria-valuenow', String(current));
    fillEl.style.width = (total ? current / total * 100 : 100) + '%';
  }

  function personPhoto(personId) {
    return logic.preferredPhoto(data, personId, state.styleAnswers, state.firstRound);
  }

  function anonymousNumber(personId) {
    var index = state.firstRound.findIndex(function (item) { return item.personId === personId; });
    return String(index >= 0 ? index + 1 : 0).padStart(2, '0');
  }

  function startTournament() {
    stopTimer(); isTransitioning = false; state = createInitialState();
    state.firstRound = logic.buildFirstRound(data);
    state.phase = 'rating'; renderFirst();
  }

  function renderFirst() {
    if (state.firstIndex >= state.firstRound.length) return finishFirst();
    showScreen('rating'); isTransitioning = false;
    updateProgress(els.firstCurrent, els.firstTotal, els.firstTrack, els.firstFill, state.firstIndex, state.firstRound.length);
    var item = state.firstRound[state.firstIndex]; var photo = item.photo; var person = peopleById[item.personId]; var answer = state.firstAnswers[item.personId];
    els.ratingStage.setAttribute('data-person', person.id); els.ratingStage.setAttribute('data-style', photo.styleId);
    els.ratingImage.src = photo.image; els.ratingImage.alt = '匿名候选 ' + anonymousNumber(person.id) + ' 的评分照片';
    els.ratingMember.textContent = '匿名候选 ' + anonymousNumber(person.id); els.ratingGroup.textContent = '身份已隐藏';
    els.ratingStatus.textContent = answer ? firstReaction(answer) : '第一轮每位成员都会出现一次';
    document.querySelectorAll('[data-first-score]').forEach(function (button) {
      var selected = Number(button.getAttribute('data-first-score')) === answer;
      button.classList.toggle('is-selected', selected); button.setAttribute('aria-pressed', selected ? 'true' : 'false'); button.disabled = false;
    });
    document.querySelector('[data-action="back-first"]').disabled = state.firstIndex === 0;
  }

  function firstReaction(score) {
    if (score === 4) return '本命雷达亮起：直接进入双风格复核';
    if (score === 3) return '心动确认：进入双风格复核';
    if (score === 1) return '无感也要复核：看看换个风格会不会逆转';
    return '有点帅但未到心动：暂时进入待复活名单';
  }

  function rateFirst(score) {
    if (isTransitioning) return;
    isTransitioning = true;
    var item = state.firstRound[state.firstIndex]; state.firstAnswers[item.personId] = score;
    els.ratingStatus.textContent = firstReaction(score);
    document.querySelectorAll('[data-first-score]').forEach(function (button) { button.disabled = true; });
    saveState(); window.setTimeout(function () { state.firstIndex += 1; renderFirst(); }, 360);
  }

  function backFirst() { if (!isTransitioning && state.firstIndex > 0) { state.firstIndex -= 1; renderFirst(); } }

  function finishFirst() {
    var ids = logic.styleCandidateIds(state.firstRound, state.firstAnswers);
    state.styleRound = logic.buildStyleRound(data, ids); state.styleIndex = 0;
    if (!state.styleRound.length) return finishStyles();
    renderStyle();
  }

  function renderStyle() {
    if (state.styleIndex >= state.styleRound.length) return finishStyles();
    showScreen('style'); isTransitioning = false;
    updateProgress(els.styleCurrent, els.styleTotal, els.styleTrack, els.styleFill, state.styleIndex, state.styleRound.length);
    var item = state.styleRound[state.styleIndex]; var person = peopleById[item.personId]; var answer = state.styleAnswers[item.personId] || {};
    els.styleKicker.textContent = '匿名候选 ' + anonymousNumber(person.id); els.stylePair.innerHTML = '';
    item.photos.forEach(function (photo, index) {
      var card = document.createElement('article'); card.className = 'style-card';
      card.innerHTML = '<div class="style-photo" data-person="' + person.id + '" data-style="' + photo.styleId + '"><img src="' + photo.image + '" alt="匿名候选的第 ' + (index + 1) + ' 种风格照片"><span>0' + (index + 1) + ' · ' + photo.styleLabel + '</span></div><div class="mini-score" data-photo-id="' + photo.id + '"><button type="button" data-style-score="1">无感</button><button type="button" data-style-score="3">心动</button><button type="button" data-style-score="4">本命</button></div>';
      Array.prototype.slice.call(card.querySelectorAll('[data-style-score]')).forEach(function (button) {
        var selected = answer[photo.id] === Number(button.getAttribute('data-style-score'));
        button.classList.toggle('is-selected', selected); button.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });
      els.stylePair.appendChild(card);
    });
    updateStyleReaction(item); document.querySelector('[data-action="back-style"]').disabled = state.styleIndex === 0;
  }

  function styleScore(photoId, score) {
    if (isTransitioning) return;
    var item = state.styleRound[state.styleIndex]; state.styleAnswers[item.personId] = state.styleAnswers[item.personId] || {};
    state.styleAnswers[item.personId][photoId] = score; renderStyle();
    var answer = state.styleAnswers[item.personId];
    var complete = item.photos.every(function (photo) { return typeof answer[photo.id] === 'number'; });
    if (complete) {
      isTransitioning = true;
      Array.prototype.slice.call(els.stylePair.querySelectorAll('[data-style-score]')).forEach(function (button) { button.disabled = true; });
      saveState();
      window.setTimeout(function () { state.styleIndex += 1; renderStyle(); }, 680);
    }
  }

  function updateStyleReaction(item) {
    var answer = state.styleAnswers[item.personId] || {}; var scores = item.photos.map(function (photo) { return answer[photo.id]; });
    var complete = scores.every(function (score) { return typeof score === 'number'; });
    if (!complete) { els.styleReaction.textContent = '请为两种风格分别做选择'; return; }
    var loved = scores.filter(function (score) { return score >= 3; }).length; var bias = scores.filter(function (score) { return score === 4; }).length;
    if (bias === 2) els.styleReaction.textContent = '双面本命：风格已经不重要，人最重要';
    else if (loved === 2) els.styleReaction.textContent = '两种都心动：你是这位成员的全风格受众';
    else if (loved === 1) els.styleReaction.textContent = '单风格狙击：只有一面精准命中你';
    else els.styleReaction.textContent = '反差复核完成：两种风格都没有逆转';
  }

  function backStyle() { if (!isTransitioning && state.styleIndex > 0) { state.styleIndex -= 1; renderStyle(); } }

  function finishStyles() {
    var advanced = logic.styleAdvancerIds(state.styleRound, state.styleAnswers);
    state.rosterPool = data.people.map(function (person) { return person.id; }).filter(function (id) { return advanced.indexOf(id) < 0; });
    state.rosterSelected = state.rosterSelected.filter(function (id) { return state.rosterPool.indexOf(id) >= 0; });
    if (!state.rosterPool.length) return prepareTimed();
    renderRoster();
  }

  function renderRoster() {
    showScreen('roster'); var limit = logic.resurrectionLimit(state.rosterPool.length);
    els.rosterTicket.textContent = '最多 ' + limit + ' 张复活票';
    els.rosterCopy.textContent = state.rosterPool.length + ' 位暂未晋级。最多选择 ' + limit + ' 位，仅凭名字给他们一次返场机会。';
    els.nameGrid.innerHTML = '';
    state.rosterPool.forEach(function (personId, cloudIndex) {
      var person = peopleById[personId]; var button = document.createElement('button'); button.type = 'button'; button.className = 'name-pick'; button.setAttribute('data-person-id', personId);
      button.classList.add('cloud-size-' + (cloudIndex % 3), 'cloud-tilt-' + (cloudIndex % 5));
      button.classList.toggle('is-selected', state.rosterSelected.indexOf(personId) >= 0); button.innerHTML = '<strong>' + person.name + '</strong>';
      button.addEventListener('click', function () { toggleRoster(personId, limit); }); els.nameGrid.appendChild(button);
    });
    els.rosterStatus.textContent = state.rosterSelected.length ? '已选择 ' + state.rosterSelected.length + ' / ' + limit + ' 位' : '至少选择 1 位复活';
    els.confirmRoster.disabled = state.rosterSelected.length < 1;
  }

  function toggleRoster(personId, limit) {
    var index = state.rosterSelected.indexOf(personId);
    if (index >= 0) state.rosterSelected.splice(index, 1);
    else if (state.rosterSelected.length < limit) state.rosterSelected.push(personId);
    else return showToast('复活票已用完，先取消一位再选择');
    renderRoster();
  }

  function prepareTimed() {
    var advanced = logic.styleAdvancerIds(state.styleRound, state.styleAnswers);
    var entrants = advanced.concat(state.rosterSelected).filter(function (id, index, all) { return all.indexOf(id) === index; });
    var bracket = logic.buildTimedDuels(entrants); state.timedDuels = bracket.duels; state.timedBye = bracket.bye; state.timedIndex = 0; state.timedWinners = []; state.timedLosers = [];
    if (!state.timedDuels.length) return finishTimed(); renderTimed();
  }

  function renderTimed() {
    stopTimer(); if (state.timedIndex >= state.timedDuels.length) return finishTimed();
    showScreen('timed'); isTransitioning = false;
    updateProgress(els.timedCurrent, els.timedTotal, els.timedTrack, els.timedFill, state.timedIndex, state.timedDuels.length);
    var duel = state.timedDuels[state.timedIndex]; els.timedGrid.innerHTML = ''; els.timedStatus.textContent = '';
    duel.personIds.forEach(function (personId, index) { els.timedGrid.appendChild(buildDuelCard(personId, index, 'timed')); });
    startTimer(duel);
  }

  function buildDuelCard(personId, index, mode) {
    var person = peopleById[personId]; var photo = personPhoto(personId); var button = document.createElement('button'); button.type = 'button'; button.className = 'duel-card'; button.setAttribute('data-person-id', personId);
    var badge = mode === 'gauntlet' && index === 0 ? '擂主' : (mode === 'gauntlet' ? '攻擂' : '0' + (index + 1));
    var anonymousTitle = mode === 'gauntlet' ? badge : '候选 ' + String(index + 1).padStart(2, '0');
    button.innerHTML = '<span class="duel-photo" data-person="' + personId + '" data-style="' + photo.styleId + '"><img src="' + photo.image + '" alt="匿名' + anonymousTitle + '照片"><span class="duel-number">' + badge + '</span></span><span class="duel-cta"><strong>' + anonymousTitle + '</strong><small>身份将在最后揭晓</small><b>' + (mode === 'gauntlet' ? '留在擂台 ♥' : '选他晋级 ♥') + '</b></span>';
    button.addEventListener('click', function () { if (mode === 'timed') chooseTimed(personId); else chooseGauntlet(personId); }); return button;
  }

  function startTimer(duel) {
    timerRemaining = 80; els.timerLabel.textContent = '8.0 秒'; els.timerFill.style.width = '100%';
    timerId = window.setInterval(function () {
      timerRemaining -= 1; els.timerLabel.textContent = (timerRemaining / 10).toFixed(1) + ' 秒'; els.timerFill.style.width = Math.max(0, timerRemaining / 80 * 100) + '%';
      if (timerRemaining <= 0) {
        stopTimer(); var scores = duel.personIds.map(function (id) { return logic.personScore(id, state.firstAnswers, state.styleAnswers, state.timedWinners, state.gauntletWins); });
        var winner = scores[0] === scores[1] ? duel.personIds[Math.floor(Math.random() * 2)] : duel.personIds[scores[0] > scores[1] ? 0 : 1];
        els.timedStatus.textContent = '时间到！已按此前的心动值自动保送'; chooseTimed(winner, true);
      }
    }, 100);
  }

  function chooseTimed(winnerId, timedOut) {
    if (isTransitioning) return; isTransitioning = true; stopTimer();
    var duel = state.timedDuels[state.timedIndex]; var loserId = duel.personIds.filter(function (id) { return id !== winnerId; })[0];
    state.timedWinners.push(winnerId); state.timedLosers.push(loserId);
    Array.prototype.slice.call(els.timedGrid.children).forEach(function (card) { card.disabled = true; card.classList.toggle('is-selected', card.getAttribute('data-person-id') === winnerId); });
    if (!timedOut) els.timedStatus.textContent = '你的选择已晋级，另一位进入败者区';
    saveState(); window.setTimeout(function () { state.timedIndex += 1; renderTimed(); }, 650);
  }

  function finishTimed() {
    stopTimer();
    if (state.timedLosers.length) return renderRevive();
    startGauntlet(state.timedWinners.concat(state.timedBye ? [state.timedBye] : []));
  }

  function renderRevive() {
    showScreen('revive'); els.reviveGrid.innerHTML = '';
    state.timedLosers.forEach(function (personId) {
      var photo = personPhoto(personId); var button = document.createElement('button'); button.type = 'button'; button.className = 'revive-card';
      button.innerHTML = '<span class="revive-photo" data-person="' + personId + '" data-style="' + photo.styleId + '"><img src="' + photo.image + '" alt="匿名败者照片"></span><strong>匿名败者</strong><small>最后再揭晓身份</small><b>复活他</b>';
      button.addEventListener('click', function () { state.duelRevivedId = personId; startGauntlet(state.timedWinners.concat(state.timedBye ? [state.timedBye] : []).concat([personId])); }); els.reviveGrid.appendChild(button);
    });
  }

  function startGauntlet(personIds) {
    state.gauntletOrder = logic.buildGauntlet(personIds.filter(function (id, index, all) { return all.indexOf(id) === index; })); state.gauntletIndex = 1; state.championId = state.gauntletOrder[0] || null; state.gauntletWins = {};
    if (state.gauntletOrder.length <= 1) return showResults(); renderGauntlet();
  }

  function renderGauntlet() {
    if (state.gauntletIndex >= state.gauntletOrder.length) return showResults();
    showScreen('gauntlet'); isTransitioning = false;
    updateProgress(els.gauntletCurrent, els.gauntletTotal, els.gauntletTrack, els.gauntletFill, state.gauntletIndex - 1, state.gauntletOrder.length - 1);
    var challengerId = state.gauntletOrder[state.gauntletIndex]; els.gauntletGrid.innerHTML = ''; els.gauntletStatus.textContent = '';
    els.gauntletGrid.appendChild(buildDuelCard(state.championId, 0, 'gauntlet')); els.gauntletGrid.appendChild(buildDuelCard(challengerId, 1, 'gauntlet'));
  }

  function chooseGauntlet(winnerId) {
    if (isTransitioning) return; isTransitioning = true;
    var challengerId = state.gauntletOrder[state.gauntletIndex]; var loserId = winnerId === state.championId ? challengerId : state.championId;
    state.championId = winnerId; state.gauntletWins[winnerId] = (state.gauntletWins[winnerId] || 0) + 1;
    Array.prototype.slice.call(els.gauntletGrid.children).forEach(function (card) { card.disabled = true; card.classList.toggle('is-selected', card.getAttribute('data-person-id') === winnerId); });
    els.gauntletStatus.textContent = winnerId === challengerId ? '攻擂成功，新擂主诞生' : '擂主守住了这一轮';
    saveState(); window.setTimeout(function () { state.gauntletIndex += 1; renderGauntlet(); }, 700);
  }

  function showResults() {
    state.completedAt = new Date().toISOString(); renderResults(); showScreen('result');
  }

  function renderResults() {
    var champion = peopleById[state.championId];
    if (!champion) { els.resultTitle.textContent = '这一轮没有产生冠军'; els.resultSubtitle.textContent = '重新开赛，至少复活一位成员继续吧。'; return; }
    var winnerPhoto = personPhoto(champion.id);
    var photoById = {}; data.photos.forEach(function (photo) { photoById[photo.id] = photo; });
    var personScores = {};
    data.people.forEach(function (person) { personScores[person.id] = logic.personScore(person.id, state.firstAnswers, state.styleAnswers, state.timedWinners, state.gauntletWins); });
    var groupRows = data.groups.map(function (group) {
      var members = data.people.filter(function (person) { return person.groupId === group.id; });
      var total = members.reduce(function (sum, person) { return sum + personScores[person.id]; }, 0);
      var hits = members.filter(function (person) {
        var styles = state.styleAnswers[person.id] || {};
        return state.firstAnswers[person.id] >= 3 || Object.keys(styles).some(function (photoId) { return styles[photoId] >= 3; });
      });
      var topMember = members.slice().sort(function (a, b) { return personScores[b.id] - personScores[a.id]; })[0];
      return { group: group, average: members.length ? total / members.length : 0, hits: hits.length, topMember: topMember };
    }).sort(function (a, b) { return b.average - a.average; });
    var styleCounts = {}; data.styles.forEach(function (style) { styleCounts[style.id] = 0; });
    var biasPhotos = 0; var heartPhotos = 0; var singleStyleHits = 0; var doubleStyleHits = 0;
    Object.keys(state.styleAnswers).forEach(function (personId) {
      Object.keys(state.styleAnswers[personId]).forEach(function (photoId) {
        var score = state.styleAnswers[personId][photoId]; var photo = photoById[photoId];
        if (score >= 3) { heartPhotos += 1; if (photo) styleCounts[photo.styleId] = (styleCounts[photo.styleId] || 0) + 1; }
        if (score === 4) biasPhotos += 1;
      });
    });
    state.styleRound.forEach(function (item) {
      var answers = state.styleAnswers[item.personId] || {};
      var loved = item.photos.filter(function (photo) { return answers[photo.id] >= 3; }).length;
      if (loved === 1) singleStyleHits += 1;
      if (loved === 2) doubleStyleHits += 1;
    });
    var dominantStyle = data.styles.slice().sort(function (a, b) { return (styleCounts[b.id] || 0) - (styleCounts[a.id] || 0); })[0];
    if (!dominantStyle || !(styleCounts[dominantStyle.id] || 0)) dominantStyle = data.styles.filter(function (style) { return style.id === winnerPhoto.styleId; })[0] || data.styles[0];
    var profileCopy = doubleStyleHits > singleStyleHits
      ? '你一旦认准一个人，就很容易变成“换什么造型都可以”的全风格派。'
      : (singleStyleHits ? '你是精准风格狙击手：喜欢的是人，也很看造型有没有按下正确开关。' : '你的选择非常看第一眼，几乎不给套路和标签干扰判断。');

    els.resultTitle.textContent = '答案揭晓：' + champion.name;
    els.resultSubtitle.textContent = '名字和团体都藏起来以后，你的直觉还是把他送到了最后。';
    els.winnerCard.innerHTML = '<div class="winner-photo" data-person="' + champion.id + '" data-style="' + winnerPhoto.styleId + '"><img src="' + winnerPhoto.image + '" alt="' + winnerPhoto.alt + '"><span class="crown">ULTIMATE CHAMPION</span></div><div class="winner-copy"><span>终极心动冠军</span><h3>' + champion.name + '</h3><p>' + champion.group + ' · ' + winnerPhoto.styleLabel + '</p></div>';
    els.resultStats.innerHTML = '<article><b>' + biasPhotos + '</b><span>本命暴击照</span></article><article><b>' + heartPhotos + '</b><span>心动照片</span></article><article><b>' + dominantStyle.label + '</b><span>头号心动开关</span></article>';
    els.topThreeGrid.innerHTML = '';
    var maxAverage = groupRows[0] ? groupRows[0].average : 1;
    groupRows.forEach(function (row, index) {
      var item = document.createElement('article'); item.className = 'group-rank-item';
      var width = Math.max(8, row.average / Math.max(maxAverage, 1) * 100);
      item.innerHTML = '<span class="group-rank-no">' + String(index + 1).padStart(2, '0') + '</span><div class="group-rank-copy"><h4>' + row.group.name + '</h4><p>命中 ' + row.hits + ' 位 · 最高心动 ' + row.topMember.name + '</p><span class="group-rank-meter"><i style="width:' + width.toFixed(1) + '%"></i></span></div><div class="group-rank-score"><b>' + row.average.toFixed(1) + '</b><span>人均心动</span></div>';
      els.topThreeGrid.appendChild(item);
    });
    els.journeyCopy.textContent = groupRows[0].group.name + ' 是你的团体偏好第一名；' + dominantStyle.result + profileCopy + ' 最终，' + champion.name + ' 成了这次匿名测试里最稳定的心动答案。';
    lastShareText = '我的匿名 K-pop 心动测试冠军是 ' + champion.name + '（' + champion.group + '）！团体偏好第一名是 ' + groupRows[0].group.name + '，心动开关是“' + dominantStyle.label + '”。';
  }

  function showToast(message) { els.streakToast.textContent = message; els.streakToast.classList.add('is-visible'); window.setTimeout(function () { els.streakToast.classList.remove('is-visible'); }, 1500); }

  function shareResult() {
    if (!lastShareText) renderResults(); var text = lastShareText + '\n' + window.location.href.split('?')[0];
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { showToast('已复制冠军结果'); });
    else showToast('当前浏览器不支持复制，请截图分享');
  }

  function clearSaved() { stopTimer(); try { window.localStorage.removeItem(STORAGE_KEY); } catch (error) { /* no-op */ } state = createInitialState(); showScreen('intro'); }

  function renderPhase() {
    stopTimer();
    if (state.phase === 'rating') renderFirst();
    else if (state.phase === 'style') renderStyle();
    else if (state.phase === 'roster') renderRoster();
    else if (state.phase === 'timed') renderTimed();
    else if (state.phase === 'revive') renderRevive();
    else if (state.phase === 'gauntlet') renderGauntlet();
    else if (state.phase === 'result') { renderResults(); showScreen('result'); }
    else showScreen('intro');
  }

  document.addEventListener('click', function (event) {
    var first = event.target.closest('[data-first-score]'); if (first) return rateFirst(Number(first.getAttribute('data-first-score')));
    var style = event.target.closest('[data-style-score]'); if (style) return styleScore(style.closest('[data-photo-id]').getAttribute('data-photo-id'), Number(style.getAttribute('data-style-score')));
    var actionButton = event.target.closest('[data-action]'); if (!actionButton) return; var action = actionButton.getAttribute('data-action');
    if (action === 'start' || action === 'replay' || action === 'restart') startTournament();
    if (action === 'back-first') backFirst(); if (action === 'back-style') backStyle();
    if (action === 'confirm-roster') prepareTimed(); if (action === 'skip-revive') startGauntlet(state.timedWinners.concat(state.timedBye ? [state.timedBye] : []));
    if (action === 'home') showScreen('intro'); if (action === 'clear') clearSaved(); if (action === 'share') shareResult();
  });

  if (loadState()) renderPhase(); else showScreen('intro');
}());
