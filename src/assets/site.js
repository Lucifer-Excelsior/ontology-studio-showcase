const root = document.documentElement;
const storage = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage is optional. */ }
  },
};

const themeToggle = document.querySelector(".theme-toggle");
const savedTheme = storage.get("ontology-showcase.theme", null);
const preferredTheme = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
const initialTheme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : preferredTheme;
root.dataset.theme = initialTheme;
if (themeToggle) {
  const syncTheme = () => themeToggle.setAttribute("aria-pressed", String(root.dataset.theme === "dark"));
  syncTheme();
  themeToggle.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    storage.set("ontology-showcase.theme", root.dataset.theme);
    syncTheme();
  });
}

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
navToggle?.addEventListener("click", () => {
  const expanded = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!expanded));
  navLinks?.classList.toggle("open", !expanded);
});

document.querySelectorAll("[data-year]").forEach((node) => { node.textContent = String(new Date().getFullYear()); });

const journeys = {
  "data-answer": {
    title: "从数据到本体再到证据问答",
    summary: "理解平台最具代表性的端到端闭环。",
    outcome: "可追溯数据源、本体修订、ABox 批次与证据问答应用",
    steps: [
      ["定义业务问题", "写下目标用户与 3—5 个能力问题，避免为了建模而建模。", "可验收的解决方案边界"],
      ["登记并验证数据源", "记录来源、责任人、凭据引用并执行分阶段连接测试。", "通过测试的数据源与发现快照"],
      ["审核语义映射", "对齐记录类、身份字段、属性与对象关系。", "版本化映射修订"],
      ["构建并验证本体", "补齐 TBox、RBox 与 SHACL，运行 RDF/OWL/能力问题门禁。", "通过质量门的本体修订"],
      ["实例化并装配应用", "生成绑定来源和版本的 ABox，冻结问答策略与证据规则。", "可发布的证据问答应用"],
    ],
  },
  ontology: {
    title: "从零构建一个可发布本体",
    summary: "从业务词汇和能力问题出发，逐步形成可审核标准资产。",
    outcome: "包含 TBox、RBox、SHACL、样例 ABox 和版本证据的本体包",
    steps: [
      ["用能力问题确定范围", "说清本体要回答什么，不包含什么。", "建模边界与 base IRI"],
      ["建立核心词汇", "创建类、属性、多语言标签与定义。", "TBox 核心目录"],
      ["补充关系与约束", "表达上下位、domain/range、inverse 和实例数据规则。", "RBox 与 SHACL 形状"],
      ["用样例和 CQ 验证", "用正常与反例数据检查结构、推理和约束。", "可回归的质量基线"],
      ["独立审核并导出", "固定修订、审批与摘要，导出 Turtle、RDF/XML 或 JSON-LD。", "内容寻址的本体发布包"],
    ],
  },
  agent: {
    title: "配置一个本体驱动的受控智能体",
    summary: "让智能体依据本体和业务规则生成计划，保留确认与审计边界。",
    outcome: "绑定本体、ABox、策略和工具修订的可审核执行计划",
    steps: [
      ["定义能力契约", "显式声明参数、输出、影响范围和风险级别。", "不可变操作修订"],
      ["连接受控目标", "只允许经审核的参数化数据库命令或 HTTP 路径。", "受控动作适配器"],
      ["绑定政策与语义版本", "固定允许角色、配额、本体与 ABox 基线。", "受治理 Agent Profile"],
      ["生成并预演计划", "将目标转换为可解释步骤，显示影响预览与拒绝路径。", "待人工确认的执行计划"],
      ["执行与调查审计", "高风险步骤在人工确认后执行，保留参数摘要与结果。", "不可修改的操作审计链"],
    ],
  },
  delivery: {
    title: "完成一次 FDE 解决方案交付",
    summary: "从需求范围到验收交接，将项目成果沉淀为可复用产品资产。",
    outcome: "可安装、可验收、可升级且不携带秘密的解决方案包",
    steps: [
      ["建立验收问题", "把客户目标翻译为可测量的能力问题和验收标准。", "解决方案定义"],
      ["装配版本化资产", "只引用受治理的数据源、本体、映射、应用和测试。", "六阶段就绪度"],
      ["分派责任与阻断", "让负责人、截止时间、证据和关联对象进入统一任务闭环。", "可追踪的责任链"],
      ["独立验收与交接", "创建者不能自签，凭据仅保留引用，附带运行和回滚基线。", "验收与交接证据"],
      ["发布并沉淀模板", "导出绑定摘要的交付包，将稳定方法提取为参数化模板。", "解决方案包与 FDE 模板"],
    ],
  },
};

