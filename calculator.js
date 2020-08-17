//Rates
const Commission = 0.01;
const Rate = 0.033; // Annual Interest Rate
const Inflation_Rate = 0.0; // Annual Inflation Rate
const nPntsPerYear = 120;
const maxAge = 120;

//Gompertz Mortality Model Paramters
const bMale = 11.61; //Dispersion Coef. at Death, Male
const bFemale = 11.1; //Dispersion Coef. at Death, Female
const mMale = 89.81; //Modal Age at Death, Male
const mFemale = 92.06; //Modal Age at Death, Female

var t, tstep, lp, pn, pnm1;
var a,
  r,
  b_1,
  b_2,
  m_1,
  m_2,
  p,
  q,
  PV,
  PVq,
  PVnoRefund,
  PVannual,
  Payment_Annual,
  Payment_Monthly;
var nYrs_1, nYrs_2, nMnths_1, nMnths_2, T, Tjnt;
var n, m, N, M;

function calculate({
  P,
  MFJ,
  Certain = 0,
  Refund = 0,
  G = 0,
  D,
  A1,
  S1,
  A2,
  S2,
}) {
  var p1 = [];
  var p2 = [];
  var q1 = [];
  var q2 = [];
  var pjnt = [];
  var qjnt = [];

  const Rm = Math.log(1 + Rate) / nPntsPerYear; // Fractional Interest Rate
  const Ri = Inflation_Rate / nPntsPerYear; // Fractional Inflation Rate

  nYrs_1 = maxAge - A1;
  nMnths_1 = nYrs_1 * nPntsPerYear;
  nYrs_2 = maxAge - A2;
  nMnths_2 = nYrs_2 * nPntsPerYear;
  tstep = 1.0 / nPntsPerYear;

  if (A1 != 0) {
    if (S1 == 1) {
      b_1 = bMale;
      m_1 = mMale;
    } else {
      b_1 = bFemale;
      m_1 = mFemale;
    }
    //  Compute Survival and Mortality Curves for Person 1
    t = 0;
    pnm1 = 0;
    q1[0] = 0;
    q1[1] = 0;
    for (n = 0; n < nMnths_1; n++) {
      lp = (1 - Math.exp(t / b_1)) * Math.exp((A1 - m_1) / b_1);
      pn = Math.exp(lp);
      if (n > 0 && n < nMnths_1 - 1) q1[n + 1] = pnm1 - pn;
      pnm1 = pn;
      p1[n] = pn;
      t += tstep;
    }
  }
  if (A2 != 0) {
    if (S2 == 1) {
      b_2 = bMale;
      m_2 = mMale;
    } else {
      b_2 = bFemale;
      m_2 = mFemale;
    }
    //  Compute Survival and Mortality Curves for Person 2
    t = 0;
    pnm1 = 0;
    q2[0] = 0;
    q2[1] = 0;
    for (n = 0; n < nMnths_2; n++) {
      lp = (1 - Math.exp(t / b_2)) * Math.exp((A2 - m_2) / b_2);
      pn = Math.exp(lp);
      if (n > 0 && n < nMnths_2 - 1) q2[n + 1] = pnm1 - pn;
      pnm1 = pn;
      p2[n] = pn;
      t += tstep;
    }
  }

  if (MFJ == 3) {
    //  Compute Survival and Mortality Curves for Joint Case
    Tjnt = nMnths_1 < nMnths_2 ? nMnths_1 : nMnths_2;
    t = 0;
    pnm1 = 0;
    qjnt[0] = 0;
    qjnt[1] = 0;
    for (n = 0; n < Tjnt; n++) {
      pn = 1 - (1 - p1[n]) * (1 - p2[n]);
      if (n > 0 && n < Tjnt - 1) qjnt[n + 1] = pnm1 - pn;
      pnm1 = pn;
      pjnt[n] = pn;
      t += tstep;
    }
  }

  if (MFJ === 1) {
    // Person No. 1
    T = nMnths_1;
  } else if (MFJ === 2) {
    // Person No. 2
    T = nMnths_2;
  } else if (MFJ === 3) {
    // Joint
    T = Tjnt;
  }

  if (Refund === 1) G = 0;

  PVnoRefund = 0;
  for (n = D * nPntsPerYear; n < D * nPntsPerYear + G * nPntsPerYear; n++)
    PVnoRefund += Math.pow(1 + Rm, -n) * Math.pow(1 + Ri, n - 1);

  for (n = D * nPntsPerYear + G * nPntsPerYear + 1; n < T; n++) {
    if (MFJ == 1) {
      // Person No. 1
      p = p1[n];
    } else if (MFJ == 2) {
      // Person No. 2
      p = p2[n];
    } else if (MFJ == 3) {
      // Joint
      p = pjnt[n];
    }
    PVnoRefund += p * Math.exp(-Rm * n) * Math.pow(1 + Ri, n - 1);
  }

  if (Refund == 1) {
    PV = PVnoRefund;
    for (m = 0; m < 10; m++) {
      PVq = 0;
      for (n = 0; n < T; n++) {
        if (MFJ == 1) {
          // Person No. 1
          q = q1[n];
        } else if (MFJ == 2) {
          // Person No. 2
          q = q2[n];
        } else if (MFJ == 3) {
          // Joint
          q = qjnt[n];
        }
        if (n <= D * nPntsPerYear)
          PVq += PV * q * Math.exp(-Rm * n) * Math.pow(1 + Ri, n - 1);
        else if (PV > n - D * nPntsPerYear - 1)
          PVq +=
            (PV - (n - D * nPntsPerYear - 1)) *
            q *
            Math.exp(-Rm * n) *
            Math.pow(1 + Ri, n - 1);
      }
      PV = PVnoRefund + PVq;
    }
  } else {
    PV = PVnoRefund;
  }

  PVannual = PV / nPntsPerYear;
  Payment_Annual = (P * (1 - Commission)) / PVannual;
  Payment_Monthly = Payment_Annual / 12;

  if (Certain === 1 && G > 0) {
    N = 12 * G;
    M = 12 * D;
    r = Rate / 12;
    a = (1 - Math.pow(1 + r, -N)) / r;
    a = a * Math.pow(1 + r, -M);
    Payment_Monthly = (P * (1 - Commission)) / a;
  }

  return Payment_Monthly;
}
//const result = calculator({P: 100000, MFJ:1, Certain: 0, Refund: 0, D:0, G:0, A1:65, S1: 1, A2: 60, S2: 2 })
module.exports = {
  calculate,
};
