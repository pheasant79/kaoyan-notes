# Decisions

## 2026-10-13 — 交付用途

- Question: 成品主要服务于什么场景？
- Choice: 电子复习总目录。
- Rationale: 用户已说明目前不再主要抄在目录旁，重点是复习时知道知识点归属和主线。
- Affected nodes: DS-2, DS-3, DS-4
- Reversible: Yes

## 2026-10-13 — 章节组织

- Question: 八章如何组织？
- Choice: 按教材八章边界，使用408主干筛选重点。
- Rationale: 既保持教材定位，又避免把不同资料的章序混成全国固定章序。
- Affected nodes: DS-1, DS-3
- Reversible: Yes

## 2026-10-13 — 名词归属

- Question: 跨章节名词如何处理？
- Choice: 主归属 + 关联提示。
- Rationale: 每个名词只完整解释一次，相关章节只提示其来源或用途。
- Affected nodes: DS-1, DS-2, DS-3
- Reversible: Yes

## 2026-10-13 — 内容深度

- Question: 每章写到什么程度？
- Choice: 主线树 + 定位标签 + 边界提醒；保留定义、性质、核心算法思想、复杂度和适用条件，不写完整代码。
- Rationale: 解决“知识太杂”同时保留复习所需的实质内容。
- Affected nodes: DS-2, DS-3
- Reversible: Yes

## 2026-10-13 — 旧内容

- Question: C/C++、指针、头结点等旧解释如何处理？
- Choice: 移出主目录，作为实现关联备注，不污染主线。
- Rationale: 这些内容有助于理解实现，但不应和抽象结构、算法、评价指标混在同一层。
- Affected nodes: DS-3
- Reversible: Yes

## 2026-10-13 — 实现概念与编程教学的边界

- Question: 移出旧编程解释时，是否同时移除头结点等结构概念？
- Choice: 头结点、头指针保留在第2章链表的实现组织中；完整代码、动态分配语法等不进入知识主树。
- Rationale: 用户需要知道名词的归属，不能以压缩实现细节为由删掉理解链表所必需的概念。
- Affected nodes: DS-3, DS-4
- Reversible: Yes

## 2026-10-13 — 原图失效后的核对依据

- Question: 无法读取原微信目录图片时，如何完成已授权的整本修订？
- Choice: 使用可读取的旧八章文字稿、用户确认的章界和出版社公开目录，并如实披露未重新看到原图。
- Rationale: 已有材料足以继续章节核对；不猜测图片内容，也不要求用户重复上传才能开展已有授权工作。
- Affected nodes: DS-2, DS-3, DS-4
- Reversible: Yes

## 2026-10-13 — 教材范围与考纲地位

- Question: 怎样处理红黑树、计数排序及年度考纲信息？
- Choice: 依据已核出版社目录保留红黑树及带星号的计数排序；不把未解释的星号推断为必考或不考。
- Rationale: 出版社目录可以确定书中内容位置，官方书目信息不能替代考纲全文的逐项核对。
- Affected nodes: DS-3, DS-4
- Reversible: Yes
