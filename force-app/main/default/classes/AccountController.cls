/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 08-14-2022
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class AccountController {

    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() {
        return [SELECT Id, Name FROM Account];
    }
    @AuraEnabled
    public static List<Contact> getContacts(String accountId){
        return [Select Id,FirstName,LastName,Email,Phone from Contact where accountId=:accountId];
         
    }  
    @AuraEnabled
    public static List<Contact> getContactsImperative() {
        return [Select Id,FirstName,LastName,Email,Phone from Contact];
    }
}
