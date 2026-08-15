import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Bike,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { AgendamentoForm } from './AgendamentoForm';
import { useOficinaData } from '../hooks/useOficinaData';

interface Agendamento {
  id: string;
  clienteId: string;
  motoId: string;
  clienteNome: string;
  clienteTelefone: string;
  motoDescricao: string;
  dataAgendada: string;
  horaInicio: string;
  horaFim: string;
  servicos: string[];
  mecanico?: string;
  status: string;
  observacoes?: string;
}

const statusConfig = {
  agendado: {
    label: 'Agendado',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
    dot: 'bg-blue-500',
    icon: Clock,
  },
  confirmado: {
    label: 'Confirmado',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
    dot: 'bg-emerald-500',
    icon: CheckCircle,
  },
  em_atendimento: {
    label: 'Em Atendimento',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
    dot: 'bg-amber-500',
    icon: AlertCircle,
  },
  concluido: {
    label: 'Concluído',
    badge: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
    dot: 'bg-slate-400',
    icon: CheckCircle,
  },
  cancelado: {
    label: 'Cancelado',
    badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
    dot: 'bg-red-500',
    icon: XCircle,
  },
} as const;

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Normaliza data (aceita 'YYYY-MM-DD' ou ISO completo) para 'YYYY-MM-DD'
const toDateKey = (value: string) => String(value).split('T')[0];
const dateKeyFromParts = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export function Agendamentos() {
  const { clientes, motos } = useOficinaData();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [showForm, setShowForm] = useState(false);

  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const carregarAgendamentos = async () => {
    try {
      const response = await fetch('/api/agendamentos');
      if (response.ok) {
        const data = await response.json();
        setAgendamentos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  };

  const handleSaveAgendamento = async (dados: any) => {
    try {
      const cliente = clientes.find((c) => c.id === dados.clienteId);
      const moto = motos.find((m) => m.id === dados.motoId);

      if (!cliente || !moto) {
        alert('Cliente ou moto não encontrado!');
        return;
      }

      const agendamentoData = {
        clienteId: dados.clienteId,
        motoId: dados.motoId,
        dataAgendada: dados.dataAgendada,
        horaInicio: dados.horaInicio,
        horaFim: dados.horaFim,
        servicos: typeof dados.servicos === 'string' ? dados.servicos : JSON.stringify(dados.servicos),
        mecanico: dados.mecanico || null,
        status: dados.status || 'agendado',
        observacoes: dados.observacoes || null,
      };

      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agendamentoData),
      });

      if (!response.ok) throw new Error('Erro ao salvar agendamento');

      await carregarAgendamentos();
      setShowForm(false);
      alert('Agendamento criado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar agendamento:', error);
      alert('Erro ao salvar agendamento. Verifique o console.');
    }
  };

  // Agendamentos agrupados por dia (chave 'YYYY-MM-DD')
  const porDia = agendamentos.reduce<Record<string, Agendamento[]>>((acc, a) => {
    const key = toDateKey(a.dataAgendada);
    (acc[key] ||= []).push(a);
    return acc;
  }, {});

  const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay();
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const hojeKey = dateKeyFromParts(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  const celulas: (number | null)[] = [
    ...Array.from({ length: primeiroDiaSemana }, () => null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];

  const mudarMes = (delta: number) => {
    let novoMes = mesAtual + delta;
    let novoAno = anoAtual;
    if (novoMes < 0) { novoMes = 11; novoAno -= 1; }
    if (novoMes > 11) { novoMes = 0; novoAno += 1; }
    setMesAtual(novoMes);
    setAnoAtual(novoAno);
  };

  const irParaHoje = () => {
    setMesAtual(hoje.getMonth());
    setAnoAtual(hoje.getFullYear());
  };

  const totalMes = celulas
    .filter((d): d is number => d !== null)
    .reduce((sum, d) => sum + (porDia[dateKeyFromParts(anoAtual, mesAtual, d)]?.length || 0), 0);

  const agendamentosDoDia = diaSelecionado ? (porDia[diaSelecionado] || []) : [];
  const agendamentosDoDiaOrdenados = [...agendamentosDoDia].sort((a, b) =>
    (a.horaInicio || '').localeCompare(b.horaInicio || '')
  );

  const formatarDataLonga = (key: string) => {
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const parseServicos = (servicos: any): string[] => {
    try {
      return typeof servicos === 'string' ? JSON.parse(servicos) : servicos || [];
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            Agendamentos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {agendamentos.length} agendamentos no total
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors w-full sm:w-auto"
        >
          <Plus size={18} />
          <span>Novo Agendamento</span>
        </button>
      </div>

      <AgendamentoForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSaveAgendamento}
        clientes={clientes}
        motos={motos}
      />

      {/* Calendário */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Barra de navegação do mês */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-slate-400" />
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 capitalize">
              {MESES[mesAtual]} {anoAtual}
            </h2>
            <span className="hidden sm:inline-flex items-center text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/15 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/30">
              {totalMes} no mês
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={irParaHoje}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors mr-1"
            >
              Hoje
            </button>
            <button
              onClick={() => mudarMes(-1)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Mês anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => mudarMes(1)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Próximo mês"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
          {DIAS_SEMANA.map((dia) => (
            <div
              key={dia}
              className="py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide"
            >
              <span className="sm:hidden">{dia[0]}</span>
              <span className="hidden sm:inline">{dia}</span>
            </div>
          ))}
        </div>

        {/* Grade de dias */}
        <div className="grid grid-cols-7">
          {celulas.map((dia, idx) => {
            if (dia === null) {
              return <div key={`empty-${idx}`} className="min-h-[72px] sm:min-h-[104px] border-b border-r border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/20" />;
            }

            const key = dateKeyFromParts(anoAtual, mesAtual, dia);
            const doDia = porDia[key] || [];
            const isHoje = key === hojeKey;

            return (
              <button
                key={key}
                onClick={() => setDiaSelecionado(key)}
                className={`
                  min-h-[72px] sm:min-h-[104px] border-b border-r border-slate-100 dark:border-slate-700/50 p-1.5 sm:p-2 text-left
                  transition-colors relative group
                  hover:bg-blue-50 dark:hover:bg-slate-700/40
                  ${doDia.length > 0 ? 'bg-white dark:bg-slate-800' : 'bg-white dark:bg-slate-800'}
                `}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`
                      inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs sm:text-sm font-medium
                      ${isHoje
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400'}
                    `}
                  >
                    {dia}
                  </span>
                  {doDia.length > 0 && (
                    <span className="hidden sm:inline text-[10px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/15 px-1.5 py-0.5 rounded-full">
                      {doDia.length}
                    </span>
                  )}
                </div>

                {/* Prévia dos agendamentos (desktop) */}
                <div className="hidden sm:block mt-1 space-y-1">
                  {doDia.slice(0, 2).map((a) => {
                    const cfg = statusConfig[a.status as keyof typeof statusConfig] || statusConfig.agendado;
                    const cliente = clientes.find((c) => c.id === a.clienteId);
                    return (
                      <div key={a.id} className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded border ${cfg.badge} truncate`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
                        <span className="truncate">{a.horaInicio} {cliente?.nome || ''}</span>
                      </div>
                    );
                  })}
                  {doDia.length > 2 && (
                    <div className="text-[10px] text-slate-400 pl-1">+{doDia.length - 2} mais</div>
                  )}
                </div>

                {/* Indicador (mobile) */}
                {doDia.length > 0 && (
                  <div className="sm:hidden flex items-center gap-0.5 mt-1">
                    {doDia.slice(0, 3).map((a) => {
                      const cfg = statusConfig[a.status as keyof typeof statusConfig] || statusConfig.agendado;
                      return <span key={a.id} className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />;
                    })}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
        {Object.entries(statusConfig).map(([k, cfg]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </div>
        ))}
      </div>

      {/* Painel suspenso (drawer) do dia selecionado */}
      {diaSelecionado && (
        <DayDrawer
          dateKey={diaSelecionado}
          titulo={formatarDataLonga(diaSelecionado)}
          agendamentos={agendamentosDoDiaOrdenados}
          clientes={clientes}
          motos={motos}
          parseServicos={parseServicos}
          onClose={() => setDiaSelecionado(null)}
          onNovo={() => {
            setDiaSelecionado(null);
            setShowForm(true);
          }}
        />
      )}
    </div>
  );
}

interface DayDrawerProps {
  dateKey: string;
  titulo: string;
  agendamentos: Agendamento[];
  clientes: any[];
  motos: any[];
  parseServicos: (s: any) => string[];
  onClose: () => void;
  onNovo: () => void;
}

function DayDrawer({ titulo, agendamentos, clientes, motos, parseServicos, onClose, onNovo }: DayDrawerProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Painel */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Agenda do dia</p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 capitalize mt-0.5">{titulo}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {agendamentos.length} {agendamentos.length === 1 ? 'agendamento' : 'agendamentos'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {agendamentos.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhum agendamento neste dia</p>
            </div>
          ) : (
            agendamentos.map((a) => {
              const cfg = statusConfig[a.status as keyof typeof statusConfig] || statusConfig.agendado;
              const StatusIcon = cfg.icon;
              const cliente = clientes.find((c) => c.id === a.clienteId);
              const moto = motos.find((m) => m.id === a.motoId);
              const servicos = parseServicos(a.servicos);

              return (
                <div
                  key={a.id}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold">
                      <Clock size={15} className="text-slate-400" />
                      {a.horaInicio}{a.horaFim ? ` – ${a.horaFim}` : ''}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.badge}`}>
                      <StatusIcon size={12} />
                      {cfg.label}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <User size={14} className="text-slate-400 flex-shrink-0" />
                      <span className="font-medium">{cliente?.nome || a.clienteNome || 'Cliente'}</span>
                      {cliente?.telefone && <span className="text-slate-400">· {cliente.telefone}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Bike size={14} className="text-slate-400 flex-shrink-0" />
                      <span>{moto ? `${moto.marca} ${moto.modelo} · ${moto.placa}` : 'Sem moto específica'}</span>
                    </div>
                  </div>

                  {servicos.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {servicos.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {a.mecanico && (
                    <div className="flex items-center gap-1.5 mt-3 text-sm text-slate-500 dark:text-slate-400">
                      <span>👨‍🔧</span>
                      <span className="font-medium">{a.mecanico}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onNovo}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            Novo agendamento
          </button>
        </div>
      </div>
    </div>
  );
}
