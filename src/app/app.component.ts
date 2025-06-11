import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MainService } from './service/main.service';
import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { first } from 'rxjs';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup } from '@angular/forms';

declare global {
  interface Window {
    WCMAPI: any;
  }
}

// interface UploadEvent {
//   originalEvent: Event;
//   files: File[];
// }

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MessageService],
})
export class AppComponent implements OnInit {
  public dialogVisible: boolean = false;
  public visibleAnx: boolean = false;

  @ViewChild('fileUploadGlob') fileUploadGlob!: FileUpload;
  @ViewChildren('fileUpload') fileUploads!: QueryList<FileUpload>;

  public loadingForTable: boolean = false;
  public reactiveForm!: FormGroup;
  public apiBase =
    window.location.origin + '/api/public/ecm/document/createDocument';
  public hasFieldParam: boolean = false;
  public columns = this.service.getColumns();
  public columnsTwo = this.service.getColumnsTwo();
  public products: any[] = [
    {
      name: 'Produto 1',
      amount: 1,
      child: [
        {
          brand: 'Marca 1',
          amountTwo: '1',
          value: '10,00',
          discount: '0',
          freight: 'Sedex',
          delivery: '5 dias',
          condition: 'Teste',
          term: '10 dias',
          observ: 'OkOk',
        },
      ],
    },
  ];
  public value: any;
  public clonedProducts: { [s: string]: any } = {};
  public expandedRows: { [key: string]: boolean } = {};
  public edit: boolean = false;
  /**
   * PROD
  public documentId: number = 746746
  public documentIdUser: number = 746406
  public documentIdForn: number = 746757
  public documentIdCotacion: number = 746754
   * 
   * QA
  public documentId: number = 27271
  public documentIdUser: number = 28855
  public documentIdForn: number = 27769
  public documentIdCotacion: number = 41603
   * DEV
   * 
   * 
   */
  public documentId: number = 746746
  public documentIdUser: number = 746406
  public documentIdForn: number = 746757
  public documentIdCotacion: number = 746754
  public cardIdCotacion: any;
  public cardIdForn: any;
  public seconds: number = 5;
  public dataUser: any;
  public valueProduct: any;
  public dsProduto: any;
  public dsCotacao: any;
  public valueFinish: any;
  public attUp: boolean = false;
  public prodAttUp: any;
  public optionsFrete: any = [
    { name: '', code: '' },
    { name: 'FOB', code: 'F' },
    { name: 'CIF', code: 'C' },
  ];
  public optionsBeneficio: any = [
    { name: '', code: '' },
    { name: 'Sim', code: 'S' },
    { name: 'Não', code: 'N' },
  ];
  public optionsCondicao: any;
  public missingFields: any;
  public valueForm: any;
  public nameFornecedor: any;
  public productTable: any;
  public productFilhoTable: any;
  public titleModal: any;
  public idPasta: any;
  public numSolic: any;
  public editModal: any;
  public valueDs: any;
  public lojaForn: any;
  public fornecedorLoja: any;
  public fornecedorCod: any;
  public anexosGED: any;
  public uploadedFiles: any;
  public newFileName: any[] = [];
  public formDataAnx: any[] = [];
  public selectedBrand: string = '';
  public selectedProduct: any;
  public optionsMarca: any;
  public valueFornecedor: any;
  validateFields: any;
  anxSolic: any;
  numSolicPai: any;

  constructor(
    private service: MainService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.loadingForTable = true;

    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const urlParams = new URLSearchParams(url.search);
    const logged = urlParams.get('logged');

    if (logged === 'false') {
      if (currentUrl.includes('/p/')) {
        const newUrl = currentUrl.replace('/p/', '/');

        window.location.replace(newUrl);
        return;
      }
    }

    const forn = urlParams.get('forn');

    this.hasFieldParam = currentUrl.includes('field');
    this.nameFornecedor = forn ? decodeURIComponent(forn) : null;
    this.idPasta = urlParams.get('idPasta');
    this.lojaForn = urlParams.get('loja');
    this.numSolic = urlParams.get('numSolic');
    this.numSolicPai = urlParams.get('numSolicP');

    if (this.hasFieldParam) {
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
    } else {
      this.startCountdown();
    }

    this.loadingForTable = false;
  }

  async ngOnInit() {
    this.loadingForTable = true;

    await this.loadDatasetForm();
    await this.loadDataset();
    await this.consultUser();
    await this.listarAnex();
    await this.datasetAnexSolic();

    this.loadingForTable = false;
  }

