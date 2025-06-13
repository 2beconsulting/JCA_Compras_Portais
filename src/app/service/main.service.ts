import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Observable,
  catchError,
  delay,
  first,
  retryWhen,
  take,
  throwError,
} from 'rxjs';
import { FluigOauthService } from './fluig-oauth.service';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  private baseUrl =
    window.location.origin + '/ecm-forms/api/v2/cardindex';

  private baseUrlD =
    window.location.origin + '/content-management/api/v2/documents';

  private GED =
    window.location.origin + '/api/public/ecm/document/createDocument';

  constructor(
    private http: HttpClient,
    private fluigOauthService: FluigOauthService
  ) { }

  public getColumns(): Array<any> {
    return [
      { field: 'btn', header: '', hidden: false },
      {
        field: 'DescPA',
        header: 'Produto',
        hidden: false,
      },
      {
        field: 'Quantidade',
        header: 'Quantidade',
        hidden: false,
      },
      {
        field: 'StatusCot',
        header: 'Status',
        hidden: false,
      },
      {
        field: 'Anexo',
        header: 'Anexo',
        hidden: false,
      },
      { field: 'Id', header: '', hidden: true },
    ];
  }

  public getColumnsTwo(): Array<any> {
    return [
      {
        field: 'amountTwo',
        header: 'Qnt. Fornecida',
        hidden: false,
        width: '20%',
      },
      { field: 'value', header: 'Valor Unit.', hidden: false, width: '20%' },
      { field: 'brand', header: 'Desconto', hidden: false, width: '20%' },
      { field: 'valueT', header: 'Valor Total', hidden: false, width: '20%' },

      // { field: 'freight', header: 'Frete', hidden: false },
      // { field: 'delivery', header: 'Prev. Entrega', hidden: false },
      // { field: 'condition', header: 'Condição', hidden: false },
      // { field: 'time', header: 'Prazo', hidden: false },
      // { field: 'obs', header: 'Observações', hidden: false },
    ];
  }

  public getAll(documentId: number): Observable<any> {
    const url = `${this.baseUrl}/${documentId}/cards`;
    const headers = this.getHeaders(url);

    return this.http
      .get(url, { headers })
      .pipe(catchError((error: any) => throwError(error)));
  }

  public delete(documentId: number): Observable<any> {
    const url = `${this.baseUrlD}/${documentId}`;
    const headers = this.getHeaders(url);

    return this.http
      .delete(url, { headers })
      .pipe(catchError((error: any) => throwError(error)));
  }

  public getById(documentId: number, cardId: number): Observable<any> {
    const url = `${this.baseUrl}/${documentId}/cards/${cardId}`;
    const headers = this.getHeaders(url);

    return this.http
      .get(url, { headers })
      .pipe(catchError((error: any) => throwError(error)));
  }

  public update(documentId: number, cardId: number, documentData: any) {
    const url = `${this.baseUrl}/${documentId}/cards/${cardId}`;
    const headers = this.getHeaders(url, 'PUT');

    return this.http
      .put(url, documentData, { headers })
      .pipe(catchError((error: any) => throwError(error)));
  }

  public updateCotacion(documentId: number, cardId: number, documentData: any) {
    const url = `${this.baseUrl}/${documentId}/cards/${cardId}
    `;
    const headers = this.getHeaders(url, 'PUT');

    return this.http
      .put(url, documentData, { headers })
      .pipe(catchError((error: any) => throwError(error)));
  }
  public updateRecordLinha(constraints: any[]) {
    return this.loadDataset("ds_atualiza_filho_ficha", constraints);
  }

  public loadDatasetGED(
    datasetName: string,
    constraintsParam: any[],
    order: string[] = []
  ): Observable<any> {
    const url = `${window.location.origin}/api/public/ecm/dataset/datasets`;
    const headers = this.getHeaders(url, 'POST');

    const datasetOptions = {
      name: datasetName,
      fields: [],
      constraints: constraintsParam,
      order: order,
    };

    return this.http.post<any>(url, datasetOptions, { headers }).pipe(
      retryWhen((errors) => errors.pipe(delay(1000), take(20))),
      catchError((error: any) => throwError(error))
    );
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
      retryWhen((errors) => errors.pipe(delay(1000), take(20))),
      catchError((error: any) => throwError(error))
    );
  }

  private getHeaders(url: string, method = 'GET'): HttpHeaders {
    return this.fluigOauthService.getOauthHeaders({ url, method });
  }

  private getHeadersAnexo(url: string, method = 'POST'): HttpHeaders {
    var headers = this.fluigOauthService.getOauthHeaders({ url, method });
    headers = headers.set('Content-Type', 'application/json');
    return headers;
  }

  public uploadFile(formData: FormData) {
    const url = window.location.origin + '/ecm/upload';
    const headers = this.getHeaders(url, 'POST');

    return this.http
      .post<any>(url, formData, { headers })
      .pipe(catchError((error: any) => throwError(error)));
  }

  public createDocument(
    parentId: number,
    description: string,
    fileName: string
  ) {
    let body = { parentId, description, attachments: [{ fileName }] };
    const url = window.location.origin + '/api/public/ecm/document/createDocument';
    const headers = this.getHeaders(url, 'POST');
    return this.http
      .post<any>(url, body)
      .pipe(catchError((error: any) => throwError(error)));
  }

  public uploadDocument(file: File, parentId: string): Observable<any> {
    const url = this.GED;
    const headers = this.getHeadersAnexo(url);
    console.log('HEADERS -> ', headers);

    const formData = new FormData();
    formData.append('file', file);
    console.log('FORMDATA -> ', formData);

    const body = {
      description: 'PRODUTO',
      parentId: parentId,
      attachments: [
        {
          fileName: 'B',
        },
      ],
    };

    return this.http
      .post(url, body, { headers })
      .pipe(catchError((error: any) => throwError(error)));
  }
}
