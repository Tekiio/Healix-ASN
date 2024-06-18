/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/log', 'N/https', 'N/redirect', 'N/ui/serverWidget', 'N/record', 'N/sftp', 'N/file', 'N/search', 'N/email', 'N/runtime'],

    (log, https, redirect, serverWidget, record, sftp, file, search, email, runtime) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const CUSTOMRECORD_SUITETRACE_SFTP_CONFIG = 'customrecord_suitetrace_sftp_config';
        const CUSTOMRECORD_SUITETRACE_SFTP_GUID = 'custrecord_suitetrace_sftp_guid'
        const onRequest = (scriptContext) => {
            var response = scriptContext.response;
            const request = scriptContext.request;
            let params = request.parameters;
            try {
                if (scriptContext.request.method === https.Method.GET) {
                    // Ejecutado por MR
                    if (params.srch_output) {
                        var sftp_fields = JSON.parse(params.srch_output);
                        log.audit({ title: "params", details: sftp_fields });
                        var response_of_connection = createConnection(sftp_fields);
                        response.write({ output: JSON.stringify(response_of_connection) });


                    }
                    if (params.downloadF) {
                        var dataObj = JSON.parse(params.downloadFile);
                        log.audit({ title: 'dataObj', details: dataObj });
                        var responseDownloadedFiles = downloadFile(dataObj);
                        response.write({ output: JSON.stringify(responseDownloadedFiles) });
                    }
                    if (params.getPWD) {
                        // Handle GET request from User Event script
                        var record_actual = record.load({ type: CUSTOMRECORD_SUITETRACE_SFTP_CONFIG, id: params.idRecord });
                        let fld_guid = record_actual.getValue({ fieldId: CUSTOMRECORD_SUITETRACE_SFTP_GUID });
                        let server_address = record_actual.getValue({ fieldId: 'custrecord_suitetrace_sftp_server' })
                        if (fld_guid === '' || params.editMode === 'true') {

                            var form = serverWidget.createForm({ title: 'SuiteTrace SFTP Configuration', hideNavBar: false });
                            var fldCred = form.addCredentialField({
                                id: 'custpage_guid',
                                label: 'SFTP Password',
                                restrictToScriptIds: 'customscript_suitetrace_sftp_pwdguid_sl',
                                restrictToDomains: server_address,
                                restrictToCurrentUser: false
                            });
                            fldCred.isMandatory = true;
                            form.addSubmitButton();
                            response.writePage(form);
                        } else {

                            redirect.toRecord({
                                id: params.idRecord,
                                type: CUSTOMRECORD_SUITETRACE_SFTP_CONFIG,
                                isEditMode: false,
                                parameters: { sendResponse: false }
                            });
                        }
                    } else if (params.testConnection) {
                        var testConnection_response = testConnection(params.currentIdRecord);
                        response.writeLine({
                            output: JSON.stringify(testConnection_response)
                        });

                    }

                } else {

                    let url_params_temp = params.entryformquerystring.split('idRecord=')[1];
                    let id_record = url_params_temp.split('&getPWD=')[0];
                    var pwd_guid = params.custpage_guid;
                    record.submitFields({
                        type: CUSTOMRECORD_SUITETRACE_SFTP_CONFIG,
                        id: id_record,
                        values: {
                            custrecord_suitetrace_sftp_guid: pwd_guid
                        }
                    });
                    // Search if folder Name already exists
                    var folder_exists = checkParentFolderExistence("SuiteTrace SFTP Downloads", 0, false);
                    log.audit({ title: 'folder_exists', details: folder_exists });
                    var folderID = ''
                    if (folder_exists.exists === false) {
                        // Create Parent Folder of SuiteTrace
                        var objFolder = record.create({ type: record.Type.FOLDER, isDynamic: true });
                        objFolder.setValue({ fieldId: 'name', value: "SuiteTrace SFTP Downloads" });
                        folderID = objFolder.save({ enableSourcing: true, ignoreMandatoryFields: true });
                    } else {
                        folderID = folder_exists.id
                    }
                    // Get Name of Connection for Folder Name
                    var record_actual = record.load({ type: CUSTOMRECORD_SUITETRACE_SFTP_CONFIG, id: id_record });
                    var name_conf = record_actual.getValue({ fieldId: "custrecord_suitetrace_sftp_name" });
                    createFolderStructure(name_conf, folderID);
                    redirect.toRecord({
                        id: id_record,
                        type: CUSTOMRECORD_SUITETRACE_SFTP_CONFIG,
                        isEditMode: false,
                        parameters: { sendResponse: true }
                    })
                }
            } catch (err) {
                log.error({ title: 'Error occurred in onRequest', details: err });
            }
        }
        function checkParentFolderExistence(folder_name, parent_id, checkParent) {
            try {
                var obj_to_return = {
                    exists: false,
                    id: ''
                }
                var folder_search = [];
                if (checkParent === true) {
                    folder_search = search.create({
                        type: 'folder',
                        columns: ['internalid'],
                        filters: [
                            ['name', search.Operator.IS, folder_name],
                            'AND',
                            ['parent', search.Operator.ANYOF, parent_id]

                        ]
                    }).run().getRange({ start: 0, end: 1 });
                } else {
                    folder_search = search.create({
                        type: 'folder',
                        columns: ['internalid'],
                        filters: [
                            ['name', search.Operator.IS, folder_name],
                        ]
                    }).run().getRange({ start: 0, end: 1 });
                }
                if (folder_search.length === 0) {
                    obj_to_return.exists = false;
                } else {
                    for (var i = 0; i < folder_search.length; i++) {
                        obj_to_return.exists = true;
                        obj_to_return.id = folder_search[i].id
                    }
                }
                log.debug({ title: 'obj_to_return', details: obj_to_return });
                return obj_to_return;
            } catch (err) {
                log.error({ title: 'Error occurred in checkFolderExistance', details: err });
            }
        }
        function createFolderStructure(folderName, parentFolder) {
            try {
                var objFolder = record.create({ type: record.Type.FOLDER, isDynamic: true });

                objFolder.setValue({ fieldId: 'name', value: folderName });
                objFolder.setValue({ fieldId: 'parent', value: parentFolder });
                var folderID = objFolder.save({ enableSourcing: true, ignoreMandatoryFields: true });
                var name_subfolder = ["Non-Processed", "ASN", "EPCIS", "Error", "Executed Doc"];
                var ids_subfolders = [];
                for (var i = 0; i < name_subfolder.length; i++) {
                    ids_subfolders.push(createSubFolders(name_subfolder[i], folderID));
                }
                for (var i = 1; i < ids_subfolders.length; i++) {
                    createSubFolders("Non-Processed", ids_subfolders[i]);
                }
                log.debug({ title: 'folderID 2', details: folderID });
            } catch (err) {
                log.error({ title: 'Error occurred in createFolderStructure', details: err });
            }
        }
        function createSubFolders(name, parentFolder) {
            try {
                var objFolder = record.create({ type: record.Type.FOLDER, isDynamic: true });
                objFolder.setValue({ fieldId: 'name', value: name });
                objFolder.setValue({ fieldId: 'parent', value: parentFolder });
                var id_folder = objFolder.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
                return id_folder
            } catch (err) {
                log.error({ title: 'Error occurred in createSubFolders', details: err });
            }
        }
        function downloadFile(data) {
            var obj_to_return = {
                fileId: 'NA',
                NonProcessed_folderID: 0,
                ASN_folderID: 0,
                EPCIS_folderID: 0
            };
            try {
                log.audit({ title: 'typeof data', details: typeof data });
                var connection = sftp.createConnection({
                    username: data.username,
                    passwordGuid: data.generatedSftpGuid,
                    url: data.sftpServerUrl,
                    port: parseInt(data.port),
                    directory: '/',
                    hostKey: data.hostKey
                });
                if (connection) {
                    // download file in Non-Processed
                    var downloadedFile = connection.download({
                        directory: data.outputFolderName,
                        filename: data.fileName
                    });
                    // downloadedFile.folder = data.idsFolders[3].id;
                    downloadedFile.folder = data.idsFolders.find(folderPib => folderPib.name === 'Non-Processed').id;
                    downloadedFile.encoding = file.Encoding.UTF_8;
                    // downloadedFile.name = data.fileName2
                    // var ASN_folder = checkParentFolderExistence('ASN', data.parentFolder, true).id;
                    // var EPCIS_folder = checkParentFolderExistence('EPCIS', data.parentFolder, true).id;
                    // var NONPROCESSED_folder = checkParentFolderExistence('Non-Processed', data.parentFolder, true).id;
                    var new_file_id = downloadedFile.save();
                    log.audit({ title: 'new_file_id', details: new_file_id });
                    if (new_file_id) {
                        obj_to_return.fileId = new_file_id;
                        // obj_to_return.NonProcessed_folderID = data.idsFolders[3].id;
                        obj_to_return.NonProcessed_folderID = data.idsFolders.find(folderPib => folderPib.name === 'Non-Processed').id;
                        // obj_to_return.ASN_folderID = data.idsFolders[0].id;
                        obj_to_return.ASN_folderID = data.idsFolders.find(folderPib => folderPib.name === 'ASN').id;
                        // obj_to_return.EPCIS_folderID = data.idsFolders[1].id;
                        obj_to_return.EPCIS_folderID = data.idsFolders.find(folderPib => folderPib.name === 'EPCIS').id;
                        // Delete from server that file
                        // deleteFileFromServer(connection, data.outputFolderName, data.fileName);
                    }
                    return obj_to_return
                }
            } catch (err) {
                log.error({ title: 'Error occurred in downloadFile', details: err });
                return obj_to_return
            }
        }
        // Function should create connection but return the list of files found
        function createConnection(sftpCredentials) {
            var list_of_files = [];
            try {
                var connection = sftp.createConnection({
                    username: sftpCredentials.username,
                    passwordGuid: sftpCredentials.generatedSftpGuid,
                    url: sftpCredentials.sftpServerUrl,
                    port: parseInt(sftpCredentials.port),
                    directory: '/',
                    hostKey: sftpCredentials.hostKey
                });

                if (connection) {
                    let output_folder_list = connection.list({
                        path: sftpCredentials.outputFolderName,
                        sort: sftp.Sort.DATE_DESC
                    });
                    log.audit({ title: 'output_folder_list', details: output_folder_list });
                    if (output_folder_list.length > 0) {
                        log.debug({ title: 'output_folder_list.length', details: output_folder_list.length });

                        // let arr_files = []
                        output_folder_list.forEach(element => {
                            // log.debug({title:'element',details:element});
                            if (element.name !== ".." && element.name !== "." && !element.directory) {

                                list_of_files.push(element.name);
                            }

                        });
                        // log.debug({ title: 'arr_files', details: arr_files });
                        // arr_files.forEach(element => {
                        //     // 1. Get Folder IDs of connection 
                        //     log.debug({ title: 'sftpCredentials', details: sftpCredentials });
                        //     var obj_parent_existence = checkParentFolderExistence(sftpCredentials.name, 0, false);
                        //     log.audit({ title: 'obj_parent_existence', details: obj_parent_existence });
                        //     if (obj_parent_existence.exists === true) {
                        //         var subFolders_name = ['Non-Processed', "ASN", "EPCIS"];
                        //         var file_alreadyExists = false;
                        //         for (var k = 0; k < subFolders_name.length; k++) {
                        //             var obj_check_subfolder = checkParentFolderExistence(subFolders_name[k], obj_parent_existence.id, true);
                        //             // 2. Then look in every Folder ID for the name
                        //             file_alreadyExists = searchFileExistence(element.name, obj_check_subfolder.id);
                        //             // Si archivo existe en alguna de las carpetas, salte del For para no descargar nuevamente el archivo
                        //             if (file_alreadyExists) {
                        //                 break;
                        //             }
                        //             log.debug({ title: 'file_alreadyExists', details: file_alreadyExists });
                        //             log.audit({ title: 'element.name', details: element.name });
                        //         }
                        //         if (file_alreadyExists === false) {
                        //             // download file in Non-Processed
                        //             var downloadedFile = connection.download({
                        //                 directory: sftpCredentials.outputFolderName,
                        //                 filename: element.name
                        //             });

                        //             downloadedFile.folder = checkParentFolderExistence('Non-Processed', obj_parent_existence.id, true).id;
                        //             var ASN_folder=checkParentFolderExistence('ASN', obj_parent_existence.id, true).id;
                        //             var EPCIS_folder=checkParentFolderExistence('EPCIS', obj_parent_existence.id, true).id;
                        //             var NONPROCESSED_folder=checkParentFolderExistence('Non-Processed', obj_parent_existence.id, true).id;
                        //             var new_file_id = downloadedFile.save();
                        //             has_files.new_files = true;
                        //             has_files.files.push(new_file_id);
                        //             has_files.NonProcessed_folderID=NONPROCESSED_folder;
                        //             has_files.ASN_folderID=ASN_folder;
                        //             has_files.EPCIS_folderID=EPCIS_folder;

                        //             log.audit({ title: 'new_file_id', details: new_file_id });
                        //             // Delete from server that file
                        //             deleteFileFromServer(connection, sftpCredentials.outputFolderName, element.name);

                        //         }
                        //     }
                        // });


                    }

                }
                log.audit({ title: 'list_of_files', details: list_of_files });
                return list_of_files
            } catch (err) {
                log.error({ title: 'Error occurred in createConnection', details: err });
                // Aquí debería de mandar correo a Administradores y a Tekiio de que una conexión SFTP no pudo realizar la conexión
                // sendEmailAdmin(sftpCredentials.name);
                return null;


            }
        }
        function deleteFileFromServer(connection, relative_path, fileName) {
            try {
                connection.removeFile({
                    path: relative_path + '/' + fileName
                });
                log.debug({ title: 'deleteFileFromServer', details: 'successfully removed file' });

            } catch (err) {
                log.error({ title: 'Error occurred in deleteFileFromServer', details: err });
            }
        }
        function sendEmailAdmin(sftpName) {
            try {
                // let currentUser_obj = runtime.getCurrentUser();
                // log.audit({ title: 'currentUser_obj', details: currentUser_obj });
                var holi = email.sendBulk({
                    author: -5,
                    recipients: ['magdiel.jimenez@freebug.mx', 'ricardo.lopez@freebug.mx', 'diego.jimenez@freebug.mx', 'christian.salas@tekiio.com', 'mariano.carrillo@tekiio.com'],
                    subject: `SuiteTrace Connection Errors with server ${sftpName}`,
                    body: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    </head> 
                    <style>
                    @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,800;1,700&display=swap');
                    body{
                        font-family: 'Montserrat', sans-serif;
                    }
                    </style>
                    <body style="color: #4d5256; font-family: 'Montserrat', sans-serif; font-size: 14px; margin: auto; padding: 27px 0 13px 0; width: 600px;">

                    <div style="display:block;width:100%;">
                                        <div style='display:flex;justify-content:center;font-family: 'Montserrat', sans-serif;'>
                                        <h1 style="text-align:center;font-family: 'Montserrat', sans-serif;">Connection Lost</h1>
                                        </div>
                                        <p style="text-align:center;padding:0px;margin:0px">Could not connect to server: ${sftpName}. </p>
                                        <p style="text-align:center;padding:0px;margin:0px">We will retry the connection in a few moments. </p>
                                        <p style="text-align:center;padding:0px;margin:0px">If error persists, contact the owner of the server.</p>
                                        <div style='display:flex;justify-content:center;'>
                                        <img width:"400px" style="margin:auto" alt="SuiteTrace Connection Lost" src="https://firebasestorage.googleapis.com/v0/b/bloona-55051.appspot.com/o/SuiteTraceConnectionLost2.png?alt=media&token=f79d6c31-4a48-471d-997d-6bd63ae29005&_gl=1*1urwyg5*_ga*MTAyOTgxNzMxMi4xNjk1NzM4MDU3*_ga_CW55HF8NVT*MTY5NzY0MDYyOC4zLjEuMTY5NzY0Mjk0OS4zMS4wLjA.">
                                        </div>
                                        </div>
                        </body>
                        </html>
                    `,
                });
                log.audit({ title: 'holi', details: holi });

            } catch (err) {
                log.error({ title: 'Error occurred in sendEmailAdmin', details: err });
            }
        }
        function searchFileExistence(fileName, folderID) {
            try {
                var to_return = false;
                const fileSearchColNombre = search.createColumn({ name: 'name', sort: search.Sort.ASC });
                const fileSearchColCarpeta = search.createColumn({ name: 'folder' });
                const fileSearchColTamaoKb = search.createColumn({ name: 'documentsize' });
                const fileSearchColUrl = search.createColumn({ name: 'url' });
                const fileSearchColFechaDeCreacin = search.createColumn({ name: 'created' });
                const fileSearchColltimaModificacin = search.createColumn({ name: 'modified' });
                const fileSearchColTipo = search.createColumn({ name: 'filetype' });
                const fileSearch = search.create({
                    type: 'file',
                    filters: [
                        ['folder', search.Operator.ANYOF, folderID],
                        'AND',
                        ['name', search.Operator.IS, fileName],
                    ],
                    columns: [
                        fileSearchColNombre,
                        fileSearchColCarpeta,
                        fileSearchColTamaoKb,
                        fileSearchColUrl,
                        fileSearchColFechaDeCreacin,
                        fileSearchColltimaModificacin,
                        fileSearchColTipo,
                    ],
                });

                const fileSearchPagedData = fileSearch.run().getRange({ start: 0, end: 1 });
                if (fileSearchPagedData.length > 0) {
                    to_return = true;
                }
                return to_return;
            } catch (err) {
                log.error({ title: 'Error occurred in searchFileExistence', details: err });
            }
        }
        function testConnection(idRecord) {
            try {
                var configRec = record.load({
                    type: CUSTOMRECORD_SUITETRACE_SFTP_CONFIG,
                    id: idRecord
                });

                let suitetrace_sftpUser = configRec.getValue({
                    fieldId: 'custrecord_suitetrace_sftp_username'
                });
                let suitetrace_sftpGUID = configRec.getValue({
                    fieldId: CUSTOMRECORD_SUITETRACE_SFTP_GUID
                });
                let suitetrace_sftpServer = configRec.getValue({
                    fieldId: 'custrecord_suitetrace_sftp_server'
                });
                let suitetrace_portNbr = configRec.getValue({
                    fieldId: 'custrecord_suitetrace_sftp_port'
                });
                let suitetrace_hostKey = configRec.getValue({
                    fieldId: 'custrecord_suitetrace_sftp_hostkey'
                });
                let suitetrace_sftpDir = configRec.getValue({
                    fieldId: 'custrecord_suitetrace_sftp_output_fd'
                });
                let suitetrace_inputDir = configRec.getValue({
                    fieldId: 'custrecord_suitetrace_sftp_input_fd'
                });
                let suitetrace_test_file = configRec.getValue({
                    fieldId: 'custrecord_suitetrace_sftp_test_file'
                });
                log.debug({
                    title: "SFTP record data",
                    details: { suitetrace_sftpUser, suitetrace_sftpGUID, suitetrace_sftpServer, suitetrace_portNbr, suitetrace_hostKey, suitetrace_sftpDir }
                })
                var connection = sftp.createConnection({
                    username: suitetrace_sftpUser,
                    passwordGuid: suitetrace_sftpGUID,
                    url: suitetrace_sftpServer,
                    port: parseInt(suitetrace_portNbr),
                    directory: '/',
                    hostKey: suitetrace_hostKey
                });
                if (connection) {
                    if (suitetrace_inputDir !== '' && suitetrace_test_file !== '') {
                        var file_to_upload = file.load({
                            id: suitetrace_test_file
                        });
                        let file_name = file_to_upload.name;
                        connection.upload({
                            directory: suitetrace_inputDir,
                            filename: file_name,
                            file: file_to_upload,
                            replaceExisting: true
                        });
                        log.debug({
                            title: "Tried to upload file",
                            details: true
                        });
                    }
                    let objConnectionList_input = connection.list({
                        path: suitetrace_inputDir,
                        sort: sftp.Sort.SIZE
                    });
                    let objConnectionList_output = connection.list({
                        path: suitetrace_sftpDir,
                        sort: sftp.Sort.SIZE
                    });
                    let objConnectionList_parent_folder = connection.list({
                        path: '/',
                        sort: sftp.Sort.SIZE
                    });
                    log.audit({
                        title: "CONNECTION LIST OF PATHS PARENT FOLDER",
                        details: objConnectionList_parent_folder
                    });
                    log.audit({
                        title: "CONNECTION LIST OF PATHS INPUT",
                        details: objConnectionList_input
                    });
                    log.audit({
                        title: "CONNECTION LIST OF PATHS OUTPUT",
                        details: objConnectionList_output
                    });
                    return 'Connection was successful to server:' + suitetrace_sftpServer
                } else {
                    return 'Connection failed. Please verify credentials'
                }
            } catch (err) {
                log.error({ title: 'Error occurred in testConnection', details: err });
                return 'Connection failed. Please verify credentials'

            }
        }

        return { onRequest }

    });
