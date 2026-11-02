(function (root) {
  'use strict';

  function shuffle(items, randomFn) {
    var rng = randomFn || Math.random;
    var output = items.slice();
    for (var i = output.length - 1; i > 0; i -= 1) {
      var j = Math.floor(rng() * (i + 1));
      var temp = output[i]; output[i] = output[j]; output[j] = temp;
    }
    return output;
  }

  function arrangeWithoutGroupRepeats(items, randomFn) {
    var rng = randomFn || Math.random;
    var remaining = items.slice();
    var arranged = [];
    while (remaining.length) {
      var previous = arranged[arranged.length - 1];
      var counts = {};
      remaining.forEach(function (item) { counts[item.groupId] = (counts[item.groupId] || 0) + 1; });
      var groups = Object.keys(counts).filter(function (groupId) { return !previous || groupId !== previous.groupId; });
      groups.sort(function (a, b) { return counts[b] - counts[a]; });
      var highest = counts[groups[0]];
      var tied = groups.filter(function (groupId) { return counts[groupId] === highest; });
      var chosenGroup = tied[Math.floor(rng() * tied.length)];
      var candidates = shuffle(remaining.filter(function (item) { return item.groupId === chosenGroup; }), rng);
      var chosen = candidates[0] || remaining[0];
      arranged.push(chosen);
      remaining = remaining.filter(function (item) { return item.id !== chosen.id; });
    }
    return arranged;
  }

  function photosFor(data, personId) {
    return data.photos.filter(function (photo) { return photo.personId === personId; });
  }

  function buildFirstRound(data, randomFn) {
    var rng = randomFn || Math.random;
    return arrangeWithoutGroupRepeats(shuffle(data.people, rng), rng).map(function (person) {
      var choices = shuffle(photosFor(data, person.id), rng);
      return { id: 'first-' + person.id, personId: person.id, photo: choices[0] };
    });
  }

  function styleCandidateIds(firstRound, firstAnswers) {
    return firstRound.filter(function (item) {
      var score = firstAnswers[item.personId];
      return score === 1 || score === 3 || score === 4;
    }).map(function (item) { return item.personId; });
  }

  function buildStyleRound(data, personIds, randomFn) {
    var rng = randomFn || Math.random;
    return shuffle(personIds, rng).map(function (personId) {
      return { id: 'style-' + personId, personId: personId, photos: shuffle(photosFor(data, personId), rng).slice(0, 2) };
    });
  }

  function styleAdvancerIds(styleRound, styleAnswers) {
    return styleRound.filter(function (item) {
      var answer = styleAnswers[item.personId] || {};
      return Object.keys(answer).some(function (photoId) { return answer[photoId] >= 3; });
    }).map(function (item) { return item.personId; });
  }

  function resurrectionLimit(count) {
    if (!count) return 0;
    if (count === 1) return 1;
    return Math.min(4, Math.max(2, Math.ceil(count / 10)));
  }

  function buildTimedDuels(personIds, randomFn) {
    var order = shuffle(personIds, randomFn);
    var duels = [];
    var bye = null;
    if (order.length % 2) bye = order.pop();
    for (var i = 0; i < order.length; i += 2) {
      duels.push({ id: 'timed-' + (i / 2), personIds: [order[i], order[i + 1]] });
    }
    return { duels: duels, bye: bye };
  }

  function buildGauntlet(personIds, randomFn) {
    return shuffle(personIds, randomFn);
  }

  function preferredPhoto(data, personId, styleAnswers, firstRound) {
    var answers = styleAnswers[personId] || {};
    var candidates = photosFor(data, personId).slice();
    var bias = candidates.filter(function (photo) { return answers[photo.id] === 4; })[0];
    if (bias) return bias;
    var heart = candidates.filter(function (photo) { return answers[photo.id] === 3; })[0];
    if (heart) return heart;
    var first = firstRound.filter(function (item) { return item.personId === personId; })[0];
    return first ? first.photo : candidates[0];
  }

  function personScore(personId, firstAnswers, styleAnswers, timedWinners, gauntletWins) {
    var score = firstAnswers[personId] || 0;
    var style = styleAnswers[personId] || {};
    Object.keys(style).forEach(function (photoId) { score += style[photoId]; });
    score += timedWinners.filter(function (id) { return id === personId; }).length * 2;
    score += (gauntletWins[personId] || 0) * 2;
    return score;
  }

  function rankPeople(personIds, firstAnswers, styleAnswers, timedWinners, gauntletWins, championId) {
    return personIds.map(function (personId) {
      return { personId: personId, score: personScore(personId, firstAnswers, styleAnswers, timedWinners, gauntletWins) };
    }).sort(function (a, b) {
      if (a.personId === championId) return -1;
      if (b.personId === championId) return 1;
      return b.score - a.score || a.personId.localeCompare(b.personId);
    });
  }

  var api = {
    shuffle: shuffle,
    photosFor: photosFor,
    buildFirstRound: buildFirstRound,
    styleCandidateIds: styleCandidateIds,
    buildStyleRound: buildStyleRound,
    styleAdvancerIds: styleAdvancerIds,
    resurrectionLimit: resurrectionLimit,
    buildTimedDuels: buildTimedDuels,
    buildGauntlet: buildGauntlet,
    preferredPhoto: preferredPhoto,
    personScore: personScore,
    rankPeople: rankPeople
  };
  root.AppLogic = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
}(typeof window !== 'undefined' ? window : globalThis));
