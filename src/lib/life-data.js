// Life-space data constants extracted from tracker_v2.jsx
// Plans, workouts, running progression, quotes.

// ---------- PLAN DATA ----------
const PLAN = [
  {
    phase: 1, name: 'Foundation', tagline: 'Python + Linux + Git', color: '#E8833A',
    months: [
      { num: 1, title: 'Python fundamentals', focus: 'Automate the Boring Stuff, Part I',
        checkpoint: 'Write a 50-line Python script that reads a list and prints results — without copy-paste.',
        weekly: [
          'Install Python & VS Code. Chapters 1–2. Pick 3 exercises, do them.',
          'Chapter 3 (functions), Chapter 4 (lists). Script: formatted greetings for a list of names.',
          'Chapter 5 (dicts), Chapter 6 (strings). Script: word frequency counter.',
          'Review. Revisit shaky chapters. Finish chapters 4–6 practice projects.',
        ]},
      { num: 2, title: 'Python for real work', focus: 'Automate the Boring Stuff, Part II',
        checkpoint: 'One Python script running on your work laptop. Have the manager conversation.',
        weekly: [
          'Chapter 7 (regex). Do the exercises, regex is career-useful.',
          'Chapter 9 (files). Script that reads a folder and logs file metadata.',
          'Chapter 10 (organizing files). Script that renames files by pattern.',
          'Chapter 12 (web scraping) or 13 (Excel). Build the work automation script.',
        ]},
      { num: 3, title: 'Linux & the command line', focus: 'The Missing Semester (MIT)',
        checkpoint: 'Comfortable in terminal. Can ssh, navigate, edit, run scripts, use pipes.',
        weekly: [
          'Install WSL2/Ubuntu. Missing Semester lectures 1–2. Live in terminal daily.',
          'Lectures 3–4 (editors, data wrangling). Practice grep, find, awk.',
          'Lecture 5 (command-line environment). Customize your shell.',
          'Write 3 bash scripts. Rewrite one Python script as bash.',
        ]},
      { num: 4, title: 'Git, GitHub, consolidation', focus: 'Pro Git, chapters 1–3',
        checkpoint: 'GitHub profile live. First repo has a real README.',
        weekly: [
          'Pro Git chapters 1–2. Set up GitHub. First real commit.',
          'Branching, merging. Practice merge conflicts on a throwaway repo.',
          'Push your work automation script. Write an excellent README.',
          'Buffer week. Catch up. Weekly reviews. Plan Phase 2.',
        ]},
    ],
  },
  {
    phase: 2, name: 'Cloud & Containers', tagline: 'Docker + AWS + SAA cert', color: '#4A7FB0',
    months: [
      { num: 5, title: 'Docker', focus: 'Docker official tutorial / KodeKloud',
        checkpoint: 'Can write a Dockerfile and explain every line.',
        weekly: [
          'Install Docker. Images, containers, docker run, docker ps.',
          'Write a Dockerfile for your Python script. Build, run, iterate.',
          'docker-compose. Run your script + Postgres together.',
          'Volumes, networks. Have your script persist data to the DB.',
        ]},
      { num: 6, title: 'AWS fundamentals', focus: 'Cantrill or Maarek SAA course',
        checkpoint: 'Deployed a containerized app to AWS. Understand EC2, S3, IAM, VPC.',
        weekly: [
          'Open AWS account. Set $5 billing alarm FIRST. Start the course.',
          'EC2, S3 sections. Spin up an EC2, deploy a static site to S3.',
          'IAM, VPC sections. Understand permissions and networking.',
          'Project: deploy your Dockerized script to EC2. ssh, pull, run.',
        ]},
      { num: 7, title: 'AWS SAA deep prep', focus: 'Finish course + Tutorials Dojo',
        checkpoint: 'Scoring 80%+ on Tutorials Dojo practice exams consistently.',
        weekly: [
          'Finish the Cantrill/Maarek course. Take notes on services.',
          'Start Tutorials Dojo. First full practice exam. Review deeply.',
          'Second practice exam. Focus on weakest domain.',
          'Third practice exam. Book real exam for month 8.',
        ]},
      { num: 8, title: 'Pass the AWS SAA exam', focus: 'Final practice + exam',
        checkpoint: '✅ AWS Solutions Architect Associate certified.',
        weekly: [
          'Practice exam + full review of wrong answers.',
          'Practice exam + focused review of weak areas.',
          'Take the real exam early in the week.',
          'Pass it. (Or retake in 14 days — most people pass attempt 2.)',
        ]},
    ],
  },
  {
    phase: 3, name: 'Ship the project', tagline: 'CI/CD + portfolio + AI', color: '#6B8E5A',
    months: [
      { num: 9, title: 'CI/CD with GitHub Actions', focus: 'GH Actions docs + course',
        checkpoint: 'Every push runs tests. Main push builds and pushes a Docker image.',
        weekly: [
          'GH Actions basics: workflows, jobs, steps. First workflow on push.',
          'Add tests to your Python project. Wire tests into the pipeline.',
          'Secrets, matrix builds. Build a Docker image in CI.',
          'Push image to Docker Hub or ECR on merge to main.',
        ]},
      { num: 10, title: 'Terraform', focus: 'HashiCorp Terraform Associate',
        checkpoint: 'Your AWS infrastructure is fully in Terraform. On GitHub.',
        weekly: [
          'Terraform basics: providers, resources. Create EC2 via TF.',
          'Variables, outputs. Parameterize your setup.',
          'State, remote backends. Store state in S3.',
          'Rewrite whole project infra in Terraform. Commit.',
        ]},
      { num: 11, title: 'The AI infrastructure layer', focus: 'LLM API + ops thinking',
        checkpoint: 'One LLM-powered tool built. README covers production operation.',
        weekly: [
          'Pick an LLM API. Get a key. Budget ₹500. Read docs.',
          'Build a small useful thing (JIRA summarizer, log analyzer, doc bot).',
          'Ship it. Basic error handling. Make it work end-to-end.',
          'Write the ops README: monitoring, failure modes, cost, testing.',
        ]},
      { num: 12, title: 'Polish, write, interview', focus: 'Resume + blog + apply',
        checkpoint: '🎯 Applying to 20 roles/week. Interviewing. Portfolio public.',
        weekly: [
          'Clean up portfolio. Excellent README. Add architecture diagram.',
          'Write & publish one blog post. Medium or Dev.to.',
          'Update resume & LinkedIn. Shape bullets toward target role.',
          'Start applying. 20 per week. SDET, Junior DevOps, Junior Platform.',
        ]},
    ],
  },
];
const TOTAL_WEEKS = 48;

