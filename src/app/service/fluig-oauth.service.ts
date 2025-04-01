import { Injectable } from '@angular/core';
import { AjaxRequestData } from 'src/assets/models/auth';
import { environment } from 'src/environments/environment';
import { HttpHeaders } from '@angular/common/http';

declare const OAuth: any;
declare const Passport: any;

@Injectable()
export class FluigOauthService {
  private generateNonce(length: number = 32): string {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  private generateTimestamp(): string {
    return Math.floor(Date.now() / 1000).toString();
  }

  public getOauthHeaders(requestData: { url: string; method: string }) {
    const oauth = Passport.getOAuth();
    const token = Passport.getToken();
    const consumerKey = oauth.consumer.public;
    const consumerSecret = oauth.consumer.secret;
    const tokenKey = token.public;
    const tokenSecret = token.secret;
    const method = 'PLAINTEXT';
    const nonce = this.generateNonce();
    const timestamp = this.generateTimestamp();
    const signature = `${consumerSecret}&${tokenSecret}`;
    const authorizationHeader = `OAuth oauth_consumer_key="${consumerKey}", oauth_token="${tokenKey}", oauth_signature_method="${method}", oauth_signature="${signature}", oauth_timestamp="${timestamp}", oauth_nonce="${nonce}", oauth_version="1.0"`;

    return new HttpHeaders({
      Authorization: authorizationHeader,
    });
  }

  public getOauthHeadersTenant(requestData: { url: string; method: string }) {
    const oauth = Passport.getOAuth();
    const token = Passport.getToken();
    const consumerKey = oauth.consumer.public;
    const consumerSecret = oauth.consumer.secret;
    const tokenKey = token.public;
    const tokenSecret = token.secret;
    const method = 'PLAINTEXT';
    const nonce = this.generateNonce();
    const timestamp = this.generateTimestamp();
    const signature = `${consumerSecret}&${tokenSecret}`;
    const authorizationHeader = `OAuth oauth_consumer_key="${consumerKey}", oauth_token="${tokenKey}", oauth_signature_method="${method}", oauth_signature="${signature}", oauth_timestamp="${timestamp}", oauth_nonce="${nonce}", oauth_version="1.0"`;

    console.log('HAHA', authorizationHeader);

    return new HttpHeaders({
      Authorization: authorizationHeader,
    });
  }
}
