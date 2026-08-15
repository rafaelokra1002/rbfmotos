# 💻 CÓDIGO PRONTO - RBF MOTOS PREMIUM

## Exemplos práticos de implementação dos novos componentes

---

## 1. 📊 DASHBOARD COM STATCARDS

### Implementação completa:

```tsx
import { StatCard } from './ui/StatCard';
import { Wrench, Users, DollarSign, AlertCircle } from 'lucide-react';

function MeuDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Grid de 4 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Ordens Abertas"
          value={12}
          icon={AlertCircle}
          color="blue"
          onClick={() => navigate('ordens')}
        />
        
        <StatCard
          title="Em Andamento"
          value={8}
          icon={Wrench}
          color="amber"
          onClick={() => navigate('ordens')}
        />
        
        <StatCard
          title="Faturamento Mês"
          value="R$ 45.000"
          icon={DollarSign}
          color="emerald"
          trend={{ value: 15, isPositive: true }}
          onClick={() => navigate('financeiro')}
        />
        
        <StatCard
          title="Total Clientes"
          value={156}
          icon={Users}
          color="purple"
          onClick={() => navigate('clientes')}
        />
      </div>
    </div>
  );
}
```

---

## 2. 📋 LISTA DE ORDENS COM CARDS

### Substituir tabela por cards modernos:

```tsx
import { Badge } from './ui/Badge';
import { Card, CardContent } from './ui/Card';
import { Clock, MessageCircle, Bike, User } from 'lucide-react';

function ListaOrdens({ ordens }: { ordens: any[] }) {
  const statusConfig = {
    aberta: { label: 'Aberta', variant: 'aberta' as const },
    em_andamento: { label: 'Em Andamento', variant: 'andamento' as const },
    pronta: { label: 'Pronta', variant: 'pronta' as const },
    entregue: { label: 'Entregue', variant: 'entregue' as const },
  };

  return (
    <div className="space-y-4">
      {ordens.map((ordem) => (
        <Card 
          key={ordem.id} 
          hover 
          onClick={() => abrirDetalhes(ordem.id)}
          className="cursor-pointer"
        >
          <CardContent className="p-6">
            {/* Header com Status e Valor */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-white">
                  OS #{ordem.numero}
                </span>
                <Badge 
                  variant={statusConfig[ordem.status]?.variant} 
                  pulse={ordem.status === 'aberta'}
                >
                  {statusConfig[ordem.status]?.label}
                </Badge>
                {ordem.mensagensNaoLidas > 0 && (
                  <Badge variant="danger" size="sm">
                    <MessageCircle size={12} />
                    {ordem.mensagensNaoLidas}
                  </Badge>
                )}
              </div>
              <span className="text-2xl font-bold text-orange-400">
                R$ {ordem.valorTotal.toFixed(2)}
              </span>
            </div>

            {/* Informações da Moto e Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-slate-300">
                <Bike size={16} className="text-purple-400" />
                <span className="text-sm">
                  {ordem.moto} • {ordem.placa}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <User size={16} className="text-blue-400" />
                <span className="text-sm">{ordem.cliente}</span>
              </div>
            </div>

            {/* Serviços (se houver) */}
            {ordem.servicos && ordem.servicos.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
                  Serviços:
                </p>
                <div className="space-y-1">
                  {ordem.servicos.slice(0, 2).map((servico: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className={servico.concluido ? 'text-emerald-400' : 'text-slate-500'}>
                        {servico.concluido ? '✓' : '○'}
                      </span>
                      <span>{servico.nome}</span>
                    </div>
                  ))}
                  {ordem.servicos.length > 2 && (
                    <p className="text-xs text-slate-500">
                      + {ordem.servicos.length - 2} mais
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Progress Bar (opcional) */}
            {ordem.progresso !== undefined && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Progresso</span>
                  <span>{ordem.progresso}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
                    style={{ width: `${ordem.progresso}%` }}
                  />
                </div>
              </div>
            )}

            {/* Footer com Data e Ações */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock size={12} />
                <span>
                  {new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors">
                  Ver Detalhes
                </button>
                {ordem.telefone && (
                  <button className="px-3 py-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                    WhatsApp
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## 3. 🔍 EMPTY STATE (Quando não há dados)

```tsx
import { EmptyState } from './ui/EmptyState';
import { Wrench } from 'lucide-react';

function MinhaLista({ itens, onAdicionar }: any) {
  if (itens.length === 0) {
    return (
      <EmptyState
        icon={<Wrench size={48} />}
        title="Nenhuma ordem cadastrada"
        description="Comece criando a primeira ordem de serviço para gerenciar os atendimentos da oficina"
        action={{
          label: 'Criar Primeira Ordem',
          onClick: onAdicionar
        }}
      />
    );
  }

  return (
    <div>
      {/* Renderizar lista normal */}
    </div>
  );
}
```

---

## 4. ⏳ LOADING STATE (Skeleton)

```tsx
import { SkeletonCard, SkeletonTable } from './ui/Skeleton';

function MinhaListaComLoading({ loading, dados }: any) {
  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div>
      {/* Renderizar dados reais */}
    </div>
  );
}

