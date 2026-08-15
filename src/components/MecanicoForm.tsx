import { useState, useEffect } from 'react';
import { X, User, Phone, Mail, CreditCard, Wrench, DollarSign, CheckCircle, FileText } from 'lucide-react';

interface Mecanico {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  cpf?: string;
  especialidade?: string;
  salario?: number;
  dataAdmissao: string;
  status: string;
  observacoes?: string;
}

interface MecanicoFormProps {
  mecanico?: Mecanico;
  isOpen: boolean;
  onClose: () => void;
  onSave: (dados: Omit<Mecanico, 'id' | 'dataAdmissao'>) => void;
}

export function MecanicoForm({ mecanico, isOpen, onClose, onSave }: MecanicoFormProps) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [salario, setSalario] = useState('');
  const [status, setStatus] = useState('ativo');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (mecanico) {
      setNome(mecanico.nome);
      setTelefone(mecanico.telefone);
      setEmail(mecanico.email || '');
      setCpf(mecanico.cpf || '');
      setEspecialidade(mecanico.especialidade || '');
      setSalario(mecanico.salario?.toString() || '');
      setStatus(mecanico.status);
      setObservacoes(mecanico.observacoes || '');
    } else {
      setNome('');
      setTelefone('');
      setEmail('');
      setCpf('');
      setEspecialidade('');
      setSalario('');
      setStatus('ativo');
      setObservacoes('');
    }
  }, [mecanico, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      nome,
      telefone,
      email: email || undefined,
      cpf: cpf || undefined,
      especialidade: especialidade || undefined,
      salario: salario ? parseFloat(salario) : undefined,
      status,
      observacoes: observacoes || undefined
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {mecanico ? 'Editar Mecânico' : 'Novo Mecânico'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
          >
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nome Completo */}
            <div className="col-span-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                Nome Completo *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300"
                placeholder="Ex: João da Silva"
                required
              />
            </div>

            {/* Telefone */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                Telefone *
              </label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300"
                placeholder="(11) 98765-4321"
                required
              />
            </div>

            {/* Email */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300"
                placeholder="email@exemplo.com"
              />
            </div>

            {/* CPF */}
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                CPF
              </label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300"
                placeholder="000.000.000-00"
              />
            </div>

            {/* Especialidade */}
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                Especialidade
              </label>
              <select
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300"
              >
                <option value="">Selecione</option>
                <option value="mecanica_geral">Mecânica Geral</option>
                <option value="eletrica">Elétrica</option>
                <option value="suspensao">Suspensão</option>
                <option value="motor">Motor</option>
                <option value="freios">Freios</option>
              </select>
            </div>

            {/* Salário */}
            <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                Salário
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={salario}
                  onChange={(e) => setSalario(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Status */}
            <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300"
                required
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="ferias">Férias</option>
              </select>
            </div>

            {/* Observações */}
            <div className="col-span-2 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                Observações
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-300 resize-none"
                placeholder="Informações adicionais..."
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 font-semibold hover:scale-105"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white rounded-xl transition-all duration-200 font-semibold hover:shadow-lg hover:scale-105 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700"
            >
              {mecanico ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
