// Constants
const SIGMA_EM = 190; // MPa
const E_MODULUS = 210000; // MPa (E)
const P_EM = 1500; // MPa (Pem)

// Lookup Tables
// Form Factor (Y) based on Zes (for alpha_n = 20 degrees)
const ZES_VALUES = [13, 14, 15, 16, 18, 20, 30, 50, 100];
const Y_VALUES = [9.5, 9.3, 9.0, 8.8, 8.4, 8.1, 7.5, 6.8, 6.3];

// Contact Ratio (Epsilon_alpha) based on Beta_0
const BETA_VALUES = [0, 15, 30, 45];
const EA_VALUES = [1.73, 1.65, 1.41, 1.05];

document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculateBtn');

    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateNormalModule);
    }

    // Add event listeners to standard module dropdowns
    const module1Select = document.getElementById('standard-module-select');
    const module2Select = document.getElementById('standard-module-select-2');

    if (module1Select) {
        module1Select.addEventListener('change', () => {
            calculateGearDimensions();
        });
    }

    if (module2Select) {
        module2Select.addEventListener('change', () => {
            calculateGearDimensions();
        });
    }
});

function calculateNormalModule() {
    // 1. Get Inputs
    const Ka = parseFloat(document.getElementById('Ka').value);
    const Kv = parseFloat(document.getElementById('Kv').value);
    const P = parseFloat(document.getElementById('P').value);
    const N = parseFloat(document.getElementById('N').value);
    const z1 = parseFloat(document.getElementById('z1').value);
    const z2 = parseFloat(document.getElementById('z2').value);
    const beta0Deg = parseFloat(document.getElementById('beta0').value);
    const psi = parseFloat(document.getElementById('psi').value);

    // Validation
    if ([Ka, Kv, P, N, z1, z2, beta0Deg, psi].some(isNaN)) {
        alert("Lütfen tüm alanları geçerli sayılarla doldurunuz.");
        return;
    }

    // Persist helis açıları for reuse (örn: kuvvet hesabı sayfası)
    localStorage.setItem('lastBeta0', beta0Deg.toFixed(4));
    const beta0_2DegStored = document.getElementById('beta0_2')?.value;
    if (beta0_2DegStored) {
        const betaVal = parseFloat(beta0_2DegStored);
        if (!isNaN(betaVal)) {
            localStorage.setItem('lastBeta0_2', betaVal.toFixed(4));
        }
    }

    // 2. Intermediate Calculations

    // Convert Beta0 to radians for trig functions
    const beta0Rad = toRadians(beta0Deg);
    const cosBeta0 = Math.cos(beta0Rad);
    const cos3Beta0 = Math.pow(cosBeta0, 3);
    const cos4Beta0 = Math.pow(cosBeta0, 4);

    // Md1 (Torque)
    // Formula: Md1 = 9550 * (P / N) -> Result in Nm
    // Convert to Nmm for the mn formula
    const Md1 = 9550 * (P / N) * 1000;

    // i (Gear Ratio)
    const i1 = z2 / z1;

    // Zes (Equivalent Teeth)
    // Formula: Zes = z1 / cos^3(beta0)
    const Zes = z1 / cos3Beta0;

    // Y (Form Factor) - Interpolated
    const Y = interpolate(Zes, ZES_VALUES, Y_VALUES);

    // Ea (Contact Ratio) - Interpolated
    const Ea = interpolate(beta0Deg, BETA_VALUES, EA_VALUES);

    // 3. Final Calculation 1: mn1 (Tooth Root Strength)
    // Formula: mn = 0.6 * cbrt( (Ka * Kv * Md1 * Y * cos(beta0)) / (z1 * sigma_em * Ea * psi) )

    const num1 = Ka * Kv * Md1 * Y * cosBeta0;
    const den1 = z1 * SIGMA_EM * Ea * psi;

    let mn1 = 0;
    if (den1 !== 0) {
        mn1 = 0.6 * Math.cbrt(num1 / den1);
    }

    // 4. Final Calculation 2: mn2 (Surface Pressure)
    // Formula: mn = 0.9 * cbrt( (Ka * Kv * Md1 * E * (i+1) * cos^4(beta0)) / (z1^2 * Pem^2 * i * psi) )

    const num2 = Ka * Kv * Md1 * E_MODULUS * (i1 + 1) * cos4Beta0;
    const den2 = Math.pow(z1, 2) * Math.pow(P_EM, 2) * i1 * psi;

    let mn2 = 0;
    if (den2 !== 0) {
        mn2 = 0.9 * Math.cbrt(num2 / den2);
    }

    // 5. Display Results
    document.getElementById('res-Md1').textContent = Md1.toFixed(0) + " Nmm";
    document.getElementById('res-i1').textContent = i1.toFixed(3);
    document.getElementById('res-Zes').textContent = Zes.toFixed(3);
    document.getElementById('res-Y').textContent = Y.toFixed(3);
    document.getElementById('res-Ea').textContent = Ea.toFixed(3);

    // Persist Md1 so the shaft calculator can reuse the latest torque value
    localStorage.setItem('lastMd1', Md1.toFixed(3));

    document.getElementById('res-mn').textContent = mn1.toFixed(3);
    document.getElementById('res-mn2').textContent = mn2.toFixed(3);
    // Summary badges
    const summaryMd1 = document.getElementById('summary-md1-main');
    const summaryMn1 = document.getElementById('summary-mn1-main');
    const summaryMn2 = document.getElementById('summary-mn2-main');
    if (summaryMd1) summaryMd1.textContent = Md1.toFixed(3) + " Nmm";
    if (summaryMn1) summaryMn1.textContent = mn1.toFixed(3) + " mm";
    if (summaryMn2) summaryMn2.textContent = mn2.toFixed(3) + " mm";

    // 6. Populate Standard Module Dropdown
    const standardModules = [
        1, 1.125, 1.25, 1.375, 1.5, 1.75, 2, 2.25, 2.5, 2.75,
        3, 3.25, 3.5, 3.75, 4, 4.5, 5, 5.5, 6, 6.5, 7, 8, 9,
        10, 11, 12, 14, 16, 18, 20, 22, 25, 28, 32, 36, 40, 45, 50
    ];

    const maxMn = Math.max(mn1, mn2);
    const select = document.getElementById('standard-module-select');
    select.innerHTML = ''; // Clear existing options

    let recommendedIndex = -1;

    standardModules.forEach((mod, index) => {
        const option = document.createElement('option');
        option.value = mod;
        option.textContent = mod;

        // Mark as recommended if it's the first one >= maxMn
        if (mod >= maxMn && recommendedIndex === -1) {
            recommendedIndex = index;
            option.textContent += " (Önerilen)";
        }

        select.appendChild(option);
    });

    // Select the recommended option
    if (recommendedIndex !== -1) {
        select.selectedIndex = recommendedIndex;
    } else if (maxMn > 50) {
        // If calculated module is huge, just select the last one
        select.selectedIndex = standardModules.length - 1;
    }

    // --- STAGE 2 CALCULATIONS ---

    // 1. Get Stage 2 Inputs
    const eta1 = parseFloat(document.getElementById('eta').value);
    const eta2 = parseFloat(document.getElementById('eta2').value);
    const beta0_2Deg = parseFloat(document.getElementById('beta0_2').value);
    const z3 = parseFloat(document.getElementById('z3').value);
    const itoplam = parseFloat(document.getElementById('itoplam').value);

    // Only proceed if Stage 2 inputs are valid
    if (![eta1, eta2, beta0_2Deg, z3, itoplam].some(isNaN)) {
        localStorage.setItem('lastBeta0_2', beta0_2Deg.toFixed(4));

        // 2. Intermediate Calculations for Stage 2

        // Md2 (Torque acting on the second shaft / stage 2 pinion)
        // Formula: Md2 = Md1 * i1 * eta1
        // Note: Md1 is already in Nmm, so Md2 will be in Nmm
        const Md2 = Md1 * i1 * eta1;

        // Calculate i2 from itoplam and i1
        // Formula: itoplam = i1 * i2, so i2 = itoplam / i1
        let i2_calculated = itoplam / i1;

        // Calculate z4 from i2 and z3
        // Formula: i2 = z4 / z3, so z4 = i2 * z3
        let z4_calculated = i2_calculated * z3;

        // Round z4 up to the nearest integer
        const z4 = Math.ceil(z4_calculated);

        // Recalculate i2 with the rounded z4
        const i2 = z4 / z3;

        // Beta0_2 to radians
        const beta0_2Rad = toRadians(beta0_2Deg);
        const cosBeta0_2 = Math.cos(beta0_2Rad);
        const cos3Beta0_2 = Math.pow(cosBeta0_2, 3);

        // Zes3 (Equivalent Teeth for Stage 2 Pinyon)
        const Zes3 = z3 / cos3Beta0_2;

        // Y3 (Form Factor) - Interpolated
        const Y3 = interpolate(Zes3, ZES_VALUES, Y_VALUES);

        // Ea3 (Contact Ratio) - Interpolated
        const Ea3 = interpolate(beta0_2Deg, BETA_VALUES, EA_VALUES);

        // 3. Final Calculation: mn3 (Tooth Root Strength for Stage 2)
        // Formula: mn = 0.6 * cbrt( (Ka * Kv * Md2 * Y * cos(beta0)) / (z3 * sigma_em * Ea * psi) )
        // We reuse Ka, Kv, Sigma_em, Psi from Stage 1 as implied

        const num3 = Ka * Kv * Md2 * Y3 * cosBeta0_2;
        const den3 = z3 * SIGMA_EM * Ea3 * psi;

        let mn3 = 0;
        if (den3 !== 0) {
            mn3 = 0.6 * Math.cbrt(num3 / den3);
        }

        // 4. Final Calculation: mn4 (Surface Pressure for Stage 2)
        // Formula: mn = 0.9 * cbrt( (Ka * Kv * Md2 * E * (i2+1) * cos^4(beta0)) / (z3^2 * Pem^2 * i2 * psi) )

        const cos4Beta0_2 = Math.pow(cosBeta0_2, 4);
        const num4 = Ka * Kv * Md2 * E_MODULUS * (i2 + 1) * cos4Beta0_2;
        const den4 = Math.pow(z3, 2) * Math.pow(P_EM, 2) * i2 * psi;

        let mn4 = 0;
        if (den4 !== 0) {
            mn4 = 0.9 * Math.cbrt(num4 / den4);
        }

        // Output torque for 3rd shaft (after second gear stage, without k factor)
        // Md3_base = Md1 * i1 * i2 * eta1 * eta2
        const Md3Base = Md2 * i2 * eta2;

        // 5. Display Stage 2 Results
        document.getElementById('res-Md3').textContent = Md2.toFixed(0) + " Nmm";
        document.getElementById('res-i2').textContent = i2.toFixed(3);
        document.getElementById('res-z4').textContent = z4;
        document.getElementById('res-Zes3').textContent = Zes3.toFixed(3);
        document.getElementById('res-Y3').textContent = Y3.toFixed(3);
        document.getElementById('res-Ea3').textContent = Ea3.toFixed(3);
        document.getElementById('res-mn3').textContent = mn3.toFixed(3);
        document.getElementById('res-mn4').textContent = mn4.toFixed(3);
        document.getElementById('res-Md3-output').textContent = Md3Base.toFixed(0) + " Nmm";

        // 6. Populate Standard Module Dropdown for Stage 2
        const maxMn2 = Math.max(mn3, mn4);
        const select2 = document.getElementById('standard-module-select-2');
        select2.innerHTML = ''; // Clear existing options

        let recommendedIndex2 = -1;

        standardModules.forEach((mod, index) => {
            const option = document.createElement('option');
            option.value = mod;
            option.textContent = mod;

            // Mark as recommended if it's the first one >= maxMn2
            if (mod >= maxMn2 && recommendedIndex2 === -1) {
                recommendedIndex2 = index;
                option.textContent += " (Önerilen)";
            }

            select2.appendChild(option);
        });

        // Select the recommended option
        if (recommendedIndex2 !== -1) {
            select2.selectedIndex = recommendedIndex2;
        } else if (maxMn2 > 50) {
            select2.selectedIndex = standardModules.length - 1;
        }

        // Persist values for shaft calculations
        localStorage.setItem('lastMd2', Md2.toFixed(3));
        localStorage.setItem('lastMd3', Md3Base.toFixed(3));
        localStorage.setItem('lastEta1', eta1.toFixed(4));
        localStorage.setItem('lastEta2', eta2.toFixed(4));
        localStorage.setItem('lastI1', i1.toFixed(3));
        localStorage.setItem('lastI2', i2.toFixed(3));
    }

    // Show results section
    document.getElementById('results').classList.add('visible');

    // Calculate and display gear dimensions if both standard modules are selected
    calculateGearDimensions();
}

