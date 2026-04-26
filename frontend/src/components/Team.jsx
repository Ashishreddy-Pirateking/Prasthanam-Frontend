import { useState } from "react";
import { useSiteContent } from "../context/SiteContentContext";
import { resolveMediaUrl } from "../utils/media";

const ZODIAC_SYMBOL_BY_NAME = {
  aries: "\u2648",
  taurus: "\u2649",
  gemini: "\u264A",
  cancer: "\u264B",
  leo: "\u264C",
  virgo: "\u264D",
  libra: "\u264E",
  scorpio: "\u264F",
  sagittarius: "\u2650",
  capricorn: "\u2651",
  aquarius: "\u2652",
  pisces: "\u2653",
};

const ZODIAC_SYMBOL_SET = new Set(Object.values(ZODIAC_SYMBOL_BY_NAME));

const resolveZodiacSymbol = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (ZODIAC_SYMBOL_SET.has(raw)) return raw;
  const key = raw.toLowerCase().replace(/[^a-z]/g, "");
  return ZODIAC_SYMBOL_BY_NAME[key] || raw;
};

export default function Team() {
  const { siteContent, loading } = useSiteContent();
  const governors = Array.isArray(siteContent?.governors) ? siteContent.governors : [];
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null);
  const [touchedCardIndex, setTouchedCardIndex] = useState(null);

  if (!siteContent && loading) {
    return (
      <section id="team" className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-6xl md:text-7xl text-center mb-6 text-[#FFD700] tracking-wide" style={{ fontFamily: "'Great Lakes NF', sans-serif" }}>The Governors</h2>
        <p className="text-center text-lg text-gray-400 mb-16">
          Loading governors...
        </p>
      </section>
    );
  }

  return (
    <section id="team" className="py-24 px-6 max-w-7xl mx-auto">
      <h2 className="text-6xl md:text-7xl text-center mb-6 text-[#FFD700] tracking-wide" style={{ fontFamily: "'Great Lakes NF', sans-serif" }}>The Governors</h2>
      <p className="text-center text-lg text-gray-400 mb-16">
        Meet the 2025-2026 Governors. <span className="hidden md:inline">Hover</span><span className="md:hidden">Tap</span> to reveal their true selves.
      </p>
      <div id="teamGrid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {governors.map((g, index) => {
          const funFact = g.funFact || "-";
          const imageSrc = resolveMediaUrl(g.img || "");
          const zodiacSymbol = resolveZodiacSymbol(g.zodiacSign);
          const showZodiac = Boolean(zodiacSymbol);
          const department = String(g.department || "").trim();
          const contactInfo = String(g.contactInfo || "").trim();

          const quoteText = g.quote || "No quote added";
          let quoteSizeClass = "text-[22px] md:text-[26px]";
          if (quoteText.length > 30) quoteSizeClass = "text-[18px] md:text-[20px]";
          else if (quoteText.length > 22) quoteSizeClass = "text-[20px] md:text-[22px]";
          const isFlipped = hoveredCardIndex === index || touchedCardIndex === index;

          return (
            <div
              key={`${g.name}-${index}`}
              className={`group relative card-3d w-[85%] md:w-full mx-auto aspect-[5/7] cursor-pointer ${isFlipped ? "is-flipped" : ""}`}
              onPointerEnter={(event) => {
                if (event.pointerType === "touch") return;
                setTouchedCardIndex(null);
                setHoveredCardIndex(index);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "touch") return;
                setHoveredCardIndex((prev) => (prev === index ? null : prev));
              }}
              onPointerDown={(event) => {
                if (event.pointerType !== "touch") return;
                setTouchedCardIndex((prev) => (prev === index ? null : index));
              }}
            >
              <div className="relative w-full h-full card-inner preserve-3d">
                <div className="card-front absolute inset-0 backface-hidden bg-[#111] border border-[#333] overflow-hidden rounded-lg">
                  <div className="h-3/4 overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={g.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <div className="h-1/4 p-4 flex flex-col justify-center items-center bg-[#1a1a1a]">
                    <h3 className="text-2xl font-bold text-[#FFD700] tracking-wide" style={{ fontFamily: "'Theater Brillion', sans-serif" }}>{g.name}</h3>
                    <p className="text-sm uppercase tracking-widest text-gray-400">{g.role}</p>
                  </div>
                </div>

                <div className="card-back absolute inset-0 backface-hidden rotate-y-180 bg-[#4a0404] rounded-lg p-2 md:p-4 flex flex-col justify-center items-center text-center border-2 border-[#FFD700]">
                  <div className="text-5xl mb-2 text-[#FFD700]">{showZodiac ? zodiacSymbol : "\uD83C\uDFAD"}</div>
                  <p className={`text-[#FFD700] mb-5 w-full whitespace-nowrap overflow-hidden text-ellipsis px-1 ${quoteSizeClass}`} style={{ fontFamily: "'Blacksword', cursive" }}>"{quoteText}"</p>
                  <div className="w-full bg-black/30 p-2 md:p-4 rounded text-base text-gray-200 space-y-3" style={{ fontFamily: "'Jua', sans-serif" }}>
                    <p>
                      <span className="text-[#FFD700] font-bold text-sm uppercase mr-1">Fun Fact:</span>
                      {funFact}
                    </p>
                    <p>
                      <span className="text-[#FFD700] font-bold text-sm uppercase mr-1">Department:</span>
                      {department || "-"}
                    </p>
                    <p>
                      <span className="text-[#FFD700] font-bold text-sm uppercase mr-1">Contact:</span>
                      {contactInfo || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <a
        href="/cast"
        role="button"
        className="group relative mt-16 block w-full max-w-[500px] mx-auto rounded-full border border-[#FFD700]/60 bg-gradient-to-r from-[#1a0b00] via-black to-[#332000] py-4 text-center shadow-[0_0_30px_rgba(255,215,0,0.15)] transition-all duration-300 hover:shadow-[0_0_45px_rgba(255,215,0,0.30)] hover:-translate-y-1 hover:border-[#FFD700] overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity duration-300">
          <div className="absolute -inset-x-40 -bottom-32 h-52 bg-[radial-gradient(circle_at_top,rgba(255,215,0,0.65),transparent_60%)] blur-3xl" />
        </div>
        <div className="relative flex items-center justify-center gap-3">
          <span className="font-cinzel text-xs md:text-sm tracking-[0.35em] text-[#fef3c7] uppercase">
            Meet the
          </span>
          <span className="font-cinzel text-xl md:text-2xl tracking-[0.25em] uppercase text-[#FFD700]">
            Cast
          </span>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#FFD700]/70 bg-black/60 text-[#FFD700] text-lg shadow-[0_0_12px_rgba(255,215,0,0.35)] group-hover:translate-x-1 group-hover:scale-110 transition-transform duration-300">
            →
          </span>
        </div>
      </a>
    </section>
  );
}
