import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ArmazenamentoService } from '../servicos/armazenamento.service';

export const autenticacaoInterceptor: HttpInterceptorFn = (requisicao, proximo) => {
  const token = inject(ArmazenamentoService).obter<string | null>('zuca_token', null);
  return proximo(token ? requisicao.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : requisicao);
};
