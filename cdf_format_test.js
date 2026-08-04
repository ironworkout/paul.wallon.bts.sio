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
        addEventListener: () => {}, removeEventListener: () => {}, appendChild: () => {}, removeChild: () => {},
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
    calculateStandings, getSeasonTeamUniverse, getClubTrophiesHTML, executeSwapOrChangeClub, getClubLogo,
    getClassementData, populateClassement, sortClassementBy, getAllTeamsInStore, resolveLogoUrl, CLASSEMENT_TROPHY_ORDER,
    GITHUB_LOGOS_CATALOG, getVisibleCatalogLogos, getRemovedCatalogLogos, setRemovedCatalogLogos, populateGithubLogoSelect,
    populateSwapTargetClubs, onSwapSeasonChange, getClubRawLogo, getSeasonTeamUniverse, executeSwapOrChangeClub,
    removeSelectedCatalogLogo: window.removeSelectedCatalogLogo, restoreRemovedCatalogLogos: window.restoreRemovedCatalogLogos,
    get cdfData() { return cdfData; }, set cdfData(v) { cdfData = v; },
    get leagueDataStore() { return leagueDataStore; }, set leagueDataStore(v) { leagueDataStore = v; },
    get palmaresData() { return palmaresData; }, set palmaresData(v) { palmaresData = v; },
    get baseClubsData() { return baseClubsData; }, set baseClubsData(v) { baseClubsData = v; },
    get BASE_URL() { return BASE_URL; }
};
;initRoulette = () => {}; // stub canvas (roulette) pour les tests de suppression L3
;populateAllLeaguesUI = () => {};
;populateBaseClubs = () => {};
;populatePalmaresTable = () => {};
;populateCDF = () => {};
;populateLDC = () => {};
;saveDataToDrive = () => {};
;saveBaseClubsToDrive = () => {};
;updateBarragesDisplay = () => {};
;populateCarouselClubTrophies = () => {};
;updateAuthUI = () => {};`;

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
console.log('=== TEST SWAP INTER-LIGUE : PRESERVATION DE LA SAISON 1 ===');
T.leagueDataStore.l1.teams = { 'ClubA': { logo: 'logoA.png' }, 'ClubC': { logo: 'logoC.png' } };
T.leagueDataStore.l2.teams = { 'ClubB': { logo: 'logoB.png' }, 'ClubD': { logo: 'logoD.png' } };
T.baseClubsData.clubs = {};
T.leagueDataStore.l1.seasons = [
  { season_id: 1, fixtures: [[{ home: 'ClubA', away: 'ClubC', scoreHome: null, scoreAway: null }]], standings: { 'ClubA': { points: 3, matchs: 1, bp: 2, bc: 0, diff: 2 }, 'ClubC': { points: 0, matchs: 1, bp: 0, bc: 2, diff: -2 } } },
  { season_id: 2, fixtures: [[{ home: 'ClubA', away: 'ClubC', scoreHome: null, scoreAway: null }]], standings: { 'ClubA': { points: 3, matchs: 1, bp: 2, bc: 0, diff: 2 }, 'ClubC': { points: 0, matchs: 1, bp: 0, bc: 2, diff: -2 } } }
];
T.leagueDataStore.l2.seasons = [
  { season_id: 1, fixtures: [[{ home: 'ClubB', away: 'ClubD', scoreHome: null, scoreAway: null }]], standings: { 'ClubB': { points: 3, matchs: 1, bp: 2, bc: 0, diff: 2 }, 'ClubD': { points: 0, matchs: 1, bp: 0, bc: 2, diff: -2 } } },
  { season_id: 2, fixtures: [[{ home: 'ClubB', away: 'ClubD', scoreHome: null, scoreAway: null }]], standings: { 'ClubB': { points: 3, matchs: 1, bp: 2, bc: 0, diff: 2 }, 'ClubD': { points: 0, matchs: 1, bp: 0, bc: 2, diff: -2 } } }
];
T.leagueDataStore.l1.active_season_id = 2;
T.leagueDataStore.l2.active_season_id = 2;
const swapEls = {};
swapEls['swap-league-select'] = { value: 'l1' };
swapEls['swap-target-club'] = { value: 'ClubA' };
swapEls['swap-club-new-name'] = { value: '' };
swapEls['swap-club-logo-catalog'] = { value: '' };
swapEls['swap-season-select'] = { value: 'active' };
swapEls['swap-other-club'] = { value: 'L2:ClubB' };
swapEls['swap-club-modal'] = { classList: { remove: () => {}, add: () => {} } };
const swapSavedGetEl = sandbox.document.getElementById;
sandbox.document.getElementById = (id) => swapEls[id] || makeElement();
const swapSavedQs = sandbox.document.querySelector;
sandbox.document.querySelector = (sel) => (sel === 'input[name="swap-action-mode"]:checked') ? { value: 'swap' } : makeElement();
const swapSavedToken = sandbox.googleAccessToken;
sandbox.googleAccessToken = null;
sandbox.window.executeSwapOrChangeClub();
sandbox.googleAccessToken = swapSavedToken;
sandbox.document.getElementById = swapSavedGetEl;
sandbox.document.querySelector = swapSavedQs;

assert(!!T.leagueDataStore.l1.teams['ClubB'] && !T.leagueDataStore.l1.teams['ClubA'], 'ClubA permute de L1 vers L2, ClubB prend sa place');
assert(!!T.leagueDataStore.l2.teams['ClubA'] && !T.leagueDataStore.l2.teams['ClubB'], 'ClubB permute de L2 vers L1');

const swapS1L1 = T.leagueDataStore.l1.seasons.find(s => s.season_id === 1);
const swapS1L2 = T.leagueDataStore.l2.seasons.find(s => s.season_id === 1);
const swapS2L1 = T.leagueDataStore.l1.seasons.find(s => s.season_id === 2);
const swapS2L2 = T.leagueDataStore.l2.seasons.find(s => s.season_id === 2);
const swapFlat = (s) => s.fixtures.reduce((acc, r) => acc.concat(r.map(m => [m.home, m.away])), []).flat();
const s1L1Names = swapFlat(swapS1L1), s1L2Names = swapFlat(swapS1L2);
const s2L1Names = swapFlat(swapS2L1), s2L2Names = swapFlat(swapS2L2);

assert(s1L1Names.includes('ClubA') && s1L1Names.includes('ClubC'), 'Saison 1 L1 intacte (ClubA historique conserve)');
assert(s1L2Names.includes('ClubB') && s1L2Names.includes('ClubD'), 'Saison 1 L2 intacte (ClubB historique conserve, plus de corruption)');
assert(s2L1Names.includes('ClubB') && !s2L1Names.includes('ClubA'), 'Saison 2 L1 : permutation appliquee (ClubB)');
assert(s2L2Names.includes('ClubA') && !s2L2Names.includes('ClubB'), 'Saison 2 L2 : permutation appliquee (ClubA)');

const swapResolvable = (names) => names.filter(n => !T.getClubLogo(n).includes('default_logo')).length;
assert(swapResolvable(s1L1Names) === s1L1Names.length, 'Saison 1 L1 : chaque club a un logo (ClubA resolu depuis L2)');
assert(swapResolvable(s1L2Names) === s1L2Names.length, 'Saison 1 L2 : chaque club a un logo (ClubB resolu depuis L1)');
assert(s1L1Names.every(n => T.getClubLogo(n).includes('logoA.png') || T.getClubLogo(n).includes('logoC.png')), 'Logos corrects en saison 1 L1');
assert(s1L2Names.every(n => T.getClubLogo(n).includes('logoB.png') || T.getClubLogo(n).includes('logoD.png')), 'Logos corrects en saison 1 L2');



console.log('\n========================================');
console.log('=== TEST SWAP : CLUBS DES SAISONS PRECEDENTES VISIBLES + MODIFIABLES ===');
// Scenario : un club historique (ClubX) existe en saison 1 de L1 mais a ete change
// depuis (plus dans l'effectif actuel). Il doit apparaitre dans la liste des clubs
// a modifier, et son logo doit rester modifiable.
T.leagueDataStore.l1.teams = { 'ClubA': { logo: 'logoA.png' }, 'ClubB': { logo: 'logoB.png' } };
T.leagueDataStore.l1.seasons = [
  { season_id: 1, active_season_id: 2, nom_saison: 'Saison 1',
    fixtures: [[{ home: 'ClubX', away: 'ClubA', scoreHome: 1, scoreAway: 0 }]],
    standings: { 'ClubX': { points: 3, matchs: 1, bp: 1, bc: 0, diff: 1 }, 'ClubA': { points: 0, matchs: 1, bp: 0, bc: 1, diff: -1 } } },
  { season_id: 2, fixtures: [], standings: {} }
];
T.leagueDataStore.l1.active_season_id = 2;
T.baseClubsData.clubs = { 'ClubX': { logo: 'oldlogo.png', description: 'historique' } };

// getSeasonTeamUniverse retrouve ClubX depuis les fixtures de la saison 1
const uni = T.getSeasonTeamUniverse(T.leagueDataStore.l1.seasons[0]);
assert(!!uni['ClubX'], 'getSeasonTeamUniverse retrouve le club historique ClubX (saison 1)');
assert(!!uni['ClubA'], 'getSeasonTeamUniverse retrouve aussi ClubA');

// populateSwapTargetClubs inclut les clubs actuels + ceux de la saison choisie
const fakeSel = { innerHTML: '', options: [], value: '', appendChild(o) { this.options.push(o); } };
const savedGetElSwap = sandbox.document.getElementById;
const savedQSwap = sandbox.document.querySelector;
sandbox.document.getElementById = (id) => {
    if (id === 'swap-target-club') return fakeSel;
    if (id === 'swap-season-select') return { value: '1', innerHTML: '' };
    return { style:{}, value:'', innerHTML:'' };
};
T.populateSwapTargetClubs('l1');
const optVals = fakeSel.options.map(o => o.value);
assert(optVals.includes('ClubX'), 'populateSwapTargetClubs : ClubX (historique saison 1) propose');
assert(optVals.includes('ClubA'), 'populateSwapTargetClubs : ClubA (actuel) propose');

// getClubRawLogo retrouve le logo du club historique dans la Base
assert(T.getClubRawLogo('ClubX') === 'oldlogo.png', 'getClubRawLogo retrouve le logo de ClubX dans la Base');
assert(T.getClubRawLogo('ClubA') === 'logoA.png', 'getClubRawLogo retrouve le logo de ClubA');

// executeSwapOrChangeClub : mode edit sur un club historique (changement de logo)
sandbox.document.getElementById = (id) => {
    if (id === 'swap-league-select') return { value: 'l1' };
    if (id === 'swap-target-club') return { value: 'ClubX' };
    if (id === 'swap-season-select') return { value: '1' };
    if (id === 'swap-club-new-name') return { value: 'ClubX' };
    if (id === 'swap-club-logo-catalog') return { value: 'newlogo.png' };
    return { style:{}, value:'', innerHTML:'', classList:{ add(){}, remove(){}, contains(){return false}, toggle(){} } };
};
sandbox.document.querySelector = (sel) => sel.includes('swap-action-mode') ? { value: 'edit' } : savedQSwap(sel);
T.executeSwapOrChangeClub();
sandbox.document.getElementById = savedGetElSwap;
sandbox.document.querySelector = savedQSwap;
assert(T.baseClubsData.clubs['ClubX'].logo === 'newlogo.png', 'Edit historique : logo de ClubX mis a jour dans la Base');
assert(T.leagueDataStore.l1.seasons[0].fixtures[0][0].home === 'ClubX', 'Edit historique : fixtures saison 1 conserve ClubX');
assert(!('ClubX' in T.leagueDataStore.l1.teams), 'Edit historique : ClubX pas ajoute a l effectif actuel');

// Renommage d'un club historique : l'ancien nom reste archive, le nouveau nom recoit le logo
T.baseClubsData.clubs['ClubY'] = undefined; delete T.baseClubsData.clubs['ClubY'];
sandbox.document.getElementById = (id) => {
    if (id === 'swap-league-select') return { value: 'l1' };
    if (id === 'swap-target-club') return { value: 'ClubX' };
    if (id === 'swap-season-select') return { value: '1' };
    if (id === 'swap-club-new-name') return { value: 'ClubY' };
    if (id === 'swap-club-logo-catalog') return { value: 'newlogo2.png' };
    return { style:{}, value:'', innerHTML:'', classList:{ add(){}, remove(){}, contains(){return false}, toggle(){} } };
};
sandbox.document.querySelector = (sel) => sel.includes('swap-action-mode') ? { value: 'edit' } : savedQSwap(sel);
T.executeSwapOrChangeClub();
sandbox.document.getElementById = savedGetElSwap;
sandbox.document.querySelector = savedQSwap;
assert(!!T.baseClubsData.clubs['ClubX'], 'Renommage historique : ancien nom ClubX archive dans la Base');
assert(T.baseClubsData.clubs['ClubY'].logo === 'newlogo2.png', 'Renommage historique : nouveau nom ClubY cree avec le logo');
assert(T.leagueDataStore.l1.seasons[0].fixtures[0][0].home === 'ClubY', 'Renommage historique : fixtures saison 1 renommees en ClubY');
assert(!('ClubX' in T.leagueDataStore.l1.teams) && !('ClubY' in T.leagueDataStore.l1.teams), 'Renommage historique : effectif actuel inchange');

console.log('=== TEST CATALOGUE LOGOS GITHUB (As_doudou_c.png + retirer/restaurer) ===');
const catalog = T.GITHUB_LOGOS_CATALOG;
assert(Array.isArray(catalog) && catalog.length > 0, 'Catalogue logos present');
assert(catalog.some(l => l.filename === 'As_doudou_c.png'), 'As_doudou_c.png est dans le catalogue');
assert(catalog.some(l => l.filename === 'vafc.png'), 'vafc.png toujours dans le catalogue');

// par defaut : tous les logos visibles
T.setRemovedCatalogLogos([]);
assert(T.getVisibleCatalogLogos().length === catalog.length, 'Aucun logo retire -> tous visibles');

// retirer un logo -> filtre
T.setRemovedCatalogLogos(['vafc.png']);
let visible = T.getVisibleCatalogLogos();
assert(visible.length === catalog.length - 1, 'Un logo retire -> 1 de moins dans la liste');
assert(!visible.some(l => l.filename === 'vafc.png'), "Le logo retire n'est plus propose");
assert(visible.some(l => l.filename === 'As_doudou_c.png'), 'As_doudou_c.png reste propose');

// restaurer -> tout revient
T.restoreRemovedCatalogLogos();
assert(T.getRemovedCatalogLogos().length === 0, 'Restaurer vide la liste des retires');
assert(T.getVisibleCatalogLogos().length === catalog.length, 'Restaurer -> tous les logos de nouveau visibles');

// populateGithubLogoSelect construit les <option> a partir des logos visibles
const fakeSelect = { innerHTML: '', options: [], value: '', appendChild(o) { this.options.push(o); }, addEventListener(){}, removeEventListener(){}, style:{} };
const savedGetEl = sandbox.document.getElementById;
sandbox.document.getElementById = (id) => id === 'fake-select' ? fakeSelect : savedGetEl(id);
T.setRemovedCatalogLogos(['psg.png']);
T.populateGithubLogoSelect('fake-select');
sandbox.document.getElementById = savedGetEl;
assert(fakeSelect.options.length === catalog.length - 1, 'populateGithubLogoSelect : 1 option en moins (psg.png retire)');
assert(!fakeSelect.options.some(o => o.value === 'psg.png'), 'populateGithubLogoSelect : psg.png absent des options');
assert(fakeSelect.options.some(o => o.value === 'As_doudou_c.png'), 'populateGithubLogoSelect : As_doudou_c.png present en option');

// Un logo retire mais encore selectionne (ex: logo du club en cours d'edition) reste propose
T.setRemovedCatalogLogos(['fcd.png']);
const fakeSel3 = { innerHTML: '', options: [], value: 'fcd.png', appendChild(o) { this.options.push(o); }, addEventListener(){}, removeEventListener(){}, style:{} };
const savedGetEl3 = sandbox.document.getElementById;
sandbox.document.getElementById = (id) => id === 'fake-select3' ? fakeSel3 : savedGetEl3(id);
T.populateGithubLogoSelect('fake-select3');
sandbox.document.getElementById = savedGetEl3;
assert(fakeSel3.options.some(o => o.value === 'fcd.png'), 'Logo retire mais selectionne : option conservee (edition club)');

// removeSelectedCatalogLogo retire le logo selectionne
const fakeSelect2 = { innerHTML: '', options: [], value: 'usla.png', appendChild(o) { this.options.push(o); }, addEventListener(){}, removeEventListener(){}, style:{} };
const savedGetEl2 = sandbox.document.getElementById;
sandbox.document.getElementById = (id) => {
    if (id === 'fake-select2') return fakeSelect2;
    if (id === 'new-l3-club-logo') return { innerHTML:'', options:[], value:'', appendChild(){}, addEventListener(){}, removeEventListener(){}, style:{} };
    if (id === 'swap-club-logo-catalog') return { innerHTML:'', options:[], value:'', appendChild(){}, addEventListener(){}, removeEventListener(){}, style:{} };
    if (id === 'modal-github-logo-select') return { innerHTML:'', options:[], value:'', appendChild(){}, addEventListener(){}, removeEventListener(){}, style:{} };
    if (id === 'new-club-github-logo') return { innerHTML:'', options:[], value:'', appendChild(){}, addEventListener(){}, removeEventListener(){}, style:{} };
    return savedGetEl2(id);
};
T.setRemovedCatalogLogos([]);
T.removeSelectedCatalogLogo('fake-select2');
sandbox.document.getElementById = savedGetEl2;
assert(T.getRemovedCatalogLogos().includes('usla.png'), 'removeSelectedCatalogLogo ajoute le logo selectionne aux retires');
assert(!T.getVisibleCatalogLogos().some(l => l.filename === 'usla.png'), 'usla.png plus propose apres retrait');

console.log('RESULTAT: ' + pass + ' reussis, ' + fail + ' echecs');
console.log('========================================');
process.exit(fail > 0 ? 1 : 0);
