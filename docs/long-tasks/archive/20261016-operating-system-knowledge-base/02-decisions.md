# Decisions

### 2026-10-16 — 复习主线
- Question: 全书如何组织？
- Choice: 以“用户程序→系统调用→进程与线程→地址空间与内存→文件与设备→中断、I/O 与资源管理”为程序执行链，资源管理线贯穿全书。
- Rationale: 让章节之间存在可追踪的运行关系，而不是并列目录。
- Affected nodes: O1, O2
- Reversible: yes, in a future revision task.

### 2026-10-16 — 章节边界
- Question: 六章如何划分？
- Choice: 系统概述；进程与调度；同步与死锁；内存管理；文件系统；输入输出系统。
- Rationale: 保留用户确认的六章边界；文件块分配与空闲空间归文件系统，磁盘调度归输入输出系统。
- Affected nodes: O1, O2
- Reversible: yes, in a future revision task.

### 2026-10-16 — 正式格式与扩展内容
- Question: 是否恢复 HTML 或把现代实现混入主线？
- Choice: 正式入口只保留 Markdown + 本地 SVG；现代实现只做短注。
- Rationale: 与《数据结构》《高等数学》《线性代数》的知识库式阅读方式一致，保持 408 复习边界。
- Affected nodes: O2, O3, O4
- Reversible: yes, in a future revision task.

### 2026-10-16 — 第3章结构
- Question: 同步与死锁是否合并成单一流程？
- Choice: 同章但分为“同步互斥”和“死锁”两条独立主枝。
- Rationale: 两者都属于并发资源管理，但题型、判据和处理方法不同。
- Affected nodes: O1, O2
- Reversible: yes, in a future revision task.
