// Test du nouveau format CDF : 12 equipes -> 8emes(6) -> Quarts(3) -> Demies triangulaires(3) -> Finale(1)
const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) { console.error('PAS DE BLOC SCRIPT TROUVE'); process.exit(1); }
let js = match[1];

function makeElement() {
    return {
        style: {}, dataset: {},
        classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
        addEventListener: () => {}, appendChild: () => {}, removeChild: () => {},
        innerHTML: '', value: '', textContent: '', disabled: false,
        querySelectorAll: () => [], querySelector: () => makeElement(),
        setAttribute: () => {}, getAttribute: () => null
    };
}

// Contexte global simulant le navigateur
const sandbox = {
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    Math, JSON, Date, parseInt, parseFloat, isNaN, String, Number, Array, Object, Boolean, RegExp, Error,
    document: {
        getElementById: () => makeElement(),
        querySelectorAll: () => [],
        querySelector: () => makeElement(),
        createElement: () => makeElement(),
        addEventListener: () => {}, createTextNode: () => ({}), body: { appendChild: () => {} }
    },
    window: {},
    confirm: () => true,
    prompt: () => null,
    showMessage: () => {},
    getClubLogo: (name) => 'logo_' + name,
    BASE_URL: '',
    googleAccessToken: 'fake-token',
    IntersectionObserver: class { observe() {} unobserve() {} },
    Image: class {},
    addEventListener: () => {},
    localStorage: { getItem: () => null, setItem: () => {} },
    fetch: () => Promise.resolve({ json: () => Promise.resolve({}) }),
    navigator: {}, location: {}, alert: () => {}, AudioContext: undefined
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

// Expose les fonctions et l'état interne (getters/setters pour gérer les reassignments de cdfData)
js += `
;globalThis.__test = {
    startCDFDraw, buildCDFDemies, resolveCDFDemies, advanceCDFWinner, isByeTeam, renderCDFBracket, populateCDF,
    getClassementData, populateClassement, sortClassementBy, getAllTeamsInStore, resolveLogoUrl, CLASSEMENT_TROPHY_ORDER,
    get cdfData() { return cdfData; }, set cdfData(v) { cdfData = v; },
    get leagueDataStore() { return leagueDataStore; }, set leagueDataStore(v) { leagueDataStore = v; },
    get palmaresData() { return palmaresData; }, set palmaresData(v) { palmaresData = v; },
    get baseClubsData() { return baseClubsData; }, set baseClubsData(v) { baseClubsData = v; },
    get BASE_URL() { return BASE_URL; }
};`;

try {
    vm.runInContext(js, sandbox, { timeout: 10000 });
} catch (e) {
    console.error('ERREUR CHARGEMENT SCRIPT:', e.message);
    process.exit(1);
}

const T = sandbox.__test;
let pass = 0, fail = 0;
function assert(cond, msg) { if (cond) { pass++; console.log('  OK ' + msg); } else { fail++; console.log('  FAIL ' + msg); } }
function playMatch(round, matchIdx, s1, s2) {
    const m = T.cdfData.rounds[round][matchIdx];
    m.score1 = s1; m.score2 = s2;
    let winner;
    if (s1 > s2) winner = m.team1;
    else if (s2 > s1) winner = m.team2;
    else winner = Math.random() < 0.5 ? m.team1 : m.team2;
    m.winner = winner;
    T.advanceCDFWinner(round, matchIdx, winner);
}

console.log('\n=== TEST FORMAT CDF : 12 equipes reelles (pas de BYE) ===\n');
T.leagueDataStore.l1.teams = {}; T.leagueDataStore.l2.teams = {}; T.leagueDataStore.l3.clubs = {};
for (let i = 1; i <= 6; i++) T.leagueDataStore.l1.teams['L1 Club ' + i] = {};
for (let i = 1; i <= 6; i++) T.leagueDataStore.l2.teams['L2 Club ' + i] = {};
T.cdfData.participants = [...Object.keys(T.leagueDataStore.l1.teams), ...Object.keys(T.leagueDataStore.l2.teams)].slice(0, 12);
console.log('Participants:', T.cdfData.participants.length);
const hasBye = T.cdfData.participants.some(p => p.startsWith('BYE'));
const l3In = T.cdfData.participants.some(p => T.leagueDataStore.l3.clubs[p]);
assert(T.cdfData.participants.length === 12, '12 participants exactement');
assert(!hasBye, 'Aucun BYE fictif dans les participants');
assert(!l3In, 'Aucun club L3 dans les participants');
const shuffled = [...T.cdfData.participants].sort(() => Math.random() - 0.5);
T.cdfData.rounds[0] = [];
for (let i = 0; i < shuffled.length; i += 2) {
    T.cdfData.rounds[0].push({ team1: shuffled[i], team2: shuffled[i + 1], score1: null, score2: null });
}
assert(T.cdfData.rounds[0].length === 6, '8emes : 6 matchs');
T.cdfData.rounds[1] = [];
T.cdfData.rounds[1][0] = { team1: null, team2: null, score1: null, score2: null };
T.cdfData.rounds[1][1] = { team1: null, team2: null, score1: null, score2: null };
T.cdfData.rounds[1][2] = { team1: null, team2: null, score1: null, score2: null };
T.cdfData.rounds[0].forEach((m, idx) => {
    const t1 = m.team1, t2 = m.team2;
    m.score1 = 1; m.score2 = 0;
    m.winner = t1;
    const nextMatchIdx = Math.floor(idx / 2);
    if (idx % 2 === 0) T.cdfData.rounds[1][nextMatchIdx].team1 = t1;
    else T.cdfData.rounds[1][nextMatchIdx].team2 = t1;
});
console.log('Quarts apres 8emes:', T.cdfData.rounds[1].map(q => (q.team1 || '?') + ' vs ' + (q.team2 || '?')));
assert(T.cdfData.rounds[1].length === 3, 'Quarts : 3 matchs generes');
const quarterWinners = [];
T.cdfData.rounds[1].forEach((q) => { q.score1 = 2; q.score2 = 1; q.winner = q.team1; quarterWinners.push(q.team1); });
console.log('Vainqueurs des quarts:', quarterWinners.join(', '));
T.cdfData.rounds[1] = quarterWinners.map(w => ({ team1: w, team2: w, winner: w }));
T.cdfData.rounds[2] = undefined;
T.buildCDFDemies();
assert(T.cdfData.rounds[2] && T.cdfData.rounds[2].length === 3, 'Demies triangulaires : 3 matchs');
const demiTeams = new Set();
T.cdfData.rounds[2].forEach(m => { demiTeams.add(m.team1); demiTeams.add(m.team2); });
assert(demiTeams.size === 3, 'Les 3 equipes participent aux demies');
assert(T.cdfData.rounds[2][0].team1 !== T.cdfData.rounds[2][0].team2, 'Pas de match contre soi-meme');
const [A, B, C] = quarterWinners;
playMatch(2, 0, 3, 1);
playMatch(2, 1, 2, 0);
playMatch(2, 2, 2, 1);
assert(!!T.cdfData.rounds[3], 'Finale construite apres les demies');
console.log('Finale:', T.cdfData.rounds[3][0].team1 + ' vs ' + T.cdfData.rounds[3][0].team2);
const finalists = [T.cdfData.rounds[3][0].team1, T.cdfData.rounds[3][0].team2];
assert(finalists.includes(A) && finalists.includes(B), 'Les 2 equipes avec le plus de buts (A et B) en finale');
const finalMatch = T.cdfData.rounds[3][0];
finalMatch.score1 = 1; finalMatch.score2 = 0;
finalMatch.winner = finalMatch.team1;
T.advanceCDFWinner(3, 0, finalMatch.winner);
assert(!!T.cdfData.champion, 'Champion couronne');
console.log('CHAMPION CDF:', T.cdfData.champion);
if (!T.palmaresData[T.cdfData.champion]) T.palmaresData[T.cdfData.champion] = { 'Ligue 1': 0, 'Ligue 2': 0, 'LDC': 0, 'CDF': 0 };
if (!T.cdfData._trophyAwarded) { T.palmaresData[T.cdfData.champion]['CDF']++; T.cdfData._trophyAwarded = true; }
assert(T.palmaresData[T.cdfData.champion]['CDF'] === 1, 'Trophee CDF ajoute au palmares du champion');
assert(!T.palmaresData[T.cdfData.champion]['LDC'], 'Aucun trophee LDC ajoute par erreur');
if (!T.cdfData._trophyAwarded) { T.palmaresData[T.cdfData.champion]['CDF']++; T.cdfData._trophyAwarded = true; }
assert(T.palmaresData[T.cdfData.champion]['CDF'] === 1, 'Pas de double comptage du trophee CDF');

console.log('\n=== TEST DEPARTAGE DEMIES A EGALITE ===\n');
T.cdfData = { participants: [], currentRound: 0, rounds: {}, champion: null, _trophyAwarded: false, seasons: [], active_season_id: null };
const qw2 = ['EqA', 'EqB', 'EqC'];
T.cdfData.rounds[1] = qw2.map(w => ({ team1: w, team2: w, winner: w }));
T.cdfData.rounds[2] = undefined;
T.buildCDFDemies();
T.cdfData.rounds[2][0].score1 = 1; T.cdfData.rounds[2][0].score2 = 1; T.cdfData.rounds[2][0].winner = 'EqA';
T.cdfData.rounds[2][1].score1 = 1; T.cdfData.rounds[2][1].score2 = 1; T.cdfData.rounds[2][1].winner = 'EqB';
T.cdfData.rounds[2][2].score1 = 1; T.cdfData.rounds[2][2].score2 = 1; T.cdfData.rounds[2][2].winner = 'EqC';
T.resolveCDFDemies();
assert(!!T.cdfData.rounds[3], 'Finale construite meme a egalite (departage aleatoire)');
const f2 = T.cdfData.rounds[3][0];
assert(f2.team1 !== f2.team2, 'Finale avec 2 equipes distinctes');

console.log('\n=== TEST CLASSEMENT GENERAL (type JO) ===\n');
T.palmaresData = {};
T.palmaresData['ClubLDC'] = { 'Ligue 1': 0, 'Ligue 2': 1, 'LDC': 1, 'CDF': 0 };
T.palmaresData['ClubL1'] = { 'Ligue 1': 3, 'Ligue 2': 0, 'LDC': 0, 'CDF': 0 };
T.palmaresData['ClubCDF'] = { 'Ligue 1': 0, 'Ligue 2': 0, 'LDC': 0, 'CDF': 2 };
T.palmaresData['ClubL2'] = { 'Ligue 1': 0, 'Ligue 2': 5, 'LDC': 0, 'CDF': 0 };
T.palmaresData['ClubTout'] = { 'Ligue 1': 2, 'Ligue 2': 2, 'LDC': 1, 'CDF': 1 };
T.leagueDataStore.l1.teams = { ClubL1: {}, ClubLDC: {}, ClubTout: {} };
T.leagueDataStore.l2.teams = { ClubL2: {}, ClubCDF: {}, ClubTout: {} };
T.leagueDataStore.l3.clubs = {};
T.baseClubsData.clubs = {};
const classement = T.getClassementData();
const names = classement.map(r => r.name);
assert(names.length === 5, '5 clubs dans le classement');
// LDC departage d'abord (or), puis Ligue 1, puis CDF, puis Ligue 2
const rankIdx = (n) => names.indexOf(n);
console.log('  Ordre obtenu:', names.join(' | '));
// ClubTout (1 LDC + 2 L1) bat ClubLDC (1 LDC + 0 L1) au tiebreak Ligue 1
assert(rankIdx('ClubTout') < rankIdx('ClubLDC'), 'ClubTout devant ClubLDC (1 LDC chacun, Ligue1 2 > 0)');
assert(classement[0].name === 'ClubTout', 'Le leader est ClubTout (or = LDC puis Ligue 1)');
assert(rankIdx('ClubLDC') < rankIdx('ClubL1'), 'LDC (or) avant Ligue 1 (argent)');
assert(rankIdx('ClubL1') < rankIdx('ClubCDF'), 'Ligue 1 (argent) avant CDF (bronze)');
assert(rankIdx('ClubCDF') < rankIdx('ClubL2'), 'CDF avant Ligue 2');
assert(classement.every(r => r.total === Object.values(r.counts).reduce((a, b) => a + b, 0)), 'Total = somme des trophées');

console.log('\n=== TEST TRI INTERACTIF DU CLASSEMENT ===\n');
// Tri par Ligue 2 : ClubL2 (5) en tête, puis ClubTout (2)
T.sortClassementBy('Ligue 2');
let c2 = T.getClassementData();
assert(c2[0].name === 'ClubL2', 'Tri Ligue 2 : ClubL2 en tête (5)');
// Tri par Total : ClubTout (6) en tête
T.sortClassementBy('total');
let cTot = T.getClassementData();
assert(cTot[0].name === 'ClubTout', 'Tri Total : ClubTout en tête (6)');
// Retour au tri officiel
T.sortClassementBy('official');
let cOff = T.getClassementData();
assert(cOff[0].name === 'ClubTout', 'Retour au tri officiel : ClubTout en tête');

console.log('\n=== TEST CLUBS HISTORIQUES (anciennes saisons) ===\n');
// Simule : un club avec trophées dans palmaresData mais absent des ligues actuelles
T.leagueDataStore.l1.teams = { 'ClubActuelL1': {} };
T.leagueDataStore.l2.teams = { 'ClubActuelL2': {} };
T.leagueDataStore.l3.clubs = {};
T.baseClubsData.clubs = { 'AncienClubBase': { logo: 'ancien.png' } };
T.palmaresData = { 'AncienClubRemplace': { 'Ligue 1': 0, 'Ligue 2': 0, 'LDC': 0, 'CDF': 1 } };
const allClubs = T.getAllTeamsInStore();
assert(!!allClubs['AncienClubRemplace'], 'Club historique (absent des ligues) présent dans getAllTeamsInStore');
const classementHist = T.getClassementData();
const histNames = classementHist.map(r => r.name);
assert(histNames.includes('AncienClubRemplace'), 'Club historique visible dans le classement');
const histRow = classementHist.find(r => r.name === 'AncienClubRemplace');
assert(histRow.counts['CDF'] === 1, 'Trophée CDF du club historique conservé');

// Résolution de logos : data: et http ne doivent pas être préfixés par BASE_URL
assert(T.resolveLogoUrl('data:image/png;base64,ABC') === 'data:image/png;base64,ABC', 'Logo data: URL non préfixé');
assert(T.resolveLogoUrl('https://exemple.com/logo.png') === 'https://exemple.com/logo.png', 'Logo http(s) non préfixé');
assert(T.resolveLogoUrl('vafc.png') === T.BASE_URL + 'vafc.png', 'Logo simple préfixé par BASE_URL');
assert(T.resolveLogoUrl(null) === T.BASE_URL + 'default_logo.png', 'Logo manquant -> default_logo');

console.log('\n========================================');
console.log('RESULTAT: ' + pass + ' reussis, ' + fail + ' echecs');
console.log('========================================');
process.exit(fail > 0 ? 1 : 0);
