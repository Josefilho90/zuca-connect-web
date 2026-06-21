import { Injectable } from '@angular/core';
import { ItemPedido, Pedido } from '../modelos/modelos';
import { StatusPedido } from '../enums/status-registro.enum';
import { RepositorioLocal } from './repositorio-local.service';

@Injectable({ providedIn: 'root' })
export class VendaService extends RepositorioLocal<Pedido> {
  protected readonly chave = 'zuca_pedidos';
  obterPedidos(): Pedido[] { return this.obterTodos().sort((a,b) => b.data.localeCompare(a.data)); }
  obterPedidoPorId(id: string): Pedido | undefined { return this.obterPorId(id); }
  criarPedido(pedido: Omit<Pedido, 'id' | 'numero' | 'valorTotal'>): Pedido { const total = this.calcularTotalPedido(pedido.itens); return this.criar({ ...pedido, id:this.gerarId('ped'), numero:`PED-${1049 + this.obterTodos().length}`, valorTotal:total }); }
  alterarPedido(pedido: Pedido): Pedido { return this.alterar({ ...pedido, valorTotal:this.calcularTotalPedido(pedido.itens) }); }
  cancelarPedido(id: string): void { this.alterarStatusPedido(id, StatusPedido.CANCELADO); }
  finalizarPedido(id: string): void { this.alterarStatusPedido(id, StatusPedido.FINALIZADO); }
  converterOrcamentoEmPedido(id: string): void { this.alterarStatusPedido(id, StatusPedido.PEDIDO); }
  alterarStatusPedido(id: string, status: StatusPedido): void { const pedido = this.obterPorId(id); if (pedido) this.alterar({ ...pedido, status }); }
  calcularTotalPedido(itens: ItemPedido[]): number { return itens.reduce((total, item) => total + item.quantidade * item.valorUnitario, 0); }
}
