import { inject } from '@angular/core';
import { ArmazenamentoService } from './armazenamento.service';

export abstract class RepositorioLocal<T extends { id: string }> {
  protected readonly armazenamento = inject(ArmazenamentoService);
  protected abstract readonly chave: string;
  obterTodos(): T[] { return this.armazenamento.obter<T[]>(this.chave, []); }
  obterPorId(id: string): T | undefined { return this.obterTodos().find(item => item.id === id); }
  criar(item: T): T { const itens = [...this.obterTodos(), item]; this.armazenamento.salvar(this.chave, itens); return item; }
  alterar(item: T): T { this.armazenamento.salvar(this.chave, this.obterTodos().map(atual => atual.id === item.id ? item : atual)); return item; }
  excluir(id: string): void { this.armazenamento.salvar(this.chave, this.obterTodos().filter(item => item.id !== id)); }
  protected gerarId(prefixo: string): string { return `${prefixo}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`; }
}
