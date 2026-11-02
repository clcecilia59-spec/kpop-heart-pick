(function () {
  'use strict';

  var styles = [
    { id: 'fresh', label: '清爽日常', keyword: '清爽松弛感', result: '你更容易被自然、干净和不费力的氛围打动。' },
    { id: 'stage', label: '舞台气场', keyword: '高光气场控', result: '强烈造型、眼神和灯光，会明显放大你的心动值。' },
    { id: 'noir', label: '黑白酷感', keyword: '冷感氛围派', result: '克制色彩与硬朗轮廓，是你这一轮的心动开关。' }
  ];

  var groups = [
    { id: 'treasure', name: 'TREASURE' },
    { id: 'stray-kids', name: 'Stray Kids' },
    { id: 'enhypen', name: 'ENHYPEN' },
    { id: 'txt', name: 'TOMORROW X TOGETHER' },
    { id: 'ateez', name: 'ATEEZ' },
    { id: 'the-boyz', name: 'THE BOYZ' }
  ];

  var people = [
    { id: 'p01', name: '崔玹硕', groupId: 'treasure', group: 'TREASURE' },
    { id: 'p02', name: '朴志焄', groupId: 'treasure', group: 'TREASURE' },
    { id: 'p03', name: '金本芳典', groupId: 'treasure', group: 'TREASURE' },
    { id: 'p04', name: '金俊奎', groupId: 'treasure', group: 'TREASURE' },
    { id: 'p05', name: '尹材赫', groupId: 'treasure', group: 'TREASURE' },
    { id: 'p06', name: '滨田朝光', groupId: 'treasure', group: 'TREASURE' },
    { id: 'p07', name: '金道荣', groupId: 'treasure', group: 'TREASURE' },
    { id: 'p08', name: '渡边温斗', groupId: 'treasure', group: 'TREASURE' },
    { id: 'p09', name: '朴炡禹', groupId: 'treasure', group: 'TREASURE' },
    { id: 'p10', name: '苏庭焕', groupId: 'treasure', group: 'TREASURE' },

    { id: 's01', name: '方灿', groupId: 'stray-kids', group: 'Stray Kids' },
    { id: 's02', name: '李旻浩', groupId: 'stray-kids', group: 'Stray Kids' },
    { id: 's03', name: '徐彰彬', groupId: 'stray-kids', group: 'Stray Kids' },
    { id: 's04', name: '黄铉辰', groupId: 'stray-kids', group: 'Stray Kids' },
    { id: 's05', name: '韩知城', groupId: 'stray-kids', group: 'Stray Kids' },
    { id: 's06', name: '李龙馥', groupId: 'stray-kids', group: 'Stray Kids' },
    { id: 's07', name: '金昇玟', groupId: 'stray-kids', group: 'Stray Kids' },
    { id: 's08', name: '梁精寅', groupId: 'stray-kids', group: 'Stray Kids' },

    { id: 'e01', name: '梁祯元', groupId: 'enhypen', group: 'ENHYPEN' },
    { id: 'e02', name: '朴综星', groupId: 'enhypen', group: 'ENHYPEN' },
    { id: 'e03', name: '沈载伦', groupId: 'enhypen', group: 'ENHYPEN' },
    { id: 'e04', name: '朴成训', groupId: 'enhypen', group: 'ENHYPEN' },
    { id: 'e05', name: '金善禹', groupId: 'enhypen', group: 'ENHYPEN' },
    { id: 'e06', name: '西村力', groupId: 'enhypen', group: 'ENHYPEN' },

    { id: 't01', name: '崔秀彬', groupId: 'txt', group: 'TOMORROW X TOGETHER' },
    { id: 't02', name: '崔然竣', groupId: 'txt', group: 'TOMORROW X TOGETHER' },
    { id: 't03', name: '崔杋圭', groupId: 'txt', group: 'TOMORROW X TOGETHER' },
    { id: 't04', name: '姜太显', groupId: 'txt', group: 'TOMORROW X TOGETHER' },
    { id: 't05', name: '休宁凯', groupId: 'txt', group: 'TOMORROW X TOGETHER' },

    { id: 'a01', name: '金弘中', groupId: 'ateez', group: 'ATEEZ' },
    { id: 'a02', name: '朴星化', groupId: 'ateez', group: 'ATEEZ' },
    { id: 'a03', name: '丁润浩', groupId: 'ateez', group: 'ATEEZ' },
    { id: 'a04', name: '姜吕尚', groupId: 'ateez', group: 'ATEEZ' },
    { id: 'a05', name: '崔伞', groupId: 'ateez', group: 'ATEEZ' },
    { id: 'a06', name: '宋旼琦', groupId: 'ateez', group: 'ATEEZ' },
    { id: 'a07', name: '郑友荣', groupId: 'ateez', group: 'ATEEZ' },
    { id: 'a08', name: '崔钟浩', groupId: 'ateez', group: 'ATEEZ' },

    { id: 'b01', name: '李上渊', groupId: 'the-boyz', group: 'THE BOYZ' },
    { id: 'b02', name: '裴俊英', groupId: 'the-boyz', group: 'THE BOYZ' },
    { id: 'b03', name: '金泳勋', groupId: 'the-boyz', group: 'THE BOYZ' },
    { id: 'b04', name: '李贤在', groupId: 'the-boyz', group: 'THE BOYZ' },
    { id: 'b05', name: '李柱延', groupId: 'the-boyz', group: 'THE BOYZ' },
    { id: 'b06', name: '文炯书', groupId: 'the-boyz', group: 'THE BOYZ' },
    { id: 'b07', name: '池昌民', groupId: 'the-boyz', group: 'THE BOYZ' },
    { id: 'b08', name: '金善旴', groupId: 'the-boyz', group: 'THE BOYZ' },
    { id: 'b09', name: '孙英宰', groupId: 'the-boyz', group: 'THE BOYZ' }
  ];

  var peopleById = {};
  people.forEach(function (person) { peopleById[person.id] = person; });

  var styleById = {};
  styles.forEach(function (style) { styleById[style.id] = style; });

  var profileSources = {
    treasure: 'https://ygex.jp/en/treasure/profile/',
    'stray-kids': 'https://straykids.jype.com/Default/Profile',
    enhypen: 'https://beliftlab.com/artist/profile/ENHYPEN',
    txt: 'https://ibighit.com/txt/eng/profile/',
    ateez: 'https://ateez-official.jp/profiles',
    'the-boyz': 'https://theboyz.jp/s/n61/page/re_member'
  };

  var rights = '组合官方资料页或官方社交账号公开素材；公开发布、高互动或官方来源不等于获得再发布许可，正式推广或商业使用前仍需确认授权';

  function makePhoto(personId, styleId, filename, source, description) {
    var person = peopleById[personId];
    var style = styleById[styleId];
    return {
      id: personId + '-' + styleId,
      personId: personId,
      personName: person.name,
      groupId: person.groupId,
      group: person.group,
      styleId: styleId,
      styleLabel: style.label,
      image: './assets/photos/' + filename + '?v=10',
      alt: person.name + ' ' + (description || '官方成员资料照'),
      source: source || profileSources[person.groupId],
      rights: rights
    };
  }

  var photos = [
    makePhoto('p01', 'fresh', 'hyunsuk-casual.jpg', 'https://www.instagram.com/p/DXW5TIzEXaz/', '自然感生日造型官方照片'),
    makePhoto('p01', 'stage', 'hyunsuk-profile.jpg', 'https://www.instagram.com/p/De_fLAwKG07/', 'SHOCK 概念视觉官方照片'),
    makePhoto('p02', 'fresh', 'jihoon-casual.jpg', 'https://www.instagram.com/p/DV1DA4bEoA3/', '自然感生日造型官方照片'),
    makePhoto('p02', 'noir', 'jihoon-profile.jpg', 'https://www.instagram.com/p/De_fPGVK2jX/', 'SHOCK 冷感概念视觉官方照片'),
    makePhoto('p03', 'fresh', 'yoshi-casual.jpg', 'https://www.instagram.com/p/DYUsVMqRcAv/', '自然感生日造型官方照片'),
    makePhoto('p03', 'noir', 'yoshi-profile.jpg', 'https://www.instagram.com/p/DfBOBkypVlk/', 'SHOCK 冷感概念视觉官方照片'),
    makePhoto('p04', 'fresh', 'junkyu-casual.jpg', 'https://www.instagram.com/p/DdB9V0cA0uz/', '自然感生日造型官方照片'),
    makePhoto('p04', 'noir', 'junkyu-profile.jpg', 'https://www.instagram.com/p/C7L0HMBRNyf/', 'KING KONG 黑白概念视觉官方照片'),
    makePhoto('p05', 'fresh', 'jaehyuk-casual.jpg', 'https://www.instagram.com/p/DbGWsOZA1Z1/', '自然感生日造型官方照片'),
    makePhoto('p05', 'stage', 'jaehyuk-profile.jpg', 'https://www.instagram.com/p/DfB_uvNB3Kk/', 'SHOCK 概念视觉官方照片'),
    makePhoto('p06', 'fresh', 'asahi-casual.jpg', 'https://www.instagram.com/p/DcOdaQFAIlp/', '镜面自拍风生日造型官方照片'),
    makePhoto('p06', 'noir', 'asahi-profile.jpg', 'https://www.instagram.com/p/DfCEbjGq4Jj/', 'SHOCK 冷感概念视觉官方照片'),
    makePhoto('p07', 'fresh', 'doyoung-profile.jpg', 'https://www.instagram.com/p/DRzjkuIDzZZ/', '清爽生日造型官方照片'),
    makePhoto('p07', 'stage', 'doyoung-poster.jpg', 'https://www.instagram.com/p/DfB__EMh9SS/', 'SHOCK 概念视觉官方照片'),
    makePhoto('p08', 'fresh', 'haruto-profile.jpg', 'https://www.instagram.com/p/DWtsrtTEb6Q/', '自然感生日造型官方照片'),
    makePhoto('p08', 'noir', 'haruto-poster.jpg', 'https://www.instagram.com/p/DfESlylx2Xv/', 'SHOCK 冷感概念视觉官方照片'),
    makePhoto('p09', 'stage', 'treasure-jeongwoo.jpg', 'https://www.instagram.com/p/Ddy4aZ_ADvB/', 'TREASURE 官方高互动造型照片'),
    makePhoto('p09', 'fresh', 'treasure-jeongwoo-alt.jpg', 'https://dbkpop.com/2022/02/15/treasure-second-step-chapter-one-jikjin-concept-profile-photos-hr/', 'JIKJIN 清爽概念照片'),
    makePhoto('p10', 'fresh', 'treasure-junghwan.jpg', 'https://www.instagram.com/p/C3c-3L_vdJ5/', 'TREASURE 官方高互动造型照片'),
    makePhoto('p10', 'stage', 'treasure-junghwan-alt.jpg', 'https://dbkpop.com/2022/02/15/treasure-second-step-chapter-one-jikjin-concept-profile-photos-hr/', 'JIKJIN 舞台概念照片'),

    makePhoto('s01', 'stage', 'skz-bangchan.jpg', 'https://www.instagram.com/gnabnahc/p/DejhT3ZGmbY/', '成员认证账号高互动造型照片'),
    makePhoto('s01', 'noir', 'skz-bangchan-alt.jpg', 'https://dbkpop.com/2023/05/23/stray-kids-5-star-teaser-photos-3-hd-hq/', '5-STAR 冷感概念照片'),
    makePhoto('s02', 'fresh', 'skz-leeknow.jpg', 'https://www.instagram.com/p/De4Z1C0TRNp/', '组合官方高互动造型照片'),
    makePhoto('s02', 'stage', 'skz-leeknow-alt.jpg', 'https://dbkpop.com/2023/05/23/stray-kids-5-star-teaser-photos-3-hd-hq/', '5-STAR 舞台概念照片'),
    makePhoto('s03', 'noir', 'skz-changbin.jpg', 'https://www.instagram.com/p/ChFL0h4hcTf/', '组合官方高互动造型照片'),
    makePhoto('s03', 'stage', 'skz-changbin-alt.jpg', 'https://dbkpop.com/2023/05/23/stray-kids-5-star-teaser-photos-3-hd-hq/', '5-STAR 舞台概念照片'),
    makePhoto('s04', 'stage', 'skz-hyunjin.jpg', 'https://www.instagram.com/hynjinnnn/p/DeJsVDJlOtg/', '成员认证账号高互动造型照片'),
    makePhoto('s04', 'noir', 'skz-hyunjin-alt.jpg', 'https://dbkpop.com/2023/05/23/stray-kids-5-star-teaser-photos-3-hd-hq/', '5-STAR 冷感概念照片'),
    makePhoto('s05', 'fresh', 'skz-han.jpg', 'https://www.instagram.com/p/CxLMcnoB3ln/', '组合官方高互动造型照片'),
    makePhoto('s05', 'noir', 'skz-han-alt.jpg', 'https://dbkpop.com/2023/05/23/stray-kids-5-star-teaser-photos-3-hd-hq/', '5-STAR 冷感概念照片'),
    makePhoto('s06', 'noir', 'skz-felix.jpg', 'https://www.instagram.com/p/Cr25t_RBP2A/', '组合官方高互动造型照片'),
    makePhoto('s06', 'stage', 'skz-felix-alt.jpg', 'https://dbkpop.com/2023/05/23/stray-kids-5-star-teaser-photos-3-hd-hq/', '5-STAR 舞台概念照片'),
    makePhoto('s07', 'stage', 'skz-seungmin.jpg', 'https://www.instagram.com/p/B5_vZMOlUwb/', '组合官方高互动造型照片'),
    makePhoto('s07', 'noir', 'skz-seungmin-alt.jpg', 'https://dbkpop.com/2023/05/23/stray-kids-5-star-teaser-photos-3-hd-hq/', '5-STAR 冷感概念照片'),
    makePhoto('s08', 'fresh', 'skz-in.jpg', 'https://www.instagram.com/i.2.n.8/p/DcwDZruE_7k/', '成员认证账号高互动造型照片'),
    makePhoto('s08', 'stage', 'skz-in-alt.jpg', 'https://dbkpop.com/2023/05/23/stray-kids-5-star-teaser-photos-3-hd-hq/', '5-STAR 舞台概念照片'),

    makePhoto('e01', 'noir', 'enhypen-jungwon.jpg', 'https://www.instagram.com/enhypenyang_jungwon/p/DfFAl0qPzC6/', '成员账号造型照片'),
    makePhoto('e01', 'stage', 'enhypen-jungwon-alt.jpg', 'https://dbkpop.com/2023/05/10/enhypen-dark-blood-concept-teaser-photos-new-ver-uhd-hq-hr/', 'DARK BLOOD 红黑概念照片'),
    makePhoto('e02', 'stage', 'enhypen-jay.jpg', 'https://www.instagram.com/p/C6i1Z4CSa6Y/', '组合官方高互动造型照片'),
    makePhoto('e02', 'noir', 'enhypen-jay-alt.jpg', 'https://dbkpop.com/2023/05/10/enhypen-dark-blood-concept-teaser-photos-new-ver-uhd-hq-hr/', 'DARK BLOOD 冷感概念照片'),
    makePhoto('e03', 'fresh', 'enhypen-jake.jpg', 'https://www.instagram.com/enhypen/p/DFAJDu2yLfX/', '组合官方高互动品牌造型照片'),
    makePhoto('e03', 'noir', 'enhypen-jake-alt.jpg', 'https://dbkpop.com/2023/05/10/enhypen-dark-blood-concept-teaser-photos-new-ver-uhd-hq-hr/', 'DARK BLOOD 冷感概念照片'),
    makePhoto('e04', 'noir', 'enhypen-sunghoon.jpg', 'https://www.instagram.com/p/DFxVLhLS4jj/', '组合官方高互动造型照片'),
    makePhoto('e04', 'stage', 'enhypen-sunghoon-alt.jpg', 'https://dbkpop.com/2023/05/10/enhypen-dark-blood-concept-teaser-photos-new-ver-uhd-hq-hr/', 'DARK BLOOD 红黑概念照片'),
    makePhoto('e05', 'stage', 'enhypen-sunoo.jpg', 'https://www.instagram.com/enhypen/p/DfGvApwCRPu/', '组合官方高互动近景照片'),
    makePhoto('e05', 'noir', 'enhypen-sunoo-alt.jpg', 'https://dbkpop.com/2023/05/10/enhypen-dark-blood-concept-teaser-photos-new-ver-uhd-hq-hr/', 'DARK BLOOD 冷感概念照片'),
    makePhoto('e06', 'fresh', 'enhypen-niki.jpg', 'https://www.instagram.com/p/Daj71A9k4vD/', '成员账号造型照片'),
    makePhoto('e06', 'noir', 'enhypen-niki-alt.jpg', 'https://dbkpop.com/2023/05/10/enhypen-dark-blood-concept-teaser-photos-new-ver-uhd-hq-hr/', 'DARK BLOOD 冷感概念照片'),

    makePhoto('t01', 'fresh', 'txt-soobin.jpg', 'https://www.instagram.com/dolcegabbana_beauty/p/DdTOzRWDdjb/', '品牌官方高互动造型照片'),
    makePhoto('t01', 'stage', 'txt-soobin-alt.jpg', 'https://dbkpop.com/2023/01/16/txt-the-name-chapter-temptation-lullaby-teaser-concept-photos-40-photos-uhd-hq-hr/', 'TEMPTATION Lullaby 舞台概念照片'),
    makePhoto('t02', 'noir', 'txt-yeonjun.jpg', 'https://www.instagram.com/yawnzzn/p/Dewpk5tFP_P/', '成员认证账号高互动造型照片'),
    makePhoto('t02', 'fresh', 'txt-yeonjun-alt.jpg', 'https://dbkpop.com/2022/05/05/txt-yeonjun-minisode-2-thursdays-child-teaser-concept-photos-hd-hq-hr/', 'Thursday’s Child 柔光概念照片'),
    makePhoto('t03', 'stage', 'txt-beomgyu.jpg', 'https://www.instagram.com/p/DNciekXp4EZ/', '组合官方高互动造型照片'),
    makePhoto('t03', 'noir', 'txt-beomgyu-alt.jpg', 'https://dbkpop.com/2023/01/16/txt-the-name-chapter-temptation-lullaby-teaser-concept-photos-40-photos-uhd-hq-hr/', 'TEMPTATION Lullaby 冷感概念照片'),
    makePhoto('t04', 'fresh', 'txt-taehyun.jpg', 'https://www.instagram.com/p/CAsaGUcp4J8/', '组合官方高互动造型照片'),
    makePhoto('t04', 'stage', 'txt-taehyun-alt.jpg', 'https://dbkpop.com/2023/01/16/txt-the-name-chapter-temptation-lullaby-teaser-concept-photos-40-photos-uhd-hq-hr/', 'TEMPTATION Lullaby 舞台概念照片'),
    makePhoto('t05', 'noir', 'txt-hueningkai.jpg', 'https://www.instagram.com/p/BtNgOefjDP0/', '组合官方高互动造型照片'),
    makePhoto('t05', 'fresh', 'txt-hueningkai-alt.jpg', 'https://dbkpop.com/2023/01/16/txt-the-name-chapter-temptation-lullaby-teaser-concept-photos-40-photos-uhd-hq-hr/', 'TEMPTATION Lullaby 柔光概念照片'),

    makePhoto('a01', 'stage', 'ateez-hongjoong.jpg', 'https://www.instagram.com/no1likeme8_8/p/DemK1PMn9el/', '成员认证账号高互动造型照片'),
    makePhoto('a01', 'noir', 'ateez-hongjoong-alt.jpg', 'https://dbkpop.com/2022/07/08/ateez-the-world-ep-1-movement-teaser-photos-hongjoong-seonghwa-hd-hq/', 'THE WORLD 冷感概念照片'),
    makePhoto('a02', 'fresh', 'ateez-seonghwa.jpg', 'https://www.instagram.com/p/C1eO6R0LbrE/', '组合官方高互动造型照片'),
    makePhoto('a02', 'stage', 'ateez-seonghwa-alt.jpg', 'https://dbkpop.com/2022/07/08/ateez-the-world-ep-1-movement-teaser-photos-hongjoong-seonghwa-hd-hq/', 'THE WORLD 舞台概念照片'),
    makePhoto('a03', 'noir', 'ateez-yunho.jpg', 'https://www.instagram.com/p/DeeELPKgY6F/', '品牌官方高互动造型照片'),
    makePhoto('a03', 'stage', 'ateez-yunho-alt.jpg', 'https://dbkpop.com/2022/07/08/ateez-the-world-ep-1-movement-teaser-photos-yunho-yeosang-san-mingi-hd-hq/', 'THE WORLD 舞台概念照片'),
    makePhoto('a04', 'stage', 'ateez-yeosang.jpg', 'https://www.instagram.com/im_ovation/p/DfCZoRuE_-L/', '成员认证账号高互动造型照片'),
    makePhoto('a04', 'noir', 'ateez-yeosang-alt.jpg', 'https://dbkpop.com/2022/07/08/ateez-the-world-ep-1-movement-teaser-photos-yunho-yeosang-san-mingi-hd-hq/', 'THE WORLD 冷感概念照片'),
    makePhoto('a05', 'fresh', 'ateez-san.jpg', 'https://www.instagram.com/choi3an/p/DeRZdtAEy4a/', '成员认证账号高互动品牌肖像'),
    makePhoto('a05', 'stage', 'ateez-san-alt.jpg', 'https://dbkpop.com/2022/07/08/ateez-the-world-ep-1-movement-teaser-photos-yunho-yeosang-san-mingi-hd-hq/', 'THE WORLD 舞台概念照片'),
    makePhoto('a06', 'noir', 'ateez-mingi.jpg', 'https://www.instagram.com/fixon_n_on/p/DdEYIvpFNv1/', '成员认证账号高互动造型照片'),
    makePhoto('a06', 'stage', 'ateez-mingi-alt.jpg', 'https://dbkpop.com/2022/07/08/ateez-the-world-ep-1-movement-teaser-photos-yunho-yeosang-san-mingi-hd-hq/', 'THE WORLD 舞台概念照片'),
    makePhoto('a07', 'stage', 'ateez-wooyoung.jpg', 'https://www.instagram.com/p/C18z9cnLQcL/', '组合官方高互动造型照片'),
    makePhoto('a07', 'noir', 'ateez-wooyoung-alt.jpg', 'https://dbkpop.com/2022/07/09/ateez-the-world-ep-1-movement-teaser-photos-wooyoung-jongho-hd-hq/', 'THE WORLD 冷感概念照片'),
    makePhoto('a08', 'fresh', 'ateez-jongho.jpg', 'https://www.instagram.com/p/CtjWJTdrvlB/', '组合官方高互动造型照片'),
    makePhoto('a08', 'stage', 'ateez-jongho-alt.jpg', 'https://dbkpop.com/2022/07/09/ateez-the-world-ep-1-movement-teaser-photos-wooyoung-jongho-hd-hq/', 'THE WORLD 舞台概念照片'),

    makePhoto('b01', 'noir', 'theboyz-sangyeon.jpg', 'https://www.instagram.com/thesangyeon/p/Dera6XLmqjc/', '成员认证账号高互动西装肖像'),
    makePhoto('b01', 'stage', 'theboyz-sangyeon-alt.jpg', 'https://dbkpop.com/2021/10/18/the-boyz-maverick-teaser-doom-ver-sangyeon-kevin-q-juyeon-hd-hq/', 'MAVERICK 舞台概念照片'),
    makePhoto('b02', 'stage', 'theboyz-jacob.jpg', 'https://www.instagram.com/p/DaL85_EAV_f/', '杂志官方单人造型照片'),
    makePhoto('b02', 'noir', 'theboyz-jacob-alt.jpg', 'https://dbkpop.com/2021/10/20/the-boyz-maverick-teaser-doom-ver-haknyeon-jacob-new-younghoon-hd-hq/', 'MAVERICK 冷感概念照片'),
    makePhoto('b03', 'fresh', 'theboyz-younghoon.jpg', 'https://www.instagram.com/_0hoony/p/DbaGY5dmeoO/', '成员认证账号高互动清晰街拍'),
    makePhoto('b03', 'stage', 'theboyz-younghoon-alt.jpg', 'https://dbkpop.com/2021/10/20/the-boyz-maverick-teaser-doom-ver-haknyeon-jacob-new-younghoon-hd-hq/', 'MAVERICK 舞台概念照片'),
    makePhoto('b04', 'noir', 'theboyz-hyunjae.jpg', 'https://www.instagram.com/p/DOgaYU6kts4/', '组合官方单人造型照片'),
    makePhoto('b04', 'stage', 'theboyz-hyunjae-alt.jpg', 'https://dbkpop.com/2021/10/21/the-boyz-maverick-teaser-doom-ver-eric-hyunjae-sunwoo-hd-hq/', 'MAVERICK 舞台概念照片'),
    makePhoto('b05', 'stage', 'theboyz-juyeon.jpg', 'https://www.instagram.com/p/Dcai0EajzaS/', '成员认证账号高互动造型照片'),
    makePhoto('b05', 'noir', 'theboyz-juyeon-alt.jpg', 'https://dbkpop.com/2021/10/18/the-boyz-maverick-teaser-doom-ver-sangyeon-kevin-q-juyeon-hd-hq/', 'MAVERICK 冷感概念照片'),
    makePhoto('b06', 'fresh', 'theboyz-kevin.jpg', 'https://www.instagram.com/p/DdFcVi0mYkm/', '杂志官方单人造型照片'),
    makePhoto('b06', 'stage', 'theboyz-kevin-alt.jpg', 'https://dbkpop.com/2021/10/18/the-boyz-maverick-teaser-doom-ver-sangyeon-kevin-q-juyeon-hd-hq/', 'MAVERICK 舞台概念照片'),
    makePhoto('b07', 'noir', 'theboyz-q.jpg', 'https://www.instagram.com/__qfeed__/p/DerO89xn-7_/', '成员认证账号造型照片'),
    makePhoto('b07', 'stage', 'theboyz-q-alt.jpg', 'https://dbkpop.com/2020/09/09/the-boyz-chase-teaser-photos-hd-hq/', 'CHASE 舞台概念照片'),
    makePhoto('b08', 'stage', 'theboyz-sunwoo.jpg', 'https://www.instagram.com/sunwoo/p/DeV-R6AESgT/', '成员认证账号高互动造型照片'),
    makePhoto('b08', 'noir', 'theboyz-sunwoo-alt.jpg', 'https://dbkpop.com/2021/10/21/the-boyz-maverick-teaser-doom-ver-eric-hyunjae-sunwoo-hd-hq/', 'MAVERICK 冷感概念照片'),
    makePhoto('b09', 'fresh', 'theboyz-eric.jpg', 'https://www.instagram.com/eric.is.youngjae/p/Ddvz6_HEldU/', '成员认证账号高互动造型照片'),
    makePhoto('b09', 'stage', 'theboyz-eric-alt.jpg', 'https://dbkpop.com/2021/10/21/the-boyz-maverick-teaser-doom-ver-eric-hyunjae-sunwoo-hd-hq/', 'MAVERICK 舞台概念照片')
  ];

  window.IDOL_DATA = { styles: styles, groups: groups, people: people, photos: photos };
}());
