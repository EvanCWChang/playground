document.addEventListener("DOMContentLoaded", () => {
    const onboardingScreen = document.getElementById("onboarding-screen");
    const boardingPassCard = document.getElementById("boarding-pass-card");
    const boardingNameInput = document.getElementById("boarding-name");
    const boardingDestinationInput = document.getElementById("boarding-destination");
    const stubDestination = document.getElementById("stub-destination");
    const boardingBtn = document.getElementById("boarding-btn");
    const mainContent = document.getElementById("main-content");
    const brandLogo = document.getElementById("brand-logo");
    const navCabin = document.getElementById("nav-cabin");

    const inputs = {
        name: document.getElementById("input-name"),
        background: document.getElementById("input-background"),
        exp: document.getElementById("input-exp"),
        pivot: document.getElementById("input-pivot")
    };

    const submitBtn = document.getElementById("submit-btn");
    const galleryEmpty = document.getElementById("gallery-empty");
    const galleryGrid = document.getElementById("gallery-grid");

    if (boardingDestinationInput && stubDestination) {
        boardingDestinationInput.addEventListener("input", (e) => {
            stubDestination.textContent = e.target.value.trim() || "Future & Growth";
        });
    }

    const steps = [document.getElementById("step-1-container"), document.getElementById("step-2-container"), document.getElementById("step-3-container")];
    const progressSteps = [document.getElementById("progress-step-1"), document.getElementById("progress-step-2"), document.getElementById("progress-step-3"), document.getElementById("progress-step-4")];
    const progressLines = [document.getElementById("progress-line-1"), document.getElementById("progress-line-2"), document.getElementById("progress-line-3")];

    function goToStep(stepNum) {
        const formSection = document.querySelector(".form-section");
        const endingScreen = document.getElementById("passport-ending-screen");
        console.log("Navigating to step:", stepNum);
        
        if (stepNum <= 3) {
            if (formSection) formSection.classList.remove("hidden");
            if (endingScreen) endingScreen.classList.add("hidden");
            steps.forEach((s, i) => {
                if (s) {
                    if (i === stepNum - 1) s.classList.remove("hidden");
                    else s.classList.add("hidden");
                }
            });
        } else {
            if (formSection) formSection.classList.add("hidden");
            if (endingScreen) endingScreen.classList.remove("hidden");
        }
        
        progressSteps.forEach((ps, i) => ps && (i < stepNum ? ps.classList.add("active") : ps.classList.remove("active")));
        progressLines.forEach((pl, i) => pl && (pl.style.backgroundColor = i < stepNum - 1 ? "#bca46a" : "rgba(188, 164, 106, 0.2)"));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (boardingBtn) {
        boardingBtn.addEventListener("click", () => {
            const name = boardingNameInput.value.trim();
            if (!name) return boardingNameInput.focus();
            if (inputs.name) inputs.name.value = name;
            boardingPassCard.style.transform = "translate3d(0, -30px, 400px) rotateX(15deg) scale(1.5)";
            boardingPassCard.style.opacity = "0";
            onboardingScreen.style.opacity = "0";
            setTimeout(() => {
                onboardingScreen.classList.add("hidden");
                mainContent.classList.remove("hidden");
                mainContent.style.opacity = "1";
                goToStep(1);
            }, 800);
        });
    }

    if (brandLogo) brandLogo.addEventListener("click", () => location.reload());
    if (navCabin) navCabin.addEventListener("click", (e) => {
        e.preventDefault();
        onboardingScreen.classList.add("hidden");
        mainContent.classList.remove("hidden");
        mainContent.style.opacity = "1";
        goToStep(1);
    });

    const multiChoiceOptions = Array.from(document.querySelectorAll(".multi-choice-option"));
    multiChoiceOptions.forEach(btn => {
        btn.addEventListener("click", () => {
            btn.classList.toggle("active");
            if (btn.dataset.choice === "E") {
                const group = btn.closest(".multi-choice-group");
                const other = document.getElementById(group.dataset.question + "-other");
                if (other) {
                    if (btn.classList.contains("active")) { other.classList.remove("hidden"); other.focus(); }
                    else { other.classList.add("hidden"); other.value = ""; }
                }
            }
        });
    });

    if (submitBtn) {
        submitBtn.addEventListener("click", (e) => {
            e.preventDefault();
            renderToGallery();
            goToStep(2);
        });
    }

    const s2prev = document.getElementById("step-2-prev");
    const s2next = document.getElementById("step-2-next");
    const s3prev = document.getElementById("step-3-prev");
    const s3finish = document.getElementById("step-3-finish");

    if (s2prev) s2prev.addEventListener("click", () => goToStep(1));
    if (s2next) s2next.addEventListener("click", () => goToStep(3));
    if (s3prev) s3prev.addEventListener("click", () => goToStep(2));
    if (s3finish) s3finish.addEventListener("click", () => goToStep(4));

    function renderToGallery() {
        const name = inputs.name.value.trim() || "Passenger";
        const bg = inputs.background.value.trim() || "";
        const exp = inputs.exp.value.trim() || "";
        const pvt = inputs.pivot.value.trim() || "";
        const avatar = name.substring(0, 2).toUpperCase();
        const cardHtml = `
            <div class="profile-card">
                <div class="card-header">
                    <div class="card-avatar" style="background:#bca46a">${avatar}</div>
                    <div class="card-header-info"><h3>${name}</h3><p class="card-sub">${bg}</p></div>
                </div>
                <div class="card-body">
                    <div class="card-item"><label>這幾年的有趣故事</label><p>${exp}</p></div>
                    <div class="card-item"><label>職涯 Pivot 轉折點</label><p>${pvt}</p></div>
                </div>
                <div class="card-footer"><p>PM Flight Journey</p></div>
            </div>`;
        const div = document.createElement("div");
        div.innerHTML = cardHtml.trim();
        if (galleryEmpty) galleryEmpty.classList.add("hidden");
        if (galleryGrid) {
            galleryGrid.classList.remove("hidden");
            galleryGrid.insertBefore(div.firstChild, galleryGrid.firstChild);
        }
    }
});