import { LightningElement, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';
import getContacts from '@salesforce/apex/AccountController.getContacts';
import getContactsImperative from '@salesforce/apex/AccountController.getContactsImperative';
import { updateRecord } from 'lightning/uiRecordApi';
import { createRecord } from 'lightning/uiRecordApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import CONTACT_OBJECT from "@salesforce/schema/Contact";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const accRowActions = [
    { label: 'Delete', name: 'delete' },
]
const columns = [{
    label: 'First Name',
    fieldName: 'FirstName',
    editable: true
},
{
    label: 'Last Name',
    fieldName: 'LastName',
    editable: true
},
{
    label: 'Phone',
    fieldName: 'Phone',
    type: 'phone',
    editable: true
},
{
    type: 'action',
    typeAttributes: {
        rowActions: accRowActions
    }
}
];
export default class relatedContacts extends LightningElement {
    @track accountId = '';
    @track contacts;
    @track lstContacts;
    @track selectedContacts;
    @track seletedRecord;
    @track isModalOpen = false;
    @track contactRecord = {};
    @track isLoading = false;
    @track contactId;
    @track columns = columns;
    saveDraftValues = [];
   
    @wire(getAccounts) accounts;
    accountSelection(event) {
       
        const selectedAccount = event.target.value;
        this.accountId = event.target.value;
        if (selectedAccount != null) {
            getContacts({
                accountId: selectedAccount
            })
                .then(result => {
                    this.contacts = result;
                    console.log('result' + JSON.stringify(result) + selectedAccount);
                })
                .catch(error => {
                    this.error = error;
                });
        }
    }
    getAllContact(event) {       
        this.lstContacts;
        getContactsImperative()
        .then( data => {
            this.lstContacts = data;
        })
        .catch(error => {
            console.log(error);
        })        
    }
    handleRowAction(event) {
        let actionName = event.detail.action.name; 
        this.seletedRecord = {...event.detail.row} ;
        if(actionName == 'delete') {
            this.isModalOpen = true;
        }
    }

    handleRowSelection(event) {
        this.selectedContacts = event.detail.selectedRows;
    }

    deleteContact() {
        let recordId = this.seletedRecord.Id;
        deleteRecord(recordId)
        .then(() => {
            this.hideModal();
            this.getAllContact();
            this.dispatchEvent( 
                new ShowToastEvent( 
                    {
                        title: 'Success',
                        message: 'Record Deleted Successfully...!',
                        variant: 'success'
                    } 
                )
            )
        })
        .catch(error => {
            this.hideModal();
            this.dispatchEvent( 
                new ShowToastEvent( 
                    {
                        title: 'Error',
                        message: error.body.message,
                        variant: 'error'
                    } 
                )
            )
        })
    }
    handleSave(event) {
        this.saveDraftValues = event.detail.draftValues;
        const recordInputs = this.saveDraftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Records Updated Successfully!!',
                    variant: 'success'
                })
            );
            this.saveDraftValues = [];
        })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'An Error Occured While Updating!!',
                        variant: 'error'
                 })
            );
        })
            .finally(() => {
                this.saveDraftValues = [];
            });
    }
    handleChange(event) {
        this.contactRecord[event.target.name] = event.target.value;
    }
    createContact() {
        const fields = this.contactRecord;

        const recordInput = { apiName: CONTACT_OBJECT.objectApiName, fields };

        createRecord(recordInput)
            .then((contact) => {
                this.contactId = contact.id;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Success",
                        message: "Contact created successfully!",
                        variant: "success"
                    })
                );

                this.contactRecord = {};
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error creating record",
                        message: error.body.message,
                        variant: "error"
                    })
                );
            })
    }

    hideModal() {
        this.isModalOpen = false;
    }
} 