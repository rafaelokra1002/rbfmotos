# 🎨 Design System Premium - RBF Motos

## Visão Geral
Sistema de design moderno e premium para o sistema de gestão RBF Motos, inspirado em produtos SaaS de alto nível como Notion, Linear, Vercel e Stripe.

---

## 🎯 Filosofia de Design

### Princípios
1. **Minimalismo Elegante** - Menos é mais, foco no essencial
2. **Hierarquia Visual Clara** - Informações organizadas por importância
3. **Microinterações Suaves** - Feedback visual em cada ação
4. **Consistência** - Padrões repetíveis em todo o sistema
5. **Performance** - Animações e transições otimizadas

---

## 🎨 Paleta de Cores

### Cores Principais
- **Orange (Principal)**: `#FF6B35` - Gradiente: `from-orange-500 to-orange-600`
- **Purple (Acento)**: `#A855F7` - Gradiente: `from-purple-500 to-purple-600`

### Cores de Estado
- **Success (Sucesso)**: `#10b981` (emerald-500)
- **Danger (Erro)**: `#ef4444` (red-500)
- **Warning (Alerta)**: `#f59e0b` (amber-500)
- **Info (Informação)**: `#3b82f6` (blue-500)

### Cores de Fundo
- **Primário**: `#0f172a` (slate-900)
- **Secundário**: `#1e293b` (slate-800)
- **Terciário**: `#334155` (slate-700)

### Cores de Texto
- **Principal**: `#f1f5f9` (slate-100)
- **Secundário**: `#cbd5e1` (slate-300)
- **Muted**: `#94a3b8` (slate-400)

---

## ✍️ Tipografia

### Fontes
- **Principal**: Inter (sans-serif)
- **Display/Títulos**: Poppins

### Tamanhos
```css
text-xs: 0.75rem (12px)
text-sm: 0.875rem (14px)
text-base: 1rem (16px)
text-lg: 1.125rem (18px)
text-xl: 1.25rem (20px)
text-2xl: 1.5rem (24px)
text-3xl: 1.875rem (30px)
text-4xl: 2.25rem (36px)
```

### Pesos
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700
- **Extrabold**: 800

---

## 📦 Componentes

### Button
```tsx
import { Button } from './components/ui/Button';

// Variantes
<Button variant="primary">Primário</Button>
<Button variant="secondary">Secundário</Button>
<Button variant="danger">Perigo</Button>
<Button variant="success">Sucesso</Button>
<Button variant="ghost">Fantasma</Button>
<Button variant="outline">Contorno</Button>

// Tamanhos
<Button size="sm">Pequeno</Button>
<Button size="md">Médio</Button>
<Button size="lg">Grande</Button>
<Button size="xl">Extra Grande</Button>

// Com ícones
<Button leftIcon={<Plus />}>Adicionar</Button>
<Button rightIcon={<ArrowRight />}>Avançar</Button>

// Estados
<Button isLoading>Carregando...</Button>
<Button disabled>Desabilitado</Button>
<Button fullWidth>Largura Total</Button>
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/ui/Card';

<Card variant="glass" padding="lg" hover>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição opcional</CardDescription>
  </CardHeader>
  <CardContent>
    Conteúdo principal
  </CardContent>
  <CardFooter>
    Rodapé do card
  </CardFooter>
</Card>

// Variantes
- default: Fundo padrão
- glass: Glassmorphism
- elevated: Com sombra elevada
- bordered: Com borda destacada
```

### Input
```tsx
import { Input, Select, Textarea } from './components/ui/Input';

<Input
  label="Nome"
  placeholder="Digite seu nome"
  error="Campo obrigatório"
  helperText="Dica útil"
  leftIcon={<User />}
  rightIcon={<Check />}
/>

<Select label="Selecione">
  <option>Opção 1</option>
  <option>Opção 2</option>
</Select>

<Textarea
  label="Descrição"
  rows={4}
/>
```

### Avatar
```tsx
import { Avatar } from './components/ui/Avatar';

<Avatar
  name="João Silva"
  src="/foto.jpg"
  size="md"
  status="online"
/>

// Status: online, offline, away, busy
// Tamanhos: sm, md, lg, xl
```

### Empty State & Skeleton
```tsx
import { EmptyState, Skeleton, SkeletonCard, SkeletonTable } from './components/ui/EmptyState';

<EmptyState
  icon={<Package size={64} />}
  title="Nenhum item encontrado"
  description="Adicione seu primeiro item para começar"
  action={<Button>Adicionar Item</Button>}
/>

<Skeleton width="200px" height="20px" />
<SkeletonCard />
<SkeletonTable rows={5} />
```

### Modal
```tsx
import { Modal } from './components/ui/Modal';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Título do Modal"
  description="Descrição"
  size="md"
  footer={
    <>
      <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
      <Button variant="primary">Confirmar</Button>
    </>
  }
>
  Conteúdo do modal
</Modal>

// Tamanhos: sm, md, lg, xl, full
```

### Badge
```tsx
import { Badge } from './components/ui/Badge';

<Badge variant="success">Sucesso</Badge>
<Badge variant="danger">Erro</Badge>
<Badge variant="warning">Alerta</Badge>
<Badge variant="info">Info</Badge>
```

