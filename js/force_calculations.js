const ALPHA0_DEG = 20;
const ALPHA0_RAD = toRadians(ALPHA0_DEG);

document.addEventListener('DOMContentLoaded', () => {
    prefillFromStorage();
    wireHandlers();
});

function wireHandlers() {
    const btn1 = document.getElementById('calc-force-1');
    const btn2 = document.getElementById('calc-force-2');
    if (btn1) btn1.addEventListener('click', () => calculateForceSet(forceConfig(1)));
    if (btn2) btn2.addEventListener('click', () => calculateForceSet(forceConfig(2)));
}

function prefillFromStorage() {
    const mappings = [
        { inputId: 'md1-input-force', storageKey: 'lastMd1', hintId: 'hint-md1', decimals: 3 },
        { inputId: 'md2-input-force', storageKey: 'lastMd2', hintId: 'hint-md2', decimals: 3 },
        { inputId: 'd0-1-input', storageKey: 'lastD0_1', hintId: 'hint-d0-1', decimals: 3 },
        { inputId: 'd0-3-input', storageKey: 'lastD0_3', hintId: 'hint-d0-3', decimals: 3 },
        { inputId: 'beta0-input', storageKey: 'lastBeta0', hintId: 'hint-beta0', decimals: 4 },
        { inputId: 'beta0-2-input', storageKey: 'lastBeta0_2', hintId: 'hint-beta0-2', decimals: 4 },
    ];

    mappings.forEach(map => {
        const val = localStorage.getItem(map.storageKey);
        if (!val) {
            if (map.hintId) setHint(map.hintId, '-');
            return;
        }

        const numVal = parseFloat(val);
        if (isNaN(numVal)) {
            if (map.hintId) setHint(map.hintId, '-');
            return;
        }

        const decimals = map.decimals ?? 3;
        const formatted = numVal.toFixed(decimals);

        const input = document.getElementById(map.inputId);
        if (input && !input.value) {
            input.value = formatted;
        }

        if (map.hintId) {
            setHint(map.hintId, formatted);
        }
    });

    // Alpha is fixed, still show it in hints for clarity
    setHint('hint-alpha', `${ALPHA0_DEG.toFixed(1)}° (sabit)`);
}

function forceConfig(stage) {
    if (stage === 1) {
        return {
            mdInputId: 'md1-input-force',
            d0InputId: 'd0-1-input',
            betaInputId: 'beta0-input',
            ftId: 'res-ft1',
            frId: 'res-fr1',
            feId: 'res-fe1'
        };
    }

    return {
        mdInputId: 'md2-input-force',
        d0InputId: 'd0-3-input',
        betaInputId: 'beta0-2-input',
        ftId: 'res-ft2',
        frId: 'res-fr2',
        feId: 'res-fe2'
    };
}

function calculateForceSet(cfg) {
    const Md = parseFloat(document.getElementById(cfg.mdInputId)?.value);
    const d0 = parseFloat(document.getElementById(cfg.d0InputId)?.value);
    const betaDeg = parseFloat(document.getElementById(cfg.betaInputId)?.value);

    if ([Md, d0, betaDeg].some(isNaN) || d0 === 0) {
        alert("Lütfen Md, D0 ve β0 değerlerini geçerli sayılarla doldurun.");
        return;
    }

    const betaRad = toRadians(betaDeg);
    const cosBeta = Math.cos(betaRad);
    const tanBeta = Math.tan(betaRad);

    const Ft = (2 * Md) / d0;
    const Fr = (Ft / cosBeta) * Math.tan(ALPHA0_RAD);
    const Fe = Ft * tanBeta;

    updateResult(cfg.ftId, Ft);
    updateResult(cfg.frId, Fr);
    updateResult(cfg.feId, Fe);
}

function updateResult(id, val) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = isFinite(val) ? val.toFixed(3) + " N" : '-';
    }
}

function setHint(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}
