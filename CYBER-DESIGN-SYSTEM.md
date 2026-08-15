# 🌌 CYBER DESIGN SYSTEM - RBF MOTOS

## 🎯 Conceito

Design **NEO-FUTURISTA** revolucionário inspirado em:
- **Cyberpunk 2077** - Neon, glow effects, grid patterns
- **Sci-Fi Interfaces** - Holographic UI, scan lines
- **Tron Legacy** - Geometric shapes, blue/cyan dominance
- **Blade Runner** - Dark atmosphere, neon highlights

---

## 🎨 Paleta de Cores NEON

### Cores Primárias
```css
neon-cyan: #00F0FF      /* Cor dominante */
neon-magenta: #FF00FF   /* Acento forte */
neon-purple: #BD00FF    /* Acento médio */
neon-blue: #0066FF      /* Complementar */
```

### Cores de Estado
```css
neon-green: #00FF41     /* Success/Online */
neon-yellow: #FFFF00    /* Warning/Alert */
neon-pink: #FF006E      /* Danger/Critical */
```

### Fundos
```css
black: #000000          /* Fundo principal */
slate-900: #0f172a      /* Cards/Painéis */
slate-800: #1e293b      /* Hover states */
```

---

## ✨ Efeitos Visuais

### Neon Glow (Brilho Neon)
```css
shadow-neon-cyan: 0 0 20px rgba(0, 240, 255, 0.6)
shadow-neon-magenta: 0 0 20px rgba(255, 0, 255, 0.6)
shadow-neon-green: 0 0 20px rgba(0, 255, 65, 0.6)
```

### Cyber Grid Pattern
```css
background-image: 
  linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
background-size: 50px 50px;
```

### Scan Lines (Linhas de Varredura)
```css
animate-scan: translateY(-100%) → translateY(100%)
duration: 2s linear infinite
```

### Holographic Blur
```css
backdrop-blur-xl + border-neon-cyan/30
```

---

## 🎬 Animações Cyber

### Glow Pulse (Pulso de Brilho)
```css
animate-glow-pulse
0%, 100%: opacity 1, brightness 1
50%: opacity 0.8, brightness 1.3
```

### Float (Flutuação)
```css
animate-float
0%, 100%: translateY(0)
50%: translateY(-10px)
```

### Neon Flicker (Piscada Neon)
```css
animate-neon-flicker
0%, 100%: opacity 1
50%: opacity 0.7
```

### Glitch Effect
```css
animate-glitch
Movimentos aleatórios rápidos (2px)
```

---

## 🎮 Componentes

### KPI Cards (Cards Holográficos)
```tsx
<div className="group relative cursor-pointer">
  {/* Glow externo */}
  <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-cyan to-neon-blue 
    rounded-2xl opacity-30 group-hover:opacity-60 blur transition" />
  
  {/* Card */}
  <div className="relative bg-slate-900/90 backdrop-blur-xl 
    border border-neon-cyan/30 rounded-2xl p-6 
    hover:border-neon-cyan transition-all">
    
    {/* Scan line */}
    <div className="absolute top-0 left-0 w-full h-0.5 
      bg-gradient-to-r from-transparent via-neon-cyan to-transparent 
      animate-scan opacity-50" />
    
    {/* Conteúdo */}
    <Icon className="text-neon-cyan" size={24} />
    <p className="text-4xl font-display font-black text-neon-cyan 
      drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
      {value}
    </p>
  </div>
</div>
```

### Menu Items (Itens de Menu)
```tsx
<button className={`
  relative flex items-center gap-3 px-3 py-3 rounded-lg
  ${isActive 
    ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/50 shadow-neon-cyan' 
    : 'text-slate-400 hover:bg-slate-900/50'
  }
`}>
  {/* Hexagon background */}
  {isActive && (
    <div className="absolute inset-0 opacity-10">
      <Hexagon className="text-neon-cyan" />
    </div>
  )}
  
  <Icon className="drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]" />
  <span className="font-mono">{label.toUpperCase()}</span>
  
  {/* Barra lateral */}
  {isActive && (
    <div className="absolute left-0 w-1 h-8 bg-neon-cyan rounded-r-full 
      shadow-neon-cyan animate-glow-pulse" />
  )}
</button>
```

### Alert Crítico
```tsx
<div className="relative group">
  <div className="absolute -inset-0.5 bg-neon-pink rounded-xl opacity-30 blur" />
  <div className="relative bg-slate-900/90 backdrop-blur-xl 
    border border-red-500/50 rounded-xl p-4">
    <Icon className="text-red-500 animate-pulse" />
    <div className="absolute inset-0 animate-ping opacity-30">
      <Icon className="text-red-500" />
    </div>
  </div>
</div>
```

---

## ✍️ Tipografia

### Fontes
```css
font-display: Orbitron, Rajdhani    /* Títulos futuristas */
font-mono: JetBrains Mono           /* Códigos e dados */
font-sans: Inter                    /* Corpo de texto */
```

### Estilos
```tsx
{/* Título Principal */}
<h1 className="font-display font-black tracking-tighter 
  bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-purple 
  bg-clip-text text-transparent">
  CYBER_DASH
</h1>

{/* Subtítulo Terminal */}
<p className="font-mono text-slate-500">
  {'> SISTEMA_OPERACIONAL_V4.0_ONLINE'}
</p>

{/* Valores Numéricos */}
<p className="font-display font-black text-neon-cyan 
  drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
  24
</p>

{/* Labels */}
<span className="font-mono uppercase tracking-wider">
  ORDENS_ABERTAS
</span>
```

