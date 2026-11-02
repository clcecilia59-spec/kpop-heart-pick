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

  function arrangeWithoutRepeats(items, randomFn) {
    var rng = randomFn || Math.random;
    var remaining = items.slice();
    var arranged = [];
    while (remaining.length) {
      var previous = arranged[arranged.length - 1];
      var candidates = shuffle(remaining, rng).filter(function (item) {
        return !previous || item.groupId !== previous.groupId;
      });
      var chosen = candidates[0] || remaining[0];
      arranged.push(chosen);
      remaining = remaining.filter(function (item) { return item.id !== chosen.id; });
    }
    return arranged;
  }

  function buildRound(data, randomFn) {
    var rng = randomFn || Math.random;
    var selected = [];
    for (var attempt = 0; attempt < 80; attempt += 1) {
      var selectedPeople = [];
      data.groups.forEach(function (group) {
        var people = data.people.filter(function (person) { return person.groupId === group.id; });
        selectedPeople = selectedPeople.concat(shuffle(people, rng).slice(0, 5));
      });
      var styleCounts = { fresh: 0, stage: 0, noir: 0 };
      selected = shuffle(selectedPeople, rng).map(function (person) {
        var options = shuffle(data.photos.filter(function (photo) { return photo.personId === person.id; }), rng);
        options.sort(function (a, b) { return styleCounts[a.styleId] - styleCounts[b.styleId]; });
        var chosen = options[0];
        if (!chosen) throw new Error('未找到 ' + person.name + ' 的照片');
        styleCounts[chosen.styleId] += 1;
        return chosen;
      });
      var counts = Object.keys(styleCounts).map(function (key) { return styleCounts[key]; });
      if (Math.min.apply(null, counts) >= 9 && Math.max.apply(null, counts) <= 11) break;
    }
    return arrangeWithoutRepeats(selected, rng);
  }

  function buildChallengePlan(data, randomFn) {
    var rng = randomFn || Math.random;
    var round = buildRound(data, rng);
    var pool = shuffle(round, rng);
    var ratings = pool.slice(0, 15);
    var duels = pool.slice(15, 27);
    var blinds = pool.slice(27, 29);
    var timedIndexes = shuffle([1, 3, 5, 7, 9, 11, 13], rng).slice(0, 3);
    var ratingChallenges = ratings.map(function (photo, index) {
      return { id: 'rating-' + index, type: timedIndexes.indexOf(index) >= 0 ? 'timed' : 'rating', photos: [photo] };
    });
    var duelChallenges = [];
    for (var d = 0; d < duels.length; d += 2) {
      duelChallenges.push({ id: 'duel-' + (d / 2), type: 'duel', photos: [duels[d], duels[d + 1]] });
    }
    var blindChallenges = blinds.map(function (photo, index) {
      return { id: 'blind-' + index, type: 'blind', photos: [photo] };
    });
    var byPerson = {};
    data.photos.forEach(function (photo) {
      byPerson[photo.personId] = byPerson[photo.personId] || [];
      byPerson[photo.personId].push(photo);
    });
    var stylePairs = shuffle(Object.keys(byPerson).filter(function (personId) {
      return byPerson[personId].length > 1;
    }), rng).slice(0, 3).map(function (personId, index) {
      return { id: 'style-' + index, type: 'style', photos: shuffle(byPerson[personId], rng).slice(0, 2) };
    });
    var buckets = {
      rating: ratingChallenges.filter(function (item) { return item.type === 'rating'; }),
      timed: ratingChallenges.filter(function (item) { return item.type === 'timed'; }),
      duel: duelChallenges,
      blind: blindChallenges,
      style: stylePairs
    };
    var pattern = ['rating','duel','rating','timed','style','rating','duel','blind','rating','timed','duel','rating','style','rating','duel','rating','blind','timed','duel','rating','style','rating','duel','rating','rating','rating'];
    var challenges = [];
    pattern.forEach(function (type) {
      if (buckets[type] && buckets[type].length) challenges.push(buckets[type].shift());
    });
    Object.keys(buckets).forEach(function (type) { challenges = challenges.concat(buckets[type]); });
    challenges.forEach(function (challenge, index) { challenge.number = index + 1; });
    return { round: round, challenges: challenges };
  }

  function buildRatings(challenges, answers) {
    var totals = {};
    var counts = {};
    challenges.forEach(function (challenge) {
      var answer = answers[challenge.id];
      if (!answer) return;
      if (challenge.type === 'rating' || challenge.type === 'timed' || challenge.type === 'blind') {
        if (typeof answer.score === 'number') {
          var photoId = challenge.photos[0].id;
          totals[photoId] = (totals[photoId] || 0) + answer.score;
          counts[photoId] = (counts[photoId] || 0) + 1;
        }
        return;
      }
      var winner = challenge.photos.filter(function (photo) { return photo.id === answer.winnerId; })[0];
      if (winner) {
        totals[winner.id] = (totals[winner.id] || 0) + 2;
        counts[winner.id] = (counts[winner.id] || 0) + 1;
      }
    });
    var ratings = {};
    Object.keys(totals).forEach(function (photoId) { ratings[photoId] = totals[photoId] / counts[photoId]; });
    return ratings;
  }

  function uniquePhotos(challenges) {
    var seen = {};
    var photos = [];
    challenges.forEach(function (challenge) {
      challenge.photos.forEach(function (photo) {
        if (!seen[photo.id]) { seen[photo.id] = true; photos.push(photo); }
      });
    });
    return photos;
  }

  function getScored(round, ratings) {
    return round.filter(function (photo) { return typeof ratings[photo.id] === 'number'; }).map(function (photo) {
      return { photo: photo, score: ratings[photo.id] };
    });
  }

  function selectFinalists(round, ratings) {
    return getScored(round, ratings).sort(function (a, b) {
      return b.score - a.score || a.photo.id.localeCompare(b.photo.id);
    }).slice(0, 2).map(function (entry) { return entry.photo; });
  }

  function calculateStyleAverages(data, round, ratings) {
    return data.styles.map(function (style) {
      var entries = round.filter(function (photo) { return photo.styleId === style.id && typeof ratings[photo.id] === 'number'; });
      var total = entries.reduce(function (sum, photo) { return sum + ratings[photo.id]; }, 0);
      return { id: style.id, label: style.label, keyword: style.keyword, result: style.result, count: entries.length, average: entries.length ? total / entries.length : 0 };
    }).sort(function (a, b) { return b.average - a.average; });
  }

  function buildResult(data, round, ratings, duelWinnerId) {
    var scored = getScored(round, ratings).sort(function (a, b) {
      if (a.photo.id === duelWinnerId) return -1;
      if (b.photo.id === duelWinnerId) return 1;
      return b.score - a.score || a.photo.id.localeCompare(b.photo.id);
    });
    var styleAverages = calculateStyleAverages(data, round, ratings);
    var eligibleStyles = styleAverages.filter(function (entry) { return entry.count >= 2; });
    var favoriteStyle = eligibleStyles[0] || styleAverages[0];
    var closeCall = eligibleStyles.length > 1 && Math.abs(eligibleStyles[0].average - eligibleStyles[1].average) < 0.3;
    var groupScores = data.groups.map(function (group) {
      var entries = scored.filter(function (entry) { return entry.photo.groupId === group.id; });
      var average = entries.length ? entries.reduce(function (sum, entry) { return sum + entry.score; }, 0) / entries.length : 0;
      return { id: group.id, name: group.name, count: entries.length, average: average };
    }).sort(function (a, b) { return b.average - a.average; });
    var highScores = scored.filter(function (entry) { return entry.score >= 3.5; });
    return {
      validCount: scored.length,
      winner: scored[0] || null,
      topThree: scored.slice(0, 3),
      styleAverages: styleAverages,
      favoriteStyle: favoriteStyle,
      closeCall: closeCall,
      groupScores: groupScores,
      favoriteGroup: groupScores[0],
      focus: scored.length ? Math.round((highScores.length / scored.length) * 100) : 0
    };
  }

  var api = {
    shuffle: shuffle,
    buildRound: buildRound,
    buildChallengePlan: buildChallengePlan,
    buildRatings: buildRatings,
    uniquePhotos: uniquePhotos,
    selectFinalists: selectFinalists,
    calculateStyleAverages: calculateStyleAverages,
    buildResult: buildResult
  };
  root.AppLogic = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
}(typeof window !== 'undefined' ? window : globalThis));
