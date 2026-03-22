import { useState, useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";

/* ─────────────── Petal data ─────────────── */
const PETALS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i / 24) * 100 + Math.random() * 4}%`,
  delay: (i / 24) * 10,
  duration: 7 + Math.random() * 6,
  size: 14 + Math.random() * 14,
  drift: (Math.random() - 0.5) * 180,
  emoji: i % 5 === 0 ? "🌷" : "🌸",
}));

/* ─────────────── Single floating petal ─────────────── */
function Petal({ left, delay, duration, size, drift, emoji }) {
  return (
    <motion.span
      className="fixed pointer-events-none select-none z-20"
      style={{ left, top: "-6%", fontSize: size, lineHeight: 1 }}
      initial={{ y: 0, x: 0, opacity: 0, rotate: 0 }}
      animate={{
        y: "108vh",
        x: [0, drift * 0.4, drift, drift * 0.6, 0],
        opacity: [0, 0.9, 0.85, 0.7, 0],
        rotate: [0, 120, -60, 240, 360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
        times: [0, 0.1, 0.5, 0.85, 1],
      }}
    >
      {emoji}
    </motion.span>
  );
}

/* ─────────────── Scroll-triggered fade section ─────────────── */
function Reveal({ children, delay = 0, y = 50 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.22, 0.9, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────── Countdown block ─────────────── */
function CountBlock({ label, value }) {
  return (
    <motion.div
      className="flex flex-col items-center bg-white/70 backdrop-blur-sm rounded-2xl px-5 py-4 border border-amber-200/60 shadow-sm min-w-[72px]"
      whileHover={{ scale: 1.06, boxShadow: "0 10px 30px rgba(180,120,40,0.15)" }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          className="font-cinzel text-3xl md:text-4xl gold-text tabular-nums"
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 12, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {String(value ?? 0).padStart(2, "0")}
        </motion.span>
      </AnimatePresence>
      <span className="font-cormorant text-xs uppercase tracking-[0.25em] text-amber-700/60 mt-1">
        {label}
      </span>
    </motion.div>
  );
}

/* ─────────────── Main component ─────────────── */
export default function WeddingInvitation() {
  const [timeLeft, setTimeLeft] = useState({});
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpSent, setRsvpSent] = useState(null);
  const pageRef = useRef(null);

  // Parallax hero
  const { scrollYProgress } = useScroll({ target: pageRef, offset: ["start start", "end end"] });
  const heroY = useTransform(scrollYProgress, [0, 0.25], ["0%", "28%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0]);

  // Countdown
  const weddingDate = new Date("2025-10-15T10:00:00");
  useEffect(() => {
    const tick = () => {
      const diff = weddingDate - new Date();
      if (diff > 0)
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div ref={pageRef} className="relative min-h-screen overflow-x-hidden" style={{ background: "#fdf8f3" }}>
      {/* ── Google Fonts + custom styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Dancing+Script:wght@500;700&family=Cinzel:wght@400;600&display=swap');
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-dancing   { font-family: 'Dancing Script', cursive; }
        .font-cinzel    { font-family: 'Cinzel', serif; }
        .gold-text {
          background: linear-gradient(135deg,#b8892a 0%,#e8c55a 45%,#b8892a 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .paper { background:
          radial-gradient(ellipse at 20% 60%, rgba(201,168,76,.06) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 20%, rgba(220,140,100,.06) 0%, transparent 55%),
          #fdf8f3;
        }
        .input-field {
          width:100%; background:rgba(255,255,255,.12);
          border:1px solid rgba(201,168,76,.35); border-radius:.75rem;
          padding:.75rem 1rem; color:#f8e9c8;
          font-family:'Cormorant Garamond',serif; font-size:1rem;
          outline:none; transition:border-color .3s;
        }
        .input-field::placeholder { color:rgba(220,180,100,.45); }
        .input-field:focus { border-color:rgba(201,168,76,.7); }
      `}</style>

      {/* ── Floating petals (always visible) ── */}
      {PETALS.map((p) => <Petal key={p.id} {...p} />)}

      {/* ════════════════════════════════════
          HERO — parallax
      ════════════════════════════════════ */}
      <motion.section
        className="relative h-screen flex flex-col items-center justify-center paper overflow-hidden"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* big faint ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[70vmin] h-[70vmin] rounded-full border-[2px] border-amber-300/15" />
          <div className="absolute w-[85vmin] h-[85vmin] rounded-full border border-amber-300/8" />
        </div>

        <motion.p
          className="font-cinzel text-[10px] tracking-[.5em] text-amber-700/70 uppercase mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: .3 }}
        >
          Together with their families
        </motion.p>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: .92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: .5, ease: [.22,.9,.36,1] }}
        >
          <h1 className="font-dancing text-[clamp(4rem,14vw,9rem)] gold-text leading-[1.05]">
            Minh Anh
          </h1>
          <p className="font-cormorant text-2xl text-amber-500/50 tracking-[.35em] my-1">&</p>
          <h1 className="font-dancing text-[clamp(4rem,14vw,9rem)] gold-text leading-[1.05]">
            Hồng Nhung
          </h1>
        </motion.div>

        <motion.div
          className="flex items-center gap-4 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/40" />
          <span className="font-cinzel text-[9px] tracking-[.45em] text-amber-700/60 uppercase">
            Request the honour of your presence
          </span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/40" />
        </motion.div>

        {/* scroll cue */}
        <motion.div
          className="absolute bottom-8 flex flex-col items-center gap-2"
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        >
          <span className="font-cinzel text-[9px] tracking-[.4em] text-amber-700/40 uppercase">Scroll</span>
          <div className="w-px h-7 bg-gradient-to-b from-amber-600/40 to-transparent" />
        </motion.div>
      </motion.section>

      {/* ════════════════════════════════════
          QUOTE + DATE
      ════════════════════════════════════ */}
      <section className="py-24 paper">
        <Reveal>
          <div className="max-w-xl mx-auto text-center px-6">
            <p className="font-cormorant italic text-lg text-amber-800/55 leading-relaxed mb-10">
              "Tình yêu không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng."
            </p>

            {/* ornament */}
            <div className="flex items-center justify-center gap-3 mb-12">
              <div className="h-px flex-1 max-w-[80px] bg-amber-300/40" />
              <span className="text-amber-500 text-lg">✦</span>
              <div className="h-px flex-1 max-w-[80px] bg-amber-300/40" />
            </div>

            <div className="bg-white/65 backdrop-blur-sm rounded-2xl p-10 border border-amber-200/50 shadow-[0_4px_40px_rgba(180,130,40,.08)]">
              <p className="font-cinzel text-[10px] tracking-[.45em] text-amber-700 uppercase mb-5">
                Ngày Lành Tháng Tốt
              </p>
              <p className="font-dancing text-6xl gold-text mb-6">15 · 10 · 2025</p>
              <div className="flex justify-center gap-8 font-cormorant text-amber-800/80">
                <div className="text-center">
                  <p className="text-2xl font-semibold">10:00 SA</p>
                  <p className="text-xs tracking-[.3em] uppercase mt-1 text-amber-700/55">Lễ Vu Quy</p>
                </div>
                <div className="w-px bg-amber-200/70 mx-2" />
                <div className="text-center">
                  <p className="text-2xl font-semibold">18:00 CH</p>
                  <p className="text-xs tracking-[.3em] uppercase mt-1 text-amber-700/55">Tiệc Cưới</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════
          VENUE
      ════════════════════════════════════ */}
      <section className="py-20" style={{ background: "#f5ede2" }}>
        <Reveal delay={0.1}>
          <div className="max-w-xl mx-auto text-center px-6">
            <p className="font-cinzel text-[10px] tracking-[.45em] text-amber-700 uppercase mb-4">
              Địa Điểm Tổ Chức
            </p>
            <h2 className="font-dancing text-5xl gold-text mb-4">Grand Palace Ballroom</h2>
            <p className="font-cormorant text-lg text-amber-800/65 leading-relaxed">
              123 Đường Hoa Đào, Quận Ba Đình<br />Hà Nội, Việt Nam
            </p>

            <motion.a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-8 font-cinzel text-[10px] tracking-[.35em] uppercase text-amber-700/80 border border-amber-400/40 rounded-full px-7 py-2.5 hover:border-amber-500/70 transition-colors"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: .97 }}
            >
              Xem Bản Đồ →
            </motion.a>
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════
          COUNTDOWN
      ════════════════════════════════════ */}
      <section className="py-24 paper">
        <Reveal delay={0.15}>
          <div className="max-w-lg mx-auto text-center px-6">
            <p className="font-cinzel text-[10px] tracking-[.45em] text-amber-700 uppercase mb-10">
              Đếm Ngược Đến Ngày Trọng Đại
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              {[
                { label: "Ngày", value: timeLeft.days },
                { label: "Giờ",  value: timeLeft.hours },
                { label: "Phút", value: timeLeft.minutes },
                { label: "Giây", value: timeLeft.seconds },
              ].map((b) => <CountBlock key={b.label} {...b} />)}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════
          STORY TIMELINE
      ════════════════════════════════════ */}
      <section className="py-20" style={{ background: "#f5ede2" }}>
        <Reveal>
          <div className="max-w-lg mx-auto px-6">
            <p className="font-cinzel text-[10px] tracking-[.45em] text-amber-700 uppercase text-center mb-14">
              Câu Chuyện Của Chúng Tôi
            </p>
            {[
              { year: "2019", title: "Lần đầu gặp gỡ", desc: "Một buổi chiều mưa tại Hà Nội, hai tâm hồn tình cờ gặp nhau." },
              { year: "2020", title: "Bắt đầu yêu", desc: "Những chuyến đi, những khoảnh khắc, và trái tim chợt hiểu." },
              { year: "2024", title: "Cầu hôn", desc: "Dưới bầu trời đầy sao, một câu hỏi thay đổi tất cả." },
              { year: "2025", title: "Nên Duyên", desc: "Ngày 15 tháng 10, chúng tôi chính thức thành đôi." },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.1} y={30}>
                <div className="flex gap-6 mb-8">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-400/60 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-amber-500/70" />
                    </div>
                    {i < 3 && <div className="w-px flex-1 bg-amber-300/40 mt-2" />}
                  </div>
                  <div className="pb-6">
                    <p className="font-cinzel text-[10px] tracking-widest text-amber-600/70 uppercase mb-1">{item.year}</p>
                    <p className="font-dancing text-2xl gold-text mb-1">{item.title}</p>
                    <p className="font-cormorant text-base text-amber-800/60 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════
          RSVP
      ════════════════════════════════════ */}
      <section className="py-24" style={{ background: "#2d1f12" }}>
        <Reveal>
          <div className="max-w-md mx-auto text-center px-6">
            <p className="font-cinzel text-[10px] tracking-[.45em] text-amber-400/60 uppercase mb-3">
              Xác Nhận Tham Dự
            </p>
            <h2 className="font-dancing text-6xl text-amber-300 mb-3">RSVP</h2>
            <p className="font-cormorant text-base text-amber-200/55 mb-10 leading-relaxed">
              Vui lòng xác nhận trước ngày{" "}
              <span className="text-amber-300 font-semibold">01 / 10 / 2025</span>
            </p>

            <AnimatePresence mode="wait">
              {rsvpSent === null ? (
                <motion.div key="form" exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <input
                    className="input-field"
                    placeholder="Họ và tên của bạn"
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => rsvpName && setRsvpSent(true)}
                      className="flex-1 bg-amber-600/80 text-amber-50 font-cinzel text-[10px] tracking-[.35em] uppercase py-3 rounded-xl hover:bg-amber-500/90 transition-colors"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: .97 }}
                    >
                      Tôi Sẽ Đến 🥂
                    </motion.button>
                    <motion.button
                      onClick={() => rsvpName && setRsvpSent(false)}
                      className="flex-1 border border-amber-600/35 text-amber-400/70 font-cinzel text-[10px] tracking-[.3em] uppercase py-3 rounded-xl hover:border-amber-500/55 transition-colors"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: .97 }}
                    >
                      Tiếc Không Đến
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="thanks"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-10"
                >
                  <p className="font-dancing text-4xl text-amber-300 mb-3">
                    {rsvpSent ? "Cảm ơn bạn! 🌸" : "Rất tiếc khi nghe vậy 💌"}
                  </p>
                  <p className="font-cormorant text-base text-amber-200/55">
                    {rsvpSent
                      ? `Chúng tôi rất vui khi được đón ${rsvpName} đến chung vui!`
                      : `Cảm ơn ${rsvpName} đã nhắn tin, chúng tôi sẽ nhớ đến bạn.`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════
          FOOTER
      ════════════════════════════════════ */}
      <footer className="py-14 paper text-center">
        <Reveal>
          <p className="font-dancing text-4xl gold-text mb-1">Minh Anh & Hồng Nhung</p>
          <p className="font-cormorant text-sm text-amber-700/45 tracking-[.3em]">
            15 · 10 · 2025 · Hà Nội, Việt Nam
          </p>
          <div className="flex justify-center gap-3 mt-6">
            {["🌸", "💍", "🌸"].map((e, i) => (
              <motion.span
                key={i}
                className="text-2xl"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.4 }}
              >
                {e}
              </motion.span>
            ))}
          </div>
        </Reveal>
      </footer>
    </div>
  );
}
