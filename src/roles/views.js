// "What ClubOS means for [role]": what each role sees in ClubOS today, as three UI blocks
// (after the "What the ___ sees today" view on the ClubOS homepage design). Data + HTML; roles.js mounts it.
// benefits: which roles.js ROLES entry supplies that role's three benefit cards (below the view).
// Line icons, one per role (stroke = currentColor), shown in the role row and on each role's first block
const svg = (d) => `<svg class="ri" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  coach: svg('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>'),          // clipboard
  physio: svg('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M8 12h2l1-2 2 4 1-2h2"/>'), // heart + pulse
  perf: svg('<path d="M3 12h4l3-8 4 16 3-8h4"/>'),                                                                       // activity
  scout: svg('<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>'),                                               // search
  analyst: svg('<path d="M4 20h16M7 16v-5M12 16V6M17 16v-8"/>'),                                                         // bar chart
  player: svg('<path d="M8 3 4 5.5 5.5 10 8 9v12h8V9l2.5 1L20 5.5 16 3a4 4 0 0 1-8 0z"/>'),                               // shirt
  td: svg('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>'),   // briefcase
};

export const VIEWS = [
 {
  "id": "coaches",
  "name": "Coaches",
  "ri": "coach", "label": "Coach", "icon": ICON.coach,
  "benefits": "coaches",
  "cards": [
   {
    "viz": "coach",
    "l": "Last match",
    "v": "SIU 3–1 Auckland FC",
    "s": "Pro League round 11 · match stats",
    "hbar": [
     [
      "Possession",
      56,
      0,
      "56%",
      "b"
     ],
     [
      "Expected goals",
      71,
      0,
      "2.14",
      "b"
     ],
     [
      "Shots on target",
      70,
      0,
      "7",
      "b"
     ],
     [
      "Pass accuracy",
      84,
      0,
      "84%",
      "b"
     ],
     [
      "Duels won",
      52,
      0,
      "52%",
      "b"
     ]
    ],
    "hnote": "South Island United · Pro League round 11",
    "ic": "chart"
   },
   {
    "l": "Calendar",
    "v": "10:30",
    "s": "Session plan with timed drills · Pitch 2",
    "tl": [
     [
      "09:00",
      "Prepare · session plan",
      0
     ],
     [
      "10:30",
      "Training",
      1
     ],
     [
      "14:00",
      "Player evaluations",
      0
     ],
     [
      "16:00",
      "Squad named for Saturday",
      0
     ]
    ]
   },
   {
    "l": "Tasks & Notifications",
    "v": "3 things",
    "s": "before you pick the team",
    "list": [
     [
      "r",
      "Riley Webster",
      "Flagged by Medical · back 20 Nov"
     ],
     [
      "o",
      "4 evaluations",
      "Player development reviews due"
     ],
     [
      "b",
      "Training register",
      "Attendance for today’s session"
     ]
    ]
   }
  ]
 },
 {
  "id": "physios",
  "name": "Physios",
  "ri": "physio", "label": "Physio", "icon": ICON.physio,
  "benefits": "medical",
  "cards": [
   {
    "viz": "physio",
    "l": "What keeps happening",
    "v": "Riley Webster",
    "s": "Central midfielder · muscle injury, 15 days lost",
    "hbar": [
     [
      "Hamstring",
      100,
      0,
      "4",
      "r"
     ],
     [
      "Groin",
      25,
      0,
      "1",
      "o"
     ],
     [
      "Ankle",
      25,
      0,
      "1",
      "o"
     ],
     [
      "Knee",
      25,
      0,
      "1",
      "o"
     ],
     [
      "Calf",
      25,
      0,
      "1",
      "o"
     ]
    ],
    "hnote": "8 injuries on record · expected back 20 Nov",
    "ic": "pulse"
   },
   {
    "l": "Calendar",
    "v": "09:30",
    "s": "Treatment · Riley Webster",
    "tl": [
     [
      "08:55",
      "Status shared with coaches",
      0
     ],
     [
      "09:30",
      "Treatment · Riley Webster",
      1
     ],
     [
      "11:00",
      "Rehab · Nate Nguyen",
      0
     ],
     [
      "14:00",
      "Case notes",
      0
     ]
    ]
   },
   {
    "l": "Tasks & Notifications",
    "v": "3 players",
    "s": "on the availability board",
    "list": [
     [
      "r",
      "Riley Webster",
      "Hamstring (left) · back 20 Nov"
     ],
     [
      "r",
      "Nate Nguyen",
      "Out, hamstring · back about 30 Nov"
     ],
     [
      "o",
      "Ashton Holmes",
      "Ill since Thursday"
     ]
    ]
   }
  ]
 },
 {
  "id": "performance",
  "name": "Performance coaches",
  "ri": "perf", "label": "Performance coach", "icon": ICON.perf,
  "benefits": "performance",
  "cards": [
   {
    "viz": "perf",
    "l": "Readiness",
    "v": "13 of 21 ready",
    "s": "MD-1 · check-ins 19 of 21",
    "dots": [
     "g",
     "g",
     "g",
     "g",
     "g",
     "g",
     "g",
     "g",
     "g",
     "g",
     "g",
     "g",
     "g",
     "y",
     "y",
     "y",
     "y",
     "o",
     "o",
     "r",
     "r"
    ],
    "legend": [
     [
      "g",
      "13 ready"
     ],
     [
      "y",
      "4 need a look"
     ],
     [
      "o",
      "2 modified"
     ],
     [
      "r",
      "2 unavailable"
     ]
    ],
    "ic": "gauge"
   },
   {
    "l": "Calendar",
    "v": "10:30",
    "s": "MD-1 · light session",
    "tl": [
     [
      "08:30",
      "Readiness and check-ins",
      0
     ],
     [
      "10:30",
      "Training",
      1
     ],
     [
      "12:30",
      "Gym · upper body",
      0
     ],
     [
      "15:00",
      "Testing · CMJ",
      0
     ]
    ]
   },
   {
    "l": "Tasks & Notifications",
    "v": "3 players",
    "s": "need a look today",
    "list": [
     [
      "o",
      "Patrick Booth",
      "Load 1.38 · fatigue, sore"
     ],
     [
      "o",
      "Beau Jones",
      "Load 1.21 · extra minutes"
     ],
     [
      "y",
      "George Ross",
      "CMJ 8% under normal"
     ]
    ]
   }
  ]
 },
 {
  "id": "scouts",
  "name": "Scouts",
  "ri": "scout", "label": "Scout", "icon": ICON.scout,
  "benefits": "recruitment",
  "cards": [
   {
    "viz": "scout",
    "l": "Recruitment pipeline",
    "v": "19 players",
    "s": "Pro League · player database",
    "board": [
     [
      "Discovery",
      "5",
      [
       "RW",
       "CB",
       "GK"
      ],
      "+2"
     ],
     [
      "Monitoring",
      "5",
      [
       "AM",
       "RB",
       "LW"
      ],
      "+2"
     ],
     [
      "Evaluation",
      "4",
      [
       "ST",
       "CB",
       "RW"
      ],
      "+1"
     ],
     [
      "Trial",
      "3",
      [
       "LB",
       "CM",
       "DM"
      ],
      ""
     ],
     [
      "Decision",
      "2",
      [
       "RW",
       "CB"
      ],
      ""
     ]
    ],
    "ic": "board"
   },
   {
    "l": "Calendar",
    "v": "10:30",
    "s": "Trial · Jayden Cooper, LB",
    "tl": [
     [
      "10:30",
      "Trial · Jayden Cooper",
      1
     ],
     [
      "13:00",
      "Report · club template",
      0
     ],
     [
      "15:00",
      "Video · Auckland City",
      0
     ],
     [
      "19:30",
      "Live match scouting",
      0
     ]
    ]
   },
   {
    "l": "Tasks & Notifications",
    "v": "3 things",
    "s": "this week",
    "list": [
     [
      "r",
      "Mitchell Bishop",
      "RW · high priority, decision due"
     ],
     [
      "b",
      "Jayden Cooper",
      "Trial report after training"
     ],
     [
      "o",
      "4 players",
      "In evaluation, need a report"
     ]
    ]
   }
  ]
 },
 {
  "id": "analysts",
  "name": "Analysts",
  "ri": "analyst", "label": "Analyst", "icon": ICON.analyst,
  "benefits": "everyone",
  "cards": [
   {
    "l": "Match plan",
    "v": "Build-up vs 4-4-2",
    "s": "Under 17 vs VV Heidemeer · Tactic Builder",
    "steps": [
     "Keeper to RCB",
     "RCB carries",
     "Into the 10",
     "Switch to LW"
    ],
    "cur": 1,
    "ic": "tactic"
   },
   {
    "l": "Calendar",
    "v": "15:00",
    "s": "Present the plan to the squad",
    "tl": [
     [
      "09:00",
      "Code match video",
      0
     ],
     [
      "13:00",
      "Opposition · danger players",
      0
     ],
     [
      "15:00",
      "Present the plan",
      1
     ],
     [
      "16:30",
      "Clips to players",
      0
     ]
    ]
   },
   {
    "l": "Tasks & Notifications",
    "v": "3 things",
    "s": "before Saturday",
    "list": [
     [
      "o",
      "Their 9",
      "Screens our 6 · plan for it"
     ],
     [
      "b",
      "Corners",
      "6 boards, for and against"
     ],
     [
      "g",
      "Match report",
      "Built from last week’s data"
     ]
    ]
   }
  ]
 },
 {
  "id": "players",
  "name": "Players",
  "ri": "player", "label": "Player", "icon": ICON.player,
  "benefits": "players",
  "cards": [
   {
    "l": "Player app",
    "phone": {
     "date": "Friday 13 November",
     "hello": "Morning, Sione",
     "md": "MD-3",
     "next": "Monday at Auckland FC Reserves",
     "q": "How do you feel today?",
     "due": "Before 09:30",
     "btn": "Send check-in",
     "rate": [
      [
       "Sleep",
       4
      ],
      [
       "Energy",
       4
      ],
      [
       "Soreness",
       2
      ],
      [
       "Mood",
       4
      ]
     ]
    },
    "ic": "phone"
   },
   {
    "l": "Calendar",
    "v": "10:30",
    "s": "Training · MD-3",
    "tl": [
     [
      "09:30",
      "Check-in due",
      0
     ],
     [
      "10:30",
      "Training",
      1
     ],
     [
      "12:00",
      "How hard was training?",
      0
     ],
     [
      "15:00",
      "Gym · lower body",
      0
     ]
    ]
   },
   {
    "l": "Tasks & Notifications",
    "v": "3 things",
    "s": "due soon",
    "list": [
     [
      "o",
      "Morning check-in",
      "Due today, before 09:30"
     ],
     [
      "b",
      "Weekly reflection",
      "Before tomorrow 12:00"
     ],
     [
      "g",
      "Next match",
      "Mon 20:00 at Auckland FC Reserves"
     ]
    ]
   }
  ]
 },
 {
  "id": "technical-directors",
  "name": "Technical directors",
  "ri": "td", "label": "Technical director", "icon": ICON.td,
  "benefits": "admins",
  "cards": [
   {
    "viz": "td",
    "l": "Contracts",
    "v": "3 to decide",
    "s": "Renew, re-negotiate, let expire or sell",
    "tline": [
     [
      "Daan de Wit",
      "Jun 2027 · Decision Room",
      50,
      "r"
     ],
     [
      "Kerr",
      "Jun 2027 · re-negotiate",
      50,
      "o"
     ],
     [
      "Lars de Groot",
      "Jun 2028 · secure",
      92,
      "g"
     ]
    ],
    "axis": [
     "Now",
     "Jun 2027",
     "Jun 2028"
    ],
    "ic": "file"
   },
   {
    "l": "Calendar",
    "v": "11:00",
    "s": "Decision Room · Daan de Wit’s contract",
    "tl": [
     [
      "08:45",
      "Staff meeting",
      0
     ],
     [
      "11:00",
      "Decision Room",
      1
     ],
     [
      "14:00",
      "Trial report · Jesper Smit",
      0
     ],
     [
      "15:00",
      "Pipeline review",
      0
     ]
    ]
   },
   {
    "l": "Tasks & Notifications",
    "v": "3 things",
    "s": "recruitment and squad",
    "list": [
     [
      "b",
      "Jesper Smit",
      "Trial report due today"
     ],
     [
      "o",
      "2 players",
      "In evaluation, waiting on you"
     ],
     [
      "r",
      "Right-back",
      "Kerr, 32, is the only one"
     ]
    ]
   }
  ]
 }
];


// The first card's visual for five roles, from the "Your space in ClubOS" section of the ClubOS homepage design
// (updated there on 2026-11-26: clearer, simpler visuals; Analyst and Player unchanged). Static markup, as drawn
// there; styled in roles.css (.vz …). A card with `viz` shows this instead of its older visual.
const VIZ = {
 "coach": "<div class=\"vz vz-h2h\"><div class=\"vz-h2h-t\"><span><i class=\"us\"></i>South Island United</span><span>Auckland FC<i></i></span></div><div class=\"vz-h2h-r\"><b>56%</b><span>Possession</span><b>44%</b><i class=\"vz-h2h-bar\"><u style=\"width:56%\"></u></i></div><div class=\"vz-h2h-r\"><b>2.14</b><span>Expected goals</span><b>0.87</b><i class=\"vz-h2h-bar\"><u style=\"width:71%\"></u></i></div><div class=\"vz-h2h-r\"><b>7</b><span>Shots on target</span><b>3</b><i class=\"vz-h2h-bar\"><u style=\"width:70%\"></u></i></div><div class=\"vz-h2h-r\"><b>84%</b><span>Pass accuracy</span><b>76%</b><i class=\"vz-h2h-bar\"><u style=\"width:53%\"></u></i></div><div class=\"vz-h2h-r\"><b>52%</b><span>Duels won</span><b>48%</b><i class=\"vz-h2h-bar\"><u style=\"width:52%\"></u></i></div></div>",
 "physio": "<div class=\"vz vz-inj vz-inj2\"><svg class=\"vz-body2\" viewBox=\"10 1 80 206\" role=\"img\" aria-label=\"Back view: right hamstring injured four times, groin, knee, calf and ankle once each\"><defs><linearGradient id=\"vzSkin\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"206\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#D6DDE5\"/><stop offset=\"1\" stop-color=\"#BFC8D3\"/></linearGradient><linearGradient id=\"vzHot\" x1=\"0\" y1=\"108\" x2=\"0\" y2=\"150\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#FCD34D\"/><stop offset=\".55\" stop-color=\"#F59E0B\"/><stop offset=\"1\" stop-color=\"#EA580C\"/></linearGradient><radialGradient id=\"vzGlow\"><stop offset=\"0\" stop-color=\"#F59E0B\" stop-opacity=\".35\"/><stop offset=\"1\" stop-color=\"#F59E0B\" stop-opacity=\"0\"/></radialGradient><clipPath id=\"vzClip\"><path d=\"M50 4 C44.6 4 41.4 8.6 41.6 14.4 C41.8 19.6 43.6 23.4 46 25.2 C46.2 27.4 46 29.2 45 30.4 C41 32.4 35 33.2 30.6 34.8 C25.6 36.6 22.6 40.6 22 46.4 C21.2 52 20 58 19.6 64 C19.2 70 18 78 17.4 86 C17.1 89.6 16.8 92.4 17 94.6 C16.4 97.6 17 102.4 19.4 103.4 C21.8 104.2 23.2 101 23 97.6 C22.9 95.6 22.6 94.6 22.6 93.6 C23.6 86 25 78 26 71 C26.8 65 27.6 60 28.4 55.6 C29.4 51.4 30.2 49.6 31 49.4 C31.6 56 32.6 64 34.2 72 C35 77 35.2 82 34.8 87 C34.2 92 33.8 99 34.4 106 C35 120 36 134 37.6 146 C38 150 37.6 154 37 157 C35.4 164 35.2 172 37.2 180 C38.2 184 39 188 39.6 194 C39.4 198 39.6 201.6 42.4 202 C45 202.4 46.4 200.6 46.2 197.6 C46 194 46 190 46.4 186 C47.8 178 48.6 168 47.8 160 C47.6 156 47.4 152.6 47.6 149 C48.2 138 48.8 124 49.2 113 C49.4 112 49.7 111.6 50 111.6 C50.3 111.6 50.6 112 50.8 113 C51.2 124 51.8 138 52.4 149 C52.6 152.6 52.4 156 52.2 160 C51.4 168 52.2 178 53.6 186 C54 190 54 194 53.8 197.6 C53.6 200.6 55 202.4 57.6 202 C60.4 201.6 60.6 198 60.4 194 C61 188 61.8 184 62.8 180 C64.8 172 64.6 164 63 157 C62.4 154 62 150 62.4 146 C64 134 65 120 65.6 106 C66.2 99 65.8 92 65.2 87 C64.8 82 65 77 65.8 72 C67.4 64 68.4 56 69 49.4 C69.8 49.6 70.6 51.4 71.6 55.6 C72.4 60 73.2 65 74 71 C75 78 76.4 86 77.4 93.6 C77.4 94.6 77.1 95.6 77 97.6 C76.8 101 78.2 104.2 80.6 103.4 C83 102.4 83.6 97.6 83 94.6 C83.2 92.4 82.9 89.6 82.6 86 C82 78 80.8 70 80.4 64 C80 58 78.8 52 78 46.4 C77.4 40.6 74.4 36.6 69.4 34.8 C65 33.2 59 32.4 55 30.4 C54 29.2 53.8 27.4 54 25.2 C56.4 23.4 58.2 19.6 58.4 14.4 C58.6 8.6 55.4 4 50 4 Z\"/></clipPath></defs><ellipse cx=\"50\" cy=\"203.6\" rx=\"16\" ry=\"2\" fill=\"#0F172A\" opacity=\".07\"/><ellipse cx=\"57.6\" cy=\"128\" rx=\"18\" ry=\"30\" fill=\"url(#vzGlow)\"/><path d=\"M50 4 C44.6 4 41.4 8.6 41.6 14.4 C41.8 19.6 43.6 23.4 46 25.2 C46.2 27.4 46 29.2 45 30.4 C41 32.4 35 33.2 30.6 34.8 C25.6 36.6 22.6 40.6 22 46.4 C21.2 52 20 58 19.6 64 C19.2 70 18 78 17.4 86 C17.1 89.6 16.8 92.4 17 94.6 C16.4 97.6 17 102.4 19.4 103.4 C21.8 104.2 23.2 101 23 97.6 C22.9 95.6 22.6 94.6 22.6 93.6 C23.6 86 25 78 26 71 C26.8 65 27.6 60 28.4 55.6 C29.4 51.4 30.2 49.6 31 49.4 C31.6 56 32.6 64 34.2 72 C35 77 35.2 82 34.8 87 C34.2 92 33.8 99 34.4 106 C35 120 36 134 37.6 146 C38 150 37.6 154 37 157 C35.4 164 35.2 172 37.2 180 C38.2 184 39 188 39.6 194 C39.4 198 39.6 201.6 42.4 202 C45 202.4 46.4 200.6 46.2 197.6 C46 194 46 190 46.4 186 C47.8 178 48.6 168 47.8 160 C47.6 156 47.4 152.6 47.6 149 C48.2 138 48.8 124 49.2 113 C49.4 112 49.7 111.6 50 111.6 C50.3 111.6 50.6 112 50.8 113 C51.2 124 51.8 138 52.4 149 C52.6 152.6 52.4 156 52.2 160 C51.4 168 52.2 178 53.6 186 C54 190 54 194 53.8 197.6 C53.6 200.6 55 202.4 57.6 202 C60.4 201.6 60.6 198 60.4 194 C61 188 61.8 184 62.8 180 C64.8 172 64.6 164 63 157 C62.4 154 62 150 62.4 146 C64 134 65 120 65.6 106 C66.2 99 65.8 92 65.2 87 C64.8 82 65 77 65.8 72 C67.4 64 68.4 56 69 49.4 C69.8 49.6 70.6 51.4 71.6 55.6 C72.4 60 73.2 65 74 71 C75 78 76.4 86 77.4 93.6 C77.4 94.6 77.1 95.6 77 97.6 C76.8 101 78.2 104.2 80.6 103.4 C83 102.4 83.6 97.6 83 94.6 C83.2 92.4 82.9 89.6 82.6 86 C82 78 80.8 70 80.4 64 C80 58 78.8 52 78 46.4 C77.4 40.6 74.4 36.6 69.4 34.8 C65 33.2 59 32.4 55 30.4 C54 29.2 53.8 27.4 54 25.2 C56.4 23.4 58.2 19.6 58.4 14.4 C58.6 8.6 55.4 4 50 4 Z\" fill=\"url(#vzSkin)\"/><path d=\"M50.6 109.6 C55 111.2 60.4 110.6 65 106 L67 106 L67 147.4 C61.6 151.6 55.8 151.4 52.2 148.6 Z\" fill=\"url(#vzHot)\" clip-path=\"url(#vzClip)\"/><g fill=\"none\" stroke=\"#fff\" stroke-width=\".9\" stroke-linecap=\"round\" opacity=\".95\"><path d=\"M50 30 V92\"/><path d=\"M50 92 V104\"/><path d=\"M45 30.4 C46.5 34 48 38 50 41\"/><path d=\"M55 30.4 C53.5 34 52 38 50 41\"/><path d=\"M33.6 38.6 C37 44 41 47.6 46.4 49\"/><path d=\"M66.4 38.6 C63 44 59 47.6 53.6 49\"/><path d=\"M46.4 49 C44 54 40 57.6 33.8 58\"/><path d=\"M53.6 49 C56 54 60 57.6 66.2 58\"/><path d=\"M31.6 64 C37 70 43 73 49.4 74\"/><path d=\"M68.4 64 C63 70 57 73 50.6 74\"/><path d=\"M35.4 88 C40 91.6 45 92.4 50 92\"/><path d=\"M64.6 88 C60 91.6 55 92.4 50 92\"/><path d=\"M35 106 C39.6 110.6 45 111.2 49.4 109.6\"/><path d=\"M65 106 C60.4 110.6 55 111.2 50.6 109.6\"/><path d=\"M42.6 114 C42.4 125 42.6 136 42.8 147\"/><path d=\"M57.4 114 C57.6 125 57.4 136 57.2 147\"/><path d=\"M38.4 150.6 C41.4 153 44.6 153 47.4 150.6\"/><path d=\"M61.6 150.6 C58.6 153 55.4 153 52.6 150.6\"/><path d=\"M42.4 158 C42 166 42.2 174 42.6 182\"/><path d=\"M57.6 158 C58 166 57.8 174 57.4 182\"/><path d=\"M22.4 60 C24 62 25.8 63 27.6 63\"/><path d=\"M77.6 60 C76 62 74.2 63 72.4 63\"/><path d=\"M22 46.4 C25 47.4 28 47 30.6 45\"/><path d=\"M78 46.4 C75 47.4 72 47 69.4 45\"/></g><circle class=\"vz-ring2\" cx=\"57.4\" cy=\"126\" r=\"6.4\" fill=\"none\" stroke=\"#EA580C\" stroke-width=\"1.2\"/><circle cx=\"57.4\" cy=\"126\" r=\"2.9\" fill=\"#fff\" stroke=\"#C2410C\" stroke-width=\"1.2\"/><g><circle cx=\"50\" cy=\"113\" r=\"4.2\" fill=\"#F59E0B\" stroke=\"#fff\" stroke-width=\"1.3\"/></g><g><circle cx=\"43\" cy=\"152\" r=\"4.2\" fill=\"#F59E0B\" stroke=\"#fff\" stroke-width=\"1.3\"/></g><g><circle cx=\"57\" cy=\"171\" r=\"4.2\" fill=\"#F59E0B\" stroke=\"#fff\" stroke-width=\"1.3\"/></g><g><circle cx=\"42.4\" cy=\"192\" r=\"4.2\" fill=\"#F59E0B\" stroke=\"#fff\" stroke-width=\"1.3\"/></g></svg><div class=\"vz-inj-l\"><p>Injuries on record</p><div class=\"vz-inj-r r\"><i></i><span>Hamstring<small>Right side · latest 15 days out</small></span><u><em style=\"width:100%\"></em></u><b>4</b></div><div class=\"vz-inj-r o\"><i></i><span>Groin</span><u><em style=\"width:25%\"></em></u><b>1</b></div><div class=\"vz-inj-r o\"><i></i><span>Knee</span><u><em style=\"width:25%\"></em></u><b>1</b></div><div class=\"vz-inj-r o\"><i></i><span>Calf</span><u><em style=\"width:25%\"></em></u><b>1</b></div><div class=\"vz-inj-r o\"><i></i><span>Ankle</span><u><em style=\"width:25%\"></em></u><b>1</b></div><small class=\"vz-inj-f\">8 in total · expected back 20 Nov</small></div></div>",
 "perf": "<div class=\"vz vz-ring\"><svg viewBox=\"0 0 88 88\" aria-hidden=\"true\"><circle cx=\"44\" cy=\"44\" r=\"34\" fill=\"none\" stroke=\"#EEF0F2\" stroke-width=\"10\"/><g transform=\"rotate(-90 44 44)\"><circle cx=\"44\" cy=\"44\" r=\"34\" class=\"vz-arc g\" stroke-dasharray=\"130.25 83.38\" stroke-dashoffset=\"0.00\"/><circle cx=\"44\" cy=\"44\" r=\"34\" class=\"vz-arc y\" stroke-dasharray=\"38.69 174.94\" stroke-dashoffset=\"-132.25\"/><circle cx=\"44\" cy=\"44\" r=\"34\" class=\"vz-arc o\" stroke-dasharray=\"18.35 195.28\" stroke-dashoffset=\"-172.94\"/><circle cx=\"44\" cy=\"44\" r=\"34\" class=\"vz-arc r\" stroke-dasharray=\"18.35 195.28\" stroke-dashoffset=\"-193.28\"/></g><text x=\"44\" y=\"47\" text-anchor=\"middle\" class=\"vz-ring-n\">13</text><text x=\"44\" y=\"59\" text-anchor=\"middle\" class=\"vz-ring-s\">of 21</text></svg><div class=\"vz-ring-l\"><div class=\"vz-rl g\"><i></i><b>13</b><span>ready</span></div><div class=\"vz-rl y\"><i></i><b>4</b><span>need a look</span></div><div class=\"vz-rl o\"><i></i><b>2</b><span>modified</span></div><div class=\"vz-rl r\"><i></i><b>2</b><span>unavailable</span></div></div></div>",
 "scout": "<div class=\"vz vz-fn\"><div class=\"vz-fn-r s0\"><span>Discovery</span><div class=\"vz-fn-t\"><div class=\"vz-fn-b\" style=\"width:100%\"><b>5</b><em><i>RW</i><i>CB</i><i>GK</i><i class=\"m\">+2</i></em></div></div></div><div class=\"vz-fn-r s1\"><span>Monitoring</span><div class=\"vz-fn-t\"><div class=\"vz-fn-b\" style=\"width:85%\"><b>5</b><em><i>AM</i><i>RB</i><i>LW</i><i class=\"m\">+2</i></em></div></div></div><div class=\"vz-fn-r s2\"><span>Evaluation</span><div class=\"vz-fn-t\"><div class=\"vz-fn-b\" style=\"width:70%\"><b>4</b><em><i>ST</i><i>CB</i><i>RW</i><i class=\"m\">+1</i></em></div></div></div><div class=\"vz-fn-r s3\"><span>Trial</span><div class=\"vz-fn-t\"><div class=\"vz-fn-b\" style=\"width:55%\"><b>3</b><em><i>LB</i><i>CM</i><i>DM</i></em></div></div></div><div class=\"vz-fn-r s4\"><span>Decision</span><div class=\"vz-fn-t\"><div class=\"vz-fn-b\" style=\"width:40%\"><b>2</b><em><i>RW</i><i>CB</i></em></div></div></div></div>",
 "td": "<div class=\"vz vz-ct\"><div class=\"vz-ct-ax\"><span>Now</span><span style=\"left:50%\">Jun 2027</span><span style=\"left:92%\">Jun 2028</span></div><div class=\"vz-ct-r r\"><b>Daan de Wit</b><div class=\"vz-ct-tr\"><i style=\"width:50%\"></i><em style=\"left:50%\">Decision Room</em></div></div><div class=\"vz-ct-r o\"><b>Kerr</b><div class=\"vz-ct-tr\"><i style=\"width:50%\"></i><em style=\"left:50%\">Re-negotiate</em></div></div><div class=\"vz-ct-r g\"><b>Lars de Groot</b><div class=\"vz-ct-tr\"><i style=\"width:92%\"></i><em style=\"left:92%\">Secure</em></div></div></div>"
};

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const segs = (n) => [1, 2, 3, 4, 5].map((k) => `<i class="rv-seg${k <= n ? ' on' : ''}"></i>`).join('');
const rate = (rows, cls = '') => `<ul class="rv-rate${cls}">${rows.map(([k, v]) => `<li><span>${esc(k)}</span><div class="rv-segs">${segs(v)}</div><b>${v}</b></li>`).join('')}</ul>`;

function phone(p) {
  return `<div class="rv-phone"><div class="rv-ph-screen">
    <div class="rv-ph-sb"><b>9:07</b><i class="rv-ph-island"></i><span class="rv-ph-ic"><i></i><i></i><i></i></span></div>
    <p class="rv-ph-d">${esc(p.date)}</p><b class="rv-ph-h">${esc(p.hello)}</b>
    <p class="rv-ph-md"><em>${esc(p.md)}</em><span>${esc(p.next)}</span></p>
    <div class="rv-ph-box"><p class="rv-ph-q"><b>${esc(p.q)}</b><em>${esc(p.due)}</em></p>${rate(p.rate, ' rv-ph-rate')}<span class="rv-ph-btn">${esc(p.btn)}</span></div>
  </div></div>`;
}

function visual(c) {
  if (c.viz && VIZ[c.viz]) return VIZ[c.viz];
  if (c.phone) return phone(c.phone);
  if (c.hbar) return `<ul class="rv-hbars">${c.hbar.map(([n, w, m, v, col]) => `<li class="rv-hb rv-${col}"><span class="rv-hb-n">${esc(n)}</span><div class="rv-hb-t"><i class="rv-hb-f" style="width:${w}%"></i>${m > 0 ? `<i class="rv-hb-m" style="left:${m}%"></i>` : ''}</div><b>${esc(v)}</b></li>`).join('')}</ul>${c.hnote ? `<p class="rv-note">${esc(c.hnote)}</p>` : ''}`;
  if (c.tl) return `<ol class="rv-tl">${c.tl.map(([t, txt, on]) => `<li class="rv-tl-row${on ? ' on' : ''}"><time>${esc(t)}</time><span>${esc(txt)}</span></li>`).join('')}</ol>`;
  if (c.list) return `<ul class="rv-list">${c.list.map(([col, n, s]) => `<li class="rv-li rv-${col}"><i></i><div><b>${esc(n)}</b><span>${esc(s)}</span></div></li>`).join('')}</ul>`;
  if (c.dots) return `<div class="rv-dots">${c.dots.map((d, i) => `<i class="rv-dot rv-${d}">${c.nums ? i + 1 : ''}</i>`).join('')}</div><div class="rv-legend">${(c.legend || []).map(([col, t]) => `<span class="rv-lg rv-${col}">${esc(t)}</span>`).join('')}</div>`;
  if (c.board) return `<div class="rv-board">${c.board.map(([k, n, chips, more], i) => `<div class="rv-col${i === c.board.length - 1 ? ' last' : ''}"><p><span>${esc(k)}</span><b>${esc(n)}</b></p><div class="rv-col-c">${chips.map((t) => `<i>${esc(t)}</i>`).join('')}${more ? `<em>${esc(more)}</em>` : ''}</div></div>`).join('')}</div>`;
  if (c.steps) return `<ol class="rv-steps">${c.steps.map((t, i) => `<li class="rv-step${i < c.cur ? ' done' : i === c.cur ? ' now' : ''}"><i></i><span>${esc(t)}</span></li>`).join('')}</ol>`;
  if (c.tline) return `<div class="rv-tline">${c.tline.map(([n, s, pos, col]) => `<div class="rv-tr rv-${col}"><div class="rv-tr-h"><b>${esc(n)}</b><span>${esc(s)}</span></div><div class="rv-tr-t"><i style="left:${pos}%"></i></div></div>`).join('')}<div class="rv-axis">${(c.axis || []).map((t) => `<span>${esc(t)}</span>`).join('')}</div></div>`;
  return '';
}

/** The three blocks for one role. */
export function viewCards(v) {
  return v.cards.map((c, i) => `<div class="sv-card${c.phone ? ' rv-phonecard' : ''}">
      <span class="sv-cl">${i === 0 ? `<span class="rv-zic">${v.icon}</span>` : ''}${esc(c.l)}</span>
      ${c.phone ? '' : `<b class="sv-cv">${esc(c.v)}</b><span class="sv-cs">${esc(c.s)}</span>`}
      <div class="rv-vis">${visual(c)}</div>
    </div>`).join('');
}
