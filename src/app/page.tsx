"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useEffect, useMemo, useState } from "react";
import PolaroidStack from "@/components/PolaroidStack";

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
};

const weddingDate = new Date("2026-06-26T00:00:00+03:00");
const RSVP_EMAIL = "wedding@primer.bg";

const navItems = [
  { id: "story", label: "Нашата история" },
  { id: "countdown", label: "Отброяване" },
  { id: "schedule", label: "Програма" },
  { id: "details", label: "Детайли" },
  { id: "qna", label: "Въпроси" },
  { id: "rsvp", label: "RSVP" },
];

const timelineItems = [
  { time: "12:00", title: "Казваме „ДА“", note: "Ловеч" , icon: "rings" },
  { time: "18:00", title: "Welcome drink", note: "Градина на ресторанта" , icon: "champagne" },
  {
    time: "19:00",
    title: "Празнична вечеря",
    note: "Ponte Restaurant", icon: "cake" },
  { time: "", title: "И заживели щастливо...", note: "" , icon: "hearts" },
];


function TimelineIcon({ icon }: { icon: string }) {
  const cls = "w-10 h-10 md:w-12 md:h-12";
  switch (icon) {
    case "rings":
      return (
        <svg viewBox="0 0 496 496" fill="currentColor" className={cls}>
          <path d="M248,227.312l69.376-69.376c6.848-6.848,10.624-15.96,10.624-25.656C328,112.272,311.728,96,291.72,96c-9.696,0-18.8,3.776-25.656,10.624L248,124.688l-18.064-18.064C223.088,99.776,213.976,96,204.28,96C184.272,96,168,112.272,168,132.28c0,9.696,3.776,18.808,10.624,25.656L248,227.312z M204.28,112c5.424,0,10.512,2.112,14.344,5.936L248,147.312l29.376-29.376c3.824-3.824,8.92-5.936,14.344-5.936c11.176,0,20.28,9.104,20.28,20.28c0,5.424-2.112,10.512-5.936,14.344L248,204.688l-58.064-58.064c-3.824-3.824-5.936-8.92-5.936-14.344C184,121.104,193.104,112,204.28,112z"/>
          <path d="M176,256c-57.344,0-104,46.656-104,104s46.656,104,104,104s104-46.656,104-104S233.344,256,176,256z M176,448c-48.52,0-88-39.48-88-88c0-48.52,39.48-88,88-88c12.36,0,24.128,2.592,34.808,7.208C193.496,302.568,184,330.864,184,360s9.496,57.432,26.808,80.792C200.128,445.408,188.36,448,176,448z M225.048,433.024C208.912,412.08,200,386.44,200,360s8.912-52.08,25.048-73.024c4.432,2.984,8.544,6.384,12.352,10.104C223.592,315.176,216,337.224,216,360s7.592,44.824,21.4,62.92C233.592,426.64,229.472,430.04,225.048,433.024z M248.04,410.392C237.672,395.632,232,378.088,232,360s5.672-35.632,16.04-50.392C258.064,323.904,264,341.256,264,360C264,378.744,258.064,396.096,248.04,410.392z"/>
          <path d="M320,224c-25.68,0-50.456,7.232-72.072,20.792C227.032,231.696,202.424,224,176,224c-74.992,0-136,61.008-136,136s61.008,136,136,136c26.424,0,51.032-7.696,71.928-20.792C269.544,488.768,294.32,496,320,496c74.992,0,136-61.008,136-136S394.992,224,320,224z M176,480c-66.176,0-120-53.832-120-120s53.824-120,120-120c66.168,0,120,53.832,120,120S242.168,480,176,480z M285.224,279.312C296.2,274.576,308.032,272,320,272c48.52,0,88,39.48,88,88c0,48.52-39.48,88-88,88c-11.968,0-23.8-2.576-34.776-7.312C301.968,418.08,312,390.224,312,360S301.968,301.92,285.224,279.312z M320,480c-20.392,0-40.144-5.16-57.792-14.904c4.424-3.64,8.536-7.624,12.472-11.784C288.8,460.192,304.288,464,320,464c57.344,0,104-46.656,104-104s-46.656-104-104-104c-15.712,0-31.2,3.808-45.328,10.688c-3.936-4.16-8.04-8.144-12.472-11.784C279.856,245.16,299.608,240,320,240c66.168,0,120,53.832,120,120S386.168,480,320,480z"/>
        </svg>
      );
    case "champagne":
      return (
        <svg viewBox="0 0 512.002 512.002" fill="currentColor" className={cls}>
          <path d="M511.959,448.332c-0.424-4.512-3.898-8.138-8.386-8.758l-79.168-10.917l-42.628-126.593c17.36-8.127,31.38-21.763,40.027-39.19c10.11-20.375,11.682-43.469,4.421-65.025c-0.146-0.437-0.324-0.863-0.532-1.276l-44.656-88.671c-2.185-4.339-7.228-6.414-11.836-4.861L256,141.16l-113.2-38.118c-4.603-1.55-9.651,0.521-11.836,4.861l-12.603,25.025c-2.425,4.817-0.488,10.687,4.329,13.112c4.814,2.424,10.687,0.488,13.111-4.329l8.794-17.46l100.262,33.761l-16.402,88.588c-9.398,27.011-34.834,44.058-62.029,44.056c-6.926-0.001-13.973-1.108-20.891-3.437c-16.614-5.594-30.054-17.324-37.845-33.025c-7.792-15.703-9.002-33.5-3.408-50.113c1.721-5.111-1.026-10.649-6.137-12.369c-5.111-1.718-10.649,1.027-12.369,6.137c-7.259,21.557-5.689,44.649,4.421,65.025c8.647,17.427,22.666,31.062,40.027,39.19L87.596,428.656L8.43,439.573c-4.489,0.62-7.962,4.245-8.387,8.758c-0.424,4.512,2.31,8.722,6.604,10.169l145.875,49.119c9.535,3.214,17.121-9.039,10.028-16.148l-56.44-56.576l42.625-126.585c5.901,1.269,11.868,1.912,17.82,1.912c12.952,0,25.83-2.993,37.772-8.919c20.375-10.11,35.594-27.55,42.852-49.106c0.147-0.437,0.264-0.885,0.349-1.338l8.474-45.764l8.472,45.764c0.083,0.454,0.201,0.901,0.349,1.338c11.961,35.522,45.207,57.987,80.771,57.987c5.854,0,11.774-0.622,17.671-1.883l42.626,126.593l-56.44,56.574c-7.091,7.108,0.491,19.364,10.028,16.148l145.876-49.119C509.649,457.055,512.383,452.845,511.959,448.332z M119.394,475.859l-67.156-22.612l39.204-5.407L119.394,475.859z M283.545,246.601l-16.402-88.588l100.263-33.761l40.524,80.467c5.351,16.431,4.073,33.974-3.618,49.477c-7.792,15.703-21.233,27.433-37.845,33.027C332.382,298.694,295.336,280.49,283.545,246.601z M392.608,475.859l27.953-28.018l39.204,5.407L392.608,475.859z"/>
          <path d="M387.184,206.968c-0.146-0.437-0.324-0.864-0.532-1.276l-20.004-39.721c-2.425-4.816-8.294-6.755-13.111-4.329c-4.817,2.425-6.754,8.295-4.329,13.112l19.666,39.05c1.819,5.904,1.315,12.174-1.441,17.729c-2.85,5.745-7.767,10.035-13.845,12.081c-5.11,1.721-7.858,7.259-6.138,12.369c1.373,4.077,5.176,6.651,9.252,6.651c1.034,0,2.084-0.165,3.118-0.514c11.02-3.71,19.937-11.491,25.105-21.908C390.094,229.796,390.897,217.99,387.184,206.968z"/>
          <path d="M158.417,243.617c-6.078-2.047-10.994-6.337-13.845-12.081c-2.756-5.555-3.261-11.825-1.441-17.729l19.666-39.052c2.425-4.817,0.488-10.687-4.329-13.112c-4.813-2.427-10.686-0.488-13.111,4.329l-20.004,39.721c-0.208,0.411-0.387,0.838-0.532,1.276c-3.713,11.021-2.908,22.828,2.26,33.245c5.168,10.416,14.085,18.197,25.105,21.909c1.034,0.349,2.084,0.514,3.118,0.514c4.076-0.001,7.88-2.575,9.252-6.651C166.275,250.876,163.527,245.338,158.417,243.617z"/>
        </svg>
      );
    case "cake":
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <rect x="12" y="34" width="40" height="14" rx="2" />
          <rect x="18" y="22" width="28" height="12" rx="2" />
          <rect x="24" y="12" width="16" height="10" rx="2" />
          <path d="M32 6v6M26 8l2 4m8-4l-2 4" />
          <path d="M12 41h40M18 28h28" />
          <path d="M24 48v6h16v-6" />
        </svg>
      );
    case "hearts":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <path d="M15.5455 9.92543C15.9195 9.26103 16.2313 8.66151 16.4236 8.20521C17.3573 5.98947 16.434 3.44077 14.1769 2.40112C11.9199 1.36148 9.65341 2.4395 8.65871 4.52093C6.75657 3.2157 4.21918 3.40739 2.81989 5.44424C1.42059 7.48108 1.85975 10.142 3.77629 11.594C4.6461 12.253 6.36636 13.2242 7.98596 14.0884M16.2972 11.7499C15.8751 9.482 13.9454 7.82334 11.5156 8.27415C9.08592 8.72497 7.51488 10.9171 7.84335 13.299C8.10725 15.2127 9.56392 19.7027 10.1264 21.394C10.2032 21.6248 10.2415 21.7402 10.3175 21.8206C10.3837 21.8907 10.4717 21.9416 10.5655 21.9638C10.6732 21.9894 10.7923 21.9649 11.0306 21.916C12.7765 21.5575 17.3933 20.574 19.1826 19.8457C21.4096 18.9392 22.5589 16.4841 21.6981 14.153C20.8372 11.8219 18.4723 10.9815 16.2972 11.7499Z"/>
        </svg>
      );
    default:
      return null;
  }
}

