import { Injectable } from '@angular/core';
import { ItemEstoque, MovimentacaoEstoque } from '../modelos/modelos';
import { StatusRegistro, TipoMovimentacaoEstoque } from '../enums/status-registro.enum';
import { RepositorioLocal } from './repositorio-local.service';

@Injectable({ providedIn: 'root' })
export class EstoqueService extends RepositorioLocal<ItemEstoque> {
  protected readonly chave = 'zuca_estoque';
  obterItensEstoque(): ItemEstoque[] { return this.obterTodos(); }
  obterItemEstoquePorId(id: string): ItemEstoque | undefined { return this.obterPorId(id); }
  registrarEntrada(id: string, quantidade: number, observacao: string): void { this.movimentar(id, quantidade, TipoMovimentacaoEstoque.ENTRADA, observacao); }
  registrarSaida(id: string, quantidade: number, observacao: string): void { this.movimentar(id, quantidade, TipoMovimentacaoEstoque.SAIDA, observacao); }
  alterarItemEstoque(item: ItemEstoque): ItemEstoque { return this.alterar(item); }
  inativarItemEstoque(id: string): void { const item = this.obterPorId(id); if (item) this.alterar({ ...item, status:StatusRegistro.INATIVO }); }
  obterMovimentacoes(): MovimentacaoEstoque[] { return this.armazenamento.obter<MovimentacaoEstoque[]>('zuca_movimentacoes', []); }
  verificarEstoqueBaixo(): ItemEstoque[] { return this.obterTodos().filter(item => item.quantidadeAtual <= item.quantidadeMinima); }
  private movimentar(id: string, quantidade: number, tipo: TipoMovimentacaoEstoque, observacao: string): void {
    const item = this.obterPorId(id); if (!item || quantidade <= 0) return;
    const novaQuantidade = tipo === TipoMovimentacaoEstoque.ENTRADA ? item.quantidadeAtual + quantidade : item.quantidadeAtual - quantidade;
    if (novaQuantidade < 0) throw new Error('Saldo insuficiente em estoque.');
    this.alterar({ ...item, quantidadeAtual:novaQuantidade });
    const movimentacoes = this.obterMovimentacoes();
    movimentacoes.unshift({id:this.gerarId('mov'),produtoId:item.produtoId,tipo,quantidade,data:new Date().toISOString(),observacao});
    this.armazenamento.salvar('zuca_movimentacoes', movimentacoes);
  }
}
