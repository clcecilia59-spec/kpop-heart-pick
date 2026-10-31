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

  var socialRights = 'TREASURE / YG 官方 Instagram 发布素材；点赞量仅用于筛选，公开发布或商业使用前仍需另行确认许可';

  var photos = [
    { id: 'p01-fresh', personId: 'p01', personName: 'CHOI HYUN SUK', group: 'TREASURE', styleId: 'fresh', styleLabel: '清爽日常', image: './assets/photos/hyunsuk-casual.jpg', alt: 'CHOI HYUN SUK 自然感生日造型官方照片', source: 'https://www.instagram.com/p/DXW5TIzEXaz/', rights: socialRights },
    { id: 'p01-stage', personId: 'p01', personName: 'CHOI HYUN SUK', group: 'TREASURE', styleId: 'stage', styleLabel: '舞台气场', image: './assets/photos/hyunsuk-profile.jpg', alt: 'CHOI HYUN SUK SHOCK 概念视觉官方照片', source: 'https://www.instagram.com/p/De_fLAwKG07/', rights: socialRights },

    { id: 'p02-fresh', personId: 'p02', personName: 'JIHOON', group: 'TREASURE', styleId: 'fresh', styleLabel: '清爽日常', image: './assets/photos/jihoon-casual.jpg', alt: 'JIHOON 自然感生日造型官方照片', source: 'https://www.instagram.com/p/DV1DA4bEoA3/', rights: socialRights },
    { id: 'p02-noir', personId: 'p02', personName: 'JIHOON', group: 'TREASURE', styleId: 'noir', styleLabel: '黑白酷感', image: './assets/photos/jihoon-profile.jpg', alt: 'JIHOON SHOCK 冷感概念视觉官方照片', source: 'https://www.instagram.com/p/De_fPGVK2jX/', rights: socialRights },

    { id: 'p03-fresh', personId: 'p03', personName: 'YOSHI', group: 'TREASURE', styleId: 'fresh', styleLabel: '清爽日常', image: './assets/photos/yoshi-casual.jpg', alt: 'YOSHI 自然感生日造型官方照片', source: 'https://www.instagram.com/p/DYUsVMqRcAv/', rights: socialRights },
    { id: 'p03-noir', personId: 'p03', personName: 'YOSHI', group: 'TREASURE', styleId: 'noir', styleLabel: '黑白酷感', image: './assets/photos/yoshi-profile.jpg', alt: 'YOSHI SHOCK 冷感概念视觉官方照片', source: 'https://www.instagram.com/p/DfBOBkypVlk/', rights: socialRights },

    { id: 'p04-fresh', personId: 'p04', personName: 'JUNKYU', group: 'TREASURE', styleId: 'fresh', styleLabel: '清爽日常', image: './assets/photos/junkyu-casual.jpg', alt: 'JUNKYU 自然感生日造型官方照片', source: 'https://www.instagram.com/p/DdB9V0cA0uz/', rights: socialRights },
    { id: 'p04-noir', personId: 'p04', personName: 'JUNKYU', group: 'TREASURE', styleId: 'noir', styleLabel: '黑白酷感', image: './assets/photos/junkyu-profile.jpg', alt: 'JUNKYU KING KONG 黑白概念视觉官方照片', source: 'https://www.instagram.com/p/C7L0HMBRNyf/', rights: socialRights },

    { id: 'p05-fresh', personId: 'p05', personName: 'YOON JAE HYUK', group: 'TREASURE', styleId: 'fresh', styleLabel: '清爽日常', image: './assets/photos/jaehyuk-casual.jpg', alt: 'YOON JAE HYUK 自然感生日造型官方照片', source: 'https://www.instagram.com/p/DbGWsOZA1Z1/', rights: socialRights },
    { id: 'p05-stage', personId: 'p05', personName: 'YOON JAE HYUK', group: 'TREASURE', styleId: 'stage', styleLabel: '舞台气场', image: './assets/photos/jaehyuk-profile.jpg', alt: 'YOON JAE HYUK SHOCK 概念视觉官方照片', source: 'https://www.instagram.com/p/DfB_uvNB3Kk/', rights: socialRights },

    { id: 'p06-fresh', personId: 'p06', personName: 'ASAHI', group: 'TREASURE', styleId: 'fresh', styleLabel: '清爽日常', image: './assets/photos/asahi-casual.jpg', alt: 'ASAHI 镜面自拍风生日造型官方照片', source: 'https://www.instagram.com/p/DcOdaQFAIlp/', rights: socialRights },
    { id: 'p06-noir', personId: 'p06', personName: 'ASAHI', group: 'TREASURE', styleId: 'noir', styleLabel: '黑白酷感', image: './assets/photos/asahi-profile.jpg', alt: 'ASAHI SHOCK 冷感概念视觉官方照片', source: 'https://www.instagram.com/p/DfCEbjGq4Jj/', rights: socialRights },

    { id: 'p07-fresh', personId: 'p07', personName: 'DOYOUNG', group: 'TREASURE', styleId: 'fresh', styleLabel: '清爽日常', image: './assets/photos/doyoung-profile.jpg', alt: 'DOYOUNG 清爽生日造型官方照片', source: 'https://www.instagram.com/p/DRzjkuIDzZZ/', rights: socialRights },
    { id: 'p07-stage', personId: 'p07', personName: 'DOYOUNG', group: 'TREASURE', styleId: 'stage', styleLabel: '舞台气场', image: './assets/photos/doyoung-poster.jpg', alt: 'DOYOUNG SHOCK 概念视觉官方照片', source: 'https://www.instagram.com/p/DfB__EMh9SS/', rights: socialRights },

    { id: 'p08-fresh', personId: 'p08', personName: 'HARUTO', group: 'TREASURE', styleId: 'fresh', styleLabel: '清爽日常', image: './assets/photos/haruto-profile.jpg', alt: 'HARUTO 自然感生日造型官方照片', source: 'https://www.instagram.com/p/DWtsrtTEb6Q/', rights: socialRights },
    { id: 'p08-noir', personId: 'p08', personName: 'HARUTO', group: 'TREASURE', styleId: 'noir', styleLabel: '黑白酷感', image: './assets/photos/haruto-poster.jpg', alt: 'HARUTO SHOCK 冷感概念视觉官方照片', source: 'https://www.instagram.com/p/DfESlylx2Xv/', rights: socialRights }
  ];

  window.IDOL_DATA = { styles: styles, people: people, photos: photos };
}());
