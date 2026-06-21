import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AtendimentoCrm, CrmCliente, ProximaAcaoCrm, StatusAtendimentoCrm, TipoAtendimentoCrm } from '../../core/modelos/crm-cliente.model';
import { AutenticacaoService } from '../../core/servicos/autenticacao.service';
import { CabecalhoPaginaComponent } from '../../shared/componentes/cabecalho-pagina/cabecalho-pagina.component';
import { EstadoVazioComponent } from '../../shared/componentes/estado-vazio/estado-vazio.component';
import { CrmClienteService } from './crm-cliente.service';

@Component({
  selector: 'app-crm-cliente',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, CabecalhoPaginaComponent, EstadoVazioComponent],
  templateUrl: './crm-cliente.component.html',
  styleUrls: ['./crm-cliente.component.scss','./crm-cliente-crud.component.scss']
})
export class CrmClienteComponent {
  private readonly rota = inject(ActivatedRoute);
  private readonly service = inject(CrmClienteService);
  private readonly autenticacao = inject(AutenticacaoService);
  private readonly fb = inject(FormBuilder);
  private readonly clienteId = this.rota.snapshot.paramMap.get('id') ?? '';

  readonly crm = signal<CrmCliente | null>(this.service.obterCrm(this.clienteId));
  readonly erroObservacao = signal('');
  readonly toast = signal('');
  readonly painelAtendimento = signal(false);
  readonly editandoAtendimento = signal<AtendimentoCrm|null>(null);
  readonly painelAcao = signal(false);
  readonly editandoAcao = signal<ProximaAcaoCrm|null>(null);
  readonly formObservacao = this.fb.nonNullable.group({ texto: ['', [Validators.required, Validators.maxLength(500)]] });
  readonly formAtendimento=this.fb.nonNullable.group({data:[new Date().toISOString().slice(0,10),Validators.required],tipo:['Ligação' as TipoAtendimentoCrm,Validators.required],vendedor:[this.autenticacao.obterUsuarioLogado()?.nome??'',Validators.required],descricao:['',Validators.required],proximaAcao:[''],status:['PENDENTE' as StatusAtendimentoCrm,Validators.required]});
  readonly formAcao=this.fb.nonNullable.group({titulo:['',Validators.required],descricao:['',Validators.required],dataPrevista:[new Date().toISOString().slice(0,10),Validators.required],concluida:[false]});

  novoAtendimento():void{this.editandoAtendimento.set(null);this.formAtendimento.reset({data:new Date().toISOString().slice(0,10),tipo:'Ligação',vendedor:this.autenticacao.obterUsuarioLogado()?.nome??'',status:'PENDENTE'});this.painelAtendimento.set(true);}
  editarAtendimento(atendimento:AtendimentoCrm):void{this.editandoAtendimento.set(atendimento);this.formAtendimento.setValue({data:atendimento.data,tipo:atendimento.tipo,vendedor:atendimento.vendedor,descricao:atendimento.descricao,proximaAcao:atendimento.proximaAcao,status:atendimento.status});this.painelAtendimento.set(true);}
  salvarAtendimento():void{if(this.formAtendimento.invalid){this.formAtendimento.markAllAsTouched();return;}this.service.salvarAtendimento(this.clienteId,this.formAtendimento.getRawValue(),this.editandoAtendimento()?.id);this.painelAtendimento.set(false);this.atualizarCrm('Atendimento salvo com sucesso.');}
  excluirAtendimento(id:string):void{this.service.excluirAtendimento(id);this.atualizarCrm('Atendimento excluído.');}
  novaAcao():void{this.editandoAcao.set(null);this.formAcao.reset({dataPrevista:new Date().toISOString().slice(0,10),concluida:false});this.painelAcao.set(true);}
  editarAcao(acao:ProximaAcaoCrm):void{this.editandoAcao.set(acao);this.formAcao.setValue({titulo:acao.titulo,descricao:acao.descricao,dataPrevista:acao.dataPrevista,concluida:acao.concluida});this.painelAcao.set(true);}
  salvarAcao():void{if(this.formAcao.invalid){this.formAcao.markAllAsTouched();return;}this.service.salvarProximaAcao(this.clienteId,this.formAcao.getRawValue(),this.editandoAcao()?.id);this.painelAcao.set(false);this.atualizarCrm('Próxima ação salva.');}
  excluirAcao(id:string):void{this.service.excluirProximaAcao(id);this.atualizarCrm('Próxima ação excluída.');}
  alternarAcao(id:string):void{this.service.alternarProximaAcao(id);this.atualizarCrm('Status da ação atualizado.');}

  adicionarObservacao(): void {
    if (this.formObservacao.invalid) {
      this.formObservacao.markAllAsTouched();
      this.erroObservacao.set('Escreva uma observação antes de adicionar.');
      return;
    }
    try {
      this.service.adicionarObservacao(this.clienteId, this.formObservacao.getRawValue().texto, this.autenticacao.obterUsuarioLogado()?.nome ?? 'Usuário');
      this.crm.set(this.service.obterCrm(this.clienteId));
      this.formObservacao.reset();
      this.erroObservacao.set('');
      this.toast.set('Observação adicionada ao CRM.');
      setTimeout(() => this.toast.set(''), 2500);
    } catch (erro) {
      this.erroObservacao.set(erro instanceof Error ? erro.message : 'Não foi possível adicionar a observação.');
    }
  }

  private atualizarCrm(mensagem:string):void{this.crm.set(this.service.obterCrm(this.clienteId));this.toast.set(mensagem);setTimeout(()=>this.toast.set(''),2500);}
}
