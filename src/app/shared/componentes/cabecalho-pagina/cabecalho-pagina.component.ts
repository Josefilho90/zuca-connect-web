import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({selector:'app-cabecalho-pagina',templateUrl:'./cabecalho-pagina.component.html',styleUrl:'./cabecalho-pagina.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class CabecalhoPaginaComponent { readonly titulo=input.required<string>(); readonly subtitulo=input(''); }
