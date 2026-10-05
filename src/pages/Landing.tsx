import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, LoaderCircle } from "lucide-react";

import clearNight from "../assets/weather-bg/clear-night.jpg";
import cloudy from "../assets/weather-bg/cloudy.jpg";
import fog from "../assets/weather-bg/fog.jpg";
import snow from "../assets/weather-bg/snow.jpg";
import storm from "../assets/weather-bg/storm.jpg";

import "../styles/landing.css";


type Language = "English" | "हिन्दी" | "मराठी";


interface FAQItem {
  question: string;
  answer: string;
}


const translations = {
  English: {
    navHome: "Home",
    navFeatures: "Features",
    navFAQ: "FAQ",

    heroLabel: "INTELLIGENT WEATHER PLATFORM",

    heroTitle1: "Weather intelligence,",
    heroTitle2: "simplified.",

    heroDescription:
      "Get real-time weather, forecasts, alerts and intelligent weather insights — all in one place.",

    explore: "Explore WeatherGPT",

    scroll: "Scroll to explore",

    featureLabel: "POWERFUL WEATHER INTELLIGENCE",

    featureTitle: "Why use WeatherGPT?",

    featureDescription:
      "Everything you need to understand, predict and respond to weather.",

    features: [
      {
        icon: "◉",
        title: "Real-Time Weather",
        description:
          "Get accurate and up-to-date weather information for your location in seconds.",
      },
      {
        icon: "⚡",
        title: "Intelligent Alerts",
        description:
          "Stay informed about severe weather conditions and important weather warnings.",
      },
      {
        icon: "◈",
        title: "Interactive Maps",
        description:
          "Explore weather patterns, forecasts and conditions through interactive maps.",
      },
      {
        icon: "✦",
        title: "AI Weather Chat",
        description:
          "Ask natural-language questions and get intelligent answers about the weather.",
      },
      {
        icon: "◌",
        title: "Voice Assistant",
        description:
          "Interact with WeatherGPT naturally using voice-based weather queries.",
      },
      {
        icon: "◎",
        title: "Multiple Languages",
        description:
          "Access weather intelligence in English, Hindi and Marathi.",
      },
    ],

    faqLabel: "QUESTIONS & ANSWERS",

    faqTitle: "Frequently Asked Questions",

    faq: [
      {
        question: "What is WeatherGPT?",
        answer:
          "WeatherGPT is an AI-powered weather platform designed to provide real-time weather information, forecasts, alerts, maps and intelligent weather insights in one place.",
      },
      {
        question: "What can I ask WeatherGPT?",
        answer:
          "You can ask about current weather, temperature, rainfall, forecasts, severe weather, weather patterns and other weather-related information.",
      },
      {
        question: "Can WeatherGPT provide weather alerts?",
        answer:
          "Yes. WeatherGPT is designed to help users understand important weather warnings and extreme weather conditions.",
      },
      {
        question: "Does WeatherGPT support Indian languages?",
        answer:
          "Yes. The landing page currently supports English, Hindi and Marathi, making weather information more accessible to Indian users.",
      },
      {
        question: "Can I view weather forecasts on a map?",
        answer:
          "Yes. The WeatherGPT application includes a dedicated Map section where users can explore weather and forecast information visually.",
      },
      {
        question: "Can I interact with WeatherGPT using voice?",
        answer:
          "Yes. WeatherGPT includes a Voice section that allows users to interact with the platform using voice-based queries.",
      },
    ],

    finalTitle: "Ready to understand the weather differently?",

    finalDescription:
      "Explore WeatherGPT and experience intelligent weather information in one powerful platform.",

    footerText: "Intelligent weather. Simplified.",
  },


  "हिन्दी": {
    navHome: "होम",
    navFeatures: "फीचर्स",
    navFAQ: "सामान्य प्रश्न",

    heroLabel: "बुद्धिमान मौसम प्लेटफॉर्म",

    heroTitle1: "मौसम की जानकारी,",
    heroTitle2: "अब आसान।",

    heroDescription:
      "रियल-टाइम मौसम, पूर्वानुमान, अलर्ट और स्मार्ट मौसम जानकारी — सब एक ही जगह।",

    explore: "WeatherGPT एक्सप्लोर करें",

    scroll: "नीचे देखें",

    featureLabel: "शक्तिशाली मौसम जानकारी",

    featureTitle: "WeatherGPT का उपयोग क्यों करें?",

    featureDescription:
      "मौसम को समझने, अनुमान लगाने और उसके अनुसार प्रतिक्रिया देने के लिए आवश्यक सभी जानकारी।",

    features: [
      {
        icon: "◉",
        title: "रियल-टाइम मौसम",
        description:
          "अपने स्थान के मौसम की सटीक और नवीनतम जानकारी कुछ ही सेकंड में प्राप्त करें।",
      },
      {
        icon: "⚡",
        title: "स्मार्ट अलर्ट",
        description:
          "खराब मौसम और महत्वपूर्ण मौसम चेतावनियों के बारे में तुरंत जानकारी प्राप्त करें।",
      },
      {
        icon: "◈",
        title: "इंटरैक्टिव मैप",
        description:
          "इंटरैक्टिव मैप के माध्यम से मौसम और पूर्वानुमान को आसानी से समझें।",
      },
      {
        icon: "✦",
        title: "AI मौसम चैट",
        description:
          "मौसम से जुड़े सवाल सामान्य भाषा में पूछें और स्मार्ट जवाब प्राप्त करें।",
      },
      {
        icon: "◌",
        title: "वॉइस असिस्टेंट",
        description:
          "आवाज़ के माध्यम से WeatherGPT से मौसम की जानकारी प्राप्त करें।",
      },
      {
        icon: "◎",
        title: "कई भाषाएं",
        description:
          "अंग्रेज़ी, हिंदी और मराठी में मौसम की जानकारी प्राप्त करें।",
      },
    ],

    faqLabel: "सवाल और जवाब",

    faqTitle: "अक्सर पूछे जाने वाले सवाल",

    faq: [
      {
        question: "WeatherGPT क्या है?",
        answer:
          "WeatherGPT एक AI आधारित मौसम प्लेटफॉर्म है जो रियल-टाइम मौसम, पूर्वानुमान, अलर्ट, मैप और मौसम से जुड़ी स्मार्ट जानकारी प्रदान करता है।",
      },
      {
        question: "मैं WeatherGPT से क्या पूछ सकता हूं?",
        answer:
          "आप वर्तमान मौसम, तापमान, बारिश, पूर्वानुमान, खराब मौसम और मौसम के पैटर्न से जुड़े सवाल पूछ सकते हैं।",
      },
      {
        question: "क्या WeatherGPT मौसम अलर्ट देता है?",
        answer:
          "हां। WeatherGPT महत्वपूर्ण मौसम चेतावनियों और गंभीर मौसम की परिस्थितियों को समझने में आपकी मदद करता है।",
      },
      {
        question: "क्या WeatherGPT भारतीय भाषाओं को सपोर्ट करता है?",
        answer:
          "हां। वर्तमान में लैंडिंग पेज अंग्रेज़ी, हिंदी और मराठी को सपोर्ट करता है।",
      },
      {
        question: "क्या मैं मैप पर मौसम देख सकता हूं?",
        answer:
          "हां। WeatherGPT में एक अलग Map सेक्शन है जहां आप मौसम और पूर्वानुमान को विज़ुअली देख सकते हैं।",
      },
      {
        question: "क्या मैं आवाज़ से WeatherGPT का उपयोग कर सकता हूं?",
        answer:
          "हां। WeatherGPT में Voice सेक्शन है जिसके माध्यम से आप आवाज़ द्वारा सवाल पूछ सकते हैं।",
      },
    ],

    finalTitle: "मौसम को एक अलग तरीके से समझने के लिए तैयार हैं?",

    finalDescription:
      "WeatherGPT को एक्सप्लोर करें और एक ही प्लेटफॉर्म पर स्मार्ट मौसम जानकारी का अनुभव करें।",

    footerText: "स्मार्ट मौसम। आसान जानकारी।",
  },


  "मराठी": {
    navHome: "होम",
    navFeatures: "फीचर्स",
    navFAQ: "सामान्य प्रश्न",

    heroLabel: "स्मार्ट वेदर प्लॅटफॉर्म",

    heroTitle1: "हवामानाची माहिती,",
    heroTitle2: "आता सोप्या पद्धतीने.",

    heroDescription:
      "रिअल-टाइम हवामान, अंदाज, अलर्ट आणि स्मार्ट हवामान माहिती — सर्व एका ठिकाणी.",

    explore: "WeatherGPT एक्सप्लोर करा",

    scroll: "खाली पहा",

    featureLabel: "शक्तिशाली हवामान माहिती",

    featureTitle: "WeatherGPT का वापरावे?",

    featureDescription:
      "हवामान समजून घेण्यासाठी, अंदाज घेण्यासाठी आणि त्यानुसार निर्णय घेण्यासाठी आवश्यक सर्व माहिती.",

    features: [
      {
        icon: "◉",
        title: "रिअल-टाइम हवामान",
        description:
          "तुमच्या ठिकाणच्या हवामानाची अचूक आणि नवीनतम माहिती काही सेकंदांत मिळवा.",
      },
      {
        icon: "⚡",
        title: "स्मार्ट अलर्ट",
        description:
          "गंभीर हवामान आणि महत्त्वाच्या हवामान चेतावण्यांची माहिती मिळवा.",
      },
      {
        icon: "◈",
        title: "इंटरॅक्टिव्ह मॅप",
        description:
          "इंटरॅक्टिव्ह मॅपच्या मदतीने हवामान आणि अंदाज सहज समजून घ्या.",
      },
      {
        icon: "✦",
        title: "AI वेदर चॅट",
        description:
          "हवामानाशी संबंधित प्रश्न सामान्य भाषेत विचारा आणि स्मार्ट उत्तरे मिळवा.",
      },
      {
        icon: "◌",
        title: "व्हॉइस असिस्टंट",
        description:
          "आवाजाच्या माध्यमातून WeatherGPT कडून हवामानाची माहिती मिळवा.",
      },
      {
        icon: "◎",
        title: "अनेक भाषा",
        description:
          "इंग्रजी, हिंदी आणि मराठी भाषांमध्ये हवामानाची माहिती मिळवा.",
      },
    ],

    faqLabel: "प्रश्न आणि उत्तरे",

    faqTitle: "वारंवार विचारले जाणारे प्रश्न",

    faq: [
      {
        question: "WeatherGPT म्हणजे काय?",
        answer:
          "WeatherGPT हे AI आधारित हवामान प्लॅटफॉर्म आहे जे रिअल-टाइम हवामान, अंदाज, अलर्ट, मॅप आणि स्मार्ट हवामान माहिती प्रदान करते.",
      },
      {
        question: "मी WeatherGPT ला काय विचारू शकतो?",
        answer:
          "तुम्ही सध्याचे हवामान, तापमान, पाऊस, अंदाज, गंभीर हवामान आणि हवामानातील बदलांबद्दल प्रश्न विचारू शकता.",
      },
      {
        question: "WeatherGPT हवामान अलर्ट देऊ शकते का?",
        answer:
          "होय. WeatherGPT महत्त्वाच्या हवामान चेतावण्या आणि गंभीर हवामान परिस्थिती समजून घेण्यास मदत करते.",
      },
      {
        question: "WeatherGPT भारतीय भाषांना सपोर्ट करते का?",
        answer:
          "होय. सध्या लँडिंग पेज इंग्रजी, हिंदी आणि मराठी भाषांना सपोर्ट करते.",
      },
      {
        question: "मी मॅपवर हवामान पाहू शकतो का?",
        answer:
          "होय. WeatherGPT मध्ये एक स्वतंत्र Map सेक्शन आहे जिथे तुम्ही हवामान आणि अंदाज व्हिज्युअली पाहू शकता.",
      },
      {
        question: "मी आवाजाने WeatherGPT वापरू शकतो का?",
        answer:
          "होय. WeatherGPT मध्ये Voice सेक्शन आहे ज्याद्वारे तुम्ही आवाजाच्या माध्यमातून प्रश्न विचारू शकता.",
      },
    ],

    finalTitle: "हवामान वेगळ्या पद्धतीने समजून घेण्यासाठी तयार आहात?",

    finalDescription:
      "WeatherGPT एक्सप्लोर करा आणि एका शक्तिशाली प्लॅटफॉर्मवर स्मार्ट हवामान माहितीचा अनुभव घ्या.",

    footerText: "स्मार्ट हवामान. सोपी माहिती.",
  },
};


