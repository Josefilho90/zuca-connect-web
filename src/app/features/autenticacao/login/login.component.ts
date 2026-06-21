import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AutenticacaoService } from '../../../core/servicos/autenticacao.service';
import { PermissaoService } from '../../../core/servicos/permissao.service';

@Component({selector:'app-login',imports:[ReactiveFormsModule],templateUrl:'./login.component.html',styleUrl:'./login.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class LoginComponent{
  private readonly fb=inject(FormBuilder);private readonly autenticacao=inject(AutenticacaoService);private readonly permissao=inject(PermissaoService);private readonly router=inject(Router);
  readonly erro=signal('');readonly carregando=signal(false);readonly mostrarSenha=signal(false);
  readonly formulario=this.fb.nonNullable.group({email:['',[Validators.required,Validators.email]],senha:['',[Validators.required,Validators.minLength(6)]]});
  entrar():void{if(this.formulario.invalid){this.formulario.markAllAsTouched();return;}this.carregando.set(true);this.erro.set('');setTimeout(()=>{const {email,senha}=this.formulario.getRawValue();if(this.autenticacao.realizarLogin(email,senha)){void this.router.navigate([this.permissao.rotaInicial()]);}else{this.erro.set('E-mail ou senha inválidos. Verifique seus dados.');}this.carregando.set(false);},450);}
  preencher(email:string):void{this.formulario.setValue({email,senha:'123456'});}
}
