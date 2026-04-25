export type Lang = "en" | "hi" | "mr" | "gu";

export const LANG_META: Record<Lang, { name: string; native: string; ttsLang: string; sttLang: string; aiLangName: string }> = {
  en: { name: "English",   native: "English",   ttsLang: "en-IN", sttLang: "en-IN", aiLangName: "English" },
  hi: { name: "Hindi",     native: "हिन्दी",     ttsLang: "hi-IN", sttLang: "hi-IN", aiLangName: "Hindi (Devanagari)" },
  mr: { name: "Marathi",   native: "मराठी",      ttsLang: "mr-IN", sttLang: "mr-IN", aiLangName: "Marathi (Devanagari)" },
  gu: { name: "Gujarati",  native: "ગુજરાતી",   ttsLang: "gu-IN", sttLang: "gu-IN", aiLangName: "Gujarati script" },
};

type Dict = {
  tagline: string; subtitle: string; noLogin: string; chooseLang: string;
  back: string; next: string; skip: string;
  profileQ: { name: string; age: string; gender: string; income: string; category: string };
  selectState: string; statePersonal: string; stateSchemes: string;
  whatNeed: string; chooseMode: string;
  findSchemes: string; findSchemesDesc: string;
  accessServices: string; accessServicesDesc: string;
  greetingSchemes: string; greetingServices: string;
  thinking: string; readAloud: string; stop: string;
  typeOrSpeak: string; orType: string;
  fraudTitle: string; fraudBody: string;
  download: string; share: string; pdf: string; viewReport: string;
  reportTitle: string; backToChat: string; downloadPdf: string;
  qpSchemes: string[]; qpServices: string[];
  citizen: string; offlineMode: string;
  offices: string; findOffices: string; pincodePh: string; noOffices: string;
};

