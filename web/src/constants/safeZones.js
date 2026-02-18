const SAFE_ZONES_BY_UNIVERSITY = {
    'McGill University': [
        { name: 'McConnell Library', address: '3459 McTavish St, Main Floor Lobby' },
        { name: 'Redpath Library', address: '3461 McTavish St, Front Entrance' },
        { name: 'Leacock Building', address: '855 Sherbrooke St W, Main Entrance' },
        { name: 'SSMU Building', address: '3480 McTavish St, Main Entrance' },
        { name: 'Trottier Building', address: '3630 University St, Lobby' },
        { name: 'McLennan Library', address: '3459 McTavish St, Main Entrance' },
        { name: 'New Residence Hall', address: '3625 Park Ave, Lobby' },
    ],
    'Concordia University': [
        { name: 'Hall Building Lobby', address: '1455 De Maisonneuve Blvd W, Main Entrance' },
        { name: 'Library Building (LB)', address: '1400 De Maisonneuve Blvd W, Ground Floor' },
        { name: 'EV Building Atrium', address: '1515 Ste-Catherine St W, Main Floor' },
        { name: 'MB Building Lobby', address: '1450 Guy St, Main Entrance' },
        { name: 'GM Building', address: '1550 De Maisonneuve Blvd W, Lobby' },
    ],
    'École de technologie supérieure (ÉTS)': [
        { name: 'Main Building (A)', address: '1100 Notre-Dame St W, Main Entrance' },
        { name: 'ÉTS Library', address: '1100 Notre-Dame St W, Library Floor' },
        { name: 'Cafeteria (B Building)', address: '1111 Notre-Dame St W, Ground Floor' },
        { name: 'Pavilion C Lobby', address: '1200 Notre-Dame St W, Main Entrance' },
    ],
    'Polytechnique Montréal': [
        { name: 'Main Hall (Lassonde)', address: '2900 Edouard-Montpetit Blvd, Main Lobby' },
        { name: 'Polytechnique Library', address: '2500 Chemin de Polytechnique, Ground Floor' },
        { name: 'Pavillon Pouliot Lobby', address: '2900 Edouard-Montpetit Blvd, Pavilion B' },
        { name: 'Atrium Accès', address: '2940 Chemin de Polytechnique, Atrium' },
    ],
    'Université de Montréal (UdeM)': [
        { name: 'Roger-Gaudry Building', address: '2900 Edouard-Montpetit Blvd, Main Lobby' },
        { name: 'Thérèse-Casgrain Library', address: '3150 Jean-Brillant St, Ground Floor' },
        { name: 'Pavillon J.-A.-DeSève', address: '2332 Edouard-Montpetit Blvd, Lobby' },
        { name: 'CEPSUM Sports Center', address: '2100 Edouard-Montpetit Blvd, Entrance' },
    ],
    'Université du Québec à Montréal (UQAM)': [
        { name: 'Pavillon Judith-Jasmin', address: '405 Ste-Catherine St E, Lobby' },
        { name: 'Coeur des sciences', address: '175 Ave President-Kennedy, Atrium' },
        { name: 'Pavillon des Sciences Biologiques', address: '141 Ave President-Kennedy, Lobby' },
        { name: 'UQAM Central Library', address: '400 Ste-Catherine St E, Ground Floor' },
    ],
    'Université Laval': [
        { name: 'Pavillon Alphonse-Desjardins', address: '2325 Allée des Bibliothèques, Main Hall' },
        { name: 'Bibliothèque (BIBL)', address: '1405 Impasse des Bibliothèques, Ground Floor' },
        { name: 'PEPS Entrance', address: '2300 Rue de la Terrasse, Main Entrance' },
        { name: 'Pavillon Palasis-Prince', address: '2325 Rue de la Terrasse, Lobby' },
    ],
    'Université de Sherbrooke': [
        { name: 'Bibliothèque Roger-Maltais', address: "2500 Boul. de l'Université, Ground Floor" },
        { name: "Carrefour de l'information", address: "2500 Boul. de l'Université, Main Lobby" },
        { name: 'Centre sportif', address: "2500 Boul. de l'Université, Sports Wing" },
        { name: 'Pavillon A1 Lobby', address: "2500 Boul. de l'Université, Building A1" },
    ],
};

const DEFAULT_SAFE_ZONES = [
    { name: 'University Library', address: 'Main Library, Ground Floor' },
    { name: 'Student Union Building', address: 'Student Union, Main Entrance' },
    { name: 'Main Campus Lobby', address: 'Main Building, Ground Floor' },
];

export const getSafeZones = (university) => {
    return SAFE_ZONES_BY_UNIVERSITY[university] || DEFAULT_SAFE_ZONES;
};
