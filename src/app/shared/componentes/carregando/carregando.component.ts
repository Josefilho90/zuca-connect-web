import { Component } from '@angular/core';
@Component({selector:'app-carregando',template:'<div class="carregando"><i></i><span>Carregando...</span></div>',styles:['.carregando{display:flex;justify-content:center;align-items:center;gap:.7rem;padding:2rem;color:var(--texto-suave)}i{width:22px;height:22px;border:2px solid var(--borda);border-top-color:var(--dourado);border-radius:50%;animation:girar .7s linear infinite}@keyframes girar{to{transform:rotate(360deg)}}']})
export class CarregandoComponent{}
