"use strict";

const app = document.getElementById("app");
const mailEnabled = typeof renderMailForm === "function";
const questionCount = friendshipScale.items.length;
const formatMean = value => value.toFixed(2);

function scaleNotes() {
    return `
        <details class="scale-notes">
            <summary>量表来源与使用说明</summary>
            <p>本页为友谊质量量表（Friendship Qualities Scale，FQS）的中文教育改写。原量表用于了解儿童和青春期早期青少年与最好朋友的关系。</p>
            <p>本版用于课堂讨论与个人反思，尚无本版的信效度验证或常模。正式研究请选用并核对适合目标样本的版本。</p>
            <p>各维度取所属题目的 1–5 分均值。按本页编号，第 16 题在安全感维度按 6 减原分换算。冲突按作答方向计分。</p>
            <a href="https://doi.org/10.1177/0265407594113011" target="_blank" rel="noreferrer">Bukowski、Hoza 与 Boivin（1994）原始研究</a>
        </details>
    `;
}

function focusScreen(container) {
    window.scrollTo(0, 0);
    container.querySelector("h1").focus({ preventScroll: true });
}

function renderWelcome() {
    app.innerHTML = `
        <section class="welcome" aria-labelledby="welcome-title">
            <div class="cover" aria-hidden="true">
                <div class="record"><span></span></div>
                <div class="sound-wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
            </div>
            <div class="welcome-content">
                <p class="eyebrow">心理健康教育 · 友谊自评</p>
                <h1 id="welcome-title" tabindex="-1">友谊质量罗盘</h1>
                <p class="intro">想一想你现在最要好的一位朋友。陪伴、分歧、相互帮忙，在你们的相处中各是什么样的？</p>
                <div class="instructions">
                    <h2>作答前</h2>
                    <ul>
                        <li>全程想着同一位朋友，根据平时的相处选择符合程度。遇到假设情境，可以根据你对这位朋友的了解判断。</li>
                        <li>共 ${questionCount} 题，每题五个选项，约 3–5 分钟。参与自愿，可以返回修改，也可以随时退出。</li>
                    </ul>
                </div>
                <button type="button" class="button primary" id="start">开始测评 <span aria-hidden="true">→</span></button>
                <p class="privacy">无需填写姓名。作答在本机浏览器中计分${mailEnabled ? "，成绩摘要可在结果页自愿发送。" : "，关闭页面后会清空。"} </p>
            </div>
        </section>
        ${scaleNotes()}
    `;
    app.querySelector("#start").addEventListener("click", event => {
        event.currentTarget.disabled = true;
        startQuestionnaire();
    });
}

class FriendshipQuestionnairePlugin {
    static info = { name: "friendship-questionnaire", parameters: {} };

    constructor(jsPsych) {
        this.jsPsych = jsPsych;
    }

    trial(display) {
        const answers = Array(questionCount).fill(null);
        const startedAt = performance.now();
        let index = 0;

        const renderQuestion = () => {
            const number = index + 1;
            const answered = answers.filter(value => value !== null).length;
            display.innerHTML = `
                <section class="question-screen" aria-labelledby="question-title">
                    <div class="progress-info">
                        <span id="progress-label">答题进度</span>
                        <span id="progress-count">已答 ${answered} / ${questionCount}</span>
                    </div>
                    <progress aria-labelledby="progress-label progress-count" max="${questionCount}" value="${answered}"></progress>
                    <form class="question-card" novalidate>
                        <p class="eyebrow" id="question-number">第 ${number} 题 / 共 ${questionCount} 题</p>
                        <h1 id="question-title" tabindex="-1" aria-describedby="question-number question-prompt">${friendshipScale.items[index]}</h1>
                        <fieldset aria-labelledby="question-title" aria-describedby="question-prompt">
                            <p class="question-prompt" id="question-prompt">想一想同一位朋友，选择这句话符合你们实际情况的程度。</p>
                            <div class="choices">
                                ${friendshipScale.options.map((label, value) => `
                                    <label class="choice">
                                        <input type="radio" name="rating" value="${value}" required ${answers[index] === value ? "checked" : ""}>
                                        <span class="choice-number">${value + 1}</span>
                                        <span>${label}</span>
                                    </label>
                                `).join("")}
                            </div>
                        </fieldset>
                        <p id="answer-error" class="answer-error" role="alert"></p>
                        <div class="question-actions">
                            <button type="button" class="button secondary" id="previous" ${index === 0 ? "disabled" : ""}>上一题</button>
                            <button type="submit" class="button primary">${number === questionCount ? "查看结果" : "下一题"} <span aria-hidden="true">→</span></button>
                        </div>
                    </form>
                    <button type="button" class="text-button" id="exit">退出测评</button>
                </section>
            `;

            const form = display.querySelector("form");
            const error = display.querySelector("#answer-error");
            form.addEventListener("change", event => {
                answers[index] = Number(event.target.value);
                const count = answers.filter(value => value !== null).length;
                display.querySelector("progress").value = count;
                display.querySelector("#progress-count").textContent = `已答 ${count} / ${questionCount}`;
                error.textContent = "";
            });
            form.addEventListener("submit", event => {
                event.preventDefault();
                if (answers[index] === null) {
                    error.textContent = "请先选择一个选项，再继续。";
                    form.querySelector("input").focus();
                    return;
                }
                if (number < questionCount) {
                    index++;
                    renderQuestion();
                    return;
                }

                const response = Object.fromEntries(answers.map((value, item) => [`Q${item + 1}`, value]));
                this.jsPsych.finishTrial({
                    type: "survey_response",
                    instrument_version: friendshipScale.version,
                    response,
                    rt: Math.round(performance.now() - startedAt)
                });
            });
            display.querySelector("#previous").addEventListener("click", () => {
                index--;
                renderQuestion();
            });
            display.querySelector("#exit").addEventListener("click", () => {
                if (answers.every(value => value === null) || window.confirm("退出后会清空本次作答。确定退出吗？")) {
                    window.location.reload();
                }
            });
            focusScreen(display);
        };
        renderQuestion();
    }
}

