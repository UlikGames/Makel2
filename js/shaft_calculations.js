const shaftData = [
    // k6 Tolerance Group
    { d: 12, l: 30, tol: 'k6' },
    { d: 14, l: 30, tol: 'k6' },
    { d: 16, l: 30, tol: 'k6' },
    { d: 19, l: 40, tol: 'k6' },
    { d: 20, l: 40, tol: 'k6' },
    { d: 22, l: 40, tol: 'k6' },
    { d: 24, l: 50, tol: 'k6' },
    { d: 25, l: 50, tol: 'k6' },
    { d: 28, l: 60, tol: 'k6' },
    { d: 30, l: 60, tol: 'k6' },
    { d: 32, l: 80, tol: 'k6' },
    { d: 35, l: 80, tol: 'k6' },
    { d: 38, l: 80, tol: 'k6' },
    { d: 40, l: 110, tol: 'k6' },
    { d: 42, l: 110, tol: 'k6' },
    { d: 45, l: 110, tol: 'k6' },
    { d: 48, l: 110, tol: 'k6' },
    { d: 50, l: 110, tol: 'k6' },

    // m6 Tolerance Group
    { d: 55, l: 110, tol: 'm6' },
    { d: 60, l: 110, tol: 'm6' },
    { d: 65, l: 110, tol: 'm6' },
    { d: 70, l: 140, tol: 'm6' },
    { d: 75, l: 140, tol: 'm6' },
    { d: 80, l: 170, tol: 'm6' },
    { d: 85, l: 170, tol: 'm6' },
    { d: 90, l: 170, tol: 'm6' },
    { d: 95, l: 170, tol: 'm6' },
    { d: 100, l: 210, tol: 'm6' },
    { d: 110, l: 210, tol: 'm6' },
    { d: 120, l: 210, tol: 'm6' },
    { d: 140, l: 250, tol: 'm6' },
    { d: 160, l: 300, tol: 'm6' },
    { d: 180, l: 300, tol: 'm6' },
    { d: 200, l: 350, tol: 'm6' }
];

// Unique standard lengths sorted
const standardLengths = [30, 40, 50, 60, 80, 110, 140, 170, 210, 250, 300, 350];

// Allowable shear stress (MPa)
const TAU_EM = 38;
const KEYWAY_CONSTANTS = {
    pG: 1500,
    tauOf: 380,
    roundStep: 5
};

const keywayTable = [
    { minD: 8, maxD: 10, b: 3, h: 3, t1: 1.8, t2: 1.4, lMin: 6, lMax: 36, tol: '+0.1' },
    { minD: 11, maxD: 12, b: 4, h: 4, t1: 2.5, t2: 1.8, lMin: 8, lMax: 45, tol: '+0.1' },
    { minD: 13, maxD: 17, b: 5, h: 5, t1: 3.0, t2: 2.3, lMin: 10, lMax: 56, tol: '+0.1' },
    { minD: 18, maxD: 22, b: 6, h: 6, t1: 3.5, t2: 2.8, lMin: 14, lMax: 70, tol: '+0.1' },
    { minD: 23, maxD: 30, b: 8, h: 7, t1: 4.0, t2: 3.3, lMin: 18, lMax: 90, tol: '+0.2' },
    { minD: 31, maxD: 38, b: 10, h: 8, t1: 5.0, t2: 3.3, lMin: 20, lMax: 110, tol: '+0.2' },
    { minD: 39, maxD: 44, b: 12, h: 8, t1: 5.0, t2: 3.3, lMin: 28, lMax: 140, tol: '+0.2' },
    { minD: 45, maxD: 50, b: 14, h: 9, t1: 5.5, t2: 3.8, lMin: 36, lMax: 160, tol: '+0.2' },
    { minD: 51, maxD: 58, b: 16, h: 10, t1: 6.0, t2: 4.3, lMin: 45, lMax: 180, tol: '+0.2' },
    { minD: 59, maxD: 65, b: 18, h: 11, t1: 7.0, t2: 4.4, lMin: 50, lMax: 200, tol: '+0.2' },
    { minD: 66, maxD: 75, b: 20, h: 12, t1: 7.5, t2: 4.9, lMin: 56, lMax: 250, tol: '+0.2' },
    { minD: 76, maxD: 85, b: 22, h: 14, t1: 9.0, t2: 5.4, lMin: 63, lMax: 250, tol: '+0.2' },
    { minD: 86, maxD: 95, b: 22, h: 16, t1: 9.0, t2: 5.4, lMin: 70, lMax: 280, tol: '+0.2' },
    { minD: 96, maxD: 110, b: 28, h: 16, t1: 10.0, t2: 6.4, lMin: 80, lMax: 320, tol: '+0.2' },
    { minD: 111, maxD: 130, b: 32, h: 18, t1: 11.0, t2: 7.4, lMin: 90, lMax: 360, tol: '+0.2' },
    { minD: 131, maxD: 150, b: 36, h: 20, t1: 12.0, t2: 8.4, lMin: 100, lMax: 400, tol: '+0.3' },
    { minD: 151, maxD: 170, b: 40, h: 22, t1: 13.0, t2: 9.4, lMin: 110, lMax: 400, tol: '+0.3' },
];

