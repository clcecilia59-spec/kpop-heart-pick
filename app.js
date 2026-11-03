(function () {
  'use strict';

  var STORAGE_KEY = 'kpop-heart-pick-v15';
  var PAGE_SIZE = 8;
  var MIN_WALL_PICKS = 8;
  var MAX_WALL_PICKS = 16;
  var MIN_REVIEW_ADVANCERS = 6;
  var MAX_REVIEW_ADVANCERS = 14;
  var data = window.IDOL_DATA;
  var logic = window.AppLogic;
  var peopleById = {};
  data.people.forEach(function (person) { peopleById[person.id] = person; });
  var screens = Array.prototype.slice.call(document.querySelectorAll('[data-screen]'));
  var state = createInitialState();
  var isTransitioning = false;
  var lastShareText = '';

  var els = {
    wallCurrent: document.getElementById('wall-current'), wallTotal: document.getElementById('wall-total'), wallTrack: document.getElementById('wall-track'), wallFill: document.getElementById('wall-fill'), wallGrid: document.getElementById('wall-grid'), wallStatus: document.getElementById('wall-status'), wallNext: document.getElementById('wall-next'),
    reviewGrid: document.getElementById('review-grid'), reviewStatus: document.getElementById('review-status'), confirmReview: document.getElementById('confirm-review'),
    secondChanceGrid: document.getElementById('second-chance-grid'), secondChanceStatus: document.getElementById('second-chance-status'), confirmSecondChance: document.getElementById('confirm-second-chance'),
    rosterCopy: document.getElementById('roster-copy'), rosterTicket: document.getElementById('roster-ticket'), nameGrid: document.getElementById('name-grid'), rosterStatus: document.getElementById('roster-status'), confirmRoster: document.getElementById('confirm-roster'),
    qualifierCurrent: document.getElementById('qualifier-current'), qualifierTrack: document.getElementById('qualifier-track'), qualifierFill: document.getElementById('qualifier-fill'), qualifierGrid: document.getElementById('qualifier-grid'), qualifierStatus: document.getElementById('qualifier-status'),
    postRevivalGrid: document.getElementById('post-revival-grid'), postRevivalStatus: document.getElementById('post-revival-status'), confirmPostRevival: document.getElementById('confirm-post-revival'),
    duelChip: document.getElementById('duel-chip'), duelKicker: document.getElementById('duel-kicker'), duelTitle: document.getElementById('duel-title'), duelCopy: document.getElementById('duel-copy'), duelGrid: document.getElementById('duel-grid'), duelStatus: document.getElementById('duel-status'),
    resultTitle: document.getElementById('result-title'), resultSubtitle: document.getElementById('result-subtitle'), winnerCard: document.getElementById('winner-card'), resultStats: document.getElementById('result-stats'), topThree: document.getElementById('top-three'), biasSection: document.getElementById('bias-section'), biasGallery: document.getElementById('bias-gallery'), groupRanking: document.getElementById('group-ranking'), journeyCopy: document.getElementById('journey-copy'), toast: document.getElementById('streak-toast')
  };

  function createInitialState() {
    return {
      phase: 'intro', wallOrder: [], wallPage: 0, wallPicks: {}, wallPhotoIndexes: {}, firstRound: [],
      reviewIds: [], reviewSelections: {}, styleAnswers: {}, reviewAdvanced: [],
      secondChanceIds: [], secondChanceSelections: {}, secondChanceAdvanced: [],
      rosterPool: [], rosterSelected: [], qualifierGroups: [], qualifierIndex: 0, qualifierWinners: [],
      postRevivalPool: [], postRevivalSelected: [], revivalDuels: [], revivalIndex: 0, revivalWinners: [], finalFour: [],
      semifinalDuels: [], semifinalIndex: 0, semifinalWinners: [], finalists: [], championId: null, completedAt: null
    };
  }

  function showScreen(name) {
    var changed = state.phase !== name;
    state.phase = name;
    screens.forEach(function (screen) { screen.classList.toggle('is-active', screen.getAttribute('data-screen') === name); });
    if (changed) window.scrollTo(0, 0);
    saveState();
  }

  function saveState() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { /* optional */ }
  }

  function loadState() {
    try {
      var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      if (saved && Array.isArray(saved.wallOrder) && saved.wallOrder.length === data.people.length) { state = saved; return true; }
    } catch (error) { /* ignore */ }
    return false;
  }

  function photosFor(personId) { return logic.photosFor(data, personId); }
  function unique(items) { return items.filter(function (item, index, all) { return all.indexOf(item) === index; }); }
  function selectedWallIds() { return state.wallOrder.filter(function (id) { return state.wallPicks[id] >= 3; }); }
  function reviewAdvancedIds() { return state.reviewIds.filter(function (id) { return (state.reviewSelections[id] || []).length > 0; }); }
  function secondChanceAdvancedIds() { return state.secondChanceIds.filter(function (id) { return (state.secondChanceSelections[id] || []).length > 0; }); }
  function photoAdvancedIds() { return unique(state.reviewAdvanced.concat(state.secondChanceAdvanced)); }
  function anonymousNumber(personId) { return String(state.wallOrder.indexOf(personId) + 1).padStart(2, '0'); }
  function preferredPhoto(personId) { return logic.preferredPhoto(data, personId, state.styleAnswers, state.firstRound); }

  function updateProgress(currentEl, totalEl, trackEl, fillEl, index, total) {
    var current = Math.min(index + 1, Math.max(total, 1));
    currentEl.textContent = String(current).padStart(2, '0');
    if (totalEl) totalEl.textContent = '/ ' + String(total).padStart(2, '0');
    trackEl.setAttribute('aria-valuemax', String(Math.max(total, 1))); trackEl.setAttribute('aria-valuenow', String(current));
    fillEl.style.width = (total ? current / total * 100 : 100) + '%';
  }

  function startTournament() {
    isTransitioning = false; state = createInitialState();
    state.wallOrder = logic.shuffle(data.people).map(function (person) { return person.id; });
    state.firstRound = state.wallOrder.map(function (personId) { return { personId: personId, photo: photosFor(personId)[0] }; });
    renderWall();
  }

  function renderWall() {
    showScreen('wall'); isTransitioning = false;
    var totalPages = Math.ceil(state.wallOrder.length / PAGE_SIZE);
    updateProgress(els.wallCurrent, els.wallTotal, els.wallTrack, els.wallFill, state.wallPage, totalPages);
    var pageIds = state.wallOrder.slice(state.wallPage * PAGE_SIZE, (state.wallPage + 1) * PAGE_SIZE);
    els.wallGrid.innerHTML = '';
    pageIds.forEach(function (personId) { els.wallGrid.appendChild(buildWallCard(personId)); });
    var count = selectedWallIds().length;
    els.wallStatus.textContent = '心动席位 ' + count + ' / ' + MAX_WALL_PICKS + (count < MIN_WALL_PICKS ? ' · 扫完至少留下 ' + MIN_WALL_PICKS + ' 位' : ' · 已达到复核门槛');
    els.wallNext.textContent = state.wallPage === totalPages - 1 ? '进入双图复核' : '下一墙，继续扫';
    document.querySelector('[data-action="wall-prev"]').disabled = state.wallPage === 0;
  }

  function buildWallCard(personId) {
    var photos = photosFor(personId); var index = state.wallPhotoIndexes[personId] || 0; var photo = photos[index % photos.length]; var pick = state.wallPicks[personId] || 0;
    var card = document.createElement('article'); card.className = 'wall-card'; card.setAttribute('data-person-id', personId);
    card.innerHTML = '<button class="wall-photo-toggle" type="button" aria-label="切换匿名候选 ' + anonymousNumber(personId) + ' 的另一种风格"><img src="' + photo.image + '" alt="匿名候选 ' + anonymousNumber(personId) + ' 的风格照片"><span class="wall-number">' + anonymousNumber(personId) + '</span><span class="flip-hint">点我换造型 ↻</span></button><button class="heart-pick' + (pick === 3 ? ' is-heart' : '') + (pick === 4 ? ' is-bias' : '') + '" type="button" aria-label="标记匿名候选 ' + anonymousNumber(personId) + '"><span>' + (pick === 4 ? '♥♥' : (pick === 3 ? '♥' : '♡')) + '</span><b>' + (pick === 4 ? '本命' : (pick === 3 ? '心动' : '收下')) + '</b></button>';
    card.querySelector('.wall-photo-toggle').addEventListener('click', function () { toggleWallPhoto(personId); });
    bindHeartButton(card.querySelector('.heart-pick'), personId);
    return card;
  }

  function toggleWallPhoto(personId) {
    var photos = photosFor(personId); state.wallPhotoIndexes[personId] = ((state.wallPhotoIndexes[personId] || 0) + 1) % photos.length;
    var item = state.firstRound.filter(function (entry) { return entry.personId === personId; })[0];
    if (item) item.photo = photos[state.wallPhotoIndexes[personId]];
    renderWall();
  }

  function bindHeartButton(button, personId) {
    var clickTimer = null;
    button.addEventListener('click', function (event) {
      event.preventDefault();
      if (event.detail === 0) return setWallPick(personId, 3);
      if (clickTimer) {
        window.clearTimeout(clickTimer); clickTimer = null;
        setWallPick(personId, 4); showToast('双击命中！本命警报已拉响'); return;
      }
      clickTimer = window.setTimeout(function () { clickTimer = null; setWallPick(personId, 3); }, 320);
    });
  }

  function setWallPick(personId, score) {
    var current = state.wallPicks[personId] || 0; var count = selectedWallIds().length;
    if (!current && count >= MAX_WALL_PICKS) return showToast('心动区满员啦，先放回一位再收新人');
    if (current === score) delete state.wallPicks[personId]; else state.wallPicks[personId] = score;
    renderWall();
  }

  function nextWall() {
    var totalPages = Math.ceil(state.wallOrder.length / PAGE_SIZE);
    if (state.wallPage < totalPages - 1) { state.wallPage += 1; return renderWall(); }
    var selected = selectedWallIds();
    if (selected.length < MIN_WALL_PICKS) return showToast('雷达还差 ' + (MIN_WALL_PICKS - selected.length) + ' 次心动，回去再捞几位吧');
    prepareReview(selected);
  }

  function prepareReview(ids) {
    state.reviewIds = ids.slice().sort(function (a, b) { return (state.wallPicks[b] || 0) - (state.wallPicks[a] || 0); });
    state.reviewSelections = {};
    state.reviewIds.forEach(function (id) {
      var photos = photosFor(id); var index = state.wallPhotoIndexes[id] || 0;
      state.reviewSelections[id] = [photos[index % photos.length].id];
    });
    renderReview();
  }

  function renderReview() {
    showScreen('review'); els.reviewGrid.innerHTML = '';
    state.reviewIds.forEach(function (personId) {
      var card = document.createElement('article'); card.className = 'review-card';
      var selected = state.reviewSelections[personId] || []; var photos = photosFor(personId).slice(0, 2);
      card.innerHTML = '<div class="review-card-head"><span>候选 ' + anonymousNumber(personId) + '</span><b>' + (state.wallPicks[personId] === 4 ? '本命入场' : '二次确认') + '</b></div><div class="review-photo-pair"></div>';
      var pair = card.querySelector('.review-photo-pair');
      photos.forEach(function (photo, index) {
        var button = document.createElement('button'); button.type = 'button'; button.className = 'review-photo' + (selected.indexOf(photo.id) >= 0 ? ' is-selected' : '');
        button.innerHTML = '<img src="' + photo.image + '" alt="匿名候选 ' + anonymousNumber(personId) + ' 风格 ' + (index + 1) + '"><span>' + photo.styleLabel + '</span><i>♥</i>';
        button.addEventListener('click', function () { toggleReviewPhoto(personId, photo.id); }); pair.appendChild(button);
      });
      els.reviewGrid.appendChild(card);
    });
    updateReviewStatus();
  }

  function toggleReviewPhoto(personId, photoId) {
    var selected = state.reviewSelections[personId] || []; var index = selected.indexOf(photoId);
    if (index >= 0) selected.splice(index, 1); else selected.push(photoId);
    state.reviewSelections[personId] = selected; renderReview();
  }

  function updateReviewStatus() {
    var count = reviewAdvancedIds().length;
    els.reviewStatus.textContent = '复核后保留 ' + count + ' 位 · 目标 ' + MIN_REVIEW_ADVANCERS + '–' + MAX_REVIEW_ADVANCERS + ' 位';
    els.confirmReview.disabled = count < MIN_REVIEW_ADVANCERS || count > MAX_REVIEW_ADVANCERS;
  }

  function confirmReview() {
    var advanced = reviewAdvancedIds();
    if (advanced.length < MIN_REVIEW_ADVANCERS || advanced.length > MAX_REVIEW_ADVANCERS) return showToast('请把晋级人数控制在 ' + MIN_REVIEW_ADVANCERS + '–' + MAX_REVIEW_ADVANCERS + ' 位');
    state.reviewAdvanced = advanced; state.styleAnswers = {};
    state.reviewIds.forEach(function (id) {
      state.styleAnswers[id] = {}; var selected = state.reviewSelections[id] || [];
      photosFor(id).slice(0, 2).forEach(function (photo) { state.styleAnswers[id][photo.id] = selected.indexOf(photo.id) >= 0 ? (state.wallPicks[id] === 4 ? 4 : 3) : 1; });
    });
    prepareSecondChance();
  }

  function prepareSecondChance() {
    state.secondChanceIds = state.wallOrder.filter(function (id) {
      return state.reviewIds.indexOf(id) < 0 && (state.wallPhotoIndexes[id] || 0) === 0;
    });
    state.secondChanceSelections = {};
    state.secondChanceIds.forEach(function (id) { state.secondChanceSelections[id] = []; });
    renderSecondChance();
  }

  function renderSecondChance() {
    showScreen('second-chance'); els.secondChanceGrid.innerHTML = '';
    state.secondChanceIds.forEach(function (personId) {
      var card = document.createElement('article'); card.className = 'review-card';
      var selected = state.secondChanceSelections[personId] || [];
      card.innerHTML = '<div class="review-card-head"><span>候选 ' + anonymousNumber(personId) + '</span><b>等待翻盘</b></div><div class="review-photo-pair"></div>';
      var pair = card.querySelector('.review-photo-pair');
      photosFor(personId).slice(0, 2).forEach(function (photo, index) {
        var button = document.createElement('button'); button.type = 'button'; button.className = 'review-photo' + (selected.indexOf(photo.id) >= 0 ? ' is-selected' : '');
        button.innerHTML = '<img src="' + photo.image + '" alt="匿名候选 ' + anonymousNumber(personId) + ' 风格 ' + (index + 1) + '"><span>' + photo.styleLabel + '</span><i>♥</i>';
        button.addEventListener('click', function () { toggleSecondChancePhoto(personId, photo.id); }); pair.appendChild(button);
      });
      els.secondChanceGrid.appendChild(card);
    });
    updateSecondChanceStatus();
  }

  function toggleSecondChancePhoto(personId, photoId) {
    var selected = state.secondChanceSelections[personId] || []; var index = selected.indexOf(photoId);
    if (index >= 0) selected.splice(index, 1); else {
      var currentAdvanced = state.reviewAdvanced.length + secondChanceAdvancedIds().length;
      if (!selected.length && currentAdvanced >= MAX_REVIEW_ADVANCERS) return showToast('心动晋级区先留到 ' + MAX_REVIEW_ADVANCERS + ' 位，给名字复活赛留两个座位');
      selected.push(photoId);
    }
    state.secondChanceSelections[personId] = selected; renderSecondChance();
  }

  function updateSecondChanceStatus() {
    var count = secondChanceAdvancedIds().length; var total = state.reviewAdvanced.length + count;
    els.secondChanceStatus.textContent = count ? '成功翻盘 ' + count + ' 位 · 当前照片晋级共 ' + total + ' / ' + MAX_REVIEW_ADVANCERS + ' 位' : '暂时无人翻盘 · 可以直接继续';
  }

  function confirmSecondChance() {
    state.secondChanceAdvanced = secondChanceAdvancedIds();
    state.secondChanceIds.forEach(function (id) {
      state.styleAnswers[id] = state.styleAnswers[id] || {}; var selected = state.secondChanceSelections[id] || [];
      photosFor(id).slice(0, 2).forEach(function (photo) { state.styleAnswers[id][photo.id] = selected.indexOf(photo.id) >= 0 ? 3 : 1; });
    });
    var advanced = photoAdvancedIds();
    state.rosterPool = state.wallOrder.filter(function (id) { return advanced.indexOf(id) < 0; }); state.rosterSelected = [];
    renderRoster();
  }

  function renderRoster() {
    showScreen('roster'); var limit = Math.min(2, state.rosterPool.length);
    els.rosterTicket.textContent = limit + ' 张复活票'; els.rosterCopy.textContent = '这里有 ' + state.rosterPool.length + ' 位遗珠。照片先放一边，单凭名字选回 ' + limit + ' 位。';
    els.nameGrid.innerHTML = '';
    state.rosterPool.forEach(function (personId, index) {
      var button = document.createElement('button'); button.type = 'button'; button.className = 'name-pick cloud-size-' + (index % 3) + ' cloud-tilt-' + (index % 5); button.setAttribute('data-person-id', personId);
      button.classList.toggle('is-selected', state.rosterSelected.indexOf(personId) >= 0); button.innerHTML = '<strong>' + peopleById[personId].name + '</strong>';
      button.addEventListener('click', function () { toggleRoster(personId, limit); }); els.nameGrid.appendChild(button);
    });
    els.rosterStatus.textContent = '已复活 ' + state.rosterSelected.length + ' / ' + limit + ' 位'; els.confirmRoster.disabled = state.rosterSelected.length !== limit;
  }

  function toggleRoster(personId, limit) {
    var index = state.rosterSelected.indexOf(personId);
    if (index >= 0) state.rosterSelected.splice(index, 1); else if (state.rosterSelected.length < limit) state.rosterSelected.push(personId); else return showToast('两张票都用完啦，先换下一位');
    renderRoster();
  }

  function prepareQualifier() {
    var entrants = logic.shuffle(unique(photoAdvancedIds().concat(state.rosterSelected)));
    if (entrants.length < 8 || entrants.length > 16) return showToast('抢位赛需要 8–16 位候选');
    state.qualifierGroups = [[], [], [], []]; entrants.forEach(function (id, index) { state.qualifierGroups[index % 4].push(id); });
    state.qualifierIndex = 0; state.qualifierWinners = []; renderQualifier();
  }

  function renderQualifier() {
    if (state.qualifierIndex >= state.qualifierGroups.length) return preparePostRevival();
    showScreen('qualifier'); isTransitioning = false;
    updateProgress(els.qualifierCurrent, null, els.qualifierTrack, els.qualifierFill, state.qualifierIndex, 4);
    els.qualifierGrid.innerHTML = ''; els.qualifierStatus.textContent = '';
    state.qualifierGroups[state.qualifierIndex].forEach(function (id, index) { els.qualifierGrid.appendChild(buildBattleCard(id, index, 'qualifier')); });
  }

  function buildBattleCard(personId, index, mode) {
    var photo = preferredPhoto(personId); var button = document.createElement('button'); button.type = 'button'; button.className = mode === 'qualifier' ? 'battle-card' : 'duel-card'; button.setAttribute('data-person-id', personId);
    var label = mode === 'qualifier' ? '候选 ' + String(index + 1).padStart(2, '0') : (index === 0 ? '左边这位' : '右边这位');
    button.innerHTML = '<span class="duel-photo" data-person="' + personId + '" data-style="' + photo.styleId + '"><img src="' + photo.image + '" alt="匿名' + label + '照片"><span class="duel-number">' + String(index + 1).padStart(2, '0') + '</span></span><span class="duel-cta"><strong>' + label + '</strong><small>身份最后揭晓</small><b>就是他 ♥</b></span>';
    button.addEventListener('click', function () { if (mode === 'qualifier') chooseQualifier(personId); else if (mode === 'challenge') chooseRevivalChallenge(personId); else chooseDuel(personId); }); return button;
  }

  function chooseQualifier(personId) {
    if (isTransitioning) return; isTransitioning = true; state.qualifierWinners.push(personId);
    var chosenPhoto = preferredPhoto(personId); state.styleAnswers[personId] = state.styleAnswers[personId] || {};
    if (!Object.keys(state.styleAnswers[personId]).some(function (photoId) { return state.styleAnswers[personId][photoId] >= 3; })) state.styleAnswers[personId][chosenPhoto.id] = 3;
    Array.prototype.slice.call(els.qualifierGrid.children).forEach(function (card) { card.disabled = true; card.classList.toggle('is-selected', card.getAttribute('data-person-id') === personId); });
    els.qualifierStatus.textContent = '抢位成功！下一组正在赶来'; saveState();
    window.setTimeout(function () { state.qualifierIndex += 1; renderQualifier(); }, 520);
  }

  function preparePostRevival() {
    state.postRevivalPool = [].concat.apply([], state.qualifierGroups).filter(function (id) { return state.qualifierWinners.indexOf(id) < 0; });
    state.postRevivalSelected = []; renderPostRevival();
  }

  function renderPostRevival() {
    showScreen('post-revival'); els.postRevivalGrid.innerHTML = '';
    state.postRevivalPool.forEach(function (personId, index) {
      var photo = preferredPhoto(personId); var selected = state.postRevivalSelected.indexOf(personId) >= 0;
      var button = document.createElement('button'); button.type = 'button'; button.className = 'battle-card revival-pick' + (selected ? ' is-selected' : ''); button.setAttribute('data-person-id', personId);
      button.innerHTML = '<span class="duel-photo" data-person="' + personId + '" data-style="' + photo.styleId + '"><img src="' + photo.image + '" alt="匿名复活候选照片"><span class="duel-number">' + String(index + 1).padStart(2, '0') + '</span></span><span class="duel-cta"><strong>返场候选 ' + String(index + 1).padStart(2, '0') + '</strong><small>身份最后揭晓</small><b>' + (selected ? '已拿到复活票 ♥' : '给他复活票') + '</b></span>';
      button.addEventListener('click', function () { togglePostRevival(personId); }); els.postRevivalGrid.appendChild(button);
    });
    els.postRevivalStatus.textContent = '已选择 ' + state.postRevivalSelected.length + ' / 2 位'; els.confirmPostRevival.disabled = state.postRevivalSelected.length !== 2;
  }

  function togglePostRevival(personId) {
    var index = state.postRevivalSelected.indexOf(personId);
    if (index >= 0) state.postRevivalSelected.splice(index, 1); else if (state.postRevivalSelected.length < 2) state.postRevivalSelected.push(personId); else return showToast('复活票只有两张，先换下一位');
    renderPostRevival();
  }

  function prepareRevivalChallenges() {
    state.postRevivalSelected.forEach(function (id) {
      var photo = preferredPhoto(id); state.styleAnswers[id] = state.styleAnswers[id] || {};
      if (!Object.keys(state.styleAnswers[id]).some(function (photoId) { return state.styleAnswers[id][photoId] >= 3; })) state.styleAnswers[id][photo.id] = 3;
    });
    var targetOrder = logic.shuffle(state.qualifierWinners); var targets = targetOrder.slice(0, 2);
    state.finalFour = targetOrder.slice(2); state.revivalDuels = [[state.postRevivalSelected[0], targets[0]], [state.postRevivalSelected[1], targets[1]]]; state.revivalIndex = 0; state.revivalWinners = [];
    renderRevivalChallenge();
  }

  function renderRevivalChallenge() {
    if (state.revivalIndex >= state.revivalDuels.length) { state.finalFour = state.finalFour.concat(state.revivalWinners); return prepareSemifinals(); }
    showScreen('duel'); isTransitioning = false; els.duelGrid.innerHTML = ''; els.duelStatus.textContent = '';
    els.duelChip.textContent = 'REVIVAL · 复活挑战 ' + (state.revivalIndex + 1) + ' / 2'; els.duelKicker.textContent = '复活者挑战暂定四强'; els.duelTitle.textContent = '这一席，重新决定'; els.duelCopy.textContent = '点出你现在更想留下的那一位。';
    state.revivalDuels[state.revivalIndex].forEach(function (id, index) { els.duelGrid.appendChild(buildBattleCard(id, index, 'challenge')); });
  }

  function chooseRevivalChallenge(personId) {
    if (isTransitioning) return; isTransitioning = true; state.revivalWinners.push(personId);
    Array.prototype.slice.call(els.duelGrid.children).forEach(function (card) { card.disabled = true; card.classList.toggle('is-selected', card.getAttribute('data-person-id') === personId); });
    els.duelStatus.textContent = '四强席位锁定'; saveState(); window.setTimeout(function () { state.revivalIndex += 1; renderRevivalChallenge(); }, 520);
  }

  function prepareSemifinals() {
    var order = logic.shuffle(state.finalFour); state.semifinalDuels = [[order[0], order[1]], [order[2], order[3]]]; state.semifinalIndex = 0; state.semifinalWinners = []; renderDuel();
  }

  function renderDuel() {
    showScreen('duel'); isTransitioning = false; els.duelGrid.innerHTML = ''; els.duelStatus.textContent = '';
    var isFinal = state.semifinalIndex >= state.semifinalDuels.length;
    var ids = isFinal ? state.semifinalWinners : state.semifinalDuels[state.semifinalIndex];
    els.duelChip.textContent = isFinal ? 'FINAL · 冠军战' : 'SEMIFINAL · 半决赛 ' + (state.semifinalIndex + 1) + ' / 2';
    els.duelKicker.textContent = isFinal ? '最后一次选择' : '四强狭路相逢'; els.duelTitle.textContent = isFinal ? '谁是你的唯一答案？' : '只能留下一位';
    els.duelCopy.textContent = isFinal ? '点下去，身份马上揭晓。' : '不计分，只听此刻的心跳。';
    ids.forEach(function (id, index) { els.duelGrid.appendChild(buildBattleCard(id, index, 'duel')); });
  }

  function chooseDuel(personId) {
    if (isTransitioning) return; isTransitioning = true;
    var isFinal = state.semifinalIndex >= state.semifinalDuels.length;
    Array.prototype.slice.call(els.duelGrid.children).forEach(function (card) { card.disabled = true; card.classList.toggle('is-selected', card.getAttribute('data-person-id') === personId); });
    if (isFinal) { state.finalists = state.semifinalWinners.slice(); state.championId = personId; els.duelStatus.textContent = '答案锁定，正在揭晓身份…'; saveState(); return window.setTimeout(showResults, 650); }
    state.semifinalWinners.push(personId); els.duelStatus.textContent = '晋级冠军战'; saveState();
    window.setTimeout(function () { state.semifinalIndex += 1; renderDuel(); }, 520);
  }

  function showResults() { state.completedAt = new Date().toISOString(); renderResults(); showScreen('result'); }

  function renderResults() {
    var champion = peopleById[state.championId]; if (!champion) return;
    var winnerPhoto = preferredPhoto(champion.id); var knockoutWinners = state.qualifierWinners.concat(state.semifinalWinners); var championWins = {}; championWins[champion.id] = 2;
    var scores = {}; data.people.forEach(function (person) { scores[person.id] = logic.personScore(person.id, state.wallPicks, state.styleAnswers, knockoutWinners, championWins); });
    var groupRows = data.groups.map(function (group) {
      var members = data.people.filter(function (person) { return person.groupId === group.id; }); var total = members.reduce(function (sum, person) { return sum + scores[person.id]; }, 0);
      var hits = members.filter(function (person) { return state.wallPicks[person.id] >= 3 || photoAdvancedIds().indexOf(person.id) >= 0; });
      var top = members.slice().sort(function (a, b) { return scores[b.id] - scores[a.id]; })[0];
      return { group: group, average: total / members.length, hits: hits.length, top: top };
    }).sort(function (a, b) { return b.average - a.average; });
    var styleCounts = {}; data.styles.forEach(function (style) { styleCounts[style.id] = 0; });
    var selectedPhotoCount = 0; [state.reviewSelections, state.secondChanceSelections].forEach(function (collection) { Object.keys(collection || {}).forEach(function (id) { (collection[id] || []).forEach(function (photoId) { var photo = data.photos.filter(function (p) { return p.id === photoId; })[0]; if (photo) { styleCounts[photo.styleId] += 1; selectedPhotoCount += 1; } }); }); });
    var dominant = data.styles.slice().sort(function (a, b) { return styleCounts[b.id] - styleCounts[a.id]; })[0] || data.styles[0];
    var biasCount = Object.keys(state.wallPicks).filter(function (id) { return state.wallPicks[id] === 4; }).length;
    els.resultTitle.textContent = '答案揭晓：' + champion.name; els.resultSubtitle.textContent = '名字和团体都藏起来以后，你的直觉还是把他送到了最后。';
    els.winnerCard.innerHTML = '<div class="winner-photo" data-person="' + champion.id + '" data-style="' + winnerPhoto.styleId + '"><img src="' + winnerPhoto.image + '" alt="' + winnerPhoto.alt + '"><span class="crown">ULTIMATE CHAMPION</span></div><div class="winner-copy"><span>终极心动冠军</span><h3>' + champion.name + '</h3><p>' + champion.group + ' · ' + winnerPhoto.styleLabel + '</p></div>';
    renderResultPeople(scores);
    els.resultStats.innerHTML = '<article><b>' + biasCount + '</b><span>本命警报</span></article><article><b>' + selectedPhotoCount + '</b><span>复核保留照片</span></article><article><b>' + dominant.label + '</b><span>头号心动开关</span></article>';
    els.groupRanking.innerHTML = ''; var maxAverage = groupRows[0].average || 1;
    groupRows.forEach(function (row, index) { var item = document.createElement('article'); item.className = 'group-rank-item'; var width = Math.max(8, row.average / maxAverage * 100); item.innerHTML = '<span class="group-rank-no">' + String(index + 1).padStart(2, '0') + '</span><div class="group-rank-copy"><h4>' + row.group.name + '</h4><p>命中 ' + row.hits + ' 位 · 最高心动 ' + row.top.name + '</p><span class="group-rank-meter"><i style="width:' + width.toFixed(1) + '%"></i></span></div><div class="group-rank-score"><b>' + row.average.toFixed(1) + '</b><span>人均心动</span></div>'; els.groupRanking.appendChild(item); });
    var profile = biasCount >= 3 ? '你的心动很有主见，一旦命中就会迅速升级成本命警报。' : '你更像慢热型雷达：先看感觉，再用第二种风格认真确认。';
    els.journeyCopy.textContent = groupRows[0].group.name + ' 是你的团体偏好第一名；' + dominant.result + profile + ' 最终，' + champion.name + ' 成了这次匿名测试最稳定的答案。';
    lastShareText = '我的匿名 K-pop 心动冠军是 ' + champion.name + '（' + champion.group + '）！团体偏好第一名是 ' + groupRows[0].group.name + '，心动开关是“' + dominant.label + '”。';
  }

  function resultPersonCard(personId, rank, photoOverride) {
    var person = peopleById[personId]; var photo = photoOverride || preferredPhoto(personId);
    return '<article class="top-item"><div class="top-photo" data-person="' + personId + '" data-style="' + photo.styleId + '"><img src="' + photo.image + '" alt="' + photo.alt + '">' + (rank ? '<span>' + rank + '</span>' : '') + '</div><h4>' + person.name + '</h4><p>' + person.group + ' · ' + photo.styleLabel + '</p></article>';
  }

  function renderResultPeople(scores) {
    var runnerUp = (state.finalists || []).filter(function (id) { return id !== state.championId; })[0];
    var semifinalLosers = state.finalFour.filter(function (id) { return state.semifinalWinners.indexOf(id) < 0; }).sort(function (a, b) { return scores[b] - scores[a]; });
    var topIds = unique([state.championId, runnerUp, semifinalLosers[0]].filter(Boolean)); els.topThree.innerHTML = '';
    topIds.forEach(function (id, index) { els.topThree.insertAdjacentHTML('beforeend', resultPersonCard(id, index + 1)); });
    var biasIds = state.wallOrder.filter(function (id) { return state.wallPicks[id] === 4; }); els.biasGallery.innerHTML = ''; els.biasSection.hidden = biasIds.length === 0;
    biasIds.forEach(function (id) { var first = state.firstRound.filter(function (entry) { return entry.personId === id; })[0]; els.biasGallery.insertAdjacentHTML('beforeend', resultPersonCard(id, '', first && first.photo)); });
  }

  function showToast(message) { els.toast.textContent = message; els.toast.classList.add('is-visible'); window.setTimeout(function () { els.toast.classList.remove('is-visible'); }, 1700); }
  function shareResult() { var text = lastShareText + '\n' + window.location.href.split('?')[0]; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { showToast('已复制冠军结果'); }); else showToast('请截图分享这份心动答案'); }
  function clearSaved() { try { window.localStorage.removeItem(STORAGE_KEY); } catch (error) { /* no-op */ } state = createInitialState(); showScreen('intro'); }

  function renderPhase() {
    if (state.phase === 'wall') renderWall(); else if (state.phase === 'review') renderReview(); else if (state.phase === 'second-chance') renderSecondChance(); else if (state.phase === 'roster') renderRoster(); else if (state.phase === 'qualifier') renderQualifier(); else if (state.phase === 'post-revival') renderPostRevival(); else if (state.phase === 'duel' && state.revivalDuels.length && state.revivalIndex < state.revivalDuels.length && state.finalFour.length < 4) renderRevivalChallenge(); else if (state.phase === 'duel') renderDuel(); else if (state.phase === 'result') { renderResults(); showScreen('result'); } else showScreen('intro');
  }

  document.addEventListener('click', function (event) {
    var actionButton = event.target.closest('[data-action]'); if (!actionButton) return; var action = actionButton.getAttribute('data-action');
    if (action === 'start' || action === 'restart' || action === 'replay') startTournament();
    else if (action === 'wall-prev' && state.wallPage > 0) { state.wallPage -= 1; renderWall(); }
    else if (action === 'wall-next') nextWall(); else if (action === 'confirm-review') confirmReview(); else if (action === 'confirm-second-chance') confirmSecondChance(); else if (action === 'confirm-roster') prepareQualifier(); else if (action === 'confirm-post-revival') prepareRevivalChallenges();
    else if (action === 'home') showScreen('intro'); else if (action === 'clear') clearSaved(); else if (action === 'share') shareResult();
  });

  if (loadState()) renderPhase(); else showScreen('intro');
}());
