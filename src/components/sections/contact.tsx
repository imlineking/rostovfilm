"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, MapPin, RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Reveal, SectionHeading } from "@/components/sections/reveal";
import { PROJECT_TYPES, SITE } from "@/lib/site-data";

type FormState = {
  name: string;
  contact: string;
  projectType: string;
  message: string;
};

const INITIAL: FormState = { name: "", contact: "", projectType: "", message: "" };

export function Contact() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [sending, setSending] = useState(false);
  // Капча показывается через <img>: основной источник — data:-URL из base64
  // (обходит санитайзеры/прокси, портящие SVG-разметку в JSON), резерв —
  // прямой эндпоинт /api/captcha/image?t=<token>, если data:-URL не отрисовался.
  const [captchaImg, setCaptchaImg] = useState<string>("");
  const [captchaImgFallback, setCaptchaImgFallback] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [captchaCode, setCaptchaCode] = useState<string>("");
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [honeypot, setHoneypot] = useState("");
  const { toast } = useToast();

  const update = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    // до 3 попыток с паузой: на нагруженном шлюзе первый запрос иногда падает
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch("/api/captcha", { cache: "no-store" });
        if (!res.ok) throw new Error(`captcha ${res.status}`);
        const data: { svgB64?: string; svg?: string; token: string } =
          await res.json();
        if (!data.token) throw new Error("captcha: пустой токен");
        setCaptchaToken(data.token);
        setCaptchaCode("");
        setCaptchaImgFallback(false);
        if (data.svgB64) {
          setCaptchaImg(`data:image/svg+xml;base64,${data.svgB64}`);
        } else if (data.svg) {
          // запасной путь, если base64 не приехал
          setCaptchaImg(
            `data:image/svg+xml;utf8,${encodeURIComponent(data.svg)}`
          );
        } else {
          setCaptchaImg("");
          setCaptchaImgFallback(true);
        }
        setCaptchaLoading(false);
        return;
      } catch (err) {
        console.warn("[captcha] попытка загрузки не удалась:", err);
        setCaptchaToken("");
        setCaptchaImg("");
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 800 * attempt));
        }
      }
    }
    setCaptchaLoading(false);
  }, []);

  useEffect(() => {
    void loadCaptcha();
  }, [loadCaptcha]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending || captchaLoading || !captchaToken) {
      if (!captchaToken && !captchaLoading) {
        void loadCaptcha();
      }
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          captchaToken,
          captchaCode,
          company: honeypot,
        }),
      });
      const data: {
        ok: boolean;
        error?: string;
        captchaInvalid?: boolean;
      } = await res.json();

      if (res.ok && data.ok) {
        toast({
          title: "Заявка отправлена",
          description: "Мы свяжемся с вами в ближайшее время. Света, камеры!",
        });
        setForm(INITIAL);
        setHoneypot("");
        void loadCaptcha();
      } else {
        // при ошибке капчи выдаём новую картинку, при прочих ошибках
        // оставляем токен живым (действует 10 минут), чтобы не перерисовывать
        if (data.captchaInvalid) {
          void loadCaptcha();
        }
        toast({
          title: "Не удалось отправить",
          description:
            data.error ?? "Проверьте заполнение полей и попробуйте снова.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Ошибка сети",
        description: "Проверьте соединение и попробуйте ещё раз.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <section
      id="contacts"
      className="scroll-mt-20 border-y border-border/60 bg-card/40 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              overline="Контакты"
              title={<>Расскажите о <span className="text-red-gradient">проекте</span></>}
            />
            <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                Обсудим идею, составим смету и календарный план съёмок. Работаем
                с бизнесом, артистами, телеканалами и командами проектов — в
                Ростове-на-Дону и по всей России.
              </p>
              <p>
                Обычно отвечаем в течение одного рабочего дня. Самый быстрый
                способ — написать в сообщество студии ВКонтакте.
              </p>
            </div>

            <ul className="mt-9 space-y-4">
              <li className="flex items-start gap-3.5">
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-sm border border-primary/40 bg-primary/10 text-primary">
                  <MapPin className="size-4.5" aria-hidden />
                </span>
                <div>
                  <p className="font-medium text-foreground">{SITE.city}</p>
                  <p className="text-sm text-muted-foreground">
                    Работаем на натуре и в павильоне по всей стране
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-sm border border-primary/40 bg-primary/10 text-primary">
                  <Send className="size-4.5" aria-hidden />
                </span>
                <div>
                  <a
                    href={SITE.vk}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                  >
                    vk.ru/rostovfilm
                  </a>
                  <p className="text-sm text-muted-foreground">
                    Сообщество киностудии — портфолио, новости, кастинги
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <Reveal delay={0.1}>
            <form
              onSubmit={handleSubmit}
              className="rounded-md border border-border bg-card p-6 sm:p-8"
              aria-label="Форма заявки на съёмку"
            >
              <h3 className="font-display text-xl font-semibold uppercase tracking-wider text-foreground">
                Заявка на съёмку
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Заполните форму — и мы вернёмся с предложением.
              </p>

              <div className="mt-6 grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="contact-name">Ваше имя *</Label>
                  <Input
                    id="contact-name"
                    required
                    minLength={2}
                    maxLength={80}
                    placeholder="Как к вам обращаться"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    autoComplete="name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contact-value">Телефон, e-mail или мессенджер *</Label>
                  <Input
                    id="contact-value"
                    required
                    minLength={5}
                    maxLength={120}
                    placeholder="+7 900 000-00-00 / you@mail.ru"
                    value={form.contact}
                    onChange={(e) => update("contact", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contact-type">Тип проекта</Label>
                  <Select
                    value={form.projectType}
                    onValueChange={(v) => update("projectType", v)}
                  >
                    <SelectTrigger id="contact-type" className="w-full">
                      <SelectValue placeholder="Выберите направление" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contact-message">О проекте</Label>
                  <Textarea
                    id="contact-message"
                    rows={4}
                    maxLength={2000}
                    placeholder="Коротко: что снять, когда и где"
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                  />
                </div>

                {/* Honeypot: невидимое поле — люди его не видят и не заполняют */}
                <div className="hidden" aria-hidden="true">
                  <Label htmlFor="contact-company">Компания</Label>
                  <Input
                    id="contact-company"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contact-captcha">Цифры с картинки *</Label>
                  <div className="flex items-center gap-2.5">
                    <div
                      role="img"
                      aria-label="Проверочный код из пяти цифр"
                      className="flex h-13 w-[170px] shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-[#201a18]"
                    >
                      {captchaLoading ? (
                        <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
                      ) : captchaImg ? (
                        /* <img> вместо dangerouslySetInnerHTML: санитайзеры и CSP
                           не могут «вычистить» картинку; при ошибке data:-URL
                           переключаемся на прямой эндпоинт */
                        <img
                          src={
                            captchaImgFallback && captchaToken
                              ? `/api/captcha/image?t=${encodeURIComponent(captchaToken)}`
                              : captchaImg
                          }
                          onError={() => {
                            if (!captchaImgFallback && captchaToken) {
                              setCaptchaImgFallback(true);
                            } else {
                              setCaptchaImg("");
                            }
                          }}
                          width={170}
                          height={54}
                          alt=""
                          className="block"
                          decoding="async"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => void loadCaptcha()}
                          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                        >
                          Загрузить код
                        </button>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => void loadCaptcha()}
                      disabled={captchaLoading}
                      aria-label="Обновить картинку с кодом"
                      title="Другая картинка"
                      className="size-13"
                    >
                      {captchaLoading ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : (
                        <RefreshCw className="size-4" aria-hidden />
                      )}
                    </Button>
                  </div>
                  <Input
                    id="contact-captcha"
                    required
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={10}
                    placeholder="5 цифр"
                    value={captchaCode}
                    onChange={(e) => setCaptchaCode(e.target.value)}
                    className="tracking-[0.35em]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={sending || captchaLoading || !captchaToken}
                  className="glow-red btn-sheen mt-1 h-12 bg-primary font-display text-base uppercase tracking-widest text-primary-foreground hover:bg-primary/85"
                >
                  {sending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Отправляем…
                    </>
                  ) : (
                    <>
                      <Send className="size-4" aria-hidden />
                      Отправить заявку
                    </>
                  )}
                </Button>

                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-3.5 text-primary" aria-hidden />
                  Заявка попадёт напрямую продюсеру студии
                </p>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
