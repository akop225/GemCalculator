(() => {
    "use strict";


    /* ========================= */
    /* НАСТРОЙКИ */
    /* ========================= */

    const COEFFICIENT = 0.0061;
    const DEFAULT_HEIGHT_RATIO = 0.60;


    /* ========================= */
    /* TELEGRAM MINI APP */
    /* ========================= */

    const tg = window.Telegram?.WebApp;

    if (tg) {
        tg.ready();
        tg.expand();

        if (typeof tg.setHeaderColor === "function") {
            tg.setHeaderColor("#0d1b29");
        }

        if (typeof tg.setBackgroundColor === "function") {
            tg.setBackgroundColor("#0b1724");
        }
    }


    /* ========================= */
    /* ELEMENTS */
    /* ========================= */

    const cutScreen =
        document.getElementById("cut-screen");

    const calculatorScreen =
        document.getElementById("calculator-screen");

    const continueButton =
        document.getElementById("continue-button");

    const backButton =
        document.getElementById("back-button");

    const resetButton =
        document.getElementById("reset-button");

    const lengthInput =
        document.getElementById("length");

    const widthInput =
        document.getElementById("width");

    const heightInput =
        document.getElementById("height");

    const caratInput =
        document.getElementById("carat");

    const caratResult =
        document.getElementById("carat-result");

    const standardSize =
        document.getElementById("standard-size");

    const cutButtons =
        document.querySelectorAll(".cut-button[data-cut]");


    /* ========================= */
    /* STATE */
    /* ========================= */

    let selectedCut = "round";
    let updating = false;


    /* ========================= */
    /* PARSE NUMBER */
    /* ========================= */

    function parseNumber(value) {
        if (value === null || value === undefined) {
            return null;
        }

        const normalized =
            String(value)
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


    /* ========================= */
    /* FORMAT NUMBER */
    /* ========================= */

    function formatNumber(value, decimals = 2) {
        if (!Number.isFinite(value)) {
            return "—";
        }

        return value
            .toFixed(decimals)
            .replace(".", ",");
    }


    /* ========================= */
    /* FORMAT CARAT */
    /* ========================= */

    function formatCarat(value) {
        return `${formatNumber(value, 3)} ct`;
    }


    /* ========================= */
    /* AUTO HEIGHT */
    /* ========================= */

    function getAutomaticHeight(diameter) {
        return diameter * DEFAULT_HEIGHT_RATIO;
    }


    /* ========================= */
    /* SIZE → CARAT */
    /* ========================= */

    function calculateCaratFromDimensions() {
        if (selectedCut !== "round") {
            return;
        }

        const length = parseNumber(lengthInput.value);
        const width = parseNumber(widthInput.value);

        if (!length || !width) {
            caratResult.textContent = "—";
            standardSize.textContent = "—";
            return;
        }

        let height = parseNumber(heightInput.value);

        if (!height) {
            const diameter = (length + width) / 2;
            height = getAutomaticHeight(diameter);
        }

        const carat =
            length *
            width *
            height *
            COEFFICIENT;

        if (!Number.isFinite(carat) || carat <= 0) {
            caratResult.textContent = "—";
            standardSize.textContent = "—";
            return;
        }

        /*
         * Каратность всегда отображаем
         * с тремя знаками после запятой.
         */
        const roundedCarat =
            Math.round(carat * 1000) / 1000;

        caratResult.textContent =
            formatCarat(roundedCarat);

        /*
         * Синхронизируем поле каратности.
         */
        if (!updating) {
            updating = true;

            caratInput.value =
                roundedCarat.toFixed(3);

            updating = false;
        }

        /*
         * Размеры всегда отображаем
         * с двумя знаками после запятой.
         */
        standardSize.textContent =
            `${formatNumber(length, 2)} × ` +
            `${formatNumber(width, 2)} × ` +
            `${formatNumber(height, 2)} мм`;
    }


    /* ========================= */
    /* CARAT → SIZE */
    /* ========================= */

    function calculateDimensionsFromCarat() {
        if (selectedCut !== "round") {
            return;
        }

        const carat =
            parseNumber(caratInput.value);

        if (!carat) {
            standardSize.textContent = "—";
            caratResult.textContent = "—";
            return;
        }

        /*
         * ct = D³ × 0.60 × 0.0061
         *
         * D = cbrt(
         *     ct / (0.60 × 0.0061)
         * )
         */

        const diameter =
            Math.cbrt(
                carat /
                (
                    DEFAULT_HEIGHT_RATIO *
                    COEFFICIENT
                )
            );

        const height =
            getAutomaticHeight(diameter);

        if (
            !Number.isFinite(diameter) ||
            diameter <= 0
        ) {
            standardSize.textContent = "—";
            caratResult.textContent = "—";
            return;
        }

        const diameterText =
            formatNumber(diameter, 2);

        const heightText =
            formatNumber(height, 2);

        lengthInput.value =
            diameter.toFixed(2);

        widthInput.value =
            diameter.toFixed(2);

        heightInput.value =
            height.toFixed(2);

        standardSize.textContent =
            `${diameterText} × ` +
            `${diameterText} × ` +
            `${heightText} мм`;

        caratResult.textContent =
            formatCarat(carat);
    }


    /* ========================= */
    /* INPUT HANDLERS */
    /* ========================= */

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


    /* ========================= */
    /* KEYBOARD / FOCUS */
    /* ========================= */

    function hidePhoneKeyboard() {
        const activeElement =
            document.activeElement;

        if (
            activeElement instanceof
            HTMLInputElement
        ) {
            activeElement.blur();
        }
    }


    /*
     * Нажатие вне поля завершает ввод
     * и убирает фокус с input.
     *
     * Это позволяет iPhone закрыть
     * системную клавиатуру, не закрывая
     * само Mini App.
     */
    document.addEventListener(
        "pointerdown",
        (event) => {

            const target = event.target;

            if (!(target instanceof Element)) {
                return;
            }

            if (!target.closest("input")) {
                hidePhoneKeyboard();
            }
        }
    );


    /*
     * Enter / Done на клавиатуре.
     */
    [
        lengthInput,
        widthInput,
        heightInput,
        caratInput
    ].forEach((input) => {

        input.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Enter") {
                    event.preventDefault();
                    hidePhoneKeyboard();
                }
            }
        );

    });


    /* ========================= */
    /* RESET */
    /* ========================= */

    function resetCalculator() {

        lengthInput.value = "";
        widthInput.value = "";
        heightInput.value = "";
        caratInput.value = "";

        caratResult.textContent = "—";
        standardSize.textContent = "—";
    }


    /* ========================= */
    /* CUT BUTTONS */
    /* ========================= */

    cutButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                if (button.disabled) {
                    return;
                }

                cutButtons.forEach((item) => {
                    item.classList.remove("active");
                });

                button.classList.add("active");

                selectedCut =
                    button.dataset.cut;
            }
        );

    });


    /* ========================= */
    /* CONTINUE */
    /* ========================= */

    continueButton.addEventListener(
        "click",
        () => {

            hidePhoneKeyboard();

            cutScreen.classList.add("hidden");

            calculatorScreen.classList.remove("hidden");

            window.scrollTo(0, 0);
        }
    );


    /* ========================= */
    /* BACK */
    /* ========================= */

    backButton.addEventListener(
        "click",
        () => {

            hidePhoneKeyboard();

            calculatorScreen.classList.add("hidden");

            cutScreen.classList.remove("hidden");

            window.scrollTo(0, 0);
        }
    );


    /* ========================= */
    /* RESET BUTTON */
    /* ========================= */

    resetButton.addEventListener(
        "click",
        resetCalculator
    );


    /* ========================= */
    /* EVENTS */
    /* ========================= */

    lengthInput.addEventListener(
        "input",
        onDimensionInput
    );

    widthInput.addEventListener(
        "input",
        onDimensionInput
    );

    heightInput.addEventListener(
        "input",
        onDimensionInput
    );

    caratInput.addEventListener(
        "input",
        onCaratInput
    );


    /* ========================= */
    /* INITIAL STATE */
    /* ========================= */

    resetCalculator();

})();
