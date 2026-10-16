const fs = require('node:fs');
const path = require('node:path');

const out = path.resolve(process.cwd(), '数据结构/assets/ch02');
fs.mkdirSync(out, { recursive: true });
const C = {
  ink: '#233246', muted: '#596779', line: '#8a97a6', blue: '#2563ab',
  blueBg: '#eaf3ff', green: '#087b58', greenBg: '#e3f5eb',
  red: '#b93648', redBg: '#fff0f1', purple: '#7751a2',
  grayBg: '#f0f2f5', white: '#ffffff'
};
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const text = (x, y, s, size = 20, color = C.ink, anchor = 'start', weight = 400) =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-weight="${weight}">${esc(s)}</text>`;
const rect = (x, y, w, h, fill = C.white, stroke = C.line, dashed = false) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${fill}" stroke="${stroke}" stroke-width="1.6"${dashed ? ' stroke-dasharray="5 4"' : ''}/>`;
const line = (x1, y1, x2, y2, color = C.line, width = 1.4) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"/>`;
const arrow = (d, color = 'blue', dashed = false) =>
  `<path d="${d}" fill="none" stroke="${C[color]}" stroke-width="2.4" marker-end="url(#${color})"${dashed ? ' stroke-dasharray="6 4"' : ''}/>`;
const divider = y => line(28, y, 692, y, '#dce2e9');
function save(name, title, description, h, body) {
  const defs = ['blue', 'green', 'red', 'muted', 'purple'].map(k =>
    `<marker id="${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="${C[k]}"/></marker>`
  ).join('');
  fs.writeFileSync(path.join(out, name),
    `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="${h}" viewBox="0 0 720 ${h}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title><desc id="desc">${esc(description)}</desc>
<defs>${defs}</defs><rect width="720" height="${h}" fill="#fff"/>
<g font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif">${body}</g></svg>\n`, 'utf8');
}
function arrayRow(y, values, { green = [], red = [], stale = [], active = values.length, marks = true } = {}) {
  let s = '';
  values.forEach((v, i) => {
    const unused = i >= active || v === '';
    const color = green.includes(i) ? C.green : red.includes(i) ? C.red : stale.includes(i) || unused ? C.muted : C.blue;
    const fill = green.includes(i) ? C.greenBg : red.includes(i) ? C.redBg : unused ? C.grayBg : C.blueBg;
    s += rect(162 + i * 94, y, 94, 48, fill, color, unused);
    s += text(209 + i * 94, y + 32, v || '空', v ? 23 : 17, color, 'middle', v ? 600 : 400);
    if (marks) s += text(209 + i * 94, y + 72, String(i), 17, C.muted, 'middle');
  });
  if (marks) s += text(90, y + 72, '下标', 17, C.muted);
  return s;
}
function node(x, y, value, { next = '•', prev = '•', color = 'blue', w = 104, h = 46, double = false } = {}) {
  const c = C[color];
  let s = rect(x, y, w, h, C[`${color}Bg`] || C.white, c);
  if (double) {
    s += line(x + w * .29, y, x + w * .29, y + h, c);
    s += line(x + w * .71, y, x + w * .71, y + h, c);
    s += text(x + w * .145, y + 30, prev, 20, c, 'middle');
    s += text(x + w * .5, y + 31, value, 22, c, 'middle', 600);
    s += text(x + w * .855, y + 30, next, 19, c, 'middle');
  } else {
    s += line(x + w * .62, y, x + w * .62, y + h, c);
    s += text(x + w * .31, y + 31, value, 22, c, 'middle', 600);
    s += text(x + w * .81, y + 30, next, 18, c, 'middle');
  }
  return s;
}
function labelPointer(x, y, name, color = 'muted') {
  return text(x, y - 35, name, 18, C[color], 'middle', 600) +
    arrow(`M ${x} ${y - 28} V ${y - 5}`, color);
}

