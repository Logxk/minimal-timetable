/**
 * 极简课表 (Ultra-Performance Timetable)
 * 极致性能、零冗余、纯原生现代 JavaScript 实现
 * 示例通用版课表 (无任何个人数据，开箱即用)
 */

(function () {
  'use strict';

  // ==========================================================================
  // 常量与配置
  // ==========================================================================
  const STORAGE_KEY = 'minimal_timetable_data_v2';
  const SETTINGS_KEY = 'minimal_timetable_settings_v2';

  // 大学作息时间表 (支持自动适配教务作息，1-14节)
  let DEFAULT_TIMES = [
    { start: '08:00', end: '08:45' }, // 1
    { start: '08:55', end: '09:40' }, // 2
    { start: '10:10', end: '10:55' }, // 3
    { start: '11:05', end: '11:50' }, // 4
    { start: '14:30', end: '15:15' }, // 5
    { start: '15:25', end: '16:10' }, // 6
    { start: '16:40', end: '17:25' }, // 7
    { start: '17:35', end: '18:20' }, // 8
    { start: '19:00', end: '19:45' }, // 9
    { start: '19:55', end: '20:40' }, // 10
    { start: '20:45', end: '21:30' }, // 11
    { start: '21:35', end: '22:20' }, // 12
    { start: '22:25', end: '23:10' }, // 13
    { start: '23:15', end: '23:59' }  // 14
  ];

  // 现代高饱和、高辨识度纯色卡片配色池 (高对比度纯白文字，对标高端课表APP)
  const COLOR_PALETTE = [
    { bg: '#FA7C72', text: '#FFFFFF', border: 'transparent' }, // 珊瑚红 / 蜜桃粉
    { bg: '#4A92DE', text: '#FFFFFF', border: 'transparent' }, // 天空蓝 / 经典蓝
    { bg: '#7C8BC4', text: '#FFFFFF', border: 'transparent' }, // 薰衣草紫 / 雾霾紫
    { bg: '#ECA042', text: '#FFFFFF', border: 'transparent' }, // 暖琥珀橙
    { bg: '#54B685', text: '#FFFFFF', border: 'transparent' }, // 翡翠薄荷绿
    { bg: '#EE6E93', text: '#FFFFFF', border: 'transparent' }, // 玫瑰粉
    { bg: '#29A6B8', text: '#FFFFFF', border: 'transparent' }, // 碧青孔雀蓝
    { bg: '#8668C8', text: '#FFFFFF', border: 'transparent' }, // 优雅紫罗兰
    { bg: '#5B7FD6', text: '#FFFFFF', border: 'transparent' }  // 皇家蔚蓝
  ];

  const DARK_COLOR_PALETTE = [
    { bg: '#BD4A40', text: '#FFFFFF', border: 'transparent' },
    { bg: '#2B69AA', text: '#FFFFFF', border: 'transparent' },
    { bg: '#536199', text: '#FFFFFF', border: 'transparent' },
    { bg: '#A66920', text: '#FFFFFF', border: 'transparent' },
    { bg: '#327D56', text: '#FFFFFF', border: 'transparent' },
    { bg: '#A64360', text: '#FFFFFF', border: 'transparent' },
    { bg: '#1D7582', text: '#FFFFFF', border: 'transparent' },
    { bg: '#5E4496', text: '#FFFFFF', border: 'transparent' },
    { bg: '#3C579E', text: '#FFFFFF', border: 'transparent' }
  ];

  // 示例课表数据 (无任何个人隐私信息，通用大学计算机专业标准课程体系)
  const DEMO_COURSES = [
    {
      id: "demo_c1",
      name: "高等数学 (上)",
      room: "教1-101",
      teacher: "张教授",
      day: 1,
      startPeriod: 1,
      endPeriod: 2,
      startWeek: 1,
      endWeek: 16,
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekType: "all"
    },
    {
      id: "demo_c2",
      name: "大学英语 (综合)",
      room: "教2-205",
      teacher: "李老师",
      day: 1,
      startPeriod: 3,
      endPeriod: 4,
      startWeek: 1,
      endWeek: 16,
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekType: "all"
    },
    {
      id: "demo_c3",
      name: "线性代数",
      room: "教1-102",
      teacher: "王教授",
      day: 1,
      startPeriod: 5,
      endPeriod: 6,
      startWeek: 1,
      endWeek: 16,
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekType: "all"
    },
    {
      id: "demo_c4",
      name: "计算机导论",
      room: "信息楼204",
      teacher: "赵副教授",
      day: 1,
      startPeriod: 7,
      endPeriod: 8,
      startWeek: 1,
      endWeek: 12,
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      weekType: "all"
    },
    {
      id: "demo_c5",
      name: "大学物理 (力学)",
      room: "理科楼301",
      teacher: "钱教授",
      day: 2,
      startPeriod: 3,
      endPeriod: 4,
      startWeek: 1,
      endWeek: 16,
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekType: "all"
    },
    {
      id: "demo_c6",
      name: "思想道德与法治",
      room: "教一302",
      teacher: "陈老师",
      day: 2,
      startPeriod: 5,
      endPeriod: 6,
      startWeek: 1,
      endWeek: 14,
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
      weekType: "all"
    },
    {
      id: "demo_c7",
      name: "Python程序设计",
      room: "实验楼402机房",
      teacher: "孙讲师",
      day: 2,
      startPeriod: 7,
      endPeriod: 8,
      startWeek: 1,
      endWeek: 16,
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekType: "all"
    },
    {
      id: "demo_c8",
      name: "高等数学 (上)",
      room: "教1-101",
      teacher: "张教授",
      day: 3,
      startPeriod: 1,
      endPeriod: 2,
      startWeek: 1,
      endWeek: 16,
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekType: "all"
    },
    {
      id: "demo_c9",
      name: "体育 (羽毛球)",
      room: "风雨操场",
      teacher: "周教练",
      day: 3,
      startPeriod: 3,
      endPeriod: 4,
      startWeek: 1,
      endWeek: 16,
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekType: "all"
    },
    {
      id: "demo_c10",
      name: "离散数学",
      room: "信息楼102",
      teacher: "吴副教授",
      day: 3,
      startPeriod: 7,
      endPeriod: 8,
      startWeek: 1,
      endWeek: 16,
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekType: "all"
    },
    {
      id: "demo_c11",
      name: "大学物理 (力学)",
      room: "理科楼301",
      teacher: "钱教授",
      day: 4,
      startPeriod: 1,
      endPeriod: 2,
      startWeek: 1,
      endWeek: 16,
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekType: "all"
    },
    {
      id: "demo_c12",
      name: "大学英语 (综合)",
      room: "教2-205",
      teacher: "李老师",
      day: 4,
      startPeriod: 3,
      endPeriod: 4,
      startWeek: 1,
      endWeek: 16,
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekType: "all"
    },
    {
      id: "demo_c13",
      name: "中国近代史纲要",
      room: "教一401",
      teacher: "郑老师",
      day: 4,
      startPeriod: 5,
      endPeriod: 6,
      startWeek: 1,
      endWeek: 12,
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      weekType: "all"
    },
    {
      id: "demo_c14",
      name: "面向对象程序设计",
      room: "信息楼305",
      teacher: "冯教授",
      day: 5,
      startPeriod: 3,
      endPeriod: 4,
      startWeek: 1,
      endWeek: 16,
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekType: "all"
    },
    {
      id: "demo_c15",
      name: "数据结构基础",
      room: "实验楼301",
      teacher: "蒋讲师",
      day: 5,
      startPeriod: 5,
      endPeriod: 6,
      startWeek: 1,
      endWeek: 16,
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekType: "all"
    },
    // 周六预置排课测试用例 (45分钟单节小课、时段冲突并列、175分钟超长实验)
    {
      id: "demo_c16",
      name: "前沿学术讲座",
      room: "学术报告厅",
      teacher: "特邀院士",
      day: 6,
      startPeriod: 1,
      endPeriod: 1,
      startWeek: 1,
      endWeek: 16,
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekType: "all"
    },
    {
      id: "demo_c17",
      name: "人工智能导论",
      room: "信息楼201",
      teacher: "魏副教授",
      day: 6,
      startPeriod: 3,
      endPeriod: 4,
      startWeek: 1,
      endWeek: 16,
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekType: "all"
    },
    {
      id: "demo_c18",
      name: "运筹与优化",
      room: "教二203",
      teacher: "韩教授",
      day: 6,
      startPeriod: 3,
      endPeriod: 4,
      startWeek: 1,
      endWeek: 16,
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekType: "all"
    },
    {
      id: "demo_c19",
      name: "软件工程综合实训与课程设计",
      room: "工程实践中心B区",
      teacher: "创新导师团",
      day: 6,
      startPeriod: 5,
      endPeriod: 8,
      startWeek: 1,
      endWeek: 16,
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekType: "all"
    }
  ];

  // ==========================================================================
  // 应用状态
  // ==========================================================================
  let state = {
    currentWeek: 6,
    actualWeek: 6,
    semesterStartDate: '2026-08-31', // 开学第一周周一
    totalPeriods: 11,
    theme: 'auto',
    showOtherWeeks: false, // 默认仅展示当前周活跃课程，保证界面极简清爽
    courses: [],
    classReminderEnabled: false, // 课前10分钟提醒开关
    calendarSynced: false,       // 是否已同步到系统日历
    calendarSyncCount: 0,        // 已同步的日历事件数量
    lastRemindedCourseKey: null  // 避免课前重复弹窗提示的去重缓存
  };

  const el = {};

  // ==========================================================================
  // 初始化
  // ==========================================================================
  function init() {
    cacheDom();
    loadSettings();
    loadCourses();
    initTheme();
    setupEventListeners();
    renderTimeColumn();
    changeWeek(state.actualWeek);

    // 自动定时轮询上课状态与课前提醒 (每30秒更新一次，保证10分钟提醒准时捕获)
    checkCurrentClass();
    setInterval(() => {
      checkCurrentClass();
    }, 30000);

    // 注册 PWA Service Worker 离线缓存
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  }

  function cacheDom() {
    el.semesterLabel = document.getElementById('semesterLabel');
    el.currentWeekLabel = document.getElementById('currentWeekLabel');
    el.weekDropdownBtn = document.getElementById('weekDropdownBtn');
    el.weekDropdown = document.getElementById('weekDropdown');
    el.prevWeekBtn = document.getElementById('prevWeekBtn');
    el.nextWeekBtn = document.getElementById('nextWeekBtn');
    el.floatPrevWeekBtn = document.getElementById('floatPrevWeekBtn');
    el.floatNextWeekBtn = document.getElementById('floatNextWeekBtn');
    el.todayBtn = document.getElementById('todayBtn');
    el.toggleFilterBtn = document.getElementById('toggleFilterBtn');
    el.themeToggleBtn = document.getElementById('themeToggleBtn');
    el.moonIcon = document.getElementById('moonIcon');
    el.sunIcon = document.getElementById('sunIcon');
    el.menuBtn = document.getElementById('menuBtn');
    el.currentMonthLabel = document.getElementById('currentMonthLabel');
    el.timeColumn = document.getElementById('timeColumn');
    el.daysContainer = document.getElementById('daysContainer');
    el.courseModal = document.getElementById('courseModal');
    el.courseForm = document.getElementById('courseForm');
    el.modalTitle = document.getElementById('modalTitle');
    el.modalCloseBtn = document.getElementById('modalCloseBtn');
    el.cancelCourseBtn = document.getElementById('cancelCourseBtn');
    el.deleteCourseBtn = document.getElementById('deleteCourseBtn');
    el.courseId = document.getElementById('courseId');
    el.courseName = document.getElementById('courseName');
    el.courseRoom = document.getElementById('courseRoom');
    el.courseTeacher = document.getElementById('courseTeacher');
    el.courseDay = document.getElementById('courseDay');
    el.courseStartPeriod = document.getElementById('courseStartPeriod');
    el.courseEndPeriod = document.getElementById('courseEndPeriod');
    el.courseStartWeek = document.getElementById('courseStartWeek');
    el.courseEndWeek = document.getElementById('courseEndWeek');
    el.courseWeekType = document.getElementById('courseWeekType');
    el.settingsModal = document.getElementById('settingsModal');
    el.settingsCloseBtn = document.getElementById('settingsCloseBtn');
    el.addNewCourseBtn = document.getElementById('addNewCourseBtn');
    el.courseManagementList = document.getElementById('courseManagementList');
    el.semesterStartDateInput = document.getElementById('semesterStartDateInput');
    el.totalPeriodsSelect = document.getElementById('totalPeriodsSelect');
    el.exportJsonBtn = document.getElementById('exportJsonBtn');
    el.importJsonBtn = document.getElementById('importJsonBtn');
    el.exportIcsBtn = document.getElementById('exportIcsBtn');
    el.importFileInput = document.getElementById('importFileInput');
    el.importXlsBtn = document.getElementById('importXlsBtn');
    el.importXlsFileInput = document.getElementById('importXlsFileInput');
    el.testScenarioBtn = document.getElementById('testScenarioBtn');
    el.resetDemoBtn = document.getElementById('resetDemoBtn');
    el.clearAllBtn = document.getElementById('clearAllBtn');

    // 课程详情页 DOM
    el.courseDetailModal = document.getElementById('courseDetailModal');
    el.detailBackBtn = document.getElementById('detailBackBtn');
    el.detailEditTopBtn = document.getElementById('detailEditTopBtn');
    el.detailEditActionBtn = document.getElementById('detailEditActionBtn');
    el.detailCourseName = document.getElementById('detailCourseName');
    el.detailCourseRoom = document.getElementById('detailCourseRoom');
    el.detailCoursePeriods = document.getElementById('detailCoursePeriods');
    el.detailCourseTime = document.getElementById('detailCourseTime');
    el.detailCourseTeacher = document.getElementById('detailCourseTeacher');
    el.detailCourseClass = document.getElementById('detailCourseClass');
    el.detailCourseWeeksText = document.getElementById('detailCourseWeeksText');
    el.detailWeeksGrid = document.getElementById('detailWeeksGrid');
    el.detailConflictBox = document.getElementById('detailConflictBox');

    // 课前10分钟提醒与日历同步 DOM
    el.classReminderSwitch = document.getElementById('classReminderSwitch');
    el.testReminderBtn = document.getElementById('testReminderBtn');
    el.calendarStatusBadge = document.getElementById('calendarStatusBadge');
    el.syncCalendarBtn = document.getElementById('syncCalendarBtn');
    el.clearCalendarBtn = document.getElementById('clearCalendarBtn');

    // 课前浮动弹窗横幅 DOM
    el.classReminderBanner = document.getElementById('classReminderBanner');
    el.reminderBannerTitle = document.getElementById('reminderBannerTitle');
    el.reminderBannerDesc = document.getElementById('reminderBannerDesc');
    el.reminderBannerClose = document.getElementById('reminderBannerClose');

    // 粘贴课表导入 DOM
    el.pasteScheduleBtn = document.getElementById('pasteScheduleBtn');
    el.pasteModal = document.getElementById('pasteModal');
    el.pasteCloseBtn = document.getElementById('pasteCloseBtn');
    el.pasteCancelBtn = document.getElementById('pasteCancelBtn');
    el.pasteConfirmBtn = document.getElementById('pasteConfirmBtn');
    el.pasteTextarea = document.getElementById('pasteTextarea');
  }

  // ==========================================================================
  // 数据与设置持久化
  // ==========================================================================
  function loadSettings() {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state.semesterStartDate = parsed.semesterStartDate || '2026-08-31';
        state.totalPeriods = parsed.totalPeriods || 11;
        state.theme = parsed.theme || 'auto';
        state.showOtherWeeks = parsed.showOtherWeeks === true;
        state.classReminderEnabled = parsed.classReminderEnabled === true;
        state.calendarSynced = parsed.calendarSynced === true;
        state.calendarSyncCount = parsed.calendarSyncCount || 0;
        if (Array.isArray(parsed.customTimes) && parsed.customTimes.length > 0) {
          DEFAULT_TIMES = parsed.customTimes;
        }
      } else {
        state.semesterStartDate = '2026-08-31';
        state.totalPeriods = 11;
        state.theme = 'auto';
        state.showOtherWeeks = false;
        state.classReminderEnabled = false;
        state.calendarSynced = false;
        state.calendarSyncCount = 0;
        saveSettings();
      }
    } catch (e) {
      console.error(e);
    }

    el.semesterStartDateInput.value = state.semesterStartDate;
    el.totalPeriodsSelect.value = state.totalPeriods;
    if (el.classReminderSwitch) {
      el.classReminderSwitch.checked = state.classReminderEnabled;
    }
    updateCalendarBadgeUI();

    // 计算实际当前周
    calculateActualWeek();
    state.currentWeek = state.actualWeek;
  }

  function saveSettings() {
    const data = {
      semesterStartDate: state.semesterStartDate,
      totalPeriods: state.totalPeriods,
      theme: state.theme,
      showOtherWeeks: state.showOtherWeeks,
      classReminderEnabled: state.classReminderEnabled,
      calendarSynced: state.calendarSynced,
      calendarSyncCount: state.calendarSyncCount,
      customTimes: DEFAULT_TIMES
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
  }

  function loadCourses() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state.courses = JSON.parse(saved);
      } else {
        state.courses = [...DEMO_COURSES];
        saveCourses();
      }
    } catch (e) {
      state.courses = [...DEMO_COURSES];
    }
    calculateActualWeek();
    const maxWeek = getMaxWeek();
    state.currentWeek = Math.max(1, Math.min(maxWeek, state.actualWeek));
  }

  function saveCourses() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.courses));
    updateNativeAlarmsIfEnabled();
  }

  // 动态获取导入课表中最后有课的一周 (课表截止周)
  function getMaxWeek() {
    if (!state.courses || state.courses.length === 0) {
      return 16;
    }
    let maxW = 1;
    state.courses.forEach(c => {
      if (Array.isArray(c.weeks) && c.weeks.length > 0) {
        maxW = Math.max(maxW, ...c.weeks);
      } else if (c.endWeek) {
        maxW = Math.max(maxW, c.endWeek);
      }
    });
    return Math.max(1, maxW);
  }

  function calculateActualWeek() {
    if (!state.semesterStartDate) {
      state.actualWeek = 1;
      return;
    }
    const [y, m, d] = state.semesterStartDate.split('-').map(Number);
    const start = new Date(y, m - 1, d);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const calculated = Math.floor(diffDays / 7) + 1;
    const maxWeek = getMaxWeek();
    state.actualWeek = Math.max(1, Math.min(maxWeek, calculated));
  }

  // ==========================================================================
  // 主题管理
  // ==========================================================================
  function initTheme() {
    if (state.theme === 'dark' || (state.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
      el.moonIcon.classList.add('hidden');
      el.sunIcon.classList.remove('hidden');
    } else {
      document.documentElement.removeAttribute('data-theme');
      el.moonIcon.classList.remove('hidden');
      el.sunIcon.classList.add('hidden');
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      state.theme = 'light';
      el.moonIcon.classList.remove('hidden');
      el.sunIcon.classList.add('hidden');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      state.theme = 'dark';
      el.moonIcon.classList.add('hidden');
      el.sunIcon.classList.remove('hidden');
    }
    saveSettings();
    renderGrid();
  }

  // ==========================================================================
  // 事件与交互绑定
  // ==========================================================================
  function setupDropdown() {
    const maxWeek = getMaxWeek();
    let html = '';
    for (let i = 1; i <= maxWeek; i++) {
      html += `<button class="dropdown-item ${i === state.currentWeek ? 'active' : ''}" data-week="${i}">
        第 ${i} 周 ${i === state.actualWeek ? '(本周)' : ''}
      </button>`;
    }
    el.weekDropdown.innerHTML = html;
  }

  function updateFilterBtn() {
    if (!el.toggleFilterBtn) return;
    if (state.showOtherWeeks) {
      el.toggleFilterBtn.textContent = '显示全周';
      el.toggleFilterBtn.classList.remove('outline');
    } else {
      el.toggleFilterBtn.textContent = '仅看本周';
      el.toggleFilterBtn.classList.add('outline');
    }
  }

  function setupEventListeners() {
    el.prevWeekBtn.addEventListener('click', () => changeWeek(state.currentWeek - 1));
    el.nextWeekBtn.addEventListener('click', () => changeWeek(state.currentWeek + 1));
    if (el.floatPrevWeekBtn) {
      el.floatPrevWeekBtn.addEventListener('click', () => changeWeek(state.currentWeek - 1));
    }
    if (el.floatNextWeekBtn) {
      el.floatNextWeekBtn.addEventListener('click', () => changeWeek(state.currentWeek + 1));
    }
    el.todayBtn.addEventListener('click', () => changeWeek(state.actualWeek));

    if (el.toggleFilterBtn) {
      el.toggleFilterBtn.addEventListener('click', () => {
        state.showOtherWeeks = !state.showOtherWeeks;
        updateFilterBtn();
        saveSettings();
        renderGrid();
      });
      updateFilterBtn();
    }

    el.weekDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      el.weekDropdown.classList.toggle('hidden');
    });

    el.weekDropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.dropdown-item');
      if (item) {
        const week = parseInt(item.dataset.week, 10);
        changeWeek(week);
        el.weekDropdown.classList.add('hidden');
      }
    });

    document.addEventListener('click', (e) => {
      if (!el.weekDropdown.contains(e.target) && !el.weekDropdownBtn.contains(e.target)) {
        el.weekDropdown.classList.add('hidden');
      }
    });

    el.themeToggleBtn.addEventListener('click', toggleTheme);

    el.menuBtn.addEventListener('click', () => {
      history.pushState({ modal: 'settings' }, '');
      renderCourseManagementList();
      updateCalendarBadgeUI();
      el.settingsModal.classList.remove('hidden');
    });

    if (el.addNewCourseBtn) {
      el.addNewCourseBtn.addEventListener('click', () => {
        el.settingsModal.classList.add('hidden');
        openCourseModal(null);
      });
    }

    el.settingsCloseBtn.addEventListener('click', () => {
      if (history.state && history.state.modal === 'settings') {
        history.back();
      } else {
        el.settingsModal.classList.add('hidden');
      }
    });

    el.detailBackBtn.addEventListener('click', () => {
      if (history.state && history.state.modal === 'detail') {
        history.back();
      } else {
        closeCourseDetail();
      }
    });

    const handleDetailEdit = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const target = currentDetailCourse;
      el.courseDetailModal.classList.add('hidden');
      if (history.state && history.state.modal === 'detail') {
        history.replaceState({ modal: 'course' }, '');
      }
      if (target) openCourseModal(target, null, null, true);
    };

    el.detailEditTopBtn.addEventListener('click', handleDetailEdit);
    el.detailEditActionBtn.addEventListener('click', handleDetailEdit);

    window.__handleAndroidBack = function() {
      if (el.pasteModal && !el.pasteModal.classList.contains('hidden')) {
        el.pasteModal.classList.add('hidden');
        return true;
      }
      if (!el.courseDetailModal.classList.contains('hidden')) {
        closeCourseDetail();
        return true;
      }
      if (!el.courseModal.classList.contains('hidden')) {
        el.courseModal.classList.add('hidden');
        return true;
      }
      if (!el.settingsModal.classList.contains('hidden')) {
        el.settingsModal.classList.add('hidden');
        return true;
      }
      if (!el.weekDropdown.classList.contains('hidden')) {
        el.weekDropdown.classList.add('hidden');
        return true;
      }
      return false;
    };

    window.addEventListener('popstate', () => {
      window.__handleAndroidBack();
    });

    el.modalCloseBtn.addEventListener('click', closeCourseModal);
    el.cancelCourseBtn.addEventListener('click', closeCourseModal);

    el.courseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveCourseHandler();
    });

    el.deleteCourseBtn.addEventListener('click', deleteCourseHandler);

    el.semesterStartDateInput.addEventListener('change', (e) => {
      state.semesterStartDate = e.target.value;
      calculateActualWeek();
      saveSettings();
      setupDropdown();
      renderWeekHeader();
      renderGrid();
    });

    el.totalPeriodsSelect.addEventListener('change', (e) => {
      state.totalPeriods = parseInt(e.target.value, 10);
      saveSettings();
      renderTimeColumn();
      renderGrid();
    });

    el.exportJsonBtn.addEventListener('click', exportJson);
    el.importJsonBtn.addEventListener('click', () => el.importFileInput.click());
    el.importFileInput.addEventListener('change', importJson);

    if (el.importXlsBtn && el.importXlsFileInput) {
      el.importXlsBtn.addEventListener('click', () => el.importXlsFileInput.click());
      el.importXlsFileInput.addEventListener('change', handleXlsUpload);
    }

    if (el.pasteScheduleBtn) {
      el.pasteScheduleBtn.addEventListener('click', () => {
        if (el.pasteTextarea) el.pasteTextarea.value = '';
        if (el.pasteModal) el.pasteModal.classList.remove('hidden');
      });
    }
    if (el.pasteCloseBtn) {
      el.pasteCloseBtn.addEventListener('click', () => {
        if (el.pasteModal) el.pasteModal.classList.add('hidden');
      });
    }
    if (el.pasteCancelBtn) {
      el.pasteCancelBtn.addEventListener('click', () => {
        if (el.pasteModal) el.pasteModal.classList.add('hidden');
      });
    }
    if (el.pasteConfirmBtn) {
      el.pasteConfirmBtn.addEventListener('click', () => {
        const text = el.pasteTextarea ? el.pasteTextarea.value.trim() : '';
        if (!text) {
          alert('请先粘贴课表内容');
          return;
        }
        applyParsedTimetableContent(text);
      });
    }

    el.exportIcsBtn.addEventListener('click', exportIcs);

    // 课前10分钟提醒与日历同步事件监听
    if (el.classReminderSwitch) {
      el.classReminderSwitch.addEventListener('change', handleReminderToggle);
    }
    if (el.testReminderBtn) {
      el.testReminderBtn.addEventListener('click', handleTestReminder);
    }
    if (el.syncCalendarBtn) {
      el.syncCalendarBtn.addEventListener('click', handleCalendarSync);
    }
    if (el.clearCalendarBtn) {
      el.clearCalendarBtn.addEventListener('click', handleCalendarClear);
    }
    if (el.classReminderBanner) {
      el.classReminderBanner.addEventListener('click', (e) => {
        if (e.target.closest('#reminderBannerClose')) {
          hideReminderBanner();
          return;
        }
        if (activeBannerCourse) {
          hideReminderBanner();
          openCourseDetail(activeBannerCourse);
        }
      });
    }
    if (el.reminderBannerClose) {
      el.reminderBannerClose.addEventListener('click', (e) => {
        e.stopPropagation();
        hideReminderBanner();
      });
    }

    if (el.testScenarioBtn) {
      el.testScenarioBtn.addEventListener('click', () => {
        state.courses = [...DEMO_COURSES];
        // 1. 45分钟小课 (周六 第1节 08:00-08:45)
        state.courses.push({
          id: "test_c_45m",
          name: "前沿学术讲座",
          room: "A01-0101",
          teacher: "李教授",
          day: 6,
          startPeriod: 1,
          endPeriod: 1,
          startWeek: 1,
          endWeek: 16,
          weeks: [6],
          weekType: "all"
        });
        // 2. 冲突课程 A (周六 10月10日 10:10 第3-4节 高等数学)
        state.courses.push({
          id: "test_c_math",
          name: "高等数学",
          room: "A03-0201",
          teacher: "张教授",
          day: 6,
          startPeriod: 3,
          endPeriod: 4,
          startWeek: 1,
          endWeek: 16,
          weeks: [6],
          weekType: "all"
        });
        // 3. 冲突课程 B (周六 10月10日 10:10 第3-4节 材料分析测试)
        state.courses.push({
          id: "test_c_material",
          name: "材料分析测试",
          room: "A05-0402",
          teacher: "王副教授",
          day: 6,
          startPeriod: 3,
          endPeriod: 4,
          startWeek: 1,
          endWeek: 16,
          weeks: [6],
          weekType: "all"
        });
        // 4. 175分钟超大课 (周六 14:30-18:20 4节连上 综合实训)
        state.courses.push({
          id: "test_c_175m",
          name: "软件工程综合实训与课程设计",
          room: "工程实训中心B区",
          teacher: "实验团队",
          day: 6,
          startPeriod: 5,
          endPeriod: 8,
          startWeek: 1,
          endWeek: 16,
          weeks: [6],
          weekType: "all"
        });
        saveCourses();
        calculateActualWeek();
        state.currentWeek = 6;
        setupDropdown();
        renderWeekHeader();
        renderGrid();
        renderCourseManagementList();
        el.settingsModal.classList.add('hidden');
      });
    }

    el.resetDemoBtn.addEventListener('click', () => {
      if (confirm('确定要恢复示例课表吗？当前修改将被重置。')) {
        state.courses = [...DEMO_COURSES];
        saveCourses();
        calculateActualWeek();
        const maxWeek = getMaxWeek();
        if (state.currentWeek > maxWeek) {
          state.currentWeek = maxWeek;
        }
        setupDropdown();
        renderWeekHeader();
        renderGrid();
        renderCourseManagementList();
        el.settingsModal.classList.add('hidden');
      }
    });

    el.clearAllBtn.addEventListener('click', () => {
      if (confirm('确定要清空全部课表数据吗？此操作无法撤销。')) {
        state.courses = [];
        saveCourses();
        calculateActualWeek();
        state.currentWeek = 1;
        setupDropdown();
        renderWeekHeader();
        renderGrid();
        renderCourseManagementList();
        el.settingsModal.classList.add('hidden');
      }
    });

    el.courseStartPeriod.addEventListener('change', () => {
      const start = parseInt(el.courseStartPeriod.value, 10);
      const end = parseInt(el.courseEndPeriod.value, 10);
      if (end < start) {
        el.courseEndPeriod.value = start;
      }
    });

    el.courseEndPeriod.addEventListener('change', () => {
      const start = parseInt(el.courseStartPeriod.value, 10);
      const end = parseInt(el.courseEndPeriod.value, 10);
      if (end < start) {
        el.courseStartPeriod.value = end;
      }
    });
  }

  function changeWeek(week) {
    const maxWeek = getMaxWeek();
    if (week < 1 || week > maxWeek) return;
    state.currentWeek = week;
    const isThisWeek = week === state.actualWeek;
    el.currentWeekLabel.textContent = `第 ${week} 周${isThisWeek ? ' (本周)' : ''}`;

    // 悬浮翻周按钮防出界透明度指示
    if (el.floatPrevWeekBtn) el.floatPrevWeekBtn.style.opacity = (week <= 1) ? '0.35' : '0.88';
    if (el.floatNextWeekBtn) el.floatNextWeekBtn.style.opacity = (week >= maxWeek) ? '0.35' : '0.88';

    setupDropdown();
    renderWeekHeader();
    renderGrid();
    checkCurrentClass();
  }

  // ==========================================================================
  // 视图渲染 (极简高效，单层重排)
  // ==========================================================================
  function renderTimeColumn() {
    let html = '';
    let selectOptions = '';
    for (let i = 1; i <= state.totalPeriods; i++) {
      const timeInfo = DEFAULT_TIMES[i - 1] || { start: `P${i}`, end: '' };
      html += `
        <div class="time-slot" data-period="${i}">
          <span class="period-num">${i}</span>
          <span class="slot-start">${timeInfo.start}</span>
          <span class="slot-end">${timeInfo.end}</span>
        </div>
      `;
      selectOptions += `<option value="${i}">第 ${i} 节</option>`;
    }
    el.timeColumn.innerHTML = html;
    el.courseStartPeriod.innerHTML = selectOptions;
    el.courseEndPeriod.innerHTML = selectOptions;
  }

  function renderWeekHeader() {
    if (!state.semesterStartDate) return;
    const [y, m, d] = state.semesterStartDate.split('-').map(Number);
    const startMonday = new Date(y, m - 1, d);
    const targetMonday = new Date(startMonday.getTime() + (state.currentWeek - 1) * 7 * 24 * 60 * 60 * 1000);
    
    el.currentMonthLabel.textContent = `${targetMonday.getMonth() + 1}月`;

    const now = new Date();
    const isCurrentWeekReal = state.currentWeek === state.actualWeek;
    const todayDay = (now.getDay() || 7); // 1-7

    const dayCols = document.querySelectorAll('.day-col');
    dayCols.forEach((col, index) => {
      const dayIndex = index + 1; // 1-7
      const curDate = new Date(targetMonday.getTime() + index * 24 * 60 * 60 * 1000);
      const mStr = String(curDate.getMonth() + 1).padStart(2, '0');
      const dStr = String(curDate.getDate()).padStart(2, '0');
      const dateText = `${mStr}-${dStr}`;
      const dateSpan = col.querySelector('.day-date');
      if (dateSpan) dateSpan.textContent = dateText;

      if (isCurrentWeekReal && dayIndex === todayDay) {
        col.classList.add('today');
      } else {
        col.classList.remove('today');
      }
    });
  }

  // 判断指定课程在某一特定周是否有效 (支持不连续周次数组与单双周)
  function isCourseInWeek(course, week) {
    if (Array.isArray(course.weeks) && course.weeks.length > 0) {
      return course.weeks.includes(week);
    }
    const inWeekRange = week >= course.startWeek && week <= course.endWeek;
    if (course.weekType === 'odd') return inWeekRange && week % 2 !== 0;
    if (course.weekType === 'even') return inWeekRange && week % 2 === 0;
    return inWeekRange;
  }

  // 计算某天内所有待渲染课程的并列布局 (处理时间重叠冲突及并列分栏)
  function computeDayCourseLayout(coursesToRender) {
    if (!coursesToRender || coursesToRender.length === 0) return [];

    // 1. 过滤并计算有效范围与跨度
    const validItems = coursesToRender
      .map(item => {
        const endPeriod = Math.min(item.course.endPeriod, state.totalPeriods);
        const span = endPeriod - item.course.startPeriod + 1;
        return {
          ...item,
          start: item.course.startPeriod,
          end: endPeriod,
          span
        };
      })
      .filter(item => item.span > 0);

    // 按起始节次升序排序，相同起始节次则按跨度降序
    validItems.sort((a, b) => (a.start - b.start) || (b.span - a.span));

    // 2. 划分为连通重叠群组 (Connected Overlap Clusters)
    const clusters = [];
    validItems.forEach(item => {
      let targetCluster = null;
      for (const cluster of clusters) {
        const overlaps = cluster.some(c => 
          Math.max(c.start, item.start) <= Math.min(c.end, item.end)
        );
        if (overlaps) {
          targetCluster = cluster;
          break;
        }
      }
      if (targetCluster) {
        targetCluster.push(item);
      } else {
        clusters.push([item]);
      }
    });

    // 3. 对每个群组使用贪心染色分配列索引
    const result = [];
    clusters.forEach(cluster => {
      const columns = [];
      cluster.forEach(item => {
        let assignedCol = -1;
        for (let colIdx = 0; colIdx < columns.length; colIdx++) {
          const colCourses = columns[colIdx];
          const hasConflict = colCourses.some(c => 
            Math.max(c.start, item.start) <= Math.min(c.end, item.end)
          );
          if (!hasConflict) {
            assignedCol = colIdx;
            colCourses.push(item);
            break;
          }
        }
        if (assignedCol === -1) {
          assignedCol = columns.length;
          columns.push([item]);
        }
        item.colIndex = assignedCol;
      });

      const totalCols = columns.length;
      cluster.forEach(item => {
        item.totalCols = totalCols;
        result.push(item);
      });
    });

    return result;
  }

  function renderGrid() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const palette = isDark ? DARK_COLOR_PALETTE : COLOR_PALETTE;

    let columnsHtml = '';
    for (let day = 1; day <= 7; day++) {
      let cellsHtml = '';
      for (let p = 1; p <= state.totalPeriods; p++) {
        cellsHtml += `<div class="grid-cell" data-day="${day}" data-period="${p}"></div>`;
      }
      columnsHtml += `<div class="day-grid-column" data-day="${day}">${cellsHtml}</div>`;
    }
    el.daysContainer.innerHTML = columnsHtml;
    // 单击空白处没有任何反应，编辑与添加均集成于右上角菜单与课程详情页
    el.daysContainer.onclick = null;

    const periodHeight = 66;

    for (let day = 1; day <= 7; day++) {
      const col = el.daysContainer.querySelector(`.day-grid-column[data-day="${day}"]`);
      if (!col) continue;

      const dayCourses = state.courses.filter(c => c.day === day && c.startPeriod <= state.totalPeriods);
      const thisWeekCourses = dayCourses.filter(c => isCourseInWeek(c, state.currentWeek));
      const otherCourses = dayCourses.filter(c => !isCourseInWeek(c, state.currentWeek));

      const coursesToRender = [];

      // 1. 本周课程优先全部加入
      thisWeekCourses.forEach(c => {
        coursesToRender.push({ course: c, isThisWeek: true });
      });

      // 2. 只有开启“显示全周”时才补充非本周课程，且无时间冲突时展示
      if (state.showOtherWeeks) {
        otherCourses.forEach(c => {
          const overlapWithThisWeek = thisWeekCourses.some(tw => 
            Math.max(c.startPeriod, tw.startPeriod) <= Math.min(c.endPeriod, tw.endPeriod)
          );
          if (!overlapWithThisWeek) {
            const overlapWithAddedOther = coursesToRender.some(item => 
              !item.isThisWeek && Math.max(c.startPeriod, item.course.startPeriod) <= Math.min(c.endPeriod, item.course.endPeriod)
            );
            if (!overlapWithAddedOther) {
              coursesToRender.push({ course: c, isThisWeek: false });
            }
          }
        });
      }

      // 3. 计算并列分栏布局并渲染卡片
      const layoutItems = computeDayCourseLayout(coursesToRender);

      layoutItems.forEach(item => {
        const { course, isThisWeek, colIndex, totalCols, span, end: endPeriod } = item;
        const top = (course.startPeriod - 1) * periodHeight;
        const height = span * periodHeight - 4;

        const colorIndex = Math.abs(hashString(course.name)) % palette.length;
        const themeColors = palette[colorIndex];

        const startTime = DEFAULT_TIMES[course.startPeriod - 1]?.start || '';
        const endTime = DEFAULT_TIMES[endPeriod - 1]?.end || '';
        const timeStr = `${startTime}-${endTime}`;

        const cleanRoom = (course.room || '')
          .replace(/\(本部\)/g, '')
          .replace(/（本部）/g, '')
          .trim();

        const card = document.createElement('div');
        const isSplit = totalCols > 1;
        card.className = `course-card ${!isThisWeek ? 'not-this-week' : ''} ${isSplit ? 'split-card' : ''}`;
        card.dataset.id = course.id;
        card.dataset.day = course.day;
        card.dataset.startPeriod = course.startPeriod;
        card.dataset.endPeriod = endPeriod;
        card.dataset.span = span;

        card.style.top = `${top + 2}px`;
        card.style.height = `${height}px`;

        if (isSplit) {
          const widthPercent = 100 / totalCols;
          const leftPercent = colIndex * widthPercent;
          card.style.width = `calc(${widthPercent}% - 2px)`;
          card.style.left = `calc(${leftPercent}% + 1px)`;
          card.style.right = 'auto';
        } else {
          card.style.left = '1.5px';
          card.style.right = '1.5px';
          card.style.width = 'auto';
        }

        card.style.backgroundColor = isThisWeek ? themeColors.bg : (isDark ? '#2a2f3a' : '#eaedf2');
        card.style.border = isThisWeek ? 'none' : '1px dashed #cbd5e1';

        let notWeekTip = '';
        if (!isThisWeek) {
          notWeekTip = `<div style="font-size: 8px; opacity: 0.85; margin-bottom: 2px;">(非本周)</div>`;
        }

        let conflictBadge = '';
        if (isSplit) {
          conflictBadge = `<div class="conflict-mini-badge" title="该时间段有重叠课程">重叠</div>`;
        }

        card.innerHTML = `
          ${conflictBadge}
          <div class="course-card-body">
            <div class="course-card-title">${escapeHtml(course.name)}</div>
            ${notWeekTip}
            ${cleanRoom ? `<div class="course-card-room">${escapeHtml(cleanRoom)}</div>` : ''}
          </div>
          <div class="course-card-time">${timeStr}</div>
        `;

        // 点击卡片直接进入课程详情页 (详情页内已提供专用编辑/修改按钮)
        card.addEventListener('click', (e) => {
          e.stopPropagation();
          openCourseDetail(course);
        });

        col.appendChild(card);
      });
    }

    checkCurrentClass();
  }

  function checkCurrentClass() {
    document.querySelectorAll('.course-card.current-class').forEach(c => c.classList.remove('current-class'));

    const now = new Date();
    const today = (now.getDay() || 7);
    const nowTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (state.currentWeek === state.actualWeek) {
      let activePeriod = -1;
      for (let i = 0; i < state.totalPeriods; i++) {
        const slot = DEFAULT_TIMES[i];
        if (slot && nowTimeStr >= slot.start && nowTimeStr <= slot.end) {
          activePeriod = i + 1;
          break;
        }
      }

      if (activePeriod !== -1) {
        const todayCards = document.querySelectorAll(`.day-grid-column[data-day="${today}"] .course-card:not(.not-this-week)`);
        todayCards.forEach(card => {
          const start = parseInt(card.dataset.startPeriod, 10);
          const end = parseInt(card.dataset.endPeriod, 10);
          if (activePeriod >= start && activePeriod <= end) {
            card.classList.add('current-class');
          }
        });
      }
    }

    // 课前10分钟即时消息与弹窗提醒轮询检查
    checkUpcomingCourseReminder(now, today);
  }

  // ==========================================================================
  // 课前10分钟提醒与手机系统日程表管理 (超高性能、零后台常驻、随时开关/一键清空)
  // ==========================================================================
  function hasNativeBridge() {
    return typeof window.AndroidBridge !== 'undefined' && window.AndroidBridge !== null;
  }

  function updateNativeAlarmsIfEnabled() {
    if (hasNativeBridge()) {
      try {
        if (state.classReminderEnabled) {
          window.AndroidBridge.setAlarmReminders(true, JSON.stringify(state.courses), state.semesterStartDate);
        }
      } catch (e) {
        console.error('updateNativeAlarms error:', e);
      }
    }
  }

  function updateCalendarBadgeUI() {
    if (!el.calendarStatusBadge) return;
    if (hasNativeBridge()) {
      try {
        const actualCount = window.AndroidBridge.getCalendarEventCount();
        if (actualCount > 0) {
          state.calendarSynced = true;
          state.calendarSyncCount = actualCount;
        } else {
          state.calendarSynced = false;
          state.calendarSyncCount = 0;
        }
      } catch (e) {
        console.error('getCalendarEventCount error:', e);
      }
    }

    if (state.calendarSynced && state.calendarSyncCount > 0) {
      el.calendarStatusBadge.className = 'calendar-badge synced';
      el.calendarStatusBadge.textContent = `已同步 (${state.calendarSyncCount}节)`;
    } else {
      el.calendarStatusBadge.className = 'calendar-badge un-synced';
      el.calendarStatusBadge.textContent = '未同步';
    }
  }

  function handleReminderToggle() {
    state.classReminderEnabled = el.classReminderSwitch.checked;
    saveSettings();

    if (state.classReminderEnabled) {
      if (hasNativeBridge()) {
        try {
          if (!window.AndroidBridge.hasNotificationPermission()) {
            window.AndroidBridge.requestNotificationPermission();
          }
          const resStr = window.AndroidBridge.setAlarmReminders(true, JSON.stringify(state.courses), state.semesterStartDate);
          const res = JSON.parse(resStr);
          if (window.AndroidBridge.showToast) {
            window.AndroidBridge.showToast(res.message || '已开启课前10分钟提醒');
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }
    } else {
      if (hasNativeBridge()) {
        try {
          const resStr = window.AndroidBridge.setAlarmReminders(false, "[]", state.semesterStartDate);
          const res = JSON.parse(resStr);
          if (window.AndroidBridge.showToast) {
            window.AndroidBridge.showToast(res.message || '已关闭课前10分钟提醒');
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  function handleTestReminder() {
    const testCourse = (state.courses && state.courses.length > 0) ? state.courses[0] : {
      name: '高等数学 (上)',
      room: '教1-101',
      teacher: '张教授',
      startPeriod: 1
    };

    showReminderBanner(testCourse, 10);

    const cleanRoom = (testCourse.room || '')
      .replace(/\(本部\)/g, '')
      .replace(/（本部）/g, '')
      .trim();

    if (hasNativeBridge()) {
      try {
        if (!window.AndroidBridge.hasNotificationPermission()) {
          window.AndroidBridge.requestNotificationPermission();
        }
        window.AndroidBridge.postHeadsUpNotification(
          testCourse.name,
          cleanRoom || '教1-101',
          testCourse.teacher || '任课教师',
          DEFAULT_TIMES[testCourse.startPeriod - 1]?.start || '08:00'
        );
        if (window.AndroidBridge.showToast) {
          window.AndroidBridge.showToast('已弹出课前提醒测试通知');
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(`🔔 课前 10 分钟提醒: ${testCourse.name}`, {
            body: `地点: ${cleanRoom || '教1-101'} | 教师: ${testCourse.teacher || '任课教师'} | 时间: ${DEFAULT_TIMES[testCourse.startPeriod - 1]?.start || '08:00'}`
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(p => {
            if (p === 'granted') {
              new Notification(`🔔 课前 10 分钟提醒: ${testCourse.name}`, {
                body: `地点: ${cleanRoom || '教1-101'} | 教师: ${testCourse.teacher || '任课教师'} | 时间: ${DEFAULT_TIMES[testCourse.startPeriod - 1]?.start || '08:00'}`
              });
            }
          });
        }
      }
    }
  }

  function handleCalendarSync() {
    if (!state.courses.length) {
      alert('课表为空，无法同步到手机日程表。');
      return;
    }

    if (hasNativeBridge()) {
      try {
        if (!window.AndroidBridge.hasCalendarPermission()) {
          window.AndroidBridge.requestCalendarPermission();
          alert('请在随后弹出的系统权限对话框中允许“日历”权限，然后再点击写入。');
          return;
        }

        const resStr = window.AndroidBridge.syncCoursesToCalendar(JSON.stringify(state.courses), state.semesterStartDate);
        const res = JSON.parse(resStr);
        if (res.success) {
          state.calendarSynced = true;
          state.calendarSyncCount = res.count || 0;
          saveSettings();
          updateCalendarBadgeUI();
          if (window.AndroidBridge.showToast) {
            window.AndroidBridge.showToast(`成功写入 ${res.count} 条日程并设10分钟提醒！`);
          } else {
            alert(res.message);
          }
        } else {
          alert('写入失败: ' + (res.message || '未知原因'));
        }
      } catch (e) {
        alert('写入系统日历异常: ' + e.message);
      }
    } else {
      if (confirm('当前在网页环境运行，无法直接写入手机原生日历。\n是否导出标准 .ics 日历文件，由系统日历一键导入？')) {
        exportIcs();
      }
    }
  }

  function handleCalendarClear() {
    if (hasNativeBridge()) {
      try {
        if (!window.AndroidBridge.hasCalendarPermission()) {
          window.AndroidBridge.requestCalendarPermission();
          alert('请在随后弹出的系统权限对话框中允许“日历”权限。');
          return;
        }

        if (!confirm('确定要从手机系统日程表中一键清除所有已写入的课程日程吗？')) {
          return;
        }

        const resStr = window.AndroidBridge.clearCalendarCourses();
        const res = JSON.parse(resStr);
        if (res.success) {
          state.calendarSynced = false;
          state.calendarSyncCount = 0;
          saveSettings();
          updateCalendarBadgeUI();
          if (window.AndroidBridge.showToast) {
            window.AndroidBridge.showToast(res.message || '已清空课表系统日程');
          } else {
            alert(res.message);
          }
        } else {
          alert('清除失败: ' + (res.message || '未知原因'));
        }
      } catch (e) {
        alert('清除系统日历异常: ' + e.message);
      }
    } else {
      state.calendarSynced = false;
      state.calendarSyncCount = 0;
      saveSettings();
      updateCalendarBadgeUI();
      alert('已重置日程同步状态。');
    }
  }

  let reminderBannerTimeout = null;
  let activeBannerCourse = null;

  function showReminderBanner(course, minutesLeft) {
    if (!el.classReminderBanner) return;
    activeBannerCourse = course;
    const title = minutesLeft <= 1 ? `🔔 即将上课: ${course.name}` : `🔔 课前 ${minutesLeft} 分钟提醒: ${course.name}`;
    const cleanRoom = (course.room || '')
      .replace(/\(本部\)/g, '')
      .replace(/（本部）/g, '')
      .trim();
    const desc = `地点: ${cleanRoom || '未定地点'} | 教师: ${course.teacher || '任课教师'}`;

    el.reminderBannerTitle.textContent = title;
    el.reminderBannerDesc.textContent = desc;
    el.classReminderBanner.classList.remove('hidden');

    if (reminderBannerTimeout) clearTimeout(reminderBannerTimeout);
    // 自动展示 12 秒后淡出收起
    reminderBannerTimeout = setTimeout(() => {
      hideReminderBanner();
    }, 12000);
  }

  function hideReminderBanner() {
    if (el.classReminderBanner) {
      el.classReminderBanner.classList.add('hidden');
    }
    activeBannerCourse = null;
  }

  function checkUpcomingCourseReminder(now, today) {
    if (!state.classReminderEnabled) return;
    if (!state.courses || state.courses.length === 0) return;

    const currentActualWeek = state.actualWeek;
    const todayCourses = state.courses.filter(c => {
      if (c.day !== today) return false;
      return isCourseInWeek(c, currentActualWeek);
    });

    if (todayCourses.length === 0) return;

    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    for (const course of todayCourses) {
      const startSlot = DEFAULT_TIMES[course.startPeriod - 1];
      if (!startSlot) continue;

      const [startH, startM] = startSlot.start.split(':').map(Number);
      const classStartMinutes = startH * 60 + startM;
      const diffMinutes = classStartMinutes - nowMinutes;

      // 课前 10 分钟内 (0 <= diffMinutes <= 10)
      if (diffMinutes >= 0 && diffMinutes <= 10) {
        const reminderKey = `${course.id}_${today}_w${currentActualWeek}_p${course.startPeriod}_${now.toDateString()}`;
        if (state.lastRemindedCourseKey === reminderKey) {
          continue; // 本节课本次课前已经提醒过，不重复弹窗
        }

        state.lastRemindedCourseKey = reminderKey;

        // 1. 弹出应用内顶部浮动横幅提醒
        showReminderBanner(course, diffMinutes);

        // 2. 原生通知栏弹窗提醒 (Native Heads-Up Notification)
        const cleanRoom = (course.room || '')
          .replace(/\(本部\)/g, '')
          .replace(/（本部）/g, '')
          .trim();

        if (hasNativeBridge()) {
          try {
            window.AndroidBridge.postHeadsUpNotification(
              course.name,
              cleanRoom || '未定地点',
              course.teacher || '任课教师',
              startSlot.start
            );
          } catch (e) {
            console.error('postHeadsUpNotification error:', e);
          }
        } else if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`🔔 课前 10 分钟提醒: ${course.name}`, {
              body: `地点: ${cleanRoom || '未定'} | 教师: ${course.teacher || '未定'} | 时间: ${startSlot.start}`
            });
          } catch (e) {}
        }
        break;
      }
    }
  }

  // ==========================================================================
  // 课程详情页 (对标示例参考图)
  // ==========================================================================
  let currentDetailCourse = null;

  function openCourseDetail(course) {
    if (!course) return;
    currentDetailCourse = course;

    el.detailCourseName.textContent = course.name || '未命名课程';

    const cleanRoom = (course.room || '')
      .replace(/\(本部\)/g, '')
      .replace(/（本部）/g, '')
      .trim();
    el.detailCourseRoom.textContent = cleanRoom || '未指定教室';

    el.detailCoursePeriods.textContent = `${course.startPeriod}-${course.endPeriod}节`;

    const startTime = DEFAULT_TIMES[course.startPeriod - 1]?.start || '';
    const endTime = DEFAULT_TIMES[course.endPeriod - 1]?.end || '';
    el.detailCourseTime.textContent = (startTime && endTime) ? `${startTime} - ${endTime}` : '未指定';

    el.detailCourseTeacher.textContent = course.teacher || '未注明';
    el.detailCourseClass.textContent = course.className || '计算机科学2601班(示例)';

    let weeksText = '';
    if (course.weeksDisplay) {
      weeksText = course.weeksDisplay;
    } else if (Array.isArray(course.weeks) && course.weeks.length > 0) {
      weeksText = `${Math.min(...course.weeks)}-${Math.max(...course.weeks)}周`;
    } else {
      weeksText = `${course.startWeek || 1}-${course.endWeek || 16}周`;
    }
    el.detailCourseWeeksText.textContent = weeksText;

    renderDetailWeekBubbles(course);
    renderConflictNotice(course);

    if (!history.state || history.state.modal !== 'detail') {
      history.pushState({ modal: 'detail' }, '');
    }
    el.courseDetailModal.classList.remove('hidden');
  }

  function renderConflictNotice(course) {
    if (!el.detailConflictBox) return;
    const conflicting = state.courses.filter(c => 
      c.id !== course.id &&
      c.day === course.day &&
      isCourseInWeek(c, state.currentWeek) &&
      Math.max(c.startPeriod, course.startPeriod) <= Math.min(c.endPeriod, course.endPeriod)
    );

    if (conflicting.length === 0) {
      el.detailConflictBox.classList.add('hidden');
      el.detailConflictBox.innerHTML = '';
      return;
    }

    let pillsHtml = '';
    conflicting.forEach(c => {
      const cleanRoom = (c.room || '').replace(/\(本部\)/g, '').replace(/（本部）/g, '').trim();
      pillsHtml += `
        <button type="button" class="conflict-pill-btn" data-id="${escapeHtml(c.id)}">
          <span>${escapeHtml(c.name)}</span>
          <span class="pill-meta">${c.startPeriod}-${c.endPeriod}节 ${cleanRoom ? '· ' + escapeHtml(cleanRoom) : ''}</span>
        </button>
      `;
    });

    el.detailConflictBox.innerHTML = `
      <div class="conflict-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59f00" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span class="conflict-title">注意：本时间段存在冲突重叠课程</span>
      </div>
      <div class="conflict-desc">当前时段同时安排了以下课程，点击可直接切换查看：</div>
      <div class="conflict-pills">${pillsHtml}</div>
    `;
    el.detailConflictBox.classList.remove('hidden');

    el.detailConflictBox.querySelectorAll('.conflict-pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = btn.dataset.id;
        const targetCourse = state.courses.find(c => c.id === targetId);
        if (targetCourse) {
          openCourseDetail(targetCourse);
        }
      });
    });
  }

  function renderDetailWeekBubbles(course) {
    const courseWeeks = Array.isArray(course.weeks) && course.weeks.length > 0
      ? [...course.weeks].sort((a, b) => a - b)
      : [];

    if (courseWeeks.length === 0) {
      const s = course.startWeek || 1;
      const e = course.endWeek || 16;
      for (let w = s; w <= e; w++) {
        if (course.weekType === 'odd' && w % 2 === 0) continue;
        if (course.weekType === 'even' && w % 2 !== 0) continue;
        courseWeeks.push(w);
      }
    }

    let html = '';
    courseWeeks.forEach(w => {
      const isCurrent = (w === state.currentWeek);
      html += `<div class="week-bubble ${isCurrent ? 'active' : ''}" data-week="${w}">${w}</div>`;
    });

    el.detailWeeksGrid.innerHTML = html;

    // 点击周次圆圈气泡可快速切换至该周并回到课表
    el.detailWeeksGrid.querySelectorAll('.week-bubble').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetWeek = parseInt(btn.dataset.week, 10);
        closeCourseDetail();
        changeWeek(targetWeek);
      });
    });
  }

  function closeCourseDetail() {
    el.courseDetailModal.classList.add('hidden');
    currentDetailCourse = null;
  }

  // ==========================================================================
  // 课程管理中心 (集中在右上角菜单中)
  // ==========================================================================
  function renderCourseManagementList() {
    if (!el.courseManagementList) return;
    if (!state.courses || state.courses.length === 0) {
      el.courseManagementList.innerHTML = '<div style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 14px;">暂无任何课程，点击上方按钮添加</div>';
      return;
    }

    const dayNames = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const sorted = [...state.courses].sort((a, b) => (a.day - b.day) || (a.startPeriod - b.startPeriod));

    function hasWeekOverlap(c1, c2) {
      const w1 = Array.isArray(c1.weeks) && c1.weeks.length > 0 ? c1.weeks : null;
      const w2 = Array.isArray(c2.weeks) && c2.weeks.length > 0 ? c2.weeks : null;
      if (w1 && w2) {
        return w1.some(w => w2.includes(w));
      }
      const s1 = c1.startWeek || 1, e1 = c1.endWeek || 16;
      const s2 = c2.startWeek || 1, e2 = c2.endWeek || 16;
      return Math.max(s1, s2) <= Math.min(e1, e2);
    }

    let html = '';
    sorted.forEach(c => {
      const dayStr = dayNames[c.day] || `周${c.day}`;
      const periodStr = `第${c.startPeriod}-${c.endPeriod}节`;
      const cleanRoom = (c.room || '').replace(/\(本部\)/g, '').replace(/（本部）/g, '').trim();
      const metaParts = [dayStr, periodStr];
      if (cleanRoom) metaParts.push(cleanRoom);
      if (c.teacher) metaParts.push(c.teacher);

      const hasConflict = state.courses.some(other => 
        other.id !== c.id &&
        other.day === c.day &&
        Math.max(c.startPeriod, other.startPeriod) <= Math.min(c.endPeriod, other.endPeriod) &&
        hasWeekOverlap(c, other)
      );
      const conflictTag = hasConflict ? `<span class="course-conflict-tag">⚠️ 时段重叠</span>` : '';

      html += `
        <div class="course-manage-item">
          <div class="course-manage-info">
            <div class="course-manage-name" title="${escapeHtml(c.name)}">${escapeHtml(c.name)}${conflictTag}</div>
            <div class="course-manage-meta">${escapeHtml(metaParts.join(' · '))}</div>
          </div>
          <button type="button" class="course-manage-btn" data-id="${escapeHtml(c.id)}">编辑</button>
        </div>
      `;
    });
    el.courseManagementList.innerHTML = html;

    el.courseManagementList.querySelectorAll('.course-manage-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const courseId = btn.dataset.id;
        const target = state.courses.find(c => c.id === courseId);
        if (target) {
          el.settingsModal.classList.add('hidden');
          openCourseModal(target);
        }
      });
    });
  }

  // ==========================================================================
  // 课程编辑/添加模态框
  // ==========================================================================
  function openCourseModal(course, defaultDay, defaultPeriod, skipPushState) {
    if (!skipPushState) {
      history.pushState({ modal: 'course' }, '');
    }
    if (course) {
      el.modalTitle.textContent = '编辑课程';
      el.courseId.value = course.id;
      el.courseName.value = course.name;
      el.courseRoom.value = course.room || '';
      el.courseTeacher.value = course.teacher || '';
      el.courseDay.value = course.day;
      el.courseStartPeriod.value = course.startPeriod;
      el.courseEndPeriod.value = course.endPeriod;
      el.courseStartWeek.value = course.startWeek || 1;
      el.courseEndWeek.value = course.endWeek || 16;
      el.courseWeekType.value = course.weekType || 'all';
      el.deleteCourseBtn.classList.remove('hidden');
    } else {
      el.modalTitle.textContent = '添加课程';
      el.courseId.value = '';
      el.courseName.value = '';
      el.courseRoom.value = '';
      el.courseTeacher.value = '';
      el.courseDay.value = defaultDay || 1;
      el.courseStartPeriod.value = defaultPeriod || 1;
      el.courseEndPeriod.value = defaultPeriod ? Math.min(defaultPeriod + 1, state.totalPeriods) : 2;
      el.courseStartWeek.value = 1;
      el.courseEndWeek.value = 16;
      el.courseWeekType.value = 'all';
      el.deleteCourseBtn.classList.add('hidden');
    }
    el.courseModal.classList.remove('hidden');
    el.courseName.focus();
  }

  function closeCourseModal() {
    if (history.state && history.state.modal === 'course') {
      history.back();
    } else {
      el.courseModal.classList.add('hidden');
    }
  }

  function saveCourseHandler() {
    const name = el.courseName.value.trim();
    if (!name) return;

    const id = el.courseId.value || 'c_' + Date.now();
    const day = parseInt(el.courseDay.value, 10);
    const startPeriod = parseInt(el.courseStartPeriod.value, 10);
    const endPeriod = parseInt(el.courseEndPeriod.value, 10);
    const startWeek = parseInt(el.courseStartWeek.value, 10) || 1;
    const endWeek = parseInt(el.courseEndWeek.value, 10) || 16;
    const weekType = el.courseWeekType.value;
    const room = el.courseRoom.value.trim();
    const teacher = el.courseTeacher.value.trim();

    // 生成连续周数列表
    const weeks = [];
    for (let w = startWeek; w <= endWeek; w++) {
      if (weekType === 'odd' && w % 2 === 0) continue;
      if (weekType === 'even' && w % 2 !== 0) continue;
      weeks.push(w);
    }

    const courseData = {
      id,
      name,
      room,
      teacher,
      day,
      startPeriod,
      endPeriod,
      startWeek,
      endWeek,
      weekType,
      weeks
    };

    const existingIndex = state.courses.findIndex(c => c.id === id);
    if (existingIndex >= 0) {
      state.courses[existingIndex] = courseData;
    } else {
      state.courses.push(courseData);
    }

    saveCourses();
    const maxWeek = getMaxWeek();
    if (state.currentWeek > maxWeek) {
      state.currentWeek = maxWeek;
    }
    setupDropdown();
    renderWeekHeader();
    renderGrid();
    renderCourseManagementList();
    closeCourseModal();
  }

  function deleteCourseHandler() {
    const id = el.courseId.value;
    if (!id) return;
    if (confirm('确定删除该课程吗？')) {
      state.courses = state.courses.filter(c => c.id !== id);
      saveCourses();
      const maxWeek = getMaxWeek();
      if (state.currentWeek > maxWeek) {
        state.currentWeek = maxWeek;
      }
      setupDropdown();
      renderWeekHeader();
      renderGrid();
      renderCourseManagementList();
      closeCourseModal();
    }
  }

  // ==========================================================================
  // 数据导入/导出 (JSON & iCalendar .ics & 教务系统 .xls 解析器)
  // ==========================================================================
  function exportJson() {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      student: {
        name: '示例学生',
        studentId: '2026001001'
      },
      settings: {
        semesterStartDate: state.semesterStartDate,
        totalPeriods: state.totalPeriods
      },
      courses: state.courses
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `课表备份_${state.semesterStartDate}.json`);
  }

  function importJson(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed.courses)) {
          state.courses = parsed.courses;
          if (parsed.settings) {
            if (parsed.settings.semesterStartDate) state.semesterStartDate = parsed.settings.semesterStartDate;
            if (parsed.settings.totalPeriods) state.totalPeriods = parsed.settings.totalPeriods;
            saveSettings();
          }
          saveCourses();
          calculateActualWeek();
          const maxWeek = getMaxWeek();
          if (state.currentWeek > maxWeek) {
            state.currentWeek = maxWeek;
          }
          setupDropdown();
          renderTimeColumn();
          renderWeekHeader();
          renderGrid();
          renderCourseManagementList();
          el.settingsModal.classList.add('hidden');
          alert(`课表导入成功！课表截止至第 ${maxWeek} 周。`);
        } else {
          alert('文件格式错误：未找到有效的课程列表。');
        }
      } catch (err) {
        alert('解析 JSON 失败：' + err.message);
      }
      el.importFileInput.value = '';
    };
    reader.readAsText(file);
  }

  // ==========================================================================
  // 二进制 Excel 97-2003 (BIFF8 / OLE2) 原生零依赖极速解析引擎 (<10ms 零依赖)
  // ==========================================================================
  function parseBinaryXlsBuffer(arrayBuffer) {
    const data = new Uint8Array(arrayBuffer);
    const view = new DataView(arrayBuffer);

    if (data.length < 512 || view.getUint32(0, true) !== 0xE011CFD0 || view.getUint32(4, true) !== 0xE11AB1A1) {
      throw new Error('Not an OLE2 binary XLS file');
    }

    const sectorSize = 1 << view.getUint16(30, true);
    const dirFirstSector = view.getUint32(48, true);

    const fatSectors = [];
    for (let i = 0; i < 109; i++) {
      const sec = view.getUint32(76 + i * 4, true);
      if (sec === 0xFFFFFFFE || sec === 0xFFFFFFFF) break;
      fatSectors.push(sec);
    }

    const fat = [];
    for (const sec of fatSectors) {
      const offset = (sec + 1) * sectorSize;
      for (let i = 0; i < sectorSize; i += 4) {
        fat.push(view.getUint32(offset + i, true));
      }
    }

    function getStreamData(startSector, size) {
      let sec = startSector;
      const result = new Uint8Array(size);
      let written = 0;
      while (sec !== 0xFFFFFFFE && sec !== 0xFFFFFFFF && written < size) {
        const offset = (sec + 1) * sectorSize;
        const len = Math.min(sectorSize, size - written);
        result.set(data.subarray(offset, offset + len), written);
        written += len;
        sec = fat[sec];
      }
      return result;
    }

    let dirSec = dirFirstSector;
    const dirChunks = [];
    let totalDirSize = 0;
    while (dirSec !== 0xFFFFFFFE && dirSec !== 0xFFFFFFFF) {
      const offset = (dirSec + 1) * sectorSize;
      dirChunks.push(data.subarray(offset, offset + sectorSize));
      totalDirSize += sectorSize;
      dirSec = fat[dirSec];
    }
    const dirBuffer = new Uint8Array(totalDirSize);
    let dOff = 0;
    for (const ch of dirChunks) {
      dirBuffer.set(ch, dOff);
      dOff += ch.length;
    }
    const dirView = new DataView(dirBuffer.buffer, dirBuffer.byteOffset, dirBuffer.byteLength);

    let workbookSector = -1;
    let workbookSize = 0;
    const decUtf16 = new TextDecoder('utf-16le');

    for (let i = 0; i < dirBuffer.length; i += 128) {
      const nameLen = dirView.getUint16(i + 64, true);
      if (nameLen === 0) continue;
      const name = decUtf16.decode(dirBuffer.subarray(i, i + nameLen - 2));
      const startSec = dirView.getUint32(i + 116, true);
      const size = dirView.getUint32(i + 120, true);

      if (name.toLowerCase() === 'workbook' || name.toLowerCase() === 'book') {
        workbookSector = startSec;
        workbookSize = size;
        break;
      }
    }

    if (workbookSector === -1) {
      throw new Error('未在 XLS 文件中找到 Workbook 数据流');
    }

    const wbBytes = getStreamData(workbookSector, workbookSize);
    const wbView = new DataView(wbBytes.buffer, wbBytes.byteOffset, wbBytes.byteLength);

    let pos = 0;
    const sst = [];
    const cells = {};
    let maxRow = 0;
    let maxCol = 0;

    while (pos < wbBytes.length - 4) {
      const recType = wbView.getUint16(pos, true);
      const recLen = wbView.getUint16(pos + 2, true);
      pos += 4;

      if (pos + recLen > wbBytes.length) break;

      if (recType === 0x00FC) { // SST
        parseSSTBrowser(wbBytes, wbView, pos, recLen, sst);
      } else if (recType === 0x00FD) { // LABELSST
        const row = wbView.getUint16(pos, true);
        const col = wbView.getUint16(pos + 2, true);
        const sstIdx = wbView.getUint32(pos + 6, true);
        if (sst[sstIdx] !== undefined) {
          cells[`${row}_${col}`] = sst[sstIdx];
          if (row > maxRow) maxRow = row;
          if (col > maxCol) maxCol = col;
        }
      } else if (recType === 0x0204) { // LABEL
        const row = wbView.getUint16(pos, true);
        const col = wbView.getUint16(pos + 2, true);
        const cch = wbView.getUint16(pos + 6, true);
        const grbit = wbBytes[pos + 8];
        const isUnicode = (grbit & 0x01) !== 0;
        let str = '';
        if (isUnicode) {
          str = decUtf16.decode(wbBytes.subarray(pos + 9, pos + 9 + cch * 2));
        } else {
          str = new TextDecoder('latin1').decode(wbBytes.subarray(pos + 9, pos + 9 + cch));
        }
        cells[`${row}_${col}`] = str;
        if (row > maxRow) maxRow = row;
        if (col > maxCol) maxCol = col;
      } else if (recType === 0x0203) { // NUMBER
        const row = wbView.getUint16(pos, true);
        const col = wbView.getUint16(pos + 2, true);
        const val = wbView.getFloat64(pos + 6, true);
        cells[`${row}_${col}`] = String(val);
        if (row > maxRow) maxRow = row;
        if (col > maxCol) maxCol = col;
      } else if (recType === 0x027E) { // RK
        const row = wbView.getUint16(pos, true);
        const col = wbView.getUint16(pos + 2, true);
        const rk = wbView.getUint32(pos + 6, true);
        cells[`${row}_${col}`] = String(decodeRKVal(rk));
        if (row > maxRow) maxRow = row;
        if (col > maxCol) maxCol = col;
      } else if (recType === 0x00BD) { // MULRK
        const row = wbView.getUint16(pos, true);
        const colFirst = wbView.getUint16(pos + 2, true);
        const colLast = wbView.getUint16(pos + recLen - 2, true);
        let rkPos = pos + 4;
        for (let c = colFirst; c <= colLast; c++) {
          const rk = wbView.getUint32(rkPos + 2, true);
          cells[`${row}_${c}`] = String(decodeRKVal(rk));
          if (row > maxRow) maxRow = row;
          if (c > maxCol) maxCol = c;
          rkPos += 6;
        }
      }

      pos += recLen;
    }

    const rows = [];
    for (let r = 0; r <= maxRow; r++) {
      const row = [];
      for (let c = 0; c <= maxCol; c++) {
        row.push(cells[`${r}_${c}`] || '');
      }
      rows.push(row);
    }
    return rows;
  }

  function decodeRKVal(rk) {
    let val = 0;
    if (rk & 0x02) {
      val = rk >> 2;
    } else {
      const b = new ArrayBuffer(8);
      const v = new DataView(b);
      v.setUint32(4, rk & 0xFFFFFFFC, true);
      val = v.getFloat64(0, true);
    }
    if (rk & 0x01) val /= 100;
    return val;
  }

  function parseSSTBrowser(wbBytes, wbView, startPos, recLen, sstList) {
    const chunks = [wbBytes.subarray(startPos, startPos + recLen)];
    let lookPos = startPos + recLen;
    while (lookPos < wbBytes.length - 4 && wbView.getUint16(lookPos, true) === 0x003C) { // CONTINUE
      const contLen = wbView.getUint16(lookPos + 2, true);
      chunks.push(wbBytes.subarray(lookPos + 4, lookPos + 4 + contLen));
      lookPos += 4 + contLen;
    }

    let totalLen = 0;
    for (const ch of chunks) totalLen += ch.length;
    const full = new Uint8Array(totalLen);
    let off = 0;
    for (const ch of chunks) {
      full.set(ch, off);
      off += ch.length;
    }
    const fullView = new DataView(full.buffer, full.byteOffset, full.byteLength);

    let p = 8;
    const decUtf16 = new TextDecoder('utf-16le');
    const decLatin1 = new TextDecoder('latin1');

    while (p < full.length - 3) {
      const cch = fullView.getUint16(p, true);
      const grbit = full[p + 2];
      p += 3;

      const isUnicode = (grbit & 0x01) !== 0;
      const hasRichText = (grbit & 0x08) !== 0;
      const hasFarEast = (grbit & 0x04) !== 0;

      let cRun = 0;
      let cbExtRst = 0;
      if (hasRichText) {
        cRun = fullView.getUint16(p, true);
        p += 2;
      }
      if (hasFarEast) {
        cbExtRst = fullView.getUint32(p, true);
        p += 4;
      }

      let str = '';
      if (isUnicode) {
        const byteLen = cch * 2;
        if (p + byteLen <= full.length) {
          str = decUtf16.decode(full.subarray(p, p + byteLen));
          p += byteLen;
        }
      } else {
        const byteLen = cch;
        if (p + byteLen <= full.length) {
          str = decLatin1.decode(full.subarray(p, p + byteLen));
          p += byteLen;
        }
      }

      if (hasRichText) p += cRun * 4;
      if (hasFarEast) p += cbExtRst;

      sstList.push(str);
    }
  }

  // 解析高校教务系统导出的 .xls (BIFF8 二进制 / HTML / CSV) / .csv / 纯文本课表
  function handleXlsUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target.result;
        const view = new DataView(buffer);

        // 检测是否为真实二进制 Excel 97-2003 (BIFF8 OLE2 复合文档, 魔数: D0 CF 11 E0 A1 B1 1A E1)
        if (buffer.byteLength >= 8 && view.getUint32(0, true) === 0xE011CFD0 && view.getUint32(4, true) === 0xE11AB1A1) {
          const rows = parseBinaryXlsBuffer(buffer);
          applyParsedData(parseUniversalRows(rows));
          return;
        }

        let text = '';
        try {
          text = new TextDecoder('utf-8').decode(buffer);
          if (text.includes('\uFFFD')) {
            text = new TextDecoder('gbk').decode(buffer);
          }
        } catch (decErr) {
          try {
            text = new TextDecoder('gbk').decode(buffer);
          } catch (e2) {
            text = new TextDecoder().decode(buffer);
          }
        }

        applyParsedTimetableContent(text);
      } catch (err) {
        alert('解析课表文件出错：' + err.message);
      } finally {
        el.importXlsFileInput.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function applyParsedTimetableContent(rawContent) {
    if (!rawContent || !rawContent.trim()) {
      alert('课表内容为空');
      return;
    }

    try {
      const parsedData = parseUniversalTimetable(rawContent);
      applyParsedData(parsedData);
    } catch (err) {
      alert('解析课表出错：' + err.message);
    }
  }

  function applyParsedData({ courses: parsedCourses, detectedTimes }) {
    if (!parsedCourses || parsedCourses.length === 0) {
      alert('未在内容中解析出有效课程，请检查文件格式。');
      return;
    }

    // 1. 如果解析出高校作息时间，自动适配作息表
    if (detectedTimes && detectedTimes.length > 0) {
      detectedTimes.forEach(t => {
        if (t.period >= 1 && t.period <= DEFAULT_TIMES.length) {
          const p1 = t.period;
          const p2 = t.period + 1;
          const [sH, sM] = t.start.split(':').map(Number);
          const [eH, eM] = t.end.split(':').map(Number);
          const totalDuration = (eH * 60 + eM) - (sH * 60 + sM);
          if (totalDuration > 60 && p2 <= DEFAULT_TIMES.length) {
            const mid = Math.round(totalDuration / 2);
            const midH = Math.floor((sH * 60 + sM + mid) / 60);
            const midM = (sH * 60 + sM + mid) % 60;
            const midStr = `${String(midH).padStart(2, '0')}:${String(midM).padStart(2, '0')}`;
            DEFAULT_TIMES[p1 - 1] = { start: t.start, end: midStr };
            DEFAULT_TIMES[p2 - 1] = { start: midStr, end: t.end };
          } else {
            DEFAULT_TIMES[p1 - 1] = { start: t.start, end: t.end };
          }
        }
      });
    }

    // 2. 自动检测最大节数
    let maxPeriod = 11;
    parsedCourses.forEach(c => {
      if (c.endPeriod) maxPeriod = Math.max(maxPeriod, c.endPeriod);
    });
    if (maxPeriod > state.totalPeriods) {
      state.totalPeriods = Math.min(14, maxPeriod);
      el.totalPeriodsSelect.value = state.totalPeriods;
    }

    state.courses = parsedCourses;
    saveCourses();
    saveSettings();
    calculateActualWeek();
    const maxWeek = getMaxWeek();
    if (state.currentWeek > maxWeek) {
      state.currentWeek = maxWeek;
    }
    setupDropdown();
    renderTimeColumn();
    renderWeekHeader();
    renderGrid();
    renderCourseManagementList();
    if (el.pasteModal) el.pasteModal.classList.add('hidden');
    el.settingsModal.classList.add('hidden');
    alert(`成功解析并导入 ${parsedCourses.length} 门课程！课表截止至第 ${maxWeek} 周。`);
  }

  function parseUniversalTimetable(rawContent) {
    let rows = [];

    // 1. 如果包含 HTML 表格标记，使用 DOMParser 提取表格行
    if (/<table|<tr|<html/i.test(rawContent)) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawContent, 'text/html');

      const table = doc.getElementById('manualArrangeCourseTable') || doc.querySelector('table.gridtable') || doc.querySelector('table');
      if (table) {
        const trs = Array.from(table.querySelectorAll('tr'));
        let hasPeriodFirstCol = false;
        for (const tr of trs) {
          const firstTd = tr.querySelector('td,th');
          if (firstTd && /第([一二三四五六七八九十0-9]+)节/.test(firstTd.textContent)) {
            hasPeriodFirstCol = true;
            break;
          }
        }

        if (hasPeriodFirstCol) {
          return { courses: parseUniversityHtmlTable(doc, table), detectedTimes: [] };
        }

        for (const tr of trs) {
          const cells = Array.from(tr.querySelectorAll('td,th')).map(c => {
            return c.innerHTML
              .replace(/<br[^>]*>/gi, '\n')
              .replace(/<[^>]+>/g, '')
              .replace(/&nbsp;/gi, ' ')
              .replace(/&amp;/gi, '&')
              .replace(/&lt;/gi, '<')
              .replace(/&gt;/gi, '>')
              .trim();
          });
          if (cells.length > 0) rows.push(cells);
        }
      }
    }

    // 2. 如果不是 HTML 或 HTML 中没有找到传统结构，按 CSV / TSV 格式解析
    if (rows.length === 0) {
      const tabCount = (rawContent.match(/\t/g) || []).length;
      const commaCount = (rawContent.match(/,/g) || []).length;
      if (tabCount > commaCount && tabCount > 10) {
        rows = rawContent.split(/\r?\n/).map(line => line.split('\t').map(c => c.trim().replace(/^["']|["']$/g, '')));
      } else {
        rows = parseCsvRows(rawContent);
      }
    }

    return parseUniversalRows(rows);
  }

  function parseUniversalRows(rows) {
    // 3. 定位星期一至星期日所在表头行
    let headerRowIndex = -1;
    const dayColMap = {}; // colIndex -> day (1-7)

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      let found = false;
      row.forEach((cell, c) => {
        const t = (cell || '').trim();
        if (/星期一|周一/.test(t)) { dayColMap[c] = 1; found = true; }
        else if (/星期二|周二/.test(t)) { dayColMap[c] = 2; found = true; }
        else if (/星期三|周三/.test(t)) { dayColMap[c] = 3; found = true; }
        else if (/星期四|周四/.test(t)) { dayColMap[c] = 4; found = true; }
        else if (/星期五|周五/.test(t)) { dayColMap[c] = 5; found = true; }
        else if (/星期六|周六/.test(t)) { dayColMap[c] = 6; found = true; }
        else if (/星期日|星期天|周日/.test(t)) { dayColMap[c] = 7; found = true; }
      });
      if (found) {
        headerRowIndex = r;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error('未在课表中识别到包含“星期一至星期日”的列头结构，请确认导出的表格包含星期标识。');
    }

    const detectedTimes = [];
    const courses = [];

    for (let r = headerRowIndex + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      // 过滤备注/说明行
      const rowText = row.join(' ');
      if (/^[,，\s]*备注/.test(rowText) || (row[0] && row[0].includes('备注')) || (row[1] && row[1].includes('备注'))) {
        continue;
      }

      // 默认节次按行递增 (每大节占2小节: 1-2, 3-4, 5-6, 7-8, 9-10, 11-12)
      let defaultStart = (r - headerRowIndex) * 2 - 1;
      let defaultEnd = defaultStart + 1;

      // 扫描非星期列，提取节次或时间信息
      for (let c = 0; c < row.length; c++) {
        if (dayColMap[c]) continue;
        const cell = (row[c] || '').trim();
        const pMatch = cell.match(/第?(\d+)(?:-(\d+))?节/);
        if (pMatch) {
          defaultStart = parseInt(pMatch[1], 10);
          defaultEnd = pMatch[2] ? parseInt(pMatch[2], 10) : defaultStart;
        }

        // 扫描作息时间如 "8:20 9:50" 或 "8:20-9:50"
        const timeMatch = cell.match(/(\d{1,2}:\d{2})[\s\n\r\-至~]+(\d{1,2}:\d{2})/);
        if (timeMatch) {
          const sTime = timeMatch[1].padStart(5, '0');
          const eTime = timeMatch[2].padStart(5, '0');
          detectedTimes.push({ period: defaultStart, start: sTime, end: eTime });
        }
      }

      // 遍历各个星期列提取课程
      for (const [colIdxStr, day] of Object.entries(dayColMap)) {
        const colIdx = parseInt(colIdxStr, 10);
        const cell = row[colIdx];
        if (cell && cell.trim()) {
          const cellCourses = parseCellCourses(cell, day, defaultStart, defaultEnd);
          courses.push(...cellCourses);
        }
      }
    }

    return { courses, detectedTimes };
  }

  function parseCsvRows(text) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentCell);
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell);
      rows.push(currentRow);
    }
    return rows;
  }

  function parseWeeksList(weekStr) {
    let clean = weekStr.replace(/[\[\]周\s]/g, '');
    const isOdd = clean.includes('单');
    const isEven = clean.includes('双');
    clean = clean.replace(/[()（）单双]/g, '');

    const weeks = [];
    const parts = clean.split(/[,，]/);
    for (const part of parts) {
      if (!part) continue;
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let w = start; w <= end; w++) {
            if (isOdd && w % 2 === 0) continue;
            if (isEven && w % 2 !== 0) continue;
            weeks.push(w);
          }
        }
      } else {
        const w = parseInt(part, 10);
        if (!isNaN(w)) {
          if (isOdd && w % 2 === 0) continue;
          if (isEven && w % 2 !== 0) continue;
          weeks.push(w);
        }
      }
    }
    return [...new Set(weeks)].sort((a, b) => a - b);
  }

  function parseCellCourses(cellText, day, defaultStartPeriod, defaultEndPeriod) {
    if (!cellText || !cellText.trim()) return [];

    let text = cellText
      .replace(/\.\.\.查看全部/g, '')
      .replace(/查看全部/g, '')
      .trim();

    if (!text) return [];

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    const weekRegex = /\[([\d,\-，\s]+周(?:[()（）单双])?)\]/;
    const courses = [];
    let currentCourseLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      currentCourseLines.push(line);

      if (weekRegex.test(line)) {
        const course = buildCourseFromBlock(currentCourseLines, day, defaultStartPeriod, defaultEndPeriod);
        if (course) courses.push(course);
        currentCourseLines = [];
      }
    }

    if (currentCourseLines.length > 0) {
      const course = buildCourseFromBlock(currentCourseLines, day, defaultStartPeriod, defaultEndPeriod);
      if (course && course.name && course.weeks.length > 0) courses.push(course);
    }

    return courses;
  }

  function buildCourseFromBlock(lines, day, defaultStartPeriod, defaultEndPeriod) {
    if (!lines || lines.length === 0) return null;

    let name = '';
    let teacher = '';
    let room = '';
    let weeks = [];
    let startPeriod = defaultStartPeriod;
    let endPeriod = defaultEndPeriod;

    let weekLineIndex = lines.findIndex(l => /\[.*周.*\]/.test(l));

    if (weekLineIndex !== -1) {
      const weekLine = lines[weekLineIndex];
      const weekMatch = weekLine.match(/\[([\d,\-，\s]+周(?:[()（）单双])?)\]/);
      if (weekMatch) {
        weeks = parseWeeksList(weekMatch[1]);
      }

      const periodMatch = weekLine.match(/\[(\d+)(?:-(\d+))?节\]/);
      if (periodMatch) {
        startPeriod = parseInt(periodMatch[1], 10);
        endPeriod = periodMatch[2] ? parseInt(periodMatch[2], 10) : startPeriod;
      }

      const beforeLines = lines.slice(0, weekLineIndex);
      if (beforeLines.length >= 1) {
        name = beforeLines[0].replace(/[-_]$/, '').trim();
      }
      if (beforeLines.length === 2) {
        const l = beforeLines[1];
        if (/[\d号楼室区馆堂场]/.test(l)) {
          room = l;
        } else {
          teacher = l;
        }
      } else if (beforeLines.length >= 3) {
        teacher = beforeLines[1];
        room = beforeLines.slice(2).join(' ');
      }
    } else {
      name = lines[0].replace(/[-_]$/, '').trim();
      if (lines.length > 1) teacher = lines[1];
      if (lines.length > 2) room = lines[2];
      weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    }

    if (!name) return null;

    const startWeek = weeks.length > 0 ? Math.min(...weeks) : 1;
    const endWeek = weeks.length > 0 ? Math.max(...weeks) : 16;

    return {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name,
      teacher: teacher,
      room: room,
      day: day,
      startPeriod: startPeriod,
      endPeriod: endPeriod,
      startWeek: startWeek,
      endWeek: endWeek,
      weeks: weeks,
      weekType: 'all'
    };
  }

  function parseUniversityHtmlTable(doc, table) {
    const rows = table.querySelectorAll('tr');
    const courses = [];
    const gridOccupied = {}; // Tracks rowspan: key `${day}_${period}`

    let currentPeriod = 0;

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const thOrTds = Array.from(row.children);
      if (thOrTds.length === 0) continue;

      // 检查第一列是否指示节次
      const firstCellText = thOrTds[0].textContent.trim();
      const periodMatch = firstCellText.match(/第([一二三四五六七八九十0-9]+)节/);
      if (periodMatch) {
        currentPeriod = chineseNumberToInt(periodMatch[1]);
      } else {
        continue;
      }

      let colPtr = 1; // 星期一对应 1
      for (let c = 1; c < thOrTds.length; c++) {
        while (gridOccupied[`${colPtr}_${currentPeriod}`]) {
          colPtr++;
        }
        if (colPtr > 7) break;

        const cell = thOrTds[c];
        const rowspan = parseInt(cell.getAttribute('rowspan') || '1', 10);
        const cellText = cell.innerHTML.trim();

        if (rowspan > 1) {
          for (let p = 0; p < rowspan; p++) {
            gridOccupied[`${colPtr}_${currentPeriod + p}`] = true;
          }
        }

        if (cellText && !cellText.match(/^[\s\n\r]*$/)) {
          const items = parseCellCourseText(cellText, colPtr, currentPeriod, currentPeriod + rowspan - 1);
          courses.push(...items);
        }

        colPtr++;
      }
    }

    return courses;
  }

  function parseCellCourseText(htmlContent, day, startPeriod, endPeriod) {
    // 文本格式如: 课程名 (代码) \n (教师) \n ([1-4],[6-8] A05-0404(本部))
    const cleanLines = htmlContent
      .replace(/<br[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const result = [];
    let i = 0;
    while (i < cleanLines.length) {
      const line = cleanLines[i];
      // 提取课程名称 (去掉代码括号)
      const courseName = line.replace(/\([^)]*\)/g, '').trim();
      i++;

      let teacher = '';
      if (i < cleanLines.length && cleanLines[i].startsWith('(') && !cleanLines[i].includes('-') && !cleanLines[i].includes('停课')) {
        teacher = cleanLines[i].replace(/[()]/g, '').trim();
        i++;
      }

      // 提取周次与地点
      let weeks = [];
      let room = '';
      let isHalt = false;

      while (i < cleanLines.length) {
        const nextLine = cleanLines[i];
        if (nextLine.includes('停课')) {
          isHalt = true;
          i++;
          continue;
        }

        if (nextLine.startsWith('(') && (nextLine.includes('[') || nextLine.match(/\d+/))) {
          const inner = nextLine.replace(/[()]/g, '').trim();
          const parts = inner.split(/\s+/);
          const weekPart = parts[0];
          room = parts.slice(1).join(' ');

          weeks = parseWeekRangeString(weekPart);
          i++;
          break;
        }
        break;
      }

      if (courseName && !isHalt) {
        const startWeek = weeks.length > 0 ? Math.min(...weeks) : 1;
        const endWeek = weeks.length > 0 ? Math.max(...weeks) : 16;

        result.push({
          id: `imp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: courseName,
          room: room,
          teacher: teacher,
          day: day,
          startPeriod: startPeriod,
          endPeriod: endPeriod,
          startWeek: startWeek,
          endWeek: endWeek,
          weeks: weeks.length > 0 ? weeks : [startWeek, endWeek],
          weekType: 'all'
        });
      }
    }

    return result;
  }

  function parseWeekRangeString(str) {
    const weeks = [];
    const matches = str.match(/\[?(\d+)(?:-(\d+))?\]?/g);
    if (matches) {
      matches.forEach(m => {
        const parts = m.replace(/[\[\]]/g, '').split('-').map(Number);
        if (parts.length === 1) {
          weeks.push(parts[0]);
        } else if (parts.length === 2) {
          for (let w = parts[0]; w <= parts[1]; w++) {
            weeks.push(w);
          }
        }
      });
    }
    return [...new Set(weeks)].sort((a, b) => a - b);
  }

  function chineseNumberToInt(cn) {
    const map = {
      '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
      '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
      '十一': 11, '十二': 12, '十三': 13, '十四': 14
    };
    if (map[cn]) return map[cn];
    const n = parseInt(cn, 10);
    return isNaN(n) ? 1 : n;
  }

  function exportIcs() {
    if (!state.courses.length) {
      alert('课表为空，无法导出。');
      return;
    }

    const [y, m, d] = state.semesterStartDate.split('-').map(Number);
    const startMonday = new Date(y, m - 1, d);

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MinimalTimetable//CN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:大学课程表'
    ];

    state.courses.forEach(course => {
      const startTime = DEFAULT_TIMES[course.startPeriod - 1]?.start || '08:00';
      const endTime = DEFAULT_TIMES[course.endPeriod - 1]?.end || '09:40';

      const targetWeeks = Array.isArray(course.weeks) && course.weeks.length > 0
        ? course.weeks
        : Array.from({ length: course.endWeek - course.startWeek + 1 }, (_, i) => course.startWeek + i);

      targetWeeks.forEach(w => {
        if (course.weekType === 'odd' && w % 2 === 0) return;
        if (course.weekType === 'even' && w % 2 !== 0) return;

        const dayOffset = (w - 1) * 7 + (course.day - 1);
        const courseDate = new Date(startMonday.getTime() + dayOffset * 24 * 60 * 60 * 1000);

        const [startH, startM] = startTime.split(':');
        const [endH, endM] = endTime.split(':');

        const dtStart = formatIcsDate(new Date(courseDate.getFullYear(), courseDate.getMonth(), courseDate.getDate(), parseInt(startH, 10), parseInt(startM, 10)));
        const dtEnd = formatIcsDate(new Date(courseDate.getFullYear(), courseDate.getMonth(), courseDate.getDate(), parseInt(endH, 10), parseInt(endM, 10)));

        icsContent.push('BEGIN:VEVENT');
        icsContent.push(`SUMMARY:${course.name}`);
        if (course.room) icsContent.push(`LOCATION:${course.room}`);
        icsContent.push(`DESCRIPTION:第${w}周 | 教师: ${course.teacher || '无'}`);
        icsContent.push(`DTSTART:${dtStart}`);
        icsContent.push(`DTEND:${dtEnd}`);
        icsContent.push(`UID:${course.id}_w${w}_${Date.now()}@minimaltimetable.app`);
        icsContent.push('END:VEVENT');
      });
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    downloadBlob(blob, `大学课表_${state.semesterStartDate}.ics`);
  }

  function formatIcsDate(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => {
      switch (m) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        default: return m;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
