import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, "..", "outputs", "english70_study_system");
await fs.mkdir(outputDir, { recursive: true });

const workbook = Workbook.create();

const colors = {
  navy: "#23415A",
  teal: "#2A9D8F",
  amber: "#E9C46A",
  coral: "#E76F51",
  ink: "#1F2933",
  paleBlue: "#E8F1F8",
  paleTeal: "#E8F6F3",
  paleAmber: "#FFF6DA",
  line: "#D8DEE8",
  white: "#FFFFFF",
  gray: "#F6F7F9",
};

function styleTitle(sheet, range, title) {
  const r = sheet.getRange(range);
  r.values = [[title]];
  r.format = {
    fill: colors.navy,
    font: { bold: true, color: colors.white, size: 16 },
    wrapText: true,
  };
}

function styleHeader(range, fill = colors.teal) {
  range.format = {
    fill,
    font: { bold: true, color: colors.white },
    borders: { preset: "outside", style: "thin", color: colors.line },
    wrapText: true,
  };
}

function styleBlock(range, fill = colors.gray) {
  range.format = {
    fill,
    borders: { preset: "outside", style: "thin", color: colors.line },
    wrapText: true,
  };
}

function setWidths(sheet, widths, rowCount = 120) {
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, rowCount, 1).format.columnWidth = width;
  });
}

function freezeTop(sheet) {
  sheet.freezePanes.freezeRows(1);
  sheet.showGridLines = false;
}