// ---------- WORKOUT PLAN (hybrid athlete: 10K → half marathon → recomp) ----------
const WORKOUTS = {
  0: { name: 'Long Run (park)', type: 'run', // Sunday
    note: 'The most important session of the week. Conversational pace — slower than feels right.',
    items: [
      { label: 'Long run at park', target: 'See progression — start 5K' },
      { label: '5–10 min cooldown walk', target: '' },
      { label: 'Stretching: hamstrings, calves, hips', target: '10 min' },
    ]},
  1: { name: 'Strength: Lower body', type: 'strength', // Monday
    note: 'Heavy-ish legs build running economy and prevent injury. Gym if available.',
    items: [
      { label: 'Goblet squats / barbell squats', target: '4 × 8–12' },
      { label: 'Romanian deadlifts (or hip hinges)', target: '4 × 10' },
      { label: 'Bulgarian split squats', target: '3 × 10 each leg' },
      { label: 'Walking lunges', target: '3 × 20 steps' },
      { label: 'Single-leg glute bridges', target: '3 × 12 each' },
      { label: 'Calf raises', target: '4 × 20' },
      { label: 'Plank', target: '3 × 60s' },
    ]},
  2: { name: 'Easy Run (Tuesday AM)', type: 'run', // Tuesday — 30–40 min before office
    note: 'Conversational pace. Build aerobic base. If you can sing, perfect. If you cannot talk, slow down.',
    items: [
      { label: 'Easy run', target: '30–40 min · 7:00–7:30/km' },
      { label: 'Cooldown walk', target: '5 min' },
      { label: 'Quick mobility (calves, hips)', target: '5 min' },
    ]},
  3: { name: 'Strength: Upper Push', type: 'strength', // Wednesday — office day, home workout
    note: 'Bodyweight focus. Office day so kept compact and home-doable.',
    items: [
      { label: 'Push-ups', target: '4 × 10–15' },
      { label: 'Pike push-ups (shoulders)', target: '4 × 8–12' },
      { label: 'Decline push-ups (feet elevated)', target: '3 × 10' },
      { label: 'Diamond push-ups (triceps)', target: '3 × 8' },
      { label: 'Dips (chair or bars)', target: '3 × 10' },
      { label: 'Hollow hold', target: '3 × 30s' },
      { label: 'Side plank', target: '2 × 30s each' },
    ]},
  4: { name: 'HIIT Cardio (apartment)', type: 'hiit', // Thursday — apartment-friendly
    note: 'Replaces a tempo run. Same VO2 max benefit, no running room needed. 4 rounds, 90s rest between.',
    items: [
      { label: 'Burpees', target: '15 × 4 rounds' },
      { label: 'Jumping jacks', target: '40 × 4' },
      { label: 'Mountain climbers', target: '40 × 4' },
      { label: 'High knees', target: '30s × 4' },
      { label: 'Jump squats', target: '15 × 4' },
      { label: 'Plank shoulder taps', target: '20 × 4' },
      { label: 'Cooldown stretch', target: '5 min' },
    ]},
  5: { name: 'Strength: Upper Pull + Core', type: 'strength', // Friday — office day
    note: 'Pull-focused. If gym after office, go heavier. If home, bodyweight + bands.',
    items: [
      { label: 'Pull-ups (or assisted/negatives)', target: '4 × max' },
      { label: 'Chin-ups', target: '3 × max' },
      { label: 'Inverted rows (under table or bar)', target: '4 × 10–12' },
      { label: 'Bent-over rows (DB or band)', target: '3 × 12' },
      { label: 'Bicep curls (band or DB)', target: '3 × 12' },
      { label: 'Russian twists', target: '3 × 30' },
      { label: 'Bicycle crunches', target: '3 × 30' },
    ]},
  6: { name: 'Cross-train + Mobility', type: 'cross', // Saturday — recovery before Sunday
    note: 'Light. Active recovery for legs before tomorrow\'s long run. Or take it as full rest if beat up.',
    items: [
      { label: 'Swim or cycle (easy)', target: '30 min' },
      { label: 'Foam roll: quads, calves, IT band', target: '10 min' },
      { label: 'Hip mobility flow', target: '5 min' },
      { label: 'Hamstring stretches', target: '5 min' },
    ]},
};

