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
        var P1=structuredClone(player_list[0]); //DeepCopys
        var P2=structuredClone(player_list[1]);
        var P3=structuredClone(player_list[2]);
        var P4=structuredClone(player_list[3]);

        set_list.forEach((Match_set) => {

            var WINNER = Match_set[0]; //# 0 if Team 1, 1 if Team 2


           
            var GAME_PCT = Match_set[1]; // # set winner % of games won

            var T1 = [P1, P2];
            var T2 = [P3, P4];

            var Teams = [T1, T2];

            // Add Tau Impact to Player Volatility:  Assume Volatility Increases unless results say otherwise

            P1['Volatility']=Math.sqrt(TAU**2 + P1['Volatility']**2);
            P2['Volatility']=Math.sqrt(TAU**2 + P2['Volatility']**2);
            P3['Volatility']=Math.sqrt(TAU**2 + P3['Volatility']**2);
            P4['Volatility']=Math.sqrt(TAU**2 + P4['Volatility']**2);

            var T1Perf = P1['Perf'] + P2['Perf'];
            var T2Perf = P3['Perf'] + P4['Perf'];
            var T1Variance = P1['Volatility'] ** 2 + P2['Volatility'] ** 2;  //Add Tau
            var T2Variance = P3['Volatility'] ** 2 + P4['Volatility'] ** 2;  //Add Tau

            var CIQ = (P1['Volatility'] ** 2 + P2['Volatility'] ** 2 + P3['Volatility'] ** 2 +  P4['Volatility'] ** 2 + TWO_BETA_SQUARED) ** 0.5;
            var Gamescale = Math.min(Math.max((2 * GAME_PCT) - 0.3, 0.7), 1.7);

            var T1_SSTC = T1Variance / CIQ;
            var T1_SSTC = T1_SSTC * Gamescale;
            var T1_PIQ = 1 / (1 + e ** ((T2Perf - T1Perf) / CIQ));

            //Skill Update Calcs
            var T1_Omega = T1_SSTC * (WINNER - T1_PIQ);

            //Volatility Update Calcs
            var T1_GAMMA=Math.sqrt(T1Variance)/CIQ
            var T1_DELTA=((T1_GAMMA*T1_SSTC)/CIQ)*T1_PIQ*(1-T1_PIQ); 

            // Player Skill Updates
            P1['Perf'] = P1['Perf'] + ((P1['Volatility'] ** 2 / T1Variance) * T1_Omega);
            P2['Perf'] = P2['Perf'] + ((P2['Volatility'] ** 2 / T1Variance) * T1_Omega);
            
            // Player Volatility Update
            P1['Volatility'] *= Math.sqrt(Math.max(EPSILON,1-(P1['Volatility']**2/T1Variance)*T1_DELTA))
            P2['Volatility'] *= Math.sqrt(Math.max(EPSILON,1-(P2['Volatility']**2/T1Variance)*T1_DELTA))
            


            var T2_SSTC = T2Variance / CIQ;
            var T2_SSTC = T2_SSTC * Gamescale;
            var T2_PIQ = 1 / (1 + e ** ((T1Perf - T2Perf) / CIQ));

            //Skill Update Calcs
            var T2_Omega = T2_SSTC * ((1-WINNER) - T2_PIQ);

            //Volatility Update Calcs
            var T2_GAMMA=Math.sqrt(T2Variance)/CIQ;
            var T2_DELTA=((T2_GAMMA*T2_SSTC)/CIQ)*T2_PIQ*(1-T2_PIQ); 
            

            P3['Perf'] = P3['Perf'] + ((P3['Volatility'] ** 2 / T2Variance) * T2_Omega);
            P4['Perf'] = P4['Perf'] + ((P4['Volatility'] ** 2 / T2Variance) * T2_Omega);

            // Player Volatility Update
            P3['Volatility'] *= Math.sqrt(Math.max(EPSILON,1-(P3['Volatility']**2/T2Variance)*T2_DELTA))
            P4['Volatility'] *= Math.sqrt(Math.max(EPSILON,1-(P4['Volatility']**2/T2Variance)*T2_DELTA))
            

        });

return [P1,P2,P3,P4];
}

