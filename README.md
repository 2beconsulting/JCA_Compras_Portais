# REPOSITÓRIO COM OS PORTAIS DA JCA
-  CADA UMA DAS BRANCHS A SEGUIR, ESTÁ ACOMPANHANDO UMA ETAPA DIFERENTE DO PORTAL E QUE CONSEQUENTEMENTE É UMA APLICAÇÃO TOTALMENTE APARTADA
-  BUILD: PARA AMBOS, NA PASTA DO PROJETO, AO GERAR O NG BUILD, ESTE IRÁ  COMPILAR OS FONTES PARA SEREM ANEXADOS NA PASTA APP-ANGULAR DA WIDGET EM QUESTÃO
  - NO ARQUIVO ```angular.json ``` O PARÂMETRO OUTPUTPATH DEFINE ONDE SERÁ GERADO OS ARQUIVOS A SEREM COMPILADOS E POSTERIORMENTE LEVADOS PARA A PASTA APP-ANGULAR  

##  PORTALAUTH
WIDGET QUE VALIDA AS CREDENCIAIS INFORMADAS E SE OK E DENTRO DA VALIDADE, LIBERA ACESSO PARA LISTAR AS COTAÇÕES
IMPORTANTE SE ATENTAR AOS DADOS DAS PASTAS E/OU FORMULÁRIO DE CONTROLE ANTES DE GERAR O BUILD:
```
   * PROD
  public documentId: number = 746406;   * 
   * QA
  public documentId: number = 28855;   * 
   * DEV
  public documentId: number = 8006;   * 
```
##  PORTALCOTACAO
WIDGET RESPONSÁVEL POR LISTAR AS COTAÇÕES QUE ESTÃO ABERTAS E OS FORNECEDORES QUE ESTÃO VINCULADOS AO REPRESENTANTE LOGADO
IMPORTANTE SE ATENTAR AOS DADOS DAS PASTAS E/OU FORMULÁRIO DE CONTROLE ANTES DE GERAR O BUILD:
```
  * PROD
   public documentId: number = 746746 /** DSFormulariodaSolicitacaodeCompras  
   public documentIdUser: number = 746406 /** Pré Cadastro Authenticator  *
   QA
    public documentId: number = 27271 /** DSFormulariodaSolicitacaodeCompras  
    public documentIdUser: number = 28855 /** Pré Cadastro Authenticator  *
   DEV   
    public documentId: number = 9442 // DSFormulariodaSolicitacaodeCompras  
    public documentIdUser: number = 8006 // Pré Cadastro Authenticator  *
```



##  PORTALPRECO
WIDGET RESPONSÁVEL POR RECEBER OS ORÇAMENTOS DO FORNCEDOR QUE FOI SELECIONADO NA ETAPA ANTERIOR E ENTÃO ENVIÁ-LOS AO FLUIG.
IMPORTANTE SE ATENTAR AOS DADOS DAS PASTAS E/OU FORMULÁRIO DE CONTROLE ANTES DE GERAR O BUILD:

```
  * PROD
  public documentId: number = 746746
  public documentIdUser: number = 746406
  public documentIdForn: number = 746757
  public documentIdCotacion: number = 746754
  * QA
  public documentId: number = 27271
  public documentIdUser: number = 28855
  public documentIdForn: number = 27769
  public documentIdCotacion: number = 41603
  * DEV
  public documentId: number = 9442
  public documentIdUser: number = 8006
  public documentIdForn: number = 8008
  public documentIdCotacion: number = 8214 
```