// ---------- LONG RUN PROGRESSION (12 weeks: 5K → 10K continuous, then 10K → 21K) ----------
const LONG_RUN_PROGRESSION = [
  // Phase 1: build to 10K (weeks 1-12)
  { week: 1, target: 5, note: 'No walking. Slower than feels right.' },
  { week: 2, target: 5, note: 'Same distance. Smooth this out.' },
  { week: 3, target: 6, note: 'New PR distance — go slow.' },
  { week: 4, target: 6, note: 'Lock in the 6K.' },
  { week: 5, target: 7, note: 'Patience. Easy pace.' },
  { week: 6, target: 7, note: 'Halfway there.' },
  { week: 7, target: 8, note: 'Past your old breaking point — done right.' },
  { week: 8, target: 8, note: 'Build the consistency.' },
  { week: 9, target: 9, note: 'Almost 10K territory.' },
  { week: 10, target: 9, note: 'Hold the pace, no walking.' },
  { week: 11, target: 10, note: 'First continuous 10K. This is the goal.' },
  { week: 12, target: 10, note: 'Repeat. Make 10K feel routine.' },
  // Phase 2: consolidate, push pace (weeks 13-24)
  { week: 13, target: 10, note: 'Phase 2 — make 10K easy.' },
  { week: 14, target: 11, note: 'Distance creep.' },
  { week: 15, target: 11, note: 'Easy 11K.' },
  { week: 16, target: 12, note: 'Distance day.' },
  { week: 17, target: 10, note: 'Recovery week — short long run.' },
  { week: 18, target: 12, note: 'Back to 12K.' },
  { week: 19, target: 13, note: 'New territory.' },
  { week: 20, target: 13, note: 'Hold it.' },
  { week: 21, target: 14, note: 'Distance day.' },
  { week: 22, target: 12, note: 'Recovery week.' },
  { week: 23, target: 14, note: '14K easy.' },
  { week: 24, target: 15, note: 'End of phase 2 — 15K achieved.' },
  // Phase 3: half marathon build (weeks 25-48)
  { week: 25, target: 13, note: 'Phase 3 — HM build begins.' },
  { week: 26, target: 15, note: 'Back to 15K.' },
  { week: 27, target: 16, note: 'New PR.' },
  { week: 28, target: 17, note: '' },
  { week: 29, target: 14, note: 'Recovery week.' },
  { week: 30, target: 17, note: '' },
  { week: 31, target: 18, note: '' },
  { week: 32, target: 19, note: 'Big day.' },
  { week: 33, target: 16, note: 'Recovery week.' },
  { week: 34, target: 19, note: '' },
  { week: 35, target: 20, note: 'First 20K!' },
  { week: 36, target: 21, note: 'Half marathon distance reached.' },
  { week: 37, target: 18, note: 'Recovery week.' },
  { week: 38, target: 12, note: 'Race-prep cutback.' },
  { week: 39, target: 21, note: 'Practice race-distance run.' },
  { week: 40, target: 16, note: 'Cutback before peak.' },
  { week: 41, target: 12, note: 'Taper begins.' },
  { week: 42, target: 14, note: '' },
  { week: 43, target: 12, note: '' },
  { week: 44, target: 10, note: 'Deep taper.' },
  { week: 45, target: 8, note: 'Race week pre-prep.' },
  { week: 46, target: 21, note: '🏁 Half marathon — race day!' },
  { week: 47, target: 8, note: 'Recovery week post-race.' },
  { week: 48, target: 10, note: 'Easing back. Year complete.' },
];

