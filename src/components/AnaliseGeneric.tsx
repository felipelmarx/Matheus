import { useState } from 'react';
import {
  ChevronDown,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Target,
  Zap,
  Layers,
  ArrowUpRight,
  Lightbulb,
  Shuffle,
  GitCompare,
  PieChart,
  Activity,
  CheckCircle,
  ShoppingCart,
  Radio,
  Compass,
  Brain,
  ListChecks,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AnaliseCompradorSection } from '@/types/metrics';

interface AnaliseGenericProps {
  sections: AnaliseCompradorSection[];
  title: string;
  headerIcon: LucideIcon;
  headerGradient?: string;
  sectionIcons?: LucideIcon[];
}

/* --- Section Icon + Color Mapping --- */

interface SectionStyle {
  icon: LucideIcon;
  iconColor: string;
  gradientFrom: string;
  borderColor: string;
}

const APLICACOES_STYLES: SectionStyle[] = [
  { icon: BarChart3, iconColor: 'text-sky-400', gradientFrom: 'from-sky-500/10', borderColor: 'border-sky-500/20' },
  { icon: CheckCircle, iconColor: 'text-emerald-400', gradientFrom: 'from-emerald-500/10', borderColor: 'border-emerald-500/20' },
  { icon: Users, iconColor: 'text-violet-400', gradientFrom: 'from-violet-500/10', borderColor: 'border-violet-500/20' },
  { icon: DollarSign, iconColor: 'text-green-400', gradientFrom: 'from-green-500/10', borderColor: 'border-green-500/20' },
  { icon: Eye, iconColor: 'text-blue-400', gradientFrom: 'from-blue-500/10', borderColor: 'border-blue-500/20' },
  { icon: ShoppingCart, iconColor: 'text-amber-400', gradientFrom: 'from-amber-500/10', borderColor: 'border-amber-500/20' },
  { icon: Target, iconColor: 'text-red-400', gradientFrom: 'from-red-500/10', borderColor: 'border-red-500/20' },
  { icon: Radio, iconColor: 'text-orange-400', gradientFrom: 'from-orange-500/10', borderColor: 'border-orange-500/20' },
  { icon: TrendingUp, iconColor: 'text-teal-400', gradientFrom: 'from-teal-500/10', borderColor: 'border-teal-500/20' },
  { icon: Lightbulb, iconColor: 'text-yellow-400', gradientFrom: 'from-yellow-500/10', borderColor: 'border-yellow-500/20' },
];

const CRUZADA_STYLES: SectionStyle[] = [
  { icon: GitCompare, iconColor: 'text-fuchsia-400', gradientFrom: 'from-fuchsia-500/10', borderColor: 'border-fuchsia-500/20' },
  { icon: Users, iconColor: 'text-indigo-400', gradientFrom: 'from-indigo-500/10', borderColor: 'border-indigo-500/20' },
  { icon: PieChart, iconColor: 'text-cyan-400', gradientFrom: 'from-cyan-500/10', borderColor: 'border-cyan-500/20' },
  { icon: Eye, iconColor: 'text-blue-400', gradientFrom: 'from-blue-500/10', borderColor: 'border-blue-500/20' },
  { icon: Zap, iconColor: 'text-amber-400', gradientFrom: 'from-amber-500/10', borderColor: 'border-amber-500/20' },
  { icon: ArrowUpRight, iconColor: 'text-emerald-400', gradientFrom: 'from-emerald-500/10', borderColor: 'border-emerald-500/20' },
  { icon: Compass, iconColor: 'text-orange-400', gradientFrom: 'from-orange-500/10', borderColor: 'border-orange-500/20' },
  { icon: ShoppingCart, iconColor: 'text-rose-400', gradientFrom: 'from-rose-500/10', borderColor: 'border-rose-500/20' },
  { icon: Activity, iconColor: 'text-teal-400', gradientFrom: 'from-teal-500/10', borderColor: 'border-teal-500/20' },
  { icon: Brain, iconColor: 'text-violet-400', gradientFrom: 'from-violet-500/10', borderColor: 'border-violet-500/20' },
];

