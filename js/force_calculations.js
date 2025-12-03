const ALPHA0_DEG = 20;
const ALPHA0_RAD = toRadians(ALPHA0_DEG);

// Cache latest forces so reaction calc can reuse without re-parsing DOM
const forceState = {
    ft1: null,
    fr1: null,
    fe1: null,
    ft2: null,
    fr2: null,
    fe2: null,
};

document.addEventListener('DOMContentLoaded', () => {
    prefillFromStorage();
    wireHandlers();
    autoCalculateForces();
});

function wireHandlers() {
    const btnSupport = document.getElementById('calc-support');
    if (btnSupport) btnSupport.addEventListener('click', calculateSupportForces);

    // Recalculate forces automatically on input change
    const autoInputs = [
        'md1-input-force', 'd0-1-input', 'beta0-input',
        'md2-input-force', 'd0-3-input', 'beta0-2-input'
    ];
    autoInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => autoCalculateForces());
        }
    });
}

function prefillFromStorage() {
    const mappings = [
        { inputId: 'md1-input-force', storageKey: 'lastMd1', hintId: 'hint-md1', decimals: 3 },
        { inputId: 'md2-input-force', storageKey: 'lastMd2', hintId: 'hint-md2', decimals: 3 },
        { inputId: 'd0-1-input', storageKey: 'lastD0_1', hintId: 'hint-d0-1', decimals: 3 },
        { inputId: 'd0-2-input', storageKey: 'lastD0_2', hintId: 'hint-d0-2', decimals: 3 },
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
    return calculateForceSetWithOptions(cfg, { silent: false });
}

function calculateForceSetWithOptions(cfg, { silent = false }) {
    const Md = parseFloat(document.getElementById(cfg.mdInputId)?.value);
    const d0 = parseFloat(document.getElementById(cfg.d0InputId)?.value);
    const betaDeg = parseFloat(document.getElementById(cfg.betaInputId)?.value);

    if ([Md, d0, betaDeg].some(isNaN) || d0 === 0) {
        if (!silent) alert("Lütfen Md, D0 ve β0 değerlerini geçerli sayılarla doldurun.");
        return false;
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

    if (cfg.ftId === 'res-ft1') {
        forceState.ft1 = Ft;
        forceState.fr1 = Fr;
        forceState.fe1 = Fe;
    } else {
        forceState.ft2 = Ft;
        forceState.fr2 = Fr;
        forceState.fe2 = Fe;
    }

    return true;
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

function autoCalculateForces() {
    calculateForceSetWithOptions(forceConfig(1), { silent: true });
    calculateForceSetWithOptions(forceConfig(2), { silent: true });
}

function calculateSupportForces() {
    const l1 = parseFloat(document.getElementById('l1-input')?.value);
    const l2 = parseFloat(document.getElementById('l2-input')?.value);
    const l3 = parseFloat(document.getElementById('l3-input')?.value);
    const d02 = parseFloat(document.getElementById('d0-2-input')?.value);
    const d03 = parseFloat(document.getElementById('d0-3-input')?.value);

    const missingForce = [forceState.fe1, forceState.fr1, forceState.fe2, forceState.fr2].some(val => !isFinite(val));

    if ([l1, l2, l3, d02, d03].some(val => isNaN(val)) || !isFinite(d02) || !isFinite(d03)) {
        alert("Lütfen l1, l2, l3, D0,2 ve D0,3 değerlerini girin.");
        return;
    }

    if ((l1 + l2 + l3) === 0) {
        alert("l1 + l2 + l3 toplamı sıfır olamaz.");
        return;
    }

    if (missingForce) {
        alert("Önce Ft/Fr/Fe sonuçlarını hesaplayın (1. ve 2. kademe).");
        return;
    }

    // Moment dengesi: Fbx*(l1+l2+l3)+Fe2*(d03/2)-Fr2*(l1+l2)+Fe1*(d02/2)+Fr1*l1=0
    const momentTerm = forceState.fe2 * (d03 / 2) - forceState.fr2 * (l1 + l2) + forceState.fe1 * (d02 / 2) + forceState.fr1 * l1;
    const Fbx = -momentTerm / (l1 + l2 + l3);

    // Dikey kuvvet dengesi: Fax+Fr1+Fbx-Fr2=0 => Fax = Fr2 - Fr1 - Fbx
    const Fax = forceState.fr2 - forceState.fr1 - Fbx;

    updateResult('res-fbx', Fbx);
    updateResult('res-fax', Fax);

    const note = document.getElementById('fbx-note');
    if (note) {
        if (isFinite(Fbx) && Fbx < 0) {
            note.textContent = "Fbx negatif: yön ters.";
        } else {
            note.textContent = "";
        }
    }
}