---

## 🎯 Background Elements

### Cyber Grid
```tsx
<div className="absolute inset-0" style={{
  backgroundImage: `
    linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px)
  `,
  backgroundSize: '50px 50px'
}} />
```

### Neon Glows (Orbes de Luz)
```tsx
<div className="absolute top-0 left-1/4 w-96 h-96 
  bg-neon-cyan/10 rounded-full blur-[120px] 
  animate-pulse-slow" />
  
<div className="absolute top-1/3 right-0 w-96 h-96 
  bg-neon-magenta/10 rounded-full blur-[120px] 
  animate-pulse-slow" 
  style={{ animationDelay: '1s' }} />
```

### Scan Line
```tsx
<div className="absolute top-0 left-0 w-full h-px 
  bg-gradient-to-r from-transparent via-neon-cyan to-transparent 
  opacity-30 animate-scan" />
```

---

## 🎮 Dashboard Layout

### Estrutura
```
┌─────────────────────────────────────────┐
│ CYBER_DASH              [NOVA ORDEM]    │ ← Header
├─────────────────────────────────────────┤
│ [KPI 1] [KPI 2] [KPI 3] [KPI 4]        │ ← KPI Cards
├─────────────────────────────────────────┤
│ [!] ALERTA CRÍTICO                      │ ← Alertas
├──────────────────────┬──────────────────┤
│                      │                  │
│  RECENTES            │  STATS           │ ← Grid Principal
│  [Ordem 1]           │  [Clientes]      │
│  [Ordem 2]           │  [Motos]         │
│  [Ordem 3]           │  [Estoque]       │
│                      │                  │
└──────────────────────┴──────────────────┘
```

---

## 🎨 Estados Interativos

### Hover
```css
hover:border-neon-cyan
hover:shadow-neon-cyan
hover:scale-[1.02]
hover:opacity-60
```

### Active
```css
bg-neon-cyan/10
text-neon-cyan
border-neon-cyan/50
shadow-neon-cyan
```

### Loading
```css
{/* Spinner Duplo */}
<div className="w-20 h-20 border-t-4 border-b-4 border-neon-cyan 
  rounded-full animate-spin shadow-neon-cyan" />
<div className="absolute w-20 h-20 border-r-4 border-l-4 
  border-neon-magenta rounded-full animate-spin-reverse 
  opacity-70 shadow-neon-magenta" />
<Cpu className="text-neon-cyan animate-pulse" />
```

---

## 📐 Espaçamento e Bordas

### Bordas
```css
rounded-xl       /* Padrão */
rounded-2xl      /* Cards grandes */
border-neon-cyan/30    /* Borda sutil */
border-neon-cyan/50    /* Borda média */
border-neon-cyan       /* Borda forte */
```

### Padding
```css
p-4, p-6    /* Cards */
px-3 py-3   /* Menu items */
gap-4       /* Grid items */
space-y-2   /* Listas */
```

---

## 🎯 Características Únicas

### ✅ Diferenciais do Design
- **Grid Pattern** animado de fundo
- **Scan Lines** em movimento constante
- **Neon Glow** em todos os elementos interativos
- **Tipografia Futurista** (Orbitron, Rajdhani)
- **Efeitos Holográficos** (backdrop-blur)
- **Animações Cyberpunk** (glitch, pulse, float)
- **Status Indicators** com pulso animado
- **Hexagon Shapes** para elementos ativos
- **Gradientes Neon** em textos importantes
- **Terminal-style** labels (uppercase + mono)

---

## 🚀 Performance

### Otimizações
- `backdrop-blur-xl` apenas onde necessário
- `will-change: transform` em animações
- `transform: translateZ(0)` para GPU acceleration
- Lazy loading de componentes pesados
- Suspense boundaries para carregamento suave

---

## 📱 Responsividade

### Breakpoints
```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

### Grid Adaptável
```css
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
```

---

## 🎨 Checklist de Implementação

- [x] Paleta neon configurada (cyan, magenta, purple)
- [x] Fontes futuristas (Orbitron, Rajdhani, JetBrains Mono)
- [x] Cyber grid background pattern
- [x] Neon glow shadows
- [x] Scan line animations
- [x] Holographic cards com backdrop-blur
- [x] Menu items com hexagon shapes
- [x] Status indicators animados
- [x] Alertas críticos com ping effect
- [x] Loading cyber spinner
- [x] Terminal-style labels
- [x] Gradientes em títulos
- [x] Tooltips futurísticos

---

## 💡 Dicas de Uso

1. **Sempre usar uppercase** em labels importantes
2. **Font-mono** para dados e códigos
3. **Font-display** para títulos
4. **Neon glow** em elementos ativos
5. **Backdrop-blur** para depth
6. **Grid pattern** em backgrounds
7. **Scan lines** para movimento
8. **Hexagons** para destaque geométrico
9. **Terminal prompt** (>) antes de textos técnicos
10. **Status dots** com pulso animado

---

**Design System Version**: 4.0_CYBER  
**Status**: 🟢 ONLINE  
**Theme**: NEO-FUTURISTA  
**Inspiração**: Cyberpunk + Sci-Fi + Tron  

🌌 **RBF MOTOS CYBER SYSTEM** 🏍️