function renderJourney(id) {
  const panel = document.querySelector("#journey-panel");
  if (!panel || !journeys[id]) return;
  const journey = journeys[id];
  const state = storage.get("ontology-showcase.tutorial", {});
  const completed = new Set(state[id] || []);
  panel.innerHTML = `
    <header><p class="eyebrow">SELECTED JOURNEY</p><h2>${journey.title}</h2><p>${journey.summary}</p><div class="journey-outcome"><span>完成后获得</span><b>${journey.outcome}</b></div></header>
    <ol class="journey-steps">${journey.steps.map((step, index) => `
      <li class="${completed.has(index) ? "complete" : ""}">
        <button type="button" data-complete-step="${index}" aria-pressed="${completed.has(index)}" aria-label="${completed.has(index) ? "标记为未完成" : "标记为已完成"}"><span>${completed.has(index) ? "✓" : index + 1}</span></button>
        <div><h3>${step[0]}</h3><p>${step[1]}</p><small><b>产物</b>${step[2]}</small></div>
      </li>`).join("")}</ol>
    <footer><span>当前进度</span><b>${completed.size} / ${journey.steps.length}</b><progress max="${journey.steps.length}" value="${completed.size}">${completed.size} / ${journey.steps.length}</progress></footer>`;
  panel.querySelectorAll("[data-complete-step]").forEach((button) => button.addEventListener("click", () => {
    const index = Number(button.dataset.completeStep);
    if (completed.has(index)) completed.delete(index); else completed.add(index);
    state[id] = [...completed];
    storage.set("ontology-showcase.tutorial", state);
    renderJourney(id);
  }));
}

const journeyButtons = [...document.querySelectorAll("[data-journey]")];
if (journeyButtons.length) {
  journeyButtons.forEach((button) => button.addEventListener("click", () => {
    journeyButtons.forEach((item) => item.setAttribute("aria-selected", String(item === button)));
    renderJourney(button.dataset.journey);
  }));
  renderJourney("data-answer");
}

const demoStages = [
  {
    title: "证据入场：先固定材料与边界",
    lead: "平台不直接“读一下”，而是先登记材料、用途、版本和责任人。",
    body: `<div class="artifact-grid"><article><span>DOCUMENT</span><h3>TD-AGENT-SEM-001.docx</h3><dl><div><dt>页数</dt><dd>18</dd></div><div><dt>语言</dt><dd>English</dd></div><div><dt>指纹</dt><dd>sha256:8f2c…7a91</dd></div></dl></article><article><span>REVIEW INTENT</span><h3>提交前质量审查</h3><ul><li>检查形式完整性</li><li>识别术语与规范性陈述</li><li>生成候选研究组建议</li></ul></article></div><div class="evidence-line"><b>边界声明</b><span>此处只生成辅助建议，不代替作者、国家成员或 ITU 正式决策。</span></div>`,
    context: "材料指纹与审查意图已冻结，可开始语义提取。",
  },
  {
    title: "语义提取：将段落转换为候选知识",
    lead: "抽取结果不会直接写入本体，而是以候选项形式等待人工审核。",
    body: `<div class="candidate-table" role="table" aria-label="语义候选项"><div class="table-head" role="row"><span>类型</span><span>候选项</span><span>证据</span><span>状态</span></div><div role="row"><span>Concept</span><b>Semantic Agent Profile</b><span>§ 3.1</span><i>待审核</i></div><div role="row"><span>Requirement</span><b>Agent shall expose capability metadata</b><span>§ 5.2</span><i>待审核</i></div><div role="row"><span>Relation</span><b>Agent Profile → declares → Capability</b><span>§ 6.1</span><i>待审核</i></div></div><div class="triple-preview"><span>RDF PREVIEW</span><code>:AgentProfile :declares :Capability .</code><code>:Requirement_52 :evidence :Paragraph_09 .</code></div>`,
    context: "3 个语义候选项已绑定原文位置，尚未写入正式本体。",
  },
  {
    title: "规则验证：让问题变成可执行检查",
    lead: "形式、语义和业务规则分层执行，每个结论都给出修复方向。",
    body: `<div class="validation-summary"><article class="pass"><span>PASS</span><b>12</b><small>通过的形式与语义检查</small></article><article class="warn"><span>REVIEW</span><b>3</b><small>需作者判断的候选问题</small></article><article class="block"><span>BLOCK</span><b>1</b><small>建议提交前修复</small></article></div><div class="finding"><span class="finding-level">MAJOR · § 7.3</span><h3>关键要求缺少可验证的一致性条件</h3><p>“should support semantic consistency” 未说明一致性的判定输入、结果和失败表达。</p><div><b>建议</b><span>补充规范性要求，并给出最小测试集与不一致响应。</span></div></div>`,
    context: "检查完成：1 个阻断项、3 个需复核项，可生成候选建议。",
  },
  {
    title: "候选建议：给出理由，不隐藏不确定性",
    lead: "平台结合提案主题、术语、引用和候选范围规则生成建议。",
    body: `<div class="recommendation"><div class="recommendation-head"><div><span>CANDIDATE ROUTING</span><h3>建议优先人工评估：与安全、网络管理及 AI 语义互操作相关的研究组</h3></div><b>中等置信度</b></div><p>静态演示不给出真实工作组结论。真实系统应根据当期研究组 mandate、工作项与作者选择执行动态匹配。</p><ul><li><b>主题证据</b><span>agent capability metadata、semantic consistency、trust policy</span></li><li><b>范围证据</b><span>安全治理与智能网络语义交叉</span></li><li><b>待核对</b><span>当期 mandate、已有工作项与联络关系</span></li></ul></div>`,
    context: "候选建议已生成，仍需领域专家核对当期组织范围。",
  },
  {
    title: "人工决策：系统给出证据，责任人做决定",
    lead: "只有经过审核的建议才能进入交付包，拒绝和修改同样保留理由。",
    body: `<div class="decision-card"><div class="decision-state"><span aria-hidden="true">✓</span><div><b>审查包已就绪</b><p>本演示在人工确认前停止，不会生成真实提交。</p></div></div><dl><div><dt>材料修改建议</dt><dd>4 条（1 条阻断、3 条复核）</dd></div><div><dt>候选路由建议</dt><dd>1 条（需核对当期 mandate）</dd></div><div><dt>证据引用</dt><dd>7 处原文、3 条规则、1 个本体修订</dd></div><div><dt>导出前门禁</dt><dd>作者复核 → 领域专家核对 → 有权限人确认</dd></div></dl></div>`,
    context: "演示完成。真实平台会在人工审核后生成绑定版本和摘要的交付包。",
  },
];