// DIN 5462 spline data (nominal dimensions in mm), limited to table slice in the provided sheet.
const splineProfiles = [
    // 6 keys
    { label: '6 x 23 x 26', keys: 6, centering: 'interior centering', d1: 23, d2: 26, b: 6, D3: 22.1, e2: 1.3, f: 3.54, g: 0.3, K: 0.3, r: 0.2 },
    { label: '6 x 26 x 30', keys: 6, centering: 'interior centering', d1: 26, d2: 30, b: 6, D3: 24.6, e2: 1.8, f: 3.85, g: 0.3, K: 0.3, r: 0.2 },
    { label: '6 x 28 x 32', keys: 6, centering: 'interior centering', d1: 28, d2: 32, b: 7, D3: 26.7, e2: 1.8, f: 4.03, g: 0.3, K: 0.3, r: 0.2 },

    // 8 keys
    { label: '8 x 32 x 36', keys: 8, centering: 'interior of flank centering', d1: 32, d2: 36, b: 7, D3: 30.4, e2: 1.9, f: 2.71, g: 0.4, K: 0.4, r: 0.3 },
    { label: '8 x 36 x 40', keys: 8, centering: 'interior of flank centering', d1: 36, d2: 40, b: 7, D3: 34.5, e2: 1.6, f: 3.46, g: 0.4, K: 0.4, r: 0.3 },
    { label: '8 x 42 x 46', keys: 8, centering: 'interior of flank centering', d1: 42, d2: 46, b: 8, D3: 40.4, e2: 1.7, f: 5.03, g: 0.4, K: 0.4, r: 0.3 },
    { label: '8 x 46 x 50', keys: 8, centering: 'interior of flank centering', d1: 46, d2: 50, b: 9, D3: 44.6, e2: 1.7, f: 5.75, g: 0.4, K: 0.4, r: 0.3 },
    { label: '8 x 52 x 58', keys: 8, centering: 'interior of flank centering', d1: 52, d2: 58, b: 10, D3: 49.7, e2: 2.7, f: 4.89, g: 0.5, K: 0.5, r: 0.5 },
    { label: '8 x 56 x 62', keys: 8, centering: 'interior of flank centering', d1: 56, d2: 62, b: 10, D3: 53.6, e2: 2.8, f: 6.38, g: 0.5, K: 0.5, r: 0.5 },
    { label: '8 x 62 x 68', keys: 8, centering: 'interior of flank centering', d1: 62, d2: 68, b: 12, D3: 59.8, e2: 2.5, f: 7.31, g: 0.5, K: 0.5, r: 0.5 },

    // 10 keys
    { label: '10 x 72 x 78', keys: 10, centering: 'interior of flank centering', d1: 72, d2: 78, b: 12, D3: 69.6, e2: 2.5, f: 5.45, g: 0.5, K: 0.5, r: 0.5 },
    { label: '10 x 82 x 88', keys: 10, centering: 'interior of flank centering', d1: 82, d2: 88, b: 12, D3: 79.3, e2: 2.7, f: 8.62, g: 0.5, K: 0.5, r: 0.5 },
    { label: '10 x 92 x 98', keys: 10, centering: 'interior of flank centering', d1: 92, d2: 98, b: 14, D3: 89.4, e2: 2.4, f: 10.1, g: 0.5, K: 0.5, r: 0.5 },
    { label: '10 x 102 x 108', keys: 10, centering: 'interior of flank centering', d1: 102, d2: 108, b: 16, D3: 99.9, e2: 2.3, f: 11.5, g: 0.5, K: 0.5, r: 0.5 },
    { label: '10 x 112 x 120', keys: 10, centering: 'interior of flank centering', d1: 112, d2: 120, b: 18, D3: 109.3, e2: 3.2, f: 10.7, g: 0.5, K: 0.5, r: 0.5 },
];

