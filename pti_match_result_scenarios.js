var exampleWins=[
  {
    "teamGames": 12,
    "oppGames": 0,
    "setScores": "0&0"
  },
  {
    "teamGames": 12,
    "oppGames": 1,
    "setScores": "0&1,1&0"
  },
  {
    "teamGames": 12,
    "oppGames": 2,
    "setScores": "1&1,2&0,0&2"
  },
  {
    "teamGames": 12,
    "oppGames": 3,
    "setScores": ""
  },
  {
    "teamGames": 12,
    "oppGames": 4,
    "setScores": ""
  },
  {
    "teamGames": 12,
    "oppGames": 5,
    "setScores": ""
  },
  {
    "teamGames": 12,
    "oppGames": 6,
    "setScores": ""
  },
  {
    "teamGames": 12,
    "oppGames": 7,
    "setScores": ""
  },
  {
    "teamGames": 12,
    "oppGames": 8,
    "setScores": "4&4"
  },
  {
    "teamGames": 13,
    "oppGames": 7,
    "setScores": "7-5,6-4"
  },
  {
    "teamGames": 14,
    "oppGames": 10,
    "setScores": "7-5,7-5"
  },
  {
    "teamGames": 14,
    "oppGames": 11,
    "setScores": "7-6,7-5"
  },
  {
    "teamGames": 14,
    "oppGames": 12,
    "setScores": "7-6,7-6"
  },
  {
    "teamGames": 14,
    "oppGames": 18,
    "setScores": "worst win: 0-6,7-6,7-6"
  }
];

var exampleLosses = [
  {
    "teamGames": 18,
    "oppGames": 14,
    "setScores": "Best Loss: 6-0,6-7,6-7"
  },
  {
    "teamGames": 12,
    "oppGames": 14,
    "setScores": "7-6,7-6"
  },
  {
    "teamGames": 11,
    "oppGames": 14,
    "setScores": "7-6,7-5"
  },
  {
    "teamGames": 10,
    "oppGames": 14,
    "setScores": "7-5,7-5"
  },
  {
    "teamGames": 9,
    "oppGames": 13,
    "setScores": "7-5,6-4"
  },
  {
    "teamGames": 8,
    "oppGames": 12,
    "setScores": "4&4"
  },
  {
    "teamGames": 7,
    "oppGames": 12,
    "setScores": ""
  },
  {
    "teamGames": 6,
    "oppGames": 12,
    "setScores": ""
  },
  {
    "teamGames": 5,
    "oppGames": 12,
    "setScores": ""
  },
  {
    "teamGames": 4,
    "oppGames": 12,
    "setScores": ""
  },
  {
    "teamGames": 3,
    "oppGames": 12,
    "setScores": ""
  },
  {
    "teamGames": 2,
    "oppGames": 12,
    "setScores": "1&1,2&0,0&2"
  },
  {
    "teamGames": 1,
    "oppGames": 12,
    "setScores": "0&1,1&0"
  },
  {
    "teamGames": 0,
    "oppGames": 12,
    "setScores": "0&0"
  }
];


