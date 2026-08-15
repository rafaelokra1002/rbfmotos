import { useState } from 'react';
import { DollarSign, CreditCard, Smartphone, Banknote, QrCode, Download } from 'lucide-react';

interface PagamentoModalProps {
  ordemServico: {
    numero: string;
    valorTotal: number;
    valorPago: number;
  };
  onClose: () => void;
  onPagamento: (dados: any) => void;
}

export function PagamentoModal({ ordemServico, onClose, onPagamento }: PagamentoModalProps) {
  const [tipoPagamento, setTipoPagamento] = useState('pix');
  const [valor, setValor] = useState(ordemServico.valorTotal - ordemServico.valorPago);
  const [parcelas, setParcelas] = useState(1);
  const [pixGerado, setPixGerado] = useState(false);

  const tiposPagamento = [
    { id: 'pix', label: 'PIX', icon: Smartphone, color: 'bg-cyan-100 text-cyan-700' },
    { id: 'dinheiro', label: 'Dinheiro', icon: Banknote, color: 'bg-green-100 text-green-700' },
    { id: 'cartao_debito', label: 'Débito', icon: CreditCard, color: 'bg-blue-100 text-blue-700' },
    { id: 'cartao_credito', label: 'Crédito', icon: CreditCard, color: 'bg-purple-100 text-purple-700' }
  ];

  const handleGerarPix = () => {
    setPixGerado(true);
    // Aqui seria integrado com API PIX real
  };

  const handleConfirmarPagamento = () => {
    onPagamento({
      tipo: tipoPagamento,
      valor,
      parcelas: tipoPagamento === 'cartao_credito' ? parcelas : 1,
      dataPagamento: new Date()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Registrar Pagamento</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">OS: {ordemServico.numero}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Resumo de Valores */}
          <div className="bg-gray-50 dark:bg-dark-hover rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 dark:text-gray-400">Valor Total</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">R$ {ordemServico.valorTotal.toFixed(2)}</span>
            </div>
            {ordemServico.valorPago > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Já Pago</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">- R$ {ordemServico.valorPago.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-dark-border">
              <span className="text-gray-700 dark:text-gray-300 font-semibold">Restante</span>
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                R$ {(ordemServico.valorTotal - ordemServico.valorPago).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Tipos de Pagamento */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Forma de Pagamento</label>
            <div className="grid grid-cols-2 gap-3">
              {tiposPagamento.map(tipo => {
                const Icon = tipo.icon;
                return (
                  <button
                    key={tipo.id}
                    onClick={() => setTipoPagamento(tipo.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      tipoPagamento === tipo.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20'
                        : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${tipo.color}`}>
                        <Icon size={20} />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{tipo.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Valor do Pagamento */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valor a Pagar</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">R$</span>
              <input
                type="number"
                value={valor}
                onChange={(e) => setValor(parseFloat(e.target.value))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border dark:bg-dark-hover dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step="0.01"
              />
            </div>
          </div>

          {/* Parcelas para Cartão de Crédito */}
          {tipoPagamento === 'cartao_credito' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Número de Parcelas</label>
              <select
                value={parcelas}
                onChange={(e) => setParcelas(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border dark:bg-dark-hover dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 10, 12].map(n => (
                  <option key={n} value={n}>
                    {n}x de R$ {(valor / n).toFixed(2)} {n === 1 ? '(à vista)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* QR Code PIX */}
          {tipoPagamento === 'pix' && pixGerado && (
            <div className="mb-6 bg-gray-50 dark:bg-dark-hover rounded-lg p-6 text-center">
              <div className="inline-block p-4 bg-white dark:bg-dark-card rounded-lg border-2 border-blue-500 mb-4">
                <QrCode size={200} className="text-gray-900 dark:text-white" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Escaneie o QR Code com seu aplicativo de banco</p>
              <div className="flex gap-2 justify-center">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-white rounded-lg text-sm">
                  <Download size={16} />
                  Baixar QR Code
                </button>
              </div>
              <div className="mt-4 p-3 bg-white dark:bg-dark-card rounded border border-gray-200 dark:border-dark-border">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Chave PIX (Copiar)</p>
                <code className="text-sm font-mono break-all dark:text-gray-300">00020126580014br.gov.bcb.pix...</code>
              </div>
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="p-6 border-t border-gray-200 dark:border-dark-border flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
          {tipoPagamento === 'pix' && !pixGerado ? (
            <button
              onClick={handleGerarPix}
              className="flex items-center gap-2 px-6 py-2 bg-white dark:bg-gray-700 text-black dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <QrCode size={20} />
              Gerar QR Code
            </button>
          ) : (
            <button
              onClick={handleConfirmarPagamento}
              className="flex items-center gap-2 px-6 py-2 bg-white dark:bg-gray-700 text-black dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <DollarSign size={20} />
              Confirmar Pagamento
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
