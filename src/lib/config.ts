export interface ConfiguracaoEmpresa {
  nomeEmpresa: string;
  telefone: string;
  email: string;
  endereco: string;
  cnpj: string;
  horarioFuncionamento: string;
  logo: string;
}

export function getConfiguracaoEmpresa(): ConfiguracaoEmpresa {
  const configSalva = localStorage.getItem('configuracaoEmpresa');
  
  if (configSalva) {
    return JSON.parse(configSalva);
  }
  
  // Valores padrão
  return {
    nomeEmpresa: 'Rbf Motos',
    telefone: '',
    email: '',
    endereco: '',
    cnpj: '',
    horarioFuncionamento: 'Segunda a Sexta, 8h às 18h',
    logo: ''
  };
}
