import { Injectable } from '@angular/core';
import { EventoAgenda } from '../modelos/modelos';
import { RepositorioLocal } from './repositorio-local.service';

@Injectable({ providedIn: 'root' })
export class AgendaService extends RepositorioLocal<EventoAgenda> {
  protected readonly chave = 'zuca_agenda';
  obterEventos(): EventoAgenda[] { return this.obterTodos().sort((a,b) => `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`)); }
  obterEventoPorId(id: string): EventoAgenda | undefined { return this.obterPorId(id); }
  criarEvento(evento: Omit<EventoAgenda, 'id'>): EventoAgenda { return this.criar({ ...evento, id: this.gerarId('age') }); }
  alterarEvento(evento: EventoAgenda): EventoAgenda { return this.alterar(evento); }
  excluirEvento(id: string): void { this.excluir(id); }
  pesquisarEventosPorData(data: string): EventoAgenda[] { return this.obterTodos().filter(e => e.data === data); }
}
