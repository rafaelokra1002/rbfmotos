// EXEMPLO: Como atualizar OrdensServico.tsx para o tema Cyber
// Este é um template de referência

import { useState } from 'react';
import { CardCyber } from './ui/CardCyber';
import { TableCyber, TableColumn } from './ui/TableCyber';
import { BadgeCyber } from './ui/BadgeCyber';
import { Button } from './ui/Button';
import { InputCyber } from './ui/InputCyber';
import { SelectCyber } from './ui/SelectCyber';
import { ModalCyber, ModalFooterActions } from './ui/ModalCyber';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Calendar,
  Wrench,
  DollarSign
} from 'lucide-react';

interface OrdemServico {
  id: number;
  numero: string;
  cliente: string;
  moto: string;
  status: 'aberto' | 'andamento' | 'concluido' | 'cancelado';
  valor: number;
  data: string;
}

export function OrdensServicoCyber() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([
    {
      id: 1,
      numero: 'OS-2024-001',
      cliente: 'João Silva',
      moto: 'Honda CG 160',
      status: 'andamento',
      valor: 350.00,
      data: '2024-01-15'
    },
    // ... mais ordens
  ]);

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Configuração das colunas da tabela
  const columns: TableColumn<OrdemServico>[] = [
    {
      key: 'numero',
      label: 'ORDEM',
      sortable: true,
      width: '15%',
      render: (value) => (
        <span className="font-bold text-neon-cyan">{value}</span>
      )
    },
    {
      key: 'cliente',
      label: 'CLIENTE',
      sortable: true,
      width: '25%'
    },
    {
      key: 'moto',
      label: 'VEÍCULO',
      sortable: true,
      width: '20%'
    },
    {
      key: 'status',
      label: 'STATUS',
      sortable: true,
      width: '15%',
      render: (status) => {
        const variants = {
          aberto: 'info',
          andamento: 'warning',
          concluido: 'success',
          cancelado: 'error'
        };
        return (
          <BadgeCyber 
            variant={variants[status as keyof typeof variants] as any}
            pulse={status === 'andamento'}
          >
            {status}
          </BadgeCyber>
        );
      }
    },
    {
      key: 'valor',
      label: 'VALOR',
      sortable: true,
      width: '15%',
      render: (value) => (
        <span className="text-neon-green font-mono">
          R$ {value.toFixed(2)}
        </span>
      )
    },
    {
      key: 'data',
      label: 'DATA',
      sortable: true,
      width: '10%',
      render: (value) => new Date(value).toLocaleDateString('pt-BR')
    }
  ];

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
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

      <div className="relative max-w-[1600px] mx-auto space-y-6">
        {/* Header com Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardCyber variant="highlighted" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-neon-cyan/10 rounded-lg border border-neon-cyan/30">
                <FileText className="text-neon-cyan" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-mono">TOTAL</p>
                <p className="text-2xl font-bold text-neon-cyan font-mono">
                  {ordens.length}
                </p>
              </div>
            </div>
          </CardCyber>

          <CardCyber variant="success" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-neon-green/10 rounded-lg border border-neon-green/30">
                <Wrench className="text-neon-green" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-mono">EM_ANDAMENTO</p>
                <p className="text-2xl font-bold text-neon-green font-mono">
                  {ordens.filter(o => o.status === 'andamento').length}
                </p>
              </div>
            </div>
          </CardCyber>

          <CardCyber variant="default" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-neon-purple/10 rounded-lg border border-neon-purple/30">
                <Calendar className="text-neon-purple" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-mono">HOJE</p>
                <p className="text-2xl font-bold text-neon-purple font-mono">3</p>
              </div>
            </div>
          </CardCyber>

          <CardCyber variant="success" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-neon-green/10 rounded-lg border border-neon-green/30">
                <DollarSign className="text-neon-green" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-mono">FATURAMENTO</p>
                <p className="text-xl font-bold text-neon-green font-mono">
                  R$ {ordens.reduce((acc, o) => acc + o.valor, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardCyber>
        </div>

        {/* Filtros e Busca */}
        <CardCyber noPadding>
          <div className="p-4 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1">
                <InputCyber
                  placeholder="BUSCAR_ORDEM..."
                  icon={Search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filtro de Status */}
              <div className="w-full lg:w-64">
                <SelectCyber
                  icon={Filter}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'todos', label: 'Todos Status' },
                    { value: 'aberto', label: 'Aberto' },
                    { value: 'andamento', label: 'Em Andamento' },
                    { value: 'concluido', label: 'Concluído' },
                    { value: 'cancelado', label: 'Cancelado' }
                  ]}
                />
              </div>

              {/* Botão Nova Ordem */}
              <Button
                variant="primary"
                leftIcon={<Plus size={18} />}
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-neon-cyan to-neon-blue"
              >
                NOVA_ORDEM
              </Button>
            </div>
          </div>

          {/* Tabela de Ordens */}
          <TableCyber
            columns={columns}
            data={ordens}
            keyExtractor={(item) => item.id.toString()}
            onRowClick={(ordem) => console.log('Abrir ordem:', ordem)}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            emptyMessage="> NENHUMA_ORDEM_ENCONTRADA"
          />
        </CardCyber>
      </div>

      {/* Modal Nova Ordem */}
      <ModalCyber
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="NOVA_ORDEM_SERVIÇO"
        subtitle="Preencha os dados da nova ordem"
        size="lg"
        footer={
          <ModalFooterActions
            onCancel={() => setShowModal(false)}
            onConfirm={() => {
              // Salvar ordem
              setShowModal(false);
            }}
            confirmText="CRIAR_ORDEM"
          />
        }
      >
        <div className="space-y-4">
          <InputCyber
            label="Cliente"
            placeholder="Selecione o cliente..."
            required
          />
          <InputCyber
            label="Veículo"
            placeholder="Selecione o veículo..."
            required
          />
          <SelectCyber
            label="Status Inicial"
            options={[
              { value: 'aberto', label: 'Aberto' },
              { value: 'andamento', label: 'Em Andamento' }
            ]}
            required
          />
        </div>
      </ModalCyber>
    </div>
  );
}
