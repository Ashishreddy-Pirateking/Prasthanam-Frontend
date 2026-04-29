import { useMemo, useState } from "react";
import { NAVARASAS } from "../data/legacyData";
import { useSiteContent } from "../context/SiteContentContext";
import Challenge from "./Challenge";

const TELUGU_RASA_NAMES = {
  shringara: "శృంగారం",
  hasya: "హాస్యం",
  karuna: "కరుణ",
  raudra: "రౌద్రం",
  veera: "వీరం",
  bhayanaka: "భయానకం",
  bibhatsa: "బీభత్సం",
  adbhuta: "ఆద్భుతం",
  shanta: "శాంతం",
};

const TELUGU_RASA_FONTS = {
  shringara: "'Sirivennela', cursive",
  hasya: "'Timmana', sans-serif",
  karuna: "'Mandali', sans-serif",
  raudra: "'Suranna', serif",
  veera: "'Sree Krushnadevaraya', serif",
  bhayanaka: "'Dhurjati', sans-serif",
  bibhatsa: "'Gurajada', serif",
  adbhuta: "'Tenali Ramakrishna', sans-serif",
  shanta: "'NTR', sans-serif",
};

export default function Navarasas() {
  const { siteContent, loading } = useSiteContent();

  const rasaList = useMemo(() => {
    const live = Array.isArray(siteContent?.navarasas) && siteContent.navarasas.length
      ? siteContent.navarasas
      : NAVARASAS;
    const fallbackById = Object.fromEntries(NAVARASAS.map((rasa) => [rasa.id, rasa]));

    return live.map((item) => ({
      ...(fallbackById[item.id] || {}),
      ...item,
      plays:
        Array.isArray(item.plays) && item.plays.length
          ? item.plays
          : Array.isArray(fallbackById[item.id]?.plays)
            ? fallbackById[item.id].plays
            : [],
    }));
  }, [siteContent]);

  const [activeRasaId, setActiveRasaId] = useState(() => String(rasaList[0]?.id || NAVARASAS[0]?.id || ""));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const safeActiveRasaId = rasaList.some((rasa) => String(rasa.id) === String(activeRasaId))
    ? activeRasaId
    : String(rasaList[0]?.id || NAVARASAS[0]?.id || "");

  const currentRasa = useMemo(
    () =>
      rasaList.find((rasa) => String(rasa.id) === String(safeActiveRasaId)) ||
      rasaList[0] ||
      NAVARASAS[0],
    [rasaList, safeActiveRasaId]
  );
  const accentColor = String(currentRasa?.glowColor || "#FFD700");
  const iconMarkup = String(
    currentRasa?.icon ||
      NAVARASAS.find((rasa) => String(rasa.id) === String(currentRasa?.id || ""))?.icon ||
      NAVARASAS[0]?.icon ||
      ""
  );

  const glowStyle = useMemo(
    () => ({
      background: `radial-gradient(circle at center, ${accentColor}50 0%, #000000 80%)`,
    }),
    [accentColor]
  );

  if (!siteContent && loading) {
    return (
      <section
        id="navarasas"
        className="navarasas-fit pt-10 pb-20 border-t border-b border-[#222] transition-[background] duration-700 ease-in-out"
        style={{ background: "radial-gradient(circle at center, #FFD70020 0%, #000000 80%)" }}
      >
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <div className="text-center mb-12 flex flex-col items-center">
            <div className="group relative min-h-[60px] md:h-[80px] flex flex-col items-center justify-center cursor-none">
              <h2 className="text-[32px] md:text-5xl font-['DynaPuff'] font-normal text-[#FFD700] tracking-[0.25em] md:tracking-[0.35em] uppercase drop-shadow-[0_0_18px_rgba(255,215,0,0.65)]">
                Navarasa
              </h2>
            </div>
            <div className="mt-3 flex items-center justify-center gap-4">
              <span className="h-px w-12 md:w-16 bg-gray-400/60"></span>
              <p className="text-base md:text-lg font-playfair text-gray-300 tracking-[0.28em] uppercase opacity-80">
                Loading emotions...
              </p>
              <span className="h-px w-12 md:w-16 bg-gray-400/60"></span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="navarasas"
      className="navarasas-fit pt-10 pb-20 border-t border-b border-[#222] transition-[background] duration-700 ease-in-out"
      style={glowStyle}
    >
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12 flex flex-col items-center">
          <div className="group relative min-h-[60px] md:h-[80px] flex flex-col items-center justify-center cursor-none">
            <h2 className="text-[32px] md:text-5xl font-['DynaPuff'] font-normal text-[#FFD700] tracking-[0.25em] md:tracking-[0.35em] uppercase drop-shadow-[0_0_18px_rgba(255,215,0,0.65)] transition-opacity duration-300 md:group-hover:opacity-0">
              Navarasa
            </h2>
            <h2 className="text-[40px] md:text-7xl font-['Dhurjati'] font-normal text-[#FFD700] md:absolute md:tracking-widest opacity-100 md:opacity-0 transition-opacity duration-300 md:group-hover:opacity-100 drop-shadow-[0_0_18px_rgba(255,215,0,0.65)] whitespace-nowrap -mt-2 md:mt-0">
              నవరసాలు
            </h2>
          </div>
          <div className="mt-3 flex items-center justify-center gap-4">
            <span className="h-px w-12 md:w-16 bg-gray-400/60"></span>
            <p className="text-base md:text-lg font-playfair text-gray-300 tracking-[0.28em] uppercase opacity-80">
              The Nine Emotions
            </p>
            <span className="h-px w-12 md:w-16 bg-gray-400/60"></span>
          </div>
        </div>
        {/* Mobile Dropdown Selection */}
        <div className="md:hidden flex flex-col items-center justify-center w-full max-w-[300px] mx-auto mb-10 px-4 relative z-50">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between bg-black/60 border text-white font-bold py-3 px-6 rounded-full font-['Cinzel'] tracking-[0.15em] outline-none backdrop-blur-md shadow-lg transition-all duration-300"
            style={{
              boxShadow: `0 0 15px ${accentColor}`,
              borderColor: accentColor,
            }}
          >
            <span className="flex-1 text-center uppercase">{String(currentRasa.name || "").toUpperCase()}</span>
            <svg 
              className={`fill-current h-5 w-5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              style={{ color: accentColor }} 
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </button>
          
          {/* Custom Dropdown Table */}
          <div 
            className={`absolute top-full left-4 right-4 mt-3 bg-black/90 backdrop-blur-xl border rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 transform origin-top ${isDropdownOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}
            style={{ borderColor: accentColor, boxShadow: `0 10px 30px ${accentColor}40` }}
          >
            <ul 
              className="max-h-[300px] overflow-y-auto navarasa-mobile-scroll"
              style={{ "--navarasa-scrollbar-color": accentColor }}
            >
              {rasaList.map((rasa) => (
                <li key={rasa.id}>
                  <button
                    onClick={() => {
                      setActiveRasaId(String(rasa.id));
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-center py-4 px-6 font-['Cinzel'] tracking-[0.15em] transition-colors ${activeRasaId === String(rasa.id) ? 'bg-white/10 font-bold text-lg' : 'hover:bg-white/5'} text-white uppercase border-b border-white/5 last:border-0`}
                    style={activeRasaId === String(rasa.id) ? { color: rasa.glowColor || accentColor } : {}}
                  >
                    {String(rasa.name || "").toUpperCase()}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div id="filterButtons" className="hidden md:flex flex-row md:flex-wrap overflow-x-auto md:overflow-x-visible items-center md:justify-center gap-3 md:gap-4 mb-10 md:mb-16 px-4 pb-4 md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" style={{ scrollSnapType: 'x mandatory' }}>
          {rasaList.map((rasa) => {
            const isActive = rasa.id === currentRasa.id;
            const className = [
              "px-6 py-2 rounded-full text-base font-['Cinzel'] tracking-[0.15em] border transition-all duration-300 border backdrop-blur-sm",
              isActive
                ? "text-white border-transparent scale-105 font-bold"
                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/30",
            ].join(" ");

            return (
              <button
                key={rasa.id}
                className={className}
                style={
                  isActive
                    ? {
                        backgroundColor: rasa.glowColor || accentColor,
                        boxShadow: `0 0 20px ${rasa.glowColor || accentColor}`,
                      }
                    : undefined
                }
                onClick={() => setActiveRasaId(String(rasa.id))}
              >
                {String(rasa.name || "").toUpperCase()}
              </button>
            );
          })}
        </div>
        <div className="grid md:grid-cols-2 gap-2 items-center min-h-[100px]">
          <div id="rasaDisplay" className="flex flex-col justify-center items-center text-center md:text-left md:items-start space-y-6">
            <div className="transform transition-all duration-700 hover:scale-110">
              <div
                className="text-9xl opacity-100 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                style={{ color: accentColor }}
                dangerouslySetInnerHTML={{ __html: iconMarkup }}
              />
            </div>
            <div className="border-t-2 w-24 my-6 opacity-50" style={{ borderColor: accentColor }} />
            <h3
              className="text-5xl md:text-7xl text-white drop-shadow-lg tracking-wide transition-all duration-500"
              style={{ fontFamily: TELUGU_RASA_FONTS[currentRasa.id] || "'Sirivennela', sans-serif" }}
            >
              {TELUGU_RASA_NAMES[currentRasa.id] || currentRasa.name}
            </h3>
            <p className="text-[22px] font-sans italic text-gray-300 tracking-widest uppercase opacity-80">
              {currentRasa.subtitle}
            </p>
          </div>
          <div className="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 relative overflow-hidden group shadow-2xl max-h-[320px] overflow-y-auto">
            <h4 className="text-2xl text-white mb-6 border-b border-white/10 pb-4" style={{ fontFamily: "'Comic Relief', cursive" }}>
              Signature Plays
            </h4>
            <ul id="playsList" className="space-y-2 text-[18px] text-gray-300">
              {currentRasa.plays.map((play) => (
                <li
                  key={play}
                  className="flex items-center text-xl text-gray-200 border-b border-white/5 pb-2 last:border-0"
                >
                  <span className="mr-3 text-base" style={{ color: accentColor }}>
                    ●
                  </span>{" "}
                  {play}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Challenge />
    </section>
  );
}
