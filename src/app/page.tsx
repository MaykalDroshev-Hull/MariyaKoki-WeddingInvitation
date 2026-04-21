"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  FormEvent,
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown, Heart, X } from "lucide-react";
import PolaroidStack from "@/components/PolaroidStack";

const heroPolaroid3Src = "/images/hero-polaroid%203.avif";

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
};

const weddingDate = new Date("2026-06-26T00:00:00+03:00");
/** Bulgarian mobile numbers (national digits, e.g. 0888123456). */
const RSVP_CONTACTS = [
  { name: "Мария", phone: "0885055969" },
  { name: "Калоян", phone: "0887468185" },
] as const;
const RSVP_PHONE = RSVP_CONTACTS[0].phone;

function toTelDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

function rsvpSmsHref(body: string): string {
  const digits = toTelDigits(RSVP_PHONE);
  const smsTarget =
    digits.length === 10 && digits.startsWith("0") ? `+359${digits.slice(1)}` : digits;
  return `sms:${smsTarget}?body=${encodeURIComponent(body)}`;
}

const navItems = [
  { id: "story", label: "Нашата история" },
  { id: "countdown", label: "Отброяване" },
  { id: "schedule", label: "Програма" },
  { id: "details", label: "Детайли" },
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


const TIMELINE_SVG: Record<string, string> = {
  rings: "/icons/rings.svg",
  champagne: "/icons/cheers.svg",
  cake: "/icons/cake.svg",
  hearts: "/icons/hearts.svg",
};

function TimelineIcon({ icon }: { icon: string }) {
  const src = TIMELINE_SVG[icon];
  if (!src) {
    return null;
  }

  return (
    <div
      className="h-10 w-10 shrink-0 bg-[color:color-mix(in_srgb,var(--accent)_80%,transparent)] md:h-12 md:w-12"
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
      aria-hidden
    />
  );
}

function HeartDot() {
  return (
    <Heart
      className="h-3.5 w-3.5 shrink-0 fill-current text-[color:var(--accent)] md:h-4 md:w-4"
      strokeWidth={1.5}
      aria-hidden
    />
  );
}

type DetailItem = {
  title: string;
  text?: string;
  items?: string[];
};

const detailItems: DetailItem[] = [
  {
    title: "Дрескод",
    items: [
      "Елегантен и комфортен",
      "Тържеството ще бъде на открито — препоръчваме връхна дреха",
    ],
  },
  {
    title: "Локация",
    items: [
      "Граждански брак — Младежки дом Ловеч",
      "Ресторант — „Ponte“",
    ],
  },
  {
    title: "Подарък",
    items: [
      "Вашето присъствие е най-ценният подарък",
      "Плик с пожелания е повече от достатъчно",
    ],
  },
];

const polaroids = [
  {
    src: "/images/image%20(8).avif",
    alt: "Любов в кадър",
    caption: "Любов в кадър",
    subtitle: "Истински чувства, уловени във времето.",
  },
  {
    src: "/images/polaroid%202.avif",
    alt: "Нашето приключение",
    caption: "Нашето приключение",
    subtitle: "Смях, музика и спомени по пътя.",
  },
  { 
    src: heroPolaroid3Src,
    alt: "Предложението",
    caption: "Предложението",
    subtitle: "„Да“ преди голямото „ДА“.",
  },
  {
    src: "/images/image%20(14).avif",
    alt: "Днес и завинаги",
    caption: "Днес и завинаги",
    subtitle: "Следващата глава започва на 26.06.2026.",
  },
  {
    src: "/images/Hero%205.avif",
    alt: "До нас в най-важния ден, кумуват сем. Иванови",
    caption: "Очакваме ви с нашите кумове",
    subtitle: "До нас в най-важния ден, кумуват сем. Иванови.",
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
  const headerRef = useRef<HTMLElement>(null);
  const [countdown, setCountdown] = useState<Countdown>(() =>
    getCountdown(weddingDate),
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpGuests, setRsvpGuests] = useState("2");
  const [rsvpPhone, setRsvpPhone] = useState("");
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(getCountdown(weddingDate));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) {
      return;
    }

    const syncHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${el.offsetHeight}px`,
      );
    };

    syncHeaderHeight();
    const ro = new ResizeObserver(syncHeaderHeight);
    ro.observe(el);
    window.addEventListener("resize", syncHeaderHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncHeaderHeight);
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

  const buildRsvpSmsBody = () =>
    [
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

  const onRsvpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (rsvpStatus === "submitting") {
      return;
    }

    setRsvpStatus("submitting");
    setRsvpError(null);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: rsvpName,
          guests: rsvpGuests,
          phone: rsvpPhone,
          message: rsvpMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setRsvpStatus("success");
      setRsvpName("");
      setRsvpGuests("2");
      setRsvpPhone("");
      setRsvpMessage("");
    } catch (error) {
      console.error("RSVP submission failed:", error);
      setRsvpError(
        "Възникна грешка при изпращането. Моля, опитайте отново или ни се обадете директно.",
      );
      setRsvpStatus("error");
    }
  };

  const onRsvpSmsClick = () => {
    window.location.href = rsvpSmsHref(buildRsvpSmsBody());
  };

  const resetRsvp = () => {
    setRsvpStatus("idle");
    setRsvpError(null);
  };

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    window.scrollTo({
      top: 0,
      behavior: reduceMotion.matches ? "auto" : "smooth",
    });
  };

  return (
    <div className="site-shell relative min-h-screen overflow-x-hidden">
      <header
        ref={headerRef}
        className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4"
      >
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-3xl bg-[color:color-mix(in_srgb,var(--paper)_88%,white)]/90 px-4 py-3 shadow-sm backdrop-blur-md md:gap-6 md:px-8">
          <a
            href="#"
            className="min-w-0 shrink-0 text-base leading-snug tracking-[0.06em] sm:text-lg md:text-xl md:tracking-[0.1em]"
            onClick={(event) => {
              event.preventDefault();
              scrollToTop();
            }}
          >
            {"M&K"}
          </a>
          <ul className="hidden min-w-0 flex-1 justify-center gap-6 text-lg md:flex">
            {navItems.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="nav-link">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex shrink-0 items-center gap-3">
            <a
              href="#rsvp"
              className="rounded-full bg-black px-4 py-2 text-center text-sm font-medium tracking-wide text-white transition hover:bg-black/90 md:px-5 md:py-2.5 md:text-base"
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
                  className="rounded-lg p-1.5 text-[color:var(--foreground)] hover:bg-black/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" strokeWidth={1.5} aria-hidden />
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
        <div className="hero-block-height relative isolate w-full overflow-hidden rounded-3xl md:rounded-[1.75rem]">
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#e8e0d8] via-[#f2ede6] to-[#cfc4b8]"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0">
            <Image
              src={heroPolaroid3Src}
              alt="Мария и Калоян"
              fill
              priority
              sizes="100vw"
              className="hero-photo"
            />
          </div>
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,rgba(255,255,255,0.22),transparent_50%)]"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/25"
            aria-hidden
          />

          <div className="hero-block-height relative z-10 flex flex-col justify-end px-6 pb-10 pt-28 md:px-10 md:pb-14">
            <div className="mx-auto w-full max-w-4xl text-center">
              <p className="mb-3 text-3xl font-light tracking-[0.08em] text-white md:text-5xl md:tracking-[0.1em]">
                Мария &amp; Калоян
              </p>
              <a
                href="#intro"
                className="group mt-6 inline-flex flex-col items-center gap-3 text-white/95 outline-none ring-offset-2 ring-offset-transparent focus-visible:ring-2 focus-visible:ring-white/80"
              >
                <span className="hero-scroll-arrow inline-block">
                  <ChevronDown
                    className="h-8 w-8 md:h-9 md:w-9"
                    strokeWidth={1.6}
                    aria-hidden
                  />
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
            <div className="relative mx-auto my-6 aspect-[3/4] w-full max-w-[min(100%,19rem)] overflow-hidden rounded-2xl shadow-md ring-1 ring-black/[0.06] sm:max-w-[min(100%,20rem)]">
              <Image
                src="/images/under%20hero.avif"
                alt="Мария и Калоян"
                fill
                sizes="(max-width: 768px) 78vw, 20rem"
                className="object-cover"
              />
            </div>
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

        <section className="reveal" data-reveal>
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
        </section>

        <section id="story" className="space-y-12">
          <div className="reveal mb-12 text-center md:mb-16" data-reveal>
            <p className="text-xl uppercase tracking-[0.22em] md:text-2xl">
              Нашата любовна история
            </p>
            <h2 className="mt-4 text-4xl md:text-6xl">Малки спомени, голяма любов</h2>
          </div>
          <div className="p-6 md:p-10">
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
            <div className="flex flex-wrap items-end justify-center gap-x-1 md:gap-x-3">
              {countdownItems.map((item, index) => (
                <Fragment key={item.label}>
                  <div className="flex min-w-[3.75rem] flex-col items-center sm:min-w-[4.5rem] md:min-w-[6rem]">
                    <div
                      className="text-4xl font-semibold tabular-nums sm:text-5xl md:text-7xl"
                      suppressHydrationWarning
                    >
                      {formatValue(item.value)}
                    </div>
                    <div className="mt-1 text-sm tracking-[0.08em] uppercase md:mt-2 md:text-3xl md:tracking-[0.12em]">
                      {item.label}
                    </div>
                  </div>
                  {index < countdownItems.length - 1 ? (
                    <span
                      className="mb-7 select-none text-3xl font-extralight leading-none text-[color:color-mix(in_srgb,var(--foreground)_40%,transparent)] md:mb-10 md:text-5xl"
                      aria-hidden
                    >
                      :
                    </span>
                  ) : null}
                </Fragment>
              ))}
            </div>
          )}
        </section>

        <section id="schedule" className="reveal space-y-8" data-reveal>
          <div className="text-center">
            <p className="text-xl uppercase tracking-[0.2em] md:text-2xl">Програма на деня</p>
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
                {item.items ? (
                  <ul className="mt-3 space-y-2 text-2xl leading-relaxed">
                    {item.items.map((entry) => (
                      <li key={entry} className="flex items-start gap-3">
                        <span className="mt-2 flex shrink-0">
                          <HeartDot />
                        </span>
                        <span>{entry}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-2xl leading-relaxed">{item.text}</p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section id="love-quote" className="reveal" data-reveal>
          <div className="relative mx-auto w-full max-w-full overflow-hidden rounded-3xl shadow-lg ring-1 ring-black/[0.08] md:max-w-xl">
            <div className="relative aspect-[4/5] w-full">
              <Image
                src="/images/image%20(6).avif"
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 576px"
                className="object-cover"
              />
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-black/55 via-black/25 to-transparent"
                aria-hidden
              />
              <div className="absolute left-0 top-0 z-10 flex h-[30%] w-full min-w-0 items-start justify-start overflow-x-auto overflow-y-hidden px-4 pt-5 text-left md:px-8 md:pt-7 lg:px-10 lg:pt-9">
                <blockquote className="shrink-0 whitespace-nowrap text-2xl font-normal italic leading-snug text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] sm:text-3xl md:text-2xl md:leading-tight lg:text-3xl">
                  „В теб намерих дома си.“
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        <section id="rsvp" className="reveal space-y-8 pb-12" data-reveal>
          <div className="text-center">
            <p className="text-xl uppercase tracking-[0.2em] md:text-2xl">RSVP</p>
            <h2 className="mt-3 text-5xl md:text-6xl">Потвърдете присъствие</h2>
            <p className="mx-auto mt-4 max-w-3xl text-2xl md:text-3xl">
              Попълнете формата, за да ни изпратите потвърждение. Може и чрез SMS.
            </p>
          </div>
          {rsvpStatus === "success" ? (
            <div className="paper-card mx-auto max-w-4xl rounded-3xl p-8 text-center md:p-12">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--accent)_18%,transparent)] md:size-20">
                <Heart
                  className="size-9 fill-current text-[color:var(--accent)] md:size-11"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </div>
              <h3 className="mt-6 text-5xl md:text-6xl">Благодарим Ви!</h3>
              <p className="mx-auto mt-4 max-w-2xl text-2xl leading-relaxed md:text-3xl">
                Получихме Вашето потвърждение. Ще се видим на 26.06.2026 — с нетърпение очакваме да споделим този ден с Вас.
              </p>
              <button
                type="button"
                onClick={resetRsvp}
                className="mt-8 text-xl underline decoration-[color:color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-4 transition hover:opacity-80 md:text-2xl"
              >
                Изпрати още едно потвърждение
              </button>
            </div>
          ) : (
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
            <div className="md:col-span-2 mt-2 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={rsvpStatus === "submitting"}
                className="flex-1 rounded-xl bg-black px-6 py-4 text-center text-2xl text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rsvpStatus === "submitting"
                  ? "Изпращане..."
                  : "Изпрати потвърждение"}
              </button>
              <button
                type="button"
                onClick={onRsvpSmsClick}
                disabled={rsvpStatus === "submitting"}
                className="flex-1 rounded-xl border border-black/70 px-6 py-4 text-center text-2xl text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Изпрати чрез SMS
              </button>
            </div>
            {rsvpStatus === "error" && rsvpError ? (
              <p className="md:col-span-2 text-center text-xl text-[color:var(--accent)]">
                {rsvpError}
              </p>
            ) : null}
            <div className="md:col-span-2 text-center text-xl opacity-70">
              <p>Ако желаете, може да ни пишете или да се обадите директно:</p>
              <ul className="mt-2 flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-6">
                {RSVP_CONTACTS.map((contact) => (
                  <li key={contact.phone}>
                    <span className="mr-2">{contact.name}</span>
                    <a
                      href={`tel:${toTelDigits(contact.phone)}`}
                      className="underline decoration-[color:color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 transition hover:opacity-90"
                    >
                      {contact.phone}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </form>
          )}
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 pb-10 pt-6 text-center md:px-10 md:pb-12 md:pt-8">
        <p className="text-sm text-[color:color-mix(in_srgb,var(--foreground)_42%,transparent)] md:text-base">
          Изработено от{" "}
          <a
            href="https://www.hmwspro.com/bg"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[color:color-mix(in_srgb,var(--foreground)_62%,transparent)] underline decoration-[color:color-mix(in_srgb,var(--foreground)_28%,transparent)] underline-offset-2 transition hover:text-[color:var(--foreground)] hover:decoration-[color:color-mix(in_srgb,var(--foreground)_55%,transparent)]"
          >
            H&amp;M WS Pro
          </a>
        </p>
      </footer>
    </div>
  );
}