function dateRange(start, end) {
  const dates = [];
  const current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function stageForDate(d) {
  const t = d.getTime();
  if (t <= new Date("2026-10-31").getTime()) return "基础修复期";
  if (t <= new Date("2027-03-31").getTime()) return "旧真题入门期";
  if (t <= new Date("2027-08-31").getTime()) return "真题强化期";
  if (t <= new Date("2027-11-30").getTime()) return "整套训练期";
  return "冲刺期";
}

const overview = workbook.worksheets.add("总览");
overview.showGridLines = false;
styleTitle(overview, "A1:H1", "考研英语一 70+ 学习总览");
overview.getRange("A3:H3").values = [["目标", "当前定位", "主线", "每日底线", "阶段", "下一步", "题源原则", "提醒"]];
styleHeader(overview.getRange("A3:H3"), colors.navy);
overview.getRange("A4:H4").values = [[
  "英语一 70+",
  "四级未过；语法有基础；词汇遗忘明显；阅读未系统做真题",
  "真题语境单词 → 句子拆解 → 阅读理解 → 错题复盘 → 作文/翻译/新题型补齐",
  "每天 2 小时以上，每周 6 天以上",
  "2026.7-2026.10 基础修复期",
  "先做 1 篇旧年阅读基线测试",
  "真题练命题逻辑；分级阅读练量；AI 题只辅助理解",
  "前 3 个月不追求速度，先追求读懂和能解释错因",
]];
styleBlock(overview.getRange("A4:H4"), colors.paleBlue);
overview.getRange("A6:D6").values = [["指标", "公式/记录", "目标", "备注"]];
styleHeader(overview.getRange("A6:D6"));
overview.getRange("A7:D14").values = [
  ["累计学习天数", "=COUNTIF('每日记录'!P2:P600,\"完成\")", "每周 6 天以上", "状态列填“完成”才计入"],
  ["累计学习分钟", "=SUM('每日记录'!O2:O600)", "长期稳定大于短期爆发", "总分钟来自每日记录"],
  ["真题阅读篇数", "=COUNTIF('每日记录'!K2:K600,\"?*\")", "先旧年后 2010 年后", "只统计填了年份/Text 的行"],
  ["平均阅读正确数", "=IFERROR(AVERAGEIF('每日记录'!L2:L600,\">0\",'每日记录'!L2:L600),\"\")", "先稳定 3/5，再冲 4/5", "不要用蒙题成绩骗自己"],
  ["累计生词数", "=COUNTIF('真题词表'!C2:C400,\"?*\")", "只记影响理解的词", "不要把词表变成垃圾桶"],
  ["累计长难句", "=COUNTIF('长难句拆解'!C2:C300,\"?*\")", "每天 1-2 句", "优先拆真题句"],
  ["累计错题", "=COUNTIF('错题诊断'!C2:C300,\"?*\")", "每错必归因", "错因四类：单词/句子/定位/逻辑"],
  ["基线状态", "=IF(COUNTIF('基线测试'!B4:B11,\"?*\")>0,\"已开始\",\"未开始\")", "先做 1 篇", "不查词、计时"],
];
styleBlock(overview.getRange("A7:D14"), colors.paleTeal);
overview.getRange("B7:B14").format.numberFormat = "#,##0.0";
setWidths(overview, [18, 28, 28, 40, 24, 24, 32, 36], 20);
overview.getRange("A1:H1").merge();
overview.getRange("A4:H4").format.rowHeight = 80;

const daily = workbook.worksheets.add("每日记录");
freezeTop(daily);
const dailyHeaders = [
  "日期", "阶段", "今日主任务", "扇贝分钟", "真题词表分钟", "分级阅读分钟", "分级平台",
  "等级/文章", "分级正确率", "真题阅读分钟", "真题年份/Text", "阅读正确数(0-5)",
  "长难句数量", "错题复盘数", "总分钟", "状态", "明日动作"
];
daily.getRange("A1:Q1").values = [dailyHeaders];
styleHeader(daily.getRange("A1:Q1"), colors.navy);
const dates = dateRange("2026-07-23", "2027-12-20");
const dailyRows = dates.map((d) => [
  d,
  stageForDate(d),
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
]);
daily.getRangeByIndexes(1, 0, dailyRows.length, dailyHeaders.length).values = dailyRows;
daily.getRange(`O2:O${dailyRows.length + 1}`).formulas = dailyRows.map((_, i) => {
  const row = i + 2;
  return [`=SUM(D${row}:F${row},J${row},M${row}:N${row})`];
});
daily.getRange(`A2:A${dailyRows.length + 1}`).setNumberFormat("yyyy-mm-dd");
daily.getRange(`I2:I${dailyRows.length + 1}`).setNumberFormat("0%");
daily.getRange(`O2:O${dailyRows.length + 1}`).setNumberFormat("0");
daily.dataValidations.add({ range: `G2:G${dailyRows.length + 1}`, rule: { type: "list", values: ["ReadTheory", "British Council", "VOA", "真题", "其他"] } });
daily.dataValidations.add({ range: `L2:L${dailyRows.length + 1}`, rule: { type: "whole", operator: "between", formula1: 0, formula2: 5 } });
daily.dataValidations.add({ range: `P2:P${dailyRows.length + 1}`, rule: { type: "list", values: ["未开始", "进行中", "完成", "中断", "补做"] } });
styleBlock(daily.getRange(`A2:Q${dailyRows.length + 1}`), colors.white);
setWidths(daily, [13, 16, 28, 11, 13, 13, 16, 24, 12, 13, 18, 14, 12, 12, 10, 12, 30], dailyRows.length + 2);

const vocab = workbook.worksheets.add("真题词表");
freezeTop(vocab);
const vocabHeaders = ["日期", "来源", "单词/短语", "原句", "词义", "熟词僻义/搭配", "影响程度", "复习次数", "下次复习", "状态", "备注"];
vocab.getRange("A1:K1").values = [vocabHeaders];
styleHeader(vocab.getRange("A1:K1"), colors.navy);
styleBlock(vocab.getRange("A2:K400"), colors.white);
vocab.getRange("A2:A400").setNumberFormat("yyyy-mm-dd");
vocab.getRange("I2:I400").setNumberFormat("yyyy-mm-dd");
vocab.dataValidations.add({ range: "G2:G400", rule: { type: "list", values: ["高", "中", "低"] } });
vocab.dataValidations.add({ range: "J2:J400", rule: { type: "list", values: ["陌生", "待复习", "已掌握"] } });
setWidths(vocab, [13, 18, 18, 48, 22, 28, 12, 10, 13, 12, 28], 401);

const sentences = workbook.worksheets.add("长难句拆解");
freezeTop(sentences);
const sentenceHeaders = ["日期", "来源", "原句", "谓语", "连词", "主干", "修饰层级", "直译", "润色翻译", "问题点"];
sentences.getRange("A1:J1").values = [sentenceHeaders];
styleHeader(sentences.getRange("A1:J1"), colors.navy);
styleBlock(sentences.getRange("A2:J300"), colors.white);
sentences.getRange("A2:A300").setNumberFormat("yyyy-mm-dd");
setWidths(sentences, [13, 18, 56, 24, 24, 34, 36, 36, 36, 24], 301);

const mistakes = workbook.worksheets.add("错题诊断");
freezeTop(mistakes);
const mistakeHeaders = ["日期", "来源", "题号", "我的答案", "正确答案", "定位句", "我的答案从哪来", "错因", "教训总结", "下次规则", "是否重做"];
mistakes.getRange("A1:K1").values = [mistakeHeaders];
styleHeader(mistakes.getRange("A1:K1"), colors.navy);
styleBlock(mistakes.getRange("A2:K300"), colors.white);
mistakes.getRange("A2:A300").setNumberFormat("yyyy-mm-dd");
mistakes.dataValidations.add({ range: "H2:H300", rule: { type: "list", values: ["单词不会", "句子没读懂", "定位错", "逻辑错"] } });
mistakes.dataValidations.add({ range: "K2:K300", rule: { type: "list", values: ["未重做", "已重做仍错", "已掌握"] } });
setWidths(mistakes, [13, 18, 12, 10, 10, 44, 36, 14, 36, 36, 14], 301);

const baseline = workbook.worksheets.add("基线测试");
baseline.showGridLines = false;
styleTitle(baseline, "A1:F1", "首次基线测试");
baseline.getRange("A3:F3").values = [["项目", "填写区", "说明", "诊断重点", "给 Codex 的格式", "完成"]];
styleHeader(baseline.getRange("A3:F3"), colors.navy);
baseline.getRange("A4:F11").values = [
  ["材料", "", "建议旧年份英语一阅读 Text1 或 Text2", "不要选最近年份", "", ""],
  ["开始时间", "", "计时，不查词", "观察真实速度", "", ""],
  ["结束时间", "", "记录总用时", "20 分钟内做完不是当前重点", "", ""],
  ["5题答案", "", "例如 A C D B A", "看是否纯蒙", "", ""],
  ["最卡句子", "", "复制或手打原句", "用于长难句拆解", "拆这句：...", ""],
  ["影响理解的词", "", "只记影响理解的词", "用于真题词表", "", ""],
  ["错题记录", "", "每题写为什么选", "用于四步诊断", "2010 Text1 第2题，我的答案是A，正确答案是C。", ""],
  ["结论", "", "单词/句子/定位/逻辑哪个最突出", "决定下一周训练重点", "", ""],
];
styleBlock(baseline.getRange("A4:F11"), colors.paleAmber);
baseline.dataValidations.add({ range: "F4:F11", rule: { type: "list", values: ["未做", "完成"] } });
setWidths(baseline, [16, 28, 36, 28, 44, 12], 20);
baseline.getRange("A1:F1").merge();

const sources = workbook.worksheets.add("题源入口");
sources.showGridLines = false;
styleTitle(sources, "A1:F1", "免费题源和使用方法");
sources.getRange("A3:F3").values = [["层级", "名称", "网址", "怎么用", "难度入口", "注意"]];
styleHeader(sources.getRange("A3:F3"), colors.navy);
sources.getRange("A4:F10").values = [
  ["官方信息", "中国研究生招生信息网", "https://yz.chsi.com.cn/", "查报名、招生和考试相关信息", "不用于刷题", "政策类信息以官方为准"],
  ["官方信息", "中国教育考试网", "https://www.neea.edu.cn/", "查考试机构发布信息", "不用于刷题", "不要用二手截图替代官方信息"],
  ["阅读理解题", "ReadTheory", "https://readtheory.org/", "注册后做自适应阅读题，每天 1-2 篇", "平台自动调难度", "用于量，不替代真题"],
  ["分级精读", "British Council Reading", "https://learnenglish.britishcouncil.org/free-resources/reading", "从 B1 开始，吃力则退 A2，稳定后进 B2", "A1-C1", "每篇要整理词和句子"],
  ["词汇语境", "VOA Learning English", "https://learningenglish.voanews.com/", "每天泛读 1 篇，记录反复出现的词", "Beginning / Intermediate / Advanced", "用于复现词汇，不做考研题感"],
  ["AI辅助", "Codex/ChatGPT", "当前对话", "把文章或错题贴给我出题、拆句、诊断", "按你的材料调整", "AI题只练理解"],
  ["真题核心", "英语一历年真题", "纸质书或可信电子资料", "按年份做题、精读、复盘", "旧年 → 2010年后 → 近年整套", "真题数量有限，要反复吃透"],
];
styleBlock(sources.getRange("A4:F10"), colors.paleTeal);
setWidths(sources, [16, 22, 56, 46, 28, 30], 20);
sources.getRange("A1:F1").merge();

const phases = workbook.worksheets.add("阶段路线");
phases.showGridLines = false;
styleTitle(phases, "A1:H1", "2026.7 - 2027.12 阶段路线");
phases.getRange("A3:H3").values = [["阶段", "时间", "主目标", "每日动作", "每周动作", "阅读目标", "其他题型", "不要做什么"]];
styleHeader(phases.getRange("A3:H3"), colors.navy);
phases.getRange("A4:H8").values = [
  ["基础修复期", "2026.7-2026.10", "从蒙题变成能读懂大意", "扇贝+真题词表；分级阅读；长难句；复盘", "2-3篇旧年真题精读", "不追速度，先读懂", "翻译跟长难句走", "不要沉迷技巧课"],
  ["旧真题入门期", "2026.11-2027.3", "建立真题精读流程", "真题词表；全文精读；错题归因", "每周2-3篇英语一旧年阅读", "能说清正确答案定位", "开始接触新题型结构", "不要刷劣质模拟题"],
  ["真题强化期", "2027.4-2027.8", "阅读正确率进入提分区", "限时做一次，再全文精读", "主刷2010年后阅读", "稳定3/5，冲4/5", "作文开始积累素材", "不要只看解析不复盘"],
  ["整套训练期", "2027.9-2027.11", "把能力变成考场分数", "半套/整套训练；作文模板；翻译", "每周至少1套或半套", "速度和正确率兼顾", "完形、新题型专项", "不要大量输入新材料"],
  ["冲刺期", "2027.12", "稳定输出", "错题重做；作文默写；时间分配", "回顾真题和错题表", "减少低级错", "整卷手感", "停止乱找新题"],
];
styleBlock(phases.getRange("A4:H8"), colors.paleBlue);
setWidths(phases, [16, 18, 28, 40, 32, 28, 26, 28], 20);
phases.getRange("A1:H1").merge();

const templates = workbook.worksheets.add("发给Codex模板");
templates.showGridLines = false;
styleTitle(templates, "A1:F1", "把材料发给 Codex 的固定格式");
templates.getRange("A3:C3").values = [["场景", "直接复制模板", "我会怎么处理"]];
styleHeader(templates.getRange("A3:C3"), colors.navy);
templates.getRange("A4:C8").values = [
  ["拆句子", "拆这句：<英文原句>", "按 找谓语 → 找连词 → 分主从句 → 成分表 → 直译 → 拼接 → 润色 翻译"],
  ["错题诊断", "<年份> Text<编号> 第<题号>题，我的答案是<X>，正确答案是<Y>。原文定位句：<可选>", "按 定位 → 你的答案从哪来 → 错因归类 → 教训总结"],
  ["文章出题", "请根据这篇文章出5道英语一风格英文阅读理解题。现在只给题目和选项，不给答案、解析或定位；等我提交答案后再批改：<文章>", "先出题后批改；检查每题只有一个最佳答案；只当理解训练，不替代真题"],
  ["词表整理", "请从这段英文里整理影响考研阅读理解的词和熟词僻义：<文本>", "生成真题词表记录"],
  ["周复盘", "这是我本周每日记录/错题，请帮我判断下周重点：<记录>", "调整下一周训练重心"],
];
styleBlock(templates.getRange("A4:C8"), colors.paleAmber);
setWidths(templates, [16, 64, 52], 20);
templates.getRange("A1:F1").merge();

for (const sheet of [overview, daily, vocab, sentences, mistakes, baseline, sources, phases, templates]) {
  const used = sheet.getUsedRange();
  used.format.wrapText = true;
  used.format.autofitRows();
}

const check = await workbook.inspect({
  kind: "table",
  range: "总览!A1:H14",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 8,
});
console.log(check.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

for (const sheetName of ["总览", "每日记录", "真题词表", "长难句拆解", "错题诊断", "基线测试", "题源入口", "阶段路线", "发给Codex模板"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(outputDir, `${sheetName}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(path.join(outputDir, "考研英语一70+学习追踪表.xlsx"));
console.log(path.join(outputDir, "考研英语一70+学习追踪表.xlsx"));