  public fData(dateString: any) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }

  public async listarAnex() {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const params = new URLSearchParams(url.search);
    const codValue = params.get('cod');

    const constraint = [
      {
        _field: 'activeVersion',
        _initialValue: true,
        _finalValue: true,
        _type: 1,
      },
      {
        _field: 'parentDocumentId',
        _initialValue: this.idPasta,
        _finalValue: this.idPasta,
        _type: 1,
      },
    ];

    const response = await this.service
      .loadDatasetGED('document', constraint, ['documentDescription'])
      .toPromise();

    const resp = response.content.values;

    this.anexosGED = resp
      .filter((item: any) => {
        const documentDescription = item.documentDescription as string;
        return documentDescription.slice(0, 6) == codValue;
      })
      .map((item: any) => ({
        documentId: item['documentPK.documentId'],
        documentDescription: item.documentDescription,
      }));
  }

  public deletAnx(id: any) {
    Swal.fire({
      title: 'Tem certeza que deseja excluir esse anexo?',
      icon: 'question',
      showCancelButton: true,
      cancelButtonText: 'Voltar',
      confirmButtonText: 'Confirmar',
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#b32b23',
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.service.delete(id).subscribe(async (res: any) => {
          Swal.fire({
            title: 'Sucesso!',
            text: 'Anexo excluído.',
            icon: 'success',
            showCancelButton: false,
            confirmButtonColor: `#2563EB`,
            confirmButtonText: 'Confirmar',
          });

          await this.listarAnex();
        });
      } else if (result.isDenied) {
        Swal.fire('Changes are not saved', '', 'info');
      }
    });
  }

  public validateProduct(product: any, data: any): string[] {
    const requiredFields = [
      { field: 'Desc', label: 'Desc' },
      { field: 'QtdFornecida', label: 'Quant. Fornecida' },
      { field: 'Preco', label: 'Val. Unit.' },
      // { field: 'Condicao', label: 'Cond. Pgto.' },
      { field: 'Prazo', label: 'Prazo' },
      // { field: 'Validade', label: 'Validade' },
    ];

    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!product[field.field] && product[field.field] !== 0) {
        missingFields.push(field.label);
      }
    }

    if (
      product.TipoFrete &&
      !product.ValorFrete &&
      product.ValorFrete !== 0 &&
      product.TipoFrete == 'F'
    ) {
      missingFields.push('Val. Frete');
    }

    if (product.QtdFornecida > data.Quantidade) {
      missingFields.push('Quant. Fornecida excede a quantidade permitida');
    }

    return missingFields;
  }

  public validateProductForn(product: any): string[] {
    const requiredFields = [
      { field: 'CondPagamento', label: 'Cond. Pagamento' },
      { field: 'Validade', label: 'Validade' },
      { field: 'TipoFrete', label: 'Tipo Frete' },
    ];

    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!product[field.field] && product[field.field] !== 0) {
        missingFields.push(field.label);
      }
    }

    if (
      product.TipoFrete &&
      !product.ValorFrete &&
      product.ValorFrete !== 0 &&
      product.TipoFrete == 'F'
    ) {
      missingFields.push('Val. Frete');
    }

    return missingFields;
  }

  public onRowEditInit(product: any, data: any) {
    this.editModal = { ...product };

    this.clonedProducts[product.Desc as string] = { ...product };

    product.editing = true;

    this.missingFields = this.validateProduct(product, data);

    if (this.missingFields.length > 0) {
      product.checkSaved = true;
    } else {
      product.checkSaved = false;
    }
  }

  public onRowEditSave(product: any, data: any) {
    this.missingFields = this.validateProduct(product, data);

    if (this.missingFields.length > 0) {
      product.checkSaved = true;
    } else {
      product.checkSaved = false;
    }

    if (product.checkSaved) {
      product.editing = false;

      this.messageService.add({
        severity: 'error',
        summary: 'Erro!',
        detail: `Não foi possível realizar o update. Preencha os seguintes campos obrigatórios: ${this.missingFields.join(
          ', '
        )}.`,
      });

      return;
    }

    delete this.clonedProducts[product.Desc as string];
    product.editing = false;
    product.checkSaved = false;

    if (product.Preco && !isNaN(product.Preco)) {
      product.Preco = parseFloat(product.Preco).toFixed(6);
    } else {
      product.Preco = '';
    }

    if (product.ValorFrete && !isNaN(product.ValorFrete)) {
      product.ValorFrete = parseFloat(product.ValorFrete).toFixed(2);
    } else {
      product.ValorFrete = '';
    }

    if (product.Seguro && !isNaN(product.Seguro)) {
      product.Seguro = parseFloat(product.Seguro).toFixed(2);
    } else {
      product.Seguro = '';
    }

    if (product.IPI && !isNaN(product.IPI)) {
      product.IPI = parseFloat(product.IPI).toFixed(2);
    } else {
      product.IPI = '';
    }

    if (product.Despesa && !isNaN(product.Despesa)) {
      product.Despesa = parseFloat(product.Despesa).toFixed(2);
    } else {
      product.Despesa = '';
    }

    const updatedCotacaoIndex = data.Cotacao.findIndex(
      (cotacao: any) =>
        cotacao.Produto.trim() == product.Codigo.trim() &&
        cotacao.Fornecedor == product.Fornecedor &&
        cotacao.Loja == product.Loja
    );

    if (updatedCotacaoIndex !== -1) {
      data.Cotacao[updatedCotacaoIndex] = {
        ...data.Cotacao[updatedCotacaoIndex],
        ...product,
      };
    }

    try {
      console.log(data)
      console.log(data.Cotacao)
      const documentData = {
        values: data.Cotacao.map((cotacao: any, index: number) => {
          const isMatchingCotacao =
            cotacao.Produto.trim() == product.Codigo.trim() &&
            cotacao.Fornecedor == this.fornecedorCod &&
            cotacao.Loja == this.fornecedorLoja;

          const isSameProductFamily =
            cotacao.Produto.trim().substring(0, 8) ==
            product.Produto.trim().substring(0, 8) &&
            cotacao.Fornecedor == this.fornecedorCod &&
            cotacao.Loja == this.fornecedorLoja;

          return [
            {
              fieldId: `C8_CICLO___${index + 1}`,
              value: isMatchingCotacao ? product.Ciclo : cotacao.Ciclo,
            },
            {
              fieldId: `BEN_FISCAL___${index + 1}`,
              value: isMatchingCotacao
                ? product.BeneficioFiscal
                : cotacao.BeneficioFiscal,
            },
            {
              fieldId: `C8_ITEM___${index + 1}`,
              value: isMatchingCotacao ? product.Item : cotacao.Item,
            },
            {
              fieldId: `C8_PRODUTO___${index + 1}`,
              value: isMatchingCotacao ? product.Produto : cotacao.Produto,
            },
            {
              fieldId: `C8_UM___${index + 1}`,
              value: isMatchingCotacao ? product.UM : cotacao.UM,
            },
            {
              fieldId: `C8_FORNECE___${index + 1}`,
              value: isMatchingCotacao
                ? product.Fornecedor
                : cotacao.Fornecedor,
            },
            {
              fieldId: `C8_LOJA___${index + 1}`,
              value: isMatchingCotacao ? this.fornecedorLoja : cotacao.Loja,
            },
            {
              fieldId: `C8_QUANT___${index + 1}`,
              value: isMatchingCotacao
                ? product.QtdFornecida
                : isSameProductFamily
                  ? ''
                  : cotacao.QtdFornecida,
            },
            {
              fieldId: `C8_PRECO___${index + 1}`,
              value: isMatchingCotacao
                ? product.Preco
                : isSameProductFamily
                  ? ''
                  : cotacao.Preco,
            },
            {
              fieldId: `C8_TOTAL___${index + 1}`,
              value: isMatchingCotacao
                ? product.Total
                : isSameProductFamily
                  ? ''
                  : cotacao.Total,
            },
            {
              fieldId: `C8_COND___${index + 1}`,
              value: isMatchingCotacao
                ? product.Condicao
                : isSameProductFamily
                  ? ''
                  : cotacao.Condicao,
            },
            {
              fieldId: `C8_PRAZO___${index + 1}`,
              value: isMatchingCotacao
                ? product.Prazo
                : isSameProductFamily
                  ? ''
                  : cotacao.Prazo,
            },
            {
              fieldId: `C8_FILENT___${index + 1}`,
              value: isMatchingCotacao
                ? product.FilialEntrega
                : isSameProductFamily
                  ? ''
                  : cotacao.FilialEntrega,
            },
            {
              fieldId: `C8_EMISSAO___${index + 1}`,
              value: isMatchingCotacao ? product.Emissao : cotacao.Emissao,
            },
            {
              fieldId: `C8_VALIPI___${index + 1}`,
              value: isMatchingCotacao
                ? product.IPI
                : isSameProductFamily
                  ? ''
                  : cotacao.IPI,
            },
            {
              fieldId: `C8_VALICM___${index + 1}`,
              value: isMatchingCotacao
                ? product.ICMS
                : isSameProductFamily
                  ? ''
                  : cotacao.ICMS,
            },
            {
              fieldId: `C8_VALISS___${index + 1}`,
              value: isMatchingCotacao
                ? product.ISS
                : isSameProductFamily
                  ? ''
                  : cotacao.ISS,
            },
            {
              fieldId: `C8_DIFAL___${index + 1}`,
              value: isMatchingCotacao
                ? product.DIFAL
                : isSameProductFamily
                  ? ''
                  : cotacao.DIFAL,
            },
            {
              fieldId: `C8_SEGURO___${index + 1}`,
              value: isMatchingCotacao
                ? product.Seguro
                : isSameProductFamily
                  ? ''
                  : cotacao.Seguro,
            },
            {
              fieldId: `C8_DESPESA___${index + 1}`,
              value: isMatchingCotacao
                ? product.Despesa
                : isSameProductFamily
                  ? ''
                  : cotacao.Despesa,
            },
            {
              fieldId: `C8_VALFRE___${index + 1}`,
              value: isMatchingCotacao
                ? product.ValorFrete
                : isSameProductFamily
                  ? ''
                  : cotacao.ValorFrete,
            },
            {
              fieldId: `C8_TPFRETE___${index + 1}`,
              value: isMatchingCotacao
                ? product.TipoFrete
                : isSameProductFamily
                  ? ''
                  : cotacao.TipoFrete,
            },
            {
              fieldId: `C8_VALIDA___${index + 1}`,
              value: isMatchingCotacao ? product.Validade : cotacao.Validade,
            },
            {
              fieldId: `C8_NUMPED___${index + 1}`,
              value: isMatchingCotacao
                ? product.Pedido
                : isSameProductFamily
                  ? ''
                  : cotacao.Pedido,
            },
            {
              fieldId: `C8_ITEMPED___${index + 1}`,
              value: isMatchingCotacao
                ? product.ItemPedido
                : isSameProductFamily
                  ? ''
                  : cotacao.ItemPedido,
            },
          ];
        }).flat(),
      };



      this.service
        .updateCotacion(
          this.documentIdCotacion,
          this.cardIdCotacion,
          documentData
        )
        .subscribe((res: any) => {
          data.ProdutoAttUp = data.ProdutoAttUp.map((item: any) =>
            item.Codigo.trim() == product.Codigo.trim() &&
              item.Fornecedor == product.Fornecedor &&
              item.Loja == product.Loja
              ? { ...item, ...product }
              : {
                ...item,
                Descricao: item.Descricao,
                Loc: item.Loc,
                Desc: item.Desc,
                Tipo: item.Tipo,
                ProdutoPai: item.ProdutoPai,
                Uprc: item.Uprc,
                Ucom: item.Ucom,
                Codigo: item.Codigo,
                Marca: item.Marca,
                Grupo: item.Grupo,
                Um: item.Um,
                Msb: item.Msb,
                QtdFornecida: '',
                Ciclo: '',
                BeneficioFiscal: '',
                DIFAL: '',
                Emissao: '',
                FilialEntrega: '',
                Fornecedor: item.Fornecedor,
                Item: '',
                ICMS: '',
                IPI: '',
                ISS: '',
                ItemPedido: '',
                Loja: '',
                Pedido: '',
                Produto: item.Produto,
                Total: '',
                UM: item.UM,
                Condicao: '',
                Preco: '',
                ValorFrete: '',
                TipoFrete: '',
                Prazo: '',
                Seguro: '',
                Despesa: '',
                Validade: '',
                IdRow: item.IdRow,
                editing: '',
                checkSaved: '',
              }
          );

          this.productFilhoTable = data.ProdutoAttUp;

          this.valueFinish.forEach((item: any, id: any) => {
            item.Cotacao.forEach((cotacao: any, index: any) => {
              if (
                cotacao.Produto.trim() == product.Produto.trim() &&
                cotacao.Fornecedor == product.Fornecedor &&
                cotacao.Loja == product.Loja
              ) {
                this.valueFinish[id].Cotacao[index] = {
                  ...this.valueFinish[id].Cotacao[index],
                  ...product,
                };
              }
            });
          });

          data.StatusCot = 'Preenchido';

          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso!',
            detail: 'Produto atualizado.',
          });

          this.cdr.detectChanges();

          this.dialogVisible = false;
        });
    } catch (error) {
      console.log('ERROR', error);
    }
  }

  public onRowEditCancel(product: any, index: number) {
    const emptyProduct = {
      Desc: '',
      editing: false,
      checkSaved: '',
      Descricao: '',
      Loc: '',
      Tipo: '',
      ProdutoPai: '',
      Uprc: '',
      Ucom: null,
      Codigo: '',
      Marca: '',
      Grupo: '',
      Um: '',
      Msb: '',
      QtdFornecida: '',
      Ciclo: '',
      BeneficioFiscal: '',
      DIFAL: '',
      Emissao: '',
      FilialEntrega: '',
      Fornecedor: '',
      Item: '',
      ICMS: '',
      IPI: '',
      ISS: '',
      ItemPedido: '',
      Loja: '',
      Pedido: '',
      Produto: '',
      Total: '',
      UM: '',
      Condicao: '',
      Preco: '',
      ValorFrete: '',
      TipoFrete: '',
      Prazo: '',
      Seguro: '',
      Despesa: '',
      Validade: '',
      IdRow: 0, // Ou algum valor padrão adequado
    };

    // Procurar o primeiro produto com QtdFornecida, IPI, Prazo e Preco preenchidos
    const productWithValues = this.prodAttUp.find(
      (item: any) => item.QtdFornecida && item.IPI && item.Prazo && item.Preco
    );

    if (productWithValues) {
      this.productFilhoTable[index] = {
        ...productWithValues,
        editing: false,
        checkSaved: '',
      };
    } else {
      this.productFilhoTable[index] = { ...emptyProduct };
    }

    Object.assign(product, this.productFilhoTable[index]);
  }

  public onRowEditInitForn(product: any) {
    this.editModal = { ...product };

    this.clonedProducts[product.CondPagamento as string] = { ...product };

    product.editing = true;

    this.missingFields = this.validateProductForn(product);

    if (this.missingFields.length > 0) {
      product.checkSaved = true;
    } else {
      product.checkSaved = false;
    }
  }

  public onRowEditCancelForn(product: any, index: number) {
    if (product.CondPagamento) {
      const productId = product.CondPagamento;

      if (this.clonedProducts && this.clonedProducts[productId]) {
        this.products[index] = { ...this.clonedProducts[productId] };
        delete this.clonedProducts[productId];
      } else {
        console.error('Produto clonado não encontrado.');
      }

      Object.assign(product, this.editModal);
      product.editing = false;
      product.checkSaved = '';
    } else {
      console.error('ID do produto não encontrado.');
    }
  }

  public onRowEditSaveForn(product: any, data: any) {
    this.missingFields = this.validateProductForn(product);

    if (this.missingFields.length > 0) {
      product.checkSaved = true;
    } else {
      product.checkSaved = false;
    }

    if (product.checkSaved) {
      product.editing = false;

      this.messageService.add({
        severity: 'error',
        summary: 'Erro!',
        detail: `Não foi possível realizar o update. Preencha os seguintes campos obrigatórios: ${this.missingFields.join(
          ', '
        )}.`,
      });

      return;
    }

    delete this.clonedProducts[product.Desc as string];

    product.editing = false;
    product.checkSaved = false;

    if (product.ValorFrete && !isNaN(product.ValorFrete)) {
      product.ValorFrete = parseFloat(product.ValorFrete).toFixed(2);
    } else {
      product.ValorFrete = '';
    }

    const updatedFornIndex = data[0].ForneAll.findIndex(
      (fornecedor: any) =>
        fornecedor.Codigo == product.Codigo && fornecedor.Loja == product.Loja
    );

    if (updatedFornIndex !== -1) {
      data[0].ForneAll[updatedFornIndex] = {
        ...data[0].ForneAll[updatedFornIndex],
        ...product,
      };
    }

    try {
      const documentData = {
        values: data[0].ForneAll.map((fornecedor: any, index: number) => {
          const isMatchingFornecedor =
            fornecedor.Codigo == this.fornecedorCod
            && fornecedor.Loja == this.fornecedorLoja;

          return [
            {
              fieldId: `A2_COD___${index + 1}`,
              value: isMatchingFornecedor ? product.Codigo : fornecedor.Codigo,
            },
            {
              fieldId: `A2_LOJA___${index + 1}`,
              value: isMatchingFornecedor ? product.Loja : fornecedor.Loja,
            },
            {
              fieldId: `A2_NOME___${index + 1}`,
              value: isMatchingFornecedor
                ? product.Descricao
                : fornecedor.Descricao,
            },
            {
              fieldId: `A2_CGC___${index + 1}`,
              value: isMatchingFornecedor ? product.CNPJ : fornecedor.CNPJ,
            },
            {
              fieldId: `A2_EST___${index + 1}`,
              value: isMatchingFornecedor ? product.UF : fornecedor.UF,
            },
            {
              fieldId: `A2_COND___${index + 1}`,
              value: isMatchingFornecedor
                ? product.CondPagamento
                : fornecedor.CondPagamento,
            },
            {
              fieldId: `A2_TPFRETE___${index + 1}`,
              value: isMatchingFornecedor
                ? product.TipoFrete
                : fornecedor.TipoFrete,
            },
            {
              fieldId: `A2_VALFRE___${index + 1}`,
              value: isMatchingFornecedor
                ? product.ValorFrete
                : fornecedor.ValorFrete,
            },
            {
              fieldId: `A2_VALIDA___${index + 1}`,
              value: isMatchingFornecedor
                ? product.Validade
                : fornecedor.Validade,
            },
            {
              fieldId: `A2_NOTIFICA___${index + 1}`,
              value: isMatchingFornecedor
                ? product.Notificacao
                : fornecedor.Notificacao,
            },
          ];
        }).flat(),
      };

      data[0].ScAll.forEach((sc: any, index: number) => {
        documentData.values.push(
          {
            fieldId: `C1_ITEM___${index + 1}`,
            value: sc.Item,
          },
          {
            fieldId: `C1_PRODUTO___${index + 1}`,
            value: sc.Produto,
          },
          {
            fieldId: `C1_UM___${index + 1}`,
            value: sc.UM,
          },
          {
            fieldId: `C1_DESCRI___${index + 1}`,
            value: sc.Descricao,
          },
          {
            fieldId: `C1_QUANT___${index + 1}`,
            value: sc.Quantidade,
          },
          {
            fieldId: `C1_PRECO___${index + 1}`,
            value: sc.Preco,
          },
          {
            fieldId: `C1_TOTAL___${index + 1}`,
            value: sc.Total,
          }
        );
      });

      data[0].ForneProdAll.forEach((forneProd: any, index: number) => {
        documentData.values.push(
          {
            fieldId: `A5_PRODUTO___${index + 1}`,
            value: forneProd.Produto,
          },
          {
            fieldId: `A5_NOMPROD___${index + 1}`,
            value: forneProd.NomeProduto,
          },
          {
            fieldId: `A5_NOMEFOR___${index + 1}`,
            value: forneProd.NomeFornecedor,
          },
          {
            fieldId: `A5_FORNECE___${index + 1}`,
            value: forneProd.CodFornecedor,
          },
          {
            fieldId: `A5_LOJA___${index + 1}`,
            value: forneProd.Loja,
          }
        );
      });

      data[0].ProdutoAll.forEach((produtoFilho: any, index: number) => {
        documentData.values.push(
          {
            fieldId: `B1_COD___${index + 1}`,
            value: produtoFilho.Codigo,
          },
          {
            fieldId: `B1_PAI___${index + 1}`,
            value: produtoFilho.ProdutoPai,
          },
          {
            fieldId: `B1_DESC___${index + 1}`,
            value: produtoFilho.Descricao,
          },
          {
            fieldId: `B1_GRUPO___${index + 1}`,
            value: produtoFilho.Grupo,
          },
          {
            fieldId: `B1_LOCPAD___${index + 1}`,
            value: produtoFilho.Loc,
          },
          {
            fieldId: `B1_MSBLQL___${index + 1}`,
            value: produtoFilho.Msb,
          },
          {
            fieldId: `B1_TIPO___${index + 1}`,
            value: produtoFilho.Tipo,
          },
          {
            fieldId: `B1_UM___${index + 1}`,
            value: produtoFilho.Um,
          },
          {
            fieldId: `B1_ZMARCA___${index + 1}`,
            value: produtoFilho.Marca,
          },
          {
            fieldId: `ZPM_DESC___${index + 1}`,
            value: produtoFilho.Desc,
          },
          {
            fieldId: `B1_UPRC___${index + 1}`,
            value: produtoFilho.Uprc,
          },
          {
            fieldId: `B1_UCOM___${index + 1}`,
            value: produtoFilho.Ucom,
          }
        );
      });

      data[0].TesAll.forEach((tes: any, index: number) => {
        documentData.values.push(
          {
            fieldId: `TES_A2_COD___${index + 1}`,
            value: tes.A2_COD,
          },
          {
            fieldId: `TES_A2_LOJA___${index + 1}`,
            value: tes.A2_LOJA,
          },
          {
            fieldId: `TES_A2_CGC___${index + 1}`,
            value: tes.A2_CGC,
          },
          {
            fieldId: `TES_B1_COD___${index + 1}`,
            value: tes.B1_COD,
          },
          {
            fieldId: `TES_CODIGO___${index + 1}`,
            value: tes.TES_CODIGO,
          },
          {
            fieldId: `TES_COMPRADOR___${index + 1}`,
            value: tes.TES_COMPRADOR,
          }
        );
      });

      this.service
        .updateCotacion(
          this.documentIdForn,
          this.cardIdForn,
          documentData
        )
        .subscribe((res: any) => {
          this.valueFinish.forEach((item: any, id: any) => {
            item.ForneAll.forEach((fornecedor: any, index: any) => {
              if (
                fornecedor.Codigo == this.fornecedorCod &&
                fornecedor.Loja == this.fornecedorLoja
              ) {
                this.valueFinish[id].ForneAll[index] = {
                  ...this.valueFinish[id].ForneAll[index],
                  ...product,
                };
              }
            });
          });

          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso!',
            detail: 'Cabeçalho atualizado.',
          });

          this.validateFields = true;
        });
    } catch (error) {
      console.log('ERROR', error);
    }
  }

  validatePositiveValue(child: any, field: any): void {
    if (child[field] < 0) {
      child[field] = 0;
    }
  }

  preventNegativeInput(event: KeyboardEvent): void {
    const invalidKeys = ['-', 'e', '+'];
    if (invalidKeys.includes(event.key)) {
      event.preventDefault();
    }
  }


  public startCountdown() {
    const countdownDuration = 5;
    let seconds = countdownDuration;
    const url =
      window.location.origin + '/portal/1/portal_cotacao';
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

  public backPrice() {
    const url =
      window.location.origin + '/portal/1/portal_cotacao';

    window.location.href = url;
  }

  private async loadDatasetUser() {
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

      this.valueDs = response;
    } catch (error) {
      console.error('Erro ao carregar o dataset:', error);
      throw error;
    }
  }

  public async consultUser() {
    try {
      await this.loadDatasetUser();

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

  public getTokenFromLocalStorage(): string | null {
    return localStorage.getItem('token');
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
              window.location.origin + '/portal/1/portal_auth';

            window.location.href = url;
          });
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async loadDataset() {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const params = new URLSearchParams(url.search);
    const valueUrl = params.get('field');
    const valueSolCotUrl = params.get('numSolic');
    const fieldValue = valueUrl?.toString();
    const fieldValueCotSol = valueSolCotUrl?.toString();
    this.cardIdCotacion = params.get('idCot')?.toString();
    this.cardIdForn = fieldValue;
    const codValue = params.get('cod');
    const lojValue = params.get('loja');

    this.fornecedorCod = codValue?.toString() || '';
    this.fornecedorLoja = lojValue?.toString() || '';

    try {
      const [
        responseCond,
        responseAll,
        responseForner,
        responseFornerProd,
        responseProdAll,
        reponseTesAll,
      ] = await Promise.all([
        this.service.loadDataset('DS_CONDICAO_PAGAMENTO', []).toPromise(),
        this.service
          .loadDataset('DS_CTC_ALL', [
            {
              _field: 'numeroSolicitacao',
              _initialValue: params.get('numSolic')?.toString(),
              _finalValue: params.get('numSolic')?.toString(),
              _type: 1,
            }, {
              _field: 'fornecedor',
              _initialValue: params.get('cod')?.toString(),
              _finalValue: params.get('cod')?.toString(),
              _type: 1,
            }, {
              _field: 'loja',
              _initialValue: params.get('loja')?.toString(),
              _finalValue: params.get('loja')?.toString(),
              _type: 1,
            },
          ])
          .toPromise(),
        this.service
          .loadDataset('DS_ALL_FORN', [
            {
              _field: 'solicitacao',
              _initialValue: fieldValue,
              _finalValue: fieldValue,
              _type: 1,
            }, {
              _field: 'fornecedor',
              _initialValue: params.get('cod')?.toString(),
              _finalValue: params.get('cod')?.toString(),
              _type: 1,
            }, {
              _field: 'loja',
              _initialValue: params.get('loja')?.toString(),
              _finalValue: params.get('loja')?.toString(),
              _type: 1,
            },
          ])
          .toPromise(),
        this.service
          .loadDataset('DS_FORNE_PRODUTO_ALL', [
            {
              _field: 'solicitacao',
              _initialValue: fieldValue,
              _finalValue: fieldValue,
              _type: 1,
            }, {
              _field: 'fornecedor',
              _initialValue: params.get('cod')?.toString(),
              _finalValue: params.get('cod')?.toString(),
              _type: 1,
            }, {
              _field: 'loja',
              _initialValue: params.get('loja')?.toString(),
              _finalValue: params.get('loja')?.toString(),
              _type: 1,
            },
          ])
          .toPromise(),
        this.service
          .loadDataset('DS_PRODUTO_ALL', [
            {
              _field: 'solicitacao',
              _initialValue: fieldValue,
              _finalValue: fieldValue,
              _type: 1,
            },
          ])
          .toPromise(),
        this.service
          .loadDataset('DS_TABTES_COTACAO', [
            {
              _field: 'solicitacao',
              _initialValue: fieldValue,
              _finalValue: fieldValue,
              _type: 1,
            },
          ])
          .toPromise(),
      ]);

      const cotac = responseAll.content.values;

      const uniqueProducts = cotac.filter(
        (product: any, index: any, self: any) =>
          index ===
          self.findIndex(
            (p: any) => p.Produto.trim() === product.Produto.trim()
          )
      );

      uniqueProducts.forEach((product: any) => {
        product.Cotacao = responseAll.content.values;
        product.ProdutoAll = responseProdAll.content.values;
        product.ForneProdAll = responseFornerProd.content.values;
        product.ForneAll = responseForner.content.values;
        product.TesAll = reponseTesAll.content.values;
      });

      this.optionsCondicao = responseCond.content.values;

      this.valueProduct = uniqueProducts;

      const productPromises = this.valueProduct.map(
        async (product: any, index: any) => {
          try {
            if (
              responseProdAll &&
              responseProdAll.content &&
              responseProdAll.content.values
            ) {
              const allProductValues = responseProdAll.content?.values || [];

              const productResponse = allProductValues.filter(
                (productP: any) => productP.Codigo === product.Produto.trim()
              );
              const cotacoesFornecedor = cotac.filter(
                (cotacItem: any) =>
                  cotacItem.Fornecedor === this.fornecedorCod &&
                  cotacItem.Loja == this.fornecedorLoja
              );

              const lok = productResponse;
              const lokCodigos = lok.map((item: any) => item.Codigo.trim());
              const cotacoesFiltradas = cotacoesFornecedor.filter(
                (cotacItem: any) =>
                  lokCodigos.includes(cotacItem.Produto.trim())
              );

              var lengthCotacoes = cotacoesFiltradas.length;

              const produtosEncontrados = productResponse.filter(
                (productItem: any, index: number) =>
                  cotacoesFornecedor.some(
                    (cotacItem: any) =>
                      productItem.Codigo.trim() === cotacItem.Produto.trim()
                  ) && index < lengthCotacoes
              );

              product.Id = index + 1;

              if (produtosEncontrados.length > 0) {
                product.ProdutoFilho = produtosEncontrados;

                product.DescricaoProduto =
                  produtosEncontrados[0].Descricao || '';

                product.CodProd = produtosEncontrados[0].ProdutoPai || '';

                product.ProdutoAttUp = produtosEncontrados.map(
                  (prodEncontrado: any) => {
                    const cotacItem = cotacoesFornecedor.find(
                      (cotacItem: any) => {
                        const produtoTrimmed = cotacItem.Produto.trim();

                        return produtoTrimmed == prodEncontrado.Codigo;
                      }
                    );

                    const desc =
                      prodEncontrado.Desc !== ''
                        ? prodEncontrado.Desc
                        : prodEncontrado.Descricao;

                    return {
                      ...prodEncontrado,
                      Desc: desc,
                      QtdFornecida: cotacItem?.QtdFornecida || '',
                      Ciclo: cotacItem?.Ciclo || '',
                      BeneficioFiscal: cotacItem?.BeneficioFiscal || '',
                      DIFAL: cotacItem?.DIFAL || '',
                      Emissao: cotacItem?.Emissao || '',
                      FilialEntrega: cotacItem?.FilialEntrega || '',
                      Fornecedor: cotacItem?.Fornecedor || '',
                      Item: cotacItem?.Item || '',
                      ICMS: cotacItem?.ICMS || '',
                      IPI: cotacItem?.IPI || '',
                      ISS: cotacItem?.ISS || '',
                      ItemPedido: cotacItem?.ItemPedido || '',
                      Loja: cotacItem?.Loja || '',
                      Pedido: cotacItem?.Pedido || '',
                      Produto: cotacItem?.Produto || '',
                      Total: cotacItem?.Total || '',
                      UM: cotacItem?.UM || '',
                      Condicao: cotacItem?.Condicao || '',
                      Preco: cotacItem?.Preco || '',
                      ValorFrete: cotacItem?.ValorFrete || '',
                      TipoFrete: cotacItem?.TipoFrete || '',
                      Prazo: cotacItem?.Prazo || '',
                      Seguro: cotacItem?.Seguro || '',
                      Despesa: cotacItem?.Despesa || '',
                      Validade: cotacItem?.Validade || '',
                      IdRow: index + 1 || product?.Id,
                      editing: '',
                      checkSaved: '',
                    };
                  }
                );
              } else {
                product.Cotacao = [];
                product.ProdutoFilho = [];
                product.DescricaoProduto = '';
                product.CodProd = '';
                product.ProdutoAttUp = [];
              }
            }
          } catch (productError) {
            console.error(
              'Erro ao carregar o dataset para o produto:',
              product.Produto,
              productError
            );
            throw productError;
          }
        }
      );

      await Promise.all(productPromises);

      this.valueProduct = this.valueProduct.filter(
        (product: any) =>
          product.CodProd !== '' || product.Produto
      );

      try {
        const constraintsResponse = [
          {
            _field: 'solicitacao',
            _initialValue: fieldValue,
            _finalValue: fieldValue,
            _type: 1,
          },
        ];

        const quantidadeResponse = await this.service
          .loadDataset('DS_QUANTIDADE_PRODUTO', constraintsResponse)
          .toPromise();

        if (
          quantidadeResponse.content &&
          quantidadeResponse.content.values.length > 0
        ) {
          const quantidadeData = quantidadeResponse.content.values;

          this.valueProduct.forEach((product: any) => {
            const quantidadeItem = quantidadeData.find((q: any) => {
              return q.Produto.trim() === product.Produto.trim();
            });

            product.ScAll = quantidadeData;

            if (quantidadeItem) {
              product.Sc = quantidadeItem;
              product.Quantidade = quantidadeItem.Quantidade;
            } else {
              product.Sc = [];
              product.Quantidade = 0;
            }
          });
        }

        this.valueProduct = this.groupProductsByCodProd(this.valueProduct);

        this.valueProduct.forEach((product: any) => {
          const descricaoProduto = product.DescricaoProduto;
          const codigoProduto = product.Produto;

          if (!codigoProduto.startsWith('S')) {
            const regexDesc = new RegExp(
              product.ProdutoAttUp.map((item: any) => item.Desc).join('|'),
              'g'
            );

            product.DescPA = descricaoProduto.replace(regexDesc, '').trim();
          } else {
            product.DescPA = descricaoProduto;
          }

          const precoPreenchido = product.ProdutoAttUp.some(
            (item: any) => item.Preco !== '' && item.Preco !== '0.00'
          );
          product.StatusCot = precoPreenchido ? 'Preenchido' : 'Pendente';
        });

        this.valueFinish = this.valueProduct;

        const filteredFornecedor = responseForner.content.values;

        this.valueFornecedor = filteredFornecedor.filter(
          (fornecedor: any) =>
            fornecedor.Codigo == codValue && fornecedor.Loja == lojValue
        );

        this.valueFornecedor.forEach((child: any) => {
          if (
            child.CondPagamento == undefined ||
            child.CondPagamento == '' ||
            child.CondPagamento == null
          ) {
            child.CondPagamento = '010';
          }
        });

        const allFieldsComplete = this.valueFornecedor.every(
          (fornecedor: any) => {
            return this.isValueFornecedorComplete(fornecedor);
          }
        );

        this.validateFields = allFieldsComplete;
      } catch (quantidadeError) {
        console.error(
          'Erro ao carregar o dataset DS_QUANTIDADE_PRODUTO:',
          quantidadeError
        );
        throw quantidadeError;
      }
    } catch (error) {
      console.error('Erro ao carregar o dataset:', error);
      throw error;
    }
  }

  public isValueFornecedorComplete(fornecedor: any): boolean {
    const requiredFields = [
      'Descricao',
      'Validade',
      'Codigo',
      'CondPagamento',
      'CNPJ',
      'Loja',
    ];

    return requiredFields.every((field) => {
      const value = fornecedor[field];
      return value !== undefined && value !== '' && value !== null;
    });
  }

  private groupProductsByCodProd(products: any[]): any[] {
    const groupedProducts: any[] = [];

    products.forEach((product: any) => {
      if (!product.Produto.startsWith('S')) {
        const existingProduct = groupedProducts.find((p: any) => {
          return (
            p.CodProd == product.CodProd ||
            p.Produto.trim() == product.Produto.trim()
          );
        });

        if (existingProduct) {
          existingProduct.ProdutoFilho.push(...product.ProdutoFilho);
          existingProduct.ProdutoAttUp.push(...product.ProdutoAttUp);
        } else {
          groupedProducts.push({
            ...product,
            ProdutoFilho: [...product.ProdutoFilho],
            ProdutoAttUp: [...product.ProdutoAttUp],
          });
        }
      } else {
        groupedProducts.push(product);
      }
    });

    return groupedProducts;
  }

  public toggleRow(product: any) {
    this.edit = false;

    if (this.expandedRows[product.Id]) {
      delete this.expandedRows[product.Id];
    } else {
      this.expandedRows = { [product.Id]: true };
    }
  }

  public onFileSelected(event: any, product: any) {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const params = new URLSearchParams(url.search);
    const codValue = params.get('cod');
    const loja = this.lojaForn;
    const file: File = event.currentFiles[0];

    if (file) {
      const fileExtension: any = file.name.split('.').pop();
      const fileNameWithoutExtension = file.name.slice(
        0,
        -fileExtension.length - 1
      );
      const newFileName = `${codValue + loja} | ${product.CodProd} | ${product.DescPA
        } | ${fileNameWithoutExtension}.${fileExtension}`;

      const formData = new FormData();
      formData.append('file', file, newFileName);

      product.formDataAnx = formData;
      product.viewFile = newFileName;
    }
  }

  public sendGED(product: any) {
    const formData = product.formDataAnx;
    const newFileName = product.viewFile;

    this.service
      .uploadFile(formData)
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.createDocument(product, newFileName, newFileName);
        },
        error: (ex) => {
          console.log(ex);
          Swal.fire({ icon: 'error', titleText: 'Oops...', html: ex });
        },
      });
  }

  public createDocument(product: any, description: string, fileName: string) {
    this.service
      .createDocument(this.idPasta, description, fileName)
      .pipe(first())
      .subscribe({
        next: async (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Arquivo publicado no GED.',
          });

          product.formDataAnx = null;
          product.viewFile = null;

          this.clearFileUpload(product);

          await this.listarAnex();
        },
        error: (ex) => {
          console.log(ex);
          Swal.fire({ icon: 'error', titleText: 'Oops...', html: ex });
        },
      });
  }

  public clearFileUpload(product: any) {
    product.formDataAnx = null;
    product.viewFile = null;

    const index = this.valueFinish.indexOf(product);
    if (index !== -1 && this.fileUploads.toArray()[index]) {
      this.fileUploads.toArray()[index].clear();
    }
  }

  public getCotacaoValue(cotacao: any[], field: string, child: any): any {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const params = new URLSearchParams(url.search);
    const codValue = params.get('cod');

    if (!cotacao || cotacao.length === 0) {
      return child[field];
    }

    for (const cot of cotacao) {
      if (
        cot.Produto.trim() == child.Codigo.trim() &&
        cot.Fornecedor.trim() == codValue
      ) {
        return cot[field];
      }
    }

    return child[field];
  }

  private async loadDatasetForm() {
    try {
      const currentUrl = window.location.href;
      const url = new URL(currentUrl);
      const params = new URLSearchParams(url.search);
      const valueUrl = params.get('field');
      const fieldValue = valueUrl?.toString();

      const constraints: any = [
        {
          _field: "metadata#id",
          _initialValue: fieldValue,
          _finalValue: fieldValue,
          _type: 1,
        }
      ];

      const response = await this.service
        .loadDataset('DSFormulariodoProcessodeCotacao', constraints)
        .toPromise();

      // Filtrar a resposta
      const filteredResponse = response.content.values.filter((item: any) => {
        return item.documentid == fieldValue && item['metadata#active'] == true;
      });

      this.valueForm = filteredResponse[0];
    } catch (error) {
      console.error('Erro ao carregar o dataset:', error);
      throw error;
    }
  }

  public showDialogEdit(productAttUp: any, product: any) {
    this.prodAttUp = productAttUp;

    const productWithValues = this.prodAttUp.find(
      (item: any) => item.QtdFornecida
    );

    if (productWithValues) {
      this.productFilhoTable = [
        {
          ...productWithValues,
          editing: false,
        },
      ];
    } else {
      this.productFilhoTable = [{ Desc: '', editing: false }];
    }

    this.productTable = product;
    this.titleModal = `${product.DescPA} | ${product.Quantidade} quantidade`;
    this.dialogVisible = true;

    this.optionsMarca = this.prodAttUp.map((item: any) => {
      return {
        label: item.Desc,
        value: item.Desc,
      };
    });
  }

  public onBrandChange(selectedValue: any) {
    if (!selectedValue) {
      this.productFilhoTable = [{ Desc: '', editing: false }];
    } else {
      const selectedProduct = this.prodAttUp.find((item: any) => {
        return item.Desc === selectedValue;
      });

      if (selectedProduct) {
        this.productFilhoTable = [
          {
            ...selectedProduct,
            editing: true,
            checkSaved: false,
          },
        ];
      } else {
        this.productFilhoTable = [{ Desc: '', editing: false }];
      }
    }

    this.cdr.detectChanges();
  }

  public openDocument(id: number) {
    const topWindow: any = window.top;

    const cfg = {
      url: '/ecm_documentview/documentView.ftl',
      maximized: true,
      title: 'Visualizador de Documentos',
      callBack: () => {
        topWindow.ECM.documentView.getDocument(id, 1000);
      },
      customButtons: [],
    };

    topWindow.ECM.documentView.panel = topWindow.WCMC.panel(cfg);
  }

  public onSelect(event: any) {
    this.newFileName = [];
    this.formDataAnx = [];

    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const params = new URLSearchParams(url.search);
    const codValue = params.get('cod');
    const loja = this.lojaForn;

    for (let i = 0; i < event.currentFiles.length; i++) {
      const file: File = event.currentFiles[i];

      if (file) {
        const fileExtension: any = file.name.split('.').pop();
        const fileNameWithoutExtension = file.name.slice(
          0,
          -fileExtension.length - 1
        );
        const newFileName = `${codValue + loja
          } | ${fileNameWithoutExtension}.${fileExtension}`;

        const formData = new FormData();
        formData.append('file', file, newFileName);

        this.newFileName.push(newFileName);
        this.formDataAnx.push(formData);
      }
    }
  }

  public onBeforeUpload() {
    this.onUpload();
  }

  public async onUpload() {
    try {
      await Promise.all(
        this.newFileName.map((fileName, index) =>
          this.sendGEDglob(fileName, this.formDataAnx[index])
        )
      );

      await this.listarAnex();

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Arquivo(s) publicado(s) no GED.',
      });

      this.newFileName = [];
      this.formDataAnx = [];
      this.fileUploadGlob.clear();
    } catch (error) {
      console.log(error);
    }
  }

  public sendGEDglob(newFileName: any, formDataAnx: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.service
        .uploadFile(formDataAnx)
        .pipe(first())
        .subscribe({
          next: async (response) => {
            try {
              await this.createDocumentGlob(newFileName, newFileName);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: (ex) => {
            reject(ex);
            Swal.fire({ icon: 'error', titleText: 'Oops...', html: ex });
          },
        });
    });
  }

  public createDocumentGlob(
    description: string,
    fileName: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.service
        .createDocument(this.idPasta, description, fileName)
        .pipe(first())
        .subscribe({
          next: async (response) => {
            resolve();
          },
          error: (ex) => {
            reject(ex);
            Swal.fire({ icon: 'error', titleText: 'Oops...', html: ex });
          },
        });
    });
  }

  public getDescricaoByCodigo(codigo: string): string {
    const option = this.optionsCondicao.find(
      (opt: any) => opt.CODIGO === codigo
    );
    return option ? option.DESCRICAO : codigo;
  }

  public getDescricaoByCodigoFrete(codigo: string): string {
    const option = this.optionsFrete.find((opt: any) => opt.code === codigo);

    return option ? option.name : codigo;
  }

  public verificarCondicaoDePagamento(event: any) {
    const selectedCodigo = event.value;
    const condicaoSelecionada = this.optionsCondicao.find(
      (option: any) => option.CODIGO === selectedCodigo
    );

    if (condicaoSelecionada && condicaoSelecionada.DESCRICAO !== '60 DIAS') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail:
          'A condição de pagamento selecionada, está fora da politica de compras do grupo JCA e será avaliada, podendo gerar a desclassificação do fornecedor.',
      });
    }
  }

  public async datasetAnexSolic() {
    const constraints = [
      {
        _field: 'instanceId',
        _initialValue: this.numSolicPai,
        _finalValue: this.numSolicPai,
        _type: 1,
      },
    ];

    const response = await this.service
      .loadDataset('ds_getEspecificacoesTecnicas', constraints)
      .toPromise();

    const data = response.content.values;

    this.anxSolic = data;
  }

  public openModalAnx() {
    this.visibleAnx = true;
  }
}
