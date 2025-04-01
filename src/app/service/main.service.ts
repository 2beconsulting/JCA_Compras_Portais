import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { FluigOauthService } from './fluig-oauth.service';

declare const Passport: any;

@Injectable({
  providedIn: 'root',
})
export class MainService {
  private baseUrl =
    window.location.origin + '/ecm-forms/api/v2/cardindex';

  private urlTenant =
    window.location.origin + '/api/public/2.0/tenants/getTenantData/rocketChatUrl';

  constructor(
    private http: HttpClient,
    private fluigOauthService: FluigOauthService
  ) { }

  public getAll(documentId: number): Observable<any> {
    const url = `${this.baseUrl}/${documentId}/cards`;
    const headers = this.getHeaders(url);


    return this.http
      .get(url, { headers })
      .pipe(catchError((error: any) => throwError(error)));
  }

  public getRocketChatUrl(): Observable<any> {
    const url = this.urlTenant;
    const headers = this.getHeadersTenant(url);


    return this.http
      .get(url, { headers })
      .pipe(catchError((error: any) => throwError(error)));
  }

  public getChildFields(documentId: number, cardId: number) {
    const url = `${this.baseUrl}/cardindex/${documentId}/cards/${cardId}/childrens`;
    const headers = this.getHeaders(url);

    return this.http.get<any>(url, { headers }).pipe(
      catchError((error) => {
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

    return this.http
      .post<any>(url, datasetOptions, { headers })
      .pipe(catchError((error: any) => throwError(error)));
  }

  private getHeaders(url: string, method = 'GET'): HttpHeaders {
    return this.fluigOauthService.getOauthHeaders({ url, method });
  }

  private getHeadersTenant(url: string, method = 'GET'): HttpHeaders {
    return this.fluigOauthService.getOauthHeadersTenant({ url, method });
  }
}
