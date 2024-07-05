var ETA = 4;
var EPSILON = 0.0001;
var TAU = 0.35;
var e = 2.7182818285;

var TWO_BETA_SQUARED = 32;

function ratingsigmaTOPerfvolatility(rating,sigma){
    rvalue={'Perf': -999999, 'Volatility':sigma};

    rvalue['Perf']=(rating-2.5)/.88 - sigma;

    return rvalue;
}

function PerfvolatityTOpti2rating(p1) {
    return 0.88* (p1['Perf'] + p1['Volatility']) + 2.5;
}



function update_pti2_ratings(player_list, set_list) {
        P1=structuredClone(player_list[0]);
        P2=structuredClone(player_list[1]);
        P3=structuredClone(player_list[2]);
        P4=structuredClone(player_list[3]);

        set_list.forEach((Match_set) => {

            var WINNER = Match_set[0]; //# 0 if Team 1, 1 if Team 2


            // Demian Question: is this correct?  GAME_PCT is Winner's percent 
            var GAME_PCT = Match_set[1]; // # set winner % of games won

            var T1 = [P1, P2];
            var T2 = [P3, P4];

            Teams = [T1, T2];

            T1Perf = P1['Perf'] + P2['Perf'];
            T2Perf = P3['Perf'] + P4['Perf'];
            T1Variance = P1['Volatility'] ** 2 + P2['Volatility'] ** 2;
            T2Variance = P3['Volatility'] ** 2 + P4['Volatility'] ** 2;

            CIQ = (P1['Volatility'] ** 2 + P2['Volatility'] ** 2 + P3['Volatility'] ** 2 +  P4['Volatility'] ** 2 + TWO_BETA_SQUARED) ** 0.5;
            Gamescale = Math.min(Math.max((2 * GAME_PCT) - 0.3, 0.7), 1.7);

            T1_SSTC = T1Variance / CIQ;
            T1_SSTC = T1_SSTC * Gamescale;
            T1_PIQ = 1 / (1 + e ** ((T2Perf - T1Perf) / CIQ));
            T1_Omega = T1_SSTC * (WINNER - T1_PIQ);
            P1['Perf'] = P1['Perf'] + ((P1['Volatility'] ** 2 / T1Variance) * T1_Omega);
            P2['Perf'] = P2['Perf'] + ((P2['Volatility'] ** 2 / T1Variance) * T1_Omega);


            T2_SSTC = T2Variance / CIQ;
            T2_SSTC = T2_SSTC * Gamescale;
            T2_PIQ = 1 / (1 + e ** ((T1Perf - T2Perf) / CIQ));
            T2_Omega = T2_SSTC * ((1-WINNER) - T2_PIQ);
            P3['Perf'] = P3['Perf'] + ((P3['Volatility'] ** 2 / T2Variance) * T2_Omega);
            P4['Perf'] = P4['Perf'] + ((P4['Volatility'] ** 2 / T2Variance) * T2_Omega);

        });

return [P1,P2,P3,P4];
}

