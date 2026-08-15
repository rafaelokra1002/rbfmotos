import React, { useState, useEffect } from 'react';

interface CadastroDividaFormProps {
  onSubmit: (data: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface Categoria {
  id: string;
  nome: string;
  tipo: string;
}

const frequencias = [
  { label: 'Mensal (30 dias)', value: 'MENSAL', dias: 30 },
  { label: 'Quinzenal (15 dias)', value: 'QUINZENAL', dias: 15 },
  { label: 'Semanal (7 dias)', value: 'SEMANAL', dias: 7 },
];

export function CadastroDividaForm({ onSubmit, isOpen, onClose }: CadastroDividaFormProps) {
  const [valorTotal, setValorTotal] = useState('');
  const [valorParcela, setValorParcela] = useState('');
  const [frequencia, setFrequencia] = useState(frequencias[0].value);
  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Buscar categorias de despesa do backend
  useEffect(() => {
    if (isOpen) {
      const API_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:9001/api'
        : `http://${window.location.hostname}:9001/api`;
      fetch(`${API_URL}/financeiro/categorias?tipo=DESPESA`)
        .then(res => res.json())
        .then(data => {
          // Garantir que é array
          if (Array.isArray(data)) {
            setCategorias(data);
            if (data.length > 0) setCategoriaId(data[0].id);
          } else {
            setCategorias([]);
          }
        })
        .catch(() => setCategorias([]));
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      valorTotal: parseFloat(valorTotal),
      valorParcela: parseFloat(valorParcela),
      frequencia,
      descricao,
      categoriaId,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl w-full max-w-md space-y-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Cadastrar Dívida Parcelada</h2>
        {categorias.length === 0 ? (
          <div className="text-center text-amber-500 py-8">
            <p className="font-semibold">Nenhuma categoria de despesa cadastrada.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Cadastre uma categoria antes de adicionar dívidas.</p>
            <button type="button" onClick={onClose} className="mt-6 px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">Fechar</button>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Descrição</label>
              <input type="text" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100" value={descricao} onChange={e => setDescricao(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Categoria</label>
              <select className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100" value={categoriaId} onChange={e => setCategoriaId(e.target.value)} required>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Valor Total da Dívida</label>
              <input type="number" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100" value={valorTotal} onChange={e => setValorTotal(e.target.value)} required min="0" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Valor da Parcela</label>
              <input type="number" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100" value={valorParcela} onChange={e => setValorParcela(e.target.value)} required min="0" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Frequência de Pagamento</label>
              <select className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100" value={frequencia} onChange={e => setFrequencia(e.target.value)}>
                {frequencias.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">Cancelar</button>
              <button type="submit" className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-purple-500 text-white font-bold shadow hover:from-orange-600 hover:to-purple-600">Salvar</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
