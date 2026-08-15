import { useEffect, useMemo, useState } from 'react';
import { useOficinaData } from '../hooks/useOficinaData';
import { Moto, Cliente } from '../types';
import { X, Download, FileText, Calendar, Wrench, DollarSign, Image as ImageIcon, Send, CheckCircle } from 'lucide-react';
import { generateMotoHistoricoPDF } from '../lib/pdfGenerator';
import { sendWhatsAppMessage } from '../lib/whatsapp';
import { Button } from './ui/Button';
import { Badge, StatusBadge } from './ui/Badge';
import { Loading } from './ui/Loading';

interface HistoricoMotoProps {
  moto: Moto;
  cliente: Cliente;
  isOpen: boolean;
  onClose: () => void;
}

export function HistoricoMoto({ moto, cliente, isOpen, onClose }: HistoricoMotoProps) {
  const { ordens, loading, carregarOrdemComFotos } = useOficinaData();
  const [gerandoPDF, setGerandoPDF] = useState(false);
  const [ordensSelecionadas, setOrdensSelecionadas] = useState<string[]>([]);
  const [loadingFotos, setLoadingFotos] = useState(false);

  // Debug: Log para verificar dados
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 HistoricoMoto - Debug:', {
        motoId: moto.id,
        totalOrdens: ordens.length,
        ordensDessaMoto: ordens.filter(o => o.motoId === moto.id).length,
        primeiraOrdem: ordens[0],
      });
    }
  }, [isOpen, ordens, moto.id]);

  // Filtrar ordens desta moto (memoizado para evitar recomputar em cada render)
  const ordensHistorico = useMemo(() => {
    return ordens
      .filter(ordem => ordem.motoId === moto.id)
      .slice()
      .sort((a, b) => new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime());
  }, [ordens, moto.id]);

  // Carregar fotos quando abrir o modal
  useEffect(() => {
    if (isOpen && ordensHistorico.length > 0 && carregarOrdemComFotos) {
      const carregarTodasFotos = async () => {
        setLoadingFotos(true);
        console.log('📸 Carregando fotos das ordens...');
        
        // Carregar fotos de todas as ordens desta moto
        const promises = ordensHistorico.map(ordem => 
          (!ordem.fotos || ordem.fotos.length === 0) && ordem.fotoCount && ordem.fotoCount > 0
            ? carregarOrdemComFotos(ordem.id)
            : Promise.resolve(null)
        );
        
        await Promise.all(promises);
        setLoadingFotos(false);
        console.log('✅ Fotos carregadas!');
      };
      
      carregarTodasFotos();
    }
  }, [isOpen, ordensHistorico, carregarOrdemComFotos]);

  // Inicializar seleção quando abrir (NUNCA fazer setState durante render)
  useEffect(() => {
    if (!isOpen) return;
    if (ordensHistorico.length === 0) {
      if (ordensSelecionadas.length !== 0) setOrdensSelecionadas([]);
      return;
    }
    // Se abriu o modal e não tem seleção ainda, seleciona todas
    if (ordensSelecionadas.length === 0) {
      setOrdensSelecionadas(ordensHistorico.map(o => o.id));
    }
  }, [isOpen, ordensHistorico, ordensSelecionadas.length]);

  // Estatísticas baseadas nas ordens selecionadas (memoizadas)
  const ordensFiltradas = useMemo(
    () => ordensHistorico.filter(o => ordensSelecionadas.includes(o.id)),
    [ordensHistorico, ordensSelecionadas]
  );

  const { totalServicos, valorTotal, ultimaRevisao, todasFotos } = useMemo(() => {
    const totalServicosCalc = ordensFiltradas.length;
    const valorTotalCalc = ordensFiltradas.reduce((sum, ordem) => sum + (ordem.valorTotal || 0), 0);
    const ultimaRevisaoCalc = ordensFiltradas.find(o => o.status === 'entregue');
    const todasFotosCalc = ordensFiltradas.flatMap(ordem => ordem.fotos || []);

    return {
      totalServicos: totalServicosCalc,
      valorTotal: valorTotalCalc,
      ultimaRevisao: ultimaRevisaoCalc,
      todasFotos: todasFotosCalc,
    };
  }, [ordensFiltradas]);

  const toggleOrdem = (ordemId: string) => {
    setOrdensSelecionadas(prev => 
      prev.includes(ordemId)
        ? prev.filter(id => id !== ordemId)
        : [...prev, ordemId]
    );
  };

  const selecionarTodas = () => {
    setOrdensSelecionadas(ordensHistorico.map(o => o.id));
  };

  const deselecionarTodas = () => {
    setOrdensSelecionadas([]);
  };

  const handleGerarPDF = async () => {
    if (ordensSelecionadas.length === 0) {
      alert('Selecione pelo menos uma ordem de serviço!');
      return;
    }

    setGerandoPDF(true);
    try {
      const pdfBlob = await generateMotoHistoricoPDF(moto, cliente, ordensFiltradas);
      
      // Download do PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Historico_${moto.marca}_${moto.modelo}_${moto.placa}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setGerandoPDF(false);
    }
  };

  const handleEnviarWhatsApp = async () => {
    if (ordensSelecionadas.length === 0) {
      alert('Selecione pelo menos uma ordem de serviço!');
      return;
    }

    setGerandoPDF(true);
    try {
      const pdfBlob = await generateMotoHistoricoPDF(moto, cliente, ordensFiltradas);
      
      // Converter blob para base64
      const reader = new FileReader();
      reader.onloadend = () => {
        // Mensagem para WhatsApp
        const mensagem = `📋 *HISTÓRICO DE MANUTENÇÃO*\n\n` +
          `🏍️ *Moto:* ${moto.marca} ${moto.modelo}\n` +
          `📋 *Placa:* ${moto.placa}\n` +
          `📅 *Ano:* ${moto.ano}\n\n` +
          `✅ Total de Serviços: ${totalServicos}\n` +
          `💰 Valor Total: R$ ${valorTotal.toFixed(2)}\n\n` +
          `Segue em anexo o histórico completo de manutenção da sua motocicleta.\n\n` +
          `*Rbf Motos* 🏍️`;
        
        // Abrir WhatsApp com a mensagem
        // Nota: O envio de arquivo via WhatsApp Web não é possível diretamente
        // Vamos instruir o usuário a anexar manualmente
        sendWhatsAppMessage(cliente.telefone, mensagem);
        
        alert('PDF gerado! O WhatsApp será aberto. Você precisará anexar o PDF manualmente.');
      };
      reader.readAsDataURL(pdfBlob);
    } catch (error) {
      console.error('Erro ao enviar via WhatsApp:', error);
      alert('Erro ao preparar envio. Tente novamente.');
    } finally {
      setGerandoPDF(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <FileText className="text-amber-400" size={28} />
              Histórico da Motocicleta
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-300">
              <span className="font-medium">{moto.marca} {moto.modelo}</span>
              <span className="text-slate-500">•</span>
              <span>Placa: <strong className="text-amber-400">{moto.placa}</strong></span>
              <span className="text-slate-500">•</span>
              <span>Ano: {moto.ano}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-all duration-250"
            title="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Resumo com Cards Estatísticos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-900/50 border-b border-slate-700">
          <div className="bg-slate-800 p-4 rounded-xl shadow-md border border-slate-700 hover:border-amber-400 transition-all duration-250">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Wrench className="text-yellow-400" size={20} />
              </div>
              <span className="text-sm font-medium text-slate-400">Total de Serviços</span>
            </div>
            <p className="text-3xl font-bold text-slate-100">{totalServicos}</p>
          </div>
          
          <div className="bg-slate-800 p-4 rounded-xl shadow-md border border-slate-700 hover:border-emerald-400 transition-all duration-250">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <DollarSign className="text-emerald-400" size={20} />
              </div>
              <span className="text-sm font-medium text-slate-400">Valor Total</span>
            </div>
            <p className="text-3xl font-bold text-slate-100">R$ {valorTotal.toFixed(2)}</p>
          </div>
          
          <div className="bg-slate-800 p-4 rounded-xl shadow-md border border-slate-700 hover:border-blue-400 transition-all duration-250">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="text-blue-400" size={20} />
              </div>
              <span className="text-sm font-medium text-slate-400">Última Revisão</span>
            </div>
            <p className="text-base font-semibold text-slate-100">
              {ultimaRevisao 
                ? new Date(ultimaRevisao.dataAbertura).toLocaleDateString('pt-BR')
                : 'Nenhuma'
              }
            </p>
          </div>
          
          <div className="bg-slate-800 p-4 rounded-xl shadow-md border border-slate-700 hover:border-purple-400 transition-all duration-250">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <ImageIcon className="text-purple-400" size={20} />
              </div>
              <span className="text-sm font-medium text-slate-400">Fotos</span>
            </div>
            <p className="text-3xl font-bold text-slate-100">{todasFotos.length}</p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 px-6 py-4 bg-slate-800/50 border-b border-slate-700 flex-wrap items-center">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={selecionarTodas}
            >
              Selecionar Todas
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deselecionarTodas}
            >
              Desselecionar Todas
            </Button>
          </div>
          
          <div className="flex-1"></div>
          
          <div className="flex gap-3 items-center flex-wrap">
            <Badge variant="info" size="md">
              {ordensSelecionadas.length} de {ordensHistorico.length} selecionadas
            </Badge>
            
            <Button
              variant="primary"
              onClick={handleGerarPDF}
              disabled={gerandoPDF || ordensSelecionadas.length === 0}
              isLoading={gerandoPDF}
              icon={<Download size={20} />}
            >
              Baixar PDF
            </Button>
            
            <Button
              variant="success"
              onClick={handleEnviarWhatsApp}
              disabled={gerandoPDF || ordensSelecionadas.length === 0}
              icon={<Send size={20} />}
            >
              Enviar WhatsApp
            </Button>
          </div>
        </div>

        {/* Conteúdo - Lista de Ordens */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/30 custom-scrollbar">
          {loading || loadingFotos ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loading size="lg" text={loading ? 'Carregando histórico...' : 'Carregando fotos...'} />
            </div>
          ) : ordensHistorico.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 rounded-full mb-6 border-2 border-slate-700">
                <FileText className="text-slate-600" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">
                Nenhum serviço registrado
              </h3>
              <p className="text-slate-400 max-w-md mx-auto">
                {ordens.length === 0 
                  ? '⚠️ Nenhuma ordem de serviço carregada. Verifique a conexão com o servidor.'
                  : 'Esta motocicleta ainda não possui histórico de serviços.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ordensHistorico.map((ordem) => {
                const isSelected = ordensSelecionadas.includes(ordem.id);
                
                return (
                <div 
                  key={ordem.id} 
                  className={`bg-slate-800 border-2 rounded-xl overflow-hidden transition-all duration-250 ${
                    isSelected 
                      ? 'border-amber-400 shadow-lg shadow-amber-400/20' 
                      : 'border-slate-700 hover:border-slate-600 hover:shadow-md'
                  }`}
                >
                  {/* Header da Ordem */}
                  <div className={`px-6 py-4 border-b border-slate-700 ${
                    isSelected ? 'bg-amber-400/10' : 'bg-slate-800/50'
                  }`}>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOrdem(ordem.id)}
                          className="w-5 h-5 text-amber-400 bg-slate-700 border-slate-600 rounded focus:ring-2 focus:ring-amber-400 cursor-pointer transition-all"
                        />
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-100">{ordem.numero}</h3>
                          <StatusBadge status={ordem.status as any} size="md" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Data</p>
                          <p className="text-sm font-semibold text-slate-200">
                            {new Date(ordem.dataAbertura).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Valor Total</p>
                          <p className="text-xl font-bold text-emerald-400">R$ {ordem.valorTotal.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes da Ordem */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Coluna 1: Descrição */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                            <Wrench size={16} />
                            Descrição do Problema
                          </h4>
                          <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                            {ordem.descricaoProblema}
                          </p>
                        </div>
                        
                        {ordem.diagnostico && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                              <CheckCircle size={16} />
                              Diagnóstico
                            </h4>
                            <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                              {ordem.diagnostico}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Coluna 2: Serviços e Peças */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                          <DollarSign size={16} />
                          Serviços e Peças
                        </h4>
                        <div className="space-y-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700 max-h-64 overflow-y-auto custom-scrollbar">
                          {ordem.itens && ordem.itens.length > 0 ? (
                            ordem.itens.map((item) => (
                              <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-slate-700/50 last:border-0">
                                <span className="text-slate-300">
                                  <strong className="text-amber-400">{item.quantidade}x</strong> {item.nome}
                                </span>
                                <span className="font-semibold text-emerald-400">
                                  R$ {(item.quantidade * item.precoUnitario - (item.desconto || 0)).toFixed(2)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-500 italic text-center py-4">
                              Nenhum item registrado
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Fotos */}
                    {ordem.fotos && ordem.fotos.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-slate-700">
                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                          <ImageIcon size={16} />
                          Fotos do Serviço ({ordem.fotos.length})
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {ordem.fotos.map((foto, index) => (
                            <div
                              key={index}
                              className="relative group cursor-pointer overflow-hidden rounded-lg border-2 border-slate-700 hover:border-amber-400 transition-all duration-250"
                              onClick={() => window.open(foto, '_blank')}
                            >
                              <img
                                src={foto}
                                alt={`Foto ${index + 1}`}
                                className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-250"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-250 flex items-center justify-center">
                                <ImageIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-250" size={24} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
