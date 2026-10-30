(function () {
  'use strict';

  var styles = [
    { id: 'fresh', label: '清爽日常', keyword: '清爽松弛感', result: '你更容易被自然、干净和不费力的氛围打动。' },
    { id: 'stage', label: '舞台气场', keyword: '高光气场控', result: '强烈造型、眼神和灯光，会明显放大你的心动值。' },
    { id: 'noir', label: '黑白酷感', keyword: '冷感氛围派', result: '克制色彩与硬朗轮廓，是你这一轮的心动开关。' }
  ];

  var people = [
    { id: 'p01', name: 'CHOI HYUN SUK', group: 'TREASURE' },
    { id: 'p02', name: 'JIHOON', group: 'TREASURE' },
    { id: 'p03', name: 'YOSHI', group: 'TREASURE' },
    { id: 'p04', name: 'JUNKYU', group: 'TREASURE' },
    { id: 'p05', name: 'YOON JAE HYUK', group: 'TREASURE' },
    { id: 'p06', name: 'ASAHI', group: 'TREASURE' },
    { id: 'p07', name: 'DOYOUNG', group: 'TREASURE' },
    { id: 'p08', name: 'HARUTO', group: 'TREASURE' }
  ];

  var profileSource = 'https://ygex.jp/en/treasure/profile/';
  var profileRights = 'YGEX 官方资料页素材；公开发布或商业使用前需另行确认许可';
  var lifeRights = 'YG LIFE 官方发布素材；公开发布或商业使用前需另行确认许可';

  var photos = [
    { id: 'p01-fresh', personId: 'p01', personName: 'CHOI HYUN SUK', group: 'TREASURE', styleId: 'fresh', styleLabel: '清爽日常', image: './assets/photos/hyunsuk-casual.jpg', alt: 'CHOI HYUN SUK 清爽日常造型官方照片', source: 'https://yg-life.com/archives/148175?lang=en', rights: lifeRights },
    { id: 'p01-noir', personId: 'p01', personName: 'CHOI HYUN SUK', group: 'TREASURE', styleId: 'noir', styleLabel: '黑白酷感', image: './assets/photos/hyunsuk-profile.jpg', alt: 'CHOI HYUN SUK 黑白造型官方资料照', source: profileSource, rights: profileRights },

    { id: 'p02-fresh', personId: 'p02', personName: 'JIHOON', group: 'TREASURE', styleId: 'fresh', styleLabel: '清爽日常', image: './assets/photos/jihoon-casual.jpg', alt: 'JIHOON 清爽日常造型官方照片', source: 'https://yg-life.com/archives/148175?lang=en', rights: lifeRights },
    { id: 'p02-noir', personId: 'p02', personName: 'JIHOON', group: 'TREASURE', styleId: 'noir', styleLabel: '黑白酷感', image: './assets/photos/jihoon-profile.jpg', alt: 'JIHOON 黑白造型官方资料照', source: profileSource, rights: profileRights },

    { id: 'p03-fresh', personId: 'p03', personName: 'YOSHI', group: 'TREASURE', styleId: 'fresh', styleLabel: '清爽日常', image: './assets/photos/yoshi-casual.jpg', alt: 'YOSHI 清爽日常造型官方照片', source: 'https://yg-life.com/archives/148175?lang=en', rights: lifeRights },
    { id: 'p03-noir', personId: 'p03', personName: 'YOSHI', group: 'TREASURE', styleId: 'noir', styleLabel: '黑白酷感', image: './assets/photos/yoshi-profile.jpg', alt: 'YOSHI 黑白造型官方资料照', source: profileSource, rights: profileRights },

    { id: 'p04-fresh', personId: 'p04', personName: 'JUNKYU', group: 'TREASURE', styleId: 'fresh', styleLabel: '清爽日常', image: './assets/photos/junkyu-casual.jpg', alt: 'JUNKYU 清爽日常造型官方照片', source: 'https://yg-life.com/archives/148175?lang=en', rights: lifeRights },
    { id: 'p04-noir', personId: 'p04', personName: 'JUNKYU', group: 'TREASURE', styleId: 'noir', styleLabel: '黑白酷感', image: './assets/photos/junkyu-profile.jpg', alt: 'JUNKYU 黑白造型官方资料照', source: profileSource, rights: profileRights },

    { id: 'p05-fresh', personId: 'p05', personName: 'YOON JAE HYUK', group: 'TREASURE', styleId: 'fresh', styleLabel: '清爽日常', image: './assets/photos/jaehyuk-casual.jpg', alt: 'YOON JAE HYUK 清爽日常造型官方照片', source: 'https://yg-life.com/archives/148358?lang=ko', rights: lifeRights },
    { id: 'p05-noir', personId: 'p05', personName: 'YOON JAE HYUK', group: 'TREASURE', styleId: 'noir', styleLabel: '黑白酷感', image: './assets/photos/jaehyuk-profile.jpg', alt: 'YOON JAE HYUK 黑白造型官方资料照', source: profileSource, rights: profileRights },

    { id: 'p06-fresh', personId: 'p06', personName: 'ASAHI', group: 'TREASURE', styleId: 'fresh', styleLabel: '清爽日常', image: './assets/photos/asahi-casual.jpg', alt: 'ASAHI 清爽日常造型官方照片', source: 'https://yg-life.com/archives/148358?lang=ko', rights: lifeRights },
    { id: 'p06-noir', personId: 'p06', personName: 'ASAHI', group: 'TREASURE', styleId: 'noir', styleLabel: '黑白酷感', image: './assets/photos/asahi-profile.jpg', alt: 'ASAHI 黑白造型官方资料照', source: profileSource, rights: profileRights },

    { id: 'p07-stage', personId: 'p07', personName: 'DOYOUNG', group: 'TREASURE', styleId: 'stage', styleLabel: '舞台气场', image: './assets/photos/doyoung-poster.jpg', alt: 'DOYOUNG 舞台造型官方海报', source: 'https://yg-life.com/archives/188023?lang=ko', rights: lifeRights },
    { id: 'p07-noir', personId: 'p07', personName: 'DOYOUNG', group: 'TREASURE', styleId: 'noir', styleLabel: '黑白酷感', image: './assets/photos/doyoung-profile.jpg', alt: 'DOYOUNG 黑白造型官方资料照', source: profileSource, rights: profileRights },

    { id: 'p08-stage', personId: 'p08', personName: 'HARUTO', group: 'TREASURE', styleId: 'stage', styleLabel: '舞台气场', image: './assets/photos/haruto-poster.jpg', alt: 'HARUTO 舞台造型官方海报', source: 'https://yg-life.com/archives/187091?lang=ja', rights: lifeRights },
    { id: 'p08-noir', personId: 'p08', personName: 'HARUTO', group: 'TREASURE', styleId: 'noir', styleLabel: '黑白酷感', image: './assets/photos/haruto-profile.jpg', alt: 'HARUTO 黑白造型官方资料照', source: profileSource, rights: profileRights }
  ];

  window.IDOL_DATA = { styles: styles, people: people, photos: photos };
}());