export default function Landing() {

  const navigate = useNavigate();

  const [language, setLanguage] =
    useState<Language>("English");

  const [activeFAQ, setActiveFAQ] =
    useState<number | null>(null);

  const [currentBackground, setCurrentBackground] =
    useState(0);

  const [scrollY, setScrollY] =
    useState(0);

  const [locationPromptOpen, setLocationPromptOpen] = useState(false);
  const [locationRequesting, setLocationRequesting] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationGranted, setLocationGranted] = useState(() =>
    Boolean(localStorage.getItem("weathergpt_location"))
  );


  const backgrounds = [
    cloudy,
    storm,
    snow,
    fog,
    clearNight,
  ];


  const t = translations[language];


  /*
    Change background image every 5 seconds.
  */
  useEffect(() => {

    const interval = setInterval(() => {

      setCurrentBackground((previous) =>
        (previous + 1) % backgrounds.length
      );

    }, 5000);


    return () => clearInterval(interval);

  }, [backgrounds.length]);


  /*
    Track landing-page scrolling.

    This is used to gradually darken the hero
    background when the user starts scrolling.
  */
  useEffect(() => {

    const landingPage =
      document.querySelector(".landing-page");

    if (!landingPage) return;


    const handleScroll = () => {

      setScrollY(
        (landingPage as HTMLElement).scrollTop
      );

    };


    landingPage.addEventListener(
      "scroll",
      handleScroll
    );


    return () => {

      landingPage.removeEventListener(
        "scroll",
        handleScroll
      );

    };

  }, []);


  /*
    Smooth scroll without changing URL.
  */
  const scrollToSection = (id: string) => {

    const section =
      document.getElementById(id);

    if (section) {

      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    }

  };


  /*
    Ask for location the first time the user chooses to explore.
    Once location has been granted, the next Explore action opens the app.
  */
  const openDashboard = () => {
    if (locationGranted || localStorage.getItem("weathergpt_location")) {
      navigate("/dashboard");
      return;
    }

    setLocationError("");
    setLocationPromptOpen(true);
  };

  const continueWithLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Location is not supported by this browser.");
      return;
    }
    setLocationRequesting(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        localStorage.setItem(
          "weathergpt_location",
          JSON.stringify({ lat: position.coords.latitude, lon: position.coords.longitude })
        );
        setLocationGranted(true);
        setLocationRequesting(false);
        setLocationPromptOpen(false);
      },
      () => {
        setLocationRequesting(false);
        setLocationError("Location permission was not granted. You can continue without live location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const continueWithoutLocation = () => {
    setLocationPromptOpen(false);
    navigate("/dashboard");
  };


  /*
    FAQ accordion.
  */
  const toggleFAQ = (index: number) => {

    setActiveFAQ(
      activeFAQ === index
        ? null
        : index
    );

  };


  /*
    Calculate how much the hero background
    should fade while scrolling.

    0 = full background
    1 = almost completely black
  */
  const backgroundFade =
    Math.min(scrollY / 550, 1);


  return (

    <div className="landing-page">


      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="landing-header">

        <button
          className="landing-logo"
          onClick={() =>
            scrollToSection("home")
          }
        >
          WeatherGPT
        </button>


        <nav className="landing-nav">

          <button
            onClick={() =>
              scrollToSection("home")
            }
          >
            {t.navHome}
          </button>


          <button
            onClick={() =>
              scrollToSection("features")
            }
          >
            {t.navFeatures}
          </button>


          <button
            onClick={() =>
              scrollToSection("faq")
            }
          >
            {t.navFAQ}
          </button>

        </nav>


        {/* Netflix-style icon + select pill */}

        <div className="language-select-wrapper">

          <svg
            className="language-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18" />
            <path d="M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3z" />
          </svg>


          <select
            className="language-selector"
            value={language}
            onChange={(event) =>
              setLanguage(
                event.target.value as Language
              )
            }
          >

            <option value="English">
              English
            </option>

            <option value="हिन्दी">
              हिन्दी
            </option>

            <option value="मराठी">
              मराठी
            </option>

          </select>

        </div>

      </header>



      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        id="home"
        className="hero-section"
      >

        {/* Weather background slideshow */}

        <div className="hero-background">

          {backgrounds.map(
            (image, index) => (

              <div
                key={image}
                className={`weather-slide ${
                  index === currentBackground
                    ? "active"
                    : ""
                }`}
                style={{
                  backgroundImage:
                    `url(${image})`,
                }}
              />

            )
          )}

        </div>


        {/* Dark overlay */}

        <div
          className="hero-overlay"
          style={{
            opacity:
              0.35 + backgroundFade * 0.65,
          }}
        />


        {/* Top dark fade */}

        <div className="hero-top-fade" />


        {/* Bottom black fade */}

        <div className="hero-bottom-fade" />


        {/* Hero content */}

        <div className="hero-content">

          <p className="hero-label">
            {t.heroLabel}
          </p>


          <h1>

            {t.heroTitle1}

            <br />

            <span>
              {t.heroTitle2}
            </span>

          </h1>


          <p className="hero-description">
            {t.heroDescription}
          </p>


          <button
            className="explore-button"
            onClick={openDashboard}
          >

            <span className="explore-button-label">
              {t.explore}
            </span>

            <span className="explore-button-arrow">
              →
            </span>

          </button>


          <button
            className="scroll-indicator"
            onClick={() =>
              scrollToSection("features")
            }
          >

            <span>
              {t.scroll}
            </span>

            <span className="scroll-arrow">
              ↓
            </span>

          </button>

        </div>

      </section>



      {/* =====================================================
          FEATURES
      ====================================================== */}

      <section
        id="features"
        className="features-section"
      >

        <div className="section-heading">

          <p className="section-label">
            {t.featureLabel}
          </p>


          <h2>
            {t.featureTitle}
          </h2>


          <p>
            {t.featureDescription}
          </p>

        </div>


        <div className="feature-grid">

          {t.features.map(
            (feature, index) => (

              <div
                className="feature-card"
                key={feature.title}
                style={{
                  animationDelay:
                    `${index * 0.1}s`,
                }}
              >

                <div className="electric-border" />


                <div className="feature-icon">
                  {feature.icon}
                </div>


                <h3>
                  {feature.title}
                </h3>


                <p>
                  {feature.description}
                </p>


                <div className="feature-number">
                  0{index + 1}
                </div>

              </div>

            )
          )}

        </div>


        <div className="features-bottom">

          <button
            className="outline-explore-button"
            onClick={openDashboard}
          >

            <span className="outline-explore-button-label">
              {t.explore}
            </span>

            <span>
              →
            </span>

          </button>

        </div>

      </section>



      {/* =====================================================
          FAQ
      ====================================================== */}

      <section
        id="faq"
        className="faq-section"
      >

        <div className="section-heading">

          <p className="section-label">
            {t.faqLabel}
          </p>


          <h2>
            {t.faqTitle}
          </h2>

        </div>


        <div className="faq-container">

          {t.faq.map(
            (item: FAQItem, index: number) => {

              const isOpen =
                activeFAQ === index;


              return (
                <div
                  className={`faq-card ${
                    isOpen
                      ? "faq-open"
                      : ""
                  }`}
                  key={item.question}
                >

                  {/* Electric corner */}

                  <div className="faq-corner faq-corner-top" />

                  <div className="faq-corner faq-corner-bottom" />


                  <button
                    className="faq-question"
                    onClick={() =>
                      toggleFAQ(index)
                    }
                  >

                    <span>
                      {item.question}
                    </span>


                    <span
                      className={`faq-plus ${
                        isOpen
                          ? "rotate"
                          : ""
                      }`}
                    >
                      +
                    </span>

                  </button>


                  <div
                    className={`faq-answer ${
                      isOpen
                        ? "show"
                        : ""
                    }`}
                  >

                    <p>
                      {item.answer}
                    </p>

                  </div>
                </div>

              );

            }
          )}

          {locationPromptOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-900 p-7 text-white shadow-2xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15">
                  <MapPin className="h-6 w-6 text-cyan-300" />
                </div>
                <h2 className="text-xl font-semibold">Turn on location for a better experience</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  WeatherGPT uses your location for live weather, local alerts, maps, and farming advice. Your browser will ask for permission.
                </p>
                {locationError && <p className="mt-3 text-sm text-amber-300">{locationError}</p>}
                <button
                  type="button"
                  onClick={continueWithLocation}
                  disabled={locationRequesting}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60"
                >
                  {locationRequesting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  {locationRequesting ? "Requesting location..." : "Allow live location"}
                </button>
                <button
                  type="button"
                  onClick={continueWithoutLocation}
                  className="mt-3 w-full rounded-xl border border-white/15 px-4 py-3 text-sm text-slate-300 hover:bg-white/5"
                >
                  Continue without location
                </button>
              </div>
            </div>
          )}
        </div>



        {/* Final CTA */}

        <div className="final-cta">

          <div className="final-glow" />


          <p className="section-label">
            WEATHERGPT
          </p>


          <h2>
            {t.finalTitle}
          </h2>


          <p>
            {t.finalDescription}
          </p>


          <button
            className="explore-button"
            onClick={openDashboard}
          >

            <span className="explore-button-label">
              {t.explore}
            </span>

            <span className="explore-button-arrow">
              →
            </span>

          </button>

        </div>

      </section>



      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="landing-footer">

        <div>

          <h3>
            WeatherGPT
          </h3>

          <p>
            {t.footerText}
          </p>

        </div>


        <p className="footer-copy">
          © 2026 WeatherGPT
        </p>

      </footer>

    </div>

  );

}