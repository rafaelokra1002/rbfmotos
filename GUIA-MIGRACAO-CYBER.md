# 🚀 GUIA RÁPIDO DE MIGRAÇÃO PARA TEMA CYBER

## 📋 Checklist de Migração por Componente

### 1️⃣ Substituir Imports

**ANTES:**
```tsx
import './styles.css';
```

**DEPOIS:**
```tsx
import { CardCyber } from './ui/CardCyber';
import { TableCyber } from './ui/TableCyber';
import { BadgeCyber } from './ui/BadgeCyber';
import { InputCyber } from './ui/InputCyber';
import { SelectCyber } from './ui/SelectCyber';
import { TextareaCyber } from './ui/TextareaCyber';
import { ModalCyber } from './ui/ModalCyber';
import { Button } from './ui/Button';
```

---

### 2️⃣ Adicionar Background Cyber

**Adicionar no container principal:**
```tsx
<div className="min-h-screen bg-black p-6">
  {/* Cyber Grid Background */}
  <div className="fixed inset-0 pointer-events-none opacity-10">
    <div className="absolute inset-0" style={{
      backgroundImage: `
        linear-gradient(to right, #00F0FF 1px, transparent 1px),
        linear-gradient(to bottom, #00F0FF 1px, transparent 1px)
      `,
      backgroundSize: '50px 50px'
    }} />
  </div>

  {/* Seu conteúdo aqui */}
  <div className="relative">
    {/* ... */}
  </div>
</div>
```

---

### 3️⃣ Migrar Cards/Containers

**ANTES:**
```tsx
<div className="bg-white rounded-lg shadow p-6">
  <h2>Título</h2>
  {content}
</div>
```

**DEPOIS:**
```tsx
<CardCyber 
  title="TÍTULO" 
  subtitle="Descrição opcional"
  icon={<IconComponent />}
>
  {content}
</CardCyber>
```

**Variantes disponíveis:**
- `variant="default"` (padrão cyan)
- `variant="highlighted"` (roxo destaque)
- `variant="success"` (verde)
- `variant="danger"` (rosa/vermelho)

---

### 4️⃣ Migrar Tabelas

**ANTES:**
```tsx
<table>
  <thead>
    <tr>
      <th>Nome</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {data.map(item => (
      <tr key={item.id}>
        <td>{item.nome}</td>
        <td>{item.status}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**DEPOIS:**
```tsx
<TableCyber
  columns={[
    {
      key: 'nome',
      label: 'NOME',
      sortable: true,
      width: '40%'
    },
    {
      key: 'status',
      label: 'STATUS',
      sortable: true,
      width: '20%',
      render: (value, item) => (
        <BadgeCyber variant={value === 'ativo' ? 'success' : 'default'}>
          {value}
        </BadgeCyber>
      )
    }
  ]}
  data={data}
  keyExtractor={(item) => item.id.toString()}
  onRowClick={(item) => handleEdit(item)}
  sortColumn={sortColumn}
  sortDirection={sortDirection}
  onSort={handleSort}
/>
```

---

### 5️⃣ Migrar Formulários

**ANTES:**
```tsx
<div>
  <label>Nome</label>
  <input type="text" placeholder="Digite o nome" />
</div>

<div>
  <label>Status</label>
  <select>
    <option value="ativo">Ativo</option>
    <option value="inativo">Inativo</option>
  </select>
</div>

<div>
  <label>Observações</label>
  <textarea placeholder="Digite aqui..." />
</div>
```

**DEPOIS:**
```tsx
<InputCyber
  label="Nome"
  placeholder="Digite o nome..."
  icon={User}
  required
  value={nome}
  onChange={(e) => setNome(e.target.value)}
/>

<SelectCyber
  label="Status"
  icon={Filter}
  required
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  options={[
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' }
  ]}
/>

<TextareaCyber
  label="Observações"
  placeholder="Digite aqui..."
  rows={4}
  value={obs}
  onChange={(e) => setObs(e.target.value)}
/>
```

---

### 6️⃣ Migrar Badges/Status

**ANTES:**
```tsx
<span className={`badge ${status === 'ativo' ? 'badge-success' : 'badge-danger'}`}>
  {status}
</span>
```

**DEPOIS:**
```tsx
<BadgeCyber 
  variant={status === 'ativo' ? 'success' : 'error'}
  pulse={status === 'pendente'}
>
  {status}
</BadgeCyber>
```

**Variantes:**
- `success` - verde (ativo, concluído)
- `warning` - amarelo (pendente, aguardando)
- `error` - rosa (cancelado, erro)
- `info` - cyan (informação)
- `pending` - roxo (em andamento)
- `default` - cinza (padrão)

---

### 7️⃣ Migrar Botões

**ANTES:**
```tsx
<button className="btn btn-primary">
  Salvar
</button>
```

**DEPOIS:**
```tsx
<Button 
  variant="primary"
  leftIcon={<Save size={18} />}
  onClick={handleSave}
  isLoading={loading}
>
  SALVAR
</Button>
```

**Variantes:**
- `primary` - cyan gradient (ação principal)
- `secondary` - transparente com borda (ação secundária)
- `danger` - rosa/vermelho (ações destrutivas)
- `success` - verde (confirmações)

---

### 8️⃣ Migrar Modais

**ANTES:**
```tsx
{showModal && (
  <div className="modal-overlay">
    <div className="modal">
      <h2>Título</h2>
      <div>{content}</div>
      <button onClick={onClose}>Fechar</button>
    </div>
  </div>
)}
```

**DEPOIS:**
```tsx
<ModalCyber
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="TÍTULO_MODAL"
  subtitle="Descrição opcional"
  size="md"
  footer={
    <ModalFooterActions
      onCancel={() => setShowModal(false)}
      onConfirm={handleConfirm}
      confirmText="CONFIRMAR"
      cancelText="CANCELAR"
      confirmVariant="primary"
      isLoading={loading}
    />
  }
>
  {content}
</ModalCyber>
```

**Tamanhos:**
- `sm` - pequeno
- `md` - médio (padrão)
- `lg` - grande
- `xl` - extra grande
- `full` - tela cheia

---

## 🎨 Padrões de Estilo

### Classes Úteis (Tailwind)

**Textos:**
```tsx
// Headers
className="text-2xl font-mono font-bold text-neon-cyan uppercase tracking-wider"

// Body
className="text-sm text-slate-300 font-mono"

// Labels
className="text-xs text-slate-500 font-mono uppercase"

// Terminal style
className="font-mono text-neon-green"
```

**Containers:**
```tsx
// Grid responsivo
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"

// Flex com gap
className="flex items-center gap-3"

// Espaçamento
className="space-y-4"  // vertical
className="space-x-4"  // horizontal
```

**Cores de texto:**
- `text-neon-cyan` - cyan primário
- `text-neon-green` - verde sucesso
- `text-neon-pink` - rosa erro
- `text-neon-purple` - roxo destaque
- `text-neon-magenta` - magenta acento
- `text-slate-300` - texto normal
- `text-slate-400` - texto secundário
- `text-slate-500` - texto desabilitado

---

## 📝 Exemplo Completo de Migração

**Página Clientes - ANTES:**
```tsx
export function Clientes() {
  return (
    <div className="container">
      <div className="header">
        <h1>Clientes</h1>
        <button onClick={handleNew}>Novo</button>
      </div>
      
      <table>
        {/* tabela tradicional */}
      </table>
    </div>
  );
}
```

**Página Clientes - DEPOIS:**
```tsx
import { CardCyber } from './ui/CardCyber';
import { TableCyber } from './ui/TableCyber';
import { BadgeCyber } from './ui/BadgeCyber';
import { Button } from './ui/Button';
import { InputCyber } from './ui/InputCyber';
import { Users, Plus, Search } from 'lucide-react';

export function ClientesCyber() {
  return (
    <div className="min-h-screen bg-black p-6">
      {/* Cyber Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #00F0FF 1px, transparent 1px),
            linear-gradient(to bottom, #00F0FF 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative max-w-[1600px] mx-auto space-y-6">
        {/* Header Stats */}
        <CardCyber variant="highlighted" className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="text-neon-cyan" size={32} />
              <div>
                <h1 className="text-2xl font-mono font-bold text-neon-cyan uppercase">
                  CLIENTES
                </h1>
                <p className="text-sm text-slate-400 font-mono">
                  {'> '}{clientes.length} registros
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              leftIcon={<Plus size={18} />}
              onClick={handleNew}
            >
              NOVO_CLIENTE
            </Button>
          </div>
        </CardCyber>

        {/* Filtros */}
        <CardCyber noPadding>
          <div className="p-4">
            <InputCyber
              placeholder="BUSCAR_CLIENTE..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Tabela */}
          <TableCyber
            columns={[
              { key: 'nome', label: 'NOME', sortable: true },
              { key: 'telefone', label: 'TELEFONE', sortable: true },
              {
                key: 'status',
                label: 'STATUS',
                render: (status) => (
                  <BadgeCyber variant={status === 'ativo' ? 'success' : 'default'}>
                    {status}
                  </BadgeCyber>
                )
              }
            ]}
            data={clientes}
            keyExtractor={(item) => item.id}
            onRowClick={handleEdit}
          />
        </CardCyber>
      </div>
    </div>
  );
}
```

---

## ✅ Checklist Final

Ao migrar cada página, verificar:

- [ ] Background cyber grid adicionado
- [ ] Todos os cards usando CardCyber
- [ ] Tabelas usando TableCyber
- [ ] Forms usando InputCyber/SelectCyber/TextareaCyber
- [ ] Badges usando BadgeCyber
- [ ] Botões usando Button component
- [ ] Modais usando ModalCyber
- [ ] Textos em UPPERCASE com font-mono
- [ ] Cores neon aplicadas (cyan, green, pink, purple)
- [ ] Ícones do Lucide importados
- [ ] Responsividade mantida (grid/flex)
- [ ] Sem erros de TypeScript

---

**Tempo estimado por página: 15-30 minutos** ⏱️

**Ordem sugerida de migração:**
1. ✅ Dashboard (já feito)
2. ✅ Header (já feito)
3. ✅ Sidebar (já feito)
4. OrdensServico
5. Clientes
6. Motos
7. Pecas/Servicos
8. Financeiro/Caixa
9. Configurações
10. Forms diversos
