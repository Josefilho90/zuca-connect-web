import { PerfilAcesso } from '../enums/perfil-acesso.enum';
import { StatusPedido, StatusRegistro, TipoEventoAgenda, TipoMovimentacaoEstoque } from '../enums/status-registro.enum';

export interface Usuario { id: string; nome: string; email: string; senha: string; perfil: PerfilAcesso; status: StatusRegistro; clienteLojaId?: string; telefone?: string; dataCadastro?: string; }
export interface Cliente { id: string; nome: string; documento: string; telefone: string; whatsapp: string; email: string; cidade: string; estado: string; observacoes: string; status: StatusRegistro; }
export interface Produto { id: string; nome: string; codigo: string; categoria: string; modelo: string; cor: string; tamanho: number; material: string; preco: number; imagem: string; descricao: string; status: StatusRegistro; visivelCatalogo: boolean; }
export interface Catalogo extends Produto {}
export interface ItemPedido { produtoId: string; produtoNome: string; quantidade: number; valorUnitario: number; subtotal: number; }
export interface Pedido { id: string; numero: string; clienteId: string; clienteNome: string; data: string; vendedor: string; itens: ItemPedido[]; valorTotal: number; status: StatusPedido; }
export interface EventoAgenda { id: string; titulo: string; descricao: string; data: string; horario: string; tipo: TipoEventoAgenda; cliente?: string; }
export interface MovimentacaoEstoque { id: string; produtoId: string; tipo: TipoMovimentacaoEstoque; quantidade: number; data: string; observacao: string; }
export interface ItemEstoque { id: string; produtoId: string; produto: string; codigo: string; tamanho: number; cor: string; quantidadeAtual: number; quantidadeMinima: number; localizacao: string; status: StatusRegistro; }
export interface Aviso { id: string; titulo: string; mensagem: string; tipo: 'campanha' | 'aviso' | 'meta'; ativo: boolean; }
export interface IndicadorDashboard { titulo: string; valor: string; variacao: number; icone: string; destaque?: boolean; }
