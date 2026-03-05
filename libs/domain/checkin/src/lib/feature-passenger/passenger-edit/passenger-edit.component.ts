import { httpResource } from '@angular/common/http';
import { Component, computed, input, linkedSignal, numberAttribute } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { apply, createMetadataKey, form, FormField, metadata, required, schema } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { ClickLocal } from "@flight-demo/shared/navigation";
import { initialPassenger, Passenger } from '../../logic-passenger/model/passenger';
import { Address, addressSchema, initialAddress, AddressForm } from '@flight-demo/shared/core';

// Custom Field Property
const ALLOWED_FIRSTNAMES = createMetadataKey<string[]>();

// Step 3: Field Logic: Validators, Readonly, Disabled, Field Metadata
export const passengerSchema = schema<Passenger & {
  address: Address
}>(passengerPath => {
  metadata(passengerPath.firstName, ALLOWED_FIRSTNAMES, () => ['Mia', 'Hanna', 'Sofia']);
  required(passengerPath.firstName, {
    message: 'Either Firstname or Lastname needs to have a value.',
    when: ctx => !ctx.valueOf(passengerPath.name)
  });
  required(passengerPath.name, {
    message: 'Either Firstname or Lastname needs to have a value.',
    when: ctx => !ctx.valueOf(passengerPath.firstName)
  });
  /* validate(passengerPath.name, ({ value }) =>
    ['Sorglos', 'Müller', 'Schmidt'].includes(value())
      ? null
      : {
        kind: 'forbiddenLastname',
        message: 'This Lastname is not allowed.'
      }
  ); */
  apply(passengerPath.address, addressSchema);
});


@Component({
  selector: 'app-passenger-edit',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    // Step 4: UI Control -> Directive for Template Binding
    FormField,
    ClickLocal,
    AddressForm
],
  templateUrl: './passenger-edit.component.html'
})
export class PassengerEditComponent {
  readonly id = input(0, { transform: numberAttribute });

  // Step 1: Data Model -> Writable Signal, Resource Value
  protected readonly passengerResource = httpResource<Passenger>(() => ({
    url: 'https://demo.angulararchitects.io/api/passenger',
    params: { id: this.id() }
  }), { defaultValue: initialPassenger });
  protected readonly passengerWithAddress = linkedSignal(
    () => ({
      ...this.passengerResource.value(),
      address: initialAddress
    })
  );

  // Step 2: Field State -> valid, dirty, touched, value, etc. 
  protected readonly editForm = form(this.passengerWithAddress, passengerSchema);
  
  protected readonly allowedFirstnames = computed(() =>
    this.editForm.firstName().metadata(ALLOWED_FIRSTNAMES)?.()?.join(',') || ''
  );

  protected save(): void {
    console.log({
      from: this.editForm().value(),
      resource: this.passengerResource.value()
    });
  }
}
