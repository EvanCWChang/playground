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
    const progressSteps = [
        document.getElementById('progress-step-1'),
        document.getElementById('progress-step-2'),
        document.getElementById('progress-step-3')
    ];
    const progressLines = [
        document.getElementById('progress-line-1'),
        document.getElementById('progress-line-2')
    ];

    function isStepAccessible(stepNum) {
        if (stepNum === 1) return true;
        if (stepNum === 2) {
            return (highestStepReached >= 2) || (inputs.name && inputs.name.value.trim() !== '');
        }
        if (stepNum === 3) {
            return highestStepReached >= 3;
        }
        return false;
    }

    function updateStepAccessibilityStyles() {
        progressSteps.forEach((pStep, idx) => {
            if (pStep) {
                const currentStepIdx = idx + 1;
                if (isStepAccessible(currentStepIdx)) {
                    pStep.classList.add('clickable');
                } else {
                    pStep.classList.remove('clickable');
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

        progressSteps.forEach((pStep, idx) => {
            if (pStep) {
                if (idx === stepNum - 1) { // Highlighting current departure board style step
                    pStep.classList.add('active');
                } else {
                    pStep.classList.remove('active');
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

    // 為步驟進度條添加點擊監聽，只要是已填寫前面步驟，就可以自由切換
    progressSteps.forEach((pStep, idx) => {
        if (pStep) {
            pStep.addEventListener('click', () => {
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
    
    // Step 3 完成按鈕 (最後匯入藝廊)
    if (step3Finish) {
        step3Finish.addEventListener('click', () => {
            triggerFullscreenTransition(
                'Boarding Complete',
                'Welcome Aboard Flight JX-2026',
                'fa-plane-departure',
                () => {
                    goToStep(3); // Stay on step 3 form
                    updateFlightStatus(4); // Updates user status on vertical timeline & FIDS to 'DEPARTED'
                    updatePlaneAnimations(4); // Slides vertical plane to Destination node!

                    // 順暢滾動到「已通過海關的成員」區
                    document.querySelector('.gallery-section').scrollIntoView({ behavior: 'smooth' });
                    
                    // 觸發星宇精品閃耀提示
                    const successToast = document.createElement('div');
                    successToast.style.cssText = `
                        position: fixed;
                        bottom: 2rem;
                        left: 50%;
                        transform: translateX(-50%) translateY(20px);
                        background: linear-gradient(135deg, #bca46a 0%, #8b7443 100%);
                        color: #111518;
                        padding: 0.8rem 2rem;
                        border-radius: 30px;
                        font-weight: 800;
                        box-shadow: 0 10px 20px rgba(0,0,0,0.3);
                        z-index: 1000;
                        opacity: 0;
                        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    `;
                    successToast.innerHTML = `🎉 歡迎登機！客製化機票已成功登錄，與全體成員一同航向未來！`;
                    document.body.appendChild(successToast);
                    
                    setTimeout(() => {
                        successToast.style.opacity = '1';
                        successToast.style.transform = 'translateX(-50%) translateY(0)';
                    }, 100);

                    setTimeout(() => {
                        successToast.style.opacity = '0';
                        successToast.style.transform = 'translateX(-50%) translateY(-20px)';
                        setTimeout(() => successToast.remove(), 400);
                    }, 4000);
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
                // ----------------- 將卡片 Append 渲染進 Gallery 藝廊 -----------------
                renderToGallery();

                // 觸發解鎖機制
                setTimeout(() => {
                    unlockGallery();
                }, 300);

                // 順利跳轉到 Step 2 (Future) 填寫頁面！
                goToStep(2);
            }
        );
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

    // 2. 飛機動畫定位 (頂部 Status Bar 與 左側 Journey Timeline)
    function updatePlaneAnimations(stepNum) {
        // 頂部飛機動畫
        const topPlane = document.getElementById('step-plane-anim');
        const topProgress = document.querySelector('.steps-progress');
        const activeStep = document.getElementById(`progress-step-${stepNum > 3 ? 3 : stepNum}`);
        if (topPlane && topProgress && activeStep) {
            const containerRect = topProgress.getBoundingClientRect();
            const activeRect = activeStep.getBoundingClientRect();
            const leftOffset = activeRect.left - containerRect.left + (activeRect.width / 2) - (topPlane.offsetWidth / 2);
            topPlane.style.transform = `translateX(${leftOffset}px)`;
        }

        // 左側飛機動畫與高亮
        const leftPlane = document.getElementById('timeline-plane-indicator');
        const timelineWrapper = document.querySelector('.timeline-steps-wrapper');
        const timelineActiveItem = document.getElementById(`timeline-step-${stepNum}`);
        
        for (let i = 1; i <= 4; i++) {
            const item = document.getElementById(`timeline-step-${i}`);
            if (item) {
                if (i === stepNum) {
                    item.classList.add('active');
                } else {
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
            userFidsStatus.className = `fids-status-badge ${badgeClass}`;
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

    // 5. 每完成一題，欄位自動蓋章動畫 (Passport Stamp Validation)
    function initPassportStamps() {
        const allFormInputs = document.querySelectorAll('.form-group input');
        allFormInputs.forEach(input => {
            const formGroup = input.closest('.form-group');
            if (formGroup && !formGroup.querySelector('.passport-stamp')) {
                const stamp = document.createElement('div');
                stamp.className = 'passport-stamp';
                stamp.innerHTML = '<span class="stamp-text">APPROVED</span>';
                
                if (getComputedStyle(formGroup).position === 'static') {
                    formGroup.style.position = 'relative';
                }
                formGroup.appendChild(stamp);

                const triggerStamp = () => {
                    if (input.value.trim().length > 0) {
                        stamp.classList.add('stamped');
                    } else {
                        stamp.classList.remove('stamped');
                    }
                };

                input.addEventListener('blur', triggerStamp);
                input.addEventListener('change', triggerStamp);
                
                // Initialize if pre-filled
                if (input.value.trim().length > 0) {
                    setTimeout(triggerStamp, 200);
                }
            }
        });
    }

    // 6. 即時同步在線乘客名單
    const fidsName = document.getElementById('user-fids-name');
    const fidsDest = document.getElementById('user-fids-dest');
    
    if (boardingNameInput) {
        boardingNameInput.addEventListener('input', (e) => {
            const val = e.target.value.trim().toUpperCase();
            if (fidsName) fidsName.textContent = val || 'GUEST';
        });
    }
    if (inputs.name) {
        inputs.name.addEventListener('input', (e) => {
            const val = e.target.value.trim().toUpperCase();
            if (fidsName) fidsName.textContent = val || 'GUEST';
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