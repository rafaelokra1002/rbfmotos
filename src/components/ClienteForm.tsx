import React, { useState, useEffect } from 'react';
import { Cliente } from '../types';
import { X, User, Phone, Mail, MapPin, CreditCard } from 'lucide-react';

interface ClienteFormProps {
  cliente?: Cliente;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cliente: Omit<Cliente, 'id' | 'dataCadastro'>) => void;
}

export function ClienteForm({ cliente, isOpen, onClose, onSave }: ClienteFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    cpf: ''
  });

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome,
        telefone: cliente.telefone,
        email: cliente.email || '',
        endereco: cliente.endereco || '',
        cpf: cliente.cpf || ''
      });
    } else {
      setFormData({
        nome: '',
        telefone: '',
        email: '',
        endereco: '',
        cpf: ''
      });
    }
  }, [cliente, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.telefone) {
      alert('Nome e telefone são obrigatórios');
      return;
    }

    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700/50 max-w-md w-full animate-scaleIn overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-gradient-to-r from-amber-500/10 to-transparent">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-xl transition-all text-slate-400 hover:text-red-400 hover:scale-110 transform"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <User size={16} className="text-amber-400" />
                Nome *
              </div>
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-900 text-slate-100 placeholder:text-slate-500 transition-all hover:border-amber-400"
              placeholder="Nome completo do cliente"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-amber-400" />
                Telefone *
              </div>
            </label>
            <input
              type="tel"
              value={formData.telefone}
              onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-900 text-slate-100 placeholder:text-slate-500 transition-all hover:border-amber-400"
              placeholder="(00) 00000-0000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-amber-400" />
                Email
              </div>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-900 text-slate-100 placeholder:text-slate-500 transition-all hover:border-amber-400"
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-amber-400" />
                CPF
              </div>
            </label>
            <input
              type="text"
              value={formData.cpf}
              onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-900 text-slate-100 placeholder:text-slate-500 transition-all hover:border-amber-400"
              placeholder="000.000.000-00"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-amber-400" />
                Endereço
              </div>
            </label>
            <textarea
              value={formData.endereco}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-900 text-slate-100 placeholder:text-slate-500 transition-all hover:border-amber-400 resize-none"
              rows={2}
              placeholder="Rua, número, bairro, cidade..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 hover:from-amber-400 hover:to-amber-500 rounded-xl transition-all font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transform hover:scale-105 active:scale-95"
            >
              {cliente ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