const DEFAULT_STYLES: SectionStyle[] = [
  { icon: Layers, iconColor: 'text-blue-400', gradientFrom: 'from-blue-500/10', borderColor: 'border-blue-500/20' },
  { icon: TrendingUp, iconColor: 'text-emerald-400', gradientFrom: 'from-emerald-500/10', borderColor: 'border-emerald-500/20' },
  { icon: Target, iconColor: 'text-violet-400', gradientFrom: 'from-violet-500/10', borderColor: 'border-violet-500/20' },
  { icon: Zap, iconColor: 'text-amber-400', gradientFrom: 'from-amber-500/10', borderColor: 'border-amber-500/20' },
  { icon: Eye, iconColor: 'text-red-400', gradientFrom: 'from-red-500/10', borderColor: 'border-red-500/20' },
  { icon: Users, iconColor: 'text-orange-400', gradientFrom: 'from-orange-500/10', borderColor: 'border-orange-500/20' },
  { icon: DollarSign, iconColor: 'text-teal-400', gradientFrom: 'from-teal-500/10', borderColor: 'border-teal-500/20' },
  { icon: Lightbulb, iconColor: 'text-indigo-400', gradientFrom: 'from-indigo-500/10', borderColor: 'border-indigo-500/20' },
  { icon: BarChart3, iconColor: 'text-cyan-400', gradientFrom: 'from-cyan-500/10', borderColor: 'border-cyan-500/20' },
  { icon: ListChecks, iconColor: 'text-pink-400', gradientFrom: 'from-pink-500/10', borderColor: 'border-pink-500/20' },
];

export const STYLE_PRESETS = {
  aplicacoes: APLICACOES_STYLES,
  cruzada: CRUZADA_STYLES,
  default: DEFAULT_STYLES,
} as const;

export type StylePreset = keyof typeof STYLE_PRESETS;

/* --- Section Content Renderer --- */

function renderContent(content: string) {
  const paragraphs = content.split(/\\n|\n/).filter((p) => p.trim().length > 0);

  return (
    <div className="space-y-3">
      {paragraphs.map((para, i) => {
        const trimmed = para.trim();

        if (/^[-*]\s+/.test(trimmed)) {
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className="text-primary mt-0.5 shrink-0">-</span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {trimmed.replace(/^[-*]\s+/, '')}
              </p>
            </div>
          );
        }

        return (
          <p key={i} className="text-sm text-muted-foreground leading-relaxed">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

/* --- Collapsible Section --- */

function CollapsibleSection({
  section,
  index,
  isOpen,
  onToggle,
  styles,
}: {
  section: AnaliseCompradorSection;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  styles: SectionStyle[];
}) {
  const style = styles[index % styles.length];
  const Icon = style.icon;

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
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="px-5 py-4 border-t border-border/30">
          {section.content ? (
            renderContent(section.content)
          ) : (
            <p className="text-sm text-muted-foreground italic">Conteudo nao disponivel</p>
          )}
        </div>
      )}
    </div>
  );
}

/* --- Main Component --- */

export default function AnaliseGeneric({
  sections,
  title,
  headerIcon: HeaderIcon,
  headerGradient = 'from-blue-500/10 to-purple-500/10',
  sectionIcons,
}: AnaliseGenericProps & { stylePreset?: StylePreset }) {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));

  if (sections.length === 0) return null;

  // Determine which style set to use based on title heuristic or explicit preset
  let styles = DEFAULT_STYLES;
  if (title.toLowerCase().includes('aplicac')) {
    styles = APLICACOES_STYLES;
  } else if (title.toLowerCase().includes('cruzada')) {
    styles = CRUZADA_STYLES;
  }

  // If custom sectionIcons are provided, override the icons in styles
  if (sectionIcons && sectionIcons.length > 0) {
    styles = styles.map((s, i) => ({
      ...s,
      icon: sectionIcons[i % sectionIcons.length],
    }));
  }

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
      <div className={`px-5 py-3 border-b border-border bg-gradient-to-r ${headerGradient}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeaderIcon className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
              {title}
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
            styles={styles}
          />
        ))}
      </div>
    </div>
  );
}
