import React, { useState, useEffect } from 'react';
import { useOficinaData } from '../hooks/useOficinaData';
import { ClienteForm } from './ClienteForm';
import { Moto, Cliente } from '../types';
import { X, Plus, UserPlus, Bike, Hash, Calendar, Palette, Gauge } from 'lucide-react';

interface MotoFormProps {
  clienteId: string;
  moto?: Moto;
  isOpen: boolean;
  onClose: () => void;
  onSave: (moto: Omit<Moto, 'id'>) => void;
}

export function MotoForm({ clienteId, moto, isOpen, onClose, onSave }: MotoFormProps) {
  const { clientes, adicionarCliente } = useOficinaData();
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [formData, setFormData] = useState({
    clienteId: clienteId,
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    placa: '',
    cor: '',
    km: '',
    observacoes: ''
  });

  useEffect(() => {
    if (moto) {
      setFormData({
        clienteId: moto.clienteId,
        marca: moto.marca,
        modelo: moto.modelo,
        ano: moto.ano,
        placa: moto.placa,
        cor: moto.cor,
        km: moto.km?.toString() || '',
        observacoes: moto.observacoes || ''
      });
    } else {
      setFormData({
        clienteId: clienteId,
        marca: '',
        modelo: '',
        ano: new Date().getFullYear(),
        placa: '',
        cor: '',
        km: '',
        observacoes: ''
      });
    }
  }, [moto, isOpen, clienteId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clienteId || !formData.marca || !formData.modelo || !formData.placa) {
      alert('Cliente, marca, modelo e placa são obrigatórios');
      return;
    }

    // Validação básica da placa
    const placaLimpa = formData.placa.replace(/[^A-Z0-9]/g, '');
    if (placaLimpa.length < 7) {
      alert('Placa deve ter pelo menos 7 caracteres');
      return;
    }

    const dadosMoto: Omit<Moto, 'id'> = {
      clienteId: formData.clienteId,
      marca: formData.marca.trim(),
      modelo: formData.modelo.trim(),
      ano: formData.ano,
      placa: placaLimpa,
      cor: formData.cor.trim(),
      km: formData.km ? parseInt(formData.km) : undefined,
      observacoes: formData.observacoes.trim() || undefined
    };

    onSave(dadosMoto);
    onClose();
  };

  const handleSaveCliente = async (dadosCliente: Omit<Cliente, 'id' | 'dataCadastro'>) => {
    const novoCliente = await adicionarCliente(dadosCliente);
    setFormData(prev => ({ ...prev, clienteId: novoCliente.id }));
    setShowClienteForm(false);
  };

  const formatPlaca = (value: string) => {
    // Converte para maiúsculo PRIMEIRO e depois remove não alfanuméricos
    // (senão letras minúsculas seriam apagadas antes de virar maiúsculas)
    const limpo = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Aplica formatação ABC-1234 ou ABC1D23 (Mercosul)
    if (limpo.length <= 3) {
      return limpo;
    } else if (limpo.length <= 7) {
      return limpo.slice(0, 3) + '-' + limpo.slice(3);
    } else {
      return limpo.slice(0, 3) + '-' + limpo.slice(3, 7);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 max-w-md w-full animate-scaleIn overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-gradient-to-r from-amber-500/10 to-slate-800">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            {moto ? 'Editar Moto' : 'Nova Moto'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-xl transition-all text-slate-400 hover:text-red-400 hover:scale-110 transform"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Cliente - só mostra se não foi passado clienteId */}
          {!clienteId && (
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <UserPlus size={16} className="text-amber-400" />
                  Cliente *
                </div>
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.clienteId}
                  onChange={(e) => setFormData(prev => ({ ...prev, clienteId: e.target.value }))}
                  className="flex-1 px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 bg-slate-900 text-slate-100 transition-all hover:border-amber-400/50 appearance-none cursor-pointer"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome} - {cliente.telefone}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowClienteForm(true)}
                  className="px-3 py-3 bg-amber-500 text-slate-900 hover:bg-amber-400 rounded-xl transition-all shadow-md shadow-amber-500/30 flex items-center gap-1 transform hover:scale-105"
                  title="Cadastrar novo cliente"
                >
                  <UserPlus size={18} />
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <Bike size={16} className="text-amber-400" />
                  Marca *
                </div>
              </label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 bg-slate-900 text-slate-100 placeholder:text-slate-500 transition-all hover:border-amber-400/50"
                placeholder="Honda, Yamaha..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <Bike size={16} className="text-amber-400" />
                  Modelo *
                </div>
              </label>
              <input
                type="text"
                value={formData.modelo}
                onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 bg-slate-900 text-slate-100 placeholder:text-slate-500 transition-all hover:border-amber-400/50"
                placeholder="CG 160, XTZ 250..."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-amber-400" />
                  Ano *
                </div>
              </label>
              <input
                type="number"
                min="1980"
                max={new Date().getFullYear() + 1}
                value={formData.ano}
                onChange={(e) => setFormData(prev => ({ ...prev, ano: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 bg-slate-900 text-slate-100 transition-all hover:border-amber-400/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <Hash size={16} className="text-amber-400" />
                  Placa *
                </div>
              </label>
              <input
                type="text"
                value={formData.placa}
                onChange={(e) => setFormData(prev => ({ ...prev, placa: formatPlaca(e.target.value) }))}
                className="w-full px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 bg-slate-900 text-slate-100 placeholder:text-slate-500 transition-all hover:border-amber-400/50 uppercase"
                placeholder="ABC-1234"
                maxLength={8}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <Palette size={16} className="text-amber-400" />
                  Cor
                </div>
              </label>
              <input
                type="text"
                value={formData.cor}
                onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 bg-slate-900 text-slate-100 placeholder:text-slate-500 transition-all hover:border-amber-400/50"
                placeholder="Vermelha, Preta..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <Gauge size={16} className="text-amber-400" />
                  Quilometragem
                </div>
              </label>
              <input
                type="number"
                min="0"
                value={formData.km}
                onChange={(e) => setFormData(prev => ({ ...prev, km: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 bg-slate-900 text-slate-100 placeholder:text-slate-500 transition-all hover:border-amber-400/50"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 bg-slate-900 text-slate-100 placeholder:text-slate-500 transition-all hover:border-amber-400/50 resize-none"
              rows={3}
              placeholder="Informações adicionais sobre a moto, modificações, histórico..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 hover:from-amber-400 hover:to-amber-500 rounded-xl transition-all font-bold shadow-lg shadow-amber-500/30 transform hover:scale-105"
            >
              {moto ? 'Atualizar' : 'Cadastrar'} Moto
            </button>
          </div>
        </form>
      </div>

      <ClienteForm
        isOpen={showClienteForm}
        onClose={() => setShowClienteForm(false)}
        onSave={handleSaveCliente}
      />
    </div>
  );
}
