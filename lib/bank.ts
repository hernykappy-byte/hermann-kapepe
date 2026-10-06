// Seed question bank. Append-only: ids are `${category}-${index}` and are stored in
// players' histories, so never reorder or delete entries. Add new questions at the end.
//
// Status: authored by hand from well-established facts. Not yet run through an
// independent verifier. See docs/GATE_REPORT.md.

export type Diff = "E" | "M" | "H";

export type Category = {
  id: string;
  name: string;
  blurb: string;
};

export const CATEGORIES: Category[] = [
  { id: "zambia", name: "Zambia", blurb: "Places, people and history" },
  { id: "africa", name: "Africa", blurb: "The continent, country by country" },
  { id: "geography", name: "World geography", blurb: "Maps, rivers and capitals" },
  { id: "science", name: "Science", blurb: "Atoms to planets" },
  { id: "history", name: "History", blurb: "Events that shaped the world" },
  { id: "sport", name: "Sport", blurb: "Pitch, track and court" },
  { id: "music", name: "Music", blurb: "From mbira to amapiano" },
  { id: "film", name: "Film and TV", blurb: "Screens big and small" },
  { id: "tech", name: "Technology", blurb: "How the digital world works" },
  { id: "food", name: "Food and drink", blurb: "What is on the table" },
  { id: "nature", name: "Nature", blurb: "Animals and plants" },
  { id: "general", name: "General knowledge", blurb: "A bit of everything" },
];

// [question, optA, optB, optC, optD, correctIndex (0-3), difficulty, fact shown after answering]
type Raw = [string, string, string, string, string, number, Diff, string];

