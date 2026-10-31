(function (root) {
  'use strict';

  function shuffle(items, randomFn) {
    var rng = randomFn || Math.random;
    var output = items.slice();
    for (var i = output.length - 1; i > 0; i -= 1) {
      var j = Math.floor(rng() * (i + 1));
      var temp = output[i];
      output[i] = output[j];
      output[j] = temp;
    }
    return output;
  }

  function arrangeWithoutRepeats(items, randomFn) {
    var rng = randomFn || Math.random;

    function isValid(candidate, avoidSameStyle) {
      for (var index = 1; index < candidate.length; index += 1) {
        if (candidate[index - 1].personId === candidate[index].personId) return false;
        if (candidate[index - 1].groupId === candidate[index].groupId) return false;
        if (avoidSameStyle && candidate[index - 1].styleId === candidate[index].styleId) return false;
      }
      return true;
    }

    var styleCounts = {};
    items.forEach(function (item) { styleCounts[item.styleId] = (styleCounts[item.styleId] || 0) + 1; });
    var canSeparateStyles = Math.max.apply(null, Object.keys(styleCounts).map(function (key) { return styleCounts[key]; })) <= Math.ceil(items.length / 2);
    var attempt;
    var candidate;

    if (canSeparateStyles) {
      for (attempt = 0; attempt < 300; attempt += 1) {
        candidate = shuffle(items, rng);
        if (isValid(candidate, true)) return candidate;
      }

      var visited = 0;
      function search(remaining, arranged) {
        visited += 1;
        if (visited > 20000) return null;
        if (!remaining.length) return arranged;
        var previous = arranged[arranged.length - 1];
        var nextItems = shuffle(remaining, rng).filter(function (item) {
          return !previous || (item.groupId !== previous.groupId && item.styleId !== previous.styleId);
        });
        for (var nextIndex = 0; nextIndex < nextItems.length; nextIndex += 1) {
          var next = nextItems[nextIndex];
          var rest = remaining.filter(function (item) { return item.id !== next.id; });
          var result = search(rest, arranged.concat(next));
          if (result) return result;
        }
        return null;
      }

      var strictResult = search(items, []);
      if (strictResult) return strictResult;
    }

    for (attempt = 0; attempt < 300; attempt += 1) {
      candidate = shuffle(items, rng);
      if (isValid(candidate, false)) return candidate;
    }
    return shuffle(items, rng);
  }

  function buildRound(data, randomFn) {
    var rng = randomFn || Math.random;
    var selected = [];

    for (var attempt = 0; attempt < 80; attempt += 1) {
      var selectedPeople = [];
      data.groups.forEach(function (group) {
        var groupPeople = data.people.filter(function (person) { return person.groupId === group.id; });
        selectedPeople = selectedPeople.concat(shuffle(groupPeople, rng).slice(0, 2));
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
      if (Math.min.apply(null, counts) >= 3 && Math.max.apply(null, counts) <= 5) break;
    }

    return arrangeWithoutRepeats(selected, rng);
  }

  function getScored(round, ratings) {
    return round.filter(function (photo) {
      return typeof ratings[photo.id] === 'number';
    }).map(function (photo) {
      return { photo: photo, score: ratings[photo.id] };
    });
  }

  function selectFinalists(round, ratings) {
    var scored = getScored(round, ratings).sort(function (a, b) {
      return b.score - a.score || a.photo.id.localeCompare(b.photo.id);
    });
    return scored.slice(0, 2).map(function (entry) { return entry.photo; });
  }

  function calculateStyleAverages(data, round, ratings) {
    return data.styles.map(function (style) {
      var entries = round.filter(function (photo) {
        return photo.styleId === style.id && typeof ratings[photo.id] === 'number';
      });
      var total = entries.reduce(function (sum, photo) { return sum + ratings[photo.id]; }, 0);
      return {
        id: style.id,
        label: style.label,
        keyword: style.keyword,
        result: style.result,
        count: entries.length,
        average: entries.length ? total / entries.length : 0
      };
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

    var contrast = null;
    data.people.some(function (person) {
      var personScores = scored.filter(function (entry) { return entry.photo.personId === person.id; });
      if (personScores.length > 1) {
        var sorted = personScores.slice().sort(function (a, b) { return b.score - a.score; });
        if (sorted[0].score - sorted[1].score >= 1) {
          contrast = {
            personName: person.name,
            highStyle: sorted[0].photo.styleLabel,
            lowStyle: sorted[1].photo.styleLabel,
            gap: sorted[0].score - sorted[1].score
          };
          return true;
        }
      }
      return false;
    });

    return {
      validCount: scored.length,
      winner: scored[0] || null,
      topThree: scored.slice(0, 3),
      styleAverages: styleAverages,
      favoriteStyle: favoriteStyle,
      closeCall: closeCall,
      contrast: contrast
    };
  }

  var api = {
    shuffle: shuffle,
    buildRound: buildRound,
    selectFinalists: selectFinalists,
    calculateStyleAverages: calculateStyleAverages,
    buildResult: buildResult
  };

  root.AppLogic = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
}(typeof window !== 'undefined' ? window : globalThis));
