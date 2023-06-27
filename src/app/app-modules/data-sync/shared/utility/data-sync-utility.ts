import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

export class DataSyncUtils {

    constructor(private fb: FormBuilder) { }

    GenerateBenIDsForm() {
        return this.fb.group({
            generateBenIDForm: this.createBenIDForm(),
        })
    }
    createBenIDForm() {
        return this.fb.group({
            benID_Range: null
        })
    }
}