export const T: Record<Lang, Dict> = {
  en: {
    tagline: "AI voice assistant for Indian government schemes & services",
    subtitle: "SarkarSathi", noLogin: "No login required", chooseLang: "Choose your language",
    back: "Back", next: "Next", skip: "Skip",
    profileQ: { name: "What is your name?", age: "How old are you?", gender: "What is your gender? Male, Female, or Other?", income: "What is your monthly family income in rupees?", category: "What is your category? General, OBC, SC, or ST?" },
    selectState: "Select your state", statePersonal: "We'll personalize schemes for you", stateSchemes: "state schemes",
    whatNeed: "What do you need?", chooseMode: "Choose a mode to continue",
    findSchemes: "Find Schemes", findSchemesDesc: "Discover benefits you qualify for",
    accessServices: "Access Services", accessServicesDesc: "Get help with government processes",
    greetingSchemes: "Namaste! I'm SarkarSathi. Tell me what you need or pick a quick prompt below.",
    greetingServices: "Namaste! I can guide you through any government service step by step. Which one do you need help with?",
    thinking: "Thinking…", readAloud: "Read aloud", stop: "Stop",
    typeOrSpeak: "Type or hold mic to speak…", orType: "Or type your answer",
    fraudTitle: "Middleman Fraud Alert",
    fraudBody: "Government schemes and services are FREE. Never pay agents, brokers, or anyone asking for fees. Apply only on official portals.",
    download: "Download", share: "Share", pdf: "PDF", viewReport: "View Full Eligibility Report",
    reportTitle: "Your Eligibility Report", backToChat: "Back to chat", downloadPdf: "Download PDF",
    qpSchemes: ["What schemes am I eligible for?", "Schemes for women", "Farmer schemes", "Housing schemes", "Health insurance"],
    qpServices: ["How do I get Aadhaar?", "Apply for PAN card", "Driving licence process", "Ration card application", "Passport application", "Birth certificate"],
    citizen: "Citizen", offlineMode: "(Offline mode)",
    offices: "Nearest offices", findOffices: "Find", pincodePh: "Enter pincode (e.g. 400001)", noOffices: "No offices for that pincode in our demo data.",
  },
  hi: {
    tagline: "भारतीय सरकारी योजनाओं और सेवाओं के लिए AI वॉइस सहायक",
    subtitle: "सरकार साथी", noLogin: "लॉगिन की आवश्यकता नहीं", chooseLang: "अपनी भाषा चुनें",
    back: "वापस", next: "आगे", skip: "छोड़ें",
    profileQ: { name: "आपका नाम क्या है?", age: "आपकी उम्र कितनी है?", gender: "आपका लिंग क्या है? पुरुष, महिला, या अन्य?", income: "आपकी मासिक पारिवारिक आय कितनी है?", category: "आपकी श्रेणी क्या है? सामान्य, OBC, SC, या ST?" },
    selectState: "अपना राज्य चुनें", statePersonal: "हम आपके लिए योजनाएं तैयार करेंगे", stateSchemes: "राज्य योजनाएं",
    whatNeed: "आपको क्या चाहिए?", chooseMode: "जारी रखने के लिए मोड चुनें",
    findSchemes: "योजनाएं खोजें", findSchemesDesc: "जिन लाभों के आप पात्र हैं उन्हें खोजें",
    accessServices: "सेवाएं प्राप्त करें", accessServicesDesc: "सरकारी प्रक्रियाओं में मदद पाएं",
    greetingSchemes: "नमस्ते! मैं सरकार साथी हूँ। मुझे बताइए आपको क्या चाहिए या नीचे से कोई विकल्प चुनें।",
    greetingServices: "नमस्ते! मैं किसी भी सरकारी सेवा में आपकी कदम-दर-कदम सहायता कर सकता हूँ। आपको किसमें मदद चाहिए?",
    thinking: "सोच रहा हूँ…", readAloud: "सुनें", stop: "रोकें",
    typeOrSpeak: "टाइप करें या बोलने के लिए माइक दबाएं…", orType: "या अपना उत्तर टाइप करें",
    fraudTitle: "बिचौलिया धोखाधड़ी चेतावनी",
    fraudBody: "सरकारी योजनाएं और सेवाएं मुफ्त हैं। कभी भी एजेंट या दलाल को पैसे न दें। केवल आधिकारिक पोर्टल पर ही आवेदन करें।",
    download: "डाउनलोड", share: "साझा करें", pdf: "PDF", viewReport: "पूरी पात्रता रिपोर्ट देखें",
    reportTitle: "आपकी पात्रता रिपोर्ट", backToChat: "चैट पर वापस", downloadPdf: "PDF डाउनलोड करें",
    qpSchemes: ["मैं किन योजनाओं के लिए पात्र हूँ?", "महिलाओं के लिए योजनाएं", "किसान योजनाएं", "आवास योजनाएं", "स्वास्थ्य बीमा"],
    qpServices: ["आधार कैसे बनवाएं?", "PAN कार्ड के लिए आवेदन", "ड्राइविंग लाइसेंस प्रक्रिया", "राशन कार्ड आवेदन", "पासपोर्ट आवेदन", "जन्म प्रमाण पत्र"],
    citizen: "नागरिक", offlineMode: "(ऑफलाइन मोड)",
    offices: "नज़दीकी कार्यालय", findOffices: "खोजें", pincodePh: "पिनकोड दर्ज करें (जैसे 400001)", noOffices: "इस पिनकोड के लिए डेमो डेटा में कोई कार्यालय नहीं।",
  },
  mr: {
    tagline: "भारतीय सरकारी योजना व सेवांसाठी AI व्हॉईस सहाय्यक",
    subtitle: "सरकार साथी", noLogin: "लॉगिन आवश्यक नाही", chooseLang: "तुमची भाषा निवडा",
    back: "मागे", next: "पुढे", skip: "वगळा",
    profileQ: { name: "तुमचे नाव काय आहे?", age: "तुमचे वय किती आहे?", gender: "तुमचे लिंग काय आहे? पुरुष, स्त्री, किंवा इतर?", income: "तुमचे मासिक कौटुंबिक उत्पन्न किती आहे?", category: "तुमचा प्रवर्ग काय आहे? सामान्य, OBC, SC, किंवा ST?" },
    selectState: "तुमचे राज्य निवडा", statePersonal: "आम्ही तुमच्यासाठी योजना सानुकूल करू", stateSchemes: "राज्य योजना",
    whatNeed: "तुम्हाला काय हवे आहे?", chooseMode: "पुढे जाण्यासाठी मोड निवडा",
    findSchemes: "योजना शोधा", findSchemesDesc: "तुम्ही पात्र असलेले लाभ शोधा",
    accessServices: "सेवा मिळवा", accessServicesDesc: "सरकारी प्रक्रियांमध्ये मदत मिळवा",
    greetingSchemes: "नमस्कार! मी सरकार साथी आहे. मला सांगा तुम्हाला काय हवे किंवा खालील पर्याय निवडा.",
    greetingServices: "नमस्कार! मी कोणत्याही सरकारी सेवेसाठी पायरीनिहाय मदत करू शकतो. तुम्हाला कशात मदत हवी?",
    thinking: "विचार करत आहे…", readAloud: "ऐका", stop: "थांबवा",
    typeOrSpeak: "टाइप करा किंवा बोलण्यासाठी माइक दाबा…", orType: "किंवा तुमचे उत्तर टाइप करा",
    fraudTitle: "मध्यस्थ फसवणूक इशारा",
    fraudBody: "सरकारी योजना व सेवा मोफत आहेत. एजंट किंवा दलालांना कधीही पैसे देऊ नका. फक्त अधिकृत पोर्टलवर अर्ज करा.",
    download: "डाउनलोड", share: "शेअर करा", pdf: "PDF", viewReport: "संपूर्ण पात्रता अहवाल पहा",
    reportTitle: "तुमचा पात्रता अहवाल", backToChat: "चॅटवर परत", downloadPdf: "PDF डाउनलोड करा",
    qpSchemes: ["मी कोणत्या योजनांसाठी पात्र आहे?", "महिलांसाठी योजना", "शेतकरी योजना", "गृहनिर्माण योजना", "आरोग्य विमा"],
    qpServices: ["आधार कसे काढायचे?", "PAN कार्डसाठी अर्ज", "ड्रायव्हिंग लायसन्स प्रक्रिया", "रेशन कार्ड अर्ज", "पासपोर्ट अर्ज", "जन्म प्रमाणपत्र"],
    citizen: "नागरिक", offlineMode: "(ऑफलाइन मोड)",
    offices: "जवळची कार्यालये", findOffices: "शोधा", pincodePh: "पिनकोड टाका (उदा. 400001)", noOffices: "या पिनकोडसाठी डेमो डेटामध्ये कार्यालय नाही.",
  },
  gu: {
    tagline: "ભારતીય સરકારી યોજનાઓ અને સેવાઓ માટે AI વોઇસ સહાયક",
    subtitle: "સરકાર સાથી", noLogin: "લોગિન જરૂરી નથી", chooseLang: "તમારી ભાષા પસંદ કરો",
    back: "પાછળ", next: "આગળ", skip: "છોડો",
    profileQ: { name: "તમારું નામ શું છે?", age: "તમારી ઉંમર કેટલી છે?", gender: "તમારી જાતિ શું છે? પુરુષ, સ્ત્રી, કે અન્ય?", income: "તમારી માસિક પારિવારિક આવક કેટલી છે?", category: "તમારી શ્રેણી શું છે? સામાન્ય, OBC, SC, કે ST?" },
    selectState: "તમારું રાજ્ય પસંદ કરો", statePersonal: "અમે તમારા માટે યોજનાઓ તૈયાર કરીશું", stateSchemes: "રાજ્ય યોજનાઓ",
    whatNeed: "તમને શું જોઈએ છે?", chooseMode: "ચાલુ રાખવા માટે મોડ પસંદ કરો",
    findSchemes: "યોજનાઓ શોધો", findSchemesDesc: "તમે પાત્ર છો તે લાભો શોધો",
    accessServices: "સેવાઓ મેળવો", accessServicesDesc: "સરકારી પ્રક્રિયાઓમાં મદદ મેળવો",
    greetingSchemes: "નમસ્તે! હું સરકાર સાથી છું. મને કહો તમને શું જોઈએ અથવા નીચેથી વિકલ્પ પસંદ કરો.",
    greetingServices: "નમસ્તે! હું કોઈપણ સરકારી સેવા માટે પગલાં દ્વારા મદદ કરી શકું છું. તમને કયામાં મદદ જોઈએ?",
    thinking: "વિચારી રહ્યો છું…", readAloud: "સાંભળો", stop: "બંધ કરો",
    typeOrSpeak: "ટાઇપ કરો અથવા બોલવા માટે માઇક દબાવો…", orType: "અથવા જવાબ ટાઇપ કરો",
    fraudTitle: "મધ્યસ્થી છેતરપિંડી ચેતવણી",
    fraudBody: "સરકારી યોજનાઓ અને સેવાઓ મફત છે. એજન્ટ કે દલાલને પૈસા આપશો નહિ. માત્ર સત્તાવાર પોર્ટલ પર અરજી કરો.",
    download: "ડાઉનલોડ", share: "શેર કરો", pdf: "PDF", viewReport: "સંપૂર્ણ પાત્રતા રિપોર્ટ જુઓ",
    reportTitle: "તમારો પાત્રતા રિપોર્ટ", backToChat: "ચેટ પર પાછા", downloadPdf: "PDF ડાઉનલોડ કરો",
    qpSchemes: ["હું કઈ યોજનાઓ માટે પાત્ર છું?", "મહિલાઓ માટે યોજનાઓ", "ખેડૂત યોજનાઓ", "આવાસ યોજનાઓ", "આરોગ્ય વીમો"],
    qpServices: ["આધાર કેવી રીતે મેળવવું?", "PAN કાર્ડ માટે અરજી", "ડ્રાઇવિંગ લાઇસન્સ પ્રક્રિયા", "રેશન કાર્ડ અરજી", "પાસપોર્ટ અરજી", "જન્મ પ્રમાણપત્ર"],
    citizen: "નાગરિક", offlineMode: "(ઓફલાઇન મોડ)",
    offices: "નજીકની કચેરીઓ", findOffices: "શોધો", pincodePh: "પિનકોડ દાખલ કરો (દા.ત. 400001)", noOffices: "આ પિનકોડ માટે ડેમો ડેટામાં કચેરી નથી.",
  },
};

export function getLang(): Lang {
  if (typeof window === "undefined") return "en";
  const v = localStorage.getItem("lang") as Lang | null;
  return v && T[v] ? v : "en";
}