var twosets = [
{
    "totalGames": 26,
    "winnerGames": 14,
    "loserGames": 12,
    "winPCT": 0.54,
    "eloActual": 0.69,
    "numWays": 15,
    "possibleScores": "7-6,7-6;1-6,6-0,7-6;1-6,7-6,6-0;6-0,1-6,7-6;7-6,1-6,6-0;1-6,6-1,7-5;1-6,7-5,6-1;6-1,1-6,7-5;7-5,1-6,6-1;2-6,6-2,6-4;2-6,6-4,6-2;6-2,2-6,6-4;6-4,2-6,6-2;2-6,6-3,6-3;6-3,2-6,6-3"
  },
  {
    "totalGames": 25,
    "winnerGames": 14,
    "loserGames": 11,
    "winPCT": 0.56,
    "eloActual": 0.71,
    "numWays": 14,
    "possibleScores": "7-5,7-6;7-6,7-5;1-6,6-0,7-5;1-6,7-5,6-0;6-0,1-6,7-5;7-5,1-6,6-0;2-6,6-1,6-4;2-6,6-4,6-1;6-1,2-6,6-4;6-4,2-6,6-1;2-6,6-2,6-3;2-6,6-3,6-2;6-2,2-6,6-3;6-3,2-6,6-2"
  },
  {
    "totalGames": 23,
    "winnerGames": 13,
    "loserGames": 10,
    "winPCT": 0.57,
    "eloActual": 0.71,
    "numWays": 12,
    "possibleScores": "6-4,7-6;7-6,6-4;1-6,6-0,6-4;1-6,6-4,6-0;6-0,1-6,6-4;6-4,1-6,6-0;1-6,6-1,6-3;1-6,6-3,6-1;6-1,1-6,6-3;6-3,1-6,6-1;1-6,6-2,6-2;6-2,1-6,6-2"
  },
  {
    "totalGames": 24,
    "winnerGames": 14,
    "loserGames": 10,
    "winPCT": 0.58,
    "eloActual": 0.72,
    "numWays": 11,
    "possibleScores": "7-5,7-5;2-6,6-0,6-4;2-6,6-4,6-0;6-0,2-6,6-4;6-4,2-6,6-0;2-6,6-1,6-3;2-6,6-3,6-1;6-1,2-6,6-3;6-3,2-6,6-1;2-6,6-2,6-2;6-2,2-6,6-2"
  },
  {
    "totalGames": 22,
    "winnerGames": 13,
    "loserGames": 9,
    "winPCT": 0.59,
    "eloActual": 0.73,
    "numWays": 12,
    "possibleScores": "6-3,7-6;7-6,6-3;6-4,7-5;7-5,6-4;1-6,6-0,6-3;1-6,6-3,6-0;6-0,1-6,6-3;6-3,1-6,6-0;1-6,6-1,6-2;1-6,6-2,6-1;6-1,1-6,6-2;6-2,1-6,6-1"
  },
  {
    "totalGames": 20,
    "winnerGames": 12,
    "loserGames": 8,
    "winPCT": 0.6,
    "eloActual": 0.73,
    "numWays": 29,
    "possibleScores": "6-4,6-4;0-6,6-0,6-2;0-6,6-2,6-0;6-0,0-6,6-2;6-2,0-6,6-0;0-6,6-1,6-1;6-1,0-6,6-1;3-6,6-0,6-4;3-6,6-4,6-0;6-0,3-6,6-4;6-4,3-6,6-0;3-6,6-1,6-3;3-6,6-3,6-1;6-1,3-6,6-3;6-3,3-6,6-1;3-6,6-2,6-2;6-2,3-6,6-2;5-7,6-0,7-5;5-7,7-5,6-0;6-0,5-7,7-5;7-5,5-7,6-0;6-1,6-7,6-4;6-4,6-7,6-1;6-7,6-1,6-4;6-7,6-4,6-1;6-2,6-7,6-3;6-3,6-7,6-2;6-7,6-2,6-3;6-7,6-3,6-2"
  },
  {
    "totalGames": 21,
    "winnerGames": 13,
    "loserGames": 8,
    "winPCT": 0.62,
    "eloActual": 0.75,
    "numWays": 10,
    "possibleScores": "6-2,7-6;7-6,6-2;6-3,7-5;7-5,6-3;1-6,6-0,6-2;1-6,6-2,6-0;6-0,1-6,6-2;6-2,1-6,6-0;1-6,6-1,6-1;6-1,1-6,6-1"
  },
  {
    "totalGames": 19,
    "winnerGames": 12,
    "loserGames": 7,
    "winPCT": 0.63,
    "eloActual": 0.75,
    "numWays": 6,
    "possibleScores": "6-3,6-4;6-4,6-3;0-6,6-0,6-1;0-6,6-1,6-0;6-0,0-6,6-1;6-1,0-6,6-0"
  },
  {
    "totalGames": 20,
    "winnerGames": 13,
    "loserGames": 7,
    "winPCT": 0.65,
    "eloActual": 0.77,
    "numWays": 8,
    "possibleScores": "6-1,7-6;7-6,6-1;6-2,7-5;7-5,6-2;1-6,6-0,6-1;1-6,6-1,6-0;6-0,1-6,6-1;6-1,1-6,6-0"
  },
  {
    "totalGames": 18,
    "winnerGames": 12,
    "loserGames": 6,
    "winPCT": 0.67,
    "eloActual": 0.78,
    "numWays": 21,
    "possibleScores": "6-2,6-4;6-4,6-2;6-3,6-3;0-6,6-0,6-0;6-0,0-6,6-0;2-6,6-0,6-1;2-6,6-1,6-0;6-0,2-6,6-1;6-1,2-6,6-0;4-6,6-0,6-2;4-6,6-2,6-0;6-0,4-6,6-2;6-2,4-6,6-0;4-6,6-1,6-1;6-1,4-6,6-1;6-0,6-7,6-2;6-2,6-7,6-0;6-7,6-0,6-2;6-7,6-2,6-0;6-1,6-7,6-1;6-7,6-1,6-1"
  },
  {
    "totalGames": 19,
    "winnerGames": 13,
    "loserGames": 6,
    "winPCT": 0.68,
    "eloActual": 0.79,
    "numWays": 6,
    "possibleScores": "6-0,7-6;7-6,6-0;6-1,7-5;7-5,6-1;1-6,6-0,6-0;6-0,1-6,6-0"
  },
  {
    "totalGames": 17,
    "winnerGames": 12,
    "loserGames": 5,
    "winPCT": 0.71,
    "eloActual": 0.8,
    "numWays": 4,
    "possibleScores": "6-1,6-4;6-4,6-1;6-2,6-3;6-3,6-2"
  },
  {
    "totalGames": 18,
    "winnerGames": 13,
    "loserGames": 5,
    "winPCT": 0.72,
    "eloActual": 0.81,
    "numWays": 2,
    "possibleScores": "6-0,7-5;7-5,6-0"
  },
  {
    "totalGames": 16,
    "winnerGames": 12,
    "loserGames": 4,
    "winPCT": 0.75,
    "eloActual": 0.83,
    "numWays": 5,
    "possibleScores": "6-0,6-4;6-4,6-0;6-1,6-3;6-3,6-1;6-2,6-2"
  },
  {
    "totalGames": 15,
    "winnerGames": 12,
    "loserGames": 3,
    "winPCT": 0.8,
    "eloActual": 0.87,
    "numWays": 4,
    "possibleScores": "6-0,6-3;6-3,6-0;6-1,6-2;6-2,6-1"
  },
  {
    "totalGames": 14,
    "winnerGames": 12,
    "loserGames": 2,
    "winPCT": 0.86,
    "eloActual": 0.9,
    "numWays": 3,
    "possibleScores": "6-0,6-2;6-2,6-0;6-1,6-1"
  },
  {
    "totalGames": 13,
    "winnerGames": 12,
    "loserGames": 1,
    "winPCT": 0.92,
    "eloActual": 0.95,
    "numWays": 2,
    "possibleScores": "6-0,6-1;6-1,6-0"
  },
  {
    "totalGames": 12,
    "winnerGames": 12,
    "loserGames": 0,
    "winPCT": 1,
    "eloActual": 1,
    "numWays": 1,
    "possibleScores": "6-0,6-0"
  }
];
var threesets = [
{
    "totalGames": 32,
    "winnerGames": 14,
    "loserGames": 18,
    "winPCT": 0.44,
    "eloActual": 0.63,
    "numWays": 2,
    "possibleScores": "0-6,7-6,7-6;7-6,0-6,7-6"
  },
  {
    "totalGames": 29,
    "winnerGames": 13,
    "loserGames": 16,
    "winPCT": 0.45,
    "eloActual": 0.63,
    "numWays": 4,
    "possibleScores": "0-6,6-4,7-6;0-6,7-6,6-4;6-4,0-6,7-6;7-6,0-6,6-4"
  },
  {
    "totalGames": 31,
    "winnerGames": 14,
    "loserGames": 17,
    "winPCT": 0.45,
    "eloActual": 0.63,
    "numWays": 4,
    "possibleScores": "0-6,7-5,7-6;0-6,7-6,7-5;7-5,0-6,7-6;7-6,0-6,7-5"
  },
  {
    "totalGames": 33,
    "winnerGames": 15,
    "loserGames": 18,
    "winPCT": 0.45,
    "eloActual": 0.64,
    "numWays": 2,
    "possibleScores": "1-6,7-6,7-6;7-6,1-6,7-6"
  },
  {
    "totalGames": 26,
    "winnerGames": 12,
    "loserGames": 14,
    "winPCT": 0.46,
    "eloActual": 0.64,
    "numWays": 2,
    "possibleScores": "0-6,6-4,6-4;6-4,0-6,6-4"
  },
  {
    "totalGames": 28,
    "winnerGames": 13,
    "loserGames": 15,
    "winPCT": 0.46,
    "eloActual": 0.64,
    "numWays": 8,
    "possibleScores": "0-6,6-3,7-6;0-6,7-6,6-3;6-3,0-6,7-6;7-6,0-6,6-3;0-6,6-4,7-5;0-6,7-5,6-4;6-4,0-6,7-5;7-5,0-6,6-4"
  },
  {
    "totalGames": 30,
    "winnerGames": 14,
    "loserGames": 16,
    "winPCT": 0.47,
    "eloActual": 0.64,
    "numWays": 6,
    "possibleScores": "0-6,7-5,7-5;7-5,0-6,7-5;1-6,6-4,7-6;1-6,7-6,6-4;6-4,1-6,7-6;7-6,1-6,6-4"
  },
  {
    "totalGames": 32,
    "winnerGames": 15,
    "loserGames": 17,
    "winPCT": 0.47,
    "eloActual": 0.65,
    "numWays": 4,
    "possibleScores": "1-6,7-5,7-6;1-6,7-6,7-5;7-5,1-6,7-6;7-6,1-6,7-5"
  },
  {
    "totalGames": 34,
    "winnerGames": 16,
    "loserGames": 18,
    "winPCT": 0.47,
    "eloActual": 0.65,
    "numWays": 2,
    "possibleScores": "2-6,7-6,7-6;7-6,2-6,7-6"
  },
  {
    "totalGames": 25,
    "winnerGames": 12,
    "loserGames": 13,
    "winPCT": 0.48,
    "eloActual": 0.65,
    "numWays": 4,
    "possibleScores": "0-6,6-3,6-4;0-6,6-4,6-3;6-3,0-6,6-4;6-4,0-6,6-3"
  },
  {
    "totalGames": 27,
    "winnerGames": 13,
    "loserGames": 14,
    "winPCT": 0.48,
    "eloActual": 0.65,
    "numWays": 10,
    "possibleScores": "0-6,6-2,7-6;0-6,7-6,6-2;6-2,0-6,7-6;7-6,0-6,6-2;0-6,6-3,7-5;0-6,7-5,6-3;6-3,0-6,7-5;7-5,0-6,6-3;1-6,6-4,6-4;6-4,1-6,6-4"
  },
  {
    "totalGames": 29,
    "winnerGames": 14,
    "loserGames": 15,
    "winPCT": 0.48,
    "eloActual": 0.66,
    "numWays": 8,
    "possibleScores": "1-6,6-3,7-6;1-6,7-6,6-3;6-3,1-6,7-6;7-6,1-6,6-3;1-6,6-4,7-5;1-6,7-5,6-4;6-4,1-6,7-5;7-5,1-6,6-4"
  },
  {
    "totalGames": 31,
    "winnerGames": 15,
    "loserGames": 16,
    "winPCT": 0.48,
    "eloActual": 0.66,
    "numWays": 6,
    "possibleScores": "1-6,7-5,7-5;7-5,1-6,7-5;2-6,6-4,7-6;2-6,7-6,6-4;6-4,2-6,7-6;7-6,2-6,6-4"
  },
  {
    "totalGames": 33,
    "winnerGames": 16,
    "loserGames": 17,
    "winPCT": 0.48,
    "eloActual": 0.66,
    "numWays": 4,
    "possibleScores": "2-6,7-5,7-6;2-6,7-6,7-5;7-5,2-6,7-6;7-6,2-6,7-5"
  },
  {
    "totalGames": 35,
    "winnerGames": 17,
    "loserGames": 18,
    "winPCT": 0.49,
    "eloActual": 0.66,
    "numWays": 2,
    "possibleScores": "3-6,7-6,7-6;7-6,3-6,7-6"
  },
  {
    "totalGames": 26,
    "winnerGames": 13,
    "loserGames": 13,
    "winPCT": 0.5,
    "eloActual": 0.67,
    "numWays": 50,
    "possibleScores": "0-6,6-1,7-6;0-6,7-6,6-1;6-1,0-6,7-6;7-6,0-6,6-1;0-6,6-2,6-4;0-6,6-4,6-2;6-2,0-6,6-4;6-4,0-6,6-2;0-6,6-2,7-5;0-6,7-5,6-2;6-2,0-6,7-5;7-5,0-6,6-2;0-6,6-3,6-3;6-3,0-6,6-3;1-6,6-2,7-6;1-6,7-6,6-2;6-2,1-6,7-6;7-6,1-6,6-2;1-6,6-3,6-4;1-6,6-4,6-3;6-3,1-6,6-4;6-4,1-6,6-3;1-6,6-3,7-5;1-6,7-5,6-3;6-3,1-6,7-5;7-5,1-6,6-3;2-6,6-3,7-6;2-6,7-6,6-3;6-3,2-6,7-6;7-6,2-6,6-3;2-6,6-4,6-4;6-4,2-6,6-4;2-6,6-4,7-5;2-6,7-5,6-4;6-4,2-6,7-5;7-5,2-6,6-4;2-6,7-5,7-5;7-5,2-6,7-5;3-6,6-4,7-6;3-6,7-6,6-4;6-4,3-6,7-6;7-6,3-6,6-4;3-6,7-5,7-6;3-6,7-6,7-5;7-5,3-6,7-6;7-6,3-6,7-5;4-6,7-6,7-6;7-6,4-6,7-6;5-7,7-6,7-6;7-6,5-7,7-6"
  },
  {
    "totalGames": 39,
    "winnerGames": 20,
    "loserGames": 19,
    "winPCT": 0.51,
    "eloActual": 0.68,
    "numWays": 2,
    "possibleScores": "6-7,7-6,7-6;7-6,6-7,7-6"
  },
  {
    "totalGames": 37,
    "winnerGames": 19,
    "loserGames": 18,
    "winPCT": 0.51,
    "eloActual": 0.68,
    "numWays": 4,
    "possibleScores": "5-7,7-5,7-6;5-7,7-6,7-5;7-5,5-7,7-6;7-6,5-7,7-5"
  },
  {
    "totalGames": 35,
    "winnerGames": 18,
    "loserGames": 17,
    "winPCT": 0.51,
    "eloActual": 0.68,
    "numWays": 8,
    "possibleScores": "4-6,7-5,7-6;4-6,7-6,7-5;7-5,4-6,7-6;7-6,4-6,7-5;5-7,6-4,7-6;5-7,7-6,6-4;6-4,5-7,7-6;7-6,5-7,6-4"
  },
  {
    "totalGames": 33,
    "winnerGames": 17,
    "loserGames": 16,
    "winPCT": 0.52,
    "eloActual": 0.68,
    "numWays": 6,
    "possibleScores": "3-6,7-5,7-5;7-5,3-6,7-5;4-6,6-4,7-6;4-6,7-6,6-4;6-4,4-6,7-6;7-6,4-6,6-4"
  },
  {
    "totalGames": 31,
    "winnerGames": 16,
    "loserGames": 15,
    "winPCT": 0.52,
    "eloActual": 0.68,
    "numWays": 8,
    "possibleScores": "3-6,6-3,7-6;3-6,7-6,6-3;6-3,3-6,7-6;7-6,3-6,6-3;3-6,6-4,7-5;3-6,7-5,6-4;6-4,3-6,7-5;7-5,3-6,6-4"
  },
  {
    "totalGames": 29,
    "winnerGames": 15,
    "loserGames": 14,
    "winPCT": 0.52,
    "eloActual": 0.68,
    "numWays": 10,
    "possibleScores": "2-6,6-2,7-6;2-6,7-6,6-2;6-2,2-6,7-6;7-6,2-6,6-2;2-6,6-3,7-5;2-6,7-5,6-3;6-3,2-6,7-5;7-5,2-6,6-3;3-6,6-4,6-4;6-4,3-6,6-4"
  },
  {
    "totalGames": 27,
    "winnerGames": 14,
    "loserGames": 13,
    "winPCT": 0.52,
    "eloActual": 0.68,
    "numWays": 12,
    "possibleScores": "1-6,6-1,7-6;1-6,7-6,6-1;6-1,1-6,7-6;7-6,1-6,6-1;1-6,6-2,7-5;1-6,7-5,6-2;6-2,1-6,7-5;7-5,1-6,6-2;2-6,6-3,6-4;2-6,6-4,6-3;6-3,2-6,6-4;6-4,2-6,6-3"
  },
  {
    "totalGames": 25,
    "winnerGames": 13,
    "loserGames": 12,
    "winPCT": 0.52,
    "eloActual": 0.68,
    "numWays": 14,
    "possibleScores": "0-6,6-0,7-6;0-6,7-6,6-0;6-0,0-6,7-6;7-6,0-6,6-0;0-6,6-1,7-5;0-6,7-5,6-1;6-1,0-6,7-5;7-5,0-6,6-1;1-6,6-2,6-4;1-6,6-4,6-2;6-2,1-6,6-4;6-4,1-6,6-2;1-6,6-3,6-3;6-3,1-6,6-3"
  },
  {
    "totalGames": 23,
    "winnerGames": 12,
    "loserGames": 11,
    "winPCT": 0.52,
    "eloActual": 0.68,
    "numWays": 8,
    "possibleScores": "0-6,6-1,6-4;0-6,6-4,6-1;6-1,0-6,6-4;6-4,0-6,6-1;0-6,6-2,6-3;0-6,6-3,6-2;6-2,0-6,6-3;6-3,0-6,6-2"
  },
  {
    "totalGames": 38,
    "winnerGames": 20,
    "loserGames": 18,
    "winPCT": 0.53,
    "eloActual": 0.68,
    "numWays": 4,
    "possibleScores": "6-7,7-5,7-6;6-7,7-6,7-5;7-5,6-7,7-6;7-6,6-7,7-5"
  },
  {
    "totalGames": 36,
    "winnerGames": 19,
    "loserGames": 17,
    "winPCT": 0.53,
    "eloActual": 0.69,
    "numWays": 6,
    "possibleScores": "5-7,7-5,7-5;7-5,5-7,7-5;6-4,6-7,7-6;6-7,6-4,7-6;6-7,7-6,6-4;7-6,6-7,6-4"
  },
  {
    "totalGames": 34,
    "winnerGames": 18,
    "loserGames": 16,
    "winPCT": 0.53,
    "eloActual": 0.69,
    "numWays": 10,
    "possibleScores": "4-6,7-5,7-5;7-5,4-6,7-5;5-7,6-3,7-6;5-7,7-6,6-3;6-3,5-7,7-6;7-6,5-7,6-3;5-7,6-4,7-5;5-7,7-5,6-4;6-4,5-7,7-5;7-5,5-7,6-4"
  },
  {
    "totalGames": 32,
    "winnerGames": 17,
    "loserGames": 15,
    "winPCT": 0.53,
    "eloActual": 0.69,
    "numWays": 10,
    "possibleScores": "4-6,6-3,7-6;4-6,7-6,6-3;6-3,4-6,7-6;7-6,4-6,6-3;4-6,6-4,7-5;4-6,7-5,6-4;6-4,4-6,7-5;7-5,4-6,6-4;5-7,6-4,6-4;6-4,5-7,6-4"
  },
  {
    "totalGames": 30,
    "winnerGames": 16,
    "loserGames": 14,
    "winPCT": 0.53,
    "eloActual": 0.69,
    "numWays": 10,
    "possibleScores": "3-6,6-2,7-6;3-6,7-6,6-2;6-2,3-6,7-6;7-6,3-6,6-2;3-6,6-3,7-5;3-6,7-5,6-3;6-3,3-6,7-5;7-5,3-6,6-3;4-6,6-4,6-4;6-4,4-6,6-4"
  },
  {
    "totalGames": 28,
    "winnerGames": 15,
    "loserGames": 13,
    "winPCT": 0.54,
    "eloActual": 0.69,
    "numWays": 12,
    "possibleScores": "2-6,6-1,7-6;2-6,7-6,6-1;6-1,2-6,7-6;7-6,2-6,6-1;2-6,6-2,7-5;2-6,7-5,6-2;6-2,2-6,7-5;7-5,2-6,6-2;3-6,6-3,6-4;3-6,6-4,6-3;6-3,3-6,6-4;6-4,3-6,6-3"
  },
  {
    "totalGames": 37,
    "winnerGames": 20,
    "loserGames": 17,
    "winPCT": 0.54,
    "eloActual": 0.69,
    "numWays": 2,
    "possibleScores": "6-7,7-5,7-5;7-5,6-7,7-5"
  },
  {
    "totalGames": 24,
    "winnerGames": 13,
    "loserGames": 11,
    "winPCT": 0.54,
    "eloActual": 0.69,
    "numWays": 12,
    "possibleScores": "0-6,6-0,7-5;0-6,7-5,6-0;6-0,0-6,7-5;7-5,0-6,6-0;1-6,6-1,6-4;1-6,6-4,6-1;6-1,1-6,6-4;6-4,1-6,6-1;1-6,6-2,6-3;1-6,6-3,6-2;6-2,1-6,6-3;6-3,1-6,6-2"
  },
  {
    "totalGames": 35,
    "winnerGames": 19,
    "loserGames": 16,
    "winPCT": 0.54,
    "eloActual": 0.7,
    "numWays": 8,
    "possibleScores": "6-3,6-7,7-6;6-7,6-3,7-6;6-7,7-6,6-3;7-6,6-7,6-3;6-4,6-7,7-5;6-7,6-4,7-5;6-7,7-5,6-4;7-5,6-7,6-4"
  },
  {
    "totalGames": 22,
    "winnerGames": 12,
    "loserGames": 10,
    "winPCT": 0.55,
    "eloActual": 0.7,
    "numWays": 20,
    "possibleScores": "0-6,6-0,6-4;0-6,6-4,6-0;6-0,0-6,6-4;6-4,0-6,6-0;0-6,6-1,6-3;0-6,6-3,6-1;6-1,0-6,6-3;6-3,0-6,6-1;0-6,6-2,6-2;6-2,0-6,6-2;5-7,6-2,7-6;5-7,7-6,6-2;6-2,5-7,7-6;7-6,5-7,6-2;5-7,6-3,7-5;5-7,7-5,6-3;6-3,5-7,7-5;7-5,5-7,6-3;6-4,6-7,6-4;6-7,6-4,6-4"
  },
  {
    "totalGames": 31,
    "winnerGames": 17,
    "loserGames": 14,
    "winPCT": 0.55,
    "eloActual": 0.7,
    "numWays": 12,
    "possibleScores": "4-6,6-2,7-6;4-6,7-6,6-2;6-2,4-6,7-6;7-6,4-6,6-2;4-6,6-3,7-5;4-6,7-5,6-3;6-3,4-6,7-5;7-5,4-6,6-3;5-7,6-3,6-4;5-7,6-4,6-3;6-3,5-7,6-4;6-4,5-7,6-3"
  },
  {
    "totalGames": 29,
    "winnerGames": 16,
    "loserGames": 13,
    "winPCT": 0.55,
    "eloActual": 0.7,
    "numWays": 12,
    "possibleScores": "3-6,6-1,7-6;3-6,7-6,6-1;6-1,3-6,7-6;7-6,3-6,6-1;3-6,6-2,7-5;3-6,7-5,6-2;6-2,3-6,7-5;7-5,3-6,6-2;4-6,6-3,6-4;4-6,6-4,6-3;6-3,4-6,6-4;6-4,4-6,6-3"
  },
  {
    "totalGames": 27,
    "winnerGames": 15,
    "loserGames": 12,
    "winPCT": 0.56,
    "eloActual": 0.7,
    "numWays": 14,
    "possibleScores": "2-6,6-0,7-6;2-6,7-6,6-0;6-0,2-6,7-6;7-6,2-6,6-0;2-6,6-1,7-5;2-6,7-5,6-1;6-1,2-6,7-5;7-5,2-6,6-1;3-6,6-2,6-4;3-6,6-4,6-2;6-2,3-6,6-4;6-4,3-6,6-2;3-6,6-3,6-3;6-3,3-6,6-3"
  },
  {
    "totalGames": 34,
    "winnerGames": 19,
    "loserGames": 15,
    "winPCT": 0.56,
    "eloActual": 0.71,
    "numWays": 8,
    "possibleScores": "6-2,6-7,7-6;6-7,6-2,7-6;6-7,7-6,6-2;7-6,6-7,6-2;6-3,6-7,7-5;6-7,6-3,7-5;6-7,7-5,6-3;7-5,6-7,6-3"
  },
  {
    "totalGames": 32,
    "winnerGames": 18,
    "loserGames": 14,
    "winPCT": 0.56,
    "eloActual": 0.71,
    "numWays": 12,
    "possibleScores": "5-7,6-1,7-6;5-7,7-6,6-1;6-1,5-7,7-6;7-6,5-7,6-1;5-7,6-2,7-5;5-7,7-5,6-2;6-2,5-7,7-5;7-5,5-7,6-2;6-3,6-7,6-4;6-4,6-7,6-3;6-7,6-3,6-4;6-7,6-4,6-3"
  },
  {
    "totalGames": 30,
    "winnerGames": 17,
    "loserGames": 13,
    "winPCT": 0.57,
    "eloActual": 0.71,
    "numWays": 14,
    "possibleScores": "4-6,6-1,7-6;4-6,7-6,6-1;6-1,4-6,7-6;7-6,4-6,6-1;4-6,6-2,7-5;4-6,7-5,6-2;6-2,4-6,7-5;7-5,4-6,6-2;5-7,6-2,6-4;5-7,6-4,6-2;6-2,5-7,6-4;6-4,5-7,6-2;5-7,6-3,6-3;6-3,5-7,6-3"
  },
  {
    "totalGames": 21,
    "winnerGames": 12,
    "loserGames": 9,
    "winPCT": 0.57,
    "eloActual": 0.71,
    "numWays": 22,
    "possibleScores": "0-6,6-0,6-3;0-6,6-3,6-0;6-0,0-6,6-3;6-3,0-6,6-0;0-6,6-1,6-2;0-6,6-2,6-1;6-1,0-6,6-2;6-2,0-6,6-1;3-6,6-0,7-6;3-6,7-6,6-0;6-0,3-6,7-6;7-6,3-6,6-0;3-6,6-1,7-5;3-6,7-5,6-1;6-1,3-6,7-5;7-5,3-6,6-1;4-6,6-2,6-4;4-6,6-4,6-2;6-2,4-6,6-4;6-4,4-6,6-2;4-6,6-3,6-3;6-3,4-6,6-3"
  },
  {
    "totalGames": 33,
    "winnerGames": 19,
    "loserGames": 14,
    "winPCT": 0.58,
    "eloActual": 0.72,
    "numWays": 8,
    "possibleScores": "6-1,6-7,7-6;6-7,6-1,7-6;6-7,7-6,6-1;7-6,6-7,6-1;6-2,6-7,7-5;6-7,6-2,7-5;6-7,7-5,6-2;7-5,6-7,6-2"
  },
  {
    "totalGames": 26,
    "winnerGames": 15,
    "loserGames": 11,
    "winPCT": 0.58,
    "eloActual": 0.72,
    "numWays": 12,
    "possibleScores": "2-6,6-0,7-5;2-6,7-5,6-0;6-0,2-6,7-5;7-5,2-6,6-0;3-6,6-1,6-4;3-6,6-4,6-1;6-1,3-6,6-4;6-4,3-6,6-1;3-6,6-2,6-3;3-6,6-3,6-2;6-2,3-6,6-3;6-3,3-6,6-2"
  },
  {
    "totalGames": 31,
    "winnerGames": 18,
    "loserGames": 13,
    "winPCT": 0.58,
    "eloActual": 0.72,
    "numWays": 14,
    "possibleScores": "5-7,6-0,7-6;5-7,7-6,6-0;6-0,5-7,7-6;7-6,5-7,6-0;5-7,6-1,7-5;5-7,7-5,6-1;6-1,5-7,7-5;7-5,5-7,6-1;6-2,6-7,6-4;6-4,6-7,6-2;6-7,6-2,6-4;6-7,6-4,6-2;6-3,6-7,6-3;6-7,6-3,6-3"
  },
  {
    "totalGames": 29,
    "winnerGames": 17,
    "loserGames": 12,
    "winPCT": 0.59,
    "eloActual": 0.72,
    "numWays": 16,
    "possibleScores": "4-6,6-0,7-6;4-6,7-6,6-0;6-0,4-6,7-6;7-6,4-6,6-0;4-6,6-1,7-5;4-6,7-5,6-1;6-1,4-6,7-5;7-5,4-6,6-1;5-7,6-1,6-4;5-7,6-4,6-1;6-1,5-7,6-4;6-4,5-7,6-1;5-7,6-2,6-3;5-7,6-3,6-2;6-2,5-7,6-3;6-3,5-7,6-2"
  },
  {
    "totalGames": 27,
    "winnerGames": 16,
    "loserGames": 11,
    "winPCT": 0.59,
    "eloActual": 0.73,
    "numWays": 12,
    "possibleScores": "3-6,6-0,7-5;3-6,7-5,6-0;6-0,3-6,7-5;7-5,3-6,6-0;4-6,6-1,6-4;4-6,6-4,6-1;6-1,4-6,6-4;6-4,4-6,6-1;4-6,6-2,6-3;4-6,6-3,6-2;6-2,4-6,6-3;6-3,4-6,6-2"
  },
  {
    "totalGames": 32,
    "winnerGames": 19,
    "loserGames": 13,
    "winPCT": 0.59,
    "eloActual": 0.73,
    "numWays": 8,
    "possibleScores": "6-0,6-7,7-6;6-7,6-0,7-6;6-7,7-6,6-0;7-6,6-7,6-0;6-1,6-7,7-5;6-7,6-1,7-5;6-7,7-5,6-1;7-5,6-7,6-1"
  },
  {
    "totalGames": 28,
    "winnerGames": 17,
    "loserGames": 11,
    "winPCT": 0.61,
    "eloActual": 0.74,
    "numWays": 14,
    "possibleScores": "4-6,6-0,7-5;4-6,7-5,6-0;6-0,4-6,7-5;7-5,4-6,6-0;5-7,6-0,6-4;5-7,6-4,6-0;6-0,5-7,6-4;6-4,5-7,6-0;5-7,6-1,6-3;5-7,6-3,6-1;6-1,5-7,6-3;6-3,5-7,6-1;5-7,6-2,6-2;6-2,5-7,6-2"
  },
  {
    "totalGames": 23,
    "winnerGames": 14,
    "loserGames": 9,
    "winPCT": 0.61,
    "eloActual": 0.74,
    "numWays": 8,
    "possibleScores": "2-6,6-0,6-3;2-6,6-3,6-0;6-0,2-6,6-3;6-3,2-6,6-0;2-6,6-1,6-2;2-6,6-2,6-1;6-1,2-6,6-2;6-2,2-6,6-1"
  },
  {
    "totalGames": 31,
    "winnerGames": 19,
    "loserGames": 12,
    "winPCT": 0.61,
    "eloActual": 0.74,
    "numWays": 4,
    "possibleScores": "6-0,6-7,7-5;6-7,6-0,7-5;6-7,7-5,6-0;7-5,6-7,6-0"
  },
  {
    "totalGames": 26,
    "winnerGames": 16,
    "loserGames": 10,
    "winPCT": 0.62,
    "eloActual": 0.74,
    "numWays": 10,
    "possibleScores": "4-6,6-0,6-4;4-6,6-4,6-0;6-0,4-6,6-4;6-4,4-6,6-0;4-6,6-1,6-3;4-6,6-3,6-1;6-1,4-6,6-3;6-3,4-6,6-1;4-6,6-2,6-2;6-2,4-6,6-2"
  },
  {
    "totalGames": 29,
    "winnerGames": 18,
    "loserGames": 11,
    "winPCT": 0.62,
    "eloActual": 0.75,
    "numWays": 10,
    "possibleScores": "6-0,6-7,6-4;6-4,6-7,6-0;6-7,6-0,6-4;6-7,6-4,6-0;6-1,6-7,6-3;6-3,6-7,6-1;6-7,6-1,6-3;6-7,6-3,6-1;6-2,6-7,6-2;6-7,6-2,6-2"
  },
  {
    "totalGames": 24,
    "winnerGames": 15,
    "loserGames": 9,
    "winPCT": 0.63,
    "eloActual": 0.75,
    "numWays": 8,
    "possibleScores": "3-6,6-0,6-3;3-6,6-3,6-0;6-0,3-6,6-3;6-3,3-6,6-0;3-6,6-1,6-2;3-6,6-2,6-1;6-1,3-6,6-2;6-2,3-6,6-1"
  },
  {
    "totalGames": 27,
    "winnerGames": 17,
    "loserGames": 10,
    "winPCT": 0.63,
    "eloActual": 0.75,
    "numWays": 8,
    "possibleScores": "5-7,6-0,6-3;5-7,6-3,6-0;6-0,5-7,6-3;6-3,5-7,6-0;5-7,6-1,6-2;5-7,6-2,6-1;6-1,5-7,6-2;6-2,5-7,6-1"
  },
  {
    "totalGames": 22,
    "winnerGames": 14,
    "loserGames": 8,
    "winPCT": 0.64,
    "eloActual": 0.76,
    "numWays": 6,
    "possibleScores": "2-6,6-0,6-2;2-6,6-2,6-0;6-0,2-6,6-2;6-2,2-6,6-0;2-6,6-1,6-1;6-1,2-6,6-1"
  },
  {
    "totalGames": 25,
    "winnerGames": 16,
    "loserGames": 9,
    "winPCT": 0.64,
    "eloActual": 0.76,
    "numWays": 8,
    "possibleScores": "4-6,6-0,6-3;4-6,6-3,6-0;6-0,4-6,6-3;6-3,4-6,6-0;4-6,6-1,6-2;4-6,6-2,6-1;6-1,4-6,6-2;6-2,4-6,6-1"
  },
  {
    "totalGames": 28,
    "winnerGames": 18,
    "loserGames": 10,
    "winPCT": 0.64,
    "eloActual": 0.76,
    "numWays": 8,
    "possibleScores": "6-0,6-7,6-3;6-3,6-7,6-0;6-7,6-0,6-3;6-7,6-3,6-0;6-1,6-7,6-2;6-2,6-7,6-1;6-7,6-1,6-2;6-7,6-2,6-1"
  },
  {
    "totalGames": 23,
    "winnerGames": 15,
    "loserGames": 8,
    "winPCT": 0.65,
    "eloActual": 0.77,
    "numWays": 6,
    "possibleScores": "3-6,6-0,6-2;3-6,6-2,6-0;6-0,3-6,6-2;6-2,3-6,6-0;3-6,6-1,6-1;6-1,3-6,6-1"
  },
  {
    "totalGames": 26,
    "winnerGames": 17,
    "loserGames": 9,
    "winPCT": 0.65,
    "eloActual": 0.77,
    "numWays": 6,
    "possibleScores": "5-7,6-0,6-2;5-7,6-2,6-0;6-0,5-7,6-2;6-2,5-7,6-0;5-7,6-1,6-1;6-1,5-7,6-1"
  },
  {
    "totalGames": 25,
    "winnerGames": 17,
    "loserGames": 8,
    "winPCT": 0.68,
    "eloActual": 0.79,
    "numWays": 4,
    "possibleScores": "5-7,6-0,6-1;5-7,6-1,6-0;6-0,5-7,6-1;6-1,5-7,6-0"
  },
  {
    "totalGames": 22,
    "winnerGames": 15,
    "loserGames": 7,
    "winPCT": 0.68,
    "eloActual": 0.79,
    "numWays": 4,
    "possibleScores": "3-6,6-0,6-1;3-6,6-1,6-0;6-0,3-6,6-1;6-1,3-6,6-0"
  },
  {
    "totalGames": 26,
    "winnerGames": 18,
    "loserGames": 8,
    "winPCT": 0.69,
    "eloActual": 0.79,
    "numWays": 4,
    "possibleScores": "6-0,6-7,6-1;6-1,6-7,6-0;6-7,6-0,6-1;6-7,6-1,6-0"
  },
  {
    "totalGames": 23,
    "winnerGames": 16,
    "loserGames": 7,
    "winPCT": 0.7,
    "eloActual": 0.8,
    "numWays": 4,
    "possibleScores": "4-6,6-0,6-1;4-6,6-1,6-0;6-0,4-6,6-1;6-1,4-6,6-0"
  },
  {
    "totalGames": 20,
    "winnerGames": 14,
    "loserGames": 6,
    "winPCT": 0.7,
    "eloActual": 0.8,
    "numWays": 2,
    "possibleScores": "2-6,6-0,6-0;6-0,2-6,6-0"
  },
  {
    "totalGames": 24,
    "winnerGames": 17,
    "loserGames": 7,
    "winPCT": 0.71,
    "eloActual": 0.81,
    "numWays": 2,
    "possibleScores": "5-7,6-0,6-0;6-0,5-7,6-0"
  },
  {
    "totalGames": 21,
    "winnerGames": 15,
    "loserGames": 6,
    "winPCT": 0.71,
    "eloActual": 0.81,
    "numWays": 2,
    "possibleScores": "3-6,6-0,6-0;6-0,3-6,6-0"
  },
  {
    "totalGames": 25,
    "winnerGames": 18,
    "loserGames": 7,
    "winPCT": 0.72,
    "eloActual": 0.81,
    "numWays": 2,
    "possibleScores": "6-0,6-7,6-0;6-7,6-0,6-0"
  },
  {
    "totalGames": 22,
    "winnerGames": 16,
    "loserGames": 6,
    "winPCT": 0.73,
    "eloActual": 0.82,
    "numWays": 2,
    "possibleScores": "4-6,6-0,6-0;6-0,4-6,6-0"
  }
];
var threesetloss = [
{
    "totalGames": 32,
    "winnerGames": 18,
    "loserGames": 14,
    "winPCT": 0.56,
    "eloActual": 0.38,
    "numWays": 2,
    "possibleScores": "0-6,7-6,7-6;7-6,0-6,7-6"
  },
  {
    "totalGames": 29,
    "winnerGames": 16,
    "loserGames": 13,
    "winPCT": 0.55,
    "eloActual": 0.37,
    "numWays": 4,
    "possibleScores": "0-6,6-4,7-6;0-6,7-6,6-4;6-4,0-6,7-6;7-6,0-6,6-4"
  },
  {
    "totalGames": 31,
    "winnerGames": 17,
    "loserGames": 14,
    "winPCT": 0.55,
    "eloActual": 0.37,
    "numWays": 4,
    "possibleScores": "0-6,7-5,7-6;0-6,7-6,7-5;7-5,0-6,7-6;7-6,0-6,7-5"
  },
  {
    "totalGames": 33,
    "winnerGames": 18,
    "loserGames": 15,
    "winPCT": 0.55,
    "eloActual": 0.36,
    "numWays": 2,
    "possibleScores": "1-6,7-6,7-6;7-6,1-6,7-6"
  },
  {
    "totalGames": 26,
    "winnerGames": 14,
    "loserGames": 12,
    "winPCT": 0.54,
    "eloActual": 0.36,
    "numWays": 2,
    "possibleScores": "0-6,6-4,6-4;6-4,0-6,6-4"
  },
  {
    "totalGames": 28,
    "winnerGames": 15,
    "loserGames": 13,
    "winPCT": 0.54,
    "eloActual": 0.36,
    "numWays": 8,
    "possibleScores": "0-6,6-3,7-6;0-6,7-6,6-3;6-3,0-6,7-6;7-6,0-6,6-3;0-6,6-4,7-5;0-6,7-5,6-4;6-4,0-6,7-5;7-5,0-6,6-4"
  },
  {
    "totalGames": 30,
    "winnerGames": 16,
    "loserGames": 14,
    "winPCT": 0.53,
    "eloActual": 0.36,
    "numWays": 6,
    "possibleScores": "0-6,7-5,7-5;7-5,0-6,7-5;1-6,6-4,7-6;1-6,7-6,6-4;6-4,1-6,7-6;7-6,1-6,6-4"
  },
  {
    "totalGames": 32,
    "winnerGames": 17,
    "loserGames": 15,
    "winPCT": 0.53,
    "eloActual": 0.35,
    "numWays": 4,
    "possibleScores": "1-6,7-5,7-6;1-6,7-6,7-5;7-5,1-6,7-6;7-6,1-6,7-5"
  },
  {
    "totalGames": 34,
    "winnerGames": 18,
    "loserGames": 16,
    "winPCT": 0.53,
    "eloActual": 0.35,
    "numWays": 2,
    "possibleScores": "2-6,7-6,7-6;7-6,2-6,7-6"
  },
  {
    "totalGames": 25,
    "winnerGames": 13,
    "loserGames": 12,
    "winPCT": 0.52,
    "eloActual": 0.35,
    "numWays": 4,
    "possibleScores": "0-6,6-3,6-4;0-6,6-4,6-3;6-3,0-6,6-4;6-4,0-6,6-3"
  },
  {
    "totalGames": 27,
    "winnerGames": 14,
    "loserGames": 13,
    "winPCT": 0.52,
    "eloActual": 0.35,
    "numWays": 10,
    "possibleScores": "0-6,6-2,7-6;0-6,7-6,6-2;6-2,0-6,7-6;7-6,0-6,6-2;0-6,6-3,7-5;0-6,7-5,6-3;6-3,0-6,7-5;7-5,0-6,6-3;1-6,6-4,6-4;6-4,1-6,6-4"
  },
  {
    "totalGames": 29,
    "winnerGames": 15,
    "loserGames": 14,
    "winPCT": 0.52,
    "eloActual": 0.34,
    "numWays": 8,
    "possibleScores": "1-6,6-3,7-6;1-6,7-6,6-3;6-3,1-6,7-6;7-6,1-6,6-3;1-6,6-4,7-5;1-6,7-5,6-4;6-4,1-6,7-5;7-5,1-6,6-4"
  },
  {
    "totalGames": 31,
    "winnerGames": 16,
    "loserGames": 15,
    "winPCT": 0.52,
    "eloActual": 0.34,
    "numWays": 6,
    "possibleScores": "1-6,7-5,7-5;7-5,1-6,7-5;2-6,6-4,7-6;2-6,7-6,6-4;6-4,2-6,7-6;7-6,2-6,6-4"
  },
  {
    "totalGames": 33,
    "winnerGames": 17,
    "loserGames": 16,
    "winPCT": 0.52,
    "eloActual": 0.34,
    "numWays": 4,
    "possibleScores": "2-6,7-5,7-6;2-6,7-6,7-5;7-5,2-6,7-6;7-6,2-6,7-5"
  },
  {
    "totalGames": 35,
    "winnerGames": 18,
    "loserGames": 17,
    "winPCT": 0.51,
    "eloActual": 0.34,
    "numWays": 2,
    "possibleScores": "3-6,7-6,7-6;7-6,3-6,7-6"
  },
  {
    "totalGames": 26,
    "winnerGames": 13,
    "loserGames": 13,
    "winPCT": 0.5,
    "eloActual": 0.33,
    "numWays": 50,
    "possibleScores": "0-6,6-1,7-6;0-6,7-6,6-1;6-1,0-6,7-6;7-6,0-6,6-1;0-6,6-2,6-4;0-6,6-4,6-2;6-2,0-6,6-4;6-4,0-6,6-2;0-6,6-2,7-5;0-6,7-5,6-2;6-2,0-6,7-5;7-5,0-6,6-2;0-6,6-3,6-3;6-3,0-6,6-3;1-6,6-2,7-6;1-6,7-6,6-2;6-2,1-6,7-6;7-6,1-6,6-2;1-6,6-3,6-4;1-6,6-4,6-3;6-3,1-6,6-4;6-4,1-6,6-3;1-6,6-3,7-5;1-6,7-5,6-3;6-3,1-6,7-5;7-5,1-6,6-3;2-6,6-3,7-6;2-6,7-6,6-3;6-3,2-6,7-6;7-6,2-6,6-3;2-6,6-4,6-4;6-4,2-6,6-4;2-6,6-4,7-5;2-6,7-5,6-4;6-4,2-6,7-5;7-5,2-6,6-4;2-6,7-5,7-5;7-5,2-6,7-5;3-6,6-4,7-6;3-6,7-6,6-4;6-4,3-6,7-6;7-6,3-6,6-4;3-6,7-5,7-6;3-6,7-6,7-5;7-5,3-6,7-6;7-6,3-6,7-5;4-6,7-6,7-6;7-6,4-6,7-6;5-7,7-6,7-6;7-6,5-7,7-6"
  },
  {
    "totalGames": 39,
    "winnerGames": 19,
    "loserGames": 20,
    "winPCT": 0.49,
    "eloActual": 0.32,
    "numWays": 2,
    "possibleScores": "6-7,7-6,7-6;7-6,6-7,7-6"
  },
  {
    "totalGames": 37,
    "winnerGames": 18,
    "loserGames": 19,
    "winPCT": 0.49,
    "eloActual": 0.32,
    "numWays": 4,
    "possibleScores": "5-7,7-5,7-6;5-7,7-6,7-5;7-5,5-7,7-6;7-6,5-7,7-5"
  },
  {
    "totalGames": 35,
    "winnerGames": 17,
    "loserGames": 18,
    "winPCT": 0.49,
    "eloActual": 0.32,
    "numWays": 8,
    "possibleScores": "4-6,7-5,7-6;4-6,7-6,7-5;7-5,4-6,7-6;7-6,4-6,7-5;5-7,6-4,7-6;5-7,7-6,6-4;6-4,5-7,7-6;7-6,5-7,6-4"
  },
  {
    "totalGames": 33,
    "winnerGames": 16,
    "loserGames": 17,
    "winPCT": 0.48,
    "eloActual": 0.32,
    "numWays": 6,
    "possibleScores": "3-6,7-5,7-5;7-5,3-6,7-5;4-6,6-4,7-6;4-6,7-6,6-4;6-4,4-6,7-6;7-6,4-6,6-4"
  },
  {
    "totalGames": 31,
    "winnerGames": 15,
    "loserGames": 16,
    "winPCT": 0.48,
    "eloActual": 0.32,
    "numWays": 8,
    "possibleScores": "3-6,6-3,7-6;3-6,7-6,6-3;6-3,3-6,7-6;7-6,3-6,6-3;3-6,6-4,7-5;3-6,7-5,6-4;6-4,3-6,7-5;7-5,3-6,6-4"
  },
  {
    "totalGames": 29,
    "winnerGames": 14,
    "loserGames": 15,
    "winPCT": 0.48,
    "eloActual": 0.32,
    "numWays": 10,
    "possibleScores": "2-6,6-2,7-6;2-6,7-6,6-2;6-2,2-6,7-6;7-6,2-6,6-2;2-6,6-3,7-5;2-6,7-5,6-3;6-3,2-6,7-5;7-5,2-6,6-3;3-6,6-4,6-4;6-4,3-6,6-4"
  },
  {
    "totalGames": 27,
    "winnerGames": 13,
    "loserGames": 14,
    "winPCT": 0.48,
    "eloActual": 0.32,
    "numWays": 12,
    "possibleScores": "1-6,6-1,7-6;1-6,7-6,6-1;6-1,1-6,7-6;7-6,1-6,6-1;1-6,6-2,7-5;1-6,7-5,6-2;6-2,1-6,7-5;7-5,1-6,6-2;2-6,6-3,6-4;2-6,6-4,6-3;6-3,2-6,6-4;6-4,2-6,6-3"
  },
  {
    "totalGames": 25,
    "winnerGames": 12,
    "loserGames": 13,
    "winPCT": 0.48,
    "eloActual": 0.32,
    "numWays": 14,
    "possibleScores": "0-6,6-0,7-6;0-6,7-6,6-0;6-0,0-6,7-6;7-6,0-6,6-0;0-6,6-1,7-5;0-6,7-5,6-1;6-1,0-6,7-5;7-5,0-6,6-1;1-6,6-2,6-4;1-6,6-4,6-2;6-2,1-6,6-4;6-4,1-6,6-2;1-6,6-3,6-3;6-3,1-6,6-3"
  },
  {
    "totalGames": 23,
    "winnerGames": 11,
    "loserGames": 12,
    "winPCT": 0.48,
    "eloActual": 0.32,
    "numWays": 8,
    "possibleScores": "0-6,6-1,6-4;0-6,6-4,6-1;6-1,0-6,6-4;6-4,0-6,6-1;0-6,6-2,6-3;0-6,6-3,6-2;6-2,0-6,6-3;6-3,0-6,6-2"
  },
  {
    "totalGames": 38,
    "winnerGames": 18,
    "loserGames": 20,
    "winPCT": 0.47,
    "eloActual": 0.32,
    "numWays": 4,
    "possibleScores": "6-7,7-5,7-6;6-7,7-6,7-5;7-5,6-7,7-6;7-6,6-7,7-5"
  },
  {
    "totalGames": 36,
    "winnerGames": 17,
    "loserGames": 19,
    "winPCT": 0.47,
    "eloActual": 0.31,
    "numWays": 6,
    "possibleScores": "5-7,7-5,7-5;7-5,5-7,7-5;6-4,6-7,7-6;6-7,6-4,7-6;6-7,7-6,6-4;7-6,6-7,6-4"
  },
  {
    "totalGames": 34,
    "winnerGames": 16,
    "loserGames": 18,
    "winPCT": 0.47,
    "eloActual": 0.31,
    "numWays": 10,
    "possibleScores": "4-6,7-5,7-5;7-5,4-6,7-5;5-7,6-3,7-6;5-7,7-6,6-3;6-3,5-7,7-6;7-6,5-7,6-3;5-7,6-4,7-5;5-7,7-5,6-4;6-4,5-7,7-5;7-5,5-7,6-4"
  },
  {
    "totalGames": 32,
    "winnerGames": 15,
    "loserGames": 17,
    "winPCT": 0.47,
    "eloActual": 0.31,
    "numWays": 10,
    "possibleScores": "4-6,6-3,7-6;4-6,7-6,6-3;6-3,4-6,7-6;7-6,4-6,6-3;4-6,6-4,7-5;4-6,7-5,6-4;6-4,4-6,7-5;7-5,4-6,6-4;5-7,6-4,6-4;6-4,5-7,6-4"
  },
  {
    "totalGames": 30,
    "winnerGames": 14,
    "loserGames": 16,
    "winPCT": 0.47,
    "eloActual": 0.31,
    "numWays": 10,
    "possibleScores": "3-6,6-2,7-6;3-6,7-6,6-2;6-2,3-6,7-6;7-6,3-6,6-2;3-6,6-3,7-5;3-6,7-5,6-3;6-3,3-6,7-5;7-5,3-6,6-3;4-6,6-4,6-4;6-4,4-6,6-4"
  },
  {
    "totalGames": 28,
    "winnerGames": 13,
    "loserGames": 15,
    "winPCT": 0.46,
    "eloActual": 0.31,
    "numWays": 12,
    "possibleScores": "2-6,6-1,7-6;2-6,7-6,6-1;6-1,2-6,7-6;7-6,2-6,6-1;2-6,6-2,7-5;2-6,7-5,6-2;6-2,2-6,7-5;7-5,2-6,6-2;3-6,6-3,6-4;3-6,6-4,6-3;6-3,3-6,6-4;6-4,3-6,6-3"
  },
  {
    "totalGames": 37,
    "winnerGames": 17,
    "loserGames": 20,
    "winPCT": 0.46,
    "eloActual": 0.31,
    "numWays": 2,
    "possibleScores": "6-7,7-5,7-5;7-5,6-7,7-5"
  },
  {
    "totalGames": 24,
    "winnerGames": 11,
    "loserGames": 13,
    "winPCT": 0.46,
    "eloActual": 0.31,
    "numWays": 12,
    "possibleScores": "0-6,6-0,7-5;0-6,7-5,6-0;6-0,0-6,7-5;7-5,0-6,6-0;1-6,6-1,6-4;1-6,6-4,6-1;6-1,1-6,6-4;6-4,1-6,6-1;1-6,6-2,6-3;1-6,6-3,6-2;6-2,1-6,6-3;6-3,1-6,6-2"
  },
  {
    "totalGames": 35,
    "winnerGames": 16,
    "loserGames": 19,
    "winPCT": 0.46,
    "eloActual": 0.3,
    "numWays": 8,
    "possibleScores": "6-3,6-7,7-6;6-7,6-3,7-6;6-7,7-6,6-3;7-6,6-7,6-3;6-4,6-7,7-5;6-7,6-4,7-5;6-7,7-5,6-4;7-5,6-7,6-4"
  },
  {
    "totalGames": 22,
    "winnerGames": 10,
    "loserGames": 12,
    "winPCT": 0.45,
    "eloActual": 0.3,
    "numWays": 20,
    "possibleScores": "0-6,6-0,6-4;0-6,6-4,6-0;6-0,0-6,6-4;6-4,0-6,6-0;0-6,6-1,6-3;0-6,6-3,6-1;6-1,0-6,6-3;6-3,0-6,6-1;0-6,6-2,6-2;6-2,0-6,6-2;5-7,6-2,7-6;5-7,7-6,6-2;6-2,5-7,7-6;7-6,5-7,6-2;5-7,6-3,7-5;5-7,7-5,6-3;6-3,5-7,7-5;7-5,5-7,6-3;6-4,6-7,6-4;6-7,6-4,6-4"
  },
  {
    "totalGames": 31,
    "winnerGames": 14,
    "loserGames": 17,
    "winPCT": 0.45,
    "eloActual": 0.3,
    "numWays": 12,
    "possibleScores": "4-6,6-2,7-6;4-6,7-6,6-2;6-2,4-6,7-6;7-6,4-6,6-2;4-6,6-3,7-5;4-6,7-5,6-3;6-3,4-6,7-5;7-5,4-6,6-3;5-7,6-3,6-4;5-7,6-4,6-3;6-3,5-7,6-4;6-4,5-7,6-3"
  },
  {
    "totalGames": 29,
    "winnerGames": 13,
    "loserGames": 16,
    "winPCT": 0.45,
    "eloActual": 0.3,
    "numWays": 12,
    "possibleScores": "3-6,6-1,7-6;3-6,7-6,6-1;6-1,3-6,7-6;7-6,3-6,6-1;3-6,6-2,7-5;3-6,7-5,6-2;6-2,3-6,7-5;7-5,3-6,6-2;4-6,6-3,6-4;4-6,6-4,6-3;6-3,4-6,6-4;6-4,4-6,6-3"
  },
  {
    "totalGames": 27,
    "winnerGames": 12,
    "loserGames": 15,
    "winPCT": 0.44,
    "eloActual": 0.3,
    "numWays": 14,
    "possibleScores": "2-6,6-0,7-6;2-6,7-6,6-0;6-0,2-6,7-6;7-6,2-6,6-0;2-6,6-1,7-5;2-6,7-5,6-1;6-1,2-6,7-5;7-5,2-6,6-1;3-6,6-2,6-4;3-6,6-4,6-2;6-2,3-6,6-4;6-4,3-6,6-2;3-6,6-3,6-3;6-3,3-6,6-3"
  },
  {
    "totalGames": 34,
    "winnerGames": 15,
    "loserGames": 19,
    "winPCT": 0.44,
    "eloActual": 0.29,
    "numWays": 8,
    "possibleScores": "6-2,6-7,7-6;6-7,6-2,7-6;6-7,7-6,6-2;7-6,6-7,6-2;6-3,6-7,7-5;6-7,6-3,7-5;6-7,7-5,6-3;7-5,6-7,6-3"
  },
  {
    "totalGames": 32,
    "winnerGames": 14,
    "loserGames": 18,
    "winPCT": 0.44,
    "eloActual": 0.29,
    "numWays": 12,
    "possibleScores": "5-7,6-1,7-6;5-7,7-6,6-1;6-1,5-7,7-6;7-6,5-7,6-1;5-7,6-2,7-5;5-7,7-5,6-2;6-2,5-7,7-5;7-5,5-7,6-2;6-3,6-7,6-4;6-4,6-7,6-3;6-7,6-3,6-4;6-7,6-4,6-3"
  },
  {
    "totalGames": 30,
    "winnerGames": 13,
    "loserGames": 17,
    "winPCT": 0.43,
    "eloActual": 0.29,
    "numWays": 14,
    "possibleScores": "4-6,6-1,7-6;4-6,7-6,6-1;6-1,4-6,7-6;7-6,4-6,6-1;4-6,6-2,7-5;4-6,7-5,6-2;6-2,4-6,7-5;7-5,4-6,6-2;5-7,6-2,6-4;5-7,6-4,6-2;6-2,5-7,6-4;6-4,5-7,6-2;5-7,6-3,6-3;6-3,5-7,6-3"
  },
  {
    "totalGames": 21,
    "winnerGames": 9,
    "loserGames": 12,
    "winPCT": 0.43,
    "eloActual": 0.29,
    "numWays": 22,
    "possibleScores": "0-6,6-0,6-3;0-6,6-3,6-0;6-0,0-6,6-3;6-3,0-6,6-0;0-6,6-1,6-2;0-6,6-2,6-1;6-1,0-6,6-2;6-2,0-6,6-1;3-6,6-0,7-6;3-6,7-6,6-0;6-0,3-6,7-6;7-6,3-6,6-0;3-6,6-1,7-5;3-6,7-5,6-1;6-1,3-6,7-5;7-5,3-6,6-1;4-6,6-2,6-4;4-6,6-4,6-2;6-2,4-6,6-4;6-4,4-6,6-2;4-6,6-3,6-3;6-3,4-6,6-3"
  },
  {
    "totalGames": 33,
    "winnerGames": 14,
    "loserGames": 19,
    "winPCT": 0.42,
    "eloActual": 0.28,
    "numWays": 8,
    "possibleScores": "6-1,6-7,7-6;6-7,6-1,7-6;6-7,7-6,6-1;7-6,6-7,6-1;6-2,6-7,7-5;6-7,6-2,7-5;6-7,7-5,6-2;7-5,6-7,6-2"
  },
  {
    "totalGames": 26,
    "winnerGames": 11,
    "loserGames": 15,
    "winPCT": 0.42,
    "eloActual": 0.28,
    "numWays": 12,
    "possibleScores": "2-6,6-0,7-5;2-6,7-5,6-0;6-0,2-6,7-5;7-5,2-6,6-0;3-6,6-1,6-4;3-6,6-4,6-1;6-1,3-6,6-4;6-4,3-6,6-1;3-6,6-2,6-3;3-6,6-3,6-2;6-2,3-6,6-3;6-3,3-6,6-2"
  },
  {
    "totalGames": 31,
    "winnerGames": 13,
    "loserGames": 18,
    "winPCT": 0.42,
    "eloActual": 0.28,
    "numWays": 14,
    "possibleScores": "5-7,6-0,7-6;5-7,7-6,6-0;6-0,5-7,7-6;7-6,5-7,6-0;5-7,6-1,7-5;5-7,7-5,6-1;6-1,5-7,7-5;7-5,5-7,6-1;6-2,6-7,6-4;6-4,6-7,6-2;6-7,6-2,6-4;6-7,6-4,6-2;6-3,6-7,6-3;6-7,6-3,6-3"
  },
  {
    "totalGames": 29,
    "winnerGames": 12,
    "loserGames": 17,
    "winPCT": 0.41,
    "eloActual": 0.28,
    "numWays": 16,
    "possibleScores": "4-6,6-0,7-6;4-6,7-6,6-0;6-0,4-6,7-6;7-6,4-6,6-0;4-6,6-1,7-5;4-6,7-5,6-1;6-1,4-6,7-5;7-5,4-6,6-1;5-7,6-1,6-4;5-7,6-4,6-1;6-1,5-7,6-4;6-4,5-7,6-1;5-7,6-2,6-3;5-7,6-3,6-2;6-2,5-7,6-3;6-3,5-7,6-2"
  },
  {
    "totalGames": 27,
    "winnerGames": 11,
    "loserGames": 16,
    "winPCT": 0.41,
    "eloActual": 0.27,
    "numWays": 12,
    "possibleScores": "3-6,6-0,7-5;3-6,7-5,6-0;6-0,3-6,7-5;7-5,3-6,6-0;4-6,6-1,6-4;4-6,6-4,6-1;6-1,4-6,6-4;6-4,4-6,6-1;4-6,6-2,6-3;4-6,6-3,6-2;6-2,4-6,6-3;6-3,4-6,6-2"
  },
  {
    "totalGames": 32,
    "winnerGames": 13,
    "loserGames": 19,
    "winPCT": 0.41,
    "eloActual": 0.27,
    "numWays": 8,
    "possibleScores": "6-0,6-7,7-6;6-7,6-0,7-6;6-7,7-6,6-0;7-6,6-7,6-0;6-1,6-7,7-5;6-7,6-1,7-5;6-7,7-5,6-1;7-5,6-7,6-1"
  },
  {
    "totalGames": 28,
    "winnerGames": 11,
    "loserGames": 17,
    "winPCT": 0.39,
    "eloActual": 0.26,
    "numWays": 14,
    "possibleScores": "4-6,6-0,7-5;4-6,7-5,6-0;6-0,4-6,7-5;7-5,4-6,6-0;5-7,6-0,6-4;5-7,6-4,6-0;6-0,5-7,6-4;6-4,5-7,6-0;5-7,6-1,6-3;5-7,6-3,6-1;6-1,5-7,6-3;6-3,5-7,6-1;5-7,6-2,6-2;6-2,5-7,6-2"
  },
  {
    "totalGames": 23,
    "winnerGames": 9,
    "loserGames": 14,
    "winPCT": 0.39,
    "eloActual": 0.26,
    "numWays": 8,
    "possibleScores": "2-6,6-0,6-3;2-6,6-3,6-0;6-0,2-6,6-3;6-3,2-6,6-0;2-6,6-1,6-2;2-6,6-2,6-1;6-1,2-6,6-2;6-2,2-6,6-1"
  },
  {
    "totalGames": 31,
    "winnerGames": 12,
    "loserGames": 19,
    "winPCT": 0.39,
    "eloActual": 0.26,
    "numWays": 4,
    "possibleScores": "6-0,6-7,7-5;6-7,6-0,7-5;6-7,7-5,6-0;7-5,6-7,6-0"
  },
  {
    "totalGames": 26,
    "winnerGames": 10,
    "loserGames": 16,
    "winPCT": 0.38,
    "eloActual": 0.26,
    "numWays": 10,
    "possibleScores": "4-6,6-0,6-4;4-6,6-4,6-0;6-0,4-6,6-4;6-4,4-6,6-0;4-6,6-1,6-3;4-6,6-3,6-1;6-1,4-6,6-3;6-3,4-6,6-1;4-6,6-2,6-2;6-2,4-6,6-2"
  },
  {
    "totalGames": 29,
    "winnerGames": 11,
    "loserGames": 18,
    "winPCT": 0.38,
    "eloActual": 0.25,
    "numWays": 10,
    "possibleScores": "6-0,6-7,6-4;6-4,6-7,6-0;6-7,6-0,6-4;6-7,6-4,6-0;6-1,6-7,6-3;6-3,6-7,6-1;6-7,6-1,6-3;6-7,6-3,6-1;6-2,6-7,6-2;6-7,6-2,6-2"
  },
  {
    "totalGames": 24,
    "winnerGames": 9,
    "loserGames": 15,
    "winPCT": 0.38,
    "eloActual": 0.25,
    "numWays": 8,
    "possibleScores": "3-6,6-0,6-3;3-6,6-3,6-0;6-0,3-6,6-3;6-3,3-6,6-0;3-6,6-1,6-2;3-6,6-2,6-1;6-1,3-6,6-2;6-2,3-6,6-1"
  },
  {
    "totalGames": 27,
    "winnerGames": 10,
    "loserGames": 17,
    "winPCT": 0.37,
    "eloActual": 0.25,
    "numWays": 8,
    "possibleScores": "5-7,6-0,6-3;5-7,6-3,6-0;6-0,5-7,6-3;6-3,5-7,6-0;5-7,6-1,6-2;5-7,6-2,6-1;6-1,5-7,6-2;6-2,5-7,6-1"
  },
  {
    "totalGames": 22,
    "winnerGames": 8,
    "loserGames": 14,
    "winPCT": 0.36,
    "eloActual": 0.24,
    "numWays": 6,
    "possibleScores": "2-6,6-0,6-2;2-6,6-2,6-0;6-0,2-6,6-2;6-2,2-6,6-0;2-6,6-1,6-1;6-1,2-6,6-1"
  },
  {
    "totalGames": 25,
    "winnerGames": 9,
    "loserGames": 16,
    "winPCT": 0.36,
    "eloActual": 0.24,
    "numWays": 8,
    "possibleScores": "4-6,6-0,6-3;4-6,6-3,6-0;6-0,4-6,6-3;6-3,4-6,6-0;4-6,6-1,6-2;4-6,6-2,6-1;6-1,4-6,6-2;6-2,4-6,6-1"
  },
  {
    "totalGames": 28,
    "winnerGames": 10,
    "loserGames": 18,
    "winPCT": 0.36,
    "eloActual": 0.24,
    "numWays": 8,
    "possibleScores": "6-0,6-7,6-3;6-3,6-7,6-0;6-7,6-0,6-3;6-7,6-3,6-0;6-1,6-7,6-2;6-2,6-7,6-1;6-7,6-1,6-2;6-7,6-2,6-1"
  },
  {
    "totalGames": 23,
    "winnerGames": 8,
    "loserGames": 15,
    "winPCT": 0.35,
    "eloActual": 0.23,
    "numWays": 6,
    "possibleScores": "3-6,6-0,6-2;3-6,6-2,6-0;6-0,3-6,6-2;6-2,3-6,6-0;3-6,6-1,6-1;6-1,3-6,6-1"
  },
  {
    "totalGames": 26,
    "winnerGames": 9,
    "loserGames": 17,
    "winPCT": 0.35,
    "eloActual": 0.23,
    "numWays": 6,
    "possibleScores": "5-7,6-0,6-2;5-7,6-2,6-0;6-0,5-7,6-2;6-2,5-7,6-0;5-7,6-1,6-1;6-1,5-7,6-1"
  },
  {
    "totalGames": 25,
    "winnerGames": 8,
    "loserGames": 17,
    "winPCT": 0.32,
    "eloActual": 0.21,
    "numWays": 4,
    "possibleScores": "5-7,6-0,6-1;5-7,6-1,6-0;6-0,5-7,6-1;6-1,5-7,6-0"
  },
  {
    "totalGames": 22,
    "winnerGames": 7,
    "loserGames": 15,
    "winPCT": 0.32,
    "eloActual": 0.21,
    "numWays": 4,
    "possibleScores": "3-6,6-0,6-1;3-6,6-1,6-0;6-0,3-6,6-1;6-1,3-6,6-0"
  },
  {
    "totalGames": 26,
    "winnerGames": 8,
    "loserGames": 18,
    "winPCT": 0.31,
    "eloActual": 0.21,
    "numWays": 4,
    "possibleScores": "6-0,6-7,6-1;6-1,6-7,6-0;6-7,6-0,6-1;6-7,6-1,6-0"
  },
  {
    "totalGames": 23,
    "winnerGames": 7,
    "loserGames": 16,
    "winPCT": 0.3,
    "eloActual": 0.2,
    "numWays": 4,
    "possibleScores": "4-6,6-0,6-1;4-6,6-1,6-0;6-0,4-6,6-1;6-1,4-6,6-0"
  },
  {
    "totalGames": 20,
    "winnerGames": 6,
    "loserGames": 14,
    "winPCT": 0.3,
    "eloActual": 0.2,
    "numWays": 2,
    "possibleScores": "2-6,6-0,6-0;6-0,2-6,6-0"
  },
  {
    "totalGames": 24,
    "winnerGames": 7,
    "loserGames": 17,
    "winPCT": 0.29,
    "eloActual": 0.19,
    "numWays": 2,
    "possibleScores": "5-7,6-0,6-0;6-0,5-7,6-0"
  },
  {
    "totalGames": 21,
    "winnerGames": 6,
    "loserGames": 15,
    "winPCT": 0.29,
    "eloActual": 0.19,
    "numWays": 2,
    "possibleScores": "3-6,6-0,6-0;6-0,3-6,6-0"
  },
  {
    "totalGames": 25,
    "winnerGames": 7,
    "loserGames": 18,
    "winPCT": 0.28,
    "eloActual": 0.19,
    "numWays": 2,
    "possibleScores": "6-0,6-7,6-0;6-7,6-0,6-0"
  },
  {
    "totalGames": 22,
    "winnerGames": 6,
    "loserGames": 16,
    "winPCT": 0.27,
    "eloActual": 0.18,
    "numWays": 2,
    "possibleScores": "4-6,6-0,6-0;6-0,4-6,6-0"
  }
];
var twosetloss = [
{
    "totalGames": 26,
    "winnerGames": 12,
    "loserGames": 14,
    "winPCT": 0.46,
    "eloActual": 0.31,
    "numWays": 15,
    "possibleScores": "7-6,7-6;1-6,6-0,7-6;1-6,7-6,6-0;6-0,1-6,7-6;7-6,1-6,6-0;1-6,6-1,7-5;1-6,7-5,6-1;6-1,1-6,7-5;7-5,1-6,6-1;2-6,6-2,6-4;2-6,6-4,6-2;6-2,2-6,6-4;6-4,2-6,6-2;2-6,6-3,6-3;6-3,2-6,6-3"
  },
  {
    "totalGames": 25,
    "winnerGames": 11,
    "loserGames": 14,
    "winPCT": 0.44,
    "eloActual": 0.29,
    "numWays": 14,
    "possibleScores": "7-5,7-6;7-6,7-5;1-6,6-0,7-5;1-6,7-5,6-0;6-0,1-6,7-5;7-5,1-6,6-0;2-6,6-1,6-4;2-6,6-4,6-1;6-1,2-6,6-4;6-4,2-6,6-1;2-6,6-2,6-3;2-6,6-3,6-2;6-2,2-6,6-3;6-3,2-6,6-2"
  },
  {
    "totalGames": 23,
    "winnerGames": 10,
    "loserGames": 13,
    "winPCT": 0.43,
    "eloActual": 0.29,
    "numWays": 12,
    "possibleScores": "6-4,7-6;7-6,6-4;1-6,6-0,6-4;1-6,6-4,6-0;6-0,1-6,6-4;6-4,1-6,6-0;1-6,6-1,6-3;1-6,6-3,6-1;6-1,1-6,6-3;6-3,1-6,6-1;1-6,6-2,6-2;6-2,1-6,6-2"
  },
  {
    "totalGames": 24,
    "winnerGames": 10,
    "loserGames": 14,
    "winPCT": 0.42,
    "eloActual": 0.28,
    "numWays": 11,
    "possibleScores": "7-5,7-5;2-6,6-0,6-4;2-6,6-4,6-0;6-0,2-6,6-4;6-4,2-6,6-0;2-6,6-1,6-3;2-6,6-3,6-1;6-1,2-6,6-3;6-3,2-6,6-1;2-6,6-2,6-2;6-2,2-6,6-2"
  },
  {
    "totalGames": 22,
    "winnerGames": 9,
    "loserGames": 13,
    "winPCT": 0.41,
    "eloActual": 0.27,
    "numWays": 12,
    "possibleScores": "6-3,7-6;7-6,6-3;6-4,7-5;7-5,6-4;1-6,6-0,6-3;1-6,6-3,6-0;6-0,1-6,6-3;6-3,1-6,6-0;1-6,6-1,6-2;1-6,6-2,6-1;6-1,1-6,6-2;6-2,1-6,6-1"
  },
  {
    "totalGames": 20,
    "winnerGames": 8,
    "loserGames": 12,
    "winPCT": 0.4,
    "eloActual": 0.27,
    "numWays": 29,
    "possibleScores": "6-4,6-4;0-6,6-0,6-2;0-6,6-2,6-0;6-0,0-6,6-2;6-2,0-6,6-0;0-6,6-1,6-1;6-1,0-6,6-1;3-6,6-0,6-4;3-6,6-4,6-0;6-0,3-6,6-4;6-4,3-6,6-0;3-6,6-1,6-3;3-6,6-3,6-1;6-1,3-6,6-3;6-3,3-6,6-1;3-6,6-2,6-2;6-2,3-6,6-2;5-7,6-0,7-5;5-7,7-5,6-0;6-0,5-7,7-5;7-5,5-7,6-0;6-1,6-7,6-4;6-4,6-7,6-1;6-7,6-1,6-4;6-7,6-4,6-1;6-2,6-7,6-3;6-3,6-7,6-2;6-7,6-2,6-3;6-7,6-3,6-2"
  },
  {
    "totalGames": 21,
    "winnerGames": 8,
    "loserGames": 13,
    "winPCT": 0.38,
    "eloActual": 0.25,
    "numWays": 10,
    "possibleScores": "6-2,7-6;7-6,6-2;6-3,7-5;7-5,6-3;1-6,6-0,6-2;1-6,6-2,6-0;6-0,1-6,6-2;6-2,1-6,6-0;1-6,6-1,6-1;6-1,1-6,6-1"
  },
  {
    "totalGames": 19,
    "winnerGames": 7,
    "loserGames": 12,
    "winPCT": 0.37,
    "eloActual": 0.25,
    "numWays": 6,
    "possibleScores": "6-3,6-4;6-4,6-3;0-6,6-0,6-1;0-6,6-1,6-0;6-0,0-6,6-1;6-1,0-6,6-0"
  },
  {
    "totalGames": 20,
    "winnerGames": 7,
    "loserGames": 13,
    "winPCT": 0.35,
    "eloActual": 0.23,
    "numWays": 8,
    "possibleScores": "6-1,7-6;7-6,6-1;6-2,7-5;7-5,6-2;1-6,6-0,6-1;1-6,6-1,6-0;6-0,1-6,6-1;6-1,1-6,6-0"
  },
  {
    "totalGames": 18,
    "winnerGames": 6,
    "loserGames": 12,
    "winPCT": 0.33,
    "eloActual": 0.22,
    "numWays": 21,
    "possibleScores": "6-2,6-4;6-4,6-2;6-3,6-3;0-6,6-0,6-0;6-0,0-6,6-0;2-6,6-0,6-1;2-6,6-1,6-0;6-0,2-6,6-1;6-1,2-6,6-0;4-6,6-0,6-2;4-6,6-2,6-0;6-0,4-6,6-2;6-2,4-6,6-0;4-6,6-1,6-1;6-1,4-6,6-1;6-0,6-7,6-2;6-2,6-7,6-0;6-7,6-0,6-2;6-7,6-2,6-0;6-1,6-7,6-1;6-7,6-1,6-1"
  },
  {
    "totalGames": 19,
    "winnerGames": 6,
    "loserGames": 13,
    "winPCT": 0.32,
    "eloActual": 0.21,
    "numWays": 6,
    "possibleScores": "6-0,7-6;7-6,6-0;6-1,7-5;7-5,6-1;1-6,6-0,6-0;6-0,1-6,6-0"
  },
  {
    "totalGames": 17,
    "winnerGames": 5,
    "loserGames": 12,
    "winPCT": 0.29,
    "eloActual": 0.2,
    "numWays": 4,
    "possibleScores": "6-1,6-4;6-4,6-1;6-2,6-3;6-3,6-2"
  },
  {
    "totalGames": 18,
    "winnerGames": 5,
    "loserGames": 13,
    "winPCT": 0.28,
    "eloActual": 0.19,
    "numWays": 2,
    "possibleScores": "6-0,7-5;7-5,6-0"
  },
  {
    "totalGames": 16,
    "winnerGames": 4,
    "loserGames": 12,
    "winPCT": 0.25,
    "eloActual": 0.17,
    "numWays": 5,
    "possibleScores": "6-0,6-4;6-4,6-0;6-1,6-3;6-3,6-1;6-2,6-2"
  },
  {
    "totalGames": 15,
    "winnerGames": 3,
    "loserGames": 12,
    "winPCT": 0.2,
    "eloActual": 0.13,
    "numWays": 4,
    "possibleScores": "6-0,6-3;6-3,6-0;6-1,6-2;6-2,6-1"
  },
  {
    "totalGames": 14,
    "winnerGames": 2,
    "loserGames": 12,
    "winPCT": 0.14,
    "eloActual": 0.1,
    "numWays": 3,
    "possibleScores": "6-0,6-2;6-2,6-0;6-1,6-1"
  },
  {
    "totalGames": 13,
    "winnerGames": 1,
    "loserGames": 12,
    "winPCT": 0.08,
    "eloActual": 0.05,
    "numWays": 2,
    "possibleScores": "6-0,6-1;6-1,6-0"
  },
  {
    "totalGames": 12,
    "winnerGames": 0,
    "loserGames": 12,
    "winPCT": 0,
    "eloActual": 0,
    "numWays": 1,
    "possibleScores": "6-0,6-0"
  }
];
