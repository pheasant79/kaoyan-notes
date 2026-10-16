# Task Tree

## O1 — 建立正式入口与全书知识树
- Parent: root
- Intended result: 根入口指向全书知识树；总图按程序执行链和资源管理线展开，并包含六章章节子树。
- State: completed
- Dependencies: none
- Acceptance evidence: `操作系统_目录总图.md`; `操作系统/00_全书知识树.md`

## O2 — 完成六章复习正文
- Parent: root
- Intended result: 六章统一为“本章问题→主线→知识树→结论→知识展开→图示→短例→边界→跨章连接”。
- State: completed
- Dependencies: O1
- Acceptance evidence: `操作系统/01_系统概述.md` 至 `操作系统/06_输入输出系统.md`

## O3 — 补齐本地对象关系图与过程图
- Parent: root
- Intended result: 六章使用本地 SVG 表达状态、地址、资源、调度、I/O 和文件访问关系。
- State: completed
- Dependencies: O2
- Acceptance evidence: `操作系统/assets/ch01/` 至 `操作系统/assets/ch06/`，共 13 张 SVG

## O4 — 完成静态与视觉验收
- Parent: root
- Intended result: 链接、锚点、图片、公式、SVG 和正式入口边界均通过检查；第2章截图验收完成。
- State: completed
- Dependencies: O1, O2, O3
- Acceptance evidence: `03-results.md`; 用户提供的第2章宽屏、窄窗口及图示截图

## Change Log
- 2026-10-16: 将六章栏目名统一为“本章要解决的问题”和“本章一句话主线”；第3章明确“两条主枝”。
