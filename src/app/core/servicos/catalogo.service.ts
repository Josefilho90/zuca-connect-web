import { Injectable } from '@angular/core';
import { Catalogo } from '../modelos/modelos';
import { StatusRegistro } from '../enums/status-registro.enum';
import { RepositorioLocal } from './repositorio-local.service';

@Injectable({ providedIn: 'root' })
export class CatalogoService extends RepositorioLocal<Catalogo> {
  protected readonly chave = 'zuca_catalogos';
  obterCatalogos(): Catalogo[] { return this.obterTodos(); }
  obterCatalogoPorId(id: string): Catalogo | undefined { return this.obterPorId(id); }
  criarCatalogo(item: Omit<Catalogo, 'id'>): Catalogo { return this.criar({ ...item, id: this.gerarId('cat') }); }
  alterarCatalogo(item: Catalogo): Catalogo { return this.alterar(item); }
  inativarCatalogo(id: string): void { const item = this.obterPorId(id); if (item) this.alterar({ ...item, status: StatusRegistro.INATIVO }); }
  alternarVisibilidadeCatalogo(id: string): void { const item = this.obterPorId(id); if (item) this.alterar({ ...item, visivelCatalogo: !item.visivelCatalogo }); }
}