async function startQuestionnaire() {
    try {
        const jsPsych = initJsPsych({
            display_element: app,
            use_webaudio: false,
            on_finish: data => {
                const trial = data.filter({ type: "survey_response" }).values()[0];
                renderReport(scoreFriendship(trial.response), new Date(), trial.rt);
            }
        });
        await jsPsych.run([{ type: FriendshipQuestionnairePlugin }]);
    } catch (error) {
        console.error("友谊质量罗盘加载失败", error);
        app.innerHTML = `
            <section class="error-screen">
                <h1 tabindex="-1">测评暂时无法继续</h1>
                <p>请确认本页和配套文件位于同一目录，然后重新打开。</p>
                <button type="button" class="button primary" id="reload">重新加载</button>
            </section>
        `;
        app.querySelector("#reload").addEventListener("click", () => window.location.reload());
        focusScreen(app);
    }
}

function renderReport(result, completedAt, duration) {
    const boundaryConcern = result.raw[4] >= 4 || result.raw[5] >= 4;
    app.removeAttribute("tabindex");
    app.innerHTML = `
        <section class="report" aria-labelledby="report-title">
            <header class="report-header">
                <h1 id="report-title" tabindex="-1">我的友谊报告</h1>
                <p>这份报告记录你对这位朋友的感受，可以用来回想具体的相处经历。</p>
            </header>
            <section class="report-card" aria-labelledby="scores-title">
                <div class="report-card-header">
                    <h2 id="scores-title">五个维度</h2>
                    <p>均分范围 1–5。分数越高，表示该维度的特征越符合你的体验。冲突高分反映更多分歧或摩擦。</p>
                </div>
                <ul class="dimension-list">
                    ${result.dimensions.map(dimension => `
                        <li class="dimension ${dimension.id === "conflict" ? "conflict" : ""}">
                            <div class="dimension-metric">
                                <h3 id="label-${dimension.id}">${dimension.label}</h3>
                                <div class="dimension-score"><strong>${formatMean(dimension.mean)}</strong> <span>/ 5</span></div>
                                <meter aria-labelledby="label-${dimension.id}" min="1" max="5" value="${dimension.mean}"></meter>
                            </div>
                            <div class="dimension-description">
                                <p>${dimension.meaning}</p>
                                <p class="reflection"><span>想一想</span> ${dimension.reflection}</p>
                            </div>
                        </li>
                    `).join("")}
                </ul>
            </section>
            ${boundaryConcern ? `
                <aside class="report-support">
                    <h2>如果相处让你不安</h2>
                    <p>遇到打架、持续被打扰或感到不安全时，可以先离开现场，告诉信任的老师、家长或学校心理老师，一起商量怎样保护自己。</p>
                </aside>
            ` : ""}
            <div class="report-actions">
                <button type="button" class="button primary" id="print">打印 / 保存为 PDF</button>
                <button type="button" class="button secondary" id="download">下载作答与得分（CSV）</button>
                <button type="button" class="text-button" id="restart">再测一次</button>
            </div>
            ${mailEnabled ? renderMailForm() : ""}
        </section>
        ${scaleNotes()}
    `;
    app.querySelector("#print").addEventListener("click", () => window.print());
    app.querySelector("#download").addEventListener("click", () => downloadResponses(result, completedAt, duration));
    app.querySelector("#restart").addEventListener("click", () => window.location.reload());
    if (mailEnabled) {
        bindMailForm(app.querySelector("#mail-form"), result.dimensions, completedAt);
    }
    focusScreen(app);
}

function downloadResponses(result, completedAt, duration) {
    const headings = ["instrument_version", "completed_at", "duration_ms",
        ...result.raw.map((_, index) => `Q${index + 1}`),
        ...result.dimensions.map(dimension => `${dimension.id}_mean`)];
    const values = [friendshipScale.version, completedAt.toISOString(), duration,
        ...result.raw, ...result.dimensions.map(dimension => formatMean(dimension.mean))];
    const file = new Blob(["\uFEFF", headings.join(","), "\r\n", values.join(","), "\r\n"], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `friendship-report-${completedAt.toISOString().slice(0, 10)}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

renderWelcome();