function HeartDot() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0">
      <path d="M8 3C6.5.5 2 1.5 2 5.5S8 14 8 14s6-4.5 6-8.5S9.5.5 8 3z" />
    </svg>
  );
}

const detailItems = [
  {
    title: "Дрескод",
    text: "Елегантен и комфортен. Нежни, пастелни и земни тонове ще се впишат чудесно.",
  },
  {
    title: "Локация",
    text: "Церемония и вечеря в Ловеч. Пълен адрес и карта ще изпратим след потвърждение.",
  },
  {
    title: "Подарък",
    text: "Най-големият подарък е Вашето присъствие. Ако желаете, може да ни зарадвате с картичка.",
  },
];

const qnaItems = [
  {
    question: "Мога ли да доведа дете?",
    answer:
      "Ще се радваме да споделим деня с всички близки. При RSVP отбележете възрастта на детето, за да подготвим удобно място.",
  },
  {
    question: "Има ли паркинг?",
    answer:
      "Да, до ресторанта има осигурени паркоместа за гости. Ще получите указания с потвърждението.",
  },
  {
    question: "До кога да потвърдя присъствие?",
    answer: "Моля потвърдете до 01.06.2026, за да организираме местата и менюто.",
  },
  {
    question: "Какво да направя при хранителен режим?",
    answer:
      "В полето „Съобщение“ в RSVP ни напишете предпочитанията си и ще се погрижим.",
  },
];

