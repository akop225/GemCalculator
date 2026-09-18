(() => {
    "use strict";

    const COEFFICIENT = 0.0061;
    const DEFAULT_HEIGHT_RATIO = 0.60;

    const cutScreen = document.getElementById("cut-screen");
    const calculatorScreen = document.getElementById("calculator-screen");

    const continueButton = document.getElementById("continue-button");
    const backButton = document.getElementById("back-button");
    const resetButton = document.getElementById("reset-button");

    const lengthInput = document.getElementById("length");
    const widthInput = document.getElementById("width");
    const heightInput = document.getElementById("height");
    const caratInput = document.getElementById("carat");

    const caratResult = document.getElementById("carat-result");
    const standardSize = document.getElementById("standard-size");

    const cutButtons = document.querySelectorAll(".cut-button[data-cut]");

    let selectedCut = "round";
    let updating = false;

    function parseNumber(value) {
        if (typeof value !== "string") {
            return null;
        }

        const normalized = value
            .trim()
            .replace(/\s/g, "")
            .replace(",", ".");

        if (!normalized) {
            return null;
        }

        const number = Number(normalized);

        if (!Number.isFinite(number) || number <= 0) {
            return null;
        }

        return number;
    }

    function formatNumber(value, decimals = 2) {
        if (!Number.isFinite(value)) {
            return "—";
        }

        return value
            .toFixed(decimals)
            .replace(".", ",");
    }

    function formatCarat(value) {
        return `${formatNumber(value, 2)} ct`;
    }

    function getAutomaticHeight(diameter) {
        return diameter * DEFAULT_HEIGHT_RATIO;
    }

    function calculateCaratFromDimensions() {
        if (selectedCut !== "round") {
            return;
        }

        const length = parseNumber(lengthInput.value);
        const width = parseNumber(widthInput.value);

        if (!length || !width) {
            caratResult.textContent = "—";
            standardSize.textContent = "Введите длину и ширину";
            return;
        }

        let height = parseNumber(heightInput.value);

        if (!height) {
            const diameter = (length + width) / 2;
            height = getAutomaticHeight(diameter);
        }

        const carat = length * width * height * COEFFICIENT;

        if (!Number.isFinite(carat) || carat <= 0) {
            caratResult.textContent = "—";
            return;
        }

        const roundedCarat = Math.round(carat * 100) / 100;

        caratResult.textContent = formatCarat(roundedCarat);

        if (!updating) {
            updating = true;
            caratInput.value = formatNumber(roundedCarat, 2);
            updating = false;
        }

        const heightText = formatNumber(height, 2);

        standardSize.textContent =
            `${formatNumber(length, 2)} × ` +
            `${formatNumber(width, 2)} × ` +
            `${heightText} мм`;
    }

    function calculateDimensionsFromCarat() {
        if (selectedCut !== "round") {
            return;
        }

        const carat = parseNumber(caratInput.value);

        if (!carat) {
            standardSize.textContent = "Введите каратность";
            caratResult.textContent = "—";
            return;
        }

        /*
         * Для круглого бриллианта:
         *
         * ct = D × D × H × 0.0061
         *
         * При стандартной высоте:
         *
         * H = D × 0.60
         *
         * Тогда:
         *
         * ct = D³ × 0.60 × 0.0061
         *
         * D = cuberoot(ct / (0.60 × 0.0061))
         */

        const diameter = Math.cbrt(
            carat / (DEFAULT_HEIGHT_RATIO * COEFFICIENT)
        );

        const height = getAutomaticHeight(diameter);

        if (!Number.isFinite(diameter) || diameter <= 0) {
            standardSize.textContent = "Не удалось рассчитать";
            caratResult.textContent = "—";
            return;
        }

        const diameterText = formatNumber(diameter, 2);
        const heightText = formatNumber(height, 2);

        lengthInput.value = diameterText;
        widthInput.value = diameterText;
        heightInput.value = heightText;

        standardSize.textContent =
            `${diameterText} × ${diameterText} × ${heightText} мм`;

        caratResult.textContent = formatCarat(carat);
    }

    function onDimensionInput() {
        if (updating) {
            return;
        }

        calculateCaratFromDimensions();
    }

    function onCaratInput() {
        if (updating) {
            return;
        }

        calculateDimensionsFromCarat();
    }

    function resetCalculator() {
        lengthInput.value = "4,25";
        widthInput.value = "4,25";
        heightInput.value = "";
        caratInput.value = "0,28";

        calculateCaratFromDimensions();
    }

    cutButtons.forEach((button) => {
        button.addEventListener("click", () => {
            if (button.disabled) {
                return;
            }

            cutButtons.forEach((item) => {
                item.classList.remove("active");
            });

            button.classList.add("active");
            selectedCut = button.dataset.cut;
        });
    });

    continueButton.addEventListener("click", () => {
        cutScreen.classList.add("hidden");
        calculatorScreen.classList.remove("hidden");

        calculateCaratFromDimensions();
        window.scrollTo(0, 0);
    });

    backButton.addEventListener("click", () => {
        calculatorScreen.classList.add("hidden");
        cutScreen.classList.remove("hidden");

        window.scrollTo(0, 0);
    });

    resetButton.addEventListener("click", resetCalculator);

    lengthInput.addEventListener("input", onDimensionInput);
    widthInput.addEventListener("input", onDimensionInput);
    heightInput.addEventListener("input", onDimensionInput);
    caratInput.addEventListener("input", onCaratInput);

    // Начальное состояние
    calculateCaratFromDimensions();
})();
