import { Injectable, inject } from '@angular/core';
import { Cliente, IndicadorDashboard, Pedido, Produto } from '../modelos/modelos';
import { StatusPedido, StatusRegistro } from '../enums/status-registro.enum';
import { ArmazenamentoService } from './armazenamento.service';
@Injectable({providedIn:'root'})
export class DashboardService {
  private readonly armazenamento = inject(ArmazenamentoService);

  obterIndicadores(): IndicadorDashboard[] {
    const pedidos = this.obterVendasValidas();
    const clientes = this.armazenamento.obter<Cliente[]>('zuca_clientes', []);
    const produtos = this.armazenamento.obter<Produto[]>('zuca_produtos', []);
    const faturamento = pedidos.reduce((total, pedido) => total + pedido.valorTotal, 0);
    const meta = 20000;
    return [
      { titulo: 'Total de vendas', valor: this.formatarMoeda(faturamento), variacao: this.calcularVariacaoMensal(pedidos), icone: '↗', destaque: true },
      { titulo: 'Clientes ativos', valor: String(clientes.filter(cliente => cliente.status === StatusRegistro.ATIVO).length), variacao: 3.4, icone: '◉' },
      { titulo: 'Produtos cadastrados', valor: String(produtos.filter(produto => produto.status === StatusRegistro.ATIVO).length), variacao: 6.2, icone: '◇' },
      { titulo: 'Meta atingida', valor: `${Math.min(100, Math.round((faturamento / meta) * 100))}%`, variacao: 8.1, icone: '◎' }
    ];
  }

  obterRankingVendedores(): Array<[string, number]> {
    const totais = new Map<string, number>();
    this.obterVendasValidas().forEach(pedido => totais.set(pedido.vendedor, (totais.get(pedido.vendedor) ?? 0) + pedido.valorTotal));
    return this.normalizarRanking(totais, 3);
  }

  obterProdutosMaisVendidos(): Array<[string, number]> {
    const totais = new Map<string, number>();
    this.obterVendasValidas().flatMap(pedido => pedido.itens).forEach(item => totais.set(item.produtoNome, (totais.get(item.produtoNome) ?? 0) + item.quantidade));
    return this.normalizarRanking(totais, 4);
  }

  private obterVendasValidas(): Pedido[] {
    return this.armazenamento.obter<Pedido[]>('zuca_pedidos', []).filter(pedido => pedido.status !== StatusPedido.CANCELADO && pedido.status !== StatusPedido.ORCAMENTO);
  }

  private normalizarRanking(totais: Map<string, number>, limite: number): Array<[string, number]> {
    const ordenados = [...totais.entries()].sort((a, b) => b[1] - a[1]).slice(0, limite);
    const maior = ordenados[0]?.[1] ?? 1;
    return ordenados.map(([nome, valor]) => [nome, Math.round((valor / maior) * 100)]);
  }

  private calcularVariacaoMensal(pedidos: Pedido[]): number {
    const agora = new Date();
    const mesAtual = pedidos.filter(pedido => { const data = new Date(`${pedido.data}T12:00:00`); return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear(); }).reduce((total, pedido) => total + pedido.valorTotal, 0);
    const anterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
    const mesAnterior = pedidos.filter(pedido => { const data = new Date(`${pedido.data}T12:00:00`); return data.getMonth() === anterior.getMonth() && data.getFullYear() === anterior.getFullYear(); }).reduce((total, pedido) => total + pedido.valorTotal, 0);
    return mesAnterior ? Number((((mesAtual - mesAnterior) / mesAnterior) * 100).toFixed(1)) : 100;
  }

  private formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  }
}
