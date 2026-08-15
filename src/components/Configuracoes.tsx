import { useState, useEffect } from 'react';
import { Settings, Save, Upload, X, Building2, Phone, Mail, MapPin, FileText, Clock, CheckCircle, Image } from 'lucide-react';

interface ConfiguracaoEmpresa {
  nomeEmpresa: string;
  telefone: string;
  email: string;
  endereco: string;
  cnpj: string;
  horarioFuncionamento: string;
  logo: string;
}

export function Configuracoes() {
  const [config, setConfig] = useState<ConfiguracaoEmpresa>({
    nomeEmpresa: 'Rbf Motos',
    telefone: '',
    email: '',
    endereco: '',
    cnpj: '',
    horarioFuncionamento: 'Segunda a Sexta, 8h às 18h',
    logo: ''
  });

  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    // Carregar configurações do localStorage
    const configSalva = localStorage.getItem('configuracaoEmpresa');
    if (configSalva) {
      setConfig(JSON.parse(configSalva));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig({ ...config, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoverLogo = () => {
    setConfig({ ...config, logo: '' });
  };

  const handleSalvar = () => {
    setSalvando(true);
    try {
      localStorage.setItem('configuracaoEmpresa', JSON.stringify(config));
      setMensagem('Configurações salvas com sucesso!');
      setTimeout(() => setMensagem(''), 3000);
    } catch (error) {
      setMensagem('Erro ao salvar configurações');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-black p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
                Configurações da Empresa
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base font-medium">
                Gerencie as informações que aparecem nos orçamentos e mensagens
              </p>
            </div>
            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold rounded-xl shadow-medium hover:shadow-strong hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Save size={20} />
              {salvando ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </div>

        {/* Mensagem de Sucesso/Erro */}
        {mensagem && (
          <div className={`mb-6 p-4 rounded-xl animate-fade-in shadow-medium ${
            mensagem.includes('Erro') 
              ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-2 border-red-400 dark:border-red-600' 
              : 'bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 border-2 border-green-400 dark:border-green-600'
          }`}>
            <p className={`font-semibold text-center flex items-center justify-center gap-2 ${
              mensagem.includes('Erro') 
                ? 'text-red-800 dark:text-red-300' 
                : 'text-green-800 dark:text-green-300'
            }`}>
              <CheckCircle size={20} />
              {mensagem}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logo da Empresa */}
          <div className="lg:col-span-1 animate-slide-up">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-medium dark:shadow-strong border border-gray-200 dark:border-gray-700 p-6 h-full">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-2 rounded-xl shadow-soft">
                  <Image className="text-white w-5 h-5" />
                </div>
                Logo da Empresa
              </h2>
              
              {config.logo ? (
                <div className="relative group">
                  <img
                    src={config.logo}
                    alt="Logo da empresa"
                    className="w-full h-48 object-contain bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-600 p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={handleRemoverLogo}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-medium hover:shadow-strong hover:scale-110 opacity-0 group-hover:opacity-100"
                    title="Remover logo"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-yellow-300 dark:border-yellow-600 rounded-xl p-8 text-center bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 hover:border-yellow-400 dark:hover:border-yellow-500 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-yellow-500 dark:text-yellow-400 mb-3" />
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold mb-2">
                    Clique para fazer upload da logo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG ou SVG até 2MB
                  </p>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-4 w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 dark:file:bg-yellow-900/30 file:text-yellow-700 dark:file:text-yellow-400 hover:file:bg-yellow-200 dark:hover:file:bg-yellow-800/40 file:cursor-pointer file:transition-all"
              />
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                💡 A logo aparecerá nos orçamentos em PDF e nas mensagens do WhatsApp
              </p>
            </div>
          </div>

          {/* Dados da Empresa */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-medium dark:shadow-strong border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2 rounded-xl shadow-soft">
                  <Building2 className="text-white w-5 h-5" />
                </div>
                Dados da Empresa
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-yellow-500" />
                      Nome da Empresa
                    </div>
                  </label>
                  <input
                    type="text"
                    value={config.nomeEmpresa}
                    onChange={(e) => setConfig({ ...config, nomeEmpresa: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 dark:focus:border-yellow-500 transition-all font-medium"
                    placeholder="Nome da sua oficina"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-green-500" />
                      Telefone
                    </div>
                  </label>
                  <input
                    type="text"
                    value={config.telefone}
                    onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 dark:focus:border-yellow-500 transition-all font-medium"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-blue-500" />
                      E-mail
                    </div>
                  </label>
                  <input
                    type="email"
                    value={config.email}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 dark:focus:border-yellow-500 transition-all font-medium"
                    placeholder="contato@empresa.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-red-500" />
                      Endereço Completo
                    </div>
                  </label>
                  <input
                    type="text"
                    value={config.endereco}
                    onChange={(e) => setConfig({ ...config, endereco: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 dark:focus:border-yellow-500 transition-all font-medium"
                    placeholder="Rua, número, bairro, cidade - UF"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-purple-500" />
                      CNPJ
                    </div>
                  </label>
                  <input
                    type="text"
                    value={config.cnpj}
                    onChange={(e) => setConfig({ ...config, cnpj: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 dark:focus:border-yellow-500 transition-all font-medium"
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-orange-500" />
                      Horário de Funcionamento
                    </div>
                  </label>
                  <input
                    type="text"
                    value={config.horarioFuncionamento}
                    onChange={(e) => setConfig({ ...config, horarioFuncionamento: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 dark:focus:border-yellow-500 transition-all font-medium"
                    placeholder="Ex: Segunda a Sexta, 8h às 18h"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-medium dark:shadow-strong border border-gray-200 dark:border-gray-700 p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 p-2 rounded-xl shadow-soft">
                  <Settings className="text-white w-5 h-5" />
                </div>
                Preview
              </h2>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600">
                <div className="flex items-start gap-4">
                  {config.logo && (
                    <img
                      src={config.logo}
                      alt="Logo"
                      className="w-24 h-24 object-contain bg-white dark:bg-gray-900 rounded-xl border-2 border-yellow-400 dark:border-yellow-500 p-2 shadow-medium"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      <span className="text-yellow-500">{config.nomeEmpresa}</span>
                    </h3>
                    <div className="space-y-2">
                      {config.telefone && (
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Phone size={16} className="text-green-500" />
                          {config.telefone}
                        </p>
                      )}
                      {config.email && (
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Mail size={16} className="text-blue-500" />
                          {config.email}
                        </p>
                      )}
                      {config.endereco && (
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <MapPin size={16} className="text-red-500" />
                          {config.endereco}
                        </p>
                      )}
                      {config.cnpj && (
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <FileText size={16} className="text-purple-500" />
                          CNPJ: {config.cnpj}
                        </p>
                      )}
                      {config.horarioFuncionamento && (
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Clock size={16} className="text-orange-500" />
                          {config.horarioFuncionamento}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
