import { Cliente } from './modelos';
import { StatusPedido, StatusRegistro } from '../enums/status-registro.enum';

export type TipoAtendimentoCrm = 'Ligação' | 'WhatsApp' | 'E-mail' | 'Visita' | 'Pós-venda';
export type StatusAtendimentoCrm = 'PENDENTE' | 'CONCLUÍDO' | 'CANCELADO';

export interface CompraCrm {
  id: string;
  data: string;
  codigoVenda: string;
  produtos: string;
  quantidade: number;
  valorTotal: number;
  vendedor: string;
  formaPagamento: string;
  status: string;
}

export interface VendedorCrm {
  nome: string;
  email: string;
  contato: string;
  quantidadeAtendimentos: number;
  totalVendido: number;
}

export interface AtendimentoCrm {
  id: string;
  clienteId: string;
  data: string;
  tipo: TipoAtendimentoCrm;
  vendedor: string;
  descricao: string;
  proximaAcao: string;
  status: StatusAtendimentoCrm;
}

export interface ObservacaoCrm {
  id: string;
  clienteId: string;
  texto: string;
  data: string;
  usuario: string;
}

export interface ProximaAcaoCrm {
  id: string;
  clienteId: string;
  titulo: string;
  descricao: string;
  dataPrevista: string;
  concluida: boolean;
}

export interface IndicadoresClienteCrm {
  totalComprado: number;
  ticketMedio: number;
  ultimaCompra: string | null;
  frequenciaCompra: string;
  status: StatusRegistro;
  produtoMaisComprado: string;
  categoriaMaisComprada: string;
  quantidadeCompras: number;
}

export interface CrmCliente {
  cliente: Cliente;
  dataCadastro: string;
  indicadores: IndicadoresClienteCrm;
  compras: CompraCrm[];
  vendedor: VendedorCrm | null;
  atendimentos: AtendimentoCrm[];
  observacoes: ObservacaoCrm[];
  proximasAcoes: ProximaAcaoCrm[];
}
