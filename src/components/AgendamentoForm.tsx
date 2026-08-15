import { useState } from 'react';
import { X, User, Bike, Clock, Wrench, Plus, Calendar } from 'lucide-react';

interface AgendamentoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dados: any) => void;
  clientes: any[];
  motos: any[];
}

export function AgendamentoForm({ isOpen, onClose, onSave, clientes, motos }: AgendamentoFormProps) {
  const [clienteId, setClienteId] = useState('');
  const [motoId, setMotoId] = useState('');
  const [dataAgendada, setDataAgendada] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [servicos, setServicos] = useState<string[]>([]);
  const [mecanico, setMecanico] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [novoServico, setNovoServico] = useState('');

  const horariosDisponiveis = [
    '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const mecanicosDisponiveis = [
    'João Silva',
    'Pedro Santos',
    'Carlos Oliveira',
    'José Almeida'
  ];

  const motosCliente = motos.filter(m => m.clienteId === clienteId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clienteId || !dataAgendada || !horaInicio || servicos.length === 0) {
      alert('Preencha todos os campos obrigatórios (Cliente, Data, Hora e Serviços)');
      return;
    }

    onSave({
      clienteId,
      motoId: motoId || '', // Permite vazio se não houver moto selecionada
      dataAgendada,
      horaInicio,
      horaFim: `${parseInt(horaInicio.split(':')[0]) + 1}:00`,
      servicos: JSON.stringify(servicos),
      mecanico,
      status: 'agendado',
      observacoes
    });

    // Limpar formulário
    setClienteId('');
    setMotoId('');
    setDataAgendada('');
    setHoraInicio('');
    setServicos([]);
    setMecanico('');
    setObservacoes('');
    setNovoServico('');
  };

  const toggleServico = (servico: string) => {
    setServicos(prev => 
      prev.includes(servico)
        ? prev.filter(s => s !== servico)
        : [...prev, servico]
    );
  };

  const adicionarServicoCustomizado = () => {
    if (novoServico.trim() && !servicos.includes(novoServico.trim())) {
      setServicos([...servicos, novoServico.trim()]);
      setNovoServico('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-strong dark:shadow-black/40 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-5 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-yellow-400 tracking-tight">Novo Agendamento</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors hover:scale-110 transform duration-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <User size={18} className="text-yellow-600 dark:text-yellow-400" />
                Cliente *
              </div>
            </label>
            <select
              value={clienteId}
              onChange={(e) => {
                setClienteId(e.target.value);
                setMotoId('');
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all hover:border-yellow-400"
              required
            >
              <option value="">Selecione o cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} - {cliente.telefone}
                </option>
              ))}
            </select>
          </div>

          {/* Moto */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Bike size={18} className="text-yellow-600 dark:text-yellow-400" />
                Moto (opcional)
              </div>
            </label>
            <select
              value={motoId}
              onChange={(e) => setMotoId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all hover:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!clienteId}
            >
              <option value="">Sem moto específica</option>
              {motosCliente.map(moto => (
                <option key={moto.id} value={moto.id}>
                  {moto.marca} {moto.modelo} - {moto.placa}
                </option>
              ))}
            </select>
            {clienteId && motosCliente.length === 0 && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Cliente não possui motos cadastradas
              </p>
            )}
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-yellow-600 dark:text-yellow-400" />
                  Data *
                </div>
              </label>
              <input
                type="date"
                value={dataAgendada}
                onChange={(e) => setDataAgendada(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all hover:border-yellow-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-yellow-600 dark:text-yellow-400" />
                  Horário *
                </div>
              </label>
              <select
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all hover:border-yellow-400"
                required
              >
                <option value="">Selecione</option>
                {horariosDisponiveis.map(hora => (
                  <option key={hora} value={hora}>{hora}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Serviços */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Wrench size={18} className="text-yellow-600 dark:text-yellow-400" />
                Serviços *
              </div>
            </label>
            
            {/* Campo para adicionar serviço */}
            <div className="flex gap-3">
              <input
                type="text"
                value={novoServico}
                onChange={(e) => setNovoServico(e.target.value)}
                placeholder="Digite um serviço e pressione Enter ou clique em Adicionar..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all hover:border-yellow-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    adicionarServicoCustomizado();
                  }
                }}
              />
              <button
                type="button"
                onClick={adicionarServicoCustomizado}
                className="px-5 py-3 bg-yellow-500 dark:bg-yellow-600 text-black dark:text-white font-semibold rounded-xl hover:bg-yellow-600 dark:hover:bg-yellow-700 shadow-soft hover:shadow-medium transition-all flex items-center gap-2 transform hover:scale-105"
              >
                <Plus size={18} />
                Adicionar
              </button>
            </div>

            {/* Serviços selecionados */}
            {servicos.length > 0 && (
              <div className="bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse-slow"></span>
                  Serviços selecionados ({servicos.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {servicos.map(servico => (
                    <span
                      key={servico}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 rounded-full text-sm font-medium shadow-soft hover:shadow-medium transition-all"
                    >
                      {servico}
                      <button
                        type="button"
                        onClick={() => toggleServico(servico)}
                        className="hover:text-red-600 dark:hover:text-red-400 transition-colors hover:scale-110 transform"
                      >
                        <X size={16} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mecânico */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <User size={18} className="text-yellow-600 dark:text-yellow-400" />
              Mecânico Responsável
            </label>
            <select
              value={mecanico}
              onChange={(e) => setMecanico(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all hover:border-yellow-400"
            >
              <option value="">A definir</option>
              {mecanicosDisponiveis.map(mec => (
                <option key={mec} value={mec}>{mec}</option>
              ))}
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Observações
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all hover:border-yellow-400 resize-none"
              placeholder="Informações adicionais sobre o agendamento..."
            />
          </div>

          {/* Botões */}
          <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl shadow-soft hover:shadow-medium transition-all transform hover:scale-105"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-yellow-500 dark:bg-yellow-600 text-black dark:text-white font-bold hover:bg-yellow-600 dark:hover:bg-yellow-700 rounded-xl shadow-medium hover:shadow-strong transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <Calendar size={18} />
              Agendar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
