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
});

function wireHandlers() {
    const btnSupport1 = document.getElementById('calc-support-1');
    if (btnSupport1) btnSupport1.addEventListener('click', calculateSupportForces1);

    const btnSupport2 = document.getElementById('calc-support-2');
    if (btnSupport2) btnSupport2.addEventListener('click', calculateSupportForces2);

    const btnSupport3 = document.getElementById('calc-support-3');
    if (btnSupport3) btnSupport3.addEventListener('click', calculateSupportForces3);

    const btnForce1 = document.getElementById('calc-force-1');
    if (btnForce1) btnForce1.addEventListener('click', () => calculateForceSet(forceConfig(1)));

    const btnForce2 = document.getElementById('calc-force-2');
    if (btnForce2) btnForce2.addEventListener('click', () => calculateForceSet(forceConfig(2)));
}

function prefillFromStorage() {
    const mappings = [
        { inputId: 'md1-input-force', storageKey: 'lastMd1', hintId: 'hint-md1', decimals: 3 },
        { inputId: 'md2-input-force', storageKey: 'lastMd3', hintId: 'hint-md2', decimals: 3 },
        { inputId: 'd0-1-input', storageKey: 'lastD0_1', hintId: 'hint-d0-1', decimals: 3 },
        { inputId: 'd0-2-input', storageKey: 'lastD0_2', hintId: 'hint-d0-2', decimals: 3 },
        { inputId: 'd0-3-input', storageKey: 'lastD0_3', hintId: 'hint-d0-3', decimals: 3 },
        { inputId: 'd0-4-input', storageKey: 'lastD0_4', hintId: 'hint-d0-4', decimals: 3 },
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

function updateSupportResult(id, val) {
    const el = document.getElementById(id);
    if (!el) return;

    if (!isFinite(val)) {
        el.textContent = '-';
        return;
    }

    const note = val < 0 ? " (yönü ters)" : "";
    el.textContent = `${val.toFixed(3)} N${note}`;
}

function setHint(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// Helper function to get common values needed for support calculations
function getSupportInputs() {
    const l1 = parseFloat(document.getElementById('l1-input')?.value);
    const l2 = parseFloat(document.getElementById('l2-input')?.value);
    const l3 = parseFloat(document.getElementById('l3-input')?.value);
    const d01 = parseFloat(document.getElementById('d0-1-input')?.value);
    const d02 = parseFloat(document.getElementById('d0-2-input')?.value);
    const d03 = parseFloat(document.getElementById('d0-3-input')?.value);
    const d04 = parseFloat(document.getElementById('d0-4-input')?.value);

    return { l1, l2, l3, d01, d02, d03, d04 };
}

function checkLengthsValid(l1, l2, l3) {
    if ([l1, l2, l3].some(isNaN)) {
        alert("Lütfen l1, l2 ve l3 değerlerini girin.");
        return false;
    }
    if ((l1 + l2 + l3) === 0) {
        alert("l1 + l2 + l3 toplamı sıfır olamaz.");
        return false;
    }
    return true;
}

/**
 * 1. Destek: Fh ve Fj hesabı
 * Formüller:
 * Fjx*(l1+l2+l3) - Fr1*l1 - Fe1*(D01/2) = 0 → Fjx bulunur
 * Fhx + Fjx - Fr1 = 0 → Fhx bulunur
 * Ft1*l1 - Fjy*(l1+l2+l3) = 0 → Fjy bulunur
 * Ft1 - Fhy - Fjy = 0 → Fhy bulunur
 * Fj = sqrt(Fjx^2 + Fjy^2), Fh = sqrt(Fhx^2 + Fhy^2)
 */
function calculateSupportForces1() {
    const { l1, l2, l3, d01 } = getSupportInputs();

    if (!checkLengthsValid(l1, l2, l3)) return;

    if (isNaN(d01)) {
        alert("Lütfen D0,1 değerini girin.");
        return;
    }

    // Check if Ft1, Fr1, Fe1 are calculated
    if (!isFinite(forceState.ft1) || !isFinite(forceState.fr1) || !isFinite(forceState.fe1)) {
        alert("Önce 1. kademede Ft1/Fr1/Fe1 hesaplarını yapın.");
        return;
    }

    const totalLength = l1 + l2 + l3;

    // Fjx*(l1+l2+l3) - Fr1*l1 - Fe1*(D01/2) = 0
    // Fjx = (Fr1*l1 + Fe1*(D01/2)) / (l1+l2+l3)
    const Fjx = (forceState.fr1 * l1 + forceState.fe1 * (d01 / 2)) / totalLength;

    // Fhx + Fjx - Fr1 = 0
    // Fhx = -Fjx + Fr1
    const Fhx = -Fjx + forceState.fr1;

    // Ft1*l1 - Fjy*(l1+l2+l3) = 0
    // Fjy = (Ft1*l1) / (l1+l2+l3)
    const Fjy = (forceState.ft1 * l1) / totalLength;

    // Ft1 - Fhy - Fjy = 0
    // Fhy = Ft1 - Fjy
    const Fhy = forceState.ft1 - Fjy;

    // Resultant forces
    const Fj = Math.sqrt(Fjx * Fjx + Fjy * Fjy);
    const Fh = Math.sqrt(Fhx * Fhx + Fhy * Fhy);

    // Update UI
    updateSupportResult('res-fjx', Fjx);
    updateSupportResult('res-fhx', Fhx);
    updateSupportResult('res-fjy', Fjy);
    updateSupportResult('res-fhy', Fhy);
    updateSupportResult('res-fj', Fj);
    updateSupportResult('res-fh', Fh);
}

/**
 * 2. Destek: Fk ve Fl hesabı
 * Formüller:
 * Flx*(l1+l2+l3) - Fe2*(D03/2) - Fr2*(l1+l2) + Fr1*l1 - Fe1*(D02/2) = 0 → Flx bulunur
 * Flx + Fr1 - Fr2 - Fkx = 0 → Fkx bulunur
 * Fly*(l1+l2+l3) - Ft2*(l1+l2) - Ft1*l1 = 0 → Fly bulunur
 * Fky + Fly - Ft1 - Ft2 = 0 → Fky bulunur
 * Fl = sqrt(Flx^2 + Fly^2), Fk = sqrt(Fkx^2 + Fky^2)
 */
function calculateSupportForces2() {
    const { l1, l2, l3, d02, d03 } = getSupportInputs();

    if (!checkLengthsValid(l1, l2, l3)) return;

    if (isNaN(d02) || isNaN(d03)) {
        alert("Lütfen D0,2 ve D0,3 değerlerini girin.");
        return;
    }

    // Check if all forces are calculated
    const allForcesValid = [
        forceState.ft1, forceState.fr1, forceState.fe1,
        forceState.ft2, forceState.fr2, forceState.fe2
    ].every(isFinite);

    if (!allForcesValid) {
        alert("Önce 1. ve 2. kademede Ft/Fr/Fe hesaplarını yapın.");
        return;
    }

    const totalLength = l1 + l2 + l3;

    // Flx*(l1+l2+l3) - Fe2*(D03/2) - Fr2*(l1+l2) + Fr1*l1 - Fe1*(D02/2) = 0
    // Flx = (Fe2*(D03/2) + Fr2*(l1+l2) - Fr1*l1 + Fe1*(D02/2)) / (l1+l2+l3)
    const Flx = (forceState.fe2 * (d03 / 2) + forceState.fr2 * (l1 + l2) - forceState.fr1 * l1 + forceState.fe1 * (d02 / 2)) / totalLength;

    // Flx + Fr1 - Fr2 - Fkx = 0
    // Fkx = Flx + Fr1 - Fr2
    const Fkx = Flx + forceState.fr1 - forceState.fr2;

    // Fly*(l1+l2+l3) - Ft2*(l1+l2) - Ft1*l1 = 0
    // Fly = (Ft2*(l1+l2) + Ft1*l1) / (l1+l2+l3)
    const Fly = (forceState.ft2 * (l1 + l2) + forceState.ft1 * l1) / totalLength;

    // Fky + Fly - Ft1 - Ft2 = 0
    // Fky = Ft1 + Ft2 - Fly
    const Fky = forceState.ft1 + forceState.ft2 - Fly;

    // Resultant forces
    const Fl = Math.sqrt(Flx * Flx + Fly * Fly);
    const Fk = Math.sqrt(Fkx * Fkx + Fky * Fky);

    // Update UI
    updateSupportResult('res-flx', Flx);
    updateSupportResult('res-fkx', Fkx);
    updateSupportResult('res-fly', Fly);
    updateSupportResult('res-fky', Fky);
    updateSupportResult('res-fl', Fl);
    updateSupportResult('res-fk', Fk);
}

/**
 * 3. Destek: Fm ve Fn hesabı
 * Formüller:
 * Fnx*(l1+l2+l3) + Fr2*(l1+l2) - Fe2*(D04/2) = 0 → Fnx bulunur
 * Fnx + Fr2 - Fmx = 0 → Fmx bulunur
 * Fr2*(l1+l2) - Fny*(l1+l2+l3) = 0 → Fny bulunur
 * Fr2 - Fmy - Fny = 0 → Fmy bulunur
 * Fn = sqrt(Fnx^2 + Fny^2), Fm = sqrt(Fmx^2 + Fmy^2)
 */
function calculateSupportForces3() {
    const { l1, l2, l3, d04 } = getSupportInputs();

    if (!checkLengthsValid(l1, l2, l3)) return;

    if (isNaN(d04)) {
        alert("Lütfen D0,4 değerini girin.");
        return;
    }

    // Check if stage 2 forces are calculated
    if (!isFinite(forceState.ft2) || !isFinite(forceState.fr2) || !isFinite(forceState.fe2)) {
        alert("Önce 2. kademede Ft2/Fr2/Fe2 hesaplarını yapın.");
        return;
    }

    const totalLength = l1 + l2 + l3;

    // Fnx*(l1+l2+l3) + Fr2*(l1+l2) - Fe2*(D04/2) = 0
    // Fnx = (Fe2*(D04/2) - Fr2*(l1+l2)) / (l1+l2+l3)
    const Fnx = (forceState.fe2 * (d04 / 2) - forceState.fr2 * (l1 + l2)) / totalLength;

    // Fnx + Fr2 - Fmx = 0
    // Fmx = Fnx + Fr2
    const Fmx = Fnx + forceState.fr2;

    // Fr2*(l1+l2) - Fny*(l1+l2+l3) = 0
    // Fny = Fr2*(l1+l2) / (l1+l2+l3)
    const Fny = (forceState.fr2 * (l1 + l2)) / totalLength;

    // Fr2 - Fmy - Fny = 0
    // Fmy = Fr2 - Fny
    const Fmy = forceState.fr2 - Fny;

    // Resultant forces
    const Fn = Math.sqrt(Fnx * Fnx + Fny * Fny);
    const Fm = Math.sqrt(Fmx * Fmx + Fmy * Fmy);

    // Update UI
    updateSupportResult('res-fnx', Fnx);
    updateSupportResult('res-fmx', Fmx);
    updateSupportResult('res-fny', Fny);
    updateSupportResult('res-fmy', Fmy);
    updateSupportResult('res-fn', Fn);
    updateSupportResult('res-fm', Fm);
}
