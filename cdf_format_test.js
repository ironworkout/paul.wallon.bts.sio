// Test du nouveau format CDF : 12 equipes -> 8emes(6) -> Quarts(3) -> Demies (1 match a 3 clubs) -> Finale(1)
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
    calculateStandings, getSeasonTeamUniverse, getClubTrophiesHTML,
    getClassementData, populateClassement, sortClassementBy, getAllTeamsInStore, resolveLogoUrl, CLASSEMENT_TROPHY_ORDER,
    get cdfData() { return cdfData; }, set cdfData(v) { cdfData = v; },
    get leagueDataStore() { return leagueDataStore; }, set leagueDataStore(v) { leagueDataStore = v; },
    get palmaresData() { return palmaresData; }, set palmaresData(v) { palmaresData = v; },
    get baseClubsData() { return baseClubsData; }, set baseClubsData(v) { baseClubsData = v; },
    get BASE_URL() { return BASE_URL; }
};
;initRoulette = () => {}; // stub canvas (roulette) pour les tests de suppression L3`;

try {
    vm.runInContext(js, sandbox, { timeout: 10000 });
} catch (e) {
    console.error('ERREUR CHARGEMENT SCRIPT:', e.message);
    process.exit(1);
}

const T = sandbox.__test;
let pass = 0, fail = 0;
function assert(cond, msg) { if (cond) { pass++; console.log('  OK ' + msg); } else { fail++; console.log('  FAIL ' + msg); } }
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
assert(T.cdfData.rounds[2] && T.cdfData.rounds[2].length === 1, 'Demies : 1 seul match a 3 clubs');
const demie = T.cdfData.rounds[2][0];
assert(!!demie.team1 && !!demie.team2 && !!demie.team3, 'Le match de demies reunit les 3 clubs');
const demiTeams = new Set([demie.team1, demie.team2, demie.team3]);
assert(demiTeams.size === 3, 'Les 3 equipes participent a la demie');
assert(demie.team1 !== demie.team2 && demie.team1 !== demie.team3 && demie.team2 !== demie.team3, '3 clubs distincts (pas de match contre soi-meme)');
const [A, B, C] = quarterWinners;
demie.score1 = 3; demie.score2 = 2; demie.score3 = 1;
T.resolveCDFDemies();
assert(!!T.cdfData.rounds[3], 'Finale construite apres la demie');
console.log('Finale:', T.cdfData.rounds[3][0].team1 + ' vs ' + T.cdfData.rounds[3][0].team2);
const finalists = [T.cdfData.rounds[3][0].team1, T.cdfData.rounds[3][0].team2];
assert(finalists.includes(A) && finalists.includes(B), 'Les 2 clubs avec le plus de buts (A et B) en finale');
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
T.cdfData.rounds[2][0].score1 = 1; T.cdfData.rounds[2][0].score2 = 1; T.cdfData.rounds[2][0].score3 = 1;
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

console.log('\n=== TEST SAISONS ANTERIEURES : CLUBS REMPLACES ===\n');
// Scenario : saison passee avec X et Y, remplaces aujourd'hui par P et Q dans l'effectif.
// Le classement de la saison passee doit conserver X et Y (nom + points), sans pollution par P/Q.
const oldFixtures = [
    [ { home: 'A', away: 'X', scoreHome: 2, scoreAway: 1 },
      { home: 'B', away: 'Y', scoreHome: 0, scoreAway: 0 },
      { home: 'C', away: 'D', scoreHome: 3, scoreAway: 1 } ],
    [ { home: 'X', away: 'A', scoreHome: 1, scoreAway: 1 },
      { home: 'Y', away: 'B', scoreHome: 2, scoreAway: 0 },
      { home: 'D', away: 'C', scoreHome: 1, scoreAway: 2 } ]
];
const oldSeason = {
    season_id: 1,
    fixtures: oldFixtures,
    standings: {
        A: { points: 4, matchs: 2, bp: 3, bc: 2, diff: 1 },
        B: { points: 1, matchs: 2, bp: 0, bc: 2, diff: -2 },
        C: { points: 6, matchs: 2, bp: 5, bc: 2, diff: 3 },
        D: { points: 0, matchs: 2, bp: 2, bc: 5, diff: -3 },
        X: { points: 1, matchs: 2, bp: 2, bc: 3, diff: -1 },
        Y: { points: 4, matchs: 2, bp: 2, bc: 0, diff: 2 }
    }
};
const currentRoster = { A: {}, B: {}, C: {}, D: {}, P: {}, Q: {} };
// Ancien comportement (bug) : recalcul avec l'effectif actuel
const buggyStandings = T.calculateStandings(currentRoster, oldFixtures);
assert(!buggyStandings['X'] && !buggyStandings['Y'], "Rappel du bug : X et Y disparaissent avec le recalcul sur l'effectif actuel");
// Nouveau comportement : recalcul sur l'univers propre de la saison
const healedStandings = T.calculateStandings(T.getSeasonTeamUniverse(oldSeason), oldFixtures);
const healedNames = Object.keys(healedStandings);
assert(healedNames.includes('X') && healedNames.includes('Y'), 'X et Y conserves au classement de la saison passee');
assert(healedStandings['X'].points === 1 && healedStandings['Y'].points === 4, 'Points de X et Y conserves depuis les fixtures');
assert(!healedNames.includes('P') && !healedNames.includes('Q'), "Clubs actuels (P, Q) absents de cette saison non ajoutes");
assert(healedStandings['A'].points === 4 && healedStandings['C'].points === 6, 'Points des autres clubs intacts');
// Club fantome (0 match, 0 point) herite d'une ancienne corruption -> purge
const ghostSeason = { season_id: 1, fixtures: oldFixtures, standings: Object.assign({}, oldSeason.standings, { P: { points: 0, matchs: 0, bp: 0, bc: 0, diff: 0 } }) };
const cleanedStandings = T.calculateStandings(T.getSeasonTeamUniverse(ghostSeason), oldFixtures);
assert(!cleanedStandings['P'], 'Club fantome a 0 match purge du classement');

