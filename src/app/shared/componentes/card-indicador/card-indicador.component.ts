import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({selector:'app-card-indicador',templateUrl:'./card-indicador.component.html',styleUrls:['./card-indicador.component.scss','./card-indicador-interacoes.component.scss'],changeDetection:ChangeDetectionStrategy.OnPush})
export class CardIndicadorComponent { readonly titulo=input.required<string>();readonly valor=input.required<string>();readonly variacao=input(0);readonly icone=input('↗');readonly destaque=input(false); }