function calculateGearDimensions() {
    // Get selected standard modules
    const m1_select = document.getElementById('standard-module-select');
    const m2_select = document.getElementById('standard-module-select-2');

    if (!m1_select.value || !m2_select.value) {
        return; // Don't calculate if modules not selected
    }

    const m1 = parseFloat(m1_select.value);
    const m2 = parseFloat(m2_select.value);

    // Get all necessary inputs
    const z1 = parseFloat(document.getElementById('z1').value);
    const z2 = parseFloat(document.getElementById('z2').value);
    const z3 = parseFloat(document.getElementById('z3').value);
    const beta0Deg_1 = parseFloat(document.getElementById('beta0').value);
    const beta0Deg_2 = parseFloat(document.getElementById('beta0_2').value);
    const psi = parseFloat(document.getElementById('psi').value);

    // Get calculated z4
    const z4Text = document.getElementById('res-z4').textContent;
    const z4 = parseInt(z4Text);

    if ([z1, z2, z3, z4, beta0Deg_1, beta0Deg_2, psi, m1, m2].some(isNaN)) {
        return;
    }

    // Constants
    const ALPHA_0 = 20; // degrees
    const ALPHA_0_RAD = toRadians(ALPHA_0);

    // Calculate for each gear
    const gears = [
        { z: z1, m: m1, beta: beta0Deg_1, isPinion: true },  // 1.Dişli (Pinyon)
        { z: z2, m: m1, beta: beta0Deg_1, isPinion: false }, // 2.Dişli (Çark)
        { z: z3, m: m2, beta: beta0Deg_2, isPinion: true },  // 3.Dişli (Pinyon)
        { z: z4, m: m2, beta: beta0Deg_2, isPinion: false }  // 4.Dişli (Çark)
    ];

    gears.forEach((gear, index) => {
        const gearNum = index + 1;
        const betaRad = toRadians(gear.beta);
        const cosBeta = Math.cos(betaRad);

        // Calculate alpha_t (transverse pressure angle)
        // tan(alpha_t) = tan(alpha_0) / cos(beta_0)
        const tanAlpha_t = Math.tan(ALPHA_0_RAD) / cosBeta;
        const alpha_t = Math.atan(tanAlpha_t);
        const cosAlpha_t = Math.cos(alpha_t);

        // Calculate dimensions
        // d0 = m_n / cos(beta_0) * z
        const d0 = (gear.m / cosBeta) * gear.z;

        // da = m_n * (z / cos(beta_0) + 2)
        const da = gear.m * (gear.z / cosBeta + 2);

        // df = m_n * (z / cos(beta_0) - 2 * 1.2)
        const df = gear.m * (gear.z / cosBeta - 2 * 1.2);

        // db = d0 * cos(alpha_t)
        const db = d0 * cosAlpha_t;

        // b (width)
        // Pinyon: b = π * m_n * ψ + 5
        // Gear: b = π * m_n * ψ
        const b = gear.isPinion ? (Math.PI * gear.m * psi + 5) : (Math.PI * gear.m * psi);

        // Display results
        document.getElementById(`dim-d0-${gearNum}`).textContent = d0.toFixed(3);
        document.getElementById(`dim-da-${gearNum}`).textContent = da.toFixed(3);
        document.getElementById(`dim-df-${gearNum}`).textContent = df.toFixed(3);
        document.getElementById(`dim-db-${gearNum}`).textContent = db.toFixed(3);
        document.getElementById(`dim-b-${gearNum}`).textContent = b.toFixed(3);
        document.getElementById(`dim-z-${gearNum}`).textContent = gear.z;
        document.getElementById(`dim-m-${gearNum}`).textContent = gear.m;
        document.getElementById(`dim-beta-${gearNum}`).textContent = gear.beta.toFixed(4);

        // Persist frequently reused values for later calculators (örn: kuvvet hesabı)
        if (isFinite(d0)) {
            if (gearNum === 1) {
                localStorage.setItem('lastD0_1', d0.toFixed(3));
            } else if (gearNum === 2) {
                localStorage.setItem('lastD0_2', d0.toFixed(3));
            } else if (gearNum === 3) {
                localStorage.setItem('lastD0_3', d0.toFixed(3));
            }
        }
    });

    // Calculate a1 (center distance for 1st and 2nd gears)
    // Formula: a1 = (m1 / (2 * cos(beta0))) * (z1 + z2)
    const beta1Rad = toRadians(beta0Deg_1);
    const cosBeta1 = Math.cos(beta1Rad);
    const a1 = (m1 / (2 * cosBeta1)) * (z1 + z2);

    // Calculate a2 (center distance for 3rd and 4th gears)
    // Formula: a2 = (m2 / (2 * cos(beta0_2))) * (z3 + z4)
    const beta2Rad = toRadians(beta0Deg_2);
    const cosBeta2 = Math.cos(beta2Rad);
    const a2 = (m2 / (2 * cosBeta2)) * (z3 + z4);

    // Display a1 and a2
    document.getElementById('dim-a1').textContent = a1.toFixed(3);
    document.getElementById('dim-a2').textContent = a2.toFixed(3);

    // Show the dimensions table
    document.getElementById('gear-dimensions-section').style.display = 'block';
}
