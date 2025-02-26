import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Observable,
  catchError,
  delay,
  retryWhen,
  take,
  throwError,
} from 'rxjs';
import { FluigOauthService } from './fluig-oauth.service';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  public restCall: any;
  private baseUrl =
    window.location.origin + '/ecm-forms/api/v2/cardindex';

  constructor(
    private http: HttpClient,
    private fluigOauthService: FluigOauthService
  ) { }

  public getColumns(): Array<any> {
    return [
      { field: 'documentid', header: '', hidden: true, width: '0px' },
      {
        field: 'numeroSolicitacao',
        header: 'Número Solicitação',
        hidden: false,
      },
      {
        field: 'ciclo_atual',
        header: 'Rodada',
        hidden: false,
      },
      {
        field: 'cotacao_abertura',
        header: 'Data Início',
        hidden: false,
      },
      {
        field: 'cotacao_encerramento',
        header: 'Data Término',
        hidden: false,
      },
      // { field: 'status', header: 'Status', hidden: false },
      { field: 'idPastaGED', header: '', hidden: true, width: '0px' },
      { field: 'solicitacao_compra', header: '', hidden: true, width: '0px' },
    ];
  }

  public loadDataset(
    datasetName: string,
    constraintsParam: any[]
  ): Observable<any> {
    const url = `${window.location.origin}/api/public/ecm/dataset/datasets`;
    const headers = this.getHeaders(url, 'POST');
    const datasetOptions = {
      name: datasetName,
      fields: [],
      constraints: constraintsParam,
      order: [],
    };

    return this.http.post<any>(url, datasetOptions, { headers }).pipe(
      retryWhen((errors) => errors.pipe(delay(1000), take(2))),
      catchError((error: any) => {
        console.error('Erro ao carregar o dataset:', error);
        return throwError(error);
      })
    );
  }

  public update(documentId: number, cardId: number, documentData: any) {
    const url = `${this.baseUrl}/${documentId}/cards/${cardId}`;
    const headers = this.getHeaders(url, 'PUT');

    return this.http
      .put(url, documentData, { headers })
      .pipe(catchError((error: any) => throwError(error)));
  }

  private getHeaders(url: string, method = 'GET'): HttpHeaders {
    return this.fluigOauthService.getOauthHeaders({ url, method });
  }
}
