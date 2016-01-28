// we want to dispose all the previous conversations added event listeners because
// in this demo site, we don't want to samples interfere with each other.
var registeredListeners = registeredListeners || [];
registeredListeners.forEach(function (listener) {
    listener.dispose();
});
registeredListeners = [];

/**
 * This script demonstrates how to find a contact by name, email,
 * phone number or some other attribute and display it in the UI.
 *
 * This sample also shows how to create a dynamic UI on top of the
 * contact object, so that whenever the contact's properties change
 * (e.g. when it goes offline or online), its new state gets
 * reflected in the UI.
 */
$(function () {
    'use strict';

    var client = window.skypeWebApp;

    // when the user clicks on the "Get Contact" button

    $('#useruri').keypress(function(evt){
        if(evt.keyCode == 13){
            $("#btn-get-contact").click();
        }
    });

    $('#btn-get-contact').click(function () {
        // start the contact search
        var pSearch = client.personsAndGroupsManager.createPersonSearchQuery();
        if(!$('#useruri').val().trim()){
            return;
        }
        pSearch.text($('#useruri').val());
        pSearch.limit(1);
        pSearch.getMore().then(function (sr) {

            $('#status').text('Search succeeded. Parsing results...');

            // and throw an exception if no contacts found:
            // the exception will be passed to the next "fail"
            // handler: this is how Promises/A+ work.
            if (sr.length == 0)
                throw new Error('The contact not found');

            // then take any found contact
            // and pass the found contact down the chain
            return sr[0].result;

        }).then(function (contact) {
            $('#status').text('A contact found. Creating a view for it...');

            var cDisplayName = $('<p>').text("DisplayName: ");
            var cTitle = $('<p>').text("Title: ");
            var cDepartment = $('<p>').text("Department: ");
            var cCompany = $('<p>').text("Company: ");

            var cStatus = $('<p>').text("Status: ");
            var cActivity = $('<p>').text("Activity: ");
            var cNoteType = $('<p>').text("NoteType: ");
            var cNote = $('<p>').text("Note: ");

            contact.displayName.get().then(function(displayName){
                cDisplayName.text("DisplayName: " + displayName);
            });

            contact.title.get().then(function(title){
                cTitle.text("Title: " + title);
            });

            contact.department.get().then(function(department){
                cDepartment.text("Department: " + department);
            });

            contact.company.get().then(function(company){
                cCompany.text("Company: " + company);
            });

            contact.status.get().then(function(status){
                cStatus.text("Status: " + status);
            });

            contact.activity.get().then(function(activity){
                cActivity.text("Activity: " + activity);
            });

            contact.note.type.get().then(function(noteType){
                cNoteType.text("NoteType: " + noteType);
            });

            contact.note.text.get().then(function(noteText){
                cNote.text("Note: " + noteText);
            });

            var cCapabilities = $('<p>').text('Capabilities: Unknown');
            var capabilities = contact.capabilities;
            onCapabilities();

            var onPropertyChanged = function (value) {
                var text = this.text();
                text = text.substr(0, text.indexOf(' ') + 1);
                this.text(text + value);
            }

            var subP = [], subM = [];
            // display static data of the contact
            $('#result').empty()
                .append(cDisplayName)
                .append(cTitle)
                .append(cDepartment)
                .append(cCompany)
                .append(cStatus)
                .append(cActivity)
                .append(cNoteType)
                .append(cNote)
                .append(cCapabilities);

            // let the user enable presence subscription
            $('#subscribe').click(function () {
                // tell the contact to notify us whenever its

                // presence or note properties change
                contact.displayName.changed(onPropertyChanged.bind(cDisplayName));
                contact.title.changed(onPropertyChanged.bind(cTitle));
                contact.department.changed(onPropertyChanged.bind(cDepartment));
                contact.company.changed(onPropertyChanged.bind(cCompany));
                contact.status.changed(onPropertyChanged.bind(cStatus));
                contact.activity.changed(onPropertyChanged.bind(cActivity));
                contact.note.text.changed(onPropertyChanged.bind(cNote));
                contact.note.type.changed(onPropertyChanged.bind(cNoteType));
                subP.push(contact.displayName.subscribe());
                subP.push(contact.title.subscribe());
                subP.push(contact.department.subscribe());
                subP.push(contact.company.subscribe());
                subP.push(contact.status.subscribe());
                subP.push(contact.activity.subscribe());
                subP.push(contact.note.text.subscribe());
                subP.push(contact.note.type.subscribe());

            });

            $('#subscribe2').click(function () {
                // tell the contact to notify us whenever its available capabilities change
                capabilities.chat.changed(onCapabilities);
                capabilities.audio.changed(onCapabilities);
                capabilities.video.changed(onCapabilities);
                capabilities.screenSharing.changed(onCapabilities);
                subM.push(capabilities.chat.subscribe());
                subM.push(capabilities.audio.subscribe());
                subM.push(capabilities.video.subscribe());
                subM.push(capabilities.screenSharing.subscribe());
            });

            // let the user disable presence subscription
            $('#unsubscribe').click(function () {
                // tell the contact that we are no longer interested in
                // its presence and note properties
                $.each(subP, function(i, sub) {
                    sub.dispose();
                });
                subP = [];
                $.each(subM, function(i, sub) {
                    sub.dispose();
                });
                subM = [];
            });

            function onCapabilities() {
                cCapabilities.text('Capabilities: ' +
                    'chat = ' + capabilities.chat +
                    ', audio = ' + capabilities.audio +
                    ', video = ' + capabilities.video +
                    ', screenSharing = ' + capabilities.screenSharing);
            }

            $('#status').text('A contact was found and displayed.');
        }).then(null, function (error) {
            // if either of the steps above threw an exception,
            // catch it here and display to the user
            $('#status').text(error || 'Something went wrong');
        });
    });
});
