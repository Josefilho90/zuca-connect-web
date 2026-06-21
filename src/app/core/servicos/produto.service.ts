import { Injectable } from '@angular/core';
import { Produto } from '../modelos/modelos';
import { StatusRegistro } from '../enums/status-registro.enum';
import { RepositorioLocal } from './repositorio-local.service';

@Injectable({ providedIn: 'root' })
export class ProdutoService extends RepositorioLocal<Produto> {
  protected readonly chave = 'zuca_produtos';
  obterProdutos(): Produto[] { return this.obterTodos(); }
  obterProdutoPorId(id: string): Produto | undefined { return this.obterPorId(id); }
  criarProduto(produto: Omit<Produto, 'id'>): Produto { return this.criar({ ...produto, id: this.gerarId('pro') }); }
  alterarProduto(produto: Produto): Produto { return this.alterar(produto); }
  inativarProduto(id: string): void { const produto = this.obterPorId(id); if (produto) this.alterar({ ...produto, status: StatusRegistro.INATIVO }); }
  pesquisarProdutos(termo: string): Produto[] { const busca = termo.toLowerCase(); return this.obterTodos().filter(p => `${p.nome} ${p.codigo} ${p.categoria}`.toLowerCase().includes(busca)); }
}