// Config for each shaft card (1., 2. ve 3. mil)
const shaftCardConfigs = [
    {
        diameterId: 'shaft-diameter',
        lengthId: 'shaft-length',
        toleranceId: 'tolerance-display',
        selectedId: 'selected-diameter-display',
        tauDisplayId: 'tau-constant-display',
        storedMdId: 'stored-md1',
        mInputId: 'm1-input',
        kInputId: 'k-factor',
        calcBtnId: 'calculate-shaft-btn',
        resultsId: 'shaft-results',
        resMdId: 'res-md1-shaft',
        resDdisId: 'res-ddis',
        resSolidId: 'res-solid-d',
        localKey: 'lastMd1',
        torqueLabel: 'Md1',
        summaryMdId: 'summary-md1-shaft',
        summaryDdisId: 'summary-ddis1',
        summarySolidId: 'summary-solid1',
    },
    {
        diameterId: 'shaft2-diameter',
        lengthId: 'shaft2-length',
        toleranceId: 'tolerance2-display',
        selectedId: 'selected-diameter-display-2',
        tauDisplayId: 'tau-constant-display-2',
        storedMdId: 'stored-md2',
        mInputId: 'm2-input',
        kInputId: 'k-factor-2',
        calcBtnId: 'calculate-shaft-btn-2',
        resultsId: 'shaft-results-2',
        resMdId: 'res-md2-shaft',
        resDdisId: 'res-ddis-2',
        resSolidId: 'res-solid-d-2',
        localKey: 'lastMd2',
        torqueLabel: 'Md2',
        summaryMdId: 'summary-md2-shaft',
        summaryDdisId: 'summary-ddis2',
        summarySolidId: 'summary-solid2',
        keyway: {
            btnId: 'calc-keyway-btn',
            tauOk: 32,  // 2. Dişli için
            outputs: {
                range: 'keyway-range',
                bh: 'keyway-bh',
                t1: 'keyway-t1',
                t2: 'keyway-t2',
                lRange: 'keyway-l-range',
                dUsed: 'keyway-d-used',
                ft: 'keyway-ft',
                lPg: 'keyway-l-pg',
                lTau32: 'keyway-l-tau32',
                lTau380: 'keyway-l-tau380',
                lFinal: 'keyway-l-final'
            },
            mbSources: {
                // Mb = Md2 (normal modül sonucu, k uygulanmadan)
                ids: ['res-Md3', 'm2-input', 'stored-md2'],
                storageKeys: ['lastMd2', 'lastMd3']
            }
        }
    },
    {
        diameterId: 'shaft3-diameter',
        lengthId: 'shaft3-length',
        toleranceId: 'tolerance3-display',
        selectedId: 'selected-diameter-display-3',
        tauDisplayId: 'tau-constant-display-3',
        storedMdId: 'stored-md3',
        mInputId: 'm3-input',
        kInputId: 'k-factor-3',
        calcBtnId: 'calculate-shaft-btn-3',
        resultsId: 'shaft-results-3',
        resMdId: 'res-md3-shaft',
        resDdisId: 'res-ddis-3',
        resSolidId: 'res-solid-d-3',
        localKey: 'lastMd3',
        torqueLabel: 'Md3',
        summaryMdId: 'summary-md3-shaft',
        summaryDdisId: 'summary-ddis3',
        summarySolidId: 'summary-solid3',
        splineIds: {
            containerId: 'spline-section',
            labelId: 'spline-label',
            keysId: 'spline-keys',
            centeringId: 'spline-centering',
            d1Id: 'spline-d1',
            d2Id: 'spline-d2',
            bId: 'spline-b',
            D3Id: 'spline-D3',
            e2Id: 'spline-e2',
            fId: 'spline-f',
            gId: 'spline-g',
            KId: 'spline-K',
            rId: 'spline-r',
        }
        ,
        keyway: {
            btnId: 'calc-keyway-btn-3',
            tauOk: 38,  // 4. Dişli için
            outputs: {
                range: 'keyway-range-3',
                bh: 'keyway-bh-3',
                t1: 'keyway-t1-3',
                t2: 'keyway-t2-3',
                lRange: 'keyway-l-range-3',
                dUsed: 'keyway-d-used-3',
                ft: 'keyway-ft-3',
                lPg: 'keyway-l-pg-3',
                lTau32: 'keyway-l-tau32-3',
                lTau380: 'keyway-l-tau380-3',
                lFinal: 'keyway-l-final-3'
            },
            mbSources: {
                // Mb = Md3 (normal modül 3. kademe momenti)
                ids: ['res-Md3-output', 'm3-input', 'stored-md3'],
                storageKeys: ['lastMd3']
            }
        }
    }
];

