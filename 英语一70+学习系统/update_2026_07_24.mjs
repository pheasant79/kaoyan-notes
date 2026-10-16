import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = path.resolve(
  "D:/24213/Documents/考研/outputs/english70_study_system/考研英语一70+学习追踪表.xlsx",
);
const outputDir = path.dirname(workbookPath);
const input = await FileBlob.load(workbookPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const daily = workbook.worksheets.getItem("每日记录");
const mistakes = workbook.worksheets.getItem("错题诊断");

const today = new Date("2026-07-24T00:00:00");
const article = "扇贝阅读《Does Grass Scream When You Mow It Down?》";

// Daily row: workbook was generated from 2026-07-23, so 2026-07-24 is row 3.
daily.getRange("C3:Q3").values = [[
  `${article}：基础阅读题 4/9，错题 3/4/6/7/8`,
  "",
  "",
  "",
  "扇贝阅读",
  "趣闻 / 四级 / 496词 / Does Grass Scream When You Mow It Down?",
  4 / 9,
  "",
  "",
  "",
  "",
  "",
  "",
  "进行中",
  "复盘第3/4/6/7/8题；明天继续1篇分级阅读+1句长难句",
]];

const existing = mistakes.getRange("C2:C300").values;
let startOffset = existing.findIndex((row) => !row[0]);
if (startOffset < 0) startOffset = existing.length;
const startRow = startOffset + 2;

const rows = [
  [
    today,
    article,
    "第3题",
    "C",
    "B",
    "airborne mix of carbon-based compounds called green leaf volatiles, or GLVs",
    "被后文 insects / tobacco plant / caterpillar 例子带跑，把例子当成定义。",
    "定位错",
    "定义题要回到第一次解释概念的句子。",
    "What are X? 先找 X 第一次出现或被解释的位置。",
    "未重做",
  ],
  [
    today,
    article,
    "第4题",
    "D",
    "A",
    "some are a form of defence；后面 tobacco plant 例子证明这一点。",
    "看到 lawnmower / caterpillar / insect 后误以为题目在比较危险来源。",
    "逻辑错",
    "例子不是主旨本身，例子通常服务于前一句观点。",
    "Why mention example? 往前找观点句。",
    "未重做",
  ],
  [
    today,
    article,
    "第6题",
    "D",
    "C",
    "due to the sheer amount of grass being cut by a lawnmower, the smell is much more intense",
    "按感觉把 intense 猜成 strange，没有结合前后因果。",
    "单词不会",
    "intense = strong / severe / extreme，表示强烈的、剧烈的。",
    "词义题用语境：大量草被割 -> 气味更强。",
    "未重做",
  ],
  [
    today,
    article,
    "第7题",
    "D",
    "A",
    "it reminds our bodies of food；the smell reminding us of our childhoods",
    "把植物释放信号脑补成植物在和人类交流。",
    "逻辑错",
    "推断题不能脑补，只能选原文能支持的内容。",
    "推断题先找原文证据，再排除文章没说的选项。",
    "未重做",
  ],
  [
    today,
    article,
    "第8题",
    "D",
    "C",
    "No Mow May encourages people to cut their lawn a little less, as this can be beneficial to wildlife.",
    "被 remove long grass 这种反向干扰带偏，没抓住 cut less。",
    "句子没读懂",
    "No Mow May 的核心是少割草，从而帮助野生动物。",
    "遇到 less / more / not 等方向词，先画出方向。",
    "未重做",
  ],
];

mistakes.getRange(`A${startRow}:K${startRow + rows.length - 1}`).values = rows;
mistakes.getRange(`A${startRow}:A${startRow + rows.length - 1}`).setNumberFormat("yyyy-mm-dd");
mistakes.getRange(`A${startRow}:K${startRow + rows.length - 1}`).format.wrapText = true;
mistakes.getRange(`A${startRow}:K${startRow + rows.length - 1}`).format.autofitRows();

const check = await workbook.inspect({
  kind: "table",
  range: `错题诊断!A${startRow}:K${startRow + rows.length - 1}`,
  include: "values",
  tableMaxRows: 10,
  tableMaxCols: 11,
  maxChars: 6000,
});
console.log(check.ndjson);

const dailyCheck = await workbook.inspect({
  kind: "table",
  range: "每日记录!A3:Q3",
  include: "values,formulas",
  tableMaxRows: 3,
  tableMaxCols: 17,
  maxChars: 3000,
});
console.log(dailyCheck.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan after 2026-07-24 update",
});
console.log(errors.ndjson);

const preview = await workbook.render({
  sheetName: "错题诊断",
  range: `A1:K${startRow + rows.length - 1}`,
  scale: 1,
  format: "png",
});
await fs.writeFile(
  path.join(outputDir, "错题诊断_2026-07-24更新.png"),
  new Uint8Array(await preview.arrayBuffer()),
);

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(workbookPath);
console.log(workbookPath);
