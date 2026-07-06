var ETA = 4;
var EPSILON = 0.0001;
var TAU = 0.012565086385508734;
var e = 2.7182818285;

var TWO_BETA_SQUARED = 32;
var DEFAULT_CONFIDENCE = 5.328067859319834;
var        timerate=0.013214883335727136;
var        timescale=0.7170782493781991;
var        timeshift=435.6036467141399;
var       sigma_scale=0.0;
var        scorescale=4.820362954958707;
var        surpfac=1.005368928469052;

function time_decay(mu, sigma) {
    var break_days = 0;
    var sigma_adjust = timescale / (1 + Math.exp(-timerate * (break_days - timeshift)));
    return Math.min(sigma + sigma_adjust, DEFAULT_CONFIDENCE);
}

function true_rank(mu, sigma) {
    return 0.851 * (mu ) + 4.87;
}

function ratingsigmaTOPerfvolatility24(rating,sigma){
    rvalue={'Perf': rating , 'Volatility':time_decay(rating,sigma)};


    return rvalue;
}

function PerfvolatityTOpti2rating24(p1) {
    return true_rank(p1['Perf'], p1['Volatility']);
}



function speedrate_js(P1M, P1V, P2M, P2V, P3M, P3V, P4M, P4V, two_beta_squared = 32.0, tau = TAU, game_pct = 1, scorescale = 3.3, surpfac = 1.33) {
    // Adding tau factor to the volatility of each player prior to match
    // Represents added uncertainty since last match
    P1V = Math.sqrt(tau ** 2 + P1V ** 2);
    P2V = Math.sqrt(tau ** 2 + P2V ** 2);
    P3V = Math.sqrt(tau ** 2 + P3V ** 2);
    P4V = Math.sqrt(tau ** 2 + P4V ** 2);

    // Creating team ratings, variances
    let T1Perf = P1M + P2M;
    let T2Perf = P3M + P4M;
    let T1Variance = P1V ** 2 + P2V ** 2;
    let T2Variance = P3V ** 2 + P4V ** 2;

    // CIQ represents total volatility of match including inherent beta of sport
    let CIQ = Math.sqrt(P1V ** 2 + P2V ** 2 + P3V ** 2 + P4V ** 2 + two_beta_squared);

    // Max (100% game won): = 0.5 * scorescale + 0.7
    // Min (50% game won): 0.7
    let Gamescale = scorescale * (game_pct - 0.5) + 0.7;

    // T1_SSTC is variance of team relative to volatility of each match
    // T1_SSTC sets upper bound on losing team's RATING movement (before Gamescale)
    // For 4 players with equal sigmas, SSTC = (sigma less some effect from BETA)
    // Min (T1 has sigma ~= 0): ~0
    // Max (T1 has sigma, T2 has ~0 sigma): magnitude of vector (P1V, P2V) less BETA effect
    let T1_SSTC = T1Variance / CIQ;

    // "Suprise" factor of loss given T1 and T2 ratings, total volatility of match
    // Minimum 1 = not a surprise at all (T1Perf >>> T2Perf)
    // 0.5 = expected tie (even teams)
    // Maximum 0 = impossibly surprising (T1Perf <<< T2Perf)
    // Interesting identity? Stds. deviation of upset prob? - UNSURE
    let T1_PIQ = 1 / (1 + Math.exp((T2Perf - T1Perf) / CIQ));

    // Omega represents upwards rating adjustment to losing team
    // Movement upper bound * surprise factor (0 to 1) * gamescale
    let T1_Omega = T1_SSTC * (1 - T1_PIQ) * Gamescale;

    // How surprising the set score is
    // Min (game score = surprise factor): 0
    // Max (huge underdog wins 6-0): ~1
    let surprise_perf = Math.abs(game_pct - T1_PIQ);

    // Adjustments to each player based on their contribution to overall team volatility
    P1M = P1M + ((P1V ** 2 / T1Variance) * T1_Omega);
    P2M = P2M + ((P2V ** 2 / T1Variance) * T1_Omega);

    // Gamma represents T1 volatility relative to match volatility
    let T1_GAMMA = Math.sqrt(T1Variance) / CIQ;

    // Creates delta factor of relative T1 var * vols to match vol times abs spread factor
    // Higher delta = player sigma goes down more
    // Bigger absolute spread = smaller delta
    // (surpfac - surprise_perf) ranges from (surpfac - 1) to (surpfac)
    // ^ it acts as a multiplier to delta, where more "confirmatory" results increase delta
    let T1_DELTA = (
        ((T1_GAMMA * T1_SSTC) / CIQ) * T1_PIQ * (1 - T1_PIQ) * (surpfac - surprise_perf)
    );

    // Multiplies tau-affected sigma by sqrt(1 - (player share of team variance) * delta)
    // This can only serve to reduce sigma for each player
    P1V *= Math.sqrt(1 - (P1V ** 2 / T1Variance) * T1_DELTA);
    P2V *= Math.sqrt(1 - (P2V ** 2 / T1Variance) * T1_DELTA);

    let T2_SSTC = T2Variance / CIQ;
    let T2_PIQ = 1 / (1 + Math.exp((T1Perf - T2Perf) / CIQ));

    let T2_Omega = T2_SSTC * (-1 * T2_PIQ) * Gamescale;
    P3M = P3M + ((P3V ** 2 / T2Variance) * T2_Omega);
    P4M = P4M + ((P4V ** 2 / T2Variance) * T2_Omega);

    let T2_GAMMA = Math.sqrt(T2Variance) / CIQ;
    let T2_DELTA = (
        ((T2_GAMMA * T2_SSTC) / CIQ) * T2_PIQ * (1 - T2_PIQ) * (surpfac - surprise_perf)
    );

    P3V *= Math.sqrt(1 - (P3V ** 2 / T2Variance) * T2_DELTA);
    P4V *= Math.sqrt(1 - (P4V ** 2 / T2Variance) * T2_DELTA);

    return [[P1M, P1V], [P2M, P2V], [P3M, P3V], [P4M, P4V]];
}


function update_pti24_ratings(input_player_list, set_list) {
    if (!set_list || set_list.length === 0) {
        return player_list;
    } 
    var player_list = structuredClone(input_player_list); // Deep copy to avoid mutating original list
    set_list.forEach((Match_set) => {
        var WINNER = Match_set[0]; // 0 if Team 1 wins, 1 if Team 2 wins
        var GAME_PCT = Match_set[1]; // set winner % of games won

        var losing, winning;
        if (WINNER === 0) {
            // Team 1 wins, losing team is Team 2
            losing = [player_list[2], player_list[3]];
            winning = [player_list[0], player_list[1]];
        } else {
            // Team 2 wins, losing team is Team 1
            losing = [player_list[0], player_list[1]];
            winning = [player_list[2], player_list[3]];
        }

        var updated = speedrate_js(
            losing[0]['Perf'], losing[0]['Volatility'],
            losing[1]['Perf'], losing[1]['Volatility'],
            winning[0]['Perf'], winning[0]['Volatility'],
            winning[1]['Perf'], winning[1]['Volatility'],
            TWO_BETA_SQUARED, TAU, GAME_PCT, 3.3, 1.33
        );

        losing[0]['Perf'] = updated[0][0];
        losing[0]['Volatility'] = updated[0][1];
        losing[1]['Perf'] = updated[1][0];
        losing[1]['Volatility'] = updated[1][1];
        winning[0]['Perf'] = updated[2][0];
        winning[0]['Volatility'] = updated[2][1];
        winning[1]['Perf'] = updated[3][0];
        winning[1]['Volatility'] = updated[3][1];
    });

    return player_list;
}