document.addEventListener('DOMContentLoaded', () => {
    shaftCardConfigs.forEach(config => {
        initShaftSelectors(config);
        initMdPrefill(config);
        setTauDisplay(config);

        const btn = document.getElementById(config.calcBtnId);
        if (btn) {
            btn.addEventListener('click', () => calculateShaftValues(config));
        }

        if (config.keyway?.btnId) {
            const keyBtn = document.getElementById(config.keyway.btnId);
            if (keyBtn) {
                keyBtn.addEventListener('click', () => calculateKeywaySizing(config));
            }
        }
    });

    renderKeywayTable();
});

function initShaftSelectors(config) {
    const diameterSelect = document.getElementById(config.diameterId);
    const lengthSelect = document.getElementById(config.lengthId);
    const toleranceDisplay = document.getElementById(config.toleranceId);
    const selectedDiameterDisplay = document.getElementById(config.selectedId);

    if (!diameterSelect || !lengthSelect || !toleranceDisplay) return;

    // Populate diameter dropdown (clear existing first)
    diameterSelect.innerHTML = '<option value="">Seçiniz...</option>';
    shaftData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.d;
        option.textContent = `${item.d} mm`;
        diameterSelect.appendChild(option);
    });

    diameterSelect.addEventListener('change', (e) => {
        const selectedDiameter = parseFloat(e.target.value);

        // Reset length dropdown
        lengthSelect.innerHTML = '<option value="">Seçiniz...</option>';
        lengthSelect.disabled = true;

        if (isNaN(selectedDiameter)) {
            toleranceDisplay.textContent = '-';
            if (selectedDiameterDisplay) selectedDiameterDisplay.textContent = '-';
            return;
        }

        const data = shaftData.find(item => item.d === selectedDiameter);

        if (data) {
            toleranceDisplay.textContent = data.tol;
            if (selectedDiameterDisplay) selectedDiameterDisplay.textContent = `${selectedDiameter.toFixed(3)} mm`;

            // Find base length index
            const baseIndex = standardLengths.indexOf(data.l);

            if (baseIndex !== -1) {
                // Determine end length
                let endLength = data.l; // Default to just the standard length

                if (baseIndex + 1 < standardLengths.length) {
                    endLength = standardLengths[baseIndex + 1];
                }

                // Generate options from standard length to next standard length with step of 5
                for (let len = data.l; len <= endLength; len += 5) {
                    const option = document.createElement('option');
                    option.value = len;

                    if (len === data.l) {
                        option.textContent = `${len} mm (Standart)`;
                    } else if (len === endLength) {
                        option.textContent = `${len} mm (Uzun Seri Sonu)`;
                    } else {
                        option.textContent = `${len} mm`;
                    }

                    lengthSelect.appendChild(option);
                }

                lengthSelect.disabled = false;
                // Select standard by default
                lengthSelect.value = data.l;
            }
        }
        else {
            toleranceDisplay.textContent = '-';
            if (selectedDiameterDisplay) selectedDiameterDisplay.textContent = `${selectedDiameter.toFixed(3)} mm`;
        }
    });

    // Initial display state
    if (selectedDiameterDisplay) selectedDiameterDisplay.textContent = '-';
    lengthSelect.disabled = true;
    toleranceDisplay.textContent = '-';
}

