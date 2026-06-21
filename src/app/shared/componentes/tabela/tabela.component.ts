import { Component,input } from '@angular/core';
export interface ColunaTabela{chave:string;rotulo:string;}
@Component({selector:'app-tabela',templateUrl:'./tabela.component.html',styleUrl:'./tabela.component.scss'})
export class TabelaComponent{readonly colunas=input.required<ColunaTabela[]>();readonly dados=input.required<Record<string,unknown>[]>();}
