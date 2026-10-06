import { Question } from "./types";

export const DEFAULT_QUESTIONS: Record<string, Question[]> = {
  "Geography": [
    {
      q: "Which majestic body of water forms the boundary between Zambia and Zimbabwe, powering the Kariba Dam?",
      opts: [
        "A) The Congo River",
        "B) The Kafue River",
        "C) The Zambezi River",
        "D) The Luangwa River"
      ],
      ans: "C",
      diff: "Easy",
      use: "Public League",
      fact: "The correct answer is C) The Zambezi River. The Nile is in North/East Africa, the Congo is in Central Africa, and the Orange River is in South Africa.",
      explanations: {
        "A": "The Congo River is in Central Africa, not between Zambia and Zimbabwe.",
        "B": "The Kafue River is entirely within Zambia.",
        "C": "The Zambezi River forms the natural boundary between Zambia and Zimbabwe.",
        "D": "The Luangwa River is a major tributary of the Zambezi, but does not form this specific border."
      },
      zambia: false
    },
    {
      q: "Which country is completely surrounded by South Africa, making it one of the world's few enclave nations?",
      opts: [
        "A) Eswatini",
        "B) Lesotho",
        "C) Botswana",
        "D) Namibia"
      ],
      ans: "B",
      diff: "Easy",
      use: "Public League",
      fact: "The correct answer is B) Lesotho. Eswatini shares borders with Mozambique, Botswana borders Zimbabwe/Zambia/Namibia, and Namibia borders Angola and Botswana.",
      explanations: {
        "A": "Eswatini shares borders with both South Africa and Mozambique.",
        "B": "Lesotho is entirely landlocked by South Africa.",
        "C": "Botswana borders South Africa, Namibia, and Zimbabwe.",
        "D": "Namibia borders South Africa, Botswana, and Angola."
      },
      zambia: false
    },
    {
      q: "The Great Rift Valley, stretching across Eastern Africa, is home to Lake Tanganyika. What distinction does this lake hold?",
      opts: [
        "A) The shallowest lake in the world",
        "B) The longest freshwater lake in the world",
        "C) The highest altitude saltwater lake",
        "D) The newest volcanic crater lake"
      ],
      ans: "B",
      diff: "Hard",
      use: "Institutional",
      fact: "Lake Tanganyika is the world's longest freshwater lake (673km) and holds approximately 18% of the world's available liquid freshwater.",
      explanations: {
        "A": "Lake Tanganyika is actually the second deepest lake in the world.",
        "B": "Lake Tanganyika holds the record as the longest freshwater lake in the world at 673km.",
        "C": "It is a freshwater lake, not a saltwater lake.",
        "D": "It is a rift lake, not a volcanic crater lake."
      },
      zambia: false
    }
  ],
  "Science": [
    {
      q: "Which element is the primary component of stars like our Sun, fueling their nuclear fusion engines?",
      opts: [
        "A) Helium",
        "B) Hydrogen",
        "C) Oxygen",
        "D) Nitrogen"
      ],
      ans: "B",
      diff: "Easy",
      use: "Institutional",
      fact: "The correct answer is B) Hydrogen. Helium is created from Hydrogen fusion. Oxygen and Nitrogen are heavier elements formed much later in a star's lifecycle.",
      explanations: {
        "A": "Helium is the byproduct of the nuclear fusion in stars, not the primary fuel.",
        "B": "Hydrogen makes up about 74% of the universe's mass and is the primary fuel for stars.",
        "C": "Oxygen is formed much later in a star's life.",
        "D": "Nitrogen is also formed much later in stellar nucleosynthesis."
      },
      zambia: false
    },
    {
      q: "How long does it take for light from the Sun to travel approximately 150 million kilometers to reach the Earth?",
      opts: [
        "A) 8 seconds",
        "B) 8 minutes",
        "C) 24 hours",
        "D) 1.3 seconds"
      ],
      ans: "B",
      diff: "Medium",
      use: "Public League",
      fact: "The correct answer is B) 8 minutes. 8 seconds is far too fast (light travels 300,000 km/s), 1.3 seconds is the time from the Moon, and 24 hours is the Earth's rotation.",
      explanations: {
        "A": "8 seconds is too fast; light travels at 300,000 km/s, so 150 million km takes longer.",
        "B": "It takes exactly 8 minutes and 20 seconds for sunlight to reach Earth.",
        "C": "24 hours is the time it takes for Earth to complete one rotation.",
        "D": "1.3 seconds is approximately how long it takes light to reach Earth from the Moon."
      },
      zambia: false
    },
    {
      q: "Which absolute temperature scale defines zero degrees as the complete cessation of all molecular thermodynamic movement?",
      opts: [
        "A) Celsius",
        "B) Fahrenheit",
        "C) Kelvin",
        "D) Rankine"
      ],
      ans: "C",
      diff: "Medium",
      use: "Championship",
      fact: "0 Kelvin (Absolute Zero) corresponds to -273.15 degrees Celsius. At this extreme temperature, all molecular motion freezes.",
      explanations: {
        "A": "Celsius sets zero at the freezing point of water.",
        "B": "Fahrenheit is a relative scale where zero is based on a brine solution.",
        "C": "The Kelvin scale is absolute, with zero representing the complete absence of heat.",
        "D": "Rankine is also an absolute scale, but it uses Fahrenheit intervals rather than Celsius ones."
      },
      zambia: false
    }
  ],
  "History": [
    {
      q: "Who was the legendary Carthaginian general who marched war elephants across the Alps to challenge Rome during the Second Punic War?",
      opts: [
        "A) Scipio Africanus",
        "B) Hannibal Barca",
        "C) Julius Caesar",
        "D) Nebuchadnezzar"
      ],
      ans: "B",
      diff: "Medium",
      use: "Public League",
      fact: "Hannibal crossed the Alps in 218 BC with roughly 38,000 infantry, 8,000 cavalry, and 37 elephants, scoring legendary victories.",
      explanations: {
        "A": "Scipio Africanus was the Roman general who defeated Hannibal.",
        "B": "Hannibal Barca is famous for his audacious crossing of the Alps with elephants.",
        "C": "Julius Caesar was a Roman general who conquered Gaul, not a Carthaginian.",
        "D": "Nebuchadnezzar was a king of Babylon."
      },
      zambia: false
    },
    {
      q: "Which ancient wonder of the world, located in Egypt, is the only one still standing fully intact today?",
      opts: [
        "A) The Lighthouse of Alexandria",
        "B) The Hanging Gardens of Babylon",
        "C) The Great Pyramid of Giza",
        "D) The Colossus of Rhodes"
      ],
      ans: "C",
      diff: "Easy",
      use: "Public League",
      fact: "The Great Pyramid of Giza was built around 2560 BC and was the tallest man-made structure in the world for over 3,800 years.",
      explanations: {
        "A": "The Lighthouse of Alexandria was destroyed by earthquakes.",
        "B": "The Hanging Gardens of Babylon may be a myth, but if they existed, they are long gone.",
        "C": "The Great Pyramid of Giza is the only one of the Seven Wonders of the Ancient World largely intact.",
        "D": "The Colossus of Rhodes collapsed during an earthquake."
      },
      zambia: false
    }
  ],
  "Sport": [
    {
      q: "In 2012, Zambia's national football team, the Chipolopolo, won a historic Africa Cup of Nations (AFCON) title. In which host city did they secure the win?",
      opts: [
        "A) Johannesburg, South Africa",
        "B) Libreville, Gabon",
        "C) Luanda, Angola",
        "D) Cairo, Egypt"
      ],
      ans: "B",
      diff: "Medium",
      use: "Public League",
      fact: "The emotional 2012 victory occurred in Libreville, Gabon, the very city where the legendary 1993 Zambian team perished in a tragic plane crash.",
      explanations: {
        "A": "Johannesburg hosted the final in 1996, but not 2012.",
        "B": "Libreville, Gabon hosted the final, making it a deeply emotional victory for Zambia.",
        "C": "Luanda hosted in 2010.",
        "D": "Cairo has hosted multiple finals, but not 2012."
      },
      zambia: true
    },
    {
      q: "Which legendary runner became the first sub-Saharan African to win an Olympic gold medal, running the Rome 1960 marathon barefoot?",
      opts: [
        "A) Eliud Kipchoge",
        "B) Abebe Bikila",
        "C) Haile Gebrselassie",
        "D) Kipchoge Keino"
      ],
      ans: "B",
      diff: "Medium",
      use: "Championship",
      fact: "Ethiopia's Abebe Bikila bought his running shoes hours before but found they did not fit comfortably, choosing to run barefoot instead.",
      explanations: {
        "A": "Eliud Kipchoge is a modern marathon legend.",
        "B": "Abebe Bikila ran barefoot in Rome 1960 to win gold.",
        "C": "Haile Gebrselassie is a legendary distance runner but debuted later.",
        "D": "Kipchoge Keino is a Kenyan middle and long-distance runner."
      },
      zambia: false
    }
  ],
  "Music": [
    {
      q: "Which classical composer famously wrote the 'Moonlight Sonata' while progressively losing his hearing?",
      opts: [
        "A) Wolfgang Amadeus Mozart",
        "B) Johann Sebastian Bach",
        "C) Ludwig van Beethoven",
        "D) Pyotr Ilyich Tchaikovsky"
      ],
      ans: "C",
      diff: "Easy",
      use: "Institutional",
      fact: "Beethoven began losing his hearing around age 28, yet went on to compose his legendary Ninth Symphony while completely deaf.",
      explanations: {
        "A": "Mozart did not lose his hearing.",
        "B": "Bach famously had issues with his eyesight late in life, not hearing.",
        "C": "Beethoven composed many of his masterpieces while going deaf.",
        "D": "Tchaikovsky did not suffer from profound hearing loss."
      },
      zambia: false
    }
  ],
  "Tech": [
    {
      q: "What does HTML stand for?",
      opts: [
        "A) Hyper Text Markup Language",
        "B) High Tech Machine Learning",
        "C) Hyper Transfer Metadata Link",
        "D) Home Tool Markup Language"
      ],
      ans: "A",
      diff: "Easy",
      use: "Public League",
      fact: "HTML is the standard markup language for documents designed to be displayed in a web browser.",
      explanations: {
        "A": "HTML stands for Hyper Text Markup Language.",
        "B": "This is a made up term.",
        "C": "This is a made up term.",
        "D": "This is a made up term."
      },
      zambia: false
    }
  ],
  "Movies": [
    {
      q: "Who directed the 1994 film 'Pulp Fiction'?",
      opts: [
        "A) Steven Spielberg",
        "B) Quentin Tarantino",
        "C) Martin Scorsese",
        "D) Christopher Nolan"
      ],
      ans: "B",
      diff: "Medium",
      use: "Public League",
      fact: "Tarantino won the Palme d'Or at the 1994 Cannes Film Festival for 'Pulp Fiction'.",
      explanations: {
        "A": "Spielberg directed films like Jurassic Park and Jaws.",
        "B": "Quentin Tarantino wrote and directed Pulp Fiction.",
        "C": "Scorsese is known for films like Goodfellas and Taxi Driver.",
        "D": "Nolan directed films like Inception and The Dark Knight."
      },
      zambia: false
    }
  ]
};

