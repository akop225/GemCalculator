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
        document.querySelectorAll(
            ".cut-button[data-cut]"
        );


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

        let normalized =
            String(value)
                .trim()
                .replace(/\s/g, "")
                .replace(",", ".");


        if (!normalized) {
            return null;
        }


        const number =
            Number(normalized);


        if (
            !Number.isFinite(number) ||
            number <= 0
        ) {
            return null;
        }


        return number;
    }


    /* ========================= */
    /* FORMAT NUMBER */
    /* ========================= */

    function formatNumber(
        value,
        decimals = 2
    ) {

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

    function getAutomaticHeight(
        diameter
    ) {

        return diameter *
            DEFAULT_HEIGHT_RATIO;
    }


    /* ========================= */
    /* SIZE → CARAT */
    /* ========================= */

    function calculateCaratFromDimensions() {

        if (selectedCut !== "round") {
            return;
        }


        const length =
            parseNumber(
                lengthInput.value
            );

        const width =
            parseNumber(
                widthInput.value
            );


        /*
         * Пока нет двух основных размеров,
         * ничего не считаем.
         */

        if (!length || !width) {

            caratResult.textContent = "—";

            standardSize.textContent = "—";

            return;
        }


        /*
         * Если высота введена вручную —
         * используем её.
         *
         * Если нет —
         * используем 60% от среднего
         * диаметра.
         */

        let height =
            parseNumber(
                heightInput.value
            );


        if (!height) {

            const diameter =
                (length + width) / 2;

            height =
                getAutomaticHeight(
                    diameter
                );
        }


        /*
         * Основная формула.
         */

        const carat =
            length *
            width *
            height *
            COEFFICIENT;


        if (
            !Number.isFinite(carat) ||
            carat <= 0
        ) {

            caratResult.textContent = "—";

            standardSize.textContent = "—";

            return;
        }


        /*
         * Результат показываем
         * с тремя знаками.
         */

        const roundedCarat =
            Math.round(
                carat * 1000
            ) / 1000;


        caratResult.textContent =
            formatCarat(
                roundedCarat
            );


        /*
         * Синхронизируем поле каратности.
         */

        if (!updating) {

            updating = true;

            caratInput.value =
                roundedCarat
                    .toFixed(3);

            updating = false;
        }


        /*
         * Стандартный размер.
         *
         * Размеры всегда 2 знака.
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
            parseNumber(
                caratInput.value
            );


        if (!carat) {

            standardSize.textContent = "—";

            caratResult.textContent = "—";

            return;
        }


        /*
         * Обратная формула:
         *
         * ct = D³ × 0.60 × 0.0061
         *
         * D = cbrt(
         *     ct /
         *     (0.60 × 0.0061)
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
            getAutomaticHeight(
                diameter
            );


        if (
            !Number.isFinite(diameter) ||
            diameter <= 0
        ) {

            standardSize.textContent = "—";

            caratResult.textContent = "—";

            return;
        }


        const diameterText =
            formatNumber(
                diameter,
                2
            );


        const heightText =
            formatNumber(
                height,
                2
            );


        /*
         * Размеры записываем
         * с двумя знаками.
         */

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


        /*
         * Каратность показываем
         * с тремя знаками.
         */

        caratResult.textContent =
            formatCarat(carat);
    }


    /* ========================= */
    /* DIMENSION INPUT */
    /* ========================= */

    function onDimensionInput() {

        if (updating) {
            return;
        }


        calculateCaratFromDimensions();
    }


    /* ========================= */
    /* CARAT INPUT */
    /* ========================= */

    function onCaratInput() {

        if (updating) {
            return;
        }


        calculateDimensionsFromCarat();
    }


    /* ========================= */
    /* RESET */
    /* ========================= */

    function resetCalculator() {

        lengthInput.value = "";

        widthInput.value = "";

        heightInput.value = "";

        caratInput.value = "";


        caratResult.textContent =
            "—";

        standardSize.textContent =
            "—";
    }


    /* ========================= */
    /* CUT BUTTONS */
    /* ========================= */

    cutButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    if (button.disabled) {
                        return;
                    }


                    cutButtons.forEach(
                        (item) => {

                            item.classList.remove(
                                "active"
                            );
                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    selectedCut =
                        button.dataset.cut;
                }
            );
        }
    );


    /* ========================= */
    /* CONTINUE */
    /* ========================= */

    continueButton.addEventListener(
        "click",
        () => {

            cutScreen.classList.add(
                "hidden"
            );

            calculatorScreen.classList.remove(
                "hidden"
            );


            /*
             * Здесь ничего не подставляем.
             * Поля должны оставаться пустыми.
             */

            window.scrollTo(
                0,
                0
            );
        }
    );


    /* ========================= */
    /* BACK */
    /* ========================= */

    backButton.addEventListener(
        "click",
        () => {

            calculatorScreen.classList.add(
                "hidden"
            );

            cutScreen.classList.remove(
                "hidden"
            );


            window.scrollTo(
                0,
                0
            );
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
