import { Injectable, inject } from '@angular/core';
import { Pedido } from '../modelos/modelos';
import { ArmazenamentoService } from './armazenamento.service';
@Injectable({providedIn:'root'})
export class RelatorioService { private readonly armazenamento=inject(ArmazenamentoService); obterVendas():Pedido[]{return this.armazenamento.obter('zuca_pedidos',[]);} exportar(formato:'PDF'|'Excel'):string{return `Exportação ${formato} simulada com sucesso.`;} }