const polaroids = [
  {
    caption: "Първа среща",
    subtitle: "Един обикновен ден, който промени всичко.",
  },
  {
    caption: "Първо пътуване",
    subtitle: "Смях, музика и спомени по пътя.",
  },
  {
    caption: "Предложението",
    subtitle: "„Да“ преди голямото „ДА“.",
  },
  {
    caption: "Днес и завинаги",
    subtitle: "Следващата глава започва на 26.06.2026.",
  },
];

function getCountdown(target: Date): Countdown {
  const diff = target.getTime() - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isComplete: false };
}

function formatValue(value: number) {
  return String(value).padStart(2, "0");
}

export default function Home() {
  const [countdown, setCountdown] = useState<Countdown>(() =>
    getCountdown(weddingDate),
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpGuests, setRsvpGuests] = useState("2");
  const [rsvpPhone, setRsvpPhone] = useState("");
  const [rsvpMessage, setRsvpMessage] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(getCountdown(weddingDate));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotion.matches) {
      const allReveals = document.querySelectorAll<HTMLElement>("[data-reveal]");
      allReveals.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      {
        // Any overlap counts — 0.2 was too strict for tall sections (e.g. stacked
        // intro cards on mobile), so content stayed opacity:0 and looked blank.
        threshold: 0,
        rootMargin: "0px 0px 12% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, []);

  const countdownItems = useMemo(
    () => [
      { value: countdown.days, label: "дни" },
      { value: countdown.hours, label: "часа" },
      { value: countdown.minutes, label: "минути" },
      { value: countdown.seconds, label: "секунди" },
    ],
    [countdown],
  );

  const onRsvpSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = `RSVP за сватбата - ${rsvpName || "Гост"}`;
    const body = [
      "Здравейте,",
      "",
      "Потвърждавам присъствие за сватбата на Мария и Калоян.",
      "",
      `Име: ${rsvpName || "-"}`,
      `Брой гости: ${rsvpGuests || "-"}`,
      `Телефон: ${rsvpPhone || "-"}`,
      `Съобщение: ${rsvpMessage || "-"}`,
      "",
      "С обич,",
      rsvpName || "Ваш гост",
    ].join("\n");

    window.location.href = `mailto:${RSVP_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    window.scrollTo({
      top: 0,
      behavior: reduceMotion.matches ? "auto" : "smooth",
    });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <header className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-3xl bg-[color:color-mix(in_srgb,var(--paper)_88%,white)]/90 px-4 py-3 shadow-sm backdrop-blur-md md:px-8">
          <a
            href="#"
            className="min-w-0 shrink text-base leading-snug tracking-[0.06em] sm:text-lg md:text-xl md:tracking-[0.1em]"
            onClick={(event) => {
              event.preventDefault();
              scrollToTop();
            }}
          >
            {"M&K"}
          </a>
          <ul className="hidden gap-6 text-lg md:flex">
            {navItems.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="nav-link">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <a
              href="#rsvp"
              className="rounded-full bg-black px-4 py-2 text-center text-sm font-medium tracking-wide text-white transition hover:bg-black/90 md:hidden"
            >
              RSVP
            </a>
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Затвори менюто" : "Отвори менюто"}
              aria-expanded={mobileMenuOpen}
              className="flex flex-col gap-1.5 md:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <span className={`block h-0.5 w-6 bg-current transition-transform duration-200 ${mobileMenuOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-6 bg-current transition-opacity duration-200 ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-6 bg-current transition-transform duration-200 ${mobileMenuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[100] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              type="button"
              aria-label="Затвори менюто"
              className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Навигация"
              className="absolute right-0 top-0 flex h-full w-[min(88vw,20rem)] flex-col bg-[color:color-mix(in_srgb,var(--background)_95%,white)] shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-xl tracking-[0.12em]">Меню</span>
                <button
                  type="button"
                  aria-label="Затвори"
                  className="rounded-lg px-2 py-1 text-2xl leading-none text-[color:var(--foreground)] hover:bg-black/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ×
                </button>
              </div>
              <ul className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-5 text-xl">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block rounded-lg px-3 py-3 transition-colors hover:bg-black/[0.04]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <section
        id="hero"
        className="px-3 pt-4 pb-3 md:px-6 md:pt-5 md:pb-5"
        aria-label="Начало"
      >
        {/* Rounded frame — when you add a photo, use next/image with fill + object-cover on this block */}
        <div className="relative isolate min-h-[calc(100dvh-2.25rem)] w-full overflow-hidden rounded-3xl md:rounded-[1.75rem]">
          {/* Full-screen image placeholder — replace with next/image fill when you add a photo */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#e8e0d8] via-[#f2ede6] to-[#cfc4b8]"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,rgba(255,255,255,0.35),transparent_55%)]"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/25"
            aria-hidden
          />
          <div
            className="absolute inset-0 flex items-center justify-center p-6 pt-28"
            aria-hidden
          >
            <p className="max-w-sm text-center text-2xl tracking-[0.12em] text-[color:var(--foreground)]/40 md:text-3xl">
              Място за снимка
            </p>
          </div>

          <div className="relative z-10 flex min-h-[calc(100dvh-2.25rem)] flex-col justify-end px-6 pb-10 pt-28 md:px-10 md:pb-14">
            <div className="mx-auto w-full max-w-4xl text-center">
              <p className="mb-3 text-3xl font-light tracking-[0.08em] text-white md:text-5xl md:tracking-[0.1em]">
                Мария &amp; Калоян
              </p>
              <a
                href="#intro"
                className="group mt-6 inline-flex flex-col items-center gap-3 text-white/95 outline-none ring-offset-2 ring-offset-transparent focus-visible:ring-2 focus-visible:ring-white/80"
              >
                <span className="hero-scroll-arrow inline-block">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8 md:h-9 md:w-9"
                    aria-hidden
                  >
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </span>
                <span className="text-[10px] font-normal uppercase tracking-[0.28em] md:text-xs">
                  Прокрете надолу
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-28 px-6 pb-28 pt-10 md:px-10">
        <section id="intro" className="reveal grid gap-8 md:grid-cols-[1.1fr_0.9fr]" data-reveal>
          <div className="paper-card rounded-3xl p-8 md:p-10">
            <p className="text-center text-xl uppercase tracking-[0.22em]">
              Казваме „Да“ на любовта
            </p>
            <h1 className="mt-4 text-center text-5xl leading-none md:text-7xl">
              Мария и Калоян
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-center text-3xl leading-relaxed md:text-4xl">
              С радост Ви каним да отпразнуваме любовта си заедно.
            </p>
            <p className="mt-8 text-center text-5xl font-semibold tracking-[0.08em] md:text-6xl">
              26.06.2026
            </p>
            <p className="mt-3 text-center text-2xl tracking-[0.34em]">ПЕТЪК</p>
          </div>
          <div
            className="floating-ornament reveal paper-card flex min-h-[22rem] flex-col items-center justify-center rounded-3xl p-8 text-center md:min-h-[30rem]"
            data-reveal
          >
            <p className="text-2xl uppercase tracking-[0.28em] md:text-3xl">
              M &amp; K
            </p>
            <div className="my-8 h-px w-40 bg-[color:color-mix(in_srgb,var(--line)_50%,transparent)]" />
            <p className="max-w-xs text-3xl leading-tight md:max-w-sm md:text-4xl">
              Любов, обещания и спомени, които започват оттук.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-[color:var(--accent)]/70" />
              <span className="h-3 w-3 rounded-full bg-[color:var(--accent)]/50" />
              <span className="h-3 w-3 rounded-full bg-[color:var(--accent)]/30" />
            </div>
          </div>
        </section>

        <section className="reveal grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr]" data-reveal>
          <div className="paper-card rounded-3xl p-8 md:p-10">
            <p className="text-center text-2xl uppercase tracking-[0.16em] md:text-3xl">
              Ще се радваме да споделите този ден с нас
            </p>
            <p className="mt-6 text-center text-4xl font-semibold md:text-5xl">
              Потвърдете до 01.06.2026
            </p>
            <p className="mx-auto mt-6 max-w-xl text-center text-2xl leading-relaxed md:text-3xl">
              Използвайте секцията RSVP в края на страницата, за да ни пишете бързо и лесно.
            </p>
          </div>
          <div className="paper-card flex min-h-[16rem] flex-col justify-center rounded-3xl p-8 md:min-h-[20rem] md:p-10">
            <p className="text-4xl leading-tight md:text-5xl">
              Очакваме с нетърпение да бъдете част от нашия ден.
            </p>
            <p className="mt-5 text-2xl leading-relaxed opacity-80 md:text-3xl">
              Потвърдете присъствието си и ще получите допълнителни детайли за
              локация, паркинг и настаняване.
            </p>
            <p className="mt-6 text-3xl tracking-[0.08em] md:text-4xl">
              RSVP до 01.06.2026
            </p>
          </div>
        </section>

        <section id="story" className="reveal space-y-12" data-reveal>
          <div className="reveal mb-12 text-center md:mb-16" data-reveal>
            <p className="text-xl uppercase tracking-[0.22em] md:text-2xl">
              Нашата любовна история
            </p>
            <h2 className="mt-4 text-4xl md:text-6xl">Малки спомени, голяма любов</h2>
          </div>
          <div className="paper-card rounded-3xl p-6 md:p-10">
            <PolaroidStack images={polaroids} />
          </div>
        </section>

        <section id="countdown" className="reveal space-y-10 text-center" data-reveal>
          <p className="text-xl uppercase tracking-[0.2em] md:text-2xl">Отброяване до големия ден</p>
          <h2 className="text-5xl md:text-7xl">26.06.2026</h2>
          {countdown.isComplete ? (
            <p className="mx-auto max-w-3xl text-4xl leading-relaxed md:text-5xl">
              Денят настъпи. Очакваме Ви с много усмивки и любов.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-3 md:gap-4">
              {countdownItems.map((item) => (
                <div key={item.label} className="countdown-cell rounded-2xl p-3 md:p-8">
                  <div className="text-3xl font-semibold md:text-7xl">{formatValue(item.value)}</div>
                  <div className="mt-1 text-xs tracking-[0.08em] uppercase md:mt-2 md:text-3xl md:tracking-[0.12em]">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="schedule" className="reveal space-y-8" data-reveal>
          <div className="text-center">
            <p className="text-xl uppercase tracking-[0.2em] md:text-2xl">Програма на деня</p>
            <h2 className="mt-3 text-5xl md:text-6xl">Ловеч</h2>
          </div>
          <div className="paper-card mx-auto max-w-3xl rounded-3xl p-8 md:p-12">
            <div className="relative">
              {/* Vertical line with hearts */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-[color:color-mix(in_srgb,var(--line)_40%,transparent)] md:left-7" />
              <div className="flex flex-col gap-12 md:gap-16">
                {timelineItems.map((item) => {
                  return (
                    <div key={item.time} className="relative grid grid-cols-[1fr_auto] items-start gap-4 pl-16 md:pl-20">
                      {/* Heart on the line */}
                      <div className="absolute left-[17px] top-1 text-[color:var(--accent)] md:left-[21px]">
                        <HeartDot />
                      </div>
                      {/* Content */}
                      <div>
                        {item.time ? (
                          <p className="text-2xl font-semibold md:text-3xl">{item.time}</p>
                        ) : null}
                        <p className="mt-1 text-3xl leading-tight md:text-4xl">{item.title}</p>
                        {item.note ? (
                          <p className="mt-1 text-xl opacity-80 md:text-2xl">{item.note}</p>
                        ) : null}
                      </div>
                      {/* Icon on the right */}
                      <div className="mt-1 text-[color:var(--accent)]/80">
                        <TimelineIcon icon={item.icon} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Bottom decorative hearts */}
              <div className="mt-10 flex items-center justify-center gap-1 text-[color:var(--accent)]/60">
                <HeartDot />
                <HeartDot />
              </div>
            </div>
          </div>
        </section>

        <section id="details" className="reveal space-y-8" data-reveal>
          <div className="text-center">
            <p className="text-xl uppercase tracking-[0.2em] md:text-2xl">Допълнителни детайли</p>
            <h2 className="mt-3 text-5xl md:text-6xl">За да Ви е удобно</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {detailItems.map((item) => (
              <article key={item.title} className="paper-card rounded-2xl p-6 md:p-8">
                <h3 className="text-4xl">{item.title}</h3>
                <p className="mt-3 text-2xl leading-relaxed">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="qna" className="reveal space-y-8" data-reveal>
          <div className="text-center">
            <p className="text-xl uppercase tracking-[0.2em] md:text-2xl">Q&A</p>
            <h2 className="mt-3 text-5xl md:text-6xl">Въпроси и отговори</h2>
          </div>
          <div className="space-y-4">
            {qnaItems.map((item) => (
              <details key={item.question} className="paper-card rounded-2xl p-6 open:pb-8 md:p-8">
                <summary className="cursor-pointer text-3xl">{item.question}</summary>
                <p className="mt-4 text-2xl leading-relaxed opacity-90">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="rsvp" className="reveal space-y-8 pb-12" data-reveal>
          <div className="text-center">
            <p className="text-xl uppercase tracking-[0.2em] md:text-2xl">RSVP</p>
            <h2 className="mt-3 text-5xl md:text-6xl">Потвърдете присъствие</h2>
            <p className="mx-auto mt-4 max-w-3xl text-2xl md:text-3xl">
              Формата ще отвори вашия имейл клиент с подготвено съобщение.
            </p>
          </div>
          <form onSubmit={onRsvpSubmit} className="paper-card mx-auto grid max-w-4xl gap-5 rounded-3xl p-7 md:grid-cols-2 md:p-10">
            <label className="flex flex-col gap-2 text-2xl">
              Име и фамилия
              <input
                required
                value={rsvpName}
                onChange={(event) => setRsvpName(event.target.value)}
                className="rounded-xl bg-white/85 px-4 py-3 text-2xl outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--accent)_35%,transparent)]"
                placeholder="Вашето име"
              />
            </label>
            <label className="flex flex-col gap-2 text-2xl">
              Брой гости
              <select
                value={rsvpGuests}
                onChange={(event) => setRsvpGuests(event.target.value)}
                className="rounded-xl bg-white/85 px-4 py-3 text-2xl outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--accent)_35%,transparent)]"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4+">4+</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-2xl md:col-span-2">
              Телефон
              <input
                value={rsvpPhone}
                onChange={(event) => setRsvpPhone(event.target.value)}
                className="rounded-xl bg-white/85 px-4 py-3 text-2xl outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--accent)_35%,transparent)]"
                placeholder="08xx xxx xxx"
              />
            </label>
            <label className="flex flex-col gap-2 text-2xl md:col-span-2">
              Съобщение (по желание)
              <textarea
                rows={4}
                value={rsvpMessage}
                onChange={(event) => setRsvpMessage(event.target.value)}
                className="rounded-xl bg-white/85 px-4 py-3 text-2xl outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--accent)_35%,transparent)]"
                placeholder="Алергии, предпочитания, специални нужди..."
              />
            </label>
            <button
              type="submit"
              className="md:col-span-2 mt-2 rounded-xl bg-black px-6 py-4 text-center text-2xl text-white transition hover:bg-black/90"
            >
              Изпрати потвърждение
            </button>
            <p className="md:col-span-2 text-center text-xl opacity-70">
              Ако желаете, може да пишете директно и на {RSVP_EMAIL}.
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}
