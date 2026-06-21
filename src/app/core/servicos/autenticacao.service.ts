import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PerfilAcesso } from '../enums/perfil-acesso.enum';
import { StatusRegistro } from '../enums/status-registro.enum';
import { Usuario } from '../modelos/modelos';
import { ArmazenamentoService } from './armazenamento.service';

@Injectable({ providedIn: 'root' })
export class AutenticacaoService {
  private readonly armazenamento = inject(ArmazenamentoService);
  private readonly router = inject(Router);
  private readonly usuarioSignal = signal<Usuario | null>(this.armazenamento.obter<Usuario | null>('zuca_usuario_logado', null));
  readonly usuarioLogado = this.usuarioSignal.asReadonly();
  readonly estaAutenticadoSignal = computed(() => !!this.usuarioSignal());

  realizarLogin(email: string, senha: string): boolean {
    const usuarios = this.armazenamento.obter<Usuario[]>('zuca_usuarios', []);
    const usuario = usuarios.find(item => item.email.toLowerCase() === email.toLowerCase() && item.senha === senha && item.status === StatusRegistro.ATIVO);
    if (!usuario) return false;
    this.armazenamento.salvar('zuca_usuario_logado', usuario);
    this.armazenamento.salvar('zuca_token', `fake-token-${usuario.id}-${Date.now()}`);
    this.usuarioSignal.set(usuario);
    return true;
  }
  sair(): void { this.armazenamento.remover('zuca_usuario_logado'); this.armazenamento.remover('zuca_token'); this.usuarioSignal.set(null); void this.router.navigate(['/login']); }
  obterUsuarioLogado(): Usuario | null { return this.usuarioSignal(); }
  estaAutenticado(): boolean { return !!this.usuarioSignal() && this.armazenamento.existe('zuca_token'); }
  possuiPerfil(perfis: PerfilAcesso[]): boolean { const usuario = this.usuarioSignal(); return !!usuario && perfis.includes(usuario.perfil); }
  possuiPermissao(perfis: PerfilAcesso[]): boolean { return this.possuiPerfil(perfis); }
  obterClienteLojaId(): string | null { return this.usuarioSignal()?.clienteLojaId ?? null; }
}
