const SAFE_ZONES = [
    {
        id: 'mcconnell',
        name: 'McConnell Library',
        address: '3459 McTavish St',
        details: 'Main Floor Lobby',
        coordinates: { lat: 45.5048, lng: -73.5772 },
        features: ['Security Cameras', 'High Traffic', 'Indoor'],
        hours: '24/7 (term time)'
    },
    {
        id: 'ssmu',
        name: 'SSMU Building',
        address: '3480 McTavish St',
        details: 'Main Entrance',
        coordinates: { lat: 45.5044, lng: -73.5757 },
        features: ['Security Cameras', 'High Traffic', 'Indoor'],
        hours: '7am - 11pm'
    },
    {
        id: 'trottier',
        name: 'Trottier Building',
        address: '3630 University St',
        details: 'Lobby',
        coordinates: { lat: 45.5072, lng: -73.5795 },
        features: ['Security Cameras', 'High Traffic', 'Indoor'],
        hours: '7am - 10pm'
    },
    {
        id: 'redpath',
        name: 'Redpath Library',
        address: '3461 McTavish St',
        details: 'Ground Floor',
        coordinates: { lat: 45.5046, lng: -73.5774 },
        features: ['Security Cameras', 'Quiet', 'Indoor'],
        hours: '8am - 12am'
    },
    {
        id: 'mclennan',
        name: 'McLennan Library',
        address: '3459 McTavish St',
        details: 'Main Entrance',
        coordinates: { lat: 45.5048, lng: -73.5770 },
        features: ['Security Cameras', 'High Traffic', 'Indoor'],
        hours: '8am - 12am'
    },
    {
        id: 'leacock',
        name: 'Leacock Building',
        address: '855 Sherbrooke St W',
        details: 'Main Entrance',
        coordinates: { lat: 45.5065, lng: -73.5787 },
        features: ['Security Cameras', 'High Traffic', 'Indoor'],
        hours: '7am - 10pm'
    },
    {
        id: 'otto',
        name: 'Otto Maass Chemistry',
        address: '801 Sherbrooke St W',
        details: 'Main Entrance',
        coordinates: { lat: 45.5063, lng: -73.5783 },
        features: ['Security Cameras', 'Indoor'],
        hours: '7am - 9pm'
    },
    {
        id: 'rez',
        name: 'New Residence Hall',
        address: '3625 Park Ave',
        details: 'Lobby',
        coordinates: { lat: 45.5100, lng: -73.5720 },
        features: ['Security Cameras', 'High Traffic', 'Indoor', '24/7 Security'],
        hours: '24/7'
    }
];

module.exports = { SAFE_ZONES };