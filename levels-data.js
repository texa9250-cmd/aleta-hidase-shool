/* Content for the Student Levels section. Edit freely. */
const SUBJECTS = ["Mathematics","Physics","Chemistry","Biology","English","Aptitude","Geography","History","Economics","Civics"];

const LEVELS = {
  foundation: {
    name: "Foundation", am: "መሠረት", color: "#1f9d8a", icon: "🌱",
    tag: "Build strong basics, one small step at a time",
    forWho: "For students who want to make the basics solid. Every strong student started here, and this path is designed to give quick, visible wins.",
    plan: [["Day 1","Pick ONE topic. Read the textbook section slowly and underline key terms."],
           ["Day 2","Rewrite the main ideas in your own words (5 lines at most)."],
           ["Day 3","Solve 5 easy questions on the topic with the textbook open."],
           ["Day 4","Ask one question on the discussion board about anything unclear."],
           ["Day 5","Solve 5 more questions without the textbook."],
           ["Day 6","Review your mistakes and write the correct method beside each one."],
           ["Day 7","Rest, then explain the topic to a friend or family member."]],
    tips: ["Study 25 minutes, rest 5 minutes. Short sessions work better than one long night.",
           "Start with the easiest topics to build confidence.",
           "Learn definitions and formulas first; practice comes after.",
           "Ask questions early. Confusion grows when it is left alone."],
    checklist: ["I studied at least 4 days this week","I can explain 3 key ideas of one topic in my own words",
                "I solved 15 practice questions with the textbook open","I asked or answered a question on the discussion board",
                "I can solve 5 easy questions without the textbook"],
    next: "growth"
  },
  growth: {
    name: "Growth", am: "ዕድገት", color: "#ff7a3d", icon: "📈",
    tag: "Strengthen your skills and your speed",
    forWho: "For students who understand most lessons and want steadier, higher marks.",
    plan: [["Day 1","Review last week's mistakes (30 minutes)."],
           ["Day 2","New topic: read it, then summarize it on one page."],
           ["Day 3","Solve 10 mixed-difficulty questions against the clock."],
           ["Day 4","Work on past-exam questions for this topic."],
           ["Day 5","Fix every mistake and note its type: concept, calculation, or careless reading."],
           ["Day 6","Answer a classmate's question on the discussion board."],
           ["Day 7","Short revision using your one-page summaries."]],
    tips: ["Track mistakes by type, then practise the type you make most.",
           "Practise under a time limit at least twice a week.",
           "Use the Topics page of the Grade 12 portal to find the exact textbook unit and page.",
           "Answering classmates is the fastest way to find gaps in your own knowledge."],
    checklist: ["I studied 5 or more days this week","I solved 25 past-exam style questions",
                "I know my 3 most common mistake types","I finished one practice set within the time limit",
                "I answered at least 2 questions on the discussion board"],
    next: "excellence"
  },
  excellence: {
    name: "Excellence", am: "ልህቀት", color: "#5b3fd1", icon: "🏆",
    tag: "Aim for mastery and help others rise",
    forWho: "For students who are confident with the syllabus and aim for the highest results.",
    plan: [["Day 1","Take a full past paper under exam conditions."],
           ["Day 2","Mark strictly. List every lost mark and why you lost it."],
           ["Day 3","Study your 2 weakest topics deeply, from the textbook to harder questions."],
           ["Day 4","Solve challenge problems and try two different methods."],
           ["Day 5","Write your own exam-style questions for one topic."],
           ["Day 6","Mentor: answer questions on the board and explain the steps, not just the result."],
           ["Day 7","Review your error log and plan next week."]],
    tips: ["Work on exam technique: careful reading, time control, checking answers.",
           "Explaining a solution clearly is the best test of understanding.",
           "Keep an error log and review it every week.",
           "Protect your sleep and rest days. Mastery needs a fresh mind."],
    checklist: ["I completed a full past paper under exam conditions","I scored 80% or more on my last two practice papers",
                "I keep an error log and reviewed it this week","I helped at least 3 classmates on the discussion board",
                "I solved challenge questions using two methods"],
    next: null, finish: "You are on the top path. Keep mentoring and keep challenging yourself."
  }
};

/* Placement self-check: 5 questions, 0-2 points each */
const CHECK = [
  {q:"When I meet a new topic in the textbook, I usually...", o:["need someone to explain it","understand most of it after reading twice","understand it and could explain it to others"]},
  {q:"On past-exam questions in this subject I usually get...", o:["fewer than half right","half to three quarters right","more than three quarters right"]},
  {q:"When I get a question wrong, I...", o:["move on to the next one","check the correct answer","find out why I went wrong and fix it"]},
  {q:"My study routine in this subject is...", o:["irregular","a few days a week","planned for every day"]},
  {q:"With a practice paper, I...", o:["often cannot finish it","finish with little time to check","finish early and check my answers"]}
];

/* ---------- Amharic version of the level pages (please have an Amharic teacher review the wording) ---------- */
Object.assign(LEVELS.foundation, {
  tagAm: "መሠረትዎን በትናንሽ እርምጃዎች ያጠናክሩ",
  forWhoAm: "መሠረታዊ ትምህርቶችን ማጠናከር ለሚፈልጉ ተማሪዎች። ጠንካራ ተማሪ ሁሉ የጀመረው ከዚህ ነው፤ ይህ መንገድ ፈጣንና የሚታይ ውጤት እንዲያገኙ ተዘጋጅቷል።",
  planAm: ["አንድ ርዕስ ብቻ ይምረጡ። የመማሪያ መጽሐፉን ክፍል ቀስ ብለው አንብበው ዋና ቃላትን ያስምሩ።",
           "ዋና ሃሳቦቹን በራስዎ ቃል ይጻፉ (ቢበዛ 5 መስመር)።",
           "መጽሐፉን እያዩ 5 ቀላል ጥያቄዎችን ይስሩ።",
           "ግልጽ ያልሆነ ነገር ካለ በውይይት መድረኩ አንድ ጥያቄ ይጠይቁ።",
           "መጽሐፉን ሳያዩ ተጨማሪ 5 ጥያቄዎችን ይስሩ።",
           "ስህተቶችዎን ይመልከቱ፤ ከእያንዳንዱ ስህተት አጠገብ ትክክለኛውን መንገድ ይጻፉ።",
           "ያርፉ፤ ከዚያ ርዕሱን ለጓደኛዎ ወይም ለቤተሰብዎ ያስረዱ።"],
  tipsAm: ["25 ደቂቃ ያጥኑ፣ 5 ደቂቃ ያርፉ። አጭር የጥናት ጊዜያት ከአንድ ረጅም ምሽት ይሻላሉ።",
           "መተማመንን ለመገንባት በቀላል ርዕሶች ይጀምሩ።",
           "መጀመሪያ ትርጓሜዎችንና ቀመሮችን ይወቁ፤ ልምምድ ከዚያ ይከተላል።",
           "ጥያቄዎችን ቀድመው ይጠይቁ። ግራ መጋባት ሳይፈታ ሲቆይ ይባባሳል።"],
  checklistAm: ["በዚህ ሳምንት ቢያንስ 4 ቀን አጥንቻለሁ","የአንድ ርዕስ 3 ዋና ሃሳቦችን በራሴ ቃል ማስረዳት እችላለሁ",
                "መጽሐፉን እያየሁ 15 የልምምድ ጥያቄዎችን ሰርቻለሁ","በውይይት መድረኩ ላይ ጥያቄ ጠይቄያለሁ ወይም መልሼያለሁ",
                "መጽሐፉን ሳላይ 5 ቀላል ጥያቄዎችን መስራት እችላለሁ"]
});
Object.assign(LEVELS.growth, {
  tagAm: "ክህሎትዎንና ፍጥነትዎን ያጠናክሩ",
  forWhoAm: "አብዛኛውን ትምህርት ለሚረዱና የተሻለና የተረጋጋ ውጤት ለሚፈልጉ ተማሪዎች።",
  planAm: ["የባለፈውን ሳምንት ስህተቶች ይከልሱ (30 ደቂቃ)።",
           "አዲስ ርዕስ፦ ያንብቡ፣ ከዚያ በአንድ ገጽ ያጠቃልሉት።",
           "10 የተቀላቀለ ደረጃ ጥያቄዎችን በጊዜ ገደብ ይስሩ።",
           "የዚህን ርዕስ ያለፉ ብሔራዊ ፈተና ጥያቄዎች ይስሩ።",
           "ስህተቶችን ሁሉ ያርሙ፤ ዓይነታቸውን ይመዝግቡ፦ የሃሳብ፣ የስሌት ወይም ባለማንበብ።",
           "በውይይት መድረኩ የክፍል ጓደኛ ጥያቄ ይመልሱ።",
           "በአንድ ገጽ ማጠቃለያዎችዎ አጭር ክለሳ ያድርጉ።"],
  tipsAm: ["ስህተቶችን በዓይነት ይመዝግቡ፤ ከዚያ ብዙ የሚሰሩትን ዓይነት ይለማመዱ።",
           "በሳምንት ቢያንስ ሁለት ጊዜ በጊዜ ገደብ ይለማመዱ።",
           "ትክክለኛውን የመማሪያ መጽሐፍ ምዕራፍና ገጽ ለማግኘት የ12ኛ ክፍል ፖርታሉን «ርዕሶች» ገጽ ይጠቀሙ።",
           "የክፍል ጓደኞችን ጥያቄ መመለስ የራስዎን ክፍተት ለማግኘት ፈጣኑ መንገድ ነው።"],
  checklistAm: ["በዚህ ሳምንት 5 ወይም ከዚያ በላይ ቀን አጥንቻለሁ","25 የቀደመ ፈተና ዓይነት ጥያቄዎችን ሰርቻለሁ",
                "ብዙ የምሰራቸውን 3 የስህተት ዓይነቶች አውቃለሁ","አንድ የልምምድ ስብስብ በተሰጠው ጊዜ ውስጥ ጨርሻለሁ",
                "በውይይት መድረኩ ቢያንስ 2 ጥያቄዎችን መልሻለሁ"]
});
Object.assign(LEVELS.excellence, {
  tagAm: "ብቃትን ዓላማ ያድርጉ፤ ሌሎችም እንዲያድጉ ይርዱ",
  forWhoAm: "በሥርዓተ ትምህርቱ በራስ መተማመን ላላቸውና ከፍተኛ ውጤት ለሚፈልጉ ተማሪዎች።",
  planAm: ["ሙሉ ያለፈ ፈተና በፈተና ሁኔታ ይውሰዱ።",
           "በጥንቃቄ ያርሙ። ያጡትን ነጥብ ሁሉና ምክንያቱን ይዘርዝሩ።",
           "ሁለቱን ደካማ ርዕሶችዎን ከመጽሐፍ እስከ ከባድ ጥያቄዎች ድረስ በጥልቀት ያጥኑ።",
           "ፈታኝ ጥያቄዎችን ይስሩ፤ በሁለት የተለያዩ መንገዶች ይሞክሩ።",
           "ለአንድ ርዕስ የራስዎን የፈተና ዓይነት ጥያቄዎች ይጻፉ።",
           "አማካሪ ይሁኑ፦ በመድረኩ ይመልሱ፤ ውጤቱን ብቻ ሳይሆን የአሠራር ደረጃዎቹንም ያብራሩ።",
           "የስህተት ማስታወሻዎን ይከልሱ፤ የሚቀጥለውን ሳምንት ያቅዱ።"],
  tipsAm: ["በፈተና ቴክኒክ ላይ ይስሩ፦ በጥንቃቄ ማንበብ፣ ጊዜን መቆጣጠር፣ መልሶችን መፈተሽ።",
           "መፍትሔን በግልጽ ማብራራት ግንዛቤን ለመፈተሽ ምርጡ መንገድ ነው።",
           "የስህተት ማስታወሻ ይያዙ፤ በየሳምንቱ ይከልሱት።",
           "እንቅልፍዎንና የእረፍት ቀናትዎን ይጠብቁ። ብቃት ንጹህ አእምሮ ይፈልጋል።"],
  checklistAm: ["ሙሉ ያለፈ ፈተና በፈተና ሁኔታ ጨርሻለሁ","በመጨረሻዎቹ ሁለት የልምምድ ፈተናዎች 80% ወይም ከዚያ በላይ አግኝቻለሁ",
                "የስህተት ማስታወሻ እይዛለሁ፤ በዚህ ሳምንት ገምግሜዋለሁ","በውይይት መድረኩ ቢያንስ 3 የክፍል ጓደኞችን ረድቻለሁ",
                "ፈታኝ ጥያቄዎችን በሁለት መንገድ ፈትቻለሁ"],
  finishAm: "በከፍተኛው መንገድ ላይ ነዎት። አማካሪ መሆንዎንና ራስዎን መፈተንዎን ይቀጥሉ።"
});

/* ---------- Amharic names for subjects and the self-check (please have an Amharic teacher review) ---------- */
const SUBJECTS_AM = {Mathematics:"ሒሳብ", Physics:"ፊዚክስ", Chemistry:"ኬሚስትሪ", Biology:"ባዮሎጂ", English:"እንግሊዝኛ", Aptitude:"አፕቲትዩድ",
                     Geography:"ጂኦግራፊ", History:"ታሪክ", Economics:"ኢኮኖሚክስ", Civics:"ሥነ ዜጋ"};
const CHECK_AM = [
  {q:"በመጽሐፍ ውስጥ አዲስ ርዕስ ሲያጋጥመኝ ብዙውን ጊዜ…", o:["ሰው እንዲያስረዳኝ እፈልጋለሁ","ሁለት ጊዜ ካነበብኩ በኋላ አብዛኛውን እረዳለሁ","እረዳዋለሁ፤ ለሌሎችም ማስረዳት እችላለሁ"]},
  {q:"በዚህ የትምህርት ዓይነት ባለፉ ፈተና ጥያቄዎች ብዙውን ጊዜ የምመልሰው…", o:["ከግማሽ በታች በትክክል","ከግማሽ እስከ ሦስት አራተኛ በትክክል","ከሦስት አራተኛ በላይ በትክክል"]},
  {q:"አንድ ጥያቄ ሲሳሳት እኔ…", o:["ወደ ቀጣዩ እሄዳለሁ","ትክክለኛውን መልስ አያለሁ","ለምን እንደተሳሳትኩ አውቄ አርማለሁ"]},
  {q:"በዚህ የትምህርት ዓይነት የጥናት ልማዴ…", o:["የተስተካከለ አይደለም","በሳምንት ጥቂት ቀናት ነው","ለእያንዳንዱ ቀን የታቀደ ነው"]},
  {q:"የልምምድ ፈተና ሲሰጠኝ እኔ…", o:["ብዙ ጊዜ መጨረስ አልችልም","እጨርሳለሁ፤ ግን ለመፈተሽ ጊዜ ጥቂት ነው","ቀድሜ እጨርሳለሁ፤ መልሶቼንም እፈትሻለሁ"]}
];
