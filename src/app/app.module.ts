import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// prime ng
import { BadgeModule } from 'primeng/badge';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { StyleClassModule } from 'primeng/styleclass';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MainService } from './service/main.service';
import { FluigOauthService } from './service/fluig-oauth.service';
import { NgxMaskModule } from 'ngx-mask';
import { CurrencyMaskModule } from 'ng2-currency-mask';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BadgeModule,
    NgxMaskModule.forRoot(),
    CurrencyMaskModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MenuModule,
    TableModule,
    StyleClassModule,
    PanelMenuModule,
    ButtonModule,
    DividerModule,
    CalendarModule,
    MultiSelectModule,
    TagModule,
    InputTextareaModule,
    RadioButtonModule,
    InputTextModule,
    DropdownModule,
    CheckboxModule,
    DialogModule,
    ToastModule,
    FileUploadModule,
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/portal/p/1/painel_precos' },
    MainService,
    FluigOauthService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
