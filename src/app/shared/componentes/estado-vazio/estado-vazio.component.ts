import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({selector:'app-estado-vazio',template:'<div class="vazio"><span>◇</span><h3>{{ titulo() }}</h3><p>{{ mensagem() }}</p></div>',styles:['.vazio{text-align:center;padding:3rem;color:var(--texto-suave)}span{font-size:2rem;color:var(--dourado)}h3{color:var(--texto);margin:.7rem 0 .25rem}p{margin:0}'],changeDetection:ChangeDetectionStrategy.OnPush})
export class EstadoVazioComponent{readonly titulo=input('Nada por aqui');readonly mensagem=input('Nenhum registro encontrado.');}
