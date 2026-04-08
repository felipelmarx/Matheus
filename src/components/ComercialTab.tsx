import { BookOpen, Moon } from "lucide-react";

/**
 * Aba Comercial — informações estáticas de produtos para o time de vendas.
 * Fonte: prints do kit de estudos e sleep control (2026-04-08).
 */

interface Product {
  id: string;
  name: string;
  price: string;
  access: string;
  shortDescription: string;
  longDescription: string;
  bullets: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const PRODUCTS: Product[] = [
  {
    id: "kit-estudos",
    name: "Kit de Estudos",
    price: "R$ 37",
    access: "1 mês",
    shortDescription: "Conteúdos preparatórios do desafio",
    longDescription:
      "Conteúdos exclusivos de apoio para o aluno se preparar antes e durante o desafio. Material de suporte para potencializar os resultados da jornada.",
    bullets: [
      "Acesso por 1 mês",
      "Conteúdos preparatórios em módulos",
      "Material de apoio ao desafio",
      "Complementa a experiência do evento",
    ],
    icon: BookOpen,
  },
  {
    id: "sleep-control",
    name: "Sleep Control",
    price: "R$ 97",
    access: "1 mês",
    shortDescription: "Áudios guiados para dormir",
    longDescription:
      "Áudios com técnicas de respiração guiada para melhorar a qualidade do sono do aluno. Protocolo baseado em neurociência da respiração aplicada ao descanso.",
    bullets: [
      "Acesso por 1 mês",
      "Áudios guiados para dormir",
      "Técnicas de respiração para o sono",
      "Aplicação prática diária",
    ],
    icon: Moon,
  },
];

export default function ComercialTab() {
  return (
    <section className="space-y-8">
      {/* Header */}
      <header className="rounded-xl border border-brand-gray-med/30 bg-brand-light p-6">
        <h2 className="mb-2 text-2xl font-bold text-brand-primary">
          Time Comercial — Produtos
        </h2>
        <p className="text-sm text-brand-gray-dark">
          Informações de produto para o time comercial iBreathwork. Use estes
          dados para apresentar o portfólio ao aluno de forma clara e científica.
        </p>
      </header>

      {/* Resumo Rápido */}
      <div className="rounded-xl border border-brand-gray-med/30 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-gray-med">
          Resumo Rápido
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-gray-med/30">
                <th className="pb-3 font-semibold text-brand-gray-dark">
                  Produto
                </th>
                <th className="pb-3 font-semibold text-brand-gray-dark">
                  Preço
                </th>
                <th className="pb-3 font-semibold text-brand-gray-dark">
                  Acesso
                </th>
                <th className="pb-3 font-semibold text-brand-gray-dark">
                  O que é
                </th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-brand-gray-med/15 last:border-0"
                >
                  <td className="py-3 font-semibold text-brand-text">
                    {p.name}
                  </td>
                  <td className="py-3 font-bold text-brand-primary">
                    {p.price}
                  </td>
                  <td className="py-3 text-brand-gray-dark">{p.access}</td>
                  <td className="py-3 text-brand-gray-dark">
                    {p.shortDescription}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards detalhados */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {PRODUCTS.map((p) => {
          const Icon = p.icon;
          return (
            <article
              key={p.id}
              className="flex flex-col rounded-xl border border-brand-gray-med/30 bg-white p-6 shadow-sm transition-colors hover:border-brand-primary/40"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-brand-light p-2.5">
                    <Icon className="h-6 w-6 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-text">
                      {p.name}
                    </h3>
                    <p className="text-xs text-brand-gray-med">
                      Acesso: {p.access}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-brand-primary px-3 py-1.5 text-sm font-bold text-white">
                  {p.price}
                </div>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-brand-gray-dark">
                {p.longDescription}
              </p>

              <ul className="space-y-2 text-sm text-brand-gray-dark">
                {p.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-primary"
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      {/* Nota final */}
      <p className="text-center text-xs text-brand-gray-med">
        Informações de produto · Uso interno do time comercial iBreathwork
      </p>
    </section>
  );
}
