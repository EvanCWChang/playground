// ==========================================================================
// Google Sheets 整合設定 (若要啟用雲端儲存與多人共享，請填入部署後的 Web App URL)
// ==========================================================================
const GOOGLE_SHEET_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby8mQSajp7nmhpQirCC2f7jmRooF5fJ9Yt85zopl009AjyGk1rCY1EAAV1aAS2wZPpyoQ/exec';

document.addEventListener('DOMContentLoaded', () => {
    let isGalleryUnlocked = false;
    let highestStepReached = 1;

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

    // 目的地即時同步到存根聯與側邊欄
    const sidebarDestination = document.getElementById('sidebar-destination');
    if (boardingDestinationInput && stubDestination) {
        boardingDestinationInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            stubDestination.textContent = val || 'Future & Growth';
            if (sidebarDestination) {
                sidebarDestination.textContent = val.toUpperCase() || 'FUTURE & GROWTH';
            }
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

            const sidebarPassenger = document.getElementById('sidebar-passenger-name');
            if (sidebarPassenger) {
                sidebarPassenger.textContent = nameVal;
            }

            // 1. 隱藏按鈕避免重複點擊
            boardingBtn.style.opacity = '0';
            boardingBtn.style.pointerEvents = 'none';

            // 2. 觸發極致絲滑的「機票向螢幕前方放大並淡出」3D 破風起飛動畫，避免卡頓 - 加速為 0.5s
            boardingPassCard.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
            boardingPassCard.style.transform = 'translate3d(0, -30px, 400px) rotateX(15deg) scale(1.5)';
            boardingPassCard.style.opacity = '0';

            // 3. 同步觸發背景遮罩柔和淡出轉場
            onboardingScreen.style.transition = 'all 0.5s ease-out';
            onboardingScreen.style.opacity = '0';

            // 4. 等待 500ms 動畫完結後，順暢、無縫切換到機艙頁面
            setTimeout(() => {
                onboardingScreen.classList.add('hidden');
                mainContent.classList.remove('hidden');
                
                // 顯示 Flight Information Widget
                const infoWidget = document.getElementById('flight-info-widget');
                if (infoWidget) {
                    infoWidget.classList.remove('hidden');
                }
                startWidgetClock();

                // 讓主畫面從深處縮放淡入，製造穿透雲霧進入機艙的沈浸感
                mainContent.style.opacity = '0';
                mainContent.style.transform = 'scale(0.98) translateY(10px)';
                mainContent.style.transition = 'none'; // 先重設
                void mainContent.offsetWidth; // 強制回流
                
                mainContent.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
                mainContent.style.opacity = '1';
                mainContent.style.transform = 'scale(1) translateY(0)';
                
                // 恢復首頁機票與 Onboarding Overlay 的狀態（隱藏在背景），以便後續按 Logo 正常回退
                setTimeout(() => {
                    boardingPassCard.style.transform = 'none';
                    boardingPassCard.style.opacity = '1';
                    onboardingScreen.style.opacity = '1';
                    boardingBtn.style.opacity = '1';
                    boardingBtn.style.pointerEvents = 'auto';
                }, 800);

                // 動畫初始化
                setTimeout(() => {
                    updatePlaneAnimations(1);
                    updateFlightStatus(1);
                }, 50);
            }, 500);
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
        
        // 隱藏 Flight Information Widget
        const infoWidget = document.getElementById('flight-info-widget');
        if (infoWidget) {
            infoWidget.classList.add('hidden');
        }

        // 每次回到首頁，都視為重新填寫，重置所有輸入欄位與步驟
        if (boardingNameInput) boardingNameInput.value = '';
        if (boardingDestinationInput) boardingDestinationInput.value = '';
        if (stubDestination) stubDestination.textContent = 'Future & Growth';

        // 重設 FIDS 顯示
        const fidsName = document.getElementById('user-fids-name');
        const fidsDest = document.getElementById('user-fids-dest');
        if (fidsName) fidsName.textContent = 'GUEST';
        if (fidsDest) fidsDest.textContent = 'FUTURE & GROWTH';

        // 移除所有 Passport Stamp 蓋章
        const stamps = document.querySelectorAll('.passport-stamp');
        stamps.forEach(s => s.classList.remove('stamped'));

        for (const key in inputs) {
            if (inputs[key]) {
                inputs[key].value = '';
            }
        }

        // 重新上鎖藝廊，確保每次填寫都重新體驗解鎖過程
        isGalleryUnlocked = false;
        const cards = document.querySelectorAll('.gallery-grid .profile-card');
        cards.forEach(card => {
            card.classList.add('is-locked');
        });

        // 步驟重置回 step 1 (不進行滾動，因為此時主內容區正被隱藏/淡出)
        highestStepReached = 1;
        goToStep(1, false);

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

        // 顯示 Flight Information Widget
        const infoWidget = document.getElementById('flight-info-widget');
        if (infoWidget) {
            infoWidget.classList.remove('hidden');
        }
        startWidgetClock();

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

            // 動畫初始化
            setTimeout(() => {
                updatePlaneAnimations(1);
                updateFlightStatus(1);
            }, 100);
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
    // Removed progressSteps array of old top progress bar, routing directly to left timeline clicks
    const timelineSteps = [
        document.getElementById('timeline-step-1'),
        document.getElementById('timeline-step-2'),
        document.getElementById('timeline-step-3')
    ];

    function isStepAccessible(stepNum) {
        return true; // Always allow users to freely click and jump between any checkpoint step in the timeline
    }

    function updateStepAccessibilityStyles() {
        timelineSteps.forEach((tStep, idx) => {
            if (tStep) {
                const currentStepIdx = idx + 1;
                if (isStepAccessible(currentStepIdx)) {
                    tStep.classList.add('clickable');
                } else {
                    tStep.classList.remove('clickable');
                }
            }
        });
    }

    function goToStep(stepNum, shouldScroll = true) {
        if (stepNum > highestStepReached) {
            highestStepReached = stepNum;
        }

        steps.forEach((step, idx) => {
            if (step) {
                if (idx === stepNum - 1) {
                    step.classList.remove('hidden');
                } else {
                    step.classList.add('hidden');
                }
            }
        });

        updateStepAccessibilityStyles();

        // Slide airplane animation & update status
        setTimeout(() => {
            updatePlaneAnimations(stepNum);
            updateFlightStatus(stepNum);
        }, 50);

        // 滾動畫面讓使用者看見表單頂部
        if (shouldScroll) {
            const formSection = document.querySelector('.form-section');
            if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    // 為步驟進度條及時間軸添加點擊監聽，只要是已填寫前面步驟，就可以自由切換
    timelineSteps.forEach((tStep, idx) => {
        if (tStep) {
            tStep.addEventListener('click', () => {
                const stepNum = idx + 1;
                if (isStepAccessible(stepNum)) {
                    goToStep(stepNum);
                }
            });
        }
    });

    if (inputs.name) {
        inputs.name.addEventListener('input', () => {
            updateStepAccessibilityStyles();
        });
    }

    // Step 2 & 3 前後按鈕監聽
    const step2Prev = document.getElementById('step-2-prev');
    const step2Next = document.getElementById('step-2-next');
    const step3Prev = document.getElementById('step-3-prev');
    const step3Finish = document.getElementById('step-3-finish');

    if (step2Prev) step2Prev.addEventListener('click', () => goToStep(1));
    if (step2Next) {
        step2Next.addEventListener('click', () => {
            triggerFullscreenTransition(
                'Immigration Cleared',
                'Proceeding to Departure Gate',
                'fa-passport',
                () => {
                    goToStep(3);
                }
            );
        });
    }
    if (step3Prev) step3Prev.addEventListener('click', () => goToStep(2));
    
    // Step 3 完成按鈕 (觸發極奢 2s 護照動畫 + Ending 儀式)
    if (step3Finish) {
        step3Finish.addEventListener('click', () => {
            const nameVal = inputs.name.value.trim() || boardingNameInput.value.trim() || 'Alex';
            
            triggerFullscreenTransition(
                'Completing Boarding',
                'Generating Your Premium PM Flight Passport',
                'fa-passport',
                () => {
                    // 1. 隱藏原有的 Step 3 表單區與側邊欄，讓 Ending Passport 專屬展示
                    const workspaceGrid = document.querySelector('.workspace-grid');
                    const passengerSection = document.querySelector('.passenger-checkin-section');
                    if (workspaceGrid) workspaceGrid.classList.add('hidden');
                    if (passengerSection) passengerSection.classList.add('hidden');

                    // 2. 顯示 Passport 結束頁面
                    const endingScreen = document.getElementById('passport-ending-screen');
                    if (endingScreen) endingScreen.classList.remove('hidden');

                    // 3. 填入使用者自訂的護照資訊
                    const passportName = document.getElementById('pass-name');
                    const passportSeat = document.getElementById('pass-seat');
                    const passportGate = document.getElementById('pass-gate');
                    const passportDate = document.getElementById('pass-date');
                    const passportId = document.getElementById('pass-id');

                    if (passportName) passportName.textContent = nameVal.toUpperCase();
                    if (passportSeat) passportSeat.textContent = '12D';
                    if (passportGate) passportGate.textContent = '小樹屋';
                    
                    const today = new Date();
                    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                    const dateStr = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
                    if (passportDate) passportDate.textContent = dateStr;

                    // 自動產生獨一無二的 Passport ID
                    const randomIdSuffix = Math.floor(1000 + Math.random() * 9000);
                    const generatedId = `TWN-2026PM-${randomIdSuffix}`;
                    if (passportId) passportId.textContent = generatedId;

                    // 填寫右頁的重點摘要
                    const sumPivot = document.getElementById('sum-pivot');
                    const sumProud = document.getElementById('sum-proud');
                    const sumTalent = document.getElementById('sum-talent');
                    const sumFutureStar = document.getElementById('sum-future-star');
                    const sumFutureProj = document.getElementById('sum-future-proj');
                    const sumFutureLife = document.getElementById('sum-future-life');
                    const sumPresentVal = document.getElementById('sum-present-val');
                    const sumPresentSupport = document.getElementById('sum-present-support');

                    if (sumPivot) sumPivot.textContent = inputs.pivot.value.trim() || '決定轉行 PM 的那天';
                    if (sumProud) sumProud.textContent = inputs.proud.value.trim() || '獨立完成一個新產品';
                    if (sumTalent) sumTalent.textContent = inputs.talent.value.trim() || '精通調酒 / 咖啡拉花';
                    if (sumFutureStar) sumFutureStar.textContent = inputs.futureStar.value.trim() || '游刃有餘的 Senior PM';
                    if (sumFutureProj) sumFutureProj.textContent = inputs.futureProj.value.trim() || '優化結帳流程 / 完成系統重構';
                    if (sumFutureLife) sumFutureLife.textContent = inputs.futureLife.value.trim() || '考取潛水執照 / 跑半馬';
                    
                    const pSupportHard = inputs.presentSupportHard.value.trim();
                    const pSupportSoft = inputs.presentSupportSoft.value.trim();
                    if (sumPresentVal) sumPresentVal.textContent = [pSupportHard, pSupportSoft].filter(Boolean).join('、') || '擅長寫規格文件、幫忙除錯 SQL';
                    
                    const pNeedWork = inputs.presentNeedWork.value.trim();
                    const pNeedLife = inputs.presentNeedLife.value.trim();
                    if (sumPresentSupport) sumPresentSupport.textContent = [pNeedWork, pNeedLife].filter(Boolean).join('、') || '需要數據工具教學、求運動揪團夥伴';

                    // 4. 開始播約 2 秒極致精緻動畫：
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

                        // 順利解鎖隊員
                        unlockGallery();

                        // 滾動到 Passport 結束畫面
                        endingScreen.scrollIntoView({ behavior: 'smooth' });
                    }, 1650);

                    // 同步到 FIDS 乘客名單 status 為 DEPARTED
                    updateFlightStatus(4);
                    updatePlaneAnimations(4);
                }
            );
        });
    }

    // ==========================================================================
    // 產生卡片與 1-Step 轉到 2-Step 邏輯
    // ==========================================================================
    // 產生卡片與 1-Step 轉到 2-Step 邏輯
    // ==========================================================================
    function unlockGallery() {
        isGalleryUnlocked = true;
        const cards = document.querySelectorAll('.gallery-grid .profile-card');
        cards.forEach(card => {
            card.classList.remove('is-locked');
        });
    }

    // ==========================================================================
    // Team Building: 查看所有旅客護照與彈出視窗
    // ==========================================================================
    const btnViewAllPassports = document.getElementById('btn-view-all-passports');
    if (btnViewAllPassports) {
        btnViewAllPassports.addEventListener('click', () => {
            // 點選後直接滑動到已通過海關成員藝廊
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
    function unlockGallery() {
        isGalleryUnlocked = true;
        const cards = document.querySelectorAll('.gallery-passport-card');
        cards.forEach((card, index) => {
            card.classList.remove('is-locked');
            // 移除鎖定遮罩
            const overlay = card.querySelector('.card-lock-overlay');
            if (overlay) overlay.remove();
            
            // 更新背景狀態條
            const statusBar = card.querySelector('.card-status-bar');
            if (statusBar) {
                statusBar.className = 'card-status-bar';
                statusBar.style.background = '#52c41a';
            }
        });
    }

    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // Validate name before proceeding
        const nameVal = inputs.name.value.trim();
        if (!nameVal) {
            inputs.name.style.borderColor = 'var(--accent-color)';
            inputs.name.focus();
            setTimeout(() => { inputs.name.style.borderColor = ''; }, 1000);
            return;
        }

        triggerFullscreenTransition(
            'Baggage Checked',
            'Proceeding to Passport Control',
            'fa-suitcase-rolling',
            () => {
                // 順利跳轉到 Step 2 (Future) 填寫頁面！
                goToStep(2);
            }
        );
    });

    // ==========================================================================
    // 預設 6 位成員的護照卡片資料 (Mock Member Cards) - 頂奢星宇黑金 + 護照封面風格
    // ==========================================================================
    const mockMembers = [
        {
            name: "Molly",
            avatar: "MO",
            background: "心理學系 / 擅長使用者行為研究",
            exp: "曾獨旅歐洲 5 國 30 天 / 與當地人合辦沙發客派對",
            pivot: "發現自己喜歡協調溝通大於學術研究，毅然決然跨入網路業",
            pit: "首次負責大改版時需求沒留下任何 Traceability，最後跟工程師對齊到哭",
            proud: "獨立帶領 3 位工程師，將產品首頁轉換率成功拉升了 35%",
            talent: "業餘現代舞舞者 / 精通日語 (N1 滿分)",
            funfact: "一天可以喝完 2 大瓶 1000ml 的無糖綠茶",
            influence: "《關鍵少數》",
            quote: "擁抱混亂，這才是 PM 的真實日常",
            seat: "1A",
            passportId: "TWN-2026PM-1124",
            futureStar: "游刃有餘的 Senior PM",
            futureProj: "重構核心數據追蹤系統",
            futureLife: "考取 PADI 進階潛水員",
            presentVal: "熟練 Figma / 開發者關係溝通",
            presentSupport: "求 React 實戰經驗、前端工程支援"
        },
        {
            name: "David",
            avatar: "DA",
            background: "資訊管理系 / 程式底子強的 Technical PM",
            exp: "曾在新加坡跨國科技公司實習半年，體驗過極速的敏捷開發",
            pivot: "發現比起寫 Code，自己更擅長定義產品商業價值與帶領團隊",
            pit: "相信了客戶的「只是微調一個欄位」，導致整條 API 邏輯被打掉重寫，專案差點開天窗",
            proud: "成功推動內部團隊導入 Jira 看板，為大家節省了 40% 的雜務統計時間",
            talent: "特殊專長是速讀 / 3 分鐘內能組好一顆魔術方塊",
            funfact: "其實是不折不扣的香菜狂熱者，連吃皮蛋豆腐都要灑滿香菜",
            influence: "《原子習慣》",
            quote: "不追求完美的產品，只追求每天都在前進的團隊",
            seat: "1B",
            passportId: "TWN-2026PM-2345",
            futureStar: "極具商業敏銳度的產品總監",
            futureProj: "主導推動 XC-Data 系統全面轉型",
            futureLife: "完成人生首次半馬 (21K)",
            presentVal: "幫忙除錯 SQL / 技術架構設計評估",
            presentSupport: "求精準的英文溝通培訓、推薦台北美味牛肉麵"
        },
        {
            name: "Cindy",
            avatar: "CI",
            background: "外國語文學系 / 擅長跨部門專案管理",
            exp: "大學時期前往美國迪士尼樂園進行為期 4 個月的海外工作體驗",
            pivot: "擔任專案秘書時被主管發掘其強大的邏輯與協調天賦，正式踏上 PM 之路",
            pit: "當初沒抓好時程緩衝（Buffer），加上外包團隊突發狀況，專案延期了整整一個半月",
            proud: "從零到一主導公司核心跨部門新產品上線，如期在預算內成功發佈",
            talent: "特殊才藝是咖啡拉花冠軍 / 精通星座命理分析",
            funfact: "曾經在冰島獨旅時被一群羊瘋狂追趕了 200 公尺才脫險",
            influence: "《設計思考改造世界》",
            quote: "溫柔地堅持原則，是 PM 最強大的超能力",
            seat: "1C",
            passportId: "TWN-2026PM-9481",
            futureStar: "卓越的國際專案管理專家",
            futureProj: "優化支付與物流系統、降低15%跳出率",
            futureLife: "考取咖啡師執照 / 自辦一場讀書會",
            presentVal: "極強的跨部門協調能力 / 精通時程控管",
            presentSupport: "求大師推薦好喝的精釀啤酒、瑜伽夥伴"
        },
        {
            name: "Emma",
            avatar: "EM",
            background: "商業分析研究所 / 數據狂熱 Growth PM",
            exp: "曾赴荷蘭阿姆斯特丹大學交換，騎自行車橫跨三個城鎮",
            pivot: "在數據分析實習中發現光看數字不過癮，希望能直接動手打造產品，於是轉做產品",
            pit: "A/B Testing 實驗設計漏掉控制變因，導致整組數據失真，整整兩週成果歸零",
            proud: "在上一家公司優化註冊流程，將轉換率從 8% 直接拉升至 22%",
            talent: "能在 15 秒內認出世界上任何一首莫札特的交響樂",
            funfact: "不能吃微辣，但是吃麻辣鍋卻完全沒事",
            influence: "《精益創業》",
            quote: "Let data be your compass, but empathy be your anchor.",
            seat: "2A",
            passportId: "TWN-2026PM-5829",
            futureStar: "數據導向的 Growth 團隊 Leader",
            futureProj: "在團隊內導入全新行銷與轉化追蹤漏斗",
            futureLife: "前往北海道滑雪 / 挑戰黑鑽滑雪道",
            presentVal: "數據挖掘與 SQL 查詢 / 留存率增長策略",
            presentSupport: "求大家幫忙填寫問卷、推薦好看美劇"
        },
        {
            name: "Ken",
            avatar: "KE",
            background: "工業設計系 / 使用者體驗 (UX) PM",
            exp: "曾在東京當過半年駐地設計師，天天被日式極簡美學洗禮",
            pivot: "發現很多產品空有好看的介面卻難用無比，決定自己來主導產品功能定義",
            pit: "開發時沒有和工程師充分對齊實作難度，設計出極為絢麗但極耗效能的元件，最後全被砍掉",
            proud: "主導重新設計 B2B 管理後台，滿意度從 3.1 分飆升至 4.8 分",
            talent: "手繪素描大師 / 僅看一張模糊照片就能猜出家具品牌",
            funfact: "有一隻會用馬桶上廁所、而且會自己按沖水鍵的厲害貓咪",
            influence: "《設計心理學》",
            quote: "簡單的設計，往往需要最複雜的思考。",
            seat: "2C",
            passportId: "TWN-2026PM-4482",
            futureStar: "頂尖的 Product Design Architect",
            futureProj: "建構全新 XC 元件庫與設計規範規範",
            futureLife: "手作一整套木製工作椅 / 學會木雕",
            presentVal: "使用者流程與 User Story 規劃 / Figma 支援",
            presentSupport: "求技術可行性快速評估、手作烘焙推薦"
        },
        {
            name: "Vicky",
            avatar: "VI",
            background: "財務金融系 / 擅長商業模型與定價策略 PM",
            exp: "曾在紐約華爾街投行實習三個月，親眼見證高壓快節奏的市場脈動",
            pivot: "發現自己對純粹的數字金錢遊戲沒熱情，更想深入科技實體產品的打造",
            pit: "某次新訂閱方案定價公式漏算稅率，導致上線首日虧損數萬，連夜緊急下架修正",
            proud: "成功重構定價模型，為公司付費用戶客單價 (ARPU) 提升了 18%",
            talent: "業餘德州撲克高手，曾拿過地區業餘大賽第四名",
            funfact: "一聽到八卦話題雙耳就會立刻自動變紅，非常容易被識破",
            influence: "《思考，快與慢》",
            quote: "在直覺前保持懷疑，在邏輯後擁抱決策。",
            seat: "2D",
            passportId: "TWN-2026PM-3019",
            futureStar: "負責百萬級營收產品線的 Product Owner",
            futureProj: "推出全新 XC Premium 會員訂閱機制",
            futureLife: "學會自由潛水並在海下憋氣超過 3 分鐘",
            presentVal: "商業變現邏輯評估 / ROI 與成本分析",
            presentSupport: "需要前端開發時程估算教學、求下午茶開團"
        }
    ];

    // 初始化載入 Mock 卡片
    function initMockCards() {
        if (galleryEmpty) {
            galleryEmpty.classList.add('hidden');
        }
        if (galleryGrid) {
            galleryGrid.classList.remove('hidden');
            galleryGrid.innerHTML = ''; // 清空預設卡片
            
            mockMembers.forEach((member, index) => {
                const lockClass = isGalleryUnlocked ? "" : "is-locked";
                const cardHtml = `
                    <div class="gallery-passport-card ${lockClass}" data-index="${index}">
                        <div class="passport-crest">
                            <i class="fa-solid fa-star"></i>
                        </div>
                        <div class="passport-title">PM FLIGHT PASSPORT</div>
                        <div class="passport-name">${member.name}</div>
                        <div class="passport-meta">Flight JX-2026</div>
                        ${!isGalleryUnlocked ? `
                        <div class="card-lock-overlay">
                            <div class="lock-icon">🔒</div>
                            <div class="lock-text">海關查驗中：請先完成並送出您的機票表單以解鎖隊員檔案</div>
                        </div>
                        ` : ''}
                    </div>
                `;
                
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = cardHtml.trim();
                const node = tempDiv.firstChild;
                
                // 點擊事件：若解鎖則開啟 Modal
                node.addEventListener('click', () => {
                    if (node.classList.contains('is-locked')) {
                        // 震動一下提示
                        node.style.animation = 'none';
                        void node.offsetWidth; // 強制回流
                        node.style.animation = 'shake 0.4s ease-in-out';
                        
                        // 提示
                        const warningToast = document.createElement('div');
                        warningToast.style.cssText = `
                            position: fixed;
                            bottom: 2rem;
                            left: 50%;
                            transform: translateX(-50%) translateY(20px);
                            background: #e74c3c;
                            color: #ffffff;
                            padding: 0.8rem 2rem;
                            border-radius: 30px;
                            font-weight: 700;
                            box-shadow: var(--shadow-lg);
                            z-index: 10000;
                            opacity: 0;
                            transition: all 0.4s ease;
                        `;
                        warningToast.innerHTML = `🔒 請先完成您的 Step 3 登機表單，即可順利通關解鎖所有成員護照！`;
                        document.body.appendChild(warningToast);
                        setTimeout(() => {
                            warningToast.style.opacity = '1';
                            warningToast.style.transform = 'translateX(-50%) translateY(0)';
                        }, 50);
                        setTimeout(() => {
                            warningToast.style.opacity = '0';
                            warningToast.style.transform = 'translateX(-50%) translateY(-20px)';
                            setTimeout(() => warningToast.remove(), 400);
                        }, 3000);
                        return;
                    }

                    // 填寫 Modal 內部的護照內容
                    openColleaguePassport(member);
                });

                galleryGrid.appendChild(node);
            });
        }
    }

    // 動態填寫與開啟同事的雙頁護照 Modal
    function openColleaguePassport(member) {
        const modalPassportBook = document.getElementById('modal-passport-book');
        if (!modalPassportBook) return;

        modalPassportBook.innerHTML = `
            <!-- Left Page (Inside Page) -->
            <div class="passport-page page-left">
                <div class="watermark-stamp stamp-watermark-1">TAIPEI // JX-2026</div>
                <div class="watermark-stamp stamp-watermark-2">PASSPORT CLEARED</div>
                <div class="passport-page-header">
                    <span class="passport-header-title">PASSPORT / 護照</span>
                </div>
                <div class="passport-page-body">
                    <div class="passport-identity">
                        <div class="passport-photo">
                            <div class="photo-placeholder">
                                <i class="fa-solid fa-user"></i>
                                <span class="photo-text">PASSENGER</span>
                            </div>
                        </div>
                        <div class="passport-details-column">
                            <div class="passport-field">
                                <span class="field-lbl">NAME / 姓名</span>
                                <span class="field-val">${member.name.toUpperCase()}</span>
                            </div>
                            <div class="passport-field-row">
                                <div class="passport-field">
                                    <span class="field-lbl">SEAT / 座位</span>
                                    <span class="field-val">${member.seat}</span>
                                </div>
                                <div class="passport-field">
                                    <span class="field-lbl">FLIGHT / 航班</span>
                                    <span class="field-val">JX-2026</span>
                                </div>
                            </div>
                            <div class="passport-field-row">
                                <div class="passport-field">
                                    <span class="field-lbl">GATE / 登機門</span>
                                    <span class="field-val">小樹屋</span>
                                </div>
                                <div class="passport-field">
                                    <span class="field-lbl">DATE / 日期</span>
                                    <span class="field-val">21 JUL 2026</span>
                                </div>
                            </div>
                            <div class="passport-field">
                                <span class="field-lbl">PASSPORT ID</span>
                                <span class="field-val">${member.passportId}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="passport-footer-row">
                        <div class="passport-qrcode">
                            <svg viewBox="0 0 100 100">
                                <rect x="0" y="0" width="25" height="25" fill="#3a2e1d"/>
                                <rect x="5" y="5" width="15" height="15" fill="#fdfcf9"/>
                                <rect x="8" y="8" width="9" height="9" fill="#3a2e1d"/>
                                <rect x="75" y="0" width="25" height="25" fill="#3a2e1d"/>
                                <rect x="80" y="5" width="15" height="15" fill="#fdfcf9"/>
                                <rect x="83" y="8" width="9" height="9" fill="#3a2e1d"/>
                                <rect x="0" y="75" width="25" height="25" fill="#3a2e1d"/>
                                <rect x="5" y="80" width="15" height="15" fill="#fdfcf9"/>
                                <rect x="8" y="83" width="9" height="9" fill="#3a2e1d"/>
                                <rect x="40" y="10" width="10" height="10" fill="#3a2e1d"/>
                                <rect x="55" y="15" width="10" height="10" fill="#3a2e1d"/>
                                <rect x="35" y="30" width="20" height="10" fill="#3a2e1d"/>
                                <rect x="65" y="40" width="15" height="15" fill="#3a2e1d"/>
                                <rect x="15" y="45" width="15" height="15" fill="#3a2e1d"/>
                                <rect x="45" y="60" width="15" height="15" fill="#3a2e1d"/>
                                <rect x="75" y="60" width="15" height="15" fill="#3a2e1d"/>
                                <rect x="60" y="75" width="25" height="20" fill="#3a2e1d"/>
                            </svg>
                        </div>
                        <div class="passport-stamps-area">
                            <div class="ink-stamp stamp-past stamped">
                                <span class="stamp-check">✓</span>
                                <span class="stamp-lbl">PAST</span>
                            </div>
                            <div class="ink-stamp stamp-future stamped">
                                <span class="stamp-check">✓</span>
                                <span class="stamp-lbl">FUTURE</span>
                            </div>
                            <div class="ink-stamp stamp-present stamped">
                                <span class="stamp-check">✓</span>
                                <span class="stamp-lbl">PRESENT</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Right Page (Inside Page) -->
            <div class="passport-page page-right">
                <div class="watermark-stamp stamp-watermark-1">DEPARTED // JX-2026</div>
                <div class="watermark-stamp stamp-watermark-2">BIZ CLASS</div>
                <div class="passport-page-header text-right">
                    <span class="passport-header-title">JOURNEY SUMMARY / 旅程摘要</span>
                </div>
                <div class="passport-page-body">
                    <div class="summary-section">
                        <h3 class="summary-sec-title">🧳 PAST</h3>
                        <ul class="summary-list">
                            <li><span class="bullet">•</span> <strong class="summary-lbl">我的 Pivot Point:</strong> <span class="summary-text">${member.pivot}</span></li>
                            <li><span class="bullet">•</span> <strong class="summary-lbl">我最驕傲的一件事:</strong> <span class="summary-text">${member.proud}</span></li>
                            <li><span class="bullet">•</span> <strong class="summary-lbl">Hidden Talent:</strong> <span class="summary-text">${member.talent}</span></li>
                        </ul>
                    </div>
                    
                    <div class="summary-section">
                        <h3 class="summary-sec-title">✈ FUTURE</h3>
                        <ul class="summary-list">
                            <li><span class="bullet">•</span> <strong class="summary-lbl">My Northern Star:</strong> <span class="summary-text">${member.futureStar}</span></li>
                            <li><span class="bullet">•</span> <strong class="summary-lbl">Work Goal:</strong> <span class="summary-text">${member.futureProj}</span></li>
                            <li><span class="bullet">•</span> <strong class="summary-lbl">Life Goal:</strong> <span class="summary-text">${member.futureLife}</span></li>
                        </ul>
                    </div>
                    
                    <div class="summary-section">
                        <h3 class="summary-sec-title">🤝 PRESENT</h3>
                        <ul class="summary-list">
                            <li><span class="bullet">•</span> <strong class="summary-lbl">我希望帶給團隊的價值:</strong> <span class="summary-text">${member.presentVal}</span></li>
                            <li><span class="bullet">•</span> <strong class="summary-lbl">我需要大家的 Support:</strong> <span class="summary-text">${member.presentSupport}</span></li>
                        </ul>
                    </div>
                    
                    <div class="passport-elegant-quote">
                        "Every Journey Begins With A Story."
                    </div>
                </div>
            </div>
        `;

        if (modal) {
            modal.classList.remove('hidden');
            void modal.offsetWidth; // 強制回流
            modal.classList.add('active');
        }
    }

    // 渲染從 Google Sheets 讀取的卡片到藝廊
    function renderMemberToGallery(member) {
        // 直接納入 FIDS 即可
    }

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

    // 渲染從 Google Sheets 讀取的卡片到藝廊
    function renderMemberToGallery(member) {
        // 直接納入 FIDS 即可
    }

    // 將成員加入至 FIDS 乘客名單表格
    function addMemberToFids(member) {
        const fidsTbody = document.getElementById('fids-tbody');
        const userFidsRow = document.getElementById('user-fids-row');
        if (!fidsTbody) return;

        const seats = ['A', 'B', 'C', 'D', 'E', 'F'];
        const randomRowNum = Math.floor(Math.random() * 20) + 1;
        const randomSeatChar = seats[Math.floor(Math.random() * seats.length)];
        const seat = member.seat || `${randomRowNum}${randomSeatChar}`;

        const name = (member.name || 'GUEST').toUpperCase();
        const dest = (member.futureTravel || 'FUTURE & GROWTH').toUpperCase();

        const tr = document.createElement('tr');
        tr.className = 'fids-row dynamic-row';
        tr.innerHTML = `
            <td class="passenger-name-cell">${name}</td>
            <td class="seat-cell">${seat}</td>
            <td class="gate-cell">小樹屋</td>
            <td class="dest-cell">${dest}</td>
            <td><span class="fids-status-badge status-boarded">BOARDED</span></td>
        `;

        if (userFidsRow) {
            fidsTbody.insertBefore(tr, userFidsRow);
        } else {
            fidsTbody.appendChild(tr);
        }
    }

    // 載入 Google Sheets 資料
    async function loadGoogleSheetData() {
        if (!GOOGLE_SHEET_SCRIPT_URL) return;
        try {
            const response = await fetch(GOOGLE_SHEET_SCRIPT_URL);
            const result = await response.json();
            if (result.result === 'success' && result.data) {
                result.data.forEach(member => {
                    addMemberToFids(member);
                });
            }
        } catch (e) {
            console.error("無法載入 Google Sheet 資料:", e);
        }
    }

    // 啟動載入 Mock 卡片與 Google Sheets 資料
    initMockCards();
    loadGoogleSheetData();

    // 渲染自填卡片到藝廊 (這裏改為無操作，因為填寫完成後已不再直接追加一般卡片，而是打開 Premium Ending Passport)
    function renderToGallery() {
        // No-op to avoid breaking submitBtn logic
    }

        const tr = document.createElement('tr');
        tr.className = 'fids-row dynamic-row';
        tr.innerHTML = `
            <td class="passenger-name-cell">${name}</td>
            <td class="seat-cell">${seat}</td>
            <td class="gate-cell">小樹屋</td>
            <td class="dest-cell">${dest}</td>
            <td><span class="fids-status-badge status-boarded">BOARDED</span></td>
        `;

        if (userFidsRow) {
            fidsTbody.insertBefore(tr, userFidsRow);
        } else {
            fidsTbody.appendChild(tr);
        }
    }

    // 載入 Google Sheets 資料
    async function loadGoogleSheetData() {
        if (!GOOGLE_SHEET_SCRIPT_URL) return;
        try {
            const response = await fetch(GOOGLE_SHEET_SCRIPT_URL);
            const result = await response.json();
            if (result.result === 'success' && result.data) {
                result.data.forEach(member => {
                    renderMemberToGallery(member);
                    addMemberToFids(member);
                });
            }
        } catch (e) {
            console.error("無法載入 Google Sheet 資料:", e);
        }
    }

    // 啟動載入 Mock 卡片與 Google Sheets 資料
    initMockCards();
    loadGoogleSheetData();

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

    // ==========================================================================
    // 新增：機場候機沈浸式互動體驗邏輯
    // ==========================================================================

    // 1. 數位時鐘計時
    function startWidgetClock() {
        const timeVal = document.getElementById('widget-time');
        const boardTime = document.getElementById('board-live-time');
        const sidebarClock = document.getElementById('sidebar-clock');
        
        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const timeStr = `${hours}:${minutes}:${seconds}`;
            if (timeVal) timeVal.textContent = timeStr;
            if (boardTime) boardTime.textContent = timeStr;
            if (sidebarClock) sidebarClock.textContent = timeStr;
        };
        updateClock();
        setInterval(updateClock, 1000);
    }

    // 2. 飛機動畫定位 (左側 Journey Timeline)
    function updatePlaneAnimations(stepNum) {
        // 左側飛機動畫與高亮
        const leftPlane = document.getElementById('timeline-plane-indicator');
        const timelineWrapper = document.querySelector('.timeline-steps-wrapper');
        const timelineActiveItem = document.getElementById(`timeline-step-${stepNum}`);
        
        for (let i = 1; i <= 4; i++) {
            const item = document.getElementById(`timeline-step-${i}`);
            if (item) {
                if (i <= stepNum) {
                    item.classList.add('completed');
                    item.classList.add('active');
                } else {
                    item.classList.remove('completed');
                    item.classList.remove('active');
                }
            }
        }

        if (leftPlane && timelineWrapper && timelineActiveItem) {
            const wrapperRect = timelineWrapper.getBoundingClientRect();
            const itemRect = timelineActiveItem.getBoundingClientRect();
            const topOffset = itemRect.top - wrapperRect.top + (itemRect.height / 2) - (leftPlane.offsetHeight / 2);
            leftPlane.style.transform = `translateY(${topOffset}px)`;
        }
    }

    // 3. 即時更新航班看板 FIDS & Widget 的狀態
    function updateFlightStatus(stepNum) {
        const widgetStatus = document.getElementById('widget-status');
        const userFidsStatus = document.getElementById('user-fids-status');
        const sidebarStatus = document.getElementById('sidebar-status');
        
        let statusText = 'BOARDING';
        let badgeClass = 'status-checking-in';
        
        if (stepNum === 1) {
            statusText = 'BOARDING';
            badgeClass = 'status-checking-in';
        } else if (stepNum === 2) {
            statusText = 'IMMIGRATION';
            badgeClass = 'status-immigration';
        } else if (stepNum === 3) {
            statusText = 'FINAL CALL';
            badgeClass = 'status-boarding';
        } else if (stepNum === 4) {
            statusText = 'DEPARTED';
            badgeClass = 'status-boarded';
        }

        if (widgetStatus) {
            widgetStatus.textContent = statusText;
            widgetStatus.className = 'widget-value';
            if (statusText === 'BOARDING') widgetStatus.classList.add('blink-green');
            else if (statusText === 'IMMIGRATION') widgetStatus.classList.add('blink-blue');
            else if (statusText === 'FINAL CALL') widgetStatus.classList.add('blink-orange');
            else if (statusText === 'DEPARTED') widgetStatus.classList.add('glow-green');
        }

        if (sidebarStatus) {
            sidebarStatus.textContent = statusText;
            sidebarStatus.className = 'panel-val badge-fids-status';
            if (statusText === 'BOARDING') sidebarStatus.classList.add('status-checking-in');
            else if (statusText === 'IMMIGRATION') sidebarStatus.classList.add('status-immigration');
            else if (statusText === 'FINAL CALL') sidebarStatus.classList.add('status-boarding');
            else if (statusText === 'DEPARTED') sidebarStatus.classList.add('status-boarded');
        }

        if (userFidsStatus) {
            userFidsStatus.textContent = statusText;
            userFidsStatus.className = `fids-status-lbl ${statusText === 'DEPARTED' ? 'boarded' : 'blinking'}`;
            // Also update parent card class
            const userCard = document.getElementById('user-fids-card');
            if (userCard) {
                if (statusText === 'DEPARTED') {
                    userCard.className = 'fids-passenger-card boarded';
                } else {
                    userCard.className = 'fids-passenger-card dynamic-user-card';
                }
            }
        }
    }

    // 4. 全螢幕過場轉場動畫 (Smooth Screen Transitions) - 加速版
    function triggerFullscreenTransition(title, subtitle, iconClass, callback) {
        const overlay = document.getElementById('fullscreen-transition-overlay');
        if (!overlay) {
            if (callback) callback();
            return;
        }
        const titleEl = overlay.querySelector('.transition-title');
        const subtitleEl = overlay.querySelector('.transition-subtitle');
        const iconEl = overlay.querySelector('.transition-icon');
        const fillEl = overlay.querySelector('.transition-progress-fill');

        if (titleEl) titleEl.textContent = title.toUpperCase();
        if (subtitleEl) subtitleEl.textContent = subtitle.toUpperCase();
        if (iconEl) iconEl.className = `fa-solid ${iconClass} transition-icon`;
        if (fillEl) fillEl.style.width = '0%';

        overlay.classList.remove('hidden');
        overlay.classList.add('active');

        setTimeout(() => {
            if (fillEl) fillEl.style.width = '100%';
        }, 50);

        setTimeout(() => {
            if (callback) callback();
            setTimeout(() => {
                overlay.classList.remove('active');
                setTimeout(() => {
                    overlay.classList.add('hidden');
                }, 200);
            }, 300);
        }, 800);
    }

    // 5. 每完成一題，欄位自動蓋章動畫 (Passport Stamp Validation) - 根據使用者需求移除
    function initPassportStamps() {
        // No-op - stamps removed next to form inputs
    }

    // 6. 即時同步在線乘客名單
    const fidsName = document.getElementById('user-fids-name');
    const fidsDest = document.getElementById('user-fids-dest');
    
    if (boardingNameInput) {
        boardingNameInput.addEventListener('input', (e) => {
            const val = e.target.value.trim().toUpperCase();
            if (fidsName) fidsName.textContent = val || 'GUEST';
            const sidebarPassenger = document.getElementById('sidebar-passenger-name');
            if (sidebarPassenger) sidebarPassenger.textContent = val || 'GUEST';
        });
    }
    if (inputs.name) {
        inputs.name.addEventListener('input', (e) => {
            const val = e.target.value.trim().toUpperCase();
            if (fidsName) fidsName.textContent = val || 'GUEST';
            const sidebarPassenger = document.getElementById('sidebar-passenger-name');
            if (sidebarPassenger) sidebarPassenger.textContent = val || 'GUEST';
        });
    }
    if (boardingDestinationInput) {
        boardingDestinationInput.addEventListener('input', (e) => {
            const val = e.target.value.trim().toUpperCase();
            if (fidsDest) fidsDest.textContent = val || 'FUTURE & GROWTH';
        });
    }
    if (inputs.futureTravel) {
        inputs.futureTravel.addEventListener('input', (e) => {
            const val = e.target.value.trim().toUpperCase();
            if (fidsDest) fidsDest.textContent = val || 'FUTURE & GROWTH';
        });
    }

    // 初始化蓋章、飛機定位與縮放重新適應
    initPassportStamps();
    window.addEventListener('resize', () => {
        // Only run if cabin is currently open
        if (!mainContent.classList.contains('hidden')) {
            const activeStepNum = highestStepReached > 3 ? 3 : highestStepReached;
            updatePlaneAnimations(activeStepNum);
        }
    });
});