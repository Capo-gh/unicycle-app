// Single source of truth for all supported universities.
// `domains` lists every valid email domain for that school (students may have multiple).
const UNIVERSITIES = [
    { name: 'McGill University', domains: ['mail.mcgill.ca'] },
    { name: 'Concordia University', domains: ['live.concordia.ca', 'concordia.ca'] },
    { name: 'École de technologie supérieure (ÉTS)', domains: ['ens.etsmtl.ca'] },
    { name: 'Polytechnique Montréal', domains: ['polymtl.ca'] },
    { name: 'Université de Montréal (UdeM)', domains: ['umontreal.ca', 'iro.umontreal.ca'] },
    { name: 'Université du Québec à Montréal (UQAM)', domains: ['courrier.uqam.ca', 'uqam.ca'] },
    { name: 'Université Laval', domains: ['ulaval.ca'] },
    { name: 'Université de Sherbrooke', domains: ['usherbrooke.ca'] },
    { name: 'HEC Montréal', domains: ['hec.ca'] },
];

module.exports = { UNIVERSITIES };