const RAW: Record<string, Raw[]> = {
  zambia: [
    ["Which city is the capital of Zambia?", "Ndola", "Lusaka", "Kitwe", "Livingstone", 1, "E", "Lusaka replaced Livingstone as the capital of Northern Rhodesia in 1935."],
    ["Who was the first president of Zambia?", "Frederick Chiluba", "Levy Mwanawasa", "Kenneth Kaunda", "Michael Sata", 2, "E", "Kenneth Kaunda led Zambia from independence in 1964 until 1991."],
    ["What was Zambia called before independence?", "Nyasaland", "Northern Rhodesia", "Bechuanaland", "Tanganyika", 1, "E", "Northern Rhodesia became Zambia on 24 October 1964."],
    ["What is the currency of Zambia?", "Rand", "Pula", "Shilling", "Kwacha", 3, "E", "Kwacha means dawn in Bemba and Nyanja, a nod to the dawn of independence."],
    ["Zambia's Independence Day is celebrated on which date?", "24 October", "5 October", "1 January", "18 April", 0, "E", "Zambia became independent from Britain on 24 October 1964."],
    ["Which mineral is Zambia's largest export?", "Gold", "Copper", "Diamonds", "Coal", 1, "E", "Copper has driven Zambia's economy since the Copperbelt mines opened in the 1920s."],
    ["What does 'Mosi-oa-Tunya', the local name for Victoria Falls, mean?", "The water that falls", "The great river", "The smoke that thunders", "Mountain of mist", 2, "M", "The spray from the falls can be seen from far away, which gave rise to the name."],
    ["Zambia won the Africa Cup of Nations in which year?", "1994", "2006", "2012", "2019", 2, "M", "The 2012 final in Libreville ended 0-0 and Zambia won 8-7 on penalties, near the site of the 1993 team air crash."],
    ["Which dam on the Zambezi forms Lake Kariba, shared by Zambia and Zimbabwe?", "Kafue Gorge", "Kariba", "Itezhi-Tezhi", "Mulungushi", 1, "M", "Lake Kariba is one of the largest man-made lakes in the world by volume."],
    ["How many countries share a land border with Zambia?", "Six", "Seven", "Eight", "Nine", 2, "M", "Zambia borders the DRC, Tanzania, Malawi, Mozambique, Zimbabwe, Botswana, Namibia and Angola."],
    ["What is Zambia's national bird?", "Grey crowned crane", "African fish eagle", "Lilac-breasted roller", "Shoebill", 1, "M", "The African fish eagle appears on the Zambian coat of arms."],
    ["Which Zambian national park is widely regarded as the birthplace of the walking safari?", "Lower Zambezi", "Kafue", "South Luangwa", "Liuwa Plain", 2, "H", "Walking safaris were pioneered in South Luangwa in the 1950s."],
    ["Which is the longest river that flows entirely within Zambia?", "Luangwa", "Kafue", "Chambeshi", "Zambezi", 1, "H", "The Zambezi is longer but also flows through other countries. The Kafue crosses Kafue National Park."],
    ["In which year did the capital of Northern Rhodesia move from Livingstone to Lusaka?", "1935", "1948", "1953", "1964", 0, "H", "Lusaka was chosen partly for its central location on the railway line."],
  ],
  africa: [
    ["Which is the most populous country in Africa?", "Ethiopia", "Egypt", "Nigeria", "DR Congo", 2, "E", "Nigeria has more than 200 million people."],
    ["What is Africa's highest mountain?", "Mount Kenya", "Kilimanjaro", "Mount Stanley", "Toubkal", 1, "E", "Kilimanjaro in Tanzania stands about 5,895 metres above sea level."],
    ["Which river flows through Cairo?", "Niger", "Congo", "Nile", "Zambezi", 2, "E", "The Nile flows north through Egypt into the Mediterranean."],
    ["What is the largest island of Africa?", "Zanzibar", "Madagascar", "Mauritius", "Reunion", 1, "E", "Madagascar is the fourth largest island in the world."],
    ["Which is the largest hot desert in the world?", "Gobi", "Arabian", "Sahara", "Kalahari", 2, "E", "The Sahara covers about a third of Africa."],
    ["What is the capital of Ethiopia?", "Nairobi", "Kampala", "Addis Ababa", "Asmara", 2, "E", "Addis Ababa means 'new flower' and hosts the African Union headquarters."],
    ["Which country is the largest in Africa by area?", "Sudan", "Algeria", "DR Congo", "Libya", 1, "M", "Algeria took the top spot after South Sudan split from Sudan in 2011."],
    ["Which country has Dodoma as its capital?", "Kenya", "Malawi", "Tanzania", "Uganda", 2, "M", "Dodoma is the official capital. Dar es Salaam remains the largest city."],
    ["Which is the largest lake in Africa by area?", "Victoria", "Tanganyika", "Malawi", "Chad", 0, "M", "Lake Victoria is shared by Uganda, Kenya and Tanzania."],
    ["Which of these countries is NOT landlocked?", "Uganda", "Malawi", "Zambia", "Kenya", 3, "M", "Kenya has a coastline on the Indian Ocean."],
    ["Mansa Musa, famed for his wealth, ruled which empire?", "Songhai", "Ghana", "Mali", "Kanem-Bornu", 2, "M", "His pilgrimage to Mecca in 1324 was said to have spent so much gold it affected prices in Cairo."],
    ["Which was the first sub-Saharan African country to gain independence from colonial rule, in 1957?", "Nigeria", "Ghana", "Kenya", "Senegal", 1, "M", "Ghana's independence under Kwame Nkrumah inspired movements across the continent."],
    ["Which country has more pyramids than Egypt?", "Mexico", "Sudan", "Ethiopia", "Libya", 1, "H", "The Nubian pyramids at Meroe and elsewhere in Sudan outnumber Egypt's."],
    ["The Strait of Gibraltar separates Africa from Europe. About how wide is it at its narrowest?", "14 km", "40 km", "90 km", "150 km", 0, "H", "On a clear day you can see Morocco from Spain."],
  ],
  geography: [
    ["Which is the largest ocean on Earth?", "Atlantic", "Indian", "Arctic", "Pacific", 3, "E", "The Pacific covers about a third of the planet's surface."],
    ["Which is the smallest country in the world by area?", "Monaco", "Vatican City", "San Marino", "Liechtenstein", 1, "E", "Vatican City covers roughly 0.44 square kilometres."],
    ["What is the capital of Australia?", "Sydney", "Melbourne", "Canberra", "Perth", 2, "E", "Canberra was purpose-built as a compromise between rivals Sydney and Melbourne."],
    ["Which country is the largest in the world by area?", "Canada", "Russia", "China", "United States", 1, "E", "Russia spans eleven time zones."],
    ["What is the capital of Canada?", "Toronto", "Vancouver", "Ottawa", "Montreal", 2, "E", "Ottawa sits on the border between Ontario and Quebec."],
    ["Which line of latitude is 0 degrees?", "Tropic of Cancer", "Equator", "Prime Meridian", "Arctic Circle", 1, "E", "The Prime Meridian marks 0 degrees longitude, not latitude."],
    ["Which continent has the most countries?", "Asia", "Europe", "Africa", "South America", 2, "M", "Africa has 54 countries recognised by the United Nations."],
    ["The Challenger Deep, the deepest known point in the oceans, lies in which trench?", "Puerto Rico Trench", "Java Trench", "Tonga Trench", "Mariana Trench", 3, "M", "It is nearly 11 kilometres deep."],
    ["Which river flows through Baghdad?", "Euphrates", "Tigris", "Nile", "Jordan", 1, "M", "The Tigris and Euphrates define ancient Mesopotamia."],
    ["Mount Everest lies on the border of Nepal and which other country?", "India", "Bhutan", "China", "Pakistan", 2, "M", "The summit sits on the Nepal and Tibet (China) border."],
    ["Which country has the capital Ankara and spans both Europe and Asia?", "Greece", "Turkey", "Iran", "Egypt", 1, "M", "Istanbul is the largest city but Ankara is the capital."],
    ["Which desert covers most of Botswana?", "Namib", "Sahara", "Gobi", "Kalahari", 3, "M", "The Kalahari is a sand basin rather than a true desert in places."],
    ["Which is the deepest lake in the world?", "Superior", "Tanganyika", "Baikal", "Victoria", 2, "H", "Lake Baikal in Siberia is more than 1,600 metres deep and holds about a fifth of the world's unfrozen surface fresh water."],
    ["Which country has the most natural lakes?", "Russia", "Finland", "Brazil", "Canada", 3, "H", "Canada has millions of lakes, more than any other country."],
  ],
  science: [
    ["What is the chemical symbol for gold?", "Ag", "Au", "Gd", "Go", 1, "E", "Au comes from the Latin word aurum."],
    ["Which planet is closest to the Sun?", "Venus", "Earth", "Mercury", "Mars", 2, "E", "Mercury orbits the Sun in just 88 Earth days."],
    ["Which organelle is known as the powerhouse of the cell?", "Nucleus", "Mitochondrion", "Ribosome", "Chloroplast", 1, "E", "Mitochondria turn food energy into ATP."],
    ["Which gas do plants absorb for photosynthesis?", "Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen", 2, "E", "Plants release oxygen as a by-product."],
    ["Which is the hardest naturally occurring substance?", "Quartz", "Diamond", "Steel", "Topaz", 1, "E", "Diamond is rated 10 on the Mohs scale."],
    ["Which planet has the most prominent ring system?", "Jupiter", "Uranus", "Neptune", "Saturn", 3, "E", "Saturn's rings are made mostly of ice particles."],
    ["What is the most abundant gas in Earth's atmosphere?", "Oxygen", "Nitrogen", "Argon", "Carbon dioxide", 1, "M", "Nitrogen makes up about 78 percent of the air."],
    ["How many bones does an adult human body have?", "186", "206", "226", "256", 1, "M", "Babies are born with around 270 bones that fuse as they grow."],
    ["What does DNA stand for?", "Deoxyribonucleic acid", "Dinitrogen acid", "Dynamic nucleic acid", "Deoxyribose nitrate", 0, "M", "DNA carries the genetic instructions for living things."],
    ["What is the chemical formula of table salt?", "KCl", "NaCl", "CaCO3", "NaOH", 1, "M", "Table salt is sodium chloride."],
    ["Which blood cells help the body fight infection?", "Red blood cells", "Platelets", "White blood cells", "Plasma cells", 2, "M", "White blood cells are part of the immune system."],
    ["What is the unit of electrical resistance?", "Volt", "Watt", "Ampere", "Ohm", 3, "M", "It is named after the German physicist Georg Ohm."],
    ["About how fast does light travel in a vacuum?", "3,000 km per second", "30,000 km per second", "300,000 km per second", "3,000,000 km per second", 2, "H", "The exact figure is 299,792 kilometres per second."],
    ["Which particle carries a negative electric charge?", "Proton", "Neutron", "Electron", "Photon", 2, "E", "Electrons orbit the nucleus of an atom."],
  ],
  history: [
    ["Who was the first president of the United States?", "Thomas Jefferson", "George Washington", "John Adams", "Abraham Lincoln", 1, "E", "Washington took office in 1789."],
    ["Who was the first person to walk on the Moon?", "Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "Michael Collins", 2, "E", "Armstrong stepped onto the Moon on 20 July 1969."],
    ["Which empire did Genghis Khan found?", "Ottoman", "Persian", "Mongol", "Roman", 2, "E", "The Mongol Empire became the largest contiguous land empire in history."],
    ["In which year did World War II end?", "1939", "1943", "1945", "1950", 2, "E", "The war in Europe ended in May 1945 and in Asia in September 1945."],
    ["Which civilisation built Machu Picchu?", "Aztec", "Maya", "Inca", "Olmec", 2, "M", "Machu Picchu was built in the 15th century high in the Andes."],
    ["In which year did the French Revolution begin?", "1689", "1776", "1789", "1815", 2, "M", "The storming of the Bastille was on 14 July 1789."],
    ["In which year did the Berlin Wall fall?", "1979", "1985", "1989", "1991", 2, "M", "The wall had divided the city since 1961."],
    ["Which of the Seven Wonders of the Ancient World still stands?", "Colossus of Rhodes", "Hanging Gardens of Babylon", "Lighthouse of Alexandria", "Great Pyramid of Giza", 3, "M", "It was the tallest human-made structure for about 3,800 years."],
    ["In which year did the Titanic sink?", "1905", "1912", "1918", "1923", 1, "M", "It hit an iceberg on its maiden voyage in April 1912."],
    ["When was Nelson Mandela released from prison?", "1985", "1988", "1990", "1994", 2, "M", "He was released on 11 February 1990 after 27 years."],
    ["In which year did the Soviet Union dissolve?", "1985", "1989", "1991", "1995", 2, "M", "It split into fifteen independent countries."],
    ["The Great Zimbabwe ruins were built by the ancestors of which people?", "Zulu", "Shona", "Ndebele", "Bemba", 1, "H", "The name is thought to come from a Shona phrase meaning houses of stone."],
    ["In which year was the Magna Carta sealed?", "1066", "1215", "1415", "1588", 1, "H", "King John of England agreed to it at Runnymede."],
    ["The American Civil War was fought between which years?", "1845 to 1849", "1861 to 1865", "1875 to 1879", "1898 to 1902", 1, "H", "It ended with the abolition of slavery across the United States."],
  ],
  sport: [
    ["How many players from one team are on the pitch in a football match?", "9", "10", "11", "12", 2, "E", "That is ten outfield players and one goalkeeper."],
    ["Which country won the 2022 FIFA World Cup?", "France", "Argentina", "Brazil", "Croatia", 1, "E", "Argentina beat France on penalties after a 3-3 draw in Qatar."],
    ["What is the nickname of Zambia's national football team?", "Bafana Bafana", "Chipolopolo", "Super Eagles", "Black Stars", 1, "E", "Chipolopolo means copper bullets."],
    ["Which sport uses a shuttlecock?", "Squash", "Tennis", "Badminton", "Table tennis", 2, "E", "The shuttlecock is traditionally made with goose feathers."],
    ["How many rings are on the Olympic flag?", "4", "5", "6", "7", 1, "E", "They represent the five inhabited continents in the original design."],
    ["On which surface is the Wimbledon tennis championship played?", "Clay", "Hard court", "Grass", "Carpet", 2, "E", "Wimbledon is the only Grand Slam still played on grass."],
    ["Which country hosted the 2010 FIFA World Cup?", "Brazil", "Germany", "South Africa", "Nigeria", 2, "M", "It was the first World Cup held in Africa."],
    ["What is the distance of a marathon?", "40 km", "42.195 km", "45 km", "50 km", 1, "M", "The distance was set at the 1908 London Olympics and standardised in 1921."],
    ["Who has won the most Olympic gold medals of all time?", "Usain Bolt", "Carl Lewis", "Michael Phelps", "Larisa Latynina", 2, "M", "Phelps won 23 gold medals."],
    ["What is Usain Bolt's 100 metres world record time?", "9.58 seconds", "9.69 seconds", "9.74 seconds", "9.82 seconds", 0, "M", "He set it in Berlin in 2009."],
    ["In which sport would you perform a slam dunk?", "Volleyball", "Handball", "Basketball", "Netball", 2, "E", "A slam dunk is a shot forced down through the hoop."],
    ["Which country won the first FIFA World Cup in 1930?", "Brazil", "Argentina", "Italy", "Uruguay", 3, "H", "Uruguay hosted the tournament and beat Argentina in the final."],
    ["Which country is credited with inventing cricket?", "India", "Australia", "England", "West Indies", 2, "H", "The sport developed in southern England."],
    ["How many points is a basketball shot worth from behind the three-point line?", "2", "3", "4", "5", 1, "M", "The three-point line was introduced to the NBA in 1979."],
  ],
  music: [
    ["Which artist released the 1982 album Thriller?", "Prince", "Michael Jackson", "Stevie Wonder", "Lionel Richie", 1, "E", "Thriller is one of the best-selling albums of all time."],
    ["In which country was Bob Marley born?", "Trinidad", "Barbados", "Jamaica", "Cuba", 2, "E", "He became the face of reggae worldwide."],
    ["How many strings does a standard guitar have?", "4", "5", "6", "8", 2, "E", "A standard guitar is tuned E A D G B E."],
    ["Freddie Mercury was the lead singer of which band?", "The Beatles", "Queen", "Led Zeppelin", "The Rolling Stones", 1, "E", "Queen formed in London in 1970."],
    ["How many keys does a standard piano have?", "76", "82", "88", "96", 2, "M", "That is 52 white keys and 36 black keys."],
    ["Who is regarded as a pioneer of Afrobeat?", "King Sunny Ade", "Fela Kuti", "Hugh Masekela", "Youssou N'Dour", 1, "M", "Fela Kuti blended highlife, jazz and funk in Lagos."],
    ["Amapiano originated in which country?", "Nigeria", "Ghana", "South Africa", "Kenya", 2, "M", "It emerged from the townships of Gauteng."],
    ["Which city is the home of The Beatles?", "London", "Manchester", "Liverpool", "Glasgow", 2, "M", "They formed in Liverpool in 1960."],
    ["The mbira is best described as a...", "Thumb piano", "Drum", "Flute", "Harp", 0, "M", "It is closely associated with the Shona people of Zimbabwe."],
    ["Who sang the 2010 World Cup anthem 'Waka Waka (This Time for Africa)'?", "Beyonce", "Rihanna", "Shakira", "Jennifer Lopez", 2, "M", "South African band Freshlyground featured on the track."],
    ["Who is known as the Queen of Soul?", "Whitney Houston", "Aretha Franklin", "Diana Ross", "Tina Turner", 1, "M", "Her hit 'Respect' became an anthem of the civil rights era."],
    ["Kalindula is a popular music genre from which country?", "Zimbabwe", "Malawi", "Zambia", "Tanzania", 2, "M", "Kalindula grew popular in Zambia from the 1970s."],
    ["Which Nigerian artist won the 2021 Grammy for Best Global Music Album with 'Twice as Tall'?", "Wizkid", "Davido", "Burna Boy", "Tiwa Savage", 2, "H", "It was his first Grammy win."],
    ["How many beats does a whole note last in 4/4 time?", "1", "2", "3", "4", 3, "H", "A half note lasts two beats and a quarter note one."],
  ],
  film: [
    ["Which Marvel film is set in the fictional African nation of Wakanda?", "Thor", "Black Panther", "Iron Man", "Doctor Strange", 1, "E", "Black Panther was released in 2018."],
    ["Which country is the Netflix series Squid Game from?", "Japan", "China", "South Korea", "Thailand", 2, "E", "It became one of the most-watched series in streaming history."],
    ["Which studio made the film Toy Story?", "DreamWorks", "Pixar", "Illumination", "Blue Sky", 1, "E", "Toy Story was the first fully computer-animated feature film."],
    ["Which country's film industry is known as Nollywood?", "Ghana", "Kenya", "South Africa", "Nigeria", 3, "E", "Nollywood is among the largest film industries in the world by output."],
    ["In The Lion King, who is Simba's father?", "Scar", "Mufasa", "Rafiki", "Zazu", 1, "E", "Mufasa is voiced by James Earl Jones in the 1994 film."],
    ["Which TV series features the saying 'Winter is coming'?", "The Witcher", "Vikings", "Game of Thrones", "The Last Kingdom", 2, "E", "It is the motto of House Stark."],
    ["Who directed the 1997 film Titanic?", "Steven Spielberg", "James Cameron", "Ridley Scott", "Christopher Nolan", 1, "M", "Titanic won 11 Academy Awards."],
    ["Which South Korean film won Best Picture at the 2020 Oscars?", "Burning", "Oldboy", "Parasite", "Train to Busan", 2, "M", "It was the first non-English-language film to win the top prize."],
    ["Which actor played Black Panther in the 2018 film?", "Michael B. Jordan", "Chadwick Boseman", "Idris Elba", "Daniel Kaluuya", 1, "M", "Boseman played T'Challa, king of Wakanda."],
    ["Who directed the film Pulp Fiction?", "Martin Scorsese", "Quentin Tarantino", "David Fincher", "Francis Ford Coppola", 1, "M", "It won the Palme d'Or at Cannes in 1994."],
    ["Which franchise features Captain Jack Sparrow?", "Pirates of the Caribbean", "Peter Pan", "Treasure Island", "The Goonies", 0, "E", "Johnny Depp played the role."],
    ["Which film is widely regarded as the first full-length cel-animated feature, released in 1937?", "Pinocchio", "Bambi", "Snow White and the Seven Dwarfs", "Fantasia", 2, "H", "Disney released it in December 1937."],
    ["Who directed the 2018 film Lionheart, Nigeria's first submission for the Oscars' international film category?", "Kunle Afolayan", "Genevieve Nnaji", "Funke Akindele", "Mo Abudu", 1, "H", "It was later disqualified because much of the dialogue is in English."],
    ["Which school does Harry Potter attend?", "Beauxbatons", "Durmstrang", "Hogwarts", "Ilvermorny", 2, "E", "Hogwarts is in Scotland in the books."],
  ],
  tech: [
    ["What does CPU stand for?", "Central Processing Unit", "Computer Personal Unit", "Core Power Utility", "Central Program Update", 0, "E", "The CPU carries out the instructions of a program."],
    ["Which language is used to style web pages?", "HTML", "CSS", "SQL", "Python", 1, "E", "CSS stands for Cascading Style Sheets."],
    ["Which company develops the Android operating system?", "Apple", "Microsoft", "Google", "Samsung", 2, "E", "Android was first released in 2008."],
    ["Which company makes the Windows operating system?", "Apple", "Microsoft", "IBM", "Oracle", 1, "E", "Windows was first released in 1985."],
    ["Who is credited with inventing the World Wide Web?", "Bill Gates", "Tim Berners-Lee", "Steve Jobs", "Vint Cerf", 1, "M", "He proposed it at CERN in 1989."],
    ["What does HTML stand for?", "HyperText Markup Language", "High Tech Modern Language", "HyperTransfer Machine Language", "Home Tool Markup Language", 0, "M", "HTML describes the structure of web pages."],
    ["Bitcoin was created by a person or group using which name?", "Vitalik Buterin", "Satoshi Nakamoto", "Hal Finney", "Nick Szabo", 1, "M", "The real identity has never been confirmed."],
    ["In which year was the first iPhone released?", "2005", "2007", "2009", "2011", 1, "M", "It went on sale in the United States in June 2007."],
    ["M-Pesa, the mobile money service, launched in 2007 in which country?", "Tanzania", "Uganda", "Kenya", "Ghana", 2, "M", "It was launched by Safaricom and Vodafone."],
    ["What does USB stand for?", "Universal Serial Bus", "United System Board", "Universal Signal Base", "Unified Storage Block", 0, "M", "USB standardised how devices connect to computers."],
    ["Google was founded by Larry Page and which other person?", "Eric Schmidt", "Sergey Brin", "Jack Dorsey", "Sundar Pichai", 1, "M", "They met as students at Stanford."],
    ["What does HTTP stand for?", "HyperText Transfer Protocol", "High Transfer Text Process", "HyperText Transmission Package", "Hyperlink Terminal Protocol", 0, "M", "HTTPS is the secure version."],
    ["Which company made the first handheld mobile phone call, in 1973?", "Nokia", "Motorola", "Ericsson", "Bell Labs", 1, "H", "Martin Cooper of Motorola made the call."],
    ["Which company did Mark Zuckerberg co-found in 2004?", "Twitter", "Facebook", "Snapchat", "LinkedIn", 1, "E", "It was later renamed Meta."],
  ],
  food: [
    ["Nshima, the Zambian staple, is mainly made from what?", "Rice flour", "Maize meal", "Wheat flour", "Millet husks", 1, "E", "Maize meal is cooked in boiling water until thick."],
    ["Hummus is mainly made from which ingredient?", "Lentils", "Chickpeas", "Black beans", "Peanuts", 1, "E", "Tahini, lemon and garlic are added."],
    ["Guacamole is mainly made from which fruit?", "Mango", "Avocado", "Papaya", "Guava", 1, "E", "The word comes from the Aztec language Nahuatl."],
    ["Which country is sushi most associated with?", "China", "Korea", "Japan", "Thailand", 2, "E", "It is traditionally made with vinegared rice."],
    ["Which vitamin are citrus fruits especially rich in?", "Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D", 2, "E", "Vitamin C helps the body heal and absorb iron."],
    ["Jollof rice is a famous dish from which region?", "East Africa", "West Africa", "North Africa", "Southern Africa", 1, "M", "Nigeria and Ghana both claim the best version."],
    ["Which is the most expensive spice by weight?", "Vanilla", "Cardamom", "Saffron", "Cinnamon", 2, "M", "Saffron comes from the stigmas of crocus flowers."],
    ["In which country is the coffee plant native?", "Ethiopia", "Colombia", "Vietnam", "Indonesia", 0, "M", "Coffea arabica grew wild in the highlands of Ethiopia before it was farmed."],
    ["Kapenta, popular in Zambia, is a type of what?", "Small dried fish", "Wild mushroom", "Groundnut", "Pumpkin leaf", 0, "M", "It is caught in lakes such as Kariba and Tanganyika."],
    ["Tofu is made from which crop?", "Rice", "Soybeans", "Wheat", "Maize", 1, "M", "It is made by curdling soy milk."],
    ["Which country produces the most coffee in the world?", "Ethiopia", "Colombia", "Vietnam", "Brazil", 3, "M", "Brazil has led world coffee output for more than 150 years."],
    ["Chikanda, sometimes called African polony, is made from what?", "Cassava root", "Wild orchid tubers", "Groundnuts", "Sweet potato", 1, "H", "It is a delicacy from northern Zambia."],
    ["In which Italian city did pizza originate?", "Rome", "Milan", "Naples", "Venice", 2, "H", "Neapolitan pizza has UNESCO recognition for its making."],
    ["Wine is made from fermenting which fruit?", "Apples", "Grapes", "Plums", "Cherries", 1, "E", "Different grape varieties make different wines."],
  ],
  nature: [
    ["Which is the largest land animal?", "Rhinoceros", "African elephant", "Hippopotamus", "Giraffe", 1, "E", "A male African elephant can weigh over six tonnes."],
    ["Which is the fastest land animal?", "Lion", "Cheetah", "Pronghorn", "Greyhound", 1, "E", "A cheetah can reach about 100 kilometres an hour in short bursts."],
    ["Which is the tallest animal in the world?", "Elephant", "Ostrich", "Giraffe", "Camel", 2, "E", "A giraffe can be up to about 5.5 metres tall."],
    ["How many legs does an insect have?", "4", "6", "8", "10", 1, "E", "Spiders have eight legs, so they are not insects."],
    ["What is a group of lions called?", "Pack", "Pride", "Herd", "Troop", 1, "E", "A pride is usually built around related females."],
    ["What do giant pandas mainly eat?", "Bamboo", "Fish", "Berries", "Eucalyptus", 0, "E", "They can eat more than 10 kilograms a day."],
    ["Which is the only mammal capable of true sustained flight?", "Flying squirrel", "Bat", "Sugar glider", "Colugo", 1, "M", "Bats make up about a fifth of all mammal species."],
    ["Which is the largest animal that has ever lived?", "Megalodon", "Blue whale", "Argentinosaurus", "Sperm whale", 1, "M", "A blue whale can reach about 30 metres in length."],
    ["Which African tree is nicknamed the upside-down tree?", "Acacia", "Baobab", "Mopane", "Marula", 1, "M", "Its branches resemble roots reaching into the sky."],
    ["Which is the largest living bird?", "Emu", "Albatross", "Ostrich", "Condor", 2, "M", "Ostriches cannot fly but can run at around 70 kilometres an hour."],
    ["Which is the largest of the big cats?", "Lion", "Tiger", "Jaguar", "Leopard", 1, "M", "The Siberian tiger is the biggest subspecies."],
    ["The Great Migration of wildebeest crosses between which two countries?", "Zambia and Botswana", "Kenya and Tanzania", "Uganda and Rwanda", "Namibia and Angola", 1, "M", "It circles between the Serengeti and the Maasai Mara."],
    ["Which land animal has the longest pregnancy, about 22 months?", "Giraffe", "Rhinoceros", "Elephant", "Hippopotamus", 2, "H", "Elephant calves can weigh around 100 kilograms at birth."],
    ["Which animal is known to have fingerprints almost identical to humans'?", "Chimpanzee", "Koala", "Lemur", "Sloth", 1, "H", "The similarity is thought to be an example of convergent evolution."],
  ],
  general: [
    ["How many days are in a leap year?", "364", "365", "366", "367", 2, "E", "An extra day is added to February roughly every four years."],
    ["How many sides does a hexagon have?", "5", "6", "7", "8", 1, "E", "Honeycomb cells are hexagons."],
    ["What is the currency of Japan?", "Won", "Yuan", "Yen", "Baht", 2, "E", "The yen has been Japan's currency since 1871."],
    ["Which planet is known as the Red Planet?", "Venus", "Mars", "Jupiter", "Mercury", 1, "E", "Iron oxide on its surface gives it a red colour."],
    ["How many colours are traditionally listed in a rainbow?", "5", "6", "7", "8", 2, "E", "They are red, orange, yellow, green, blue, indigo and violet."],
    ["How many continents are there?", "5", "6", "7", "8", 2, "E", "The count varies by model, but seven is the most common."],
    ["Which two colours mixed together make purple?", "Red and blue", "Red and yellow", "Blue and yellow", "Green and red", 0, "E", "Purple sits between red and blue on the colour wheel."],
    ["What number does the Roman numeral L represent?", "10", "50", "100", "500", 1, "M", "C is 100 and D is 500."],
    ["What is the smallest prime number?", "0", "1", "2", "3", 2, "M", "Two is the only even prime number."],
    ["Which language has the most native speakers?", "English", "Spanish", "Hindi", "Mandarin Chinese", 3, "M", "More than 900 million people speak a form of Mandarin as a first language."],
    ["How many minutes are in a day?", "1,240", "1,440", "1,640", "2,400", 1, "M", "That is 24 hours times 60 minutes."],
    ["Which is the longest bone in the human body?", "Humerus", "Tibia", "Femur", "Spine", 2, "M", "The femur is the thigh bone."],
    ["Which metal is liquid at room temperature?", "Lead", "Mercury", "Tin", "Zinc", 1, "M", "Mercury freezes at about minus 39 degrees Celsius."],
    ["What is the square root of 144?", "10", "11", "12", "14", 2, "E", "Twelve times twelve is 144."],
    ["What is the capital of Switzerland?", "Zurich", "Geneva", "Bern", "Basel", 2, "H", "Zurich is the largest city, but Bern is the federal city and seat of government."],
    ["In which year were the first modern Olympic Games held?", "1876", "1896", "1900", "1924", 1, "H", "They took place in Athens in 1896 with 14 nations taking part."],
  ],
};

export type Question = {
  id: string;
  cat: string;
  q: string;
  options: [string, string, string, string]; // original order; correct answer at `answer`
  answer: number;
  diff: Diff;
  fact: string;
};

function build(): Question[] {
  const out: Question[] = [];
  for (const cat of CATEGORIES) {
    const rows = RAW[cat.id] ?? [];
    rows.forEach((r, i) => {
      out.push({
        id: `${cat.id}-${i}`,
        cat: cat.id,
        q: r[0],
        options: [r[1], r[2], r[3], r[4]],
        answer: r[5],
        diff: r[6],
        fact: r[7],
      });
    });
  }
  return out;
}

export const BANK: Question[] = build();
export const BY_ID: Map<string, Question> = new Map(BANK.map((q) => [q.id, q]));

export function depth(): Record<string, number> {
  const d: Record<string, number> = {};
  for (const q of BANK) d[q.cat] = (d[q.cat] ?? 0) + 1;
  return d;
}
