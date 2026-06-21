import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Aviso, EventoAgenda, IndicadorDashboard, Pedido } from '../../core/modelos/modelos';
import { AgendaService } from '../../core/servicos/agenda.service';
import { ArmazenamentoService } from '../../core/servicos/armazenamento.service';
import { AutenticacaoService } from '../../core/servicos/autenticacao.service';
import { DashboardService } from '../../core/servicos/dashboard.service';
import { VendaService } from '../../core/servicos/venda.service';
import { CardIndicadorComponent } from '../../shared/componentes/card-indicador/card-indicador.component';
import { CabecalhoPaginaComponent } from '../../shared/componentes/cabecalho-pagina/cabecalho-pagina.component';

@Component({selector:'app-home',imports:[DatePipe,RouterLink,CardIndicadorComponent,CabecalhoPaginaComponent],templateUrl:'./home.component.html',styleUrls:['./home.component.scss','./home-interacoes.component.scss'],changeDetection:ChangeDetectionStrategy.OnPush})
export class HomeComponent{
  readonly autenticacao=inject(AutenticacaoService);private readonly dashboard=inject(DashboardService);private readonly agendaService=inject(AgendaService);private readonly vendaService=inject(VendaService);private readonly armazenamento=inject(ArmazenamentoService);
  readonly indicadores:IndicadorDashboard[]=this.dashboard.obterIndicadores();readonly eventos:EventoAgenda[]=this.agendaService.obterEventos().slice(0,4);readonly pedidos:Pedido[]=this.vendaService.obterPedidos().slice(0,4);readonly avisos:Aviso[]=this.armazenamento.obter('zuca_avisos',[]);readonly modalAviso=signal(this.avisos.some(a=>a.ativo));
}
