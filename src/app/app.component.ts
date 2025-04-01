import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MainService } from './service/main.service';
import { AuthData } from 'src/assets/models/auth';
import { MessageService } from 'primeng/api';
import { FluigOauthService } from './service/fluig-oauth.service';
import { catchError, of, switchMap } from 'rxjs';

declare global {
  interface Window {
    WCMAPI: any;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MessageService],
})
export class AppComponent implements OnInit {
  public authData!: FormGroup;
  public value: any;
  public documentId: number = 746406;
  public data: any;
  public status: boolean = true;
  public valueDs: any;
  dialogVisible: boolean = false;

  title = 'PortalJCA';

  constructor(
    private fb: FormBuilder,
    private service: MainService,
    private messageService: MessageService,
    private fluigService: FluigOauthService
  ) {
    // const tokenStorage = this.getTokenFromLocalStorage();

    service.getAll(this.documentId).subscribe((data: any) => {
      if (data) {
        const arrayDeObjetos = data.items.map((documento: any) => {
          const objetoTransformado = documento.values.reduce(
            (result: any, obj: any) => {
              result[obj.fieldId] = obj.value;
              return result;
            },
            {}
          );

          objetoTransformado['cardId'] = documento.cardId;

          return objetoTransformado;
        });

        this.value = arrayDeObjetos;
      }
    });

    this.createReactiveForm();
    this.authData.get('email')?.setValue('');
    this.authData.get('password')?.setValue('');

    service.getRocketChatUrl();
  }

  /**
   * @todo ajustar as regras de consulta de tudo
   */
  async ngOnInit() {
    await this.consultLogin();
  }

  public createReactiveForm() {
    this.authData = this.fb.group({
      recoveryMail: [''],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(25),
        ],
      ],
    });
  }

  public toggleDialogVisibility(isVisible: boolean) {
    this.dialogVisible = isVisible;

    const recoveryMailControl = this.authData.get('recoveryMail');
    if (isVisible) {
      recoveryMailControl?.setValidators([Validators.required, Validators.email]);
    } else {
      recoveryMailControl?.clearValidators();
    }
    recoveryMailControl?.updateValueAndValidity();
  }


  cancel() {
    this.toggleDialogVisibility(false);
  }

  public async onSendClick() {
    if (!this.authData.get('recoveryMail')?.valid) {
      console.error('Formulário inválido!');
      return;
    }

    const recoveryMail = this.authData.get('recoveryMail')?.value;
    if (!recoveryMail) {
      console.error('O campo e-mail está vazio.');
      return;
    }

    try {
      const constraint = [
        {
          _field: 'MAIL',
          _initialValue: recoveryMail,
          _finalValue: recoveryMail,
          _type: 1,
        },
      ];

      const response = await this.service.loadDataset('ds_send_recovery_mail', constraint).toPromise();

      if (response.content.values[0].RETORNO && response.content.values[0].RETORNO === 'OK') {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso!',
          detail: 'E-mail enviado com sucesso.',
        });
        this.toggleDialogVisibility(false);
      } else {
        throw "Não foi localizado o usuário. Verifique o preenchimento";
      }
    } catch (error) {
      console.error('Erro ao enviar o e-mail:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro!',
        detail: 'Ocorreu um erro ao tentar enviar o e-mail. Por favor, tente novamente.',
      });
    }
  }

  public async loginAccount() {
    const contratoData: AuthData = this.authData.value;

    const constraint = [
      {
        _field: 'email',
        _initialValue: contratoData.email,
        _finalValue: contratoData.email,
        _type: 1,
      },
      {
        _field: 'type',
        _initialValue: "LOGIN",
        _finalValue: "LOGIN",
        _type: 1,
      },
      {
        _field: 'token',
        _initialValue: '',
        _finalValue: '',
        _type: 1,
      },
    ];

    try {
      const response = await this.service
        .loadDataset('DS_AUTH', constraint)
        .toPromise();

      const dataTable = response.content.values;

      if (contratoData) {
        const userMatch = dataTable.find(
          (user: any) =>
            user.Email == contratoData.email &&
            user.Senha == contratoData.password
        );

        if (userMatch) {
          const currentDate = new Date();
          const validityDate = new Date(userMatch.ValidadeSessao + "T00:00");
          const timestampNow = currentDate.getTime();

          const token = this.generateRandomToken(20);
          localStorage.setItem('token', token);


          if (currentDate < validityDate) {
            const documentData = {
              values: [
                {
                  fieldId: 'lastAcess',
                  value: timestampNow,
                },
                {
                  fieldId: 'tokenRegister',
                  value: token,
                },
              ],
            };

            dataTable.forEach((element: any, index: any) => {
              documentData.values.push(
                {
                  fieldId: `A2_COD___${index + 1}`,
                  value: element.CodigoFornecedor,
                },
                {
                  fieldId: `A2_LOJA___${index + 1}`,
                  value: element.LojaFornecedor,
                },
                {
                  fieldId: `A2_NOME___${index + 1}`,
                  value: element.DescricaoFornecedor,
                },
                {
                  fieldId: `A2_CGC___${index + 1}`,
                  value: element.CnpjFornecedor,
                }
              );
            });


            const response = await this.service.update(this.documentId, userMatch.cardId, documentData);
            response.subscribe((res: any) => {
              const objetoTransformado = res.values.reduce(
                (result: any, obj: any) => {
                  result[obj.fieldId] = obj.value;
                  return result;
                },
                {}
              );

              this.value.push(objetoTransformado);

              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: 'Login realizado.',
              });

              setTimeout(() => {
                const url = `${window.location.origin}/portal/1/portal_cotacao`;

                window.location.href = url;
              }, 1000);
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro!',
              detail:
                'Sua sessão expirou. Por favor, entre em contato com um responsável para renovar a data de validade da sua conta e faça login novamente.',
            });
          }
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro!',
            detail:
              'Por favor, revise os dados fornecidos. A conta informada não é válida.',
          });
        }
      }
    } catch (error) {
      console.error('Erro na carga de dados:', error);
    }
  }

  public generateRandomToken(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let token = '';
    for (let i = 0; i < length; i++) {
      token += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return token;
  }

  public getTokenFromLocalStorage(): string | null {
    return localStorage.getItem('token');
  }

  public async consultUser() {
    try {
      await this.loadDataset();

      const tokenStorage = this.getTokenFromLocalStorage();

      const config = this.valueDs.content.values.find(
        (obj: any) => obj.tokenRegister === tokenStorage
      );

      this.data = config;
    } catch (error) {
      console.error('Ocorreu um erro:', error);
    }
  }

  public async consultLogin() {
    await this.consultUser();

    if (this.data && this.data !== undefined && this.data !== null) {
      const lastAcessTimestamp = parseInt(this.data.lastAcess);
      const lastAcessDate = new Date(lastAcessTimestamp);
      const now = new Date();
      const diffInMilliseconds = now.getTime() - lastAcessDate.getTime();
      const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

      if (diffInHours <= 10) {
        this.status = true;

        setTimeout(() => {
          const url = `${window.location.origin}/portal/1/portal_cotacao`;

          window.location.href = url;
        }, 1000);
      } else {
        this.status = false;
      }
    } else {
      this.status = false;
    }
  }

  private async loadDataset() {
    try {
      const constraints: any = [];
      const response = await this.service
        .loadDataset('ds_cadastro_conta', constraints)
        .toPromise();

      this.valueDs = response;
    } catch (error) {
      console.error('Erro ao carregar o dataset:', error);
      throw error;
    }
  }
}
