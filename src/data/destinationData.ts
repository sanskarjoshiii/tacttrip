import { Activity, Monument } from '@/types/travel';

// ── ACTIVITIES ─────────────────────────────────────────────────────────────────

const DESTINATION_ACTIVITIES: Record<string, Activity[]> = {
  rishikesh: [
    {
      id: 'act-rk-1',
      name: 'White Water Rafting',
      description: 'Thrilling rafting on the holy Ganges through Grade 3–4 rapids at Shivpuri & Brahmpuri.',
      image: 'https://images.unsplash.com/photo-1530866476852-eecc82de0a9a?w=400',
      activityType: 'water',
      difficulty: 'Moderate',
    },
    {
      id: 'act-rk-2',
      name: 'Bungee Jumping',
      description: "India's highest bungee jump at 83 m at Jumpin Heights. Not for the faint-hearted!",
      image: 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=400',
      activityType: 'adventure',
      difficulty: 'Hard',
    },
    {
      id: 'act-rk-3',
      name: 'Zip-lining',
      description: 'Fly across the Ganges valley on thrilling zip-line courses with spectacular views.',
      image: 'https://images.unsplash.com/photo-1591704534317-fc22b4f9b4aa?w=400',
      activityType: 'adventure',
      difficulty: 'Easy',
    },
    {
      id: 'act-rk-4',
      name: 'Camping & Bonfire',
      description: 'Overnight camping on Ganges banks with bonfire, stargazing, and yoga at sunrise.',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400',
      activityType: 'nature',
      difficulty: 'Easy',
    },
  ],

  manali: [
    {
      id: 'act-ml-1',
      name: 'Paragliding',
      description: 'Soar above Solang Valley and Rohtang with experienced tandem pilots.',
      image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400',
      activityType: 'aerial',
      difficulty: 'Easy',
    },
    {
      id: 'act-ml-2',
      name: 'River Rafting',
      description: 'White water rafting on the Beas river through scenic Himalayan gorges.',
      image: 'https://images.unsplash.com/photo-1530866476852-eecc82de0a9a?w=400',
      activityType: 'water',
      difficulty: 'Moderate',
    },
    {
      id: 'act-ml-3',
      name: 'Skiing & Snowboarding',
      description: 'World-class skiing at Solang Valley and Rohtang Pass snow fields (Nov–Mar).',
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
      activityType: 'adventure',
      difficulty: 'Moderate',
    },
    {
      id: 'act-ml-4',
      name: 'Trekking',
      description: 'Trek to Beas Kund, Bhrigu Lake, or Hampta Pass through stunning Himalayan terrain.',
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400',
      activityType: 'nature',
      difficulty: 'Hard',
    },
  ],

  goa: [
    {
      id: 'act-ga-1',
      name: 'Parasailing',
      description: 'Soar above the Arabian Sea at Baga, Calangute and Candolim beaches.',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      activityType: 'aerial',
      difficulty: 'Easy',
    },
    {
      id: 'act-ga-2',
      name: 'Scuba Diving',
      description: 'Explore vibrant coral reefs and sunken ships around Grand Island & Pigeon Island.',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
      activityType: 'water',
      difficulty: 'Moderate',
    },
    {
      id: 'act-ga-3',
      name: 'Water Scooter Ride',
      description: 'Ride jet skis and water scooters along Goa\'s famous beaches at full speed.',
      image: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=400',
      activityType: 'water',
      difficulty: 'Easy',
    },
    {
      id: 'act-ga-4',
      name: 'Dolphin Safari',
      description: 'Spot playful dolphins in their natural habitat on sunrise and sunset boat cruises.',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400',
      activityType: 'nature',
      difficulty: 'Easy',
    },
  ],

  kerala: [
    {
      id: 'act-kl-1',
      name: 'Houseboat Stay',
      description: 'Drift through the serene Alleppey backwaters on a traditional kettuvallam houseboat.',
      image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400',
      activityType: 'nature',
      difficulty: 'Easy',
    },
    {
      id: 'act-kl-2',
      name: 'Elephant Safari',
      description: 'Ride majestic elephants through jungle trails at Periyar and Wayanad reserves.',
      image: 'https://images.unsplash.com/photo-1543946207-39bd91e70ca7?w=400',
      activityType: 'nature',
      difficulty: 'Easy',
    },
    {
      id: 'act-kl-3',
      name: 'Kayaking',
      description: 'Paddle through narrow backwater canals and paddy fields in Alleppey.',
      image: 'https://images.unsplash.com/photo-1472898965229-f9b06b9613d0?w=400',
      activityType: 'water',
      difficulty: 'Moderate',
    },
    {
      id: 'act-kl-4',
      name: 'Ayurvedic Spa',
      description: 'Rejuvenate with traditional Kerala Ayurvedic treatments and Panchakarma therapies.',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
      activityType: 'cultural',
      difficulty: 'Easy',
    },
  ],

  jaipur: [
    {
      id: 'act-jp-1',
      name: 'Hot Air Balloon',
      description: 'Float above the Pink City at sunrise and see forts, palaces, and desert landscapes.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      activityType: 'aerial',
      difficulty: 'Easy',
    },
    {
      id: 'act-jp-2',
      name: 'Camel Safari',
      description: 'Ride camels through the sandy outskirts of Jaipur and nearby desert villages.',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400',
      activityType: 'cultural',
      difficulty: 'Easy',
    },
    {
      id: 'act-jp-3',
      name: 'Heritage Walk',
      description: 'Guided walking tour through Jaipur\'s UNESCO-listed old walled city and bazaars.',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400',
      activityType: 'cultural',
      difficulty: 'Easy',
    },
  ],

  ladakh: [
    {
      id: 'act-lh-1',
      name: 'Bike Expedition',
      description: 'Epic motorcycle ride on the world\'s highest motorable roads – Khardung La & Chang La.',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      activityType: 'adventure',
      difficulty: 'Hard',
    },
    {
      id: 'act-lh-2',
      name: 'Trekking',
      description: 'High-altitude treks to Stok Kangri, Markha Valley, and Chadar Frozen River.',
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400',
      activityType: 'nature',
      difficulty: 'Hard',
    },
    {
      id: 'act-lh-3',
      name: 'Camping',
      description: 'Camp under a canopy of stars at Pangong Lake and Nubra Valley sand dunes.',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400',
      activityType: 'nature',
      difficulty: 'Moderate',
    },
  ],

  andaman: [
    {
      id: 'act-an-1',
      name: 'Scuba Diving',
      description: 'Dive into stunning coral gardens and encounter sea turtles at Havelock & Neil Island.',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
      activityType: 'water',
      difficulty: 'Moderate',
    },
    {
      id: 'act-an-2',
      name: 'Snorkeling',
      description: 'Snorkel over vibrant coral reefs teeming with tropical fish at Radhanagar Beach.',
      image: 'https://images.unsplash.com/photo-1583212292454-1d6dd9e9e100?w=400',
      activityType: 'water',
      difficulty: 'Easy',
    },
    {
      id: 'act-an-3',
      name: 'Sea Walk',
      description: 'Walk on the ocean floor at 5 m depth – no swimming skills needed, fully guided.',
      image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400',
      activityType: 'water',
      difficulty: 'Easy',
    },
    {
      id: 'act-an-4',
      name: 'Kayaking',
      description: 'Kayak through mangrove creeks and secluded lagoons around Havelock Island.',
      image: 'https://images.unsplash.com/photo-1472898965229-f9b06b9613d0?w=400',
      activityType: 'water',
      difficulty: 'Easy',
    },
  ],

  varanasi: [
    {
      id: 'act-vr-1',
      name: 'Ganga Aarti',
      description: 'Witness the mesmerizing evening prayer ceremony at Dashashwamedh Ghat.',
      image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=400',
      activityType: 'cultural',
      difficulty: 'Easy',
    },
    {
      id: 'act-vr-2',
      name: 'Sunrise Boat Ride',
      description: 'Row along the Ganges at sunrise watching pilgrims bathe and ancient ghats glow.',
      image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400',
      activityType: 'cultural',
      difficulty: 'Easy',
    },
    {
      id: 'act-vr-3',
      name: 'Yoga & Meditation',
      description: 'Early morning yoga and meditation classes on the ghats of the sacred Ganges.',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
      activityType: 'cultural',
      difficulty: 'Easy',
    },
  ],

  udaipur: [
    {
      id: 'act-ud-1',
      name: 'Hot Air Balloon',
      description: 'Drift over Udaipur\'s palaces and shimmering lakes at sunrise.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      activityType: 'aerial',
      difficulty: 'Easy',
    },
    {
      id: 'act-ud-2',
      name: 'Lake Boating',
      description: 'Sail across Lake Pichola and Lake Fateh Sagar with palace views all around.',
      image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400',
      activityType: 'water',
      difficulty: 'Easy',
    },
    {
      id: 'act-ud-3',
      name: 'Heritage Walk',
      description: 'Explore the winding lanes of the old city, palaces, and 18th-century havelis.',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400',
      activityType: 'cultural',
      difficulty: 'Easy',
    },
  ],

  mumbai: [
    {
      id: 'act-mb-1',
      name: 'Parasailing',
      description: 'Parasail above the Arabian Sea at Juhu, Aksa, and Manori beaches.',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      activityType: 'aerial',
      difficulty: 'Easy',
    },
    {
      id: 'act-mb-2',
      name: 'Scuba Diving',
      description: 'Discover underwater life at Malvan Marine Sanctuary near Mumbai.',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
      activityType: 'water',
      difficulty: 'Moderate',
    },
    {
      id: 'act-mb-3',
      name: 'Rock Climbing',
      description: 'Scale natural boulders at Matheran and Bhandardara hills near the city.',
      image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400',
      activityType: 'adventure',
      difficulty: 'Moderate',
    },
  ],

  delhi: [
    {
      id: 'act-dl-1',
      name: 'Hot Air Balloon',
      description: 'Float above Delhi\'s iconic monuments and cityscape at dawn.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      activityType: 'aerial',
      difficulty: 'Easy',
    },
    {
      id: 'act-dl-2',
      name: 'Cycling Tour',
      description: 'Guided cycling through Old Delhi lanes, Chandni Chowk, and Mughal heritage sites.',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      activityType: 'cultural',
      difficulty: 'Easy',
    },
    {
      id: 'act-dl-3',
      name: 'Rock Climbing',
      description: 'Indoor and outdoor rock climbing sessions at Dhaula Kuan climbing wall.',
      image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400',
      activityType: 'adventure',
      difficulty: 'Moderate',
    },
  ],

  agra: [
    {
      id: 'act-ag-1',
      name: 'Hot Air Balloon',
      description: 'Float above the Taj Mahal at sunrise for breathtaking aerial views.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      activityType: 'aerial',
      difficulty: 'Easy',
    },
    {
      id: 'act-ag-2',
      name: 'Camel Ride',
      description: 'Ride camels along the Yamuna riverfront near the Taj Mahal at dusk.',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400',
      activityType: 'cultural',
      difficulty: 'Easy',
    },
    {
      id: 'act-ag-3',
      name: 'Heritage Walk',
      description: 'Guided walk through Agra\'s bazaars and Mughal-era monuments.',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400',
      activityType: 'cultural',
      difficulty: 'Easy',
    },
  ],

  darjeeling: [
    {
      id: 'act-dj-1',
      name: 'Trekking',
      description: 'Trek through lush tea gardens and dense forests with Kanchenjunga views.',
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400',
      activityType: 'nature',
      difficulty: 'Moderate',
    },
    {
      id: 'act-dj-2',
      name: 'Tea Garden Tour',
      description: 'Walk through iconic tea estates like Makaibari and Happy Valley with tastings.',
      image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
      activityType: 'cultural',
      difficulty: 'Easy',
    },
    {
      id: 'act-dj-3',
      name: 'Yak Ride',
      description: 'Ride traditional yaks near Tiger Hill and Batasia Loop with mountain backdrops.',
      image: 'https://images.unsplash.com/photo-1523464862212-d6631d073194?w=400',
      activityType: 'nature',
      difficulty: 'Easy',
    },
  ],
};

