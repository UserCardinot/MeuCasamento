# 🚀 Conceito de Redesign Completo – Plataforma de Casamento

> Reformulação total: layout, estrutura, visual e experiência – algo verdadeiramente moderno.

---

## 1. Nova Identidade Visual

### Direção
- **Estética:** Minimal, editorial, com hierarquia forte e muito espaço em branco
- **Sensação:** Elegante, sofisticado e atual (não “site antigo de casamento”)
- **Referências:** Landing pages premium, Dribbble 2024/2025, revista de casamento contemporânea

### Tipografia
- **Display / Hero:** Playfair Display ou similar serif elegante (títulos grandes, nomes)
- **Corpo / UI:** Outfit, Plus Jakarta Sans ou DM Sans (limpa, moderna)
- **Hierarquia forte:** tamanhos bem distintos (ex: 3xl vs 5xl vs 7xl)

### Paleta
- **Base:** Fundo quase branco (#FAFAFA) ou creme muito sutil
- **Primária:** Verde oliva profundo (#4A5D3A) ou sage escuro
- **Secundária:** Tons neutros (stone-800, stone-600, stone-400)
- **Destaque:** Dourado discreto (#B8860B) ou sage para micro-interações
- **Sem gradientes pesados** – fundos sólidos ou gradientes muito suaves

---

## 2. Nova Estrutura de Páginas

### Convite (`/convite`)
**Antes:** Card único central, tudo empilhado  
**Depois:**
- **Hero full-screen:** Nomes em grande destaque, “você está convidado” em linha fina
- **Seção data/local:** Layout em grid ou duas colunas (data | local + mapa)
- **Contagem regressiva:** Blocos grandes, tipo “editorial”
- **CTA principal:** Botão único grande (“Confirmar presença”)
- **Links secundários:** Ícones + texto em linha (Presentes | Recados) – menos destaque

### Confirmação (`/confirmacao`)
- **Layout:** Formulário em duas colunas em desktop (label | input lado a lado)
- **Radio Sim/Não:** Botões tipo toggle ou cards clicáveis (não radio nativo)
- **Espaçamento generoso** entre seções
- **Sucesso:** Animação leve + mensagem em destaque

### Presentes (`/presentes`)
- **Cards de presente:** Imagem em destaque, preço e CTA bem definidos
- **Grid:** 2 colunas mobile, 3 desktop
- **QR Code Pix:** Card dedicado com visual limpo, não “formulário”

### Recados (`/recados`)
- **Layout:** Formulário em cima, mural de recados em cards tipo “post-it” ou timeline
- **Cada recado:** Nome + data em cabeçalho, mensagem em corpo

### Mídia / Galeria
- **Upload:** Zona de drop com borda tracejada, estados claro (vazio, hover, com arquivo)
- **Galeria:** Masonry ou grid uniforme, hover com overlay sutil

### Admin
- **Sidebar:** Navegação lateral fixa (resumo, convidados, presenças, etc.)
- **Conteúdo principal:** Tabelas em cards, filtros e ações bem separados
- **Login:** Tela full-screen centralizada, input e botão minimalistas

---

## 3. Componentes Visuais (Novo Conceito)

### Botões
- **Primário:** Fundo sólido, cantos bem arredondados (rounded-2xl), sem borda
- **Secundário:** Outline fino ou texto com ícone
- **Ghost:** Só texto, hover com fundo suave

### Cards
- **Sem borda pesada** – sombra sutil (`shadow-sm` ou `shadow`)
- **Bordas muito arredondadas** (rounded-2xl ou 3xl)
- **Hover:** Sombra um pouco maior (`shadow-md`)

### Inputs
- **Estilo “floating” ou label acima**
- **Borda fina** (1px), foco com mudança de cor ou outline
- **Placeholder discreto**

### Espaçamento
- **Generoso:** `space-y-12` entre seções grandes
- **Padding:** `px-6 sm:px-12 lg:px-24` em páginas
- **Container:** `max-w-4xl` ou `max-w-5xl` para conteúdo principal

---

## 4. Micro-interações e Detalhes

- **Transições:** `transition-all duration-200` em botões e cards
- **Hover em links:** Sublinhado que aparece ou mudança de cor
- **Focus:** Ring visível para acessibilidade
- **Loading:** Skeleton ou spinner minimalista

---

## 5. Responsividade

- **Mobile-first:** Conteúdo empilhado, CTAs full-width em mobile
- **Desktop:** Mais colunas, sidebar no admin, grid de presentes
- **Breakpoints:** sm (640), md (768), lg (1024), xl (1280)

---

## 6. Ordem de Implementação

1. **Base:** Novas fontes, paleta, variáveis CSS
2. **Convite:** Hero + seções + CTAs (página mais importante)
3. **Confirmação:** Formulário novo
4. **Presentes:** Grid de cards + QR Code
5. **Recados:** Layout mural
6. **Mídia / Galeria:** Upload + grid
7. **Admin:** Sidebar + tabelas
8. **Home, 404, Error:** Consistência final

---

## 7. Próximo Passo

Se quiser que eu implemente esse conceito, posso começar por:

1. **Atualizar tipografia** (novas fontes no layout)
2. **Reformular a página do convite** como primeiro exemplo
3. **Ir página a página** até cobrir tudo

Responda **“sim, vamos”** ou **“começa pelo convite”** para eu iniciar a implementação.