---

## 🎭 Efeitos Visuais

### Glassmorphism
```css
bg-white/5 backdrop-blur-xl border border-white/10
```

### Sombras
```css
/* Suave */
shadow-lg shadow-black/20

/* Glow colorido */
shadow-xl shadow-orange-500/40
shadow-xl shadow-purple-500/40

/* Elevação */
shadow-2xl shadow-black/30
```

### Gradientes
```css
/* Primário */
bg-gradient-to-r from-orange-500 to-orange-600

/* Alternativo */
bg-gradient-to-br from-slate-800/50 to-slate-800/30

/* Fundo */
bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
```

---

## 🎬 Animações

### Classes de Animação
```css
animate-fade-in      /* Fade suave */
animate-scale-in     /* Escala de entrada */
animate-slide-up     /* Desliza para cima */
animate-pulse        /* Pulso */
animate-spin         /* Rotação */
```

### Transições
```css
/* Padrão */
transition-all duration-200

/* Suave */
transition-all duration-300 ease-in-out

/* Hover States */
hover:scale-[1.02]
hover:shadow-xl
hover:border-orange-500/30
group-hover:translate-x-1
```

---

## 📐 Espaçamento

### Sistema de Grid
```tsx
/* Layout Principal */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

/* Bento Grid */
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">Conteúdo principal</div>
  <div>Sidebar</div>
</div>
```

### Padding e Margin
```css
p-4   /* 1rem (16px) */
p-6   /* 1.5rem (24px) */
p-8   /* 2rem (32px) */

gap-4  /* Espaço entre itens */
gap-6
```

---

## 📱 Responsividade

### Breakpoints
```css
sm: 640px   /* Mobile grande */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop grande */
2xl: 1536px /* Ultra wide */
```

### Padrões
```tsx
/* Mobile First */
className="block md:flex lg:grid"

/* Ocultar em mobile */
className="hidden lg:block"

/* Grid responsivo */
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
```

---

## 🎯 Boas Práticas

### Estados de Hover
Sempre forneça feedback visual:
```css
hover:bg-slate-700
hover:text-orange-400
hover:scale-[1.02]
```

### Estados de Loading
Use skeleton ou spinners:
```tsx
{loading ? <Skeleton /> : <Content />}
```

### Empty States
Sempre mostre estado vazio elegante:
```tsx
<EmptyState
  icon={<Icon />}
  title="Nenhum item"
  description="Comece adicionando seu primeiro item"
  action={<Button>Adicionar</Button>}
/>
```

### Acessibilidade
- Use `aria-label` em botões de ícone
- Mantenha contraste adequado (4.5:1 mínimo)
- Forneça feedback visual e textual

---

## 🚀 Implementação

### Estrutura de Componentes
```
src/
  components/
    ui/
      Avatar.tsx
      Badge.tsx
      Button.tsx
      Card.tsx
      EmptyState.tsx
      Input.tsx
      Modal.tsx
    HeaderPremium.tsx
    SidebarV2.tsx
    DashboardUltra.tsx
```

### Arquivo de Configuração
`tailwind.config.js` - Contém todas as cores, animações e estilos customizados.

---

## 📚 Exemplos de Uso

### Dashboard KPI Card
```tsx
<div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300 cursor-pointer">
  <div className="flex items-start justify-between mb-4">
    <div className="p-3 bg-orange-500/10 rounded-xl">
      <Clock className="text-orange-500" size={24} />
    </div>
    <ChevronRight className="text-slate-600 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" size={20} />
  </div>
  <div className="space-y-1">
    <p className="text-sm text-slate-400 font-medium">Ordens Abertas</p>
    <p className="text-3xl font-bold text-white">24</p>
  </div>
  <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl group-hover:bg-orange-500/30 transition-all" />
</div>
```

### Lista de Itens Interativa
```tsx
<div className="space-y-3">
  {items.map((item) => (
    <div 
      key={item.id}
      className="group flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 hover:border-orange-500/30 rounded-xl transition-all cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <Avatar name={item.name} />
        <div>
          <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors">
            {item.name}
          </h3>
          <p className="text-sm text-slate-400">{item.description}</p>
        </div>
      </div>
      <ChevronRight className="text-slate-600 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" size={20} />
    </div>
  ))}
</div>
```

---

## 🎨 Recursos Adicionais

### Google Fonts
Inter e Poppins já estão configuradas no `index.html`

### Ícones
Lucide React é usado em todo o sistema para consistência

### Cores Personalizadas
Todas configuradas no `tailwind.config.js`

---

## 📝 Checklist de Design

- [ ] Usar cores da paleta oficial
- [ ] Aplicar rounded-xl ou rounded-2xl (evitar rounded-md)
- [ ] Adicionar hover states em elementos clicáveis
- [ ] Usar transições suaves (duration-200 ou duration-300)
- [ ] Fornecer feedback visual (loading, success, error)
- [ ] Implementar empty states elegantes
- [ ] Garantir responsividade mobile-first
- [ ] Testar contraste de cores (acessibilidade)
- [ ] Adicionar microanimações onde apropriado
- [ ] Usar glassmorphism com moderação

---

**Criado para RBF Motos - Sistema Premium v2.0** 🏍️✨