{
  let s = text(30, 36, '先看逻辑次序，再对应存储下标', 22, C.blue, 'start', 600);
  [140, 310, 480].forEach((x, i) => {
    s += rect(x, 74, 100, 54, i === 1 ? C.greenBg : C.blueBg, i === 1 ? C.green : C.blue);
    s += text(x + 50, 110, ['A', 'B', 'C'][i], 25, C.ink, 'middle', 600);
    s += text(x + 50, 188, i + 1, 22, C.ink, 'middle');
    s += text(x + 50, 234, i, 22, C.ink, 'middle');
  });
  s += arrow('M 244 101 H 302') + arrow('M 414 101 H 472');
  s += text(190, 154, 'B 的前驱', 18, C.muted, 'middle');
  s += text(530, 154, 'B 的后继', 18, C.muted, 'middle');
  s += text(30, 188, '位序', 18) + text(30, 234, '数组下标', 18);
  s += divider(258) + text(30, 292, '箭头只表示先后关系；这里还没有选择顺序表或链表。', 18, C.muted);
  save('01-positions.svg', '位序与数组下标', 'A、B、C 的逻辑次序与从零开始的数组下标对应；B 的位序为二，下标为一。', 316, s);
}
{
  const stages = [
    ['① 原表：n = 3，容量 = 5', ['A', 'B', 'C', '', ''], { active: 3 }],
    ['② 先把 C 复制到右边', ['A', 'B', 'C', 'C', ''], { green: [3], stale: [2], active: 3 }],
    ['③ 再把 B 复制到右边', ['A', 'B', 'B', 'C', ''], { green: [2], stale: [1], active: 3 }],
    ['④ 写入 X，n 改为 4', ['A', 'X', 'B', 'C', ''], { green: [1], active: 4 }]
  ];
  let s = '';
  stages.forEach(([label, values, opts], i) => {
    const y = 140 * i;
    if (i) s += divider(y + 4);
    s += text(30, y + 33, label, 20, i ? C.green : C.blue, 'start', 600);
    s += arrayRow(y + 58, values, opts);
    if (i === 1) s += arrow(`M 397 ${y + 54} Q 444 ${y + 17} 491 ${y + 54}`, 'green');
    if (i === 2) s += arrow(`M 303 ${y + 54} Q 350 ${y + 17} 397 ${y + 54}`, 'green');
  });
  s += text(30, 587, '虚线格是暂存副本，尚不计入表长；写入 X 后表长才增至 4。', 18, C.muted);
  s += text(30, 620, '移动范围：原位置 2～3，共 2 个元素。', 18, C.ink);
  save('02-array-insert.svg', '顺序表在第二位插入 X', '从末尾向前移动，依次复制 C、B，再写入 X；防止覆盖尚未移动的元素。', 644, s);
}
{
  const stages = [
    ['① 删除第 2 位的 X', ['A', 'X', 'B', 'C', ''], { red: [1], active: 4 }],
    ['② B 向左填补空位', ['A', 'B', 'B', 'C', ''], { green: [1], stale: [2], active: 4 }],
    ['③ C 继续向左移动', ['A', 'B', 'C', 'C', ''], { green: [2], stale: [3], active: 4 }],
    ['④ n 改为 3：只认前 3 格', ['A', 'B', 'C', '旧 C', ''], { stale: [3], active: 3 }]
  ];
  let s = '';
  stages.forEach(([label, values, opts], i) => {
    const y = 140 * i;
    if (i) s += divider(y + 4);
    s += text(30, y + 33, label, 20, i ? C.green : C.red, 'start', 600);
    s += arrayRow(y + 58, values, opts);
    if (i === 1) s += arrow(`M 397 ${y + 54} Q 350 ${y + 17} 303 ${y + 54}`, 'green');
    if (i === 2) s += arrow(`M 491 ${y + 54} Q 444 ${y + 17} 397 ${y + 54}`, 'green');
  });
  s += text(30, 587, '灰色格在有效范围之外；容量仍为 5，不要求把旧值清零。', 18, C.muted);
  save('03-array-delete.svg', '顺序表删除第二位 X', '后缀从前向后左移，B 覆盖 X，C 覆盖旧 B，再缩短表长。', 613, s);
}
{
  let s = text(30, 34, '地址可分散，顺序由 next 域决定', 22, C.blue, 'start', 600);
  const rows = [
    ['头结点', '0x100', '—', '0x480'],
    ['首元结点', '0x480', 'A', '0x220'],
    ['后续结点', '0x220', 'B', '0x760'],
    ['尾结点', '0x760', 'C', 'NULL']
  ];
  s += text(312, 68, '数据域', 17, C.muted, 'middle') + text(451, 68, 'next 域', 17, C.muted, 'middle');
  rows.forEach(([role, addr, value, next], i) => {
    const y = 108 + i * 100;
    s += text(241, y - 9, `地址 ${addr}`, 17, C.muted);
    s += rect(240, y, 280, 46, i ? C.blueBg : C.grayBg, i ? C.blue : C.line);
    s += line(380, y, 380, y + 46) + text(310, y + 31, value, 23, C.ink, 'middle', 600);
    s += text(450, y + 30, next, 20, C.blue, 'middle');
    s += text(560, y + 30, role, 18, i === 1 ? C.green : C.muted);
    if (i < 3) s += arrow(`M 522 ${y + 23} H 546 V ${y + 66} H 214 V ${y + 123} H 236`);
  });
  s += text(38, 70, '头指针变量', 18, C.muted);
  s += rect(35, 83, 132, 46, C.white, C.purple);
  s += text(101, 112, '0x100', 20, C.purple, 'middle');
  s += text(101, 156, 'head', 20, C.purple, 'middle', 600);
  s += arrow('M 169 106 H 236', 'purple');
  s += text(30, 496, '线性表中的有效元素只有 A、B、C，头结点不计入表长。', 18, C.muted);
  save('04-linked-layout.svg', '头指针、头结点和首元结点', 'head 保存头结点地址；头结点链接到 A，A 链接到 B，B 链接到 C，C 链接为空。', 521, s);
}
{
  let s = '';
  for (let i = 0; i < 3; i++) {
    const top = i * 220, y = top + 91;
    if (i) s += divider(top + 4);
    s += text(30, top + 36, [
      '① 原状态：p 指向 A，s 指向新结点 X',
      '② s.next = p.next：X 先接上 B',
      '③ p.next = s：A 再改为指向 X'
    ][i], 20, i ? C.green : C.blue, 'start', 600);
    s += node(72, y, 'A') + node(362, y, 'B') + node(542, y, 'C', { next: '∅' });
    s += node(208, y + 80, 'X', { color: 'green', next: i ? '•' : '—' });
    s += labelPointer(101, y, 'p');
    s += text(185, y + 111, 's', 18, C.green, 'middle', 600) + arrow(`M 192 ${y + 103} H 204`, 'green');
    s += arrow(`M 467 ${y + 23} H 537`);
    if (i < 2) s += arrow(`M 177 ${y + 23} H 357`);
    else s += arrow(`M 176 ${y + 23} H 192 V ${y + 103} H 204`, 'green');
    if (i > 0) s += arrow(`M 313 ${y + 103} H 339 V ${y + 23} H 357`, i === 1 ? 'green' : 'blue');
    if (i === 0) s += text(358, y + 112, 'X 尚未接入', 18, C.muted);
  }
  s += text(30, 690, '结点没有搬家；改变的是 next 域保存的后继地址。', 18, C.muted);
  save('05-linked-insert.svg', '单链表插入的两次链接修改', '三幅状态图：A 原先链接 B；新 X 先链接 B；再让 A 链接 X。', 714, s);
}
{
  let s = '';
  for (let i = 0; i < 3; i++) {
    const top = i * 187, y = top + 94;
    if (i) s += divider(top + 4);
    s += text(30, top + 32, [
      '① 保存目标：q = p.next',
      '② 绕过 X：p.next = q.next',
      '③ 回收 X：此后不再通过 q 访问它'
    ][i], 20, i === 2 ? C.red : C.green, 'start', 600);
    s += node(38, y, 'A') + node(360, y, 'B') + node(548, y, 'C', { next: '∅' });
    s += labelPointer(68, y, 'p');
    s += arrow(`M 465 ${y + 23} H 543`);
    if (i < 2) {
      s += node(204, y, 'X', { color: i === 1 ? 'red' : 'blue' });
      s += labelPointer(236, y, 'q', i === 1 ? 'red' : 'muted');
      s += arrow(`M 309 ${y + 23} H 355`, i === 1 ? 'muted' : 'blue', i === 1);
    } else {
      s += rect(204, y, 104, 46, C.grayBg, C.line, true);
      s += text(256, y + 30, '已回收', 18, C.muted, 'middle');
    }
    if (i === 0) s += arrow(`M 143 ${y + 23} H 199`);
    else s += arrow(`M 143 ${y + 23} H 169 V ${y + 69} H 336 V ${y + 23} H 355`, 'green');
    if (i === 1) s += text(370, y + 71, 'X 仍由 q 保存', 17, C.red);
  }
  s += text(30, 591, '已知前驱 p：摘除为 O(1)；若先找 p，还需计入查找成本。', 18, C.muted);
  save('06-linked-delete.svg', '单链表删除时先绕过再回收', 'q 保存 X；A 的后继改为 B；X 脱离主链后再回收。', 615, s);
}
{
  let s = text(30, 35, '单链：数据 + next', 21, C.blue, 'start', 600);
  const xs = [60, 300, 540];
  xs.forEach((x, i) => s += node(x, 72, ['A', 'B', 'C'][i], { next: i === 2 ? '∅' : '•', w: 120 }));
  s += arrow('M 181 95 H 295') + arrow('M 421 95 H 535');
  s += text(237, 80, 'next', 17, C.blue, 'middle') + text(475, 80, 'next', 17, C.blue, 'middle');
  s += divider(154) + text(30, 191, '双链：prev + 数据 + next', 21, C.blue, 'start', 600);
  xs.forEach((x, i) => s += node(x, 255, ['A', 'B', 'C'][i], { next: i === 2 ? '∅' : '•', prev: i === 0 ? '∅' : '•', w: 120, double: true }));
  s += arrow('M 181 266 H 295') + arrow('M 421 266 H 535');
  s += arrow('M 299 291 H 185', 'green') + arrow('M 539 291 H 425', 'green');
  s += text(237, 249, 'next', 17, C.blue, 'middle') + text(475, 249, 'next', 17, C.blue, 'middle');
  s += text(237, 323, 'prev', 17, C.green, 'middle') + text(475, 323, 'prev', 17, C.green, 'middle');
  s += text(30, 372, '反向链接换来方便访问前驱，也增加链接空间与维护工作。', 18, C.muted);
  save('07-directions.svg', '单链与双链的链接方向', '单链只有向后 next；双链的每个结点还保存向前 prev，首尾外侧为空。', 398, s);
}
{
  let s = text(30, 35, '非循环：沿 next 最终遇到 NULL', 21, C.blue, 'start', 600);
  const xs = [90, 305, 520];
  xs.forEach((x, i) => s += node(x, 69, ['A', 'B', 'C'][i], { next: i === 2 ? '∅' : '•' }));
  s += arrow('M 195 92 H 300') + arrow('M 410 92 H 515');
  s += divider(153) + text(30, 192, '循环：末结点回到入口（本图不带头结点）', 21, C.blue, 'start', 600);
  xs.forEach((x, i) => s += node(x, 267, ['A', 'B', 'C'][i]));
  s += labelPointer(120, 267, '入口');
  s += arrow('M 195 290 H 300') + arrow('M 410 290 H 515');
  s += arrow('M 625 290 H 660 V 359 H 57 V 290 H 85', 'green');
  s += text(357, 346, 'C.next 回到 A', 18, C.green, 'middle', 600);
  s += text(30, 407, '已经访问过入口后，再次回到入口才结束本轮遍历。', 18, C.muted);
  save('08-circular.svg', '非循环与循环链表', '不带头结点时，循环链表的尾结点 C 指回 A，判断结束需检查是否回到入口。', 432, s);
}
{
  let s = text(30, 35, '物理位置连续，逻辑次序靠游标串起来', 22, C.blue, 'start', 600);
  const values = [['空闲', '—'], ['C', '-1'], ['A', '4'], ['空闲', '—'], ['B', '1']];
  s += text(35, 92, '数组下标', 18, C.muted);
  s += text(35, 143, '数据域', 18, C.muted) + text(35, 192, 'next 游标', 18, C.muted);
  values.forEach(([v, next], i) => {
    const x = 156 + i * 100, unused = v === '空闲';
    s += text(x + 50, 92, i, 20, C.muted, 'middle');
    s += rect(x, 110, 100, 96, unused ? C.grayBg : C.blueBg, unused ? C.line : C.blue, unused);
    s += line(x, 158, x + 100, 158);
    s += text(x + 50, 142, v, unused ? 17 : 24, unused ? C.muted : C.blue, 'middle', 600);
    s += text(x + 50, 190, next, 21, C.ink, 'middle');
  });
  s += divider(232) + text(30, 268, '逻辑访问：head = 2，从 A 开始', 21, C.green, 'start', 600);
  [80, 268, 456].forEach((x, i) => {
    s += rect(x, 297, 122, 56, C.greenBg, C.green);
    s += text(x + 61, 332, ['A [2]', 'B [4]', 'C [1]'][i], 22, C.green, 'middle', 600);
  });
  s += arrow('M 204 325 H 263', 'green') + arrow('M 392 325 H 451', 'green') + arrow('M 580 325 H 626', 'green');
  s += text(660, 332, '-1', 22, C.muted, 'middle');
  s += text(30, 399, '找第 2 个元素：从下标 2 读取 next = 4，再到下标 4 取 B。', 18, C.muted);
  s += text(30, 433, '本图约定 -1 表示结束；空闲位置 0、3 需要另行管理。', 18, C.muted);
  save('09-cursors.svg', '游标链表的物理位置与逻辑访问', 'A 位于二号槽且 next 为四，B 位于四号槽且 next 为一，C 位于一号槽且 next 为负一。', 459, s);
}
console.log(`Generated ${fs.readdirSync(out).filter(f => f.endsWith('.svg')).length} SVG diagrams in ${out}`);
