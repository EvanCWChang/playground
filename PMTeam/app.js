document.addEventListener("DOMContentLoaded", () => {
    const onboardingScreen = document.getElementById("onboarding-screen");
    const boardingPassCard = document.getElementById("boarding-pass-card");
    const boardingNameInput = document.getElementById("boarding-name");
    const boardingBtn = document.getElementById("boarding-btn");
    const mainContent = document.getElementById("main-content");
    const brandLogo = document.getElementById("brand-logo");

    const inputs = {
        name: document.getElementById("input-name"),
        background: document.getElementById("input-background"),
        exp: document.getElementById("input-exp"),
        pivot: document.getElementById("input-pivot")
    };

    const submitBtn = document.getElementById("submit-btn");
    const galleryGrid = document.getElementById("gallery-grid");
    const galleryEmpty = document.getElementById("gallery-empty");

    const steps = [document.getElementById("step-1-container"), document.getElementById("step-2-container"), document.getElementById("step-3-container")];
    const progressSteps = [document.getElementById("progress-step-1"), document.getElementById("progress-step-2"), document.getElementById("progress-step-3")];
    
    function goToStep(stepNum) {
        if (stepNum > 3) {
            document.querySelector(".form-section").style.display = "none";
            document.getElementById("passport-ending-screen").classList.remove("hidden");
            document.getElementById("passport-ending-screen").style.display = "block";
            document.getElementById("pass-name").textContent = "NAME: " + inputs.name.value.toUpperCase();
            return;
        }
        document.querySelector(".form-section").style.display = "block";
        document.getElementById("passport-ending-screen").style.display = "none";
        
        steps.forEach((s, i) => {
            if (s) {
                if (i === stepNum - 1) { s.classList.remove("hidden"); s.style.display = "block"; }
                else { s.classList.add("hidden"); s.style.display = "none"; }
            }
        });
        progressSteps.forEach((ps, i) => ps && ps.classList.toggle("active", i < stepNum));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (boardingBtn) {
        boardingBtn.addEventListener("click", () => {
            const name = boardingNameInput.value.trim();
            if (!name) return boardingNameInput.focus();
            if (inputs.name) inputs.name.value = name;
            onboardingScreen.style.opacity = "0";
            setTimeout(() => {
                onboardingScreen.classList.add("hidden");
                mainContent.classList.remove("hidden");
                mainContent.style.opacity = "1";
                goToStep(1);
            }, 500);
        });
    }

    if (brandLogo) brandLogo.addEventListener("click", () => location.reload());

    const multiChoiceOptions = Array.from(document.querySelectorAll(".multi-choice-option"));
    multiChoiceOptions.forEach(btn => {
        btn.addEventListener("click", () => {
            btn.classList.toggle("active");
            if (btn.dataset.choice === "E") {
                const group = btn.closest(".multi-choice-group");
                const other = document.getElementById(group.dataset.question + "-other");
                if (other) {
                    if (btn.classList.contains("active")) { other.classList.remove("hidden"); other.style.display = "inline-block"; other.focus(); }
                    else { other.classList.add("hidden"); other.style.display = "none"; other.value = ""; }
                }
            }
        });
    });

    if (submitBtn) {
        submitBtn.addEventListener("click", () => {
            renderToGallery();
            goToStep(2);
        });
    }

    document.getElementById("step-2-prev").addEventListener("click", () => goToStep(1));
    document.getElementById("step-2-next").addEventListener("click", () => goToStep(3));
    document.getElementById("step-3-prev").addEventListener("click", () => goToStep(2));
    document.getElementById("step-3-finish").addEventListener("click", () => goToStep(4));

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
        if (galleryEmpty) galleryEmpty.style.display = "none";
        if (galleryGrid) {
            galleryGrid.classList.remove("hidden");
            galleryGrid.style.display = "grid";
            galleryGrid.insertBefore(div.firstChild, galleryGrid.firstChild);
        }
    }
});