// Ou para tabelas:
function MinhaTabelaComLoading({ loading, dados }: any) {
  if (loading) {
    return <SkeletonTable rows={5} />;
  }

  return (
    <table>
      {/* Tabela real */}
    </table>
  );
}
```

---

## 5. 💳 CARD DE CLIENTE PREMIUM

```tsx
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { User, Phone, Bike, Wrench, Star } from 'lucide-react';

function ClienteCard({ cliente }: { cliente: any }) {
  return (
    <Card variant="gradient" hover>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {cliente.foto ? (
              <img 
                src={cliente.foto} 
                alt={cliente.nome}
                className="w-12 h-12 rounded-full object-cover border-2 border-orange-500/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg mb-1">{cliente.nome}</CardTitle>
              {cliente.vip && (
                <Badge variant="warning" size="sm">
                  <Star size={12} />
                  VIP
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Telefone */}
        <div className="flex items-center gap-2 text-slate-300">
          <Phone size={16} className="text-blue-400" />
          <span className="text-sm">{cliente.telefone}</span>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
              <Bike size={16} />
              <span className="text-xl font-bold">{cliente.totalMotos}</span>
            </div>
            <p className="text-xs text-slate-500">Motos</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
              <Wrench size={16} />
              <span className="text-xl font-bold">{cliente.totalServicos}</span>
            </div>
            <p className="text-xs text-slate-500">Serviços</p>
          </div>
        </div>

        {/* Avaliação */}
        {cliente.avaliacao && (
          <div className="flex items-center justify-center gap-1 pt-3 border-t border-slate-700/50">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < cliente.avaliacao ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
              />
            ))}
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-3">
          <button className="flex-1 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors">
            Ver Perfil
          </button>
          <button className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 text-white text-sm font-medium rounded-lg transition-all">
            WhatsApp
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 6. 🔧 FORMULÁRIO MODERNO

```tsx
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Search, User, Phone, Mail } from 'lucide-react';

function FormularioCliente({ onSubmit, loading }: any) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Nome Completo"
        placeholder="Digite o nome do cliente"
        leftIcon={User}
        fullWidth
        required
      />

      <Input
        label="Telefone"
        type="tel"
        placeholder="(00) 00000-0000"
        leftIcon={Phone}
        fullWidth
        required
      />

      <Input
        label="E-mail"
        type="email"
        placeholder="cliente@email.com"
        leftIcon={Mail}
        helperText="Opcional - usado para envio de notificações"
        fullWidth
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          fullWidth
          onClick={() => navigate('clientes')}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={loading}
        >
          Salvar Cliente
        </Button>
      </div>
    </form>
  );
}
```

---

## 7. 🔔 ALERTAS E NOTIFICAÇÕES

```tsx
import { Alert } from './ui/Alert';

function MinhasPagina() {
  const [mostrarAlerta, setMostrarAlerta] = useState(true);

  return (
    <div className="p-6 space-y-4">
      {/* Alerta de Sucesso */}
      <Alert variant="success" title="Cliente cadastrado!">
        O cliente foi adicionado com sucesso ao sistema.
      </Alert>

      {/* Alerta de Aviso */}
      <Alert variant="warning" title="Estoque baixo">
        Existem 5 peças com estoque abaixo do mínimo.
      </Alert>

      {/* Alerta de Erro */}
      <Alert variant="danger" title="Erro ao salvar">
        Não foi possível salvar as alterações. Tente novamente.
      </Alert>

      {/* Alerta com botão de fechar */}
      {mostrarAlerta && (
        <Alert 
          variant="info" 
          title="Nova funcionalidade!"
          onClose={() => setMostrarAlerta(false)}
        >
          Agora você pode enviar mensagens via WhatsApp diretamente do sistema.
        </Alert>
      )}
    </div>
  );
}
```

---

## 8. 📱 MODAL MODERNO

```tsx
import { 
  Modal, 
  ModalHeader, 
  ModalTitle, 
  ModalDescription,
  ModalContent,
  ModalFooter 
} from './ui/Modal';
import { Button } from './ui/Button';

function MeuComponente() {
  const [modalAberto, setModalAberto] = useState(false);

  const handleConfirmar = () => {
    // Fazer algo
    setModalAberto(false);
  };

  return (
    <>
      <Button onClick={() => setModalAberto(true)}>
        Abrir Modal
      </Button>

      <Modal 
        isOpen={modalAberto} 
        onClose={() => setModalAberto(false)}
        size="lg"
      >
        <ModalHeader onClose={() => setModalAberto(false)}>
          <ModalTitle>Confirmar Ação</ModalTitle>
          <ModalDescription>
            Esta ação não poderá ser desfeita
          </ModalDescription>
        </ModalHeader>

        <ModalContent>
          <p className="text-slate-300">
            Tem certeza que deseja excluir este item?
          </p>
        </ModalContent>

        <ModalFooter>
          <Button 
            variant="ghost" 
            onClick={() => setModalAberto(false)}
          >
            Cancelar
          </Button>
          <Button 
            variant="danger"
            onClick={handleConfirmar}
          >
            Confirmar
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
```

---

## 9. 🎯 BADGES DE STATUS

```tsx
import { Badge } from './ui/Badge';

function StatusDisplay() {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Com pulse (pulsante) */}
      <Badge variant="aberta" pulse>
        Aberta
      </Badge>

      {/* Tamanhos diferentes */}
      <Badge variant="andamento" size="sm">
        Em Andamento
      </Badge>

      <Badge variant="pronta" size="md">
        Pronta
      </Badge>

      <Badge variant="entregue" size="lg">
        Entregue
      </Badge>

      {/* Variantes de status */}
      <Badge variant="success">Pago</Badge>
      <Badge variant="warning">Pendente</Badge>
      <Badge variant="danger">Atrasado</Badge>
      <Badge variant="info">Processando</Badge>
    </div>
  );
}
```

---

## 10. 📊 GRID RESPONSIVO COMPLETO

```tsx
function GridResponsivo({ itens }: any) {
  return (
    <div className="p-6">
      {/* Grid que ajusta colunas automaticamente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {itens.map((item: any) => (
          <Card key={item.id} hover>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-white mb-2">
                {item.titulo}
              </h3>
              <p className="text-sm text-slate-400">
                {item.descricao}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## 11. 🎨 BOTÕES PREMIUM (Todas as variantes)

```tsx
import { Button } from './ui/Button';
import { Plus, Save, Trash2, Download } from 'lucide-react';

function BotoesExemplo() {
  return (
    <div className="space-y-4">
      {/* Primary (Laranja) */}
      <Button variant="primary" leftIcon={<Plus size={18} />}>
        Novo Item
      </Button>

      {/* Secondary (Roxo) */}
      <Button variant="secondary" leftIcon={<Save size={18} />}>
        Salvar
      </Button>

      {/* Ghost (Transparente) */}
      <Button variant="ghost">
        Cancelar
      </Button>

      {/* Danger (Vermelho) */}
      <Button variant="danger" leftIcon={<Trash2 size={18} />}>
        Excluir
      </Button>

      {/* Success (Verde) */}
      <Button variant="success" leftIcon={<Download size={18} />}>
        Exportar
      </Button>

      {/* Com loading */}
      <Button variant="primary" isLoading>
        Salvando...
      </Button>

      {/* Tamanhos */}
      <div className="flex gap-2">
        <Button size="sm">Pequeno</Button>
        <Button size="md">Médio</Button>
        <Button size="lg">Grande</Button>
      </div>

      {/* Full width */}
      <Button fullWidth variant="primary">
        Botão Largo
      </Button>
    </div>
  );
}
```

---

## 12. 🔍 BUSCA COM FILTROS

```tsx
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Search, Filter } from 'lucide-react';

function BuscaComFiltros() {
  const [filtroAtivo, setFiltroAtivo] = useState('todos');

  const filtros = [
    { id: 'todos', label: 'Todos', count: 45 },
    { id: 'aberta', label: 'Abertas', count: 12 },
    { id: 'andamento', label: 'Em Andamento', count: 8 },
    { id: 'pronta', label: 'Prontas', count: 5 },
  ];

  return (
    <div className="space-y-4">
      {/* Barra de Busca */}
      <Input
        placeholder="Buscar por cliente, moto ou número da OS..."
        leftIcon={Search}
        fullWidth
      />

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter size={16} />
          <span className="text-sm font-medium">Filtrar por:</span>
        </div>
        
        {filtros.map((filtro) => (
          <button
            key={filtro.id}
            onClick={() => setFiltroAtivo(filtro.id)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm
              transition-all duration-200
              ${filtroAtivo === filtro.id
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
              }
            `}
          >
            {filtro.label}
            <span className={`ml-2 ${filtroAtivo === filtro.id ? 'text-white/80' : 'text-slate-500'}`}>
              ({filtro.count})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎓 DICAS DE USO

### 1. Sempre use feedback visual
```tsx
// ❌ Sem feedback
<button onClick={salvar}>Salvar</button>

// ✅ Com feedback
<Button variant="primary" isLoading={salvando}>
  Salvar
</Button>
```

### 2. Use empty states
```tsx
// ❌ Lista vazia sem feedback
{itens.length === 0 && <p>Sem dados</p>}

// ✅ Empty state com ação
{itens.length === 0 && (
  <EmptyState
    title="Lista vazia"
    description="Adicione o primeiro item"
    action={{ label: 'Adicionar', onClick: adicionar }}
  />
)}
```

### 3. Loading states consistentes
```tsx
// ✅ Skeleton enquanto carrega
{loading ? <SkeletonCard /> : <MeuCard data={data} />}
```

### 4. Badges com contexto
```tsx
// ✅ Badge com pulse para status ativo
<Badge variant="aberta" pulse>Aberta</Badge>

// ✅ Badge com ícone para notificações
<Badge variant="danger">
  <MessageCircle size={12} />
  3
</Badge>
```

---

**Desenvolvido com 💜 para RBF Motos**  
**Código Premium - Pronto para Produção**
