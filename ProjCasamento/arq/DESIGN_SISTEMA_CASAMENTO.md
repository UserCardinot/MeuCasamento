# 🎨 Design System – Casamento Lucas & Beatriz

> Tema: verdes (pastel + oliva), moderno, organizado e elegante.

---

## 1. Paleta de cores

### Cores principais (Tailwind: `casamento.*`)

| Nome token      | Hex       | Uso |
|-----------------|-----------|-----|
| **Oliva**       | `#5A6B4A` | Botões primários, links, destaques, títulos em verde |
| **Sage**        | `#8B9B7A` | Botões secundários, bordas, fundos de card suaves |
| **Sage claro**  | `#B8C4A8` | Fundos de seção, hovers leves |
| **Pastel**      | `#D4DFC7` | Fundos de área, gradientes (claro) |
| **Creme**       | `#F5F2EB` | Fundo principal da página (off-white quente) |
| **Branco**      | `#FDFCFA` | Cards, inputs, superfícies elevadas |

### Cores semânticas

| Uso     | Cor (Tailwind) | Hex exemplo |
|---------|-----------------|-------------|
| Sucesso | `casamento-oliva` ou verde | #5A6B4A |
| Erro    | `red-600`       | — |
| Aviso   | `amber-600`     | — |
| Texto primário   | `stone-800` | — |
| Texto secundário| `stone-600` | — |
| Texto terciário | `stone-500` | — |

### Gradientes padrão

- **Página:** `from-casamento-creme via-casamento-pastel to-casamento-sage-claro` (ou `from-casamento-creme to-casamento-pastel`).
- **Cards:** fundo `casamento-white` com `border-casamento-sage` ou sombra suave.

---

## 2. Tipografia

- **Títulos (display, convite, nomes):** `font-heading` (Cormorant Garamond) – manter.
- **Corpo e UI:** `font-sans` (Source Sans 3) – manter.
- **Escala sugerida:**
  - Hero / nomes: `text-4xl sm:text-5xl` (heading)
  - Título de página: `text-2xl sm:text-3xl` (heading)
  - Subtítulo / seção: `text-xl font-semibold`
  - Corpo: `text-base`
  - Auxiliar: `text-sm text-stone-600`

---

## 3. Espaçamento e layout

- **Container máximo:** `max-w-lg` (convite, confirmação) ou `max-w-2xl` (listas, formulários) ou `max-w-4xl` (admin).
- **Padding de página:** `p-6 sm:p-8`.
- **Gap entre seções:** `space-y-8` ou `mb-8`.
- **Entre elementos em formulários:** `space-y-4` ou `space-y-3`.

---

## 4. Componentes visuais

### Botão primário

- Classes: `bg-casamento-oliva text-white font-medium rounded-xl px-6 py-3 hover:bg-casamento-oliva/90 active:scale-[0.98] transition shadow-sm`.
- Foco: `focus:ring-2 focus:ring-casamento-oliva focus:ring-offset-2`.

### Botão secundário (outline)

- Classes: `border-2 border-casamento-oliva text-casamento-oliva font-medium rounded-xl px-6 py-3 hover:bg-casamento-pastel/50 transition`.

### Input / select

- Classes: `w-full px-4 py-3 border border-stone-300 rounded-xl bg-casamento-white focus:ring-2 focus:ring-casamento-oliva focus:border-casamento-oliva placeholder:text-stone-400`.
- Label: `block text-sm font-medium text-stone-700 mb-1.5`.

### Card

- Classes: `bg-casamento-white rounded-2xl border border-casamento-sage/50 shadow-sm overflow-hidden` (ou `shadow-sm` só).

### Mensagem de erro

- Classes: `text-red-600 text-sm`.

### Mensagem de sucesso

- Classes: `bg-casamento-sage-claro/50 border border-casamento-sage text-stone-800 rounded-xl px-4 py-3 text-center`.

---

## 5. Ícones e detalhes

- Preferir ícones simples (emoji ou SVG minimalista) para: presente, confirmação, recado, foto, áudio, voltar.
- Evitar excesso de decoração; manter layout “respirado” e moderno.
- Opcional: pequenos detalhes em linha (divider fino em `casamento-sage`) entre seções.

---

## 6. Responsividade

- Mobile-first: padding e fontes menores em mobile (`p-6`, `text-2xl`), maiores em `sm:` e `md:`.
- Botões e links: área de toque mínima (~44px de altura).
- Tabelas (admin): `overflow-x-auto` com bordas e tipografia legível em mobile.

---

## 7. Acessibilidade

- Contraste: texto `stone-800` em `creme`/`pastel` e `casamento-oliva` em branco atendem boa leitura.
- Focus visível em todos os interativos (ring em verde).
- Labels associados a inputs; mensagens de erro ligadas aos campos quando possível.

---

## 8. Resumo dos tokens Tailwind (para `tailwind.config`)

```ts
colors: {
  casamento: {
    oliva: "#5A6B4A",
    sage: "#8B9B7A",
    "sage-claro": "#B8C4A8",
    pastel: "#D4DFC7",
    creme: "#F5F2EB",
    white: "#FDFCFA",
  },
}
```

*(Remover ou mapear `verde` para `oliva` se quiser manter compatibilidade com código antigo.)*

---

**Próximo passo:** ver `PLANO_DESENVOLVIMENTO_DESIGN.md` para a ordem de implementação em cada tela.
