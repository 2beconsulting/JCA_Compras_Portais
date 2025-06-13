import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MainService } from './service/main.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

declare global {
  interface Window {
    WCMAPI: any;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public loadingForTable: boolean = false;
  public reactiveForm!: FormGroup;
  public value: any;
  public loadingSuppliers: boolean = false;
  public visible: boolean = false;
  /**
   * PROD
   public documentId: number = 746746 /** DSFormulariodaSolicitacaodeCompras  
   public documentIdUser: number = 746406 /** Pré Cadastro Authenticator  *
   QA
    public documentId: number = 27271 /** DSFormulariodaSolicitacaodeCompras  
    public documentIdUser: number = 28855 /** Pré Cadastro Authenticator  *
   DEV   
    public documentId: number = 9442 // DSFormulariodaSolicitacaodeCompras  
    public documentIdUser: number = 8006 // Pré Cadastro Authenticator  *
  
   */
  public documentId: number = 9442;
  public documentIdUser: number = 8006;
  public columns = this.service.getColumns();
  public restCall: any;
  public supplier: any;
  public data: any;
  public filteredValue: any;
  public uniqueSuppliers: any;
  suppliersList: any[] = [];
  public suppliersUser: any;
  public hasFieldParam: boolean = false;
  public loginFinsih: boolean = false;
  public status: boolean = true;
  public showProfile: boolean = false;
  userEmail: string = '';
  newPassword: string = '';
  showPasswordForm: boolean = false;
  confirmPassword: string = '';
  supplierColumns = [
    { field: 'descricao', header: 'Descrição do Fornecedor', hidden: false },
    { field: 'loja', header: 'Loja', hidden: false },
    { field: 'cnpj', header: 'CNPJ', hidden: false },
    { field: 'codigo', header: 'Código', hidden: false }
  ];
  public seconds: number = 5;
  public dataUser: any;
  public valueDs: any;
  public valueCotacaoTabela: any;
  public valueForm: any;
  public optionsStatus: any = [
    { name: 'Pendente', code: 'Pendente' },
    { name: 'Parcial', code: 'Parcial' },
    { name: 'Finalizado', code: 'Finalizado' },
  ];
  public codFornecedor: any;
  public nameFornecedor: any;
  public lojaFornecedor: any;
  public valueMain: any;
  title = 'PortalJCA_Cotacao';

  constructor(private service: MainService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  async ngOnInit() {
    this.createReactiveForm();

    await this.consultLogin();

    if (this.status == true) {
      await this.fetchData();
      await this.fetchDataSupplier();
    } else {
      this.startCountdown();
    }
  }

  public createReactiveForm() {
    this.reactiveForm = this.fb.group({
      supplier: [''],
    });
  }

  public async fetchData() {

    let fornecedoresCotacao: String = this.dataUser.Forn.reduce(
      (acc: any[], elem: any) => { acc.push(elem.cnpj); return acc; }, []).join("','");
    await this.loadDatasetForm(fornecedoresCotacao);

    try {
      const activeData = this.valueForm.content.values

      this.value = activeData;
    } catch (error) {
      console.error('Ocorreu um erro:', error);
    }
  }

  public async listUserSuppliers() {
    try {
      this.loadingSuppliers = true;

      var response = await this.consultUser();

      if (!this.dataUser) {
        console.warn('Nenhum registro de fornecedores encontrado.');
        this.suppliersList = [];
        return;
      }

      this.suppliersList = await this.fetchDataSupplier();
    } catch (error) {
      console.error('Ocorreu um erro ao listar os fornecedores:', error);
      this.suppliersList = [];
    } finally {
      this.loadingSuppliers = false;
    }
  }


  public sendValue(
    value: any,
    idPastaGED: any,
    numSolic: any,
    numSolicPai: any,
    numIdCot: any
  ) {
    let logged = parent.WCMAPI.userIsLogged;

    try {
      const url = location.protocol + "//" + location.host + `/portal/1/portal_precos?field=${value}&cod=${this.codFornecedor}&forn=${this.nameFornecedor}&idPasta=${idPastaGED}&numSolic=${numSolic}&idCot=${numIdCot}&logged=${logged}&loja=${this.lojaFornecedor}&numSolicP=${numSolicPai}`;

      window.open(url, '_blank');
    } catch (error) {
      console.log(error);
    }
  }

  getSupplierName(supplier: any): string {
    return supplier.Nome ? supplier.Nome.split(" | ")[0] : '';
  }

  public async fetchDataSupplier() {
    let fornecedoresCotacao: String = this.dataUser.Forn.reduce(
      (acc: any[], elem: any) => { acc.push(elem.cnpj); return acc; }, []).join("','");
    await this.consultSuppliers();
    await this.loadDatasetTabela(fornecedoresCotacao);

    try {
      const groupedSuppliers: any = {};

      this.valueCotacaoTabela.content.values.forEach((item: any) => {
        const nome = item.Nome?.trim();
        const cnpj = item.CNPJ?.trim();

        if (nome && cnpj && cnpj.toLowerCase() !== 'null' && cnpj !== '') {
          const key = `${cnpj}`;
          if (!groupedSuppliers[key]) {
            groupedSuppliers[key] = [];
          }
          groupedSuppliers[key].push(item);
        }
      });

      this.supplier = Object.values(groupedSuppliers).flat();

      this.uniqueSuppliers = Object.keys(groupedSuppliers)
        .filter((key: string) => {
          const cnpjRegex = /\d{11,14}$/;
          const cnpjMatch = key.match(cnpjRegex);

          if (!cnpjMatch) return false;

          const cnpj = cnpjMatch[0];
          return this.supplier.filter(function (item: any) {
            return item.CNPJ.indexOf(cnpj) > -1
          }).length > 0;
        })
        .map((key: string) => {
          const supplierGroup = groupedSuppliers[key][0];
          const displayName = `${supplierGroup.Nome.trim()} | ${supplierGroup.CNPJ.trim()} | ${supplierGroup.Loja.trim()}`;

          return {
            Nome: displayName,
            NumFormulario: supplierGroup.NumFormulario,
            CNPJ: supplierGroup.CNPJ,
            Cod: supplierGroup.Cod,
            Loja: supplierGroup.Loja,
          };
        });


      this.uniqueSuppliers.sort((a: any, b: any) => a.Nome.localeCompare(b.Nome));

      if (this.uniqueSuppliers.length === 1) {
        this.data = this.uniqueSuppliers[0];
        await this.onSupplierSelect();
      }

      return this.uniqueSuppliers;

    } catch (error) {
      console.error('Ocorreu um erro:', error);
    }
  }


  public async onSupplierSelect() {
    this.loadingForTable = true;

    if (this.data) {

      this.codFornecedor = this.data.Cod;
      this.lojaFornecedor = this.data.Loja;
      this.nameFornecedor = this.data.Nome.split(' | ')[0];
      this.filteredValue = [];

      this.value.forEach((item: any) => {
        if (
          item.A2_CGC.trim() == this.data.CNPJ.trim()
        ) {
          this.filteredValue.push({ ...item });
        }
      });

      this.filteredValue.sort((a: any, b: any) => {
        return parseInt(b.numeroSolicitacao) - parseInt(a.numeroSolicitacao);
      });

      this.valueMain = this.filteredValue;
    } else {
      this.filteredValue = [];
      this.valueMain = [];
    }

    this.loadingForTable = false;
  }

  public async consultSuppliers() {
    try {
      const suppliersArray = this.dataUser.suppliersRegister.split(';');

      this.suppliersUser = suppliersArray;
    } catch (error) {
      console.error('Ocorreu um erro:', error);
    }
  }

  public startCountdown() {
    const countdownDuration = 5;

    let seconds = countdownDuration;

    const url =
      location.protocol + "//" + location.host + '/portal/1/portal_auth';

    const countdownInterval = setInterval(() => {
      if (seconds <= 0) {
        clearInterval(countdownInterval);

        window.location.href = url;
      } else {
        this.seconds = seconds;
        seconds--;
      }
    }, 1000);
  }

  public getTokenFromLocalStorage(): string | null {
    return localStorage.getItem('token');
  }

  public async consultUser() {
    try {
      await this.loadDataset();

      const tokenStorage = this.getTokenFromLocalStorage();

      const configs = this.valueDs.content.values.filter(
        (obj: any) => obj.Token == tokenStorage
      );

      const uniqueConfigs = this.mergeDuplicateTokens(configs);

      this.dataUser = uniqueConfigs[0];
    } catch (error) {
      console.error('Ocorreu um erro:', error);
    }
  }

  private mergeDuplicateTokens(configs: any[]): any {
    const mergedConfigs: any = {};

    for (const config of configs) {
      const token = config.Token;

      if (!mergedConfigs[token]) {
        mergedConfigs[token] = { ...config, suppliersRegister: '', Forn: [] };
      }

      mergedConfigs[token].suppliersRegister +=
        (mergedConfigs[token].suppliersRegister ? ';' : '') +
        config.DescricaoFornecedor.trim();

      mergedConfigs[token].Forn.push({
        descricao: config.DescricaoFornecedor,
        loja: config.LojaFornecedor,
        cnpj: config.CnpjFornecedor,
        codigo: config.CodigoFornecedor,
      });
    }

    return Object.values(mergedConfigs);
  }

  public async consultLogin() {
    await this.consultUser();

    if (this.dataUser) {
      const lastAcessTimestamp = parseInt(this.dataUser.UltimoAcesso);
      const lastAcessDate = new Date(lastAcessTimestamp);
      const now = new Date();
      const diffInMilliseconds = now.getTime() - lastAcessDate.getTime();
      const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

      if (diffInHours <= 10) {
        this.status = true;
      } else {
        this.status = false;
      }
    } else {
      this.status = false;
    }
  }

  async redirectToProfile(): Promise<void> {
    this.showProfile = true;

    const tokenStorage = this.getTokenFromLocalStorage();
    const constraint = [
      { _field: 'email', _initialValue: '', _finalValue: '', _type: 1 },
      { _field: 'token', _initialValue: tokenStorage, _finalValue: tokenStorage, _type: 1 },
    ];

    const response = await this.service.loadDataset('DS_AUTH', constraint).toPromise();
    const dataTable = response.content.values;

    this.userEmail = dataTable[0]?.Email || 'Email não encontrado';

    this.listUserSuppliers();
  }

  async updatePassword(): Promise<void> {
    if (this.newPassword !== this.confirmPassword) {
      alert('As senhas não coincidem. Por favor, tente novamente.');
      return;
    }

    const documentData = {
      values: [
        {
          fieldId: 'passwordRegister',
          value: this.confirmPassword,
        },
      ],
    };

    this.uniqueSuppliers.forEach((element: any, index: any) => {
      documentData.values.push(
        {
          fieldId: `A2_COD___${index + 1}`,
          value: element.Cod,
        },
        {
          fieldId: `A2_LOJA___${index + 1}`,
          value: element.Loja,
        },
        {
          fieldId: `A2_NOME___${index + 1}`,
          value: element.Nome,
        },
        {
          fieldId: `A2_CGC___${index + 1}`,
          value: element.CNPJ,
        }
      );
    });
    var response = await this.service.update(this.documentIdUser, this.dataUser.Id, documentData).toPromise();
    alert('Senha atualizada com sucesso!');
    this.newPassword = '';
    this.confirmPassword = '';
    this.showPasswordForm = false;
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
  }

  public async logout() {
    await this.consultUser();

    try {
      const tokenStorage = this.getTokenFromLocalStorage();

      const constraint = [
        {
          _field: 'email',
          _initialValue: '',
          _finalValue: '',
          _type: 1,
        },
        {
          _field: 'token',
          _initialValue: tokenStorage,
          _finalValue: tokenStorage,
          _type: 1,
        },
      ];

      const response = await this.service
        .loadDataset('DS_AUTH', constraint)
        .toPromise();

      const dataTable = response.content.values;

      if (this.dataUser) {
        const documentData = {
          values: [
            {
              fieldId: 'lastAcess',
              value: '',
            },
            {
              fieldId: 'tokenRegister',
              value: '',
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

        this.service
          .update(this.documentIdUser, this.dataUser.Id, documentData)
          .subscribe((res: any) => {
            const objetoTransformado = res.values.reduce(
              (result: any, obj: any) => {
                result[obj.fieldId] = obj.value;
                return result;
              },
              {}
            );

            const url =
              location.protocol + "//" + location.host + '/portal/1/portal_auth';

            window.location.href = url;
          });
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async loadDataset() {
    const tokenStorage = this.getTokenFromLocalStorage();

    try {
      const constraint = [
        {
          _field: 'email',
          _initialValue: '',
          _finalValue: '',
          _type: 1,
        },
        {
          _field: 'token',
          _initialValue: tokenStorage,
          _finalValue: tokenStorage,
          _type: 1,
        },
      ];

      const response = await this.service
        .loadDataset('DS_AUTH', constraint)
        .toPromise();

      this.valueDs = response;
    } catch (error) {
      console.error('Erro ao carregar o dataset:', error);
      throw error;
    }
  }

  private async loadDatasetForm(fornecedoresCotacao: String) {
    try {
      const constraints: any = [
        {
          _field: 'FORNECEDORES',
          _initialValue: "" + fornecedoresCotacao,
          _finalValue: "" + fornecedoresCotacao,
          _type: 1,
        },
      ]

      /**
       * @todo, mudar o dataset, visto que aqui é usado somente para trazer os valores do formulário,
       *  podem muito bem já vir do outros dataset
       * 
       */
      const response = await this.service
        .loadDataset('DS_COTACOES_FORM', constraints)
        .toPromise();

      this.valueForm = response;
    } catch (error) {
      console.error('Erro ao carregar o dataset:', error);
      throw error;
    }
  }

  private async loadDatasetTabela(fornecedoresCotacao: String) {
    try {
      const constraints: any = [
        {
          _field: 'FORNECEDORES',
          _initialValue: "" + fornecedoresCotacao,
          _finalValue: "" + fornecedoresCotacao,
          _type: 1,
        },
      ]

      const response = await this.service
        .loadDataset('DS_COTACAO_TABELA', constraints)
        .toPromise();

      this.valueCotacaoTabela = response;
    } catch (error) {
      console.error('Erro ao carregar o dataset:', error);
      if (error instanceof HttpErrorResponse) {
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error:', error.error);
      }
      throw error;
    }
  }
}
