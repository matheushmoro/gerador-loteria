const generateButton = document.querySelector("#generate-btn");
const amountSelect = document.querySelector("#amount");
const numbersList = document.querySelector("#numbers-list");
const ticketMarks = document.querySelector("#ticket-marks");
const ticketImage = document.querySelector("#ticket-image");
const gameSubtitle = document.querySelector("#game-subtitle");
const amountLabel = document.querySelector("#amount-label");
const gameTabs = document.querySelectorAll(".game-tab");
const switchTargets = document.querySelectorAll(".hero, .logo-ticket");

const GAME_CONFIG = {
    mega: {
        key: "mega",
        bodyClass: "game-mega",
        title: "Mega-Sena",
        subtitle: "Gere aqui seus números para a mega-sena automaticamente",
        ticketImage: "assets/bilhete-ms-hd-section.png",
        ticketRatio: "1376 / 752",
        amountMin: 6,
        amountMax: 20,
        totalNumbers: 60,
        gridCols: 10,
        gridRows: 6,
        gridLeft: "14.7%",
        gridTop: "49.5%",
        gridWidth: "74.4%",
        gridHeight: "38.9%",
        markWidth: "67%",
        markHeight: "82%",
    },
    lotofacil: {
        key: "lotofacil",
        bodyClass: "game-lotofacil",
        title: "Lotofácil",
        subtitle: "Gere aqui seus números para a lotofácil automaticamente",
        ticketImage: "assets/bilhete-lf-hd-section.png",
        ticketRatio: "688 / 549",
        amountMin: 15,
        amountMax: 20,
        totalNumbers: 25,
        gridCols: 5,
        gridRows: 5,
        gridLeft: "13.2%",
        gridTop: "60.8%",
        gridWidth: "73.8%",
        gridHeight: "36.4%",
        markWidth: "56%",
        markHeight: "72%",
    },
};

let currentGameKey = null;
let isSwitchingGame = false;

const SWITCH_OUT_MS = 200;
const SWITCH_IN_MS = 280;

function formatNumber(value) {
    return String(value).padStart(2, "0");
}

function generateNumbers(quantity, maxValue) {
    const values = new Set();

    while (values.size < quantity) {
        const randomNumber = Math.floor(Math.random() * maxValue) + 1;
        values.add(randomNumber);
    }

    return [...values].sort((a, b) => a - b);
}

function buildAmountOptions(min, max) {
    amountSelect.innerHTML = "";

    for (let value = min; value <= max; value += 1) {
        const option = document.createElement("option");
        option.value = String(value);
        option.textContent = String(value);
        amountSelect.appendChild(option);
    }
}

function renderNumbers(numbers) {
    numbersList.innerHTML = "";

    numbers.forEach((number, index) => {
        const box = document.createElement("div");
        box.className = "number-box";
        box.style.animationDelay = `${index * 45}ms`;
        box.textContent = formatNumber(number);
        numbersList.appendChild(box);
    });
}

function renderTicketMarks(numbers, gameConfig) {
    ticketMarks.innerHTML = "";

    numbers.forEach((number) => {
        let column;
        let row;

        if (gameConfig.key === "lotofacil") {
            // LotoFacil ticket is numbered by columns: right-to-left, top-to-bottom.
            const index = number - 1;
            const colFromRight = Math.floor(index / gameConfig.gridRows);
            column = gameConfig.gridCols - colFromRight;
            row = (index % gameConfig.gridRows) + 1;
        } else {
            // Mega-Sena keeps the conventional left-to-right, top-to-bottom order.
            column = ((number - 1) % gameConfig.gridCols) + 1;
            row = Math.floor((number - 1) / gameConfig.gridCols) + 1;
        }

        const mark = document.createElement("div");

        mark.className = "ticket-mark";
        mark.dataset.col = String(column);
        mark.dataset.row = String(row);
        mark.style.gridColumnStart = String(column);
        mark.style.gridRowStart = String(row);

        ticketMarks.appendChild(mark);
    });
}

function updateActiveTab(gameKey) {
    gameTabs.forEach((tab) => {
        tab.classList.toggle("is-active", tab.dataset.game === gameKey);
    });
}

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function applySwitchAnimation(className) {
    switchTargets.forEach((element) => {
        element.classList.add("switch-target");
        element.classList.remove("switch-out", "switch-in");
        if (className) {
            element.classList.add(className);
        }
    });
}

function applyGameConfig(gameKey) {
    const gameConfig = GAME_CONFIG[gameKey];
    currentGameKey = gameKey;

    document.body.classList.remove("game-mega", "game-lotofacil");
    document.body.classList.add(gameConfig.bodyClass);

    updateActiveTab(gameKey);
    document.title = `Gerador De Jogo | ${gameConfig.title}`;
    gameSubtitle.textContent = gameConfig.subtitle;
    amountLabel.textContent = "Quantos números você vai jogar?";

    ticketImage.src = gameConfig.ticketImage;
    ticketImage.alt = `Bilhete da ${gameConfig.title}`;

    document.documentElement.style.setProperty("--ticket-aspect-ratio", gameConfig.ticketRatio);
    document.documentElement.style.setProperty("--ticket-grid-cols", String(gameConfig.gridCols));
    document.documentElement.style.setProperty("--ticket-grid-rows", String(gameConfig.gridRows));
    document.documentElement.style.setProperty("--ticket-grid-left", gameConfig.gridLeft);
    document.documentElement.style.setProperty("--ticket-grid-top", gameConfig.gridTop);
    document.documentElement.style.setProperty("--ticket-grid-width", gameConfig.gridWidth);
    document.documentElement.style.setProperty("--ticket-grid-height", gameConfig.gridHeight);
    document.documentElement.style.setProperty("--ticket-mark-width", gameConfig.markWidth);
    document.documentElement.style.setProperty("--ticket-mark-height", gameConfig.markHeight);

    buildAmountOptions(gameConfig.amountMin, gameConfig.amountMax);
    numbersList.innerHTML = "";
    ticketMarks.innerHTML = "";
}

async function switchGame(gameKey, animate = true) {
    if (isSwitchingGame || gameKey === currentGameKey) {
        return;
    }

    if (!animate) {
        applyGameConfig(gameKey);
        return;
    }

    isSwitchingGame = true;
    applySwitchAnimation("switch-out");
    await wait(SWITCH_OUT_MS);

    applyGameConfig(gameKey);
    applySwitchAnimation("switch-in");
    await wait(SWITCH_IN_MS);

    applySwitchAnimation("");
    isSwitchingGame = false;
}

function handleGenerateClick() {
    const gameConfig = GAME_CONFIG[currentGameKey];
    const quantity = Number(amountSelect.value);
    const generatedNumbers = generateNumbers(quantity, gameConfig.totalNumbers);

    renderNumbers(generatedNumbers);
    renderTicketMarks(generatedNumbers, gameConfig);
}

generateButton.addEventListener("click", handleGenerateClick);

gameTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        switchGame(tab.dataset.game);
    });
});

switchGame("mega", false);