// ── MONUMENTS ──────────────────────────────────────────────────────────────────

const DESTINATION_MONUMENTS: Record<string, Monument[]> = {
  delhi: [
    {
      id: 'mon-dl-1',
      name: 'India Gate',
      description: 'Iconic 42-m war memorial built in 1931 dedicated to 80,000 Indian soldiers of WWI.',
      image: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=400',
      builtYear: '1931',
    },
    {
      id: 'mon-dl-2',
      name: 'Red Fort',
      description: 'UNESCO-listed 17th-century Mughal fortress — heart of Delhi\'s walled city, Shahjahanabad.',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
      builtYear: '1648',
    },
    {
      id: 'mon-dl-3',
      name: 'Qutub Minar',
      description: 'World\'s tallest brick minaret at 73 m, built in 1193, a UNESCO World Heritage Site.',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400',
      builtYear: '1193',
    },
    {
      id: 'mon-dl-4',
      name: 'Humayun\'s Tomb',
      description: 'Magnificent 16th-century Mughal mausoleum — the architectural precursor to the Taj Mahal.',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400',
      builtYear: '1572',
    },
  ],

  agra: [
    {
      id: 'mon-ag-1',
      name: 'Taj Mahal',
      description: 'The world\'s most iconic symbol of love — a UNESCO World Heritage Site and one of the Seven Wonders.',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400',
      builtYear: '1653',
    },
    {
      id: 'mon-ag-2',
      name: 'Agra Fort',
      description: 'UNESCO-listed red sandstone Mughal fort housing palaces, audience halls, and mosques.',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
      builtYear: '1573',
    },
    {
      id: 'mon-ag-3',
      name: 'Fatehpur Sikri',
      description: 'Abandoned 16th-century Mughal capital with stunning red sandstone architecture.',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400',
      builtYear: '1571',
    },
  ],

  jaipur: [
    {
      id: 'mon-jp-1',
      name: 'Amber Fort',
      description: 'Majestic hilltop fort with ornate palaces, mirror halls, and elephant ride access.',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400',
      builtYear: '1592',
    },
    {
      id: 'mon-jp-2',
      name: 'Hawa Mahal',
      description: 'Iconic 953-windowed "Palace of Winds" — built for royal ladies to watch street life unseen.',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400',
      builtYear: '1799',
    },
    {
      id: 'mon-jp-3',
      name: 'City Palace',
      description: 'Stunning royal complex at the heart of the old city — part palace, part museum, still in royal use.',
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400',
      builtYear: '1729',
    },
    {
      id: 'mon-jp-4',
      name: 'Jantar Mantar',
      description: 'UNESCO World Heritage astronomical observatory with the world\'s largest stone sundial.',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400',
      builtYear: '1734',
    },
  ],

  mumbai: [
    {
      id: 'mon-mb-1',
      name: 'Gateway of India',
      description: 'Iconic 26-m basalt arch built in 1924, overlooking the Arabian Sea — Mumbai\'s most recognizable landmark.',
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400',
      builtYear: '1924',
    },
    {
      id: 'mon-mb-2',
      name: 'Elephanta Caves',
      description: 'UNESCO-listed 5th–8th century rock-cut temples on Elephanta Island with magnificent Shiva sculptures.',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
      builtYear: '600',
    },
    {
      id: 'mon-mb-3',
      name: 'Chhatrapati Shivaji Terminus',
      description: 'UNESCO-listed Victorian Gothic railway station — a stunning architectural masterpiece.',
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400',
      builtYear: '1887',
    },
  ],

  goa: [
    {
      id: 'mon-ga-1',
      name: 'Basilica of Bom Jesus',
      description: 'UNESCO-listed 16th-century Baroque church housing the preserved remains of St. Francis Xavier.',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400',
      builtYear: '1605',
    },
    {
      id: 'mon-ga-2',
      name: 'Fort Aguada',
      description: 'Well-preserved 17th-century Portuguese fort atop a cliff overlooking the Arabian Sea.',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
      builtYear: '1612',
    },
    {
      id: 'mon-ga-3',
      name: 'Se Cathedral',
      description: 'One of the largest churches in Asia — an outstanding example of Portuguese Gothic architecture.',
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400',
      builtYear: '1619',
    },
  ],

  varanasi: [
    {
      id: 'mon-vr-1',
      name: 'Kashi Vishwanath Temple',
      description: 'One of the twelve Jyotirlingas and the holiest Hindu temple dedicated to Lord Shiva.',
      image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=400',
      builtYear: '1780',
    },
    {
      id: 'mon-vr-2',
      name: 'Dashashwamedh Ghat',
      description: 'The main and most spectacular ghat where the famous Ganga Aarti ceremony takes place daily.',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400',
    },
    {
      id: 'mon-vr-3',
      name: 'Sarnath',
      description: 'Sacred site where Buddha gave his first sermon — with Dhamek Stupa and archaeological museum.',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
      builtYear: '500 BC',
    },
  ],

  udaipur: [
    {
      id: 'mon-ud-1',
      name: 'City Palace',
      description: 'Massive 4-century-old royal palace complex overlooking Lake Pichola — a blend of Rajput and Mughal styles.',
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400',
      builtYear: '1559',
    },
    {
      id: 'mon-ud-2',
      name: 'Jagdish Temple',
      description: 'Magnificent 17th-century Indo-Aryan temple dedicated to Lord Vishnu in the old city.',
      image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=400',
      builtYear: '1651',
    },
    {
      id: 'mon-ud-3',
      name: 'Lake Palace (Jag Niwas)',
      description: 'Stunning white marble palace floating on Lake Pichola, now a luxury heritage hotel.',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400',
      builtYear: '1754',
    },
  ],

  hyderabad: [
    {
      id: 'mon-hy-1',
      name: 'Charminar',
      description: 'Iconic 16th-century mosque and monument with four minarets at the heart of the old city.',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
      builtYear: '1591',
    },
    {
      id: 'mon-hy-2',
      name: 'Golconda Fort',
      description: 'Magnificent hilltop fort with acoustic clapping system, tombs, and panoramic city views.',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400',
      builtYear: '1143',
    },
    {
      id: 'mon-hy-3',
      name: 'Salar Jung Museum',
      description: 'One of India\'s largest one-man art collections with over 43,000 artefacts from around the world.',
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400',
      builtYear: '1951',
    },
  ],

  kolkata: [
    {
      id: 'mon-kl-1',
      name: 'Victoria Memorial',
      description: 'Grand white marble memorial to Queen Victoria, now a stunning museum and landmark garden.',
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400',
      builtYear: '1921',
    },
    {
      id: 'mon-kl-2',
      name: 'Howrah Bridge',
      description: 'Iconic cantilever bridge over the Hooghly River — one of the world\'s busiest bridges.',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
      builtYear: '1943',
    },
    {
      id: 'mon-kl-3',
      name: 'Dakshineswar Kali Temple',
      description: '19th-century Bengali-style temple on the Hooghly, associated with saint Ramakrishna.',
      image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=400',
      builtYear: '1855',
    },
  ],

  manali: [
    {
      id: 'mon-ml-1',
      name: 'Hadimba Temple',
      description: 'Unique pagoda-style wooden temple dedicated to Hadimba Devi nestled in ancient deodar forest.',
      image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=400',
      builtYear: '1553',
    },
    {
      id: 'mon-ml-2',
      name: 'Manu Temple',
      description: 'Temple dedicated to sage Manu — believed to be the only temple of Manu in the world.',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400',
    },
    {
      id: 'mon-ml-3',
      name: 'Rohtang Pass',
      description: 'High mountain pass at 3,978 m offering spectacular snow, glaciers, and Lahaul valley views.',
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
    },
  ],

  rishikesh: [
    {
      id: 'mon-rk-1',
      name: 'Lakshman Jhula',
      description: 'Iconic 91-m iron suspension bridge across the Ganges — a defining landmark of Rishikesh.',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400',
      builtYear: '1929',
    },
    {
      id: 'mon-rk-2',
      name: 'Triveni Ghat',
      description: 'Sacred ghat where the Ganga, Yamuna and Saraswati rivers meet — famous for evening aarti.',
      image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=400',
    },
    {
      id: 'mon-rk-3',
      name: 'Parmarth Niketan Ashram',
      description: 'One of India\'s largest ashrams, renowned for daily Ganga Aarti and yoga retreats.',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
    },
  ],
};

// ── HELPERS ────────────────────────────────────────────────────────────────────

function normalizeCity(city: string): string {
  return city.toLowerCase().trim().replace(/\s+/g, '');
}

export function getCuratedActivities(destination: string): Activity[] {
  const key = normalizeCity(destination);
  // Direct match
  if (DESTINATION_ACTIVITIES[key]) return DESTINATION_ACTIVITIES[key];
  // Partial match (e.g. "New Delhi" → "delhi")
  const found = Object.keys(DESTINATION_ACTIVITIES).find((k) => key.includes(k) || k.includes(key));
  return found ? DESTINATION_ACTIVITIES[found] : [];
}

export function getCuratedMonuments(destination: string): Monument[] {
  const key = normalizeCity(destination);
  if (DESTINATION_MONUMENTS[key]) return DESTINATION_MONUMENTS[key];
  const found = Object.keys(DESTINATION_MONUMENTS).find((k) => key.includes(k) || k.includes(key));
  return found ? DESTINATION_MONUMENTS[found] : [];
}