let demoIndex = 0;
function renderDemo(index) {
  const stage = document.querySelector("#demo-stage");
  if (!stage) return;
  demoIndex = Math.max(0, Math.min(index, demoStages.length - 1));
  const data = demoStages[demoIndex];
  stage.innerHTML = `<header><span>STEP ${String(demoIndex + 1).padStart(2, "0")} / ${String(demoStages.length).padStart(2, "0")}</span><h2>${data.title}</h2><p>${data.lead}</p></header><div class="demo-artifact">${data.body}</div>`;
  document.querySelectorAll("[data-demo-stage]").forEach((button, buttonIndex) => {
    button.setAttribute("aria-selected", String(buttonIndex === demoIndex));
    button.classList.toggle("passed", buttonIndex < demoIndex);
  });
  const progress = document.querySelector("#demo-progress");
  const progressLabel = document.querySelector("#demo-progress-label");
  const context = document.querySelector("#demo-context");
  const next = document.querySelector("#demo-next");
  if (progress) {
    progress.value = demoIndex + 1;
    progress.textContent = `${demoIndex + 1} / ${demoStages.length}`;
    progress.setAttribute("aria-valuetext", `第 ${demoIndex + 1} 步，共 ${demoStages.length} 步`);
  }
  if (progressLabel) progressLabel.textContent = `${demoIndex + 1} / ${demoStages.length}`;
  if (context) context.textContent = data.context;
  if (next) next.innerHTML = demoIndex === demoStages.length - 1 ? "重新演示" : `下一步：${document.querySelector(`[data-demo-stage="${demoIndex + 1}"] b`)?.textContent || "继续"} <span aria-hidden="true">→</span>`;
}

const demoTabs = [...document.querySelectorAll("[data-demo-stage]")];
if (demoTabs.length) {
  demoTabs.forEach((button) => button.addEventListener("click", () => renderDemo(Number(button.dataset.demoStage))));
  document.querySelector("#demo-next")?.addEventListener("click", () => renderDemo(demoIndex === demoStages.length - 1 ? 0 : demoIndex + 1));
  document.querySelector("#demo-reset")?.addEventListener("click", () => renderDemo(0));
  renderDemo(0);
}
