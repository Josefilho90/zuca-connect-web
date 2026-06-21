import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ArmazenamentoService {
  obter<T>(chave: string, valorPadrao: T): T {
    const valor = localStorage.getItem(chave);
    if (!valor) return valorPadrao;
    try { return JSON.parse(valor) as T; } catch { return valorPadrao; }
  }
  salvar<T>(chave: string, valor: T): void { localStorage.setItem(chave, JSON.stringify(valor)); }
  remover(chave: string): void { localStorage.removeItem(chave); }
  existe(chave: string): boolean { return localStorage.getItem(chave) !== null; }
}