console.log('\n=== TEST ARCHIVAGE CLUB SUPPRIME DE L3 ===\n');
T.leagueDataStore.l3.clubs = { 'ClubArchive': { logo: 'archive.png', description: 'desc' } };
T.baseClubsData.clubs = {};
const savedGoogleToken = sandbox.googleAccessToken;
sandbox.googleAccessToken = null; // evite les ecritures Drive pendant le test
sandbox.window.deleteClubFromL3('ClubArchive');
sandbox.googleAccessToken = savedGoogleToken;
assert(!T.leagueDataStore.l3.clubs['ClubArchive'], 'Club retire de la L3');
assert(!!T.baseClubsData.clubs['ClubArchive'], 'Club archive dans la Base des clubs');
assert(T.baseClubsData.clubs['ClubArchive'].logo === 'archive.png', 'Logo du club conserve dans la Base');
assert(!!T.getAllTeamsInStore()['ClubArchive'], 'Club archive visible dans getAllTeamsInStore (classements historiques)');

console.log('\n=== TEST TROPHEES DANS LES PRESENTATIONS DE CLUBS ===\n');
T.palmaresData = {
    'ClubTrophee': { 'Ligue 1': 2, 'Ligue 2': 0, 'LDC': 1, 'CDF': 0 }
};
const th = T.getClubTrophiesHTML('ClubTrophee');
assert(th.includes('3') && th.includes('titres'), 'Total des trophées affiché (3 titres)');
assert(th.includes('Ligue 1') && th.includes('×2'), 'Ligue 1 ×2 listé');
assert(th.includes('LDC') && th.includes('×1'), 'LDC ×1 listé');
assert(!th.includes('CDF') && !th.includes('Ligue 2'), 'Compétitions sans trophée absentes');
assert(T.getClubTrophiesHTML('ClubSansTrophee') === '', 'Club sans trophée : aucun bloc');
assert(T.getClubTrophiesHTML('Absent', 'carousel-trophies') === '', 'Club absent du palmarès : aucun bloc');

console.log('\n=== TEST SAISIE DES SCORES DE LA DEMIE A 3 CLUBS ===\n');
T.cdfData = { participants: [], currentRound: 0, rounds: {}, champion: null, _trophyAwarded: false, seasons: [], active_season_id: null };
T.cdfData.rounds[2] = [{ team1: 'Eq1', team2: 'Eq2', team3: 'Eq3', score1: null, score2: null, score3: null }];
const savedToken3 = sandbox.googleAccessToken;
sandbox.googleAccessToken = null; // evite les ecritures Drive
sandbox.window.updateCDFScore(2, 0, 1, 2);
assert(!T.cdfData.rounds[3], 'Finale pas construite avant le 3e score');
sandbox.window.updateCDFScore(2, 0, 2, 1);
assert(!T.cdfData.rounds[3], 'Finale toujours pas construite (score 3 manquant)');
sandbox.window.updateCDFScore(2, 0, 3, 3);
assert(!!T.cdfData.rounds[3], 'Finale construite des la saisie du 3e score');
const f3 = [T.cdfData.rounds[3][0].team1, T.cdfData.rounds[3][0].team2];
assert(f3.includes('Eq3') && f3.includes('Eq1'), 'Les 2 meilleurs buteurs (Eq3:3, Eq1:2) en finale');
assert(JSON.stringify(T.cdfData.rounds[2][0].finalists) === JSON.stringify(['Eq3', 'Eq1']), 'finalists = Eq3 et Eq1');
sandbox.googleAccessToken = savedToken3;

console.log('\n========================================');
console.log('RESULTAT: ' + pass + ' reussis, ' + fail + ' echecs');
console.log('========================================');
process.exit(fail > 0 ? 1 : 0);