// Generates a backup question pool if any custom category is selected
export const getFallbackQuestionsForCategory = (category: string): Question[] => {
  if (DEFAULT_QUESTIONS[category]) {
    return DEFAULT_QUESTIONS[category];
  }
  // Fallback to Fun & Random or generic questions
  return [
    {
      q: `Which surprising fact about the category '${category}' highlights its global impact?`,
      opts: [
        "A) It is studied by over 90% of global research bodies",
        "B) Its core principles date back to ancient Egyptian records",
        "C) It serves as a universal standard across industries",
        "D) It remains one of the few fields without a Nobel prize category"
      ],
      ans: "C",
      diff: "Medium",
      use: "Public League",
      fact: `The study and celebration of ${category} brings diverse cultural lenses together in modern quizzes.`,
      explanations: {
        "A": "This is a plausible but incorrect distractor.",
        "B": "While ancient, this is not the universally defining fact.",
        "C": "It is highly standardized globally.",
        "D": "This is a made up fact for the quiz."
      },
      zambia: false
    },
    {
      q: `How does the global community participate in the advancement of ${category}?`,
      opts: [
        "A) By hosting international summits",
        "B) By contributing unique traditional knowledge systems",
        "C) By training the next cohort of digital innovators",
        "D) All of the above"
      ],
      ans: "D",
      diff: "Easy",
      use: "Institutional",
      fact: "International research centers and local communities are actively embedding heritage into global science and arts platforms.",
      explanations: {
        "A": "This is only one aspect.",
        "B": "This is only one aspect.",
        "C": "This is only one aspect.",
        "D": "All of these reflect global participation."
      },
      zambia: false
    },
    {
      q: `Which legendary explorer or expert in ${category} is celebrated for their groundbreaking work?`,
      opts: [
        "A) Marie Curie",
        "B) Ada Lovelace",
        "C) Sir Isaac Newton",
        "D) Albert Einstein"
      ],
      ans: "A",
      diff: "Hard",
      use: "Championship",
      fact: "Marie Curie was the first woman to win a Nobel Prize, and the only person to win a Nobel Prize in two different scientific fields.",
      explanations: {
        "A": "Marie Curie is renowned for her groundbreaking research on radioactivity.",
        "B": "Ada Lovelace was a pioneer in computing.",
        "C": "Newton is famous for laws of motion.",
        "D": "Einstein is known for relativity."
      },
      zambia: false
    }
  ];
};
