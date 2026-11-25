"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, Mail, MapPin } from "lucide-react";
import { FaGithub, FaInstagram, FaLinkedinIn } from "react-icons/fa6";
import { usePortfolio } from "@/components/PortfolioProvider";

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/chrisyanboy/", Icon: FaInstagram },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/chris-cx-yan/", Icon: FaLinkedinIn },
  { label: "GitHub", href: "https://github.com/chrisyan04", Icon: FaGithub },
];

export default function ContactPage() {
  const { localizedData: data, t } = usePortfolio();
  const [lines, setLines] = useState<string[]>([]);
  const [input, setInput] = useState("");

  function run(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const command = input.trim().toLowerCase();
    if (!command) return;
    if (command === "clear") { setLines([]); setInput(""); return; }
    const target = socialLinks.find((social) => social.label.toLowerCase() === command);
    if (target) window.open(target.href, "_blank", "noopener,noreferrer");
    const output = command === "help" ? t.terminalHelp : command === "email" ? data.email : target ? `${t.opening} ${target.label}…` : `${t.commandNotFound}: ${command}`;
    setLines((previous) => [...previous, `guest@chris:~$ ${input}`, output]);
    setInput("");
  }

  return <section className="contact-grid contact-layout">
    <div className="contact-copy">
      <div className="page-top contact-heading"><div className="eyebrow">06 / {t.contactLabel}</div><h1>{t.connect}<br /><span className="gradient-text">{t.noForms}</span></h1></div>
      <p>{t.contactDescription}</p>
      <Link className="contact-email-cta" href={`mailto:${data.email}`} aria-label={`${t.emailMe}: ${data.email}`}><span className="contact-email-icon"><Mail size={22} strokeWidth={1.8} aria-hidden="true" /></span><span className="contact-email-copy"><strong>{t.emailMe}</strong><span>{data.email}</span></span><ArrowUpRight className="contact-email-arrow" size={21} strokeWidth={1.8} aria-hidden="true" /></Link>
      <p className="contact-location"><MapPin size={15} strokeWidth={1.8} aria-hidden="true" />{data.location}</p>
      <div className="social-section"><div className="social-bubbles">{socialLinks.map(({ label, href, Icon }) => <a className="social-bubble" href={href} key={label} target="_blank" rel="noopener noreferrer" aria-label={label}><span className="social-bubble-icon"><Icon size={19} aria-hidden="true" /></span><span>{label}</span><ArrowUpRight size={14} aria-hidden="true" /></a>)}</div></div>
    </div>
    <div className="terminal glass-card"><div className="terminal-bar"><i /><i /><i /></div><div className="terminal-body"><div className="muted">{t.terminalTitle}</div><div>{t.terminalWelcome}</div><div>{t.command}</div><div aria-live="polite">{lines.map((line, index) => <div key={index}>{line}</div>)}</div><form className="terminal-form" onSubmit={run}><ChevronRight size={17} aria-hidden="true" /><input value={input} onChange={(event) => setInput(event.target.value)} aria-label={t.terminalPlaceholder} placeholder={t.terminalPlaceholder} autoComplete="off" /><button type="submit">{t.run}</button></form></div></div>
  </section>;
}