function initMdPrefill(config) {
    const storedMdDisplay = document.getElementById(config.storedMdId);
    const mInput = document.getElementById(config.mInputId);

    const savedMd = localStorage.getItem(config.localKey);
    if (savedMd && storedMdDisplay) {
        const savedValue = parseFloat(savedMd);
        if (!isNaN(savedValue)) {
            storedMdDisplay.textContent = `${savedValue.toFixed(3)} Nmm`;
            if (mInput && !mInput.value) {
                mInput.value = savedValue.toFixed(3);
            }
        } else {
            storedMdDisplay.textContent = '-';
        }
    } else if (storedMdDisplay) {
        storedMdDisplay.textContent = '-';
    }
}

function setTauDisplay(config) {
    const tauDisplay = document.getElementById(config.tauDisplayId);
    if (tauDisplay) {
        tauDisplay.textContent = `${TAU_EM.toFixed(3)} MPa (sabit)`;
    }
}

function calculateShaftValues(config) {
    const k = parseFloat(document.getElementById(config.kInputId)?.value);
    const M = parseFloat(document.getElementById(config.mInputId)?.value);
    const innerDiameter = parseFloat(document.getElementById(config.diameterId)?.value);

    if ([k, M, innerDiameter].some(val => isNaN(val))) {
        alert("Lütfen k, M değerlerini girin ve mil çapını seçin.");
        return;
    }

    // Md = k * M
    const Md = k * M;

    // Keep the base M available for later use
    if (!isNaN(M)) {
        localStorage.setItem(config.localKey, M.toFixed(3));
        const storedMdDisplay = document.getElementById(config.storedMdId);
        if (storedMdDisplay) storedMdDisplay.textContent = `${M.toFixed(3)} Nmm`;
    }

    // Hollow shaft outer diameter (Ddis) using allowable shear stress
    const Ddis = solveOuterDiameter(Md, innerDiameter, TAU_EM);

    // Solid shaft diameter
    const solidD = (Md > 0) ? Math.cbrt((16 * Md) / (Math.PI * TAU_EM)) : NaN;

    document.getElementById(config.resMdId).textContent = `${Md.toFixed(3)} Nmm`;
    document.getElementById(config.resDdisId).textContent = isFinite(Ddis) ? `${Ddis.toFixed(3)} mm` : 'Hesaplanamadı';
    document.getElementById(config.resSolidId).textContent = isFinite(solidD) ? `${solidD.toFixed(3)} mm` : 'Hesaplanamadı';

    // Summary badges
    const summaryMd = document.getElementById(config.summaryMdId);
    const summaryDdis = document.getElementById(config.summaryDdisId);
    const summarySolid = document.getElementById(config.summarySolidId);
    if (summaryMd) summaryMd.textContent = isFinite(Md) ? `${Md.toFixed(3)} Nmm` : '-';
    if (summaryDdis) summaryDdis.textContent = isFinite(Ddis) ? `${Ddis.toFixed(3)} mm` : '-';
    if (summarySolid) summarySolid.textContent = isFinite(solidD) ? `${solidD.toFixed(3)} mm` : '-';

    document.getElementById(config.resultsId).classList.add('visible');

    // For the 3rd shaft, suggest spline from DIN 5462 table
    if (config.splineIds) {
        updateSplineRecommendation(solidD, config.splineIds);
    }
}