const getLongRunTarget = (weekNum) => {
  if (weekNum < 1) return LONG_RUN_PROGRESSION[0];
  if (weekNum > LONG_RUN_PROGRESSION.length) return LONG_RUN_PROGRESSION[LONG_RUN_PROGRESSION.length - 1];
  return LONG_RUN_PROGRESSION[weekNum - 1];
};

// ---------- QUOTES (mixed) ----------
const QUOTES = [
  // Career / growth
  { text: "The plan only fails one way: stopping. Never zero.", source: "Your plan" },
  { text: "You are training the habit, not just the skill.", source: "Your plan" },
  { text: "Compound interest applies to skill too. Show up Tuesday.", source: "—" },
  { text: "The gap between 'I suck at coding' and 'I can code' is shorter than it feels.", source: "—" },
  { text: "Junior people ask for permission. Senior people ship.", source: "—" },
  // Stoic / philosophical
  { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", source: "Marcus Aurelius" },
  { text: "We suffer more often in imagination than in reality.", source: "Seneca" },
  { text: "It is not that we have a short time to live, but that we waste much of it.", source: "Seneca" },
  { text: "First say to yourself what you would be; and then do what you have to do.", source: "Epictetus" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", source: "Marcus Aurelius" },
  { text: "Waste no more time arguing what a good man should be. Be one.", source: "Marcus Aurelius" },
  // Gentle / grounding
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", source: "James Clear" },
  { text: "Discipline is choosing between what you want now and what you want most.", source: "Abraham Lincoln" },
  { text: "The body achieves what the mind believes.", source: "—" },
  { text: "Small progress is still progress. Tiny wins stack.", source: "—" },
  { text: "The master has failed more times than the beginner has even tried.", source: "Stephen McCranie" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", source: "Anne Lamott" },
  // Fight club / physique specific
  { text: "It is only after we've lost everything that we're free to do anything.", source: "Fight Club" },
  { text: "The things you own end up owning you.", source: "Fight Club" },
  // Craft
  { text: "Hard work beats talent when talent doesn't work hard.", source: "Tim Notke" },
  { text: "Amateurs sit and wait for inspiration. The rest of us just get up and go to work.", source: "Stephen King" },
  { text: "You can't build a reputation on what you are going to do.", source: "Henry Ford" },
  // Mindset
  { text: "Between stimulus and response there is a space. In that space is our power to choose.", source: "Viktor Frankl" },
  { text: "The quality of your life is the quality of your habits.", source: "—" },
  { text: "Motivation gets you going. Discipline keeps you going.", source: "Jim Rohn" },
  // Running / endurance
  { text: "The miracle isn't that I finished. The miracle is that I had the courage to start.", source: "John Bingham" },
  { text: "Pain is inevitable. Suffering is optional.", source: "Haruki Murakami" },
  { text: "Run when you can, walk if you have to, crawl if you must — just never give up.", source: "Dean Karnazes" },
  { text: "The body achieves what the mind believes.", source: "—" },
  { text: "Every run is a gift. Even the hard ones. Especially the hard ones.", source: "—" },
];

const getQuoteForDay = (daysSinceStart) => QUOTES[Math.max(0, daysSinceStart) % QUOTES.length];

// ---------- APP ----------

export { PLAN, TOTAL_WEEKS, WORKOUTS, LONG_RUN_PROGRESSION, getLongRunTarget, QUOTES, getQuoteForDay };
