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

  function avoidAdjacentSamePerson(items, randomFn) {
    var rng = randomFn || Math.random;

    function arrange(remaining, arranged) {
      if (!remaining.length) return arranged;
      var previous = arranged[arranged.length - 1];
      var candidates = shuffle(remaining, rng).filter(function (item) {
        return !previous || (previous.personId !== item.personId && previous.styleId !== item.styleId);
      });

      for (var index = 0; index < candidates.length; index += 1) {
        var candidate = candidates[index];
        var nextRemaining = remaining.filter(function (item) { return item.id !== candidate.id; });
        var result = arrange(nextRemaining, arranged.concat(candidate));
        if (result) return result;
      }
      return null;
    }

    return arrange(items, []) || shuffle(items, rng);
  }

  function buildRound(data, randomFn) {
    var noirPeople = data.people.filter(function (person) {
      return data.photos.some(function (photo) {
        return photo.personId === person.id && photo.styleId === 'noir';
      });
    });
    var stagePeople = shuffle(data.people.filter(function (person) {
      return data.photos.some(function (photo) {
        return photo.personId === person.id && photo.styleId === 'stage';
      });
    }), randomFn);
    var selectedStageIds = stagePeople.slice(0, 2).map(function (person) { return person.id; });

    var base = data.people.map(function (person) {
      var preferredStyle = 'fresh';
      if (noirPeople.some(function (entry) { return entry.id === person.id; })) preferredStyle = 'noir';
      if (selectedStageIds.indexOf(person.id) !== -1) preferredStyle = 'stage';
      return data.photos.find(function (photo) {
        return photo.personId === person.id && photo.styleId === preferredStyle;
      });
    }).filter(Boolean);

    var baseIds = base.map(function (photo) { return photo.id; });
    var freshExtras = shuffle(data.photos.filter(function (photo) {
      return photo.styleId === 'fresh' && baseIds.indexOf(photo.id) === -1;
    }), randomFn).slice(0, 4);

    return avoidAdjacentSamePerson(base.concat(freshExtras), randomFn);
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