// Solve for outer diameter of a hollow shaft with given inner diameter, torque (Mb) and allowable shear (tau)
function solveOuterDiameter(Mb, innerDiameter, tau) {
    if (Mb <= 0 || innerDiameter < 0 || tau <= 0) return NaN;

    const f = (d) => {
        const denom = Math.pow(d, 4) - Math.pow(innerDiameter, 4);
        if (denom <= 0) return Number.POSITIVE_INFINITY;
        return (16 * Mb * d) / (Math.PI * denom) - tau;
    };

    let lower = innerDiameter + 0.01;
    if (lower <= 0) lower = 0.01;

    // Initial upper bound based on solid shaft approximation and margin
    let upper = Math.max(lower * 1.5, Math.cbrt((16 * Mb) / (Math.PI * tau)) * 1.2);
    if (upper <= lower) upper = lower + 1;

    // Expand upper bound until the function changes sign or max iterations hit
    for (let i = 0; i < 50 && f(upper) > 0; i++) {
        upper *= 1.5;
    }

    if (f(upper) > 0) {
        // Could not bracket the root
        return NaN;
    }

    let low = lower;
    let high = upper;

    // Binary search for the root
    for (let i = 0; i < 60; i++) {
        const mid = (low + high) / 2;
        const val = f(mid);

        if (val > 0) {
            low = mid;
        } else {
            high = mid;
        }
    }

    return high;
}

function updateSplineRecommendation(solidDiameter, ids) {
    const container = document.getElementById(ids.containerId);
    if (!container) return;

    if (!isFinite(solidDiameter)) {
        container.classList.remove('visible');
        container.classList.add('sr-only');
        return;
    }

    const profile = findSplineProfile(solidDiameter);

    container.classList.remove('sr-only');
    container.classList.add('visible');

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = value ?? '-';
        }
    };

    setText(ids.labelId, profile ? profile.label : 'Uygun profil bulunamadı');
    setText(ids.keysId, profile ? profile.keys : '-');
    setText(ids.centeringId, profile ? profile.centering : '-');
    setText(ids.d1Id, profile ? profile.d1 : '-');
    setText(ids.d2Id, profile ? profile.d2 : '-');
    setText(ids.bId, profile ? profile.b : '-');
    setText(ids.D3Id, profile ? profile.D3 : '-');
    setText(ids.e2Id, profile ? profile.e2 : '-');
    setText(ids.fId, profile ? profile.f : '-');
    setText(ids.gId, profile ? profile.g : '-');
    setText(ids.KId, profile ? profile.K : '-');
    setText(ids.rId, profile ? profile.r : '-');
}

function findSplineProfile(solidDiameter) {
    if (!isFinite(solidDiameter) || splineProfiles.length === 0) return null;

    // Choose the largest d2 that is <= solidDiameter; if none, fall back to the smallest.
    let best = null;
    splineProfiles.forEach(profile => {
        if (solidDiameter >= profile.d2) {
            if (!best || profile.d2 > best.d2) {
                best = profile;
            }
        }
    });

    if (!best) {
        best = splineProfiles.reduce((min, p) => (p.d2 < min.d2 ? p : min), splineProfiles[0]);
    }

    return best;
}

