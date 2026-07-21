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
            inputs.name.value = nameVal;
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
        
        // Future 10 題
        futureHard: document.getElementById('input-future-hard'),
        futureSoft: document.getElementById('input-future-soft'),
        futureProj: document.getElementById('input-future-proj'),
        futureLife: document.getElementById('input-future-life'),
        futureTravel: document.getElementById('input-future-travel'),
        futureHabit: document.getElementById('input-future-habit'),
        futureBad: document.getElementById('input-future-bad'),
        futureStar: document.getElementById('input-future-star'),
        futureBio: document.getElementById('input-future-bio'),
        futureGift: document.getElementById('input-future-gift'),
        
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
            const allAnswersText = (
                (inputs.exp ? inputs.exp.value : '') + 
                (inputs.background ? inputs.background.value : '') +
                (inputs.talent ? inputs.talent.value : '') +
                (inputs.futureHard ? inputs.futureHard.value : '')
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
            if (sumProud) sumProud.textContent = shortenText(inputs.proud.value) || '獨立完成一個新產品';
            if (sumTalent) sumTalent.textContent = shortenText(inputs.talent.value) || '精通調酒 / 咖啡拉花';
            if (sumFutureStar) sumFutureStar.textContent = shortenText(inputs.futureStar.value) || '游刃有餘的 Senior PM';
            if (sumFutureProj) sumFutureProj.textContent = shortenText(inputs.futureProj.value) || '優化結帳流程 / 系統重構';
            if (sumFutureLife) sumFutureLife.textContent = shortenText(inputs.futureLife.value) || '考取潛水執照 / 跑半馬';
            
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
            if (shareDest) shareDest.textContent = (inputs.futureTravel.value.trim() || 'Future & Growth').toUpperCase();
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

        // ----------------- 將卡片 Append 渲染進 Gallery 藝廊 -----------------
        renderToGallery();

        // 觸發解鎖機制
        setTimeout(() => {
            unlockGallery();
        }, 300);

        // 順利跳轉到 Step 2 (Future) 填寫頁面！
        setTimeout(() => {
            goToStep(2);
        }, 1200);
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
            avatarBg: "linear-gradient(135deg, #bca46a 0%, #8b7443 100%)"
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
            avatarBg: "linear-gradient(135deg, #e0a96d 0%, #b87d4b 100%)"
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
            avatarBg: "linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)"
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