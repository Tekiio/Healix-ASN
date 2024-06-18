/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/log', 'N/runtime', 'N/record', 'N/search', 'N/url', 'N/https', 'N/email', 'N/file', '../Constants/TKIO - SuiteTrace Programmed SFTP Constants- CT.js', '../Controller/TKIO - SuiteTrace Programmed SFTP Controller- CL.js'],

    (log, runtime, record, search, url, https, email, file, sftpConstants, sftpController) => {
        // Declarations globals
        const { RECORDS, LIST, SCRIPTS, mapManifest, levels, mapChildren } = sftpConstants;
        const { getDataToSS, getInfoToNetsuite, sendEmailDetails, sendEmailAdmin } = sftpController;
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {
            let arrFile_per_conf = [];
            try {
                const config = {};
                config.emailRepresent = runtime.getCurrentScript().getParameter({ name: SCRIPTS.ST_PROGRAMMED_SFTP_MR.PARAMETERS.EMPLOYEE });
                log.debug({ title: 'config', details: config });
                log.debug({ title: 'Iniciando', details: '🟢' });
                // Variables
                var data_for_suitelet = {};
                const dataConection = obtainInfoConection()
                log.debug({ title: 'Info conection:', details: dataConection });
                dataConection.results.forEach((conection, index) => {
                    arrFile_per_conf = arrFile_per_conf.concat(validateExecute(conection, config));
                })
                // for (let i = 0; i < sftpController.getInfoToConection.pageRanges.length; i++) {
                //     const customrecord_suitetrace_sftp_configSearchPage = sftpController.getInfoToConection.fetch({ index: i });
                //     customrecord_suitetrace_sftp_configSearchPage.data.forEach((result) => {
                //         const id = result.getValue(customrecord_suitetrace_sftp_configSearchColId);
                //         const name = result.getValue(customrecord_suitetrace_sftp_configSearchColName);

                //         const username = result.getValue(customrecord_suitetrace_sftp_configSearchColUsername);
                //         const generatedSftpGuid = result.getValue(customrecord_suitetrace_sftp_configSearchColGeneratedSftpGuid);
                //         const sftpServerUrl = result.getValue(customrecord_suitetrace_sftp_configSearchColSftpServerUrl);
                //         const port = result.getValue(customrecord_suitetrace_sftp_configSearchColPort);
                //         const hostKey = result.getValue(customrecord_suitetrace_sftp_configSearchColHostKey);
                //         const outputFolderName = result.getValue(customrecord_suitetrace_sftp_configSearchColOutputFolderName);
                //         const executionFrequency = result.getText(customrecord_suitetrace_sftp_configSearchColExecutionFrequency);
                //         // const executionUnitOfTime = 'Days';
                //         const executionUnitOfTime = result.getText(customrecord_suitetrace_sftp_configSearchColExecutionUnitOfTime);
                //         const lastExecutionDate = result.getValue(customrecord_suitetrace_sftp_configSearchColLastExecutionDate);
                //         let srch_output = {
                //             id,
                //             name,
                //             username,
                //             generatedSftpGuid,
                //             sftpServerUrl,
                //             port,
                //             hostKey,
                //             outputFolderName,
                //             executionFrequency,
                //             executionUnitOfTime,
                //             lastExecutionDate
                //         }
                //         let flag_ready_to_execute = false;
                //         log.debug({ title: 'lastExecutionDate', details: lastExecutionDate });
                //         // Compare actual dateTime with lastExecutionDate, this must be greater or equal to the executionFrequency and ExecutionUnitOfTime
                //         const date1 = new Date();
                //         // Extract date components
                //         const day = date1.getDate();
                //         const month = date1.getMonth() + 1; // Months are zero-indexed, so we add 1
                //         const year = date1.getFullYear();
                //         const hours = date1.getHours();
                //         const minutes = date1.getMinutes();
                //         const seconds = date1.getSeconds();
                //         const ampm = hours >= 12 ? 'pm' : 'am';
                //         const formattedDate = `${month}/${day}/${year} ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
                //         const currentDate = new Date(formattedDate);
                //         const date2 = new Date(lastExecutionDate);

                //         // Calculate the time difference in milliseconds
                //         const timeDifferenceInMilliseconds = currentDate - date2;
                //         log.debug({ title: 'formattedDate', details: formattedDate });
                //         log.debug({ title: 'executionUnitOfTime', details: executionUnitOfTime });
                //         log.debug({ title: 'executionFrequency', details: executionFrequency });


                //         switch (executionUnitOfTime) {
                //             case 'Hours':
                //                 // Calculate the time difference in hours
                //                 const timeDifferenceInHours = timeDifferenceInMilliseconds / (1000 * 60 * 60);
                //                 log.debug({ title: 'timeDifferenceInHours', details: timeDifferenceInHours });
                //                 if (timeDifferenceInHours >= executionFrequency) {
                //                     flag_ready_to_execute = true;

                //                 }
                //                 break;
                //             case 'Days':
                //                 // Calculate the time difference in days
                //                 const timeDifferenceInDays = timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24);
                //                 log.debug({ title: 'timeDifferenceInDays', details: timeDifferenceInDays });
                //                 if (timeDifferenceInDays >= executionFrequency) {
                //                     flag_ready_to_execute = true;
                //                 }
                //                 break;
                //             case 'Minutes':
                //                 // Calculate the time difference in days
                //                 const timeDifferenceInMinutes = timeDifferenceInMilliseconds / (1000 * 60);
                //                 log.debug({ title: 'timeDifferenceInMinutes', details: timeDifferenceInMinutes });
                //                 if (timeDifferenceInMinutes >= executionFrequency) {
                //                     flag_ready_to_execute = true;
                //                 }
                //                 break;
                //         }
                // if (flag_ready_to_execute) {
                //     // Send to suitelet that SFTP configuration
                //     log.debug({ title: 'flag_ready_to_execute', details: flag_ready_to_execute });
                //     var output = url.resolveScript({
                //         scriptId: 'customscript_suitetrace_sftp_pwdguid_sl',
                //         deploymentId: 'customdeploy_suitetrace_sftp_pwdguid_sl',
                //         returnExternalUrl: true,
                //         params: { makeConnection: true, srch_output: JSON.stringify(srch_output) }
                //     });

                //     var response = https.get({ url: output, });
                //     // output structure being sent from Suitelet
                //     // IF TRUE EXPECTED OUTPUT:
                //     /*
                //     [
                //         "ICSDIRECT-TL_HEALIXINFU_856_4010_20230329061531_BP2927671446-1.X12",
                //         "ICSDIRECT-TL_HEALIXINFU_856_4010_20230330061538_BP2932631612.X12",
                //         "X12_BP2932235763.X12"
                //     ]
                //     */
                //     // IF FALSE EXPECTED OUTPUT EMPTY ARRAY of files


                //     // 1. Load file given in the array of output files[]
                //     var obj_output = JSON.parse(response.body);
                //     log.debug({
                //         title: "obj_output",
                //         details: obj_output
                //     });
                //     if (obj_output === null) {
                //         // Manda correo de que no se pudo conectar
                //         sendEmailAdmin(srch_output.name);
                //     }
                //     else if (obj_output.length > 0) {

                //         // 2. Compare file array with Netsuite
                //         var reduced_list_files = [];
                //         var subFolders_name = ['Non-Processed', "ASN", "EPCIS", "Error"];
                //         var obj_parent_existence = checkParentFolderExistence(srch_output.name, 0, false);
                //         log.audit({ title: 'obj_parent_existence', details: obj_parent_existence });

                //         var obj_check_subfolder = checkParentFolderExistence(subFolders_name, obj_parent_existence[0].id, true);
                //         log.debug({ title: 'obj_check_subfolder', details: obj_check_subfolder });

                //         var arr_files_finder = checkFileExistence(obj_output, obj_check_subfolder);
                //         log.debug({ title: 'arr_files_finder', details: arr_files_finder });

                //         obj_output.forEach(element => {
                //             var fileInNS = arr_files_finder.find(fileNS => fileNS.nameFile === element && (fileNS.nameFolder.text === 'Non-Processed' || fileNS.nameFolder.text === 'Error')) || null;

                //             if (fileInNS) {
                //                 reduced_list_files.push(element);
                //             } else {
                //                 var fileInNS2 = arr_files_finder.find(fileNS => fileNS.nameFile === element && (fileNS.nameFolder.text === 'ASN' || fileNS.nameFolder.text === 'EPCIS')) || null;
                //                 if (!fileInNS2) {
                //                     reduced_list_files.push(element);
                //                 }
                //             }
                //         });
                //         // 3. Crea objeto con info de configuraciones y lista reducida de nombres de archivos
                //         var objMainConf = srch_output;
                //         objMainConf.arrFileNames = reduced_list_files;
                //         log.debug({ title: 'objMainConf', details: objMainConf });

                //         // 4. Crea objeto para obtener el nombre del archivo (1:1) con configuración de conexión
                //         var arrObjFile = [];
                //         objMainConf.arrFileNames.forEach(name => {
                //             arrObjFile.push({
                //                 id: objMainConf.id,
                //                 name: objMainConf.name,
                //                 username: objMainConf.username,
                //                 generatedSftpGuid: objMainConf.generatedSftpGuid,
                //                 sftpServerUrl: objMainConf.sftpServerUrl,
                //                 port: objMainConf.port,
                //                 hostKey: objMainConf.hostKey,
                //                 outputFolderName: objMainConf.outputFolderName,
                //                 executionFrequency: objMainConf.executionFrequency,
                //                 executionUnitOfTime: objMainConf.executionUnitOfTime,
                //                 lastExecutionDate: objMainConf.lastExecutionDate,
                //                 fileName: name,
                //                 extension: (name.split(".").length === 2 ? name.split(".")[1] : 'NA'),
                //                 idsFolders: obj_check_subfolder
                //             });
                //         });

                //         arrFile_per_conf = arrFile_per_conf.concat(arrObjFile);
                //     } else {
                //         log.debug({ title: 'Files found', details: 'No files were found in connection' });
                //     }
                // }
                //     });
                // }
                // return [];
                return arrFile_per_conf;
                // return [];
            } catch (err) {
                log.error({ title: 'Error occurred in getInputData', details: err });
            }
        }
        // Obtain data conection
        const obtainInfoConection = () => {
            try {
                log.debug({ title: 'RECORDS', details: RECORDS });
                let type = RECORDS.SFTP_SETUP.id;
                let filters = [[RECORDS.SFTP_SETUP.FIELDS.INACTIVE, search.Operator.IS, 'F']]
                let columns = [];
                Object.keys(RECORDS.SFTP_SETUP.FIELDS).forEach((name) => {
                    columns.push(search.createColumn({ name: RECORDS.SFTP_SETUP.FIELDS[name] }))
                });
                let dataSS = getDataToSS(type, filters, columns);
                return dataSS;
            } catch (e) {
                log.error({ title: 'Error obtainInfoConection:', details: e });
            }
        }
        // Validando la obtencion de los datos
        const validateExecute = (conection, config) => {
            try {
                let arrFile_per_conf = [];
                let flag_ready_to_execute = false;
                // Compare actual dateTime with lastExecutionDate, this must be greater or equal to the executionFrequency and ExecutionUnitOfTime
                const date1 = new Date();
                // Extract date components
                const day = date1.getDate();
                const month = date1.getMonth() + 1; // Months are zero-indexed, so we add 1
                const year = date1.getFullYear();
                const hours = date1.getHours();
                const minutes = date1.getMinutes();
                const seconds = date1.getSeconds();
                const ampm = hours >= 12 ? 'pm' : 'am';
                const formattedDate = `${month}/${day}/${year} ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
                const currentDate = new Date(formattedDate);
                const date2 = new Date(conection[RECORDS.SFTP_SETUP.FIELDS.DATE_EXECUTE]);

                // Calculate the time difference in milliseconds
                const timeDifferenceInMilliseconds = currentDate - date2;
                log.debug({ title: 'formattedDate', details: formattedDate });
                const executionUnitOfTime = conection[RECORDS.SFTP_SETUP.FIELDS.UNIT_EXEC];
                const executionFrequency = conection[RECORDS.SFTP_SETUP.FIELDS.FREQUENCY_EXEC].value;


                switch (executionUnitOfTime.text) {
                    case 'Hours':
                        // Calculate the time difference in hours
                        const timeDifferenceInHours = timeDifferenceInMilliseconds / (1000 * 60 * 60);
                        log.debug({ title: 'timeDifferenceInHours', details: timeDifferenceInHours });
                        if (timeDifferenceInHours >= executionFrequency) {
                            flag_ready_to_execute = true;

                        }
                        break;
                    case 'Days':
                        // Calculate the time difference in days
                        const timeDifferenceInDays = timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24);
                        log.debug({ title: 'timeDifferenceInDays', details: timeDifferenceInDays });
                        if (timeDifferenceInDays >= executionFrequency) {
                            flag_ready_to_execute = true;
                        }
                        break;
                    case 'Minutes':
                        // Calculate the time difference in days
                        const timeDifferenceInMinutes = timeDifferenceInMilliseconds / (1000 * 60);
                        log.debug({ title: 'timeDifferenceInMinutes', details: timeDifferenceInMinutes });
                        if (timeDifferenceInMinutes >= executionFrequency) {
                            flag_ready_to_execute = true;
                        }
                        break;
                }
                log.debug({ title: 'flag_ready_to_execute', details: flag_ready_to_execute });
                if (flag_ready_to_execute) {
                    let srch_output = {
                        id: conection[RECORDS.SFTP_SETUP.FIELDS.ID],
                        name: conection[RECORDS.SFTP_SETUP.FIELDS.NAME],
                        username: conection[RECORDS.SFTP_SETUP.FIELDS.USERNAME],
                        generatedSftpGuid: conection[RECORDS.SFTP_SETUP.FIELDS.GUID],
                        sftpServerUrl: conection[RECORDS.SFTP_SETUP.FIELDS.URL],
                        port: conection[RECORDS.SFTP_SETUP.FIELDS.PORT],
                        hostKey: conection[RECORDS.SFTP_SETUP.FIELDS.HOST_KEY],
                        outputFolderName: conection[RECORDS.SFTP_SETUP.FIELDS.OUTPUT_FOLDER],
                        executionFrequency: conection[RECORDS.SFTP_SETUP.FIELDS.FREQUENCY_EXEC],
                        executionUnitOfTime: conection[RECORDS.SFTP_SETUP.FIELDS.UNIT_EXEC],
                        lastExecutionDate: conection[RECORDS.SFTP_SETUP.FIELDS.DATE_EXECUTE],
                        emails: conection[RECORDS.SFTP_SETUP.FIELDS.EMAIL_SERVER]
                    }
                    log.debug({ title: 'srch_output', details: srch_output });
                    // Send to suitelet that SFTP configuration
                    log.debug({ title: 'flag_ready_to_execute', details: flag_ready_to_execute });
                    var output = url.resolveScript({
                        scriptId: SCRIPTS.SFTP_PWD_GUID.SCRIPT_ID,
                        deploymentId: SCRIPTS.SFTP_PWD_GUID.DEPLOY_ID,
                        returnExternalUrl: true,
                        params: { makeConnection: true, srch_output: JSON.stringify(srch_output) }
                    });

                    var response = https.get({ url: output });

                    // 1. Load file given in the array of output files[]
                    var obj_output = JSON.parse(response.body);
                    log.debug({ title: "obj_output", details: obj_output });
                    if (obj_output === null) {
                        // Manda correo de que no se pudo conectar
                        sendEmailAdmin(config.emailRepresent, srch_output.name, srch_output.emails);
                    }
                    else if (obj_output.length > 0) {

                        // 2. Compare file array with Netsuite
                        var reduced_list_files = [];
                        var subFolders_name = ['Non-Processed', "ASN", "EPCIS", "Error", "Executed Doc"];
                        var obj_parent_existence = checkParentFolderExistence(srch_output.name, 0, false);
                        log.audit({ title: 'obj_parent_existence', details: obj_parent_existence });

                        var obj_check_subfolder = checkParentFolderExistence(subFolders_name, obj_parent_existence[0].id, true);
                        log.debug({ title: 'obj_check_subfolder', details: obj_check_subfolder });

                        var arr_files_finder = checkFileExistence(obj_output, obj_check_subfolder);
                        log.debug({ title: 'arr_files_finder', details: arr_files_finder });

                        obj_output.forEach(element => {
                            var fileInNS = arr_files_finder.find(fileNS => fileNS.nameFile === element && (fileNS.nameFolder.text === 'Non-Processed' || fileNS.nameFolder.text === 'Error')) || null;
                            if (fileInNS) {
                                reduced_list_files.push(element);
                            } else {
                                var fileInNS2 = arr_files_finder.find(fileNS => fileNS.nameFile === element && (fileNS.nameFolder.text === 'ASN' || fileNS.nameFolder.text === 'EPCIS')) || null;
                                if (!fileInNS2) {
                                    reduced_list_files.push(element);
                                }
                            }
                        });
                        // 3. Crea objeto con info de configuraciones y lista reducida de nombres de archivos
                        var objMainConf = srch_output;
                        objMainConf.arrFileNames = reduced_list_files;
                        log.debug({ title: 'objMainConf', details: objMainConf });

                        // 4. Crea objeto para obtener el nombre del archivo (1:1) con configuración de conexión
                        var arrObjFile = [];
                        objMainConf.arrFileNames.forEach(name => {
                            arrObjFile.push({
                                id: objMainConf.id.value,
                                name: objMainConf.name,
                                username: objMainConf.username,
                                generatedSftpGuid: objMainConf.generatedSftpGuid,
                                sftpServerUrl: objMainConf.sftpServerUrl,
                                port: objMainConf.port,
                                hostKey: objMainConf.hostKey,
                                outputFolderName: objMainConf.outputFolderName,
                                executionFrequency: objMainConf.executionFrequency,
                                executionUnitOfTime: objMainConf.executionUnitOfTime,
                                lastExecutionDate: objMainConf.lastExecutionDate,
                                emails: objMainConf.emails,
                                fileName: name,
                                extension: (name.split(".").length === 2 ? name.split(".")[1] : 'NA'),
                                idsFolders: obj_check_subfolder
                            });
                        });

                        arrFile_per_conf = arrFile_per_conf.concat(arrObjFile);
                    } else {
                        log.debug({ title: 'Files found', details: 'No files were found in connection' });
                    }
                }
                return arrFile_per_conf;
            } catch (e) {
                log.error({ title: 'Error validateExecute:', details: e });
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
        function checkParentFolderExistence(folder_name, parent_id, checkParent) {
            try {
                var obj_to_return = {
                    exists: false,
                    id: ''
                }
                var arr_to_return = []
                var folder_search = [];
                if (checkParent === true) {
                    var filterNameSubFolder = [];
                    folder_name.forEach((nameFile, index) => {
                        if ((folder_name.length - 1) === index) {
                            filterNameSubFolder.push(['name', search.Operator.IS, nameFile])
                        } else {
                            filterNameSubFolder.push(['name', search.Operator.IS, nameFile], 'OR')
                        }
                    });
                    folder_search = search.create({
                        type: 'folder',
                        columns: [
                            search.createColumn({ name: "internalid", label: "Internal ID" }),
                            search.createColumn({ name: "name", sort: search.Sort.ASC, label: "Name" })
                        ],
                        filters: [
                            ['parent', search.Operator.ANYOF, parent_id],
                            'AND',
                            filterNameSubFolder

                        ]
                    });
                } else {
                    folder_search = search.create({
                        type: 'folder',
                        columns: [
                            search.createColumn({ name: "internalid", label: "Internal ID" }),
                            search.createColumn({ name: "name", sort: search.Sort.ASC, label: "Name" })
                        ],
                        filters: [
                            ['name', search.Operator.IS, folder_name],
                        ]
                    });
                }
                var searchResultCount = folder_search.runPaged().count;
                if (searchResultCount === 0) {
                    arr_to_return.push({
                        id: '',
                        exists: false
                    })
                } else {
                    const folder_searchPagedData = folder_search.runPaged({ pageSize: 1000 });
                    for (let i = 0; i < folder_searchPagedData.pageRanges.length; i++) {
                        const folder_searchPage = folder_searchPagedData.fetch({ index: i });
                        folder_searchPage.data.forEach((result) => {
                            arr_to_return.push({
                                exists: true,
                                id: result.getValue({ name: "internalid" }),
                                name: result.getValue({ name: "name" })
                            })
                        })
                    }
                }
                return arr_to_return;
            } catch (err) {
                log.error({ title: 'Error occurred in checkFolderExistance', details: err });
            }
        }
        function checkFileExistence(arr_name_finder, arr_id_parent) {
            try {
                var arr_name = [];
                var arr_parent = [];
                arr_name_finder.forEach((nameFile, index) => {
                    if ((arr_name_finder.length - 1) === index) {
                        arr_name.push(['name', search.Operator.IS, nameFile])
                    } else {
                        arr_name.push(['name', search.Operator.IS, nameFile], 'OR')
                    }
                });
                arr_id_parent.forEach((id_folder, index) => {
                    arr_parent.push(id_folder.id)
                });
                var folderMatch = [];
                var folder_search = [];
                folder_search = search.create({
                    type: 'file',
                    columns: [
                        search.createColumn({ name: "name", sort: search.Sort.ASC, label: "Name" }),
                        search.createColumn({ name: "folder", label: "Folder" }),
                        search.createColumn({ name: "filetype", label: "Type" }),
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ],
                    filters: [
                        ['folder', search.Operator.ANYOF, arr_parent],
                        'AND',
                        arr_name
                    ]
                })
                const folder_searchPagedData = folder_search.runPaged({ pageSize: 1000 });
                for (let i = 0; i < folder_searchPagedData.pageRanges.length; i++) {
                    const folder_searchPage = folder_searchPagedData.fetch({ index: i });
                    folder_searchPage.data.forEach((result) => {
                        folderMatch.push({
                            internalid: result.getValue({ name: 'internalid' }),
                            nameFile: result.getValue({ name: 'name' }),
                            nameFolder: {
                                value: result.getValue({ name: 'folder' }),
                                text: result.getText({ name: 'folder' })
                            },
                        })
                    })
                }
                return folderMatch;
            } catch (err) {
                log.error({ title: 'Error occurred in checkFolderExistance', details: err });
            }
        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        // El stage Map, su principal funcion sera acomodar el documento a una estructura mas legible para poder crear la transaccion ASN
        const map = (mapContext) => {
            try {
                var objMap = JSON.parse(mapContext.value);
                log.debug({ title: 'Data to getInputData 🟢:', details: mapContext.value });
                var mappingValue = getInfoToNetsuite();
                var contentFile = classifyFilesAndMoveFile_toNewFolder(objMap, mappingValue);
                objMap.contentFile = {}
                objMap.contentFile = contentFile
                if (Object.keys(objMap.contentFile).length > 0) {
                    if (objMap.contentFile.details.length === 0) {
                        // Obtiene info de netsuite mapeo de posibles errores en la estructura del documento
                        var validateInfo = validateInformation(objMap, mappingValue);
                        if (validateInfo.length > 0) {
                            // objMap.contentFile.content = {};
                            objMap.contentFile.details = objMap.contentFile.details.concat(validateInfo);
                            objMap.contentFile.status = (!objMap.contentFile.details.some(err => err === 'The file does not have the readable structure to be used, verify that all the X12 data is correct.'));
                        }
                    }
                } else {
                    objMap.contentFile.details = '';
                }
                log.debug({ title: 'Objeto mapeado con el documento:', details: objMap });
                objMap.idTracker = obtainTrackerRecord(objMap);
                mapContext.write({ key: mapContext.key, value: objMap });
            } catch (err) {
                log.error({ title: 'Error occurred in map', details: err });
            }

        }
        const obtainTrackerRecord = (objMap) => {
            try {
                // log.debug({ title: 'RECORDS', details: objMap });
                let type = RECORDS.TRACKER.id;
                let filters = [[RECORDS.TRACKER.FIELDS.NAME, search.Operator.IS, objMap.fileName]]
                let columns = [];
                Object.keys(RECORDS.TRACKER.FIELDS).forEach((name) => {
                    columns.push(search.createColumn({ name: RECORDS.TRACKER.FIELDS[name] }))
                });
                let dataSS = getDataToSS(type, filters, columns);
                // log.debug({ title: 'dataSS', details: dataSS });
                // Create/Load record tracker to info collection
                var ASNtracker = null;
                if (dataSS.details === '') {
                    if (dataSS.count === 0) {
                        ASNtracker = record.create({ type: RECORDS.TRACKER.id, isDynamic: true })
                    } else {
                        if (dataSS.results[0][RECORDS.TRACKER.FIELDS.ID].value === 3) {
                            return dataSS.results[0];
                        }
                        ASNtracker = record.load({ type: RECORDS.TRACKER.id, id: dataSS.results[0][RECORDS.TRACKER.FIELDS.ID].value, isDynamic: true })
                    }
                    var idFile = ASNtracker.getValue({ fieldId: RECORDS.TRACKER.FIELDS.DOCU_EXEC }) || null;
                    const date1 = new Date();
                    const nameFile = `DOC_ASN${date1.getDate()}_${date1.getMonth() + 1}_${date1.getYear() + 1900}_${date1.getHours()}_${date1.getMinutes()}_${date1.getSeconds()}`
                    if (idFile === null) {
                        let contenido = JSON.stringify(objMap.contentFile);
                        // log.debug({ title: 'contenido', details: contenido });
                        let docExecute = file.create({
                            name: nameFile,
                            fileType: file.Type.PLAINTEXT,
                            contents: contenido,
                            folder: objMap.idsFolders.find(folderPib => folderPib.name === 'Executed Doc').id,
                            encoding: file.Encoding.UTF_8,
                            isOnline: true
                        })
                        idFile = docExecute.save();
                    } else {
                        // log.debug({ title: 'dataSS.results[0][RECORDS.TRACKER.FIELDS.DOCU_EXEC]', details: dataSS.results[0][RECORDS.TRACKER.FIELDS.DOCU_EXEC] });
                        let contenido = JSON.stringify(objMap.contentFile);
                        // log.debug({ title: 'contenido', details: contenido });
                        let docExecute = file.create({
                            name: dataSS.results[0][RECORDS.TRACKER.FIELDS.DOCU_EXEC].text,
                            fileType: file.Type.PLAINTEXT,
                            contents: contenido,
                            folder: objMap.idsFolders.find(folderPib => folderPib.name === 'Executed Doc').id,
                            encoding: file.Encoding.UTF_8,
                            isOnline: true
                        })
                        // let docExecute = file.load({ id: idFile })
                        // docExecute.contents = contenido;
                        idFile = docExecute.save();
                        let docExecute2 = file.load({ id: idFile })
                        docExecute2.name = nameFile;
                        idFile = docExecute2.save();
                    }
                    ASNtracker.setValue({ fieldId: RECORDS.TRACKER.FIELDS.DOCU_EXEC, value: idFile })
                    ASNtracker.setValue({ fieldId: RECORDS.TRACKER.FIELDS.NAME, value: objMap.fileName })
                    ASNtracker.setValue({ fieldId: RECORDS.TRACKER.FIELDS.SFTP_CONNECTION, value: objMap.id })
                    ASNtracker.setValue({ fieldId: RECORDS.TRACKER.FIELDS.FILE, value: objMap.fileId })
                    ASNtracker.setValue({ fieldId: RECORDS.TRACKER.FIELDS.STATUS, value: 2 })
                    const idASNtracker = ASNtracker.save({ enableSourcing: true, ignoreMandatoryFields: true })
                    // log.debug({ title: 'Tracker generate', details: idASNtracker });
                    if (idASNtracker) {
                        let type = RECORDS.TRACKER.id;
                        let filters = [[RECORDS.TRACKER.FIELDS.ID, search.Operator.ANYOF, idASNtracker]]
                        let columns = [];
                        Object.keys(RECORDS.TRACKER.FIELDS).forEach((name) => {
                            columns.push(search.createColumn({ name: RECORDS.TRACKER.FIELDS[name] }))
                        });
                        let dataSS = getDataToSS(type, filters, columns);
                        return dataSS.results[0];
                    }
                    return null;
                }
                return null;
            } catch (e) {
                log.error({ title: 'Error obtainTrackerRecord:', details: e });
                return null;
            }
        }
        /*
            Funcion que clasifica el tipo de archivo que se esta recibiendo
            Retorna un objeto el cual posee toda la estructura del ASN o del EPCIS
         */
        function classifyFilesAndMoveFile_toNewFolder(objMap, mappingValue) {
            try {
                log.audit({ title: 'Objeto a convertir 🔻:', details: objMap });
                var objToDocument = {};
                var detalle = [];
                switch (objMap.extension) {
                    case 'X12':
                    case 'x12':
                        var output = url.resolveScript({
                            scriptId: SCRIPTS.SFTP_PWD_GUID.SCRIPT_ID,
                            deploymentId: SCRIPTS.SFTP_PWD_GUID.DEPLOY_ID,
                            returnExternalUrl: true,
                            params: { downloadF: true, downloadFile: JSON.stringify(objMap) }
                        });

                        var response = https.get({ url: output, });
                        var obj_output = JSON.parse(response.body);
                        log.audit({ title: 'response FROM MAP', details: response.body });

                        if (obj_output.fileId !== 'NA') {
                            objMap.fileId = obj_output.fileId;
                            var fileTxt = file.load({ id: obj_output.fileId });
                            fileTxt.name = objMap.fileName.replace(objMap.extension, '.txt');
                            fileTxt.save()

                            var fileX12 = file.load({ id: obj_output.fileId });
                            var contentDoc = fileX12.getContents();

                            log.debug({ title: 'Contenido Documento:', details: contentDoc });
                            objToDocument = convertX12ToJSON(contentDoc, mappingValue);
                            log.debug({ title: 'JSON Generado con el documento X12🟩:', details: objToDocument });
                            var fileX12 = file.load({ id: obj_output.fileId });
                            fileX12.name = objMap.fileName;
                            fileX12.save()
                        } else {
                            detalle.push('Error: Could not save file' + objMap.fileName)
                        }
                        break;
                    case 'XML':
                    case 'xml':
                        detalle.push('In file extension <b>' + objMap.fileName + '</b>');
                        break;
                    default:
                        log.debug({ title: 'Error extension archivo', details: 'Error en extension se encontró: ' + objMap.fileName });
                        detalle.push('In file extension <b>' + objMap.fileName + '</b>');
                        break;
                }
                // if (getExtension === 'X12' || getExtension === 'x12') {

                //     // var copiedFile = file.copy({
                //     //     id: objOutput.fileId,
                //     //     folder: parseInt(objOutput.ASN_folderID),
                //     //     conflictResolution: file.NameConflictResolution.OVERWRITE
                //     // });
                //     // log.audit({ title: 'copiedFile.id', details: copiedFile.id });
                //     // file.delete({
                //     //     id: objOutput.fileId
                //     // });
                // } else if (getExtension === 'XML' || getExtension === 'xml') {
                //     // var copiedFile = file.copy({
                //     //     id: objOutput.fileId,
                //     //     folder: parseInt(objOutput.EPCIS_folderID),
                //     //     conflictResolution: file.NameConflictResolution.OVERWRITE
                //     // });
                //     // file.delete({ id: objOutput.fileId });
                // } else {
                //     // mandar correo de que se encontró un archivo sin una extension esperada
                //     log.debug({ title: 'Error extension archivo', details: 'Error en extension se encontró: ' + fileObj.name });
                // }
                return {
                    content: objToDocument,
                    details: detalle
                }
            } catch (err) {
                log.error({ title: 'Error occurred in classifyFilesAndMoveFile_toNewFolder', details: err });
                return {
                    content: {},
                    details: [err.message]
                }
            }
        }
        function convertX12ToJSON(x12, mappingValue) {
            try {
                const segments = x12.split('~').map((segment) => segment.trim());
                const json = {};
                const arrayMain = [];

                // Obtain the lines in form the json element
                segments.forEach((segment) => {
                    const line = segment.split('|');
                    let objPib = generatePropertiesPerLine(line);
                    if (Object.keys(objPib).length > 0) {
                        arrayMain.push(objPib);
                    }
                });
                log.debug({ title: 'Datos mapeados en arreglo para su posterior agrupacion', details: arrayMain });

                var hlMap = {};
                var hlArr = [];
                var n1Map = {};
                var n1Arr = [];
                arrayMain.forEach((lineJson, index) => {
                    for (key in lineJson) {
                        switch (key) {
                            case 'ST':
                            case 'BSN':
                            case 'SE':
                                if (!json[key]) {
                                    json[key] = {};
                                }
                                json[key] = lineJson[key];
                                break;
                            case 'CTT':
                                if (!json[key]) {
                                    json[key] = {};
                                }
                                json['HL'].push(hlMap)
                                n1Map = {}
                                hlMap = {}
                                hlArr = []
                                n1Arr = []
                                json[key] = lineJson[key];
                                break;
                            case 'HL':
                                if (!hlMap[key]) {
                                    hlMap[key] = {};
                                    hlMap[key] = lineJson[key];
                                } else {
                                    if (!json[key]) {
                                        json[key] = [];
                                    }
                                    json[key].push(hlMap);
                                    if (n1Arr.length > 0) {
                                        hlMap['N1'] = n1Arr;
                                    }
                                    n1Map = {}
                                    hlMap = {}
                                    hlArr = []
                                    n1Arr = []
                                    hlMap[key] = {};
                                    hlMap[key] = lineJson[key];
                                }
                                break;
                            case 'N1':
                                if (!n1Map[key]) {
                                    n1Map[key] = {};
                                    n1Map[key] = lineJson[key];
                                } else {
                                    n1Arr.push(n1Map)
                                    n1Map[key] = {};
                                    n1Map[key] = lineJson[key];
                                }
                                break;
                            case 'DTM':
                            case 'YNQ':
                                if (!hlMap[key]) {
                                    hlMap[key] = [];
                                    hlMap[key].push(lineJson[key]);
                                } else {
                                    hlMap[key].push(lineJson[key]);
                                }
                                break;
                            default:
                                if (Object.keys(n1Map).length > 0 && mapChildren[1].some(keyNuda => keyNuda === key)) {
                                    n1Map[key] = {}
                                    n1Map[key] = lineJson[key]
                                }
                                if (Object.keys(hlMap).length > 0 && mapChildren[0].some(keyNuda => keyNuda === key)) {
                                    hlMap[key] = {}
                                    hlMap[key] = lineJson[key]
                                }
                                break;
                        }
                    }
                })
                log.debug({ title: 'Objeto master sin acomodos de HL', details: json });
                var structureCode = json.BSN.hierarchicalCode
                var cadenaStructure = '';
                var hlPadre = [];
                var arrHL = [];
                try {
                    json.HL.forEach((hlpib, index) => {
                        log.debug({ title: 'hlpib', details: hlpib });
                        log.debug({ title: 'hlpib.HL.structure', details: hlpib.HL.structure });
                        log.debug({ title: 'hlPadre', details: hlPadre });
                        if (cadenaStructure.indexOf('I') !== -1 && hlpib.HL.structure === 'I') {
                            hlPadre.map((data) => {
                                log.debug({ title: 'data1', details: data });
                                if (data.HL.structure === 'I') {
                                    data.arrayHL.push(hlpib)
                                }
                                return data
                            })
                        } else {
                            cadenaStructure += hlpib.HL.structure;
                            if (hlpib.HL.structure === 'I') {
                                hlPadre.push({ HL: hlpib.HL, arrayHL: [] });
                                hlPadre.map((data) => {
                                    log.debug({ title: 'data2', details: data });
                                    if (data.HL.structure === 'I') {
                                        data.arrayHL.push(hlpib)
                                    }
                                    return data
                                })
                            } else {
                                hlPadre.push(hlpib);
                            }
                        }
                        // Verifica cuando anexar los valores hijos de HL
                        if (mappingValue.hierarchicalCode[structureCode].description.length === cadenaStructure.length) {
                            // En caso de llegar con codigos incorrectos no permitara el acceso y rompera el cliclo
                            if (mappingValue.hierarchicalCode[structureCode].description === cadenaStructure) {
                                arrHL.push(hlPadre);
                                hlPadre = [];
                                cadenaStructure = '';
                            } else {
                                arrHL = [];
                                throw new Error('Structure HL incorrect.');
                            }
                            //En caso de ser SOI y mande estructura SOPI marcara error
                        } else if (mappingValue.hierarchicalCode[structureCode].description.length < cadenaStructure.length) {
                            arrHL = [];
                            throw new Error('Structure HL incorrect.');
                        }
                        // En caso de terminar el recorrido y teniendo aun caracteres en la estructura marcara error
                        if (json.HL.length === index && cadenaStructure.length > 0) {
                            arrHL = [];
                            throw new Error('Structure HL incorrect.');
                        }
                    })
                } catch (detalleError) {
                    log.debug({ title: 'Estructura HL incorrecta', details: detalleError });
                }
                json.HL = arrHL;
                return json;
            } catch (e) {
                log.error({ title: 'Error convertX12ToJSON:', details: e });
                return {}
            }
        }
        function generatePropertiesPerLine(line) {
            try {
                let objHijo = {}
                let name = line[0];
                let arrAttr1 = mapManifest[name];
                if (arrAttr1) {
                    let arrAttr = arrAttr1.manifest;
                    switch (name) {
                        case 'ST':
                        case 'BSN':
                        case 'HL':
                        case 'TD1':
                        case 'TD5':
                        case 'TD3':
                        case 'REF':
                        case 'DTM':
                        case 'YNQ':
                        case 'PRF':
                        case 'MAN':
                        case 'LIN':
                        case 'PO4':
                        case 'SN1':
                        case 'PID':
                        case 'N1':
                        case 'N3':
                        case 'N4':
                        case 'PER':
                        case 'CTT':
                        case 'SE':
                            // log.debug({ title: 'Longitudes', details: { lo: line.length, lp: arrAttr.length, name: name } });
                            var level = -1;
                            for (let i = 0; i < levels.length; i++) {
                                if (level === -1) {
                                    level = levels[i].indexOf(name);
                                    level = (level === -1 ? level : i)
                                    // log.debug({ title: 'level', details: { level, name } });
                                } else {
                                    break;
                                }
                            }
                            line.forEach((linePib, index) => {
                                // log.debug({ title: '[arrAttr[' + index + '] - ' + name, details: arrAttr[index] });
                                if (!objHijo[name]) {
                                    objHijo[name] = {}
                                }
                                if (!objHijo[name][arrAttr[index]]) {
                                    if (arrAttr[index]) {
                                        objHijo[name][arrAttr[index]] = '';
                                        objHijo[name][arrAttr[index]] = (arrAttr[index] === 'level' ? level : linePib)
                                    } else {
                                        objHijo[name][name + '_0' + index] = '';
                                        objHijo[name][name + '_0' + index] = linePib;
                                    }
                                }
                            })
                            break;
                        default:
                            break;
                    }
                }
                return objHijo;
            } catch (e) {
                log.error({ title: 'Error generatePropertiesPerLine', details: e });
                return {}
            }
        }
        /**
         * Funcion que mapea los errores dentro del documento
         */
        function validateInformation(objMap, mappingValue) {
            try {
                var contenidoDocumento = objMap.contentFile.content;
                log.debug({ title: 'Contenido Mapeado: ', details: contenidoDocumento });
                log.debug({ title: 'Valores de Netsuite:', details: mappingValue });
                var detalles = '';

                var details = [];
                var detailsFinal = [];
                levels[0].forEach((key, index) => {
                    // Validation to level 0
                    if (!contenidoDocumento[key]) {
                        details.push(`Property not found "${key}"`)
                    } else {
                        if (key !== 'HL') {
                            var detailPib = validateInfoObjManifest(key, contenidoDocumento[key], mappingValue)
                            // log.debug({ title: 'Detalles por propiedad:', details: detailPib });
                            details = details.concat(detailPib)
                        } else {
                            if (contenidoDocumento[key].length > 0) {
                                log.debug({ title: 'Datos HL:', details: contenidoDocumento[key] });
                                details = details.concat(validateInfoToHL(contenidoDocumento[key], contenidoDocumento, mappingValue));
                            } else {
                                details.push(`No values found within the HL attribute`)
                            }
                        }
                    }
                })
                log.debug({ title: 'Informacion reestructurada:🟢', details: contenidoDocumento });
                log.debug({ title: 'Incidencias encontradas:🔻', details: details });
                if (details.length > 0) {
                    detailsFinal.push("The file does not have the readable structure to be used, verify that all the X12 data is correct.")
                    detailsFinal = detailsFinal.concat(details)
                }

                return detailsFinal;
            } catch (e) {
                log.error({ title: 'Error validateInformation:', details: e });
                return ['Error to validate information to document ' + objMap.fileName];
            }
        }
        const validateInfoToHL = (arrHL, objStructureMaster, mappingValue) => {
            try {
                var detalleHL = [];
                log.debug({ title: 'Comenzando con las validaciones individuales de HL:', details: '🟢' });
                var longitudStructure = objStructureMaster.BSN.hierarchicalCode?.text || objStructureMaster.BSN.hierarchicalCode;
                var errorKey = '';
                // General tour of HL elements
                arrHL.map((hlPibote, index) => {
                    //Tour of the segment by HL
                    log.debug({ title: 'Segmento HL (' + longitudStructure + '):', details: hlPibote });
                    hlPibote.map((hlChild) => {
                        const levelCode = hlChild?.HL?.structure || 'NA';
                        switch (levelCode) {
                            case 'S':
                                // log.debug({ title: 'Data HL anterior:', details: hlChild });
                                // validatePropertyHL(levelCode, hlChild);
                                for (key in hlChild) {
                                    var manifestPib = mapManifest[key].manifest;
                                    // delete hlChild[key].level
                                    switch (key) {
                                        // Validate TD1
                                        case 'TD1':
                                            errorKey = '';
                                            // manifestPib.forEach((keyMan) => {
                                            //     if (keyMan === 'packingCode') {
                                            //         errorKey = ((mappingValue[keyMan][hlChild[key][keyMan]]) ? '' : 'Packaging code incorrect.');
                                            //         if (errorKey === '') {
                                            //             hlChild[key][keyMan] = mappingValue[keyMan][hlChild[key][keyMan]]
                                            //         }
                                            //     }
                                            //     if (keyMan === 'ladingQty') {
                                            //         errorKey = ((Number(hlChild[key][keyMan]) > 0) ? '' : 'Lading Quantity incorrect.');
                                            //     }
                                            //     if (keyMan === 'weightQualifier') {
                                            //         errorKey = ((Number(hlChild[key][keyMan]) === 'G') ? '' : 'Weight Qualifier code incorrect.');
                                            //     }
                                            //     if (keyMan === 'weight') {
                                            //         errorKey = ((Number(hlChild[key][keyMan]) > 0) ? '' : 'Weight Quantity incorrect.');
                                            //     }
                                            //     if (keyMan === 'units') {
                                            //         errorKey = ((Number(hlChild[key][keyMan]) === 'LB') ? '' : 'Unit code incorrect.');
                                            //     }
                                            //     if (errorKey.length !== 0) {
                                            //         detalleHL.push(errorKey)
                                            //         errorKey = '';
                                            //     }
                                            // })
                                            break;
                                        // Validate TD5
                                        case 'TD5':
                                            errorKey = '';
                                            manifestPib.forEach((keyMan) => {
                                                if (keyMan === 'orderStatus') {
                                                    errorKey = ((mappingValue[keyMan][hlChild[key][keyMan]]) ? '' : 'Order Status code qualifier incorrect.');
                                                    if (errorKey === '') {
                                                        hlChild[key][keyMan] = mappingValue[keyMan][hlChild[key][keyMan]]
                                                    }
                                                }
                                                if (errorKey.length !== 0) {
                                                    detalleHL.push(errorKey)
                                                    errorKey = '';
                                                }
                                            })
                                            //     if (keyMan === 'code') {
                                            //         errorKey = ((Number(hlChild[key][keyMan]) === 'O') ? '' : 'Routing sequence code incorrect.');
                                            //     }
                                            //     if (keyMan === 'codeQualifier') {
                                            //         errorKey = ((Number(hlChild[key][keyMan]) === '2') ? '' : 'Identification code qualifier incorrect.');
                                            //     }
                                            //     if (keyMan === 'weight') {
                                            //         errorKey = ((Number(hlChild[key][keyMan]) > 0) ? '' : 'Weight Quantity incorrect.');
                                            //     }
                                            break;
                                        case 'TD3':
                                            errorKey = '';
                                            // manifestPib.forEach((keyMan) => {
                                            //     if (keyMan === 'identifyingQualifier') {
                                            //         errorKey = ((mappingValue[keyMan][hlChild[key][keyMan]]) ? '' : 'Reference identification qualifier incorrect.');
                                            //         if (errorKey === '') {
                                            //             hlChild[key][keyMan] = mappingValue[keyMan][hlChild[key][keyMan]]
                                            //         }
                                            //     }
                                            //     if (errorKey.length !== 0) {
                                            //         detalleHL.push(errorKey)
                                            //         errorKey = '';
                                            //     }
                                            // })
                                            break;
                                        case 'REF':
                                            errorKey = '';
                                            manifestPib.forEach((keyMan) => {
                                                if (keyMan === 'identifyingQualifier') {
                                                    errorKey = ((mappingValue[keyMan][hlChild[key][keyMan]]) ? '' : 'Reference identification qualifier incorrect.');
                                                    if (errorKey === '') {
                                                        hlChild[key][keyMan] = mappingValue[keyMan][hlChild[key][keyMan]]
                                                    }
                                                }
                                                if (errorKey.length !== 0) {
                                                    detalleHL.push(errorKey)
                                                    errorKey = '';
                                                }
                                            })
                                            break;
                                        case 'DTM':
                                            errorKey = '';
                                            // manifestPib.forEach((keyMan) => {
                                            //     log.debug({ title: 'hlChild[key]', details: hlChild[key] });
                                            //     hlChild[key].map((datePiv) => {
                                            //         if (keyMan === 'date') {
                                            //             log.debug({ title: 'datePiv', details: datePiv });
                                            //             errorKey = ((datePiv[keyMan]?.length === 8) ? '' : 'The number of characters is incorrect to DTM');
                                            //             if (errorKey.length === 0) {
                                            //                 datePiv[keyMan] = {
                                            //                     value: new Date(datePiv[keyMan].slice(6, 8), datePiv[keyMan].slice(4, 6), datePiv[keyMan].slice(0, 4)),
                                            //                     text: datePiv[keyMan]
                                            //                 }
                                            //             }
                                            //         }
                                            //     })
                                            //     if (errorKey.length !== 0) {
                                            //         detalleHL.push(errorKey)
                                            //         errorKey = '';
                                            //     }
                                            // })
                                            break;
                                        case 'YNQ':
                                            errorKey = '';
                                            manifestPib.forEach((keyMan, index) => {
                                                log.debug({ title: 'hlChild[key]', details: hlChild[key] });
                                                if (index === 0) {
                                                    hlChild[key].map((datePiv) => {
                                                        if (keyMan === 'codeListQualifier') {
                                                            errorKey = ((datePiv[keyMan] === '99') ? '' : 'Code list qualifier is incorrect to YNQ');
                                                        }
                                                        if (keyMan === 'industryCode') {
                                                            errorKey = ((datePiv[keyMan] === 'TS') ? '' : 'Industry codeis incorrect to YNQ');
                                                        }
                                                        if (errorKey.length !== 0) {
                                                            detalleHL.push(errorKey)
                                                            errorKey = '';
                                                        }
                                                    })
                                                }
                                            })
                                            break;
                                    }
                                }
                                break;
                            case 'O':
                                for (key in hlChild) {
                                    var manifestPib = mapManifest[key].manifest;
                                    switch (key) {
                                        // Validate TD1
                                        case 'PRF':
                                            errorKey = '';
                                            manifestPib.forEach((keyMan) => {
                                                if (keyMan === 'numPurchOr') {
                                                    log.debug({ title: 'Numero de orden', details: hlChild[key][keyMan] });
                                                    log.debug({ title: 'RECORDS.PURCHASE_ORDER', details: RECORDS.PURCHASE_ORDER });
                                                    const dataPO = obtainPurchaseOrder(hlChild[key][keyMan] || '')
                                                    errorKey = ((dataPO.status === true && dataPO.count > 0) ? '' : 'Purchase order incorrect.');
                                                    if (errorKey === '') {
                                                        hlChild[key]['dataPO'] = {}
                                                        hlChild[key]['dataPO'] = dataPO.results
                                                    }
                                                }
                                                if (errorKey.length !== 0) {
                                                    detalleHL.push(errorKey)
                                                    errorKey = '';
                                                }
                                            })
                                            break;
                                    }
                                }
                                break;
                            case 'P':
                                // log.debug({ title: 'Data HL anterior:', details: hlChild });
                                // // validatePropertyHL(levelCode, hlChild);
                                // for (key in hlChild) {
                                //     var manifestPib = mapManifest[key].manifest;
                                //     // delete hlChild[key].level
                                //     switch (key) {
                                //         case 'TD1':
                                //             errorKey = '';
                                //             manifestPib.forEach((keyMan) => {
                                //                 if (keyMan === 'packingCode') {
                                //                     let arrPC = ['CAS', 'CTN', 'PLT'];
                                //                     errorKey = (arrPC.some((pc) => pc === hlChild[key][keyMan]) ? '' : 'Packaging Code incorrect.');
                                //                 }
                                //                 if (errorKey.length !== 0) {
                                //                     detalleHL.push(errorKey)
                                //                     errorKey = '';
                                //                 }
                                //             })
                                //             break;
                                //     }
                                // }
                                // log.debug({ title: 'Data HL nuevo:', details: hlChild });
                                break;
                            case 'I':
                                log.debug({ title: 'Data HL I anterior:', details: hlChild });
                                // validatePropertyHL(levelCode, hlChild);
                                var arrNDC = [];
                                var arrLOT = [];
                                hlChild.arrayHL.forEach((hlPib) => {
                                    for (key in hlPib) {
                                        var manifestPib = mapManifest[key].manifest;
                                        // delete hlChild[key].level
                                        switch (key) {
                                            case 'LIN':
                                                errorKey = '';
                                                log.debug({ title: 'Manifest to HL child' + key + ':', details: manifestPib });
                                                Object.keys(hlPib[key]).forEach((keyMan) => {
                                                    if (keyMan === 'prodServID') {
                                                        errorKey = ((hlPib[key][keyMan] !== '') ? '' : 'NDC empty.');
                                                        if (errorKey === '') {
                                                            arrNDC.push(hlPib[key][keyMan])
                                                        }
                                                    }
                                                    // log.debug({ title: 'keyMan', details: keyMan });
                                                    // log.debug({ title: 'key', details: key });
                                                    if (keyMan.includes(key)) {
                                                        var linPiv = keyMan.split('_')
                                                        // log.debug({ title: 'linPiv', details: linPiv });
                                                        var validaLIN = Number(linPiv[1]) % 2 === 0;
                                                        // errorKey = ((hlChild[key][keyMan] !== '') ? '' : 'NDC empty.');
                                                        if (!validaLIN) {
                                                            arrLOT.push(hlPib[key][keyMan]);
                                                        }
                                                    }
                                                    if (errorKey.length !== 0) {
                                                        detalleHL.push(errorKey)
                                                        errorKey = '';
                                                    }
                                                })
                                                break;
                                        }
                                    }
                                    log.debug({ title: 'arrNDC', details: arrNDC });
                                    log.debug({ title: 'arrLOT', details: arrLOT });
                                    // log.debug({ title: 'Data HL I nuevo:', details: hlChild });
                                })
                                break;
                            default:
                                detalleHL.push('Structure incorrect to HL.')
                                break;

                        }
                        delete hlChild.level
                        return hlChild;
                    })
                    return hlPibote;
                })
                return detalleHL;
            } catch (e) {
                log.error({ title: 'Error validateInfoToHL:', details: e });
                return ['Ocurrs error in validation to HL.']
            }
        }
        const validateInfoObjManifest = (key, obj_Pib, mappingValue) => {
            try {
                var detailsPib = []
                var detallesPib = mapManifest[key].details;
                var manifestPib = mapManifest[key].manifest;
                // log.debug({ title: 'Detalles de prioridades de los objetos:', details: { detallesPib, manifestPib, key } });
                var i = -1;
                for (keyPiv in obj_Pib) {
                    // Validaciones with list
                    var posKey = manifestPib.indexOf(keyPiv);
                    var valuePib = obj_Pib[keyPiv];
                    // log.debug({ title: 'Valores pibote a validar', details: { keyPiv, valoresPibote: valuePib, valores: obj_Pib || '', Posicion: posKey } });
                    if (posKey !== -1) {
                        var valuesNS = mappingValue[keyPiv] || null;
                        if (valuesNS) {
                            if (!valuesNS[valuePib]) {
                                detailsPib.push(`Invalid value ${valuePib} in property ${keyPiv}.`)
                            } else {
                                var valueProperty = obj_Pib[keyPiv]
                                obj_Pib[keyPiv] = {
                                    value: valuesNS[valuePib].value,
                                    text: valueProperty
                                }
                            }
                            // log.debug({ title: 'obj_Pib', details: obj_Pib });
                        }
                    } else {
                        if (keyPiv.indexOf(key) === -1) {
                            detailsPib.push(`Property not found "${key}"`)
                        }
                    }
                    var errorKey = '';
                    switch (key) {
                        case 'ST':
                            if (keyPiv === 'identifyingCode') {
                                errorKey = ((valuePib === 856 || valuePib === '856') ? '' : 'The value does not match 856');
                            }
                            break;
                        case 'BSN':
                            if (keyPiv === 'date') {
                                errorKey = ((valuePib?.length === 8) ? '' : 'The number of characters is incorrect to date');
                                if (errorKey.length === 0) {
                                    obj_Pib[keyPiv] = {
                                        value: new Date(valuePib.slice(0, 4), valuePib.slice(4, 6), valuePib.slice(6, 8)),
                                        text: valuePib
                                    }
                                }
                            }
                            if (keyPiv === 'time') {
                                errorKey = ((valuePib?.length === 6) ? '' : 'The number of characters is incorrect to time');
                                if (errorKey.length === 0) {
                                    obj_Pib[keyPiv] = {
                                        value: `${valuePib.slice(0, 4)}:${valuePib.slice(4, 6)}:${valuePib.slice(6, 8)}`,
                                        text: valuePib
                                    }
                                }
                            }
                            // log.debug({ title: 'obj_Pib', details: obj_Pib });
                            break;
                    }
                    // Colocando la linea de datos erroneos
                    if (errorKey.length > 0) {
                        detailsPib.push(`Error in property "${keyPiv}": ${errorKey}`)
                    }
                }
                return detailsPib
            } catch (e) {
                log.error({ title: 'Error validateInfoObjManifest:', details: e });
                return [e.message]
            }
        }

        //
        const obtainPurchaseOrder = (documentNumber) => {
            try {
                const type = RECORDS.PURCHASE_ORDER.id
                const filters = [[RECORDS.PURCHASE_ORDER.FIELDS.TRANID, search.Operator.IS, documentNumber]]
                const columns = []
                Object.keys(RECORDS.PURCHASE_ORDER.FIELDS).forEach((fieldName) => {
                    columns.push(search.createColumn({ name: RECORDS.PURCHASE_ORDER.FIELDS[fieldName] }))
                })
                log.debug({ title: 'RECORDS.PURCHASE_ORDER', details: RECORDS.PURCHASE_ORDER });
                Object.keys(RECORDS.PURCHASE_ORDER.SUBLIST.ITEM.FIELDS).forEach((fieldName) => {
                    const isJoin = RECORDS.PURCHASE_ORDER.SUBLIST.ITEM.FIELDS[fieldName] === RECORDS.PURCHASE_ORDER.SUBLIST.ITEM.JOIN[fieldName]?.id;
                    log.debug({ title: 'isJoin', details: { FieldSublist: RECORDS.PURCHASE_ORDER.SUBLIST.ITEM.FIELDS[fieldName], FieldSublistJoin: RECORDS.PURCHASE_ORDER.SUBLIST.ITEM.JOIN[fieldName], isJoin: isJoin } });
                    switch (isJoin) {
                        case true:
                            Object.keys(RECORDS.PURCHASE_ORDER.SUBLIST.ITEM.JOIN[fieldName].FIELDS).forEach((fieldNameJoin) => {
                                log.debug({ title: 'Campos ' + fieldNameJoin + ':', details: RECORDS.PURCHASE_ORDER.SUBLIST.ITEM.JOIN[fieldName].FIELDS[fieldNameJoin] });
                                columns.push(search.createColumn({ name: RECORDS.PURCHASE_ORDER.SUBLIST.ITEM.JOIN[fieldName].FIELDS[fieldNameJoin], join: RECORDS.PURCHASE_ORDER.SUBLIST.ITEM.FIELDS[fieldName] }))
                            })
                            break;
                        case false:
                            columns.push(search.createColumn({ name: RECORDS.PURCHASE_ORDER.SUBLIST.ITEM.FIELDS[fieldName] }))
                            break;
                    }
                })
                let dataSS_PO = getDataToSS(type, filters, columns);
                log.debug({ title: 'Datos de la Orden de compra', details: dataSS_PO });
                var dataObject = {};
                dataSS_PO.results.forEach((info) => {
                    log.debug({ title: 'info', details: info });
                    log.debug({ title: 'Tipo (*)', details: info[RECORDS.PURCHASE_ORDER.FIELDS.MAIN_LINE] === '*' });
                    log.debug({ title: 'Tipo ( )', details: info[RECORDS.PURCHASE_ORDER.FIELDS.MAIN_LINE] === ' ' });
                    switch (info[RECORDS.PURCHASE_ORDER.FIELDS.MAIN_LINE]) {
                        case '*':
                            if (!dataObject['body']) {
                                dataObject['body'] = {};
                            }
                            dataObject['body'] = info;
                            Object.keys(RECORDS.PURCHASE_ORDER.SUBLIST.ITEM.FIELDS).forEach((fieldName) => {
                                delete dataObject['body'][RECORDS.PURCHASE_ORDER.SUBLIST.ITEM.FIELDS[fieldName]];
                            })
                            break;
                        default:
                            if (info[RECORDS.PURCHASE_ORDER.SUBLIST.ITEM.FIELDS.ITEM] !== '') {
                                if (!dataObject['item']) {
                                    dataObject['item'] = [];
                                }
                                var info1 = info;
                                Object.keys(RECORDS.PURCHASE_ORDER.FIELDS).forEach((fieldName) => {
                                    delete info1[RECORDS.PURCHASE_ORDER.FIELDS[fieldName]];
                                })
                                if (!dataObject['item'].some((itemPib) => itemPib.item.value === info[RECORDS.PURCHASE_ORDER.SUBLIST.ITEM.FIELDS.ITEM].value)) {
                                    info1.arrinventoyDetail = [info1[RECORDS.PURCHASE_ORDER.SUBLIST.ITEM.FIELDS.INVENTORY_DETAIL]]
                                    delete info1[RECORDS.PURCHASE_ORDER.SUBLIST.ITEM.FIELDS.INVENTORY_DETAIL];

                                    dataObject['item'].push(info1);
                                } else {
                                    dataObject['item'].map((itemPib) => {
                                        if (itemPib.item.value === info1[RECORDS.PURCHASE_ORDER.SUBLIST.ITEM.FIELDS.ITEM].value) {
                                            itemPib.arrinventoyDetail.push(info1[RECORDS.PURCHASE_ORDER.SUBLIST.ITEM.FIELDS.INVENTORY_DETAIL])
                                        }
                                    })
                                }
                            }
                            break;
                    }
                })
                dataSS_PO.results = dataObject;
                log.debug({ title: 'dataObject', details: dataObject });
                return dataSS_PO;
            } catch (e) {
                log.error({ title: 'Error obtainPurchaseOrder:', details: e });
                return {
                    status: false,
                    count: 0,
                    results: [],
                    details: e.message
                }
            }
        }
        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {
            try {
                var objMap = JSON.parse(reduceContext.values[0])
                log.audit({ title: 'reduceContext', details: { key: reduceContext.key, objMap } });

                log.debug({ title: 'objMap.idTracker', details: objMap.idTracker });
                log.debug({ title: 'RECORDS.TRACKER.FIELDS.TRANSACTION_RELATED', details: RECORDS.TRACKER.FIELDS.TRANSACTION_RELATED });
                if (objMap.idTracker[RECORDS.TRACKER.FIELDS.TRANSACTION_RELATED].value === '' && objMap.contentFile.details.length === 0 && objMap.idTracker[RECORDS.TRACKER.FIELDS.STATUS].value === '2') {
                    var objTransaction = {};

                    // Data segment BSN
                    var dataBSN = objMap.contentFile.content.BSN;
                    // Data segment HL
                    var dataHL = objMap.contentFile.content.HL;
                    // Data Purchase Order
                    var dataBody = dataHL[0][1].PRF.dataPO.body;
                    var dataLine = dataHL[0][1].PRF.dataPO.item;
                    var arrLOT = (dataBSN.hierarchicalCode.text === '0001' ? dataHL[0][3].arrayHL : dataHL[0][2].arrayHL);
                    log.debug({ title: 'Datos cabecera de la transaccion', details: dataBody });
                    log.debug({ title: 'Datos linea de la transaccion', details: dataLine });
                    log.debug({ title: 'Detalle de los articulos:', details: arrLOT });
                    var ynqFind = dataHL[0][0].YNQ.find((ynqPib) => ynqPib.codeListQualifier === '99' && ynqPib.industryCode === 'TS') || null;
                    var tsText = (ynqFind !== null ? (ynqFind.industryCode + ' ' + ynqFind.codeListQualifier + ' ' + ynqFind.messageTxt_1) : '');
                    objTransaction.PO = {
                        internalid: dataBody.internalid,
                        vendor: dataBody.entity,
                        customer: dataBody.shipto,

                        shipFromSelect: dataBody.shipaddress,
                        // shipToSelect: dataBody.shipaddresslist,
                        purposeCode: dataBSN.purposeCode,
                        hierarchicalCode: dataBSN.hierarchicalCode,
                        orderDate: dataBSN.date,
                        typeCode: dataBSN.tranTypeCode,
                        trackingReference: dataHL[0][0].REF.identifyingQualifier,
                        referenceNo: dataHL[0][0].REF.identifying,
                        ts: tsText
                    }
                    log.debug({ title: 'Datos para generar la transacción:', details: objTransaction });
                    var transactionASN = record.transform({ fromType: record.Type.PURCHASE_ORDER, fromId: dataBody.internalid.value, toType: RECORDS.ASN.id, isDynamic: true, });
                    transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.TRANID, value: objTransaction.PO.referenceNo })
                    transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.CUSTOMER, value: objTransaction.PO.customer.value })
                    transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.PO, value: objTransaction.PO.internalid.value })
                    transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.PURPOSE_CODE, value: objTransaction.PO.purposeCode.value })
                    transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.TYPE_CODE, value: objTransaction.PO.typeCode.value })
                    transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.STRUCTURE_CODE, value: objTransaction.PO.hierarchicalCode.value })
                    transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.SHIPMENT_TRACKING_REFERENCE, value: objTransaction.PO.trackingReference.value })
                    transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.ORDER_DATE, value: objTransaction.PO.orderDate.value })
                    transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.TS, value: objTransaction.PO.ts })
                    const numLine = transactionASN.getLineCount({ sublistId: RECORDS.ASN.SUBLIST.ITEM.id })
                    log.debug({ title: 'Numero de lineas:', details: numLine });
                    // for (const line = numLine-1; line < numLine; line--) {
                    //     transactionASN.removeLine({ sublistId: RECORDS.ASN.SUBLIST.ITEM.id, line: line, ignoreRecalc: true })
                    // }
                    for (var line = 0; line < numLine; line++) {

                        transactionASN.selectLine({ sublistId: RECORDS.ASN.SUBLIST.ITEM.id, line: line });
                        var itemValue = {
                            value: transactionASN.getSublistValue({ sublistId: RECORDS.ASN.SUBLIST.ITEM.id, fieldId: 'item', line: line }),
                            text: transactionASN.getSublistText({ sublistId: RECORDS.ASN.SUBLIST.ITEM.id, fieldId: 'item', line: line })
                        }
                        log.debug({ title: 'itemValue', details: itemValue });
                        const NDC = itemValue.text.split(' ')[0];
                        const detailItem = arrLOT.find(itemPib => itemPib.LIN.prodServID === NDC) || null;
                        if (detailItem !== null) {
                            const arrLOTPIB = [];
                            Object.keys(detailItem.LIN).forEach((keyLIN) => {
                                log.debug({ title: 'keyLIN', details: keyLIN });
                                const linPiv = keyLIN.split('_')
                                const validaLIN = Number(linPiv[1]) % 2 === 0;
                                if (!validaLIN && keyLIN.includes('LIN')) {
                                    arrLOTPIB.push(detailItem.LIN[keyLIN]);
                                }
                            });
                            log.debug({ title: 'arrLOTPIB', details: arrLOTPIB });
                            transactionASN.setCurrentSublistValue({ sublistId: RECORDS.ASN.SUBLIST.ITEM.id, fieldId: 'quantity', value: arrLOTPIB.length });
                            var quantity = Number(transactionASN.getSublistValue({ sublistId: RECORDS.ASN.SUBLIST.ITEM.id, fieldId: 'quantity', line: line }));
                            log.debug({ title: 'quantity', details: quantity });
                            var subrec = transactionASN.getCurrentSublistSubrecord({ sublistId: 'item', fieldId: 'inventorydetail' });
                            for (var lineInvDet = 0; lineInvDet < arrLOTPIB.length; lineInvDet++) {
                                subrec.selectNewLine({ sublistId: 'inventoryassignment' });
                                subrec.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'receiptinventorynumber', value: arrLOTPIB[lineInvDet] })
                                subrec.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'quantity', value: 1 })
                                subrec.commitLine({ sublistId: 'inventoryassignment' })
                            }
                            transactionASN.commitLine({ sublistId: RECORDS.ASN.SUBLIST.ITEM.id })
                        }

                    }
                    var idASN = transactionASN.save({ enableSourcing: true, ignoreMandatoryFields: true });
                    record.submitFields({
                        type: RECORDS.TRACKER.id,
                        id: objMap.idTracker[RECORDS.TRACKER.FIELDS.ID].value,
                        values: {
                            [RECORDS.TRACKER.FIELDS.TRANSACTION_RELATED]: idASN,
                            [RECORDS.TRACKER.FIELDS.STATUS]: 3,
                            [RECORDS.TRACKER.FIELDS.DETAILS]: ''
                        },
                        options: {
                            enablesourcing: false,

                        }
                    })

                } else if (objMap.idTracker[RECORDS.TRACKER.FIELDS.TRANSACTION_RELATED].value !== '' && objMap.contentFile.details.length === 0 && objMap.idTracker[RECORDS.TRACKER.FIELDS.STATUS].value === '2') {
                    // objMap.contentFile.details.push('The transaction cannot be created because it has already been processed.')
                    var objTransaction = {};

                    // Data segment BSN
                    var dataBSN = objMap.contentFile.content.BSN;
                    // Data segment HL
                    var dataHL = objMap.contentFile.content.HL;
                    // Data Purchase Order
                    var dataBody = dataHL[0][1].PRF.dataPO.body;
                    var dataLine = dataHL[0][1].PRF.dataPO.item;
                    var arrLOT = (dataBSN.hierarchicalCode.text === '0001' ? dataHL[0][3].arrayHL : dataHL[0][2].arrayHL);
                    log.debug({ title: 'Datos cabecera de la transaccion', details: dataBody });
                    log.debug({ title: 'Datos linea de la transaccion', details: dataLine });
                    log.debug({ title: 'Detalle de los articulos:', details: arrLOT });

                    var ynqFind = dataHL[0][0].YNQ.find((ynqPib) => ynqPib.codeListQualifier === '99' && ynqPib.industryCode === 'TS') || null;
                    var tsText = (ynqFind !== null ? (ynqFind.industryCode + ' ' + ynqFind.codeListQualifier + ' ' + ynqFind.messageTxt_1) : '');
                    objTransaction.PO = {
                        internalid: dataBody.internalid,
                        vendor: dataBody.entity,
                        customer: dataBody.shipto,
                        shipto: dataBody.custbody_tkio_ship_to_acc_number,

                        shipFromSelect: dataBody.shipaddress,
                        // shipToSelect: dataBody.shipaddresslist,
                        purposeCode: dataBSN.purposeCode,
                        hierarchicalCode: dataBSN.hierarchicalCode,
                        orderDate: dataBSN.date,
                        typeCode: dataBSN.tranTypeCode,
                        trackingReference: dataHL[0][0].REF.identifyingQualifier,
                        referenceNo: dataHL[0][0].REF.identifying,
                        statusCode: dataHL[0][0].TD5.orderStatus,
                        ts: tsText
                    }
                    log.debug({ title: 'objTransaction', details: objTransaction });
                    var transactionASN = record.load({ type: RECORDS.ASN.id, id: objMap.idTracker[RECORDS.TRACKER.FIELDS.TRANSACTION_RELATED].value, isDynamic: true, });
                    transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.TRANID, value: objTransaction.PO.referenceNo })
                    transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.CUSTOMER, value: objTransaction.PO.customer.value })
                    // transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.SHIP_TO, value: objTransaction.PO.shipToSelect.value })
                    transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.PO, value: objTransaction.PO.internalid.value })
                    transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.PURPOSE_CODE, value: objTransaction.PO.purposeCode.value })
                    transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.TYPE_CODE, value: objTransaction.PO.typeCode.value })
                    transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.STRUCTURE_CODE, value: objTransaction.PO.hierarchicalCode.value })
                    transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.SHIPMENT_TRACKING_REFERENCE, value: objTransaction.PO.trackingReference.value })
                    transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.ORDER_DATE, value: objTransaction.PO.orderDate.value })
                    transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.STATUS_CODE, value: objTransaction.PO.statusCode.value })
                    transactionASN.setValue({ fieldId: RECORDS.ASN.FIELDS.TS, value: objTransaction.PO.ts })

                    const numLine = transactionASN.getLineCount({ sublistId: RECORDS.ASN.SUBLIST.ITEM.id })
                    log.debug({ title: 'Numero de lineas:', details: numLine });
                    // for (const line = numLine-1; line < numLine; line--) {
                    //     transactionASN.removeLine({ sublistId: RECORDS.ASN.SUBLIST.ITEM.id, line: line, ignoreRecalc: true })
                    // }
                    var idASN = transactionASN.save({ enableSourcing: true, ignoreMandatoryFields: true });
                    record.submitFields({
                        type: RECORDS.TRACKER.id,
                        id: objMap.idTracker[RECORDS.TRACKER.FIELDS.ID].value,
                        values: {
                            [RECORDS.TRACKER.FIELDS.STATUS]: 3,
                            [RECORDS.TRACKER.FIELDS.DETAILS]: ''
                        },
                        options: {
                            enablesourcing: false,

                        }
                    })
                } else if (objMap.contentFile.details.length > 0) {
                    record.submitFields({
                        type: RECORDS.TRACKER.id,
                        id: objMap.idTracker[RECORDS.TRACKER.FIELDS.ID].value,
                        values: {
                            [RECORDS.TRACKER.FIELDS.STATUS]: 4,
                            [RECORDS.TRACKER.FIELDS.DETAILS]: objMap.contentFile.details,
                        },
                        options: {
                            enablesourcing: false,

                        }
                    })
                }
                reduceContext.write({ key: reduceContext.key, value: objMap });
            } catch (err) {
                log.error({ title: 'Error occurred in reduce', details: err });
            }
        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {
            try {
                const config = {};
                config.emailRepresent = runtime.getCurrentScript().getParameter({ name: SCRIPTS.ST_PROGRAMMED_SFTP_MR.PARAMETERS.EMPLOYEE });
                var dataGrouping = {}
                log.debug({ title: 'config', details: config });
                log.debug({ title: 'summaryContext', details: summaryContext });
                summaryContext.output.iterator().each((key, value) => {
                    var valueObj = JSON.parse(value)
                    log.debug({ title: 'Datos:', details: { key, valueObj } });
                    // log.error({ title: 'Datos:', details: { key, valueObj } });
                    if (!dataGrouping[valueObj.id]) {
                        dataGrouping[valueObj.id] = valueObj
                        dataGrouping[valueObj.id]['documentResumen'] = []
                    }
                    dataGrouping[valueObj.id]['documentResumen'].push({
                        fileName: valueObj.fileName,
                        extension: valueObj.extension,
                        details: valueObj.contentFile.details || [],
                        status: valueObj.contentFile.status,
                        idTracker: valueObj.idTracker
                    })
                    delete dataGrouping[valueObj.id].contentFile
                    delete dataGrouping[valueObj.id].fileName
                    delete dataGrouping[valueObj.id].extension
                    return true
                })

                log.debug({ title: 'Datos Agrupados para el envio de correos:', details: dataGrouping });
                for (const [key, value] of Object.entries(dataGrouping)) {
                    log.debug({ title: key, details: value });
                    sendEmailDetails(Number(config.emailRepresent), value, value.emails.split(','));
                }
                // Send emails with Succesful or error
                dataGrouping
            } catch (e) {
                log.error({ title: 'Error summarize:', details: e });
            }

        }
        return { getInputData, map, reduce, summarize }

    });
