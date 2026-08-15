export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  endereco?: string;
  cpf?: string;
  dataCadastro: string;
}

export interface Moto {
  id: string;
  clienteId: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  cor: string;
  km?: number;
  observacoes?: string;
}

export interface Servico {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  categoria: 'mecanica' | 'eletrica' | 'pneus' | 'oleo' | 'revisao' | 'fluidos' | 'outros';
  tempoEstimado?: number; // em minutos
  unidade?: 'un' | 'ml'; // Unidade de medida (para fluidos)
}

export interface Peca {
  id: string;
  nome: string;
  codigo?: string;
  preco: number;
  categoria: string;
  estoque?: number;
  unidade?: 'un' | 'ml'; // Unidade de medida (un = unidade, ml = mililitros)
  volumeTotal?: number; // Volume total em ml (para fluidos)
}

export interface ItemOrcamento {
  id: string;
  tipo: 'servico' | 'peca' | 'fluido';
  itemId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  desconto?: number;
  unidade?: 'un' | 'ml'; // Unidade: unidade ou mililitros
  volumeMl?: number; // Volume em ml (para fluidos)
}

export type ItemOrcamentoCreate = Omit<ItemOrcamento, 'id'>;

export interface Orcamento {
  id: string;
  numero: string;
  clienteId: string;
  motoId: string;
  itens: ItemOrcamento[];
  descricaoProblema: string;
  observacoes?: string;
  valorTotal: number;
  desconto?: number;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'expirado';
  dataEmissao: string;
  validadeAte: string;
  aprovadoEm?: string;
}

export interface OrdemServico {
  id: string;
  numero: string;
  clienteId: string;
  motoId: string;
  orcamentoId?: string;
  itens: ItemOrcamento[];
  descricaoProblema: string;
  diagnostico?: string;
  observacoes?: string;
  observacoesTecnicas?: string;
  fotos?: string[]; // Base64 das fotos da moto
  fotoCount?: number; // Contador de fotos (para performance)
  status: 'aberta' | 'em_andamento' | 'aguardando_peca' | 'pronta' | 'entregue' | 'cancelada';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  dataAbertura: string;
  dataInicio?: string;
  dataPrevisao?: string;
  dataConclusao?: string;
  dataEntrega?: string;
  valorTotal: number;
  valorPago?: number;
  formaPagamento?: string;
  garantia?: number; // em dias
  tecnicoResponsavel?: string;
}

export interface DashboardStats {
  ordensAbertas: number;
  ordensEmAndamento: number;
  ordensProntas: number;
  orcamentosPendentes: number;
  faturamentoMes: number;
  faturamentoMesAnterior: number;
}