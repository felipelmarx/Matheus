import { useState } from 'react';
import {
  ChevronDown,
  UserCheck,
  CreditCard,
  ShoppingCart,
  CalendarCheck,
  Megaphone,
  Target,
  MapPin,
  Users,
  Shield,
  Eye,
  Award,
  Lightbulb,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AnaliseCompradorSection, AdMetric } from '@/types/metrics';

interface AnaliseCompradoresProps {
  sections: AnaliseCompradorSection[];
  topAds?: AdMetric[];
  topAdsDesafio4?: AdMetric[];
}

/* ─── Section Icon + Color Mapping ─── */

interface SectionStyle {
  icon: LucideIcon;
  iconColor: string;
  gradientFrom: string;
  borderColor: string;
}

const SECTION_STYLES: SectionStyle[] = [
  { icon: UserCheck, iconColor: 'text-blue-400', gradientFrom: 'from-blue-500/10', borderColor: 'border-blue-500/20' },
  { icon: CreditCard, iconColor: 'text-violet-400', gradientFrom: 'from-violet-500/10', borderColor: 'border-violet-500/20' },
  { icon: ShoppingCart, iconColor: 'text-emerald-400', gradientFrom: 'from-emerald-500/10', borderColor: 'border-emerald-500/20' },
  { icon: CalendarCheck, iconColor: 'text-amber-400', gradientFrom: 'from-amber-500/10', borderColor: 'border-amber-500/20' },
  { icon: Target, iconColor: 'text-red-400', gradientFrom: 'from-red-500/10', borderColor: 'border-red-500/20' },
  { icon: Megaphone, iconColor: 'text-orange-400', gradientFrom: 'from-orange-500/10', borderColor: 'border-orange-500/20' },
  { icon: MapPin, iconColor: 'text-teal-400', gradientFrom: 'from-teal-500/10', borderColor: 'border-teal-500/20' },
  { icon: Users, iconColor: 'text-indigo-400', gradientFrom: 'from-indigo-500/10', borderColor: 'border-indigo-500/20' },
  { icon: Shield, iconColor: 'text-cyan-400', gradientFrom: 'from-cyan-500/10', borderColor: 'border-cyan-500/20' },
  { icon: Eye, iconColor: 'text-purple-400', gradientFrom: 'from-purple-500/10', borderColor: 'border-purple-500/20' },
  { icon: Award, iconColor: 'text-yellow-400', gradientFrom: 'from-yellow-500/10', borderColor: 'border-yellow-500/20' },
  { icon: Lightbulb, iconColor: 'text-pink-400', gradientFrom: 'from-pink-500/10', borderColor: 'border-pink-500/20' },
];

function getStyle(index: number): SectionStyle {
  return SECTION_STYLES[index % SECTION_STYLES.length];
}

/* ─── Cross-reference: extract buyer counts from section 6 content ─── */

interface BuyerAdMatch {
  adNameFragment: string;
  buyerCount: number;
}

function extractBuyerCounts(sections: AnaliseCompradorSection[]): BuyerAdMatch[] {
  // Section 6 is "Anuncios e Posicionamento"
  const section6 = sections.find((s) => /an[uú]ncios/i.test(s.title));
  if (!section6) return [];

  const matches: BuyerAdMatch[] = [];
  // Pattern: "ad name" = N compradores  OR  ad name (N compradores)
  // Also match patterns like: N compradores from "ad name"
  const patterns = [
    /[""]([^""]+)[""]\s*=?\s*(\d+)\s*comprador/gi,
    /(\d+)\s*comprador\w*\s*(?:de|from|via)\s*[""]([^""]+)[""]/gi,
  ];

  for (const pattern of patterns) {
    let m;
    while ((m = pattern.exec(section6.content)) !== null) {
      if (m[1] && m[2]) {
        // Check which group is the number
        const num = parseInt(m[1]);
        if (!isNaN(num)) {
          matches.push({ adNameFragment: m[2].toLowerCase().trim(), buyerCount: num });
        } else {
          matches.push({ adNameFragment: m[1].toLowerCase().trim(), buyerCount: parseInt(m[2]) });
        }
      }
    }
  }

  // Also try simpler inline patterns: "ad-name" followed by number + "compradores"
  const simplePattern = /([a-z][a-z0-9\s\-_]+)\s*(?:=|:|\()\s*(\d+)\s*comprador/gi;
  let sm;
  while ((sm = simplePattern.exec(section6.content)) !== null) {
    const name = (sm[1] ?? '').trim().toLowerCase();
    const count = parseInt(sm[2]);
    if (name && !isNaN(count) && !matches.some((e) => e.adNameFragment === name)) {
      matches.push({ adNameFragment: name, buyerCount: count });
    }
  }

  return matches;
}

function findBuyerCount(adName: string, buyerMatches: BuyerAdMatch[]): number {
  if (buyerMatches.length === 0) return 0;
  const lower = adName.toLowerCase().trim();

  for (const match of buyerMatches) {
    if (lower.includes(match.adNameFragment) || match.adNameFragment.includes(lower)) {
      return match.buyerCount;
    }
  }
  return 0;
}

/* ─── Highlight ad names in text ─── */

function highlightAdsInText(text: string, allAds: AdMetric[]): React.ReactNode {
  if (allAds.length === 0) return text;

  // Build list of ad name fragments to highlight
  const adNames = allAds.map((a) => a.name.toLowerCase());
  const parts: { text: string; isAd: boolean }[] = [];
  let remaining = text;

  // Simple approach: scan for known ad names (case-insensitive)
  const lowerText = text.toLowerCase();
  const highlights: { start: number; end: number; name: string }[] = [];

  for (const adName of adNames) {
    let searchFrom = 0;
    while (true) {
      const idx = lowerText.indexOf(adName, searchFrom);
      if (idx === -1) break;
      highlights.push({ start: idx, end: idx + adName.length, name: adName });
      searchFrom = idx + adName.length;
    }
  }

  if (highlights.length === 0) return text;

  // Sort by start position and remove overlaps
  highlights.sort((a, b) => a.start - b.start);
  const merged: typeof highlights = [];
  for (const h of highlights) {
    if (merged.length === 0 || h.start >= merged[merged.length - 1].end) {
      merged.push(h);
    }
  }

  let lastEnd = 0;
  for (const h of merged) {
    if (h.start > lastEnd) {
      parts.push({ text: remaining.slice(lastEnd, h.start), isAd: false });
    }
    parts.push({ text: remaining.slice(h.start, h.end), isAd: true });
    lastEnd = h.end;
  }
  if (lastEnd < remaining.length) {
    parts.push({ text: remaining.slice(lastEnd), isAd: false });
  }

  return (
    <>
      {parts.map((part, i) =>
        part.isAd ? (
          <span key={i} className="text-primary font-semibold bg-primary/10 px-1 rounded">
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}

/* ─── Section Content Renderer ─── */

function renderContent(content: string, allAds: AdMetric[], sectionIndex: number) {
  // Split by \n or actual newlines
  const paragraphs = content.split(/\\n|\n/).filter((p) => p.trim().length > 0);

  // Section 6 (index 5) gets ad highlighting
  const isAdSection = sectionIndex === 5;

  return (
    <div className="space-y-3">
      {paragraphs.map((para, i) => {
        const trimmed = para.trim();

        // Sub-bullets or numbered items
        if (/^[-*]\s+/.test(trimmed)) {
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className="text-primary mt-0.5 shrink-0">-</span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isAdSection ? highlightAdsInText(trimmed.replace(/^[-*]\s+/, ''), allAds) : trimmed.replace(/^[-*]\s+/, '')}
              </p>
            </div>
          );
        }

        return (
          <p key={i} className="text-sm text-muted-foreground leading-relaxed">
            {isAdSection ? highlightAdsInText(trimmed, allAds) : trimmed}
          </p>
        );
      })}
    </div>
  );
}

/* ─── Collapsible Section ─── */

function CollapsibleSection({
  section,
  index,
  isOpen,
  onToggle,
  allAds,
  buyerMatches,
}: {
  section: AnaliseCompradorSection;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  allAds: AdMetric[];
  buyerMatches: BuyerAdMatch[];
}) {
  const style = getStyle(index);
  const Icon = style.icon;

  // For section 6 (ads), show a badge with total buyer count
  const isAdSection = index === 5;
  const adBuyerTotal = isAdSection
    ? buyerMatches.reduce((sum, m) => sum + m.buyerCount, 0)
    : 0;

  return (
    <div className={`border ${style.borderColor} rounded-xl overflow-hidden transition-all`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r ${style.gradientFrom} to-transparent hover:brightness-110 transition-all cursor-pointer`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-1.5 rounded-lg bg-card/50 ${style.iconColor} shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-heading font-semibold text-foreground truncate">
            {section.title}
          </span>
          {isAdSection && adBuyerTotal > 0 && (
            <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 rounded-md px-2 py-0.5 shrink-0">
              {adBuyerTotal} compradores mapeados
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="px-5 py-4 border-t border-border/30">
          {section.content ? (
            renderContent(section.content, allAds, index)
          ) : (
            <p className="text-sm text-muted-foreground italic">Conteudo nao disponivel</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */

export default function AnaliseCompradores({ sections, topAds = [], topAdsDesafio4 = [] }: AnaliseCompradoresProps) {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));

  if (sections.length === 0) return null;

  const allAds = [...topAds, ...topAdsDesafio4];
  const buyerMatches = extractBuyerCounts(sections);

  const toggleSection = (index: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const expandAll = () => {
    setOpenSections(new Set(sections.map((_, i) => i)));
  };

  const collapseAll = () => {
    setOpenSections(new Set());
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-border/80">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
              Analise Profunda de Compradores
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 rounded-md px-2 py-0.5">
              {sections.length} secoes
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={expandAll}
              className="text-[10px] font-heading text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted/50 transition-colors"
            >
              Expandir tudo
            </button>
            <span className="text-muted-foreground/30">|</span>
            <button
              onClick={collapseAll}
              className="text-[10px] font-heading text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted/50 transition-colors"
            >
              Recolher tudo
            </button>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="p-4 space-y-2">
        {sections.map((section, i) => (
          <CollapsibleSection
            key={i}
            section={section}
            index={i}
            isOpen={openSections.has(i)}
            onToggle={() => toggleSection(i)}
            allAds={allAds}
            buyerMatches={buyerMatches}
          />
        ))}
      </div>

      {/* Cross-reference summary */}
      {buyerMatches.length > 0 && (
        <div className="px-5 py-3 border-t border-border bg-muted/20">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-heading mb-2">
            Cruzamento com anuncios ativos
          </p>
          <div className="flex flex-wrap gap-2">
            {buyerMatches.slice(0, 8).map((match, i) => (
              <span
                key={i}
                className="text-xs font-heading text-foreground bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-1"
              >
                <span className="font-mono font-bold text-primary">{match.buyerCount}</span>
                <span className="text-muted-foreground ml-1">{match.adNameFragment}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
