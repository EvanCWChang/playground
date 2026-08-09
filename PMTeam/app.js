document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // Onboarding 登機證互動、3D 折疊與紙飛機飛射轉場邏輯
    // ==========================================================================
    const onboardingScreen = document.getElementById('onboarding-screen');
    const boardingPassCard = document.getElementById('boarding-pass-card');
    const boardingNameInput = document.getElementById('boarding-name');
    const boardingDestinationInput = document.getElementById('boarding-destination');
    const stubDestination = document.getElementById('stub-destination');
    const boardingBtn = document.getElementById('boarding-btn');
    const mainContent = document.getElementById('main-content');

    // 目的地即時同步到存根聯
    if (boardingDestinationInput && stubDestination) {
        boardingDestinationInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            stubDestination.textContent = val || 'Future & Growth';
        });
    }

    // 點擊登機按鈕 (觸發 3D 折疊與紙飛機飛射動畫)
    if (boardingBtn) {
        boardingBtn.addEventListener('click', () => {
            const nameVal = boardingNameInput.value.trim();
            if (!nameVal) {
                // 如果沒輸入名字，閃爍輸入框
                boardingNameInput.style.borderColor = 'var(--accent-color)';
                boardingNameInput.focus();
                setTimeout(() => {
                    boardingNameInput.style.borderColor = 'var(--border-color)';
                }, 1000);
                return;
            }

            // 同步旅客姓名到 Step 1 表單中的第一欄「暱稱」
            if (inputs && inputs.name) {
                inputs.name.value = nameVal;
            }
            updateCardField('name');

            // 1. 隱藏按鈕避免重複點擊
            boardingBtn.style.opacity = '0';
            boardingBtn.style.pointerEvents = 'none';

            // 2. 觸發極致絲滑的「機票向螢幕前方放大並淡出」3D 破風起飛動畫，避免卡頓
            boardingPassCard.style.transition = 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
            boardingPassCard.style.transform = 'translate3d(0, -30px, 400px) rotateX(15deg) scale(1.5)';
            boardingPassCard.style.opacity = '0';

            // 3. 同步觸發背景遮罩柔和淡出轉場
            onboardingScreen.style.transition = 'all 0.8s ease-out';
            onboardingScreen.style.opacity = '0';

            // 4. 等待 800ms 動畫完結後，順暢、無縫切換到機艙頁面
            setTimeout(() => {
                onboardingScreen.classList.add('hidden');
                mainContent.classList.remove('hidden');
                
                // 讓主畫面從深處縮放淡入，製造穿透雲霧進入機艙的沈浸感
                mainContent.style.opacity = '0';
                mainContent.style.transform = 'scale(0.96) translateY(10px)';
                mainContent.style.transition = 'none'; // 先重設
                void mainContent.offsetWidth; // 強制回流
                
                mainContent.style.transition = 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
                mainContent.style.opacity = '1';
                mainContent.style.transform = 'scale(1) translateY(0)';
                
                // 恢復首頁機票與 Onboarding Overlay 的狀態（隱藏在背景），以便後續按 Logo 正常回退
                setTimeout(() => {
                    boardingPassCard.style.transform = 'none';
                    boardingPassCard.style.opacity = '1';
                    onboardingScreen.style.opacity = '1';
                    boardingBtn.style.opacity = '1';
                    boardingBtn.style.pointerEvents = 'auto';
                }, 1000);
            }, 800);
        });
    }

    // ==========================================================================
    // 回到首頁與導覽邏輯
    // ==========================================================================
    const brandLogo = document.getElementById('brand-logo');
    const navCabin = document.getElementById('nav-cabin');

    function goBackToHome() {
        // 主頁面隱藏
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(20px)';
        mainContent.style.transition = 'all 0.5s ease-in';
        
        setTimeout(() => {
            mainContent.classList.add('hidden');
            
            // 登機證畫面重設與淡入
            onboardingScreen.classList.remove('hidden');
            onboardingScreen.classList.remove('fly-out');
            onboardingScreen.style.opacity = '0';
            onboardingScreen.style.transform = 'scale(0.95)';
            onboardingScreen.style.transition = 'all 0.6s ease-out';
            void onboardingScreen.offsetWidth; // 強制回流
            onboardingScreen.style.opacity = '1';
            onboardingScreen.style.transform = 'scale(1)';
        }, 500);
    }

    function enterCabinDirectly(e) {
        if (e) e.preventDefault();
        // 取得登機證上的乘客暱稱，如果沒有填寫，就給個預設名 "Guest"
        const nameVal = boardingNameInput.value.trim() || "Guest";
        inputs.name.value = nameVal;
        updateCardField('name');

        onboardingScreen.classList.add('fly-out');
        setTimeout(() => {
            onboardingScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            
            mainContent.style.opacity = '0';
            mainContent.style.transform = 'translateY(20px)';
            mainContent.style.transition = 'all 0.6s ease-out';
            void mainContent.offsetWidth; // 強制回流
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
        }, 750);
    }

    if (brandLogo) brandLogo.addEventListener('click', goBackToHome);
    if (navCabin) navCabin.addEventListener('click', enterCabinDirectly);

    // ==========================================================================
    // 核心表單、預覽卡片與 3 Steps 分步填寫邏輯
    // ==========================================================================
    const inputs = {
        name: document.getElementById('input-name'),
        background: document.getElementById('input-background'),
        exp: document.getElementById('input-exp'),
        pivot: document.getElementById('input-pivot'),
        pit: document.getElementById('input-pit'),
        proud: document.getElementById('input-proud'),
        talent: document.getElementById('input-talent'),
        funfact: document.getElementById('input-funfact'),
        influence: document.getElementById('input-influence'),
        quote: document.getElementById('input-quote'),
        
        // Present 10 題
        presentMorning: document.getElementById('input-present-morning'),
        presentComm: document.getElementById('input-present-comm'),
        presentMine: document.getElementById('input-present-mine'),
        presentCharge: document.getElementById('input-present-charge'),
        presentSupportHard: document.getElementById('input-present-support-hard'),
        presentSupportSoft: document.getElementById('input-present-support-soft'),
        presentNeedWork: document.getElementById('input-present-need-work'),
        presentNeedLife: document.getElementById('input-present-need-life'),
        presentAdmire: document.getElementById('input-present-admire'),
        presentMessage: document.getElementById('input-present-message')
    };

    const step2Questions = [
        { key: 'q1', label: 'Q1. 現況與優勢' },
        { key: 'q2', label: 'Q2. 痛點與卡點' },
        { key: 'q3', label: 'Q3. 軟實力' },
        { key: 'q4', label: 'Q4. 重點專案' },
        { key: 'q5', label: 'Q5. 壞習慣' },
        { key: 'q6', label: 'Q6. 新習慣' },
        { key: 'q7', label: 'Q7. 私下目標' },
        { key: 'q8', label: 'Q8. 旅遊充電' },
        { key: 'q9', label: 'Q9. 遠期願景' },
        { key: 'q10', label: 'Q10. 社群期待' }
    ];

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function collectStep2Answers() {
        return step2Questions.reduce((acc, question) => {
            const group = document.querySelector(`.multi-choice-group[data-question="${question.key}"]`);
            const selectedChoices = Array.from(group ? group.querySelectorAll('.multi-choice-option.active') : [])
                .map((button) => button.dataset.label || button.textContent.trim());
            const otherInput = document.getElementById(`${question.key}-other`);
            acc[question.key] = {
                choices: selectedChoices,
                other: otherInput ? otherInput.value.trim() : ''
            };
            return acc;
        }, {});
    }

    function formatStep2Answer(answer) {
        if (!answer) return '';
        const selected = Array.isArray(answer.choices) ? answer.choices : [];
        const other = answer.other ? `其他：${answer.other}` : '';
        return [...selected, other].filter(Boolean).join(' / ');
    }

    function buildStep2List(step2Answers) {
        return step2Questions
            .map((question) => ({
                label: question.label,
                value: formatStep2Answer(step2Answers[question.key])
            }))
            .filter((item) => item.value);
    }

    function collectStep3Answers() {
        return [
            { label: '☕ 早上開機必備儀式', value: inputs.presentMorning ? inputs.presentMorning.value.trim() : '' },
            { label: '⚡ 跟你溝通最順暢的小撇步', value: inputs.presentComm ? inputs.presentComm.value.trim() : '' },
            { label: '🪫 你的地雷 / 能量歸零開關', value: inputs.presentMine ? inputs.presentMine.value.trim() : '' },
            { label: '🔋 你的充電方式 / 快樂源泉', value: inputs.presentCharge ? inputs.presentCharge.value.trim() : '' },
            { label: '💡 你可以給團隊的硬核支援', value: inputs.presentSupportHard ? inputs.presentSupportHard.value.trim() : '' },
            { label: '🍔 你可以給團隊的私房支援', value: inputs.presentSupportSoft ? inputs.presentSupportSoft.value.trim() : '' },
            { label: '🆘 你現在最需要的「工作應援」', value: inputs.presentNeedWork ? inputs.presentNeedWork.value.trim() : '' },
            { label: '🏃‍♂️ 你現在最需要的「生活應援」', value: inputs.presentNeedLife ? inputs.presentNeedLife.value.trim() : '' },
            { label: '❤️ 你最欣賞 PM 團隊的一個優點', value: inputs.presentAdmire ? inputs.presentAdmire.value.trim() : '' },
            { label: '💌 想給現在的 PM 團隊大家的一句話', value: inputs.presentMessage ? inputs.presentMessage.value.trim() : '' }
        ].filter((item) => item.value);
    }

    function buildStep2PanelHtml(step2Answers) {
        const step2Items = buildStep2List(step2Answers);
        return step2Items.length
            ? `<ul class="card-answer-list">${step2Items.map((item) => `<li class="answer-item"><span class="answer-label">${escapeHtml(item.label)}</span><span class="answer-value">${escapeHtml(item.value)}</span></li>`).join('')}</ul>`
            : '<p class="card-empty-state">尚未填寫 Step 2</p>';
    }

    function buildStep3PanelHtml(step3Answers) {
        const step3Items = step3Answers;
        return step3Items.length
            ? `<ul class="card-answer-list">${step3Items.map((item) => `<li class="answer-item"><span class="answer-label">${escapeHtml(item.label)}</span><span class="answer-value">${escapeHtml(item.value)}</span></li>`).join('')}</ul>`
            : '<p class="card-empty-state">尚未填寫 Step 3</p>';
    }

    function attachCardTabHandlers(cardElement) {
        const tabs = cardElement ? cardElement.querySelectorAll('.card-tab') : [];
        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const card = tab.closest('.profile-card');
                if (!card) return;
                card.querySelectorAll('.card-tab').forEach((item) => item.classList.remove('active'));
                card.querySelectorAll('.card-tab-panel').forEach((panel) => panel.classList.remove('active'));
                tab.classList.add('active');
                const targetPanel = card.querySelector(`.card-tab-panel[data-panel="${tab.dataset.tab}"]`);
                if (targetPanel) targetPanel.classList.add('active');
            });
        });
    }

    function updateStep2Selections() {
        const answers = collectStep2Answers();
        window.currentStep2Answers = answers;
        return answers;
    }

    if (inputs.name && boardingNameInput && boardingNameInput.value.trim()) {
        inputs.name.value = boardingNameInput.value.trim();
    }

    const defaults = {
        name: 'Alex',
        background: '以前是工程師 / 企管系',
        exp: '交換學生 / 遊學 / 獨旅經歷',
        pivot: '決定轉行 PM 的那天',
        pit: '專案爆炸延期 / 需求沒留紀錄',
        proud: '獨立完成一個新產品',
        talent: '拉花冠軍 / 精通調酒',
        funfact: '在冰島被羊追 / 一天喝 5 杯咖啡',
        influence: '《原子習慣》',
        quote: '沒有完美的決策，只有承擔結果'
    };

    const talentOptions = Array.from(document.querySelectorAll('#talent-options .option-chip'));
    function syncTalentSelection() {
        const selectedValues = talentOptions
            .filter((button) => button.classList.contains('active'))
            .map((button) => button.dataset.value);

        if (inputs.talent) {
            inputs.talent.value = selectedValues.join('、');
        }
    }

    talentOptions.forEach((button) => {
        button.addEventListener('click', () => {
            button.classList.toggle('active');
            button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');
            syncTalentSelection();
        });
    });

    const multiChoiceOptions = Array.from(document.querySelectorAll('.multi-choice-option'));
    function syncMultiChoiceButtonLabels() {
        multiChoiceOptions.forEach((button) => {
            const choicePrefix = button.dataset.choice ? `${button.dataset.choice}. ` : '';
            const labelText = button.dataset.label || button.textContent.trim();
            button.textContent = `${choicePrefix}${labelText}`;
            button.setAttribute('aria-label', `${choicePrefix}${labelText}`);
        });
    }

    syncMultiChoiceButtonLabels();

    multiChoiceOptions.forEach((button) => {
        button.addEventListener('click', () => {
            const group = button.closest('.multi-choice-group');
            const questionKey = group ? group.dataset.question : null;
            const otherInput = questionKey ? document.getElementById(`${questionKey}-other`) : null;

            if (button.dataset.choice === 'E') {
                button.classList.toggle('active');
                if (otherInput) {
                    if (button.classList.contains('active')) {
                        otherInput.classList.remove('hidden');
                        otherInput.focus();
                    } else {
                        otherInput.value = '';
                        otherInput.classList.add('hidden');
                    }
                }
            } else {
                button.classList.toggle('active');
            }

            button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');
            updateStep2Selections();
        });
    });

    updateStep2Selections();

    const submitBtn = document.getElementById('submit-btn');
    const galleryEmpty = document.getElementById('gallery-empty');
    const galleryGrid = document.getElementById('gallery-grid');

    // Live preview was removed, so this is a no-op to prevent errors
    function updateCardField(field) {}

    // ==========================================================================
    // 3 Steps 分步導覽切換邏輯 (Wizard Controller)
    // ==========================================================================
    const steps = [
        document.getElementById('step-1-container'),
        document.getElementById('step-2-container'),
        document.getElementById('step-3-container')
    ];
    const progressSteps = [
        document.getElementById('progress-step-1'),
        document.getElementById('progress-step-2'),
        document.getElementById('progress-step-3'),
        document.getElementById('progress-step-4')
    ];
    const progressLines = [
        document.getElementById('progress-line-1'),
        document.getElementById('progress-line-2'),
        document.getElementById('progress-line-3')
    ];

    function goToStep(stepNum) {
        const formSection = document.querySelector('.form-section');
        const endingScreen = document.getElementById('passport-ending-screen');
        
        if (stepNum <= 3) {
            // 顯示表單區、隱藏護照結束頁
            if (formSection) formSection.classList.remove('hidden');
            if (endingScreen) endingScreen.classList.add('hidden');
            
            steps.forEach((step, idx) => {
                if (step) {
                    if (idx === stepNum - 1) {
                        step.classList.remove('hidden');
                    } else {
                        step.classList.add('hidden');
                    }
                }
            });
        } else if (stepNum === 4) {
            // 隱藏表單區、顯示護照結束頁！
            if (formSection) formSection.classList.add('hidden');
            if (endingScreen) endingScreen.classList.remove('hidden');
        }

        progressSteps.forEach((pStep, idx) => {
            if (pStep) {
                if (idx < stepNum) {
                    pStep.classList.add('active');
                } else {
                    pStep.classList.remove('active');
                }
            }
        });

        progressLines.forEach((pLine, idx) => {
            if (pLine) {
                if (idx < stepNum - 1) {
                    pLine.style.backgroundColor = '#bca46a';
                } else {
                    pLine.style.backgroundColor = 'rgba(188, 164, 106, 0.2)';
                }
            }
        });

        // 滾動畫面至對應區塊
        const scrollTarget = stepNum <= 3 ? formSection : endingScreen;
        if (scrollTarget) {
            scrollTarget.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // 為所有步驟點選設定切換監聽
    progressSteps.forEach((pStep, idx) => {
        if (pStep) {
            pStep.addEventListener('click', () => {
                const stepNum = idx + 1;
                // 允許使用者隨時點點點自由切換
                goToStep(stepNum);
            });
        }
    });

    // Step 2 & 3 前後按鈕監聽
    const step2Prev = document.getElementById('step-2-prev');
    const step2Next = document.getElementById('step-2-next');
    const step3Prev = document.getElementById('step-3-prev');
    const step3Finish = document.getElementById('step-3-finish');

    if (step2Prev) step2Prev.addEventListener('click', () => goToStep(1));
    if (step2Next) step2Next.addEventListener('click', () => goToStep(3));
    if (step3Prev) step3Prev.addEventListener('click', () => goToStep(2));
    
    // Step 3 完成按鈕 (觸發極奢 2s 護照動畫 + Ending 儀式)
    if (step3Finish) {
        step3Finish.addEventListener('click', () => {
            const nameVal = inputs.name.value.trim() || boardingNameInput.value.trim() || 'Alex';
            
            // Helper: 裁切與限制字數 (20-30 字，最多兩行)
            const shortenText = (str, maxLen = 35) => {
                const text = str ? str.trim() : '';
                if (text.length <= maxLen) return text;
                return text.substring(0, maxLen) + '...';
            };

            // AI Badge 判斷引擎 (根據使用者的回答特徵分配角色徽章)
            let badge = "Builder"; // 預設
            const currentStep2Answers = updateStep2Selections();
            const allAnswersText = (
                (inputs.exp ? inputs.exp.value : '') + 
                (inputs.background ? inputs.background.value : '') +
                (inputs.talent ? inputs.talent.value : '') +
                (formatStep2Answer(currentStep2Answers.q1) + ' ' + formatStep2Answer(currentStep2Answers.q2) + ' ' + formatStep2Answer(currentStep2Answers.q3))
            ).toLowerCase();

            if (allAnswersText.includes('figma') || allAnswersText.includes('設計') || allAnswersText.includes('介面') || allAnswersText.includes('體驗')) {
                badge = "Creator";
            } else if (allAnswersText.includes('溝通') || allAnswersText.includes('協調') || allAnswersText.includes('跨部門') || allAnswersText.includes('團隊')) {
                badge = "Connector";
            } else if (allAnswersText.includes('數據') || allAnswersText.includes('sql') || allAnswersText.includes('分析') || allAnswersText.includes('指標')) {
                badge = "Problem Solver";
            } else if (allAnswersText.includes('海外') || allAnswersText.includes('異地') || allAnswersText.includes('獨旅') || allAnswersText.includes('交換')) {
                badge = "Explorer";
            } else if (allAnswersText.includes('北極星') || allAnswersText.includes('願景') || allAnswersText.includes('理想') || allAnswersText.includes('目標')) {
                badge = "Visionary";
            }

            // 一句 AI Summary 描述 (用於 1080x1350 分享卡)
            let aiSummary = "一個熱愛探索未知並勇於與團隊協同前進的產品探險家。";
            if (badge === "Creator") {
                aiSummary = "專注於極致的使用者體驗，用設計思維雕琢精品產品的創造者。";
            } else if (badge === "Connector") {
                aiSummary = "擅長凝聚團隊向心力、串聯跨部門資源的溫柔溝通大師。";
            } else if (badge === "Problem Solver") {
                aiSummary = "數據導向、在混亂的 bug 中用嚴密邏輯為團隊破局的解決者。";
            } else if (badge === "Explorer") {
                aiSummary = "帶著豐富異地視野、為團隊注入多元冒險與探索動能的開路先鋒。";
            } else if (badge === "Visionary") {
                aiSummary = "擁有宏觀視野、精準鎖定 Northern Star 航向未來彼岸的領航者。";
            }

            // 1. 填入使用者自訂的護照資訊
            const passportName = document.getElementById('pass-name');
            const passportSeat = document.getElementById('pass-seat');
            const passportGate = document.getElementById('pass-gate');
            const passportDate = document.getElementById('pass-date');
            const passportId = document.getElementById('pass-id');
            const passBadge = document.getElementById('pass-badge');
            const passPhotoBadge = document.getElementById('badge-label-photo');

            if (passportName) passportName.textContent = nameVal.toUpperCase();
            if (passportSeat) passportSeat.textContent = '12D';
            if (passportGate) passportGate.textContent = '小樹屋';
            if (passBadge) passBadge.textContent = badge.toUpperCase();
            if (passPhotoBadge) passPhotoBadge.textContent = badge.toUpperCase();
            
            const today = new Date();
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const dateStr = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
            if (passportDate) passportDate.textContent = dateStr;

            // 自動產生獨一無二的 Passport ID
            const randomIdSuffix = Math.floor(1000 + Math.random() * 9000);
            const generatedId = `TWN-2026PM-${randomIdSuffix}`;
            if (passportId) passportId.textContent = generatedId;

            // 填寫右頁的重點摘要 (每個區塊只保留2-3個，每則回答精簡在 20-30 字，最多兩行)
            const sumPivot = document.getElementById('sum-pivot');
            const sumProud = document.getElementById('sum-proud');
            const sumTalent = document.getElementById('sum-talent');
            const sumFutureStar = document.getElementById('sum-future-star');
            const sumFutureProj = document.getElementById('sum-future-proj');
            const sumFutureLife = document.getElementById('sum-future-life');
            const sumPresentVal = document.getElementById('sum-present-val');
            const sumPresentSupport = document.getElementById('sum-present-support');

            if (sumPivot) sumPivot.textContent = shortenText(inputs.pivot.value) || '決定轉行 PM 的那天';
            if (sumProud) sumProud.textContent = shortenText((inputs.proud && inputs.proud.value.trim()) || '') || '獨立完成一個新產品';
            if (sumTalent) sumTalent.textContent = shortenText((inputs.talent && inputs.talent.value.trim()) || '') || '精通調酒 / 咖啡拉花';

            const futureStarSummary = [formatStep2Answer(currentStep2Answers.q1), formatStep2Answer(currentStep2Answers.q2)].filter(Boolean).join(' / ');
            const futureProjSummary = [formatStep2Answer(currentStep2Answers.q4), formatStep2Answer(currentStep2Answers.q10)].filter(Boolean).join(' / ');
            const futureLifeSummary = [formatStep2Answer(currentStep2Answers.q7), formatStep2Answer(currentStep2Answers.q8)].filter(Boolean).join(' / ');
            if (sumFutureStar) sumFutureStar.textContent = shortenText(futureStarSummary, 40) || '游刃有餘的 Senior PM';
            if (sumFutureProj) sumFutureProj.textContent = shortenText(futureProjSummary, 40) || '優化結帳流程 / 系統重構';
            if (sumFutureLife) sumFutureLife.textContent = shortenText(futureLifeSummary, 40) || '考取潛水執照 / 跑半馬';
            
            const pSupportHard = inputs.presentSupportHard.value.trim();
            const pSupportSoft = inputs.presentSupportSoft.value.trim();
            const combinedAssets = [pSupportHard, pSupportSoft].filter(Boolean).join('、');
            if (sumPresentVal) sumPresentVal.textContent = shortenText(combinedAssets, 40) || '技術可行性快速評估、Figma';
            
            const pNeedWork = inputs.presentNeedWork.value.trim();
            const pNeedLife = inputs.presentNeedLife.value.trim();
            const combinedNeeds = [pNeedWork, pNeedLife].filter(Boolean).join('、');
            if (sumPresentSupport) sumPresentSupport.textContent = shortenText(combinedNeeds, 40) || '數據工具教學、求運動揪團';

            // 填寫 1080x1350 分享卡 (Share Card) 資料
            const shareName = document.getElementById('share-name');
            const shareBadge = document.getElementById('share-badge');
            const shareDest = document.getElementById('share-dest');
            const shareHelp = document.getElementById('share-help');
            const shareNeed = document.getElementById('share-need');
            const shareAiSummary = document.getElementById('share-ai-summary');
            const shareDate = document.getElementById('share-date');
            const shareId = document.getElementById('share-id');

            if (shareName) shareName.textContent = nameVal;
            if (shareBadge) shareBadge.textContent = badge.toUpperCase();
            if (shareDest) shareDest.textContent = (formatStep2Answer(currentStep2Answers.q8) || 'Future & Growth').toUpperCase();
            if (shareHelp) shareHelp.textContent = pSupportHard || 'Figma / SQL Analysis';
            if (shareNeed) shareNeed.textContent = pNeedWork || 'Technical Architecture';
            if (shareAiSummary) shareAiSummary.textContent = aiSummary;
            if (shareDate) shareDate.textContent = dateStr;
            if (shareId) shareId.textContent = generatedId;

            // 2. 開始播約 2 秒極致精緻動畫：
            // - 蓋最後一個 Present 簽證章 (0.5 秒)
            // - 護照合上 (0.5 秒)
            // - 護照重新打開 (0.5 秒)
            // - 出現 Export Button 與 Completed Banner (0.5 秒)
            const passportBook = document.getElementById('my-passport-book');
            const stampPast = document.getElementById('stamp-past');
            const stampFuture = document.getElementById('stamp-future');
            const stampPresent = document.getElementById('stamp-present');
            const pageLeft = document.getElementById('passport-page-left-element');
            const pageRight = document.getElementById('passport-page-right-element');

            // 確保 Step 4 進度條顯示並標註 active
            const step4 = document.getElementById('progress-step-4');
            const line3 = document.getElementById('progress-line-3');
            if (step4) step4.classList.remove('hidden');
            if (line3) line3.classList.remove('hidden');

            goToStep(4); // 先跳轉到第 4 步 (顯示個人護照頁)

            // 初始設定為打開狀態，前兩個章蓋好
            passportBook.className = 'passport-book state-open';
            if (pageLeft) pageLeft.classList.remove('hidden');
            if (pageRight) pageRight.classList.remove('hidden');
            if (stampPast) stampPast.classList.add('stamped');
            if (stampFuture) stampFuture.classList.add('stamped');
            if (stampPresent) {
                stampPresent.classList.remove('stamped');
                stampPresent.classList.remove('stamping');
            }

            // 1) 蓋最後一個 Present 章 (0s -> 0.5s)
            setTimeout(() => {
                if (stampPresent) {
                    stampPresent.classList.add('stamping');
                    stampPresent.classList.add('stamped');
                }
            }, 100);

            // 2) 護照關閉 (0.6s -> 1.1s)
            setTimeout(() => {
                passportBook.className = 'passport-book state-closed';
                if (pageLeft) pageLeft.classList.add('hidden');
                if (pageRight) pageRight.classList.add('hidden');
            }, 650);

            // 3) 護照再打開 (1.1s -> 1.6s)
            setTimeout(() => {
                passportBook.className = 'passport-book state-open';
                if (pageLeft) pageLeft.classList.remove('hidden');
                if (pageRight) pageRight.classList.remove('hidden');
            }, 1150);

            // 4) 顯示完整 Passport 暨 Export Buttons & Team Building (1.6s -> 2s)
            setTimeout(() => {
                const actionsPanel = document.getElementById('passport-actions-panel');
                const flightCompletedSec = document.getElementById('team-flight-completed-section');
                if (actionsPanel) actionsPanel.className = 'passport-actions-panel opacity-100';
                if (flightCompletedSec) flightCompletedSec.className = 'team-flight-completed-section opacity-100 animate-lit';

                // 閃爍金光
                const actionsBtn = document.getElementById('btn-copy-passport');
                if (actionsBtn) actionsBtn.classList.add('btn-gold-pulse');

                // 生成並插入最新的個人畫像卡
                renderToGallery();

                // 解鎖隊員藝廊
                unlockGallery();
            }, 1650);
        });
    }

    // ==========================================================================
    // Export 功能 (Copy as Image & Download PNG)
    // ==========================================================================
    const btnCopyPassport = document.getElementById('btn-copy-passport');
    const btnDownloadPassport = document.getElementById('btn-download-passport');

    if (btnCopyPassport) {
        btnCopyPassport.addEventListener('click', () => {
            const exportTarget = document.getElementById('passport-to-export');
            if (!exportTarget) return;

            // 提示生成中
            const originalText = btnCopyPassport.innerHTML;
            btnCopyPassport.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Rendering...`;
            btnCopyPassport.disabled = true;

            html2canvas(exportTarget, {
                scale: 2, // 2x 縮放剛好達成 1200 x 1600 px 導出
                backgroundColor: null,
                useCORS: true
            }).then(canvas => {
                canvas.toBlob(blob => {
                    if (navigator.clipboard && navigator.clipboard.write) {
                        navigator.clipboard.write([
                            new ClipboardItem({ 'image/png': blob })
                        ]).then(() => {
                            btnCopyPassport.innerHTML = `<i class="fa-solid fa-circle-check"></i> Copied to Clipboard!`;
                            btnCopyPassport.classList.add('btn-success-green');
                            
                            // 提示訊息
                            const notify = document.createElement('div');
                            notify.style.cssText = `
                                position: fixed;
                                bottom: 2rem;
                                left: 50%;
                                transform: translateX(-50%) translateY(20px);
                                background: #27ae60;
                                color: #ffffff;
                                padding: 0.8rem 2rem;
                                border-radius: 30px;
                                font-weight: 700;
                                box-shadow: 0 10px 20px rgba(0,0,0,0.3);
                                z-index: 10000;
                                opacity: 0;
                                transition: all 0.4s ease;
                            `;
                            notify.innerHTML = `📋 護照圖片已成功複製！您可以直接貼到 Slack, Discord 或 LINE 分享給同事囉！`;
                            document.body.appendChild(notify);
                            setTimeout(() => {
                                notify.style.opacity = '1';
                                notify.style.transform = 'translateX(-50%) translateY(0)';
                            }, 50);
                            setTimeout(() => {
                                notify.style.opacity = '0';
                                notify.style.transform = 'translateX(-50%) translateY(-20px)';
                                setTimeout(() => notify.remove(), 400);
                            }, 4500);

                            setTimeout(() => {
                                btnCopyPassport.innerHTML = originalText;
                                btnCopyPassport.disabled = false;
                                btnCopyPassport.classList.remove('btn-success-green');
                            }, 3000);
                        }).catch(err => {
                            console.error('Clipboard copy failed: ', err);
                            fallbackDownload(canvas, originalText);
                        });
                    } else {
                        fallbackDownload(canvas, originalText);
                    }
                }, 'image/png');
            }).catch(err => {
                console.error('html2canvas render error: ', err);
                btnCopyPassport.innerHTML = originalText;
                btnCopyPassport.disabled = false;
            });
        });
    }

    function fallbackDownload(canvas, originalText) {
        // 當 Clipboard API 不支援時，直接轉換為下載
        const link = document.createElement('a');
        link.download = `PM_Passport_${inputs.name.value.trim() || 'Passenger'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        btnCopyPassport.innerHTML = `<i class="fa-solid fa-circle-check"></i> Downloaded!`;
        setTimeout(() => {
            btnCopyPassport.innerHTML = originalText;
            btnCopyPassport.disabled = false;
        }, 2500);
    }

    if (btnDownloadPassport) {
        btnDownloadPassport.addEventListener('click', () => {
            const exportTarget = document.getElementById('passport-to-export');
            if (!exportTarget) return;

            const originalText = btnDownloadPassport.innerHTML;
            btnDownloadPassport.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Downloading...`;
            btnDownloadPassport.disabled = true;

            html2canvas(exportTarget, {
                scale: 2, // 1200x1600 px 高畫質
                backgroundColor: null,
                useCORS: true
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `PM_Passport_${inputs.name.value.trim() || 'Passenger'}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();

                btnDownloadPassport.innerHTML = `<i class="fa-solid fa-circle-check"></i> Download Complete!`;
                btnDownloadPassport.classList.add('btn-success-green');

                setTimeout(() => {
                    btnDownloadPassport.innerHTML = originalText;
                    btnDownloadPassport.disabled = false;
                    btnDownloadPassport.classList.remove('btn-success-green');
                }, 3000);
            }).catch(err => {
                console.error('html2canvas error: ', err);
                btnDownloadPassport.innerHTML = originalText;
                btnDownloadPassport.disabled = false;
            });
        });
    }

    // 新增：Download 1080x1350 Share Card 功能
    const btnDownloadShareCard = document.getElementById('btn-download-sharecard');
    if (btnDownloadShareCard) {
        btnDownloadShareCard.addEventListener('click', () => {
            const shareCardTarget = document.getElementById('share-card-to-export');
            if (!shareCardTarget) return;

            const originalText = btnDownloadShareCard.innerHTML;
            btnDownloadShareCard.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Exporting...`;
            btnDownloadShareCard.disabled = true;

            html2canvas(shareCardTarget, {
                scale: 1, // Sized exactly at 1080 x 1350 px
                backgroundColor: null,
                useCORS: true
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `PM_ShareCard_${inputs.name.value.trim() || 'Passenger'}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();

                btnDownloadShareCard.innerHTML = `<i class="fa-solid fa-circle-check"></i> Card Exported!`;
                btnDownloadShareCard.classList.add('btn-success-green');

                setTimeout(() => {
                    btnDownloadShareCard.innerHTML = originalText;
                    btnDownloadShareCard.disabled = false;
                    btnDownloadShareCard.classList.remove('btn-success-green');
                }, 3000);
            }).catch(err => {
                console.error('html2canvas error exporting share card: ', err);
                btnDownloadShareCard.innerHTML = originalText;
                btnDownloadShareCard.disabled = false;
            });
        });
    }

    // ==========================================================================
    // Team Building: 查看所有旅客護照與彈出視窗
    // ==========================================================================
    const btnViewAllPassports = document.getElementById('btn-view-all-passports');
    if (btnViewAllPassports) {
        btnViewAllPassports.addEventListener('click', () => {
            // 點選後直接平滑滾動至本日行程藝廊
            document.querySelector('.gallery-section').scrollIntoView({ behavior: 'smooth' });
        });
    }

    const modal = document.getElementById('colleague-passport-modal');
    const modalClose = document.getElementById('btn-close-modal');
    const modalOverlay = document.getElementById('passport-modal-overlay-element');

    function closeModal() {
        if (modal) modal.classList.remove('active');
        setTimeout(() => {
            if (modal) modal.classList.add('hidden');
        }, 300);
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    // ==========================================================================
    // 產生卡片與 1-Step 轉到 2-Step 邏輯
    // ==========================================================================
    let isGalleryUnlocked = true;

    function unlockGallery() {
        isGalleryUnlocked = true;
        const cards = document.querySelectorAll('.gallery-grid .profile-card');
        cards.forEach(card => {
            card.classList.remove('is-locked');
        });
    }

    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // 先切到 Step 2，讓使用者完成 Step 2 / Step 3 後再生成卡片
        setTimeout(() => {
            goToStep(2);
        }, 300);
    });

    // ==========================================================================
    // 預設 3 張成員的卡片 (Mock Member Cards) - 星宇精品黑金配色
    // ==========================================================================
    const mockMembers = [
        {
            name: "Molly",
            avatar: "MO",
            background: "🎓 心理學系 / 擅長使用者行為研究",
            exp: "✈️ 曾獨旅歐洲 5 國 30 天 / 與當地人合辦沙發客派對",
            pivot: "💡 發現自己喜歡協調溝通大於學術研究，毅然決然跨入網路業",
            pit: "💥 首次負責大改版時需求沒留下任何 Traceability，最後跟工程師對齊到哭",
            proud: "🏆 獨立帶領 3 位工程師，將產品首頁轉換率成功拉升了 35%",
            talent: "🎭 業餘現代舞舞者 / 精通日語 (N1 滿分)",
            funfact: "🦖 一天可以喝完 2 大瓶 1000ml 的無糖綠茶",
            influence: "📚 《關鍵少數》",
            quote: "擁抱混亂，這才是 PM 的真實日常",
            avatarBg: "linear-gradient(135deg, #bca46a 0%, #8b7443 100%)",
            step2: {
                q1: { choices: ['A. 專案推手'], other: '' },
                q2: { choices: ['C. 溝通與影響力'], other: '' },
                q3: { choices: ['C. 故事力與簡報說服力'], other: '' },
                q4: { choices: ['B. AI / 自動化落地專案'], other: '' },
                q5: { choices: ['A. 太晚說不'], other: '' },
                q6: { choices: ['B. 知識輸出'], other: '' },
                q7: { choices: ['B. 技能與興趣'], other: '' },
                q8: { choices: ['A. 日韓近郊放鬆'], other: '' },
                q9: { choices: ['A. 垂直升遷'], other: '' },
                q10: { choices: ['B. 實戰技能'], other: '' }
            },
            step3: [
                { label: '☕ 早上開機必備儀式', value: '一杯拿鐵 + 走 10 分鐘' },
                { label: '⚡ 跟你溝通最順暢的小撇步', value: '直接說重點，不要來回拉扯' }
            ]
        },
        {
            name: "David",
            avatar: "DA",
            background: "🎓 資訊管理系 / 程式底子強的 Technical PM",
            exp: "✈️ 曾在新加坡跨國科技公司實習半年，體驗過極速的敏捷開發",
            pivot: "💡 發現比起寫 Code，自己更擅長定義產品商業價值與帶領團隊",
            pit: "💥 相信了客戶的「只是微調一個欄位」，導致整條 API 邏輯被打掉重寫，專案差點開天窗",
            proud: "🏆 成功推動內部團隊導入 Jira 看板，為大家節省了 40% 的雜務統計時間",
            talent: "🎭 特殊專長是速讀 / 3 分鐘內能組好一顆魔術方塊",
            funfact: "🦖 其實是不折不扣的香菜狂熱者，連吃皮蛋豆腐都要灑滿香菜",
            influence: "📚 《原子習慣》",
            quote: "不追求完美的產品，只追求每天都在前進的團隊",
            avatarBg: "linear-gradient(135deg, #e0a96d 0%, #b87d4b 100%)",
            step2: {
                q1: { choices: ['B. 產品大腦'], other: '' },
                q2: { choices: ['A. 技術與數據'], other: '' },
                q3: { choices: ['A. 向上管理與期待控制'], other: '' },
                q4: { choices: ['C. 系統重構 / 技術債清理'], other: '' },
                q5: { choices: ['C. 憑直覺決策'], other: '' },
                q6: { choices: ['A. 工作自動化'], other: '' },
                q7: { choices: ['C. 深度閱讀 / 考照'], other: '' },
                q8: { choices: ['B. 東南亞海島度假'], other: '' },
                q9: { choices: ['B. 橫向跳槽'], other: '' },
                q10: { choices: ['C. 職涯解答'], other: '' }
            },
            step3: [
                { label: '☕ 早上開機必備儀式', value: '先看 Jira 看板，再整理待辦' },
                { label: '💡 你可以給團隊的硬核支援', value: '擅長把技術與需求一起翻譯成可執行方案' }
            ]
        },
        {
            name: "Cindy",
            avatar: "CI",
            background: "🎓 外國語文學系 / 擅長跨部門專案管理",
            exp: "✈️ 大學時期前往美國迪士尼樂園進行為期 4 個月的海外工作體驗",
            pivot: "💡 擔任專案秘書時被主管發掘其強大的邏輯與協調天賦，正式踏上 PM 之路",
            pit: "💥 當初沒抓好時程緩衝（Buffer），加上外包團隊突發狀況，專案延期了整整一個半月",
            proud: "🏆 從零到一主導公司核心跨部門新產品上線，如期在預算內成功發佈",
            talent: "🎭 特殊才藝是咖啡拉花冠軍 / 精通星座命理分析",
            funfact: "🦖 曾經在冰島獨旅時被一群羊瘋狂追趕了 200 公尺才脫險",
            influence: "📚 《設計思考改造世界》",
            quote: "溫柔地堅持原則，是 PM 最強大的超能力",
            avatarBg: "linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)",
            step2: {
                q1: { choices: ['D. 團隊導師'], other: '' },
                q2: { choices: ['B. 產品與商業感'], other: '' },
                q3: { choices: ['B. 衝突化解與談判力'], other: '' },
                q4: { choices: ['A. 0 到 1 破局專案'], other: '' },
                q5: { choices: ['B. 拖延關鍵溝通'], other: '' },
                q6: { choices: ['C. 定期高質量復盤'], other: '' },
                q7: { choices: ['A. 身體解鎖'], other: '' },
                q8: { choices: ['C. 歐美深度探索'], other: '' },
                q9: { choices: ['C. 跨國 / 遠端'], other: '' },
                q10: { choices: ['D. 抱團取暖'], other: '' }
            },
            step3: [
                { label: '☕ 早上開機必備儀式', value: '先整理待辦卡，再做一杯手沖咖啡' },
                { label: '🍔 你可以給團隊的私房支援', value: '很會替大家安排團購和暖心小禮物' }
            ]
        }
    ];

    // 初始化載入 Mock 卡片
    function initMockCards() {
        if (galleryEmpty) {
            galleryEmpty.classList.add('hidden');
        }
        if (galleryGrid) {
            galleryGrid.classList.remove('hidden');
            
            mockMembers.forEach(member => {
                const cardHtml = `
                    <div class="profile-card is-locked">
                        <div class="card-status-bar"></div>
                        <div class="card-header">
                            <div class="card-avatar" style="background: ${member.avatarBg}">${member.avatar}</div>
                            <div class="card-header-info">
                                <h3>${member.name}</h3>
                                <p class="card-sub">${member.background}</p>
                            </div>
                        </div>
                        <div class="customs-stamp">APPROVED / CLEARED</div>

                        <div class="card-body">
                            <div class="card-item">
                                <span class="card-icon"><i class="fa-solid fa-plane-departure"></i></span>
                                <div class="card-item-content">
                                    <label>最酷異地經歷</label>
                                    <p>${member.exp}</p>
                                </div>
                            </div>

                            <div class="card-item">
                                <span class="card-icon"><i class="fa-solid fa-arrows-spin"></i></span>
                                <div class="card-item-content">
                                    <label>職涯 Pivot 轉折點</label>
                                    <p>${member.pivot}</p>
                                </div>
                            </div>

                            <div class="card-item font-danger">
                                <span class="card-icon"><i class="fa-solid fa-skull-crossbones"></i></span>
                                <div class="card-item-content">
                                    <label>踩過最大的坑</label>
                                    <p>${member.pit}</p>
                                </div>
                            </div>

                            <div class="card-item">
                                <span class="card-icon"><i class="fa-solid fa-trophy"></i></span>
                                <div class="card-item-content">
                                    <label>最引以為傲的事</label>
                                    <p>${member.proud}</p>
                                </div>
                            </div>

                            <div class="card-grid-2">
                                <div class="card-item">
                                    <span class="card-icon"><i class="fa-solid fa-masks-theater"></i></span>
                                    <div class="card-item-content">
                                        <label>隱藏才藝</label>
                                        <p>${member.talent}</p>
                                    </div>
                                </div>
                                <div class="card-item">
                                    <span class="card-icon"><i class="fa-solid fa-dragon"></i></span>
                                    <div class="card-item-content">
                                        <label>Fun Fact</label>
                                        <p>${member.funfact}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="card-item">
                                <span class="card-icon"><i class="fa-solid fa-book"></i></span>
                                <div class="card-item-content">
                                    <label>推薦書/電影</label>
                                    <p>${member.influence}</p>
                                </div>
                            </div>
                        </div>

                        <div class="card-tabs">
                            <button type="button" class="card-tab active" data-tab="step2">Step 2</button>
                            <button type="button" class="card-tab" data-tab="step3">Step 3</button>
                        </div>
                        <div class="card-tab-panels">
                            <div class="card-tab-panel active" data-panel="step2">${buildStep2PanelHtml(member.step2 || {})}</div>
                            <div class="card-tab-panel" data-panel="step3">${buildStep3PanelHtml(member.step3 || [])}</div>
                        </div>

                        <div class="card-footer">
                            <div class="quote-container">
                                <i class="fa-solid fa-quote-left quote-icon-left"></i>
                                <p id="card-quote">${member.quote}</p>
                                <i class="fa-solid fa-quote-right quote-icon-right"></i>
                            </div>
                        </div>

                        <div class="card-lock-overlay">
                            <div class="lock-icon">🔒</div>
                            <div class="lock-text">海關查驗中：請先完成並送出您的機票表單以解鎖隊員檔案</div>
                        </div>
                    </div>
                `;
                
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = cardHtml.trim();
                const node = tempDiv.firstChild;
                attachCardTabHandlers(node);
                galleryGrid.appendChild(node);
            });
        }
    }

    // 啟動載入 Mock 卡片
    initMockCards();

    // 渲染自填卡片到藝廊
    function renderToGallery() {
        // 直接從 inputs 與 defaults 擷取目前的所有填寫值
        const currentName = (inputs.name && inputs.name.value.trim()) || defaults.name;
        const inputBg = inputs.background && inputs.background.value.trim();
        const currentBackground = inputBg ? `🎓 ${inputBg}` : defaults.background;
        const currentExp = (inputs.exp && inputs.exp.value.trim()) || defaults.exp;
        const currentPivot = (inputs.pivot && inputs.pivot.value.trim()) || defaults.pivot;
        const currentPit = (inputs.pit && inputs.pit.value.trim()) || defaults.pit;
        const currentProud = (inputs.proud && inputs.proud.value.trim()) || defaults.proud;
        const currentTalent = (inputs.talent && inputs.talent.value.trim()) || defaults.talent;
        const currentFunfact = (inputs.funfact && inputs.funfact.value.trim()) || defaults.funfact;
        const currentInfluence = (inputs.influence && inputs.influence.value.trim()) || defaults.influence;
        const currentQuote = (inputs.quote && inputs.quote.value.trim()) || defaults.quote;
        const currentAvatar = currentName.substring(0, 2).toUpperCase();
        const currentStep2Answers = updateStep2Selections();
        const currentStep3Answers = collectStep3Answers();

        // 生成一個不重複的隨機背景顏色，讓藝廊更繽紛
        const hue = Math.floor(Math.random() * 360);
        const randomAvatarBg = `linear-gradient(135deg, hsl(${hue}, 70%, 45%) 0%, hsl(${(hue + 40) % 360}, 80%, 35%) 100%)`;

        const lockClass = isGalleryUnlocked ? "" : "is-locked";

        // 建立精巧的全新畫像卡 HTML 結構
        const cardHtml = `
            <div class="profile-card ${lockClass}" style="opacity: 0; transform: scale(0.9); transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <div class="card-status-bar"></div>
                <div class="card-header">
                    <div class="card-avatar" style="background: ${randomAvatarBg}">${currentAvatar}</div>
                    <div class="card-header-info">
                        <h3>${currentName}</h3>
                        <p class="card-sub">${currentBackground}</p>
                    </div>
                </div>
                <div class="customs-stamp">APPROVED / CLEARED</div>

                <div class="card-body">
                    <div class="card-item">
                        <span class="card-icon"><i class="fa-solid fa-plane-departure"></i></span>
                        <div class="card-item-content">
                            <label>最酷異地經歷</label>
                            <p>${currentExp}</p>
                        </div>
                    </div>

                    <div class="card-item">
                        <span class="card-icon"><i class="fa-solid fa-arrows-spin"></i></span>
                        <div class="card-item-content">
                            <label>職涯 Pivot 轉折點</label>
                            <p>${currentPivot}</p>
                        </div>
                    </div>

                    <div class="card-item font-danger">
                        <span class="card-icon"><i class="fa-solid fa-skull-crossbones"></i></span>
                        <div class="card-item-content">
                            <label>踩過最大的坑</label>
                            <p>${currentPit}</p>
                        </div>
                    </div>

                    <div class="card-item">
                        <span class="card-icon"><i class="fa-solid fa-trophy"></i></span>
                        <div class="card-item-content">
                            <label>最引以為傲的事</label>
                            <p>${currentProud}</p>
                        </div>
                    </div>

                    <div class="card-grid-2">
                        <div class="card-item">
                            <span class="card-icon"><i class="fa-solid fa-masks-theater"></i></span>
                            <div class="card-item-content">
                                <label>隱藏才藝</label>
                                <p>${currentTalent}</p>
                            </div>
                        </div>
                        <div class="card-item">
                            <span class="card-icon"><i class="fa-solid fa-dragon"></i></span>
                            <div class="card-item-content">
                                <label>Fun Fact</label>
                                <p>${currentFunfact}</p>
                            </div>
                        </div>
                    </div>

                    <div class="card-item">
                        <span class="card-icon"><i class="fa-solid fa-book"></i></span>
                        <div class="card-item-content">
                            <label>推薦書/電影</label>
                            <p>${currentInfluence}</p>
                        </div>
                    </div>
                </div>

                <div class="card-tabs">
                    <button type="button" class="card-tab active" data-tab="step2">Step 2</button>
                    <button type="button" class="card-tab" data-tab="step3">Step 3</button>
                </div>
                <div class="card-tab-panels">
                    <div class="card-tab-panel active" data-panel="step2">${buildStep2PanelHtml(currentStep2Answers)}</div>
                    <div class="card-tab-panel" data-panel="step3">${buildStep3PanelHtml(currentStep3Answers)}</div>
                </div>

                <div class="card-footer">
                    <div class="quote-container">
                        <i class="fa-solid fa-quote-left quote-icon-left"></i>
                        <p id="card-quote">${currentQuote}</p>
                        <i class="fa-solid fa-quote-right quote-icon-right"></i>
                    </div>
                </div>

                <div class="card-lock-overlay">
                    <div class="lock-icon">🔒</div>
                    <div class="lock-text">海關查驗中：請先完成並送出您的機票表單以解鎖隊員檔案</div>
                </div>
            </div>
        `;

        // 將 HTML 轉換為 DOM 節點
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHtml.trim();
        const newCard = tempDiv.firstChild;
        attachCardTabHandlers(newCard);

        // 隱藏空狀態，顯示藝廊
        if (galleryEmpty) {
            galleryEmpty.classList.add('hidden');
        }
        if (galleryGrid) {
            galleryGrid.classList.remove('hidden');
            
            // 插入到藝廊的最前面
            galleryGrid.insertBefore(newCard, galleryGrid.firstChild);

            // 觸發滑順的淡入與放大動畫
            setTimeout(() => {
                newCard.style.opacity = '1';
                newCard.style.transform = 'scale(1)';
            }, 50);
        }
    }
});