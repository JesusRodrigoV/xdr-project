import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { AppStore } from '@app/app.store';

@Component({
  selector: 'app-login',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    NgIf,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
  protected appStore = inject(AppStore);
  private fb = inject(FormBuilder);

  hidePassword = true;

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit() {
    console.log('Intentando logearme');
    if (this.loginForm.valid) {
      console.log('Formulario enviado:', this.loginForm.value);
      const { username, password } = this.loginForm.value;
      if (username === 'admin' && password === 'admin') {
        console.log('Credenciales correctas');
        this.appStore.login(); // Esto navegará automáticamente al dashboard
      } else {
        alert('Credenciales incorrectas');
      }
    }
  }
}
