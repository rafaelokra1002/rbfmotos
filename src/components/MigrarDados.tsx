import { useState } from 'react';
import { Database, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const API_URL = '/api';

export function MigrarDados() {
  const [status, setStatus] = useState<'idle' | 'migrando' | 'sucesso' | 'erro'>('idle');
  const [mensagem, setMensagem] = useState('');
  const [progresso, setProgresso] = useState('');

  const migrarDados = async () => {
    setStatus('migrando');
    setMensagem('Iniciando migração...');

    try {
      // 1. Migrar Clientes
      setProgresso('Migrando clientes...');
      const clientesLocal = localStorage.getItem('oficina_clientes');
      if (clientesLocal) {
        const clientes = JSON.parse(clientesLocal);
        for (const cliente of clientes) {
          await fetch(`${API_URL}/clientes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cliente),
          });
        }
        console.log(`✅ ${clientes.length} clientes migrados`);
      }

      // 2. Migrar Motos
      setProgresso('Migrando motos...');
      const motosLocal = localStorage.getItem('oficina_motos');
      if (motosLocal) {
        const motos = JSON.parse(motosLocal);
        for (const moto of motos) {
          await fetch(`${API_URL}/motos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(moto),
          });
        }
        console.log(`✅ ${motos.length} motos migradas`);
      }

      // 3. Migrar Serviços
      setProgresso('Migrando serviços...');
      const servicosLocal = localStorage.getItem('oficina_servicos');
      if (servicosLocal) {
        const servicos = JSON.parse(servicosLocal);
        for (const servico of servicos) {
          await fetch(`${API_URL}/servicos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(servico),
          });
        }
        console.log(`✅ ${servicos.length} serviços migrados`);
      }

      // 4. Migrar Peças
      setProgresso('Migrando peças...');
      const pecasLocal = localStorage.getItem('oficina_pecas');
      if (pecasLocal) {
        const pecas = JSON.parse(pecasLocal);
        for (const peca of pecas) {
          await fetch(`${API_URL}/pecas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(peca),
          });
        }
        console.log(`✅ ${pecas.length} peças migradas`);
      }

      // 5. Migrar Orçamentos
      setProgresso('Migrando orçamentos...');
      const orcamentosLocal = localStorage.getItem('oficina_orcamentos');
      if (orcamentosLocal) {
        const orcamentos = JSON.parse(orcamentosLocal);
        for (const orcamento of orcamentos) {
          await fetch(`${API_URL}/orcamentos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...orcamento,
              itens: orcamento.itens || [],
            }),
          });
        }
        console.log(`✅ ${orcamentos.length} orçamentos migrados`);
      }

      // 6. Migrar Ordens de Serviço
      setProgresso('Migrando ordens de serviço...');
      const ordensLocal = localStorage.getItem('oficina_ordens');
      if (ordensLocal) {
        const ordens = JSON.parse(ordensLocal);
        for (const ordem of ordens) {
          await fetch(`${API_URL}/ordens-servico`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...ordem,
              itens: ordem.itens || [],
            }),
          });
        }
        console.log(`✅ ${ordens.length} ordens migradas`);
      }

      // 7. Migrar Agendamentos
      setProgresso('Migrando agendamentos...');
      const agendamentosLocal = localStorage.getItem('agendamentos');
      if (agendamentosLocal) {
        const agendamentos = JSON.parse(agendamentosLocal);
        for (const agendamento of agendamentos) {
          await fetch(`${API_URL}/agendamentos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clienteId: agendamento.clienteId,
              motoId: agendamento.motoId,
              dataAgendada: agendamento.dataAgendada,
              horaInicio: agendamento.horaInicio,
              horaFim: agendamento.horaFim,
              servicos: typeof agendamento.servicos === 'string' 
                ? agendamento.servicos 
                : JSON.stringify(agendamento.servicos),
              mecanico: agendamento.mecanico || null,
              status: agendamento.status || 'agendado',
              observacoes: agendamento.observacoes || null,
            }),
          });
        }
        console.log(`✅ ${agendamentos.length} agendamentos migrados`);
      }

      setStatus('sucesso');
      setMensagem('Migração concluída com sucesso! Recarregue a página.');
      setProgresso('');
    } catch (error) {
      console.error('Erro na migração:', error);
      setStatus('erro');
      setMensagem('Erro ao migrar dados. Veja o console para detalhes.');
      setProgresso('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Migrar Dados
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              localStorage → Banco de Dados
            </p>
          </div>
        </div>

        {status === 'idle' && (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Este utilitário irá migrar todos os seus dados do localStorage para o banco de dados.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>⚠️ Importante:</strong> Execute esta ação apenas uma vez para evitar duplicação de dados.
              </p>
            </div>
            <button
              onClick={migrarDados}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Iniciar Migração
            </button>
          </div>
        )}

        {status === 'migrando' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
            <p className="text-center text-gray-700 dark:text-gray-300 font-semibold">
              {progresso}
            </p>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Por favor, aguarde...
            </p>
          </div>
        )}

        {status === 'sucesso' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-center text-gray-700 dark:text-gray-300 font-semibold">
              {mensagem}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all"
            >
              Recarregar Página
            </button>
          </div>
        )}

        {status === 'erro' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-center text-gray-700 dark:text-gray-300 font-semibold">
              {mensagem}
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Tentar Novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