function renderKeywayTable() {
    const tbody = document.getElementById('keyway-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    keywayTable.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.minD} - ${row.maxD}</td>
            <td>${row.b} x ${row.h}</td>
            <td>${row.t1}</td>
            <td>${row.t2}</td>
            <td>${row.lMin} - ${row.lMax}</td>
        `;
        tbody.appendChild(tr);
    });
}

function findKeywayRow(diameter) {
    return keywayTable.find(row => diameter >= row.minD && diameter <= row.maxD) || null;
}

function parseNumberFromText(text) {
    if (text === null || text === undefined) return NaN;
    const parsed = parseFloat(String(text).replace(',', '.'));
    return isFinite(parsed) ? parsed : NaN;
}

function readNumberFromSources({ ids = [], storageKeys = [] }) {
    for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const raw = (el.value !== undefined) ? el.value : el.textContent;
        const val = parseNumberFromText(raw);
        if (isFinite(val)) return val;
    }

    for (const key of storageKeys) {
        const raw = localStorage.getItem(key);
        const val = parseNumberFromText(raw);
        if (isFinite(val)) return val;
    }

    return NaN;
}

function roundUpToStep(value, step) {
    if (!isFinite(value) || step <= 0) return NaN;
    return Math.ceil(value / step) * step;
}

function clampToRange(value, min, max) {
    if (!isFinite(value)) return NaN;
    return Math.min(max, Math.max(min, value));
}

function setKeywayText(id, val, suffix = '') {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = isFinite(val) ? `${val.toFixed(3)}${suffix}` : '-';
}

function setKeywayStr(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text ?? '-';
}

function calculateKeywaySizing(config) {
    if (!config?.keyway) return;

    const Mb = readNumberFromSources(config.keyway.mbSources);
    if (!isFinite(Mb)) {
        alert("Moment (Mb) değeri bulunamadı. Normal modül sayfasında hesaplayın veya ilgili moment alanını doldurun.");
        return;
    }

    const selectedDiameterVal = document.getElementById(config.diameterId)?.value;
    const selectedD = parseNumberFromText(selectedDiameterVal);

    if (!isFinite(selectedD) || selectedD <= 0) {
        alert("Lütfen önce ilgili mil çapını seçiniz (Mil Geometri bölümünden).");
        return;
    }

    // Use the selected diameter directly
    const usedD = selectedD;

    // Use the selected diameter to find the keyway table row
    const row = findKeywayRow(usedD);
    if (!row) {
        alert(`Seçilen çap ${usedD.toFixed(3)} mm için kama tablosunda aralık bulunamadı.`);
        return;
    }
    const Ft = Mb / (usedD / 2);

    const tauOk = config.keyway.tauOk || 32;  // Default to 32 if not specified

    const Lpg = Ft / (KEYWAY_CONSTANTS.pG * row.t2);
    const Ltau32 = Ft / (tauOk * row.b);
    const Ltau380 = Ft / (KEYWAY_CONSTANTS.tauOf * row.b);

    const maxL = Math.max(Lpg, Ltau32, Ltau380);
    // Round up to nearest 5 or keep as is? User asked for range validity check.
    // Usually we still want a standard length, so rounding up to 5 makes sense for the "recommended" length.
    const roundedL = roundUpToStep(maxL, KEYWAY_CONSTANTS.roundStep);

    // Clamp to min/max of the keyway standard
    const selectedL = clampToRange(roundedL, row.lMin, row.lMax);

    const out = config.keyway.outputs;
    setKeywayStr(out.range, `${row.minD} - ${row.maxD} mm`);
    setKeywayStr(out.bh, `${row.b} × ${row.h}`);
    setKeywayText(out.t1, row.t1, ' mm');
    setKeywayText(out.t2, row.t2, ' mm');
    setKeywayStr(out.lRange, `${row.lMin} - ${row.lMax} mm`);

    setKeywayText(out.dUsed, usedD, ' mm');
    setKeywayText(out.ft, Ft, ' N');
    setKeywayText(out.lPg, Lpg, ' mm');
    setKeywayText(out.lTau32, Ltau32, ' mm');
    setKeywayText(out.lTau380, Ltau380, ' mm');
    setKeywayText(out.lFinal, selectedL, ' mm');
}
