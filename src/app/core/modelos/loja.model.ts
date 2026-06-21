import { StatusRegistro } from '../enums/status-registro.enum';

export type StatusPedidoLoja = 'RASCUNHO'|'ENVIADO'|'PENDENTE DE ANÁLISE'|'ACEITO'|'RECUSADO'|'EM PRODUÇÃO'|'FATURADO'|'EM TRANSPORTE'|'FINALIZADO'|'CANCELADO';
export type TipoMetaLoja = 'LOJA'|'VENDEDOR';

export interface ClienteLoja { id:string;clienteId:string;nomeLoja:string;razaoSocial:string;cnpj:string;email:string;telefone:string;estado:string;municipio:string;endereco:string;responsavel:string;vendedorFabrica:string;status:StatusRegistro;dataCadastro:string; }
export interface VendedorLoja { id:string;clienteLojaId:string;usuarioId?:string;nome:string;email:string;telefone:string;status:StatusRegistro;dataCadastro:string;metaAtual:number; }
export interface EstoqueLoja { id:string;clienteLojaId:string;produtoId:string;produto:string;referencia:string;categoria:string;cor:string;tamanho:number;quantidadeDisponivel:number;quantidadeMinima:number;ultimaMovimentacao:string;status:StatusRegistro; }
export interface MovimentacaoEstoqueLoja { id:string;clienteLojaId:string;estoqueId:string;produto:string;tipo:'ENTRADA'|'SAÍDA';quantidade:number;data:string;observacao:string;usuario:string; }
export interface MetaLoja { id:string;clienteLojaId:string;tipo:TipoMetaLoja;mesAno:string;valorMeta:number;vendedorId?:string;vendedorNome?:string;status:StatusRegistro; }
export interface ItemPedidoLoja { produtoId:string;referencia:string;nome:string;categoria:string;cor:string;tamanho:number;quantidade:number;precoUnitario:number;desconto:number;subtotal:number; }
export interface HistoricoStatusPedidoLoja { status:StatusPedidoLoja;data:string;usuario:string;motivo?:string; }
export interface PedidoLoja { id:string;numero:string;clienteLojaId:string;clienteLojaNome:string;vendedorLojaId?:string;vendedorLojaNome:string;vendedorFabrica:string;data:string;status:StatusPedidoLoja;itens:ItemPedidoLoja[];total:number;observacoes:string;condicaoPagamento:string;prazoDesejado:string;municipio:string;estado:string;origem:'CLIENTE LOJA'|'VENDEDOR LOJA';historico:HistoricoStatusPedidoLoja[]; }
