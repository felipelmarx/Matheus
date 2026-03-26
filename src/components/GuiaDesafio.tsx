import { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  ArrowRight,
  Calendar,
  Link2,
  Map,
  AlertTriangle,
  Gift,
  Ticket,
  Crown,
  Zap,
  Mail,
  MessageCircle,
  Video,
  Headphones,
  ExternalLink,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Collapsible Section                                                */
/* ------------------------------------------------------------------ */
function Section({
  icon: Icon,
  title,
  iconColor,
  children,
  defaultOpen = false,
}: {
  icon: typeof BookOpen;
  title: string;
  iconColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <span className="text-sm font-heading font-semibold text-foreground">
            {title}
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-border pt-4">{children}</div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Flow Step                                                          */
/* ------------------------------------------------------------------ */
function FlowStep({
  num,
  label,
  sublabel,
  color,
  isLast = false,
}: {
  num: string;
  label: string;
  sublabel?: string;
  color: string;
  isLast?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono ${color}`}
        >
          {num}
        </div>
        {!isLast && (
          <div className="w-px h-8 bg-border" />
        )}
      </div>
      <div className="pt-1">
        <span className="text-sm font-heading font-medium text-foreground">
          {label}
        </span>
        {sublabel && (
          <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Glossary Card                                                      */
/* ------------------------------------------------------------------ */
function GlossaryCard({
  icon: Icon,
  term,
  price,
  description,
  delivery,
  iconColor,
  borderColor,
}: {
  icon: typeof Gift;
  term: string;
  price?: string;
  description: string;
  delivery?: string;
  iconColor: string;
  borderColor: string;
}) {
  return (
    <div className={`bg-muted/30 border ${borderColor} rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="text-sm font-heading font-semibold text-foreground">
          {term}
        </span>
        {price && (
          <span className="ml-auto text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
            {price}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>
      {delivery && (
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground/70">
          <Mail className="w-3 h-3" />
          <span>{delivery}</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function GuiaDesafio() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-heading font-bold text-foreground">
            Guia do Desafio
          </h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Tudo que voce precisa saber sobre como o Desafio de 5 Dias funciona.
          Feito para qualquer pessoa da equipe entender a operacao, os produtos e onde encontrar cada informacao.
        </p>
      </div>

      {/* INTERNAL ALERT */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-heading font-bold text-amber-400 uppercase tracking-wider">
            Uso Interno — Confidencial
          </span>
          <p className="text-sm text-amber-200/80 mt-1 leading-relaxed">
            No sabado, liberamos o acesso as gravacoes para <strong>todos os participantes</strong>, inclusive quem nao comprou o Passaporte VIP.
            Esta informacao <strong>nao pode ser divulgada ao publico</strong>. Externamente, gravacoes = Passaporte VIP (R$ 57).
          </p>
        </div>
      </div>

      {/* 1. O QUE É O DESAFIO */}
      <Section
        icon={Zap}
        title="O que e o Desafio"
        iconColor="text-violet-400"
        defaultOpen={true}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          O <strong className="text-foreground">Desafio de 5 Dias de Neurociencia da Respiracao</strong> e um evento online pago onde os participantes assistem a 5 sessoes ao vivo (segunda a sexta), uma por dia.
          O ingresso da acesso ao evento + um link para 7 dias gratis dos Protocolos Respiratorios (audios de nivel 1).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <span className="text-2xl font-mono font-bold text-primary">5</span>
            <p className="text-[10px] text-muted-foreground mt-1 font-heading">Sessoes ao vivo</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <span className="text-2xl font-mono font-bold text-emerald-400">24h</span>
            <p className="text-[10px] text-muted-foreground mt-1 font-heading">Gravacao disponivel por dia</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <span className="text-2xl font-mono font-bold text-amber-400">7d</span>
            <p className="text-[10px] text-muted-foreground mt-1 font-heading">Gratis Protocolos (nivel 1)</p>
          </div>
        </div>
      </Section>

      {/* 2. FLUXO DO PARTICIPANTE */}
      <Section
        icon={ArrowRight}
        title="Fluxo do Participante"
        iconColor="text-cyan-400"
        defaultOpen={true}
      >
        <FlowStep
          num="1"
          label="Ve o anuncio (Meta Ads)"
          sublabel="Anuncios de video e imagem segmentados por publico"
          color="bg-blue-500/20 text-blue-400"
        />
        <FlowStep
          num="2"
          label="Acessa a Landing Page"
          sublabel="Pagina de vendas com VSL e CTA para compra"
          color="bg-blue-500/20 text-blue-400"
        />
        <FlowStep
          num="3"
          label="Compra o Ingresso"
          sublabel="Checkout com opcao de Order Bumps"
          color="bg-emerald-500/20 text-emerald-400"
        />
        <div className="ml-11 mb-3 space-y-2">
          <div className="bg-muted/40 border border-border/50 rounded-lg p-3 flex items-center gap-2">
            <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
            <div>
              <span className="text-xs font-heading font-medium text-foreground">Order Bump 1: Kit de Estudos</span>
              <span className="text-[10px] text-emerald-400 font-mono ml-2">R$ 37</span>
              <p className="text-[10px] text-muted-foreground">Conteudo introdutorio + mini aulas sobre o desafio</p>
            </div>
          </div>
          <div className="bg-muted/40 border border-border/50 rounded-lg p-3 flex items-center gap-2">
            <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
            <div>
              <span className="text-xs font-heading font-medium text-foreground">Order Bump 2: Passaporte VIP</span>
              <span className="text-[10px] text-emerald-400 font-mono ml-2">R$ 57</span>
              <p className="text-[10px] text-muted-foreground">Acesso as gravacoes (liberadas no sabado apos os 5 dias)</p>
            </div>
          </div>
        </div>
        <FlowStep
          num="4"
          label="Entra no Grupo de WhatsApp"
          sublabel="Recebe link do grupo apos a compra"
          color="bg-emerald-500/20 text-emerald-400"
        />
        <FlowStep
          num="5"
          label="Participa das 5 Sessoes (seg-sex)"
          sublabel="Cada gravacao fica disponivel por 24h. Link enviado no grupo"
          color="bg-violet-500/20 text-violet-400"
        />
        <FlowStep
          num="6"
          label="Recebe oferta de Upsell"
          sublabel="Desafio de 21 Dias (R$ 97) + Protocolos Respiratorios nivel 1"
          color="bg-amber-500/20 text-amber-400"
        />
        <FlowStep
          num="7"
          label="Sabado: gravacoes liberadas"
          sublabel="Todas as 5 gravacoes ficam disponiveis ao mesmo tempo"
          color="bg-violet-500/20 text-violet-400"
        />
        <FlowStep
          num="8"
          label="7 dias gratis dos Protocolos Respiratorios"
          sublabel="Audios de nivel 1 — acesso entregue junto com o ingresso"
          color="bg-primary/20 text-primary"
          isLast
        />
        <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground/70">
          <Mail className="w-3 h-3" />
          <span>Ao comprar qualquer produto (bump ou upsell), a pessoa recebe email + WhatsApp com acesso.</span>
        </div>
      </Section>

      {/* 3. GLOSSÁRIO */}
      <Section
        icon={BookOpen}
        title="Glossario — Termos Importantes"
        iconColor="text-emerald-400"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <GlossaryCard
            icon={Ticket}
            term="Ingresso"
            description="O produto principal. Da acesso as 5 sessoes ao vivo + link dos 7 dias gratis de Protocolos Respiratorios (audios nivel 1)."
            iconColor="text-primary"
            borderColor="border-primary/20"
          />
          <GlossaryCard
            icon={Gift}
            term="Ingresso Cortesia"
            description="Ingresso gratuito dado a convidados especiais, parceiros ou indicacoes. Tem o mesmo acesso do ingresso pago, sem custo. Os links de cortesia ficam na Planilha de Links."
            iconColor="text-violet-400"
            borderColor="border-violet-500/20"
          />
          <GlossaryCard
            icon={ShoppingCart}
            term="Order Bump"
            price="R$ 37 / R$ 57"
            description="Oferta adicional que aparece na pagina de checkout, antes de finalizar a compra. O cliente pode adicionar ao pedido com um clique. Temos dois: Kit de Estudos (R$ 37) e Passaporte VIP (R$ 57)."
            delivery="Ao comprar, recebe email + WhatsApp com acesso"
            iconColor="text-amber-400"
            borderColor="border-amber-500/20"
          />
          <GlossaryCard
            icon={Crown}
            term="Upsell"
            price="R$ 97"
            description="Oferta apresentada apos a compra do ingresso. E o Desafio de 21 Dias + acesso aos audios de Protocolos Respiratorios de nivel 1. Aumenta o ticket medio."
            delivery="Ao comprar, recebe email + WhatsApp com acesso"
            iconColor="text-emerald-400"
            borderColor="border-emerald-500/20"
          />
          <GlossaryCard
            icon={Video}
            term="Passaporte VIP"
            price="R$ 57"
            description="Order Bump que da acesso as gravacoes das sessoes. As gravacoes sao liberadas no sabado, todas as 5 ao mesmo tempo, apos o encerramento do desafio."
            iconColor="text-cyan-400"
            borderColor="border-cyan-500/20"
          />
          <GlossaryCard
            icon={Headphones}
            term="Protocolos Respiratorios"
            description="Audios guiados de respiracao (nivel 1). O participante recebe 7 dias gratis junto com o ingresso. Quem compra o Upsell (R$ 97) recebe acesso completo."
            iconColor="text-rose-400"
            borderColor="border-rose-500/20"
          />
        </div>
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider mb-2">Metricas da Dashboard</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { term: 'CPA', desc: 'Custo por Aquisicao — quanto custa cada venda' },
              { term: 'CPL', desc: 'Custo por Lead — quanto custa cada ingresso' },
              { term: 'Ticket Medio', desc: 'Valor medio por venda (faturamento / vendas)' },
              { term: 'ROAS', desc: 'Retorno sobre investimento em ads' },
            ].map((m) => (
              <div key={m.term} className="bg-muted/30 rounded-lg p-2.5">
                <span className="text-xs font-mono font-bold text-primary">{m.term}</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 4. CRONOGRAMA */}
      <Section
        icon={Calendar}
        title="Cronograma do Desafio"
        iconColor="text-blue-400"
      >
        <div className="space-y-2">
          {[
            { day: 'Segunda', label: 'Sessao 1', note: 'Gravacao disponivel por 24h', color: 'border-l-blue-500' },
            { day: 'Terca', label: 'Sessao 2', note: 'Gravacao disponivel por 24h', color: 'border-l-blue-500' },
            { day: 'Quarta', label: 'Sessao 3', note: 'Gravacao disponivel por 24h', color: 'border-l-blue-500' },
            { day: 'Quinta', label: 'Sessao 4', note: 'Gravacao disponivel por 24h', color: 'border-l-blue-500' },
            { day: 'Sexta', label: 'Sessao 5', note: 'Gravacao disponivel por 24h', color: 'border-l-blue-500' },
            { day: 'Sabado', label: 'Todas as gravacoes liberadas', note: '5 gravacoes disponibilizadas ao mesmo tempo', color: 'border-l-emerald-500' },
          ].map((d) => (
            <div
              key={d.day}
              className={`bg-muted/30 border-l-2 ${d.color} rounded-r-lg p-3 flex items-center justify-between`}
            >
              <div>
                <span className="text-xs font-heading font-semibold text-foreground">{d.day}</span>
                <span className="text-xs text-muted-foreground ml-2">— {d.label}</span>
              </div>
              <span className="text-[10px] text-muted-foreground/70 hidden sm:block">{d.note}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Link da gravacao diaria enviado no grupo de WhatsApp</span>
          </div>
          <div className="flex items-center gap-2">
            <Headphones className="w-3.5 h-3.5 text-violet-400" />
            <span>Link dos 7 dias gratis de Protocolos entregue junto com o ingresso</span>
          </div>
        </div>
      </Section>

      {/* 5. LINKS IMPORTANTES */}
      <Section
        icon={Link2}
        title="Links Importantes"
        iconColor="text-cyan-400"
      >
        <div className="space-y-2.5">
          <a
            href="https://docs.google.com/spreadsheets/d/1JwQd37RjULmMOYPQEb--j7roygknr2DSKsolUGIqDOc/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-muted/30 border border-border/50 rounded-lg p-3.5 hover:border-primary/40 transition-colors group"
          >
            <ExternalLink className="w-4 h-4 text-primary group-hover:text-primary" />
            <div>
              <span className="text-sm font-heading font-medium text-foreground group-hover:text-primary transition-colors">
                Planilha de Links
              </span>
              <p className="text-[10px] text-muted-foreground">
                Links de cortesia, links dos grupos, links dos anuncios e demais recursos
              </p>
            </div>
          </a>
          <div className="flex items-center gap-3 bg-muted/30 border border-border/50 rounded-lg p-3.5">
            <ExternalLink className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-sm font-heading font-medium text-foreground">
                Dashboard de Metricas
              </span>
              <p className="text-[10px] text-muted-foreground">
                Voce ja esta aqui — use as abas Desafio 1-4, Geral, Comparar e Analises
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* 6. ONDE ACHAR O QUE */}
      <Section
        icon={Map}
        title="Onde Achar o Que"
        iconColor="text-amber-400"
      >
        <div className="space-y-1.5">
          {[
            { need: 'Metricas de um desafio', go: 'Abas Desafio 1, 2, 3 ou 4' },
            { need: 'Resultado consolidado', go: 'Aba Geral (Total, Meta 1 ou Meta 2)' },
            { need: 'Comparar desafios', go: 'Aba Comparar' },
            { need: 'Analises e relatorios', go: 'Aba Analises' },
            { need: 'Simular cenarios', go: 'Aba Simulador' },
            { need: 'Link de cortesia', go: 'Planilha de Links > aba Cortesias' },
            { need: 'Link do grupo WhatsApp', go: 'Planilha de Links > aba Grupos' },
            { need: 'Links dos anuncios', go: 'Planilha de Links > aba Anuncios' },
            { need: 'Config de cada desafio', go: 'Abas Desafio 1-4 > "Configuracao do Desafio"' },
          ].map((item) => (
            <div
              key={item.need}
              className="flex items-center gap-2 text-sm py-1.5"
            >
              <span className="text-muted-foreground min-w-0 truncate">{item.need}</span>
              <div className="border-b border-dotted border-border/50 flex-1 mb-1" />
              <ArrowRight className="w-3 h-3 text-primary shrink-0" />
              <span className="text-foreground font-medium whitespace-nowrap text-xs">{item.go}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
