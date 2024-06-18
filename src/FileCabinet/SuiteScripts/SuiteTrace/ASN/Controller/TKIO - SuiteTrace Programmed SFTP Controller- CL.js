/**
 * @NApiVersion 2.1
 */
define(['N/log', 'N/search', 'N/email', '../Constants/TKIO - SuiteTrace Programmed SFTP Constants- CT.js'],

    (log, search, email, sftpConstants) => {

        // const getInfoToConection = () => {
        //     try {
        //         var SFTPCONFIGURATION_RECORD = 'customrecord_suitetrace_sftp_config';
        //         const customrecord_suitetrace_sftp_configSearch = search.create({
        //             type: SFTPCONFIGURATION_RECORD,
        //             filters: [
        //                 ['isinactive', search.Operator.IS, 'F'],
        //             ],
        //             columns: [
        //                 sftpConstants
        //             ]
        //         });
        //         const customrecord_suitetrace_sftp_configSearchPagedData = customrecord_suitetrace_sftp_configSearch.runPaged({ pageSize: 1000 });
        //         return customrecord_suitetrace_sftp_configSearchPagedData;
        //     } catch (e) {
        //         log.error({ title: 'Error getInfoToConection🔻:', details: e });
        //     }
        // }
        const getDataToSS = (type, filters, columns) => {
            const dataResult = {
                status: true,
                count: 0,
                results: [],
                details: ''
            }
            try {
                // Creacion de la busqueda guardada 
                const searchObj = search.create({ type, filters, columns });
                const columnsName = searchObj.run().columns;
                // log.debug({ title: 'columnsName', details: columnsName });
                const countResult = searchObj.runPaged().count;
                if (countResult) {
                    dataResult.count = countResult
                    // Si excede de los 1000 resultados realiza una paginacion para evitar que se rompa el desarrollo
                    if (countResult > 1000) {
                        const dataResults = searchObj.runPaged({ pageSize: 1000 });
                        const { pageRanges } = dataResults
                        pageRanges.forEach(({ index }) => {
                            dataResults.fetch({ index })?.data.forEach(result => {
                                const objPib = {};
                                columns.forEach(({ name, join, formula }) => {
                                    // if (!objPib?.[name]) objPib[name] = {}
                                    const values = {};
                                    const columnaPib = (join ? columnsName.find(namePib => namePib.name === name && namePib.join === join) : columnsName.find(namePib => namePib.name === name));

                                    let text = result.getText(columnaPib);
                                    let value = result.getValue(columnaPib)
                                    if (text) {
                                        values.text = text;
                                        values.value = value;
                                    } else {
                                        values = value;
                                    }
                                    if (join) {
                                        if (!objPib?.[join]) {
                                            objPib[join] = {}
                                        }
                                        objPib[join][name] = values
                                    } else {
                                        if (!objPib?.[name]) {
                                            objPib[name] = {}
                                        }
                                        objPib[name] = values
                                    }
                                })
                                dataResult.results.push(objPib);
                            })
                        })
                    } else {
                        // Si no excede de los 1000 resultados ejecuta con esta funcion para optimizar la busqueda de los resultados
                        searchObj.run().each(result => {
                            const objPib = {};
                            columns.forEach(({ name, join, formula }) => {
                                // if (!objPib?.[name]) objPib[name] = {}
                                let values = {}
                                const columnaPib = (join ? columnsName.find(namePib => namePib.name === name && namePib.join === join) : columnsName.find(namePib => namePib.name === name))
                                let text = result.getText(columnaPib);
                                let value = result.getValue(columnaPib)
                                // log.debug({ title: 'Datos Busqueda:', details: { text, value, columnaPib } });
                                if (text) {
                                    values.text = text;
                                    values.value = value;
                                } else {
                                    values = value;
                                }
                                if (join) {
                                    if (!objPib?.[join]) {
                                        objPib[join] = {}
                                    }
                                    objPib[join][name] = values
                                } else {
                                    if (!objPib?.[name]) {
                                        objPib[name] = {}
                                    }
                                    objPib[name] = values
                                }
                            })
                            dataResult.results.push(objPib);
                            return true;
                        });
                    }
                } else {
                    dataResult.details = countResult === 0 ? '' : 'Error al obtener los resultados.'
                }

            } catch (e) {
                log.error({ title: 'Error getDataToSS:', details: e });
                dataResult.status = false;
                dataResult.count = 0;
                dataResult.results = [];
                dataResult.details = e.message
            }
            return dataResult
        }
        /**
         * Funcion que obtiene los datos de listas en Netsuite
         * Estos datos seran usados para mapear la información con el ID y posibles errores dentro de la estructura del documento
         */
        function getInfoToNetsuite() {
            try {
                var correctValues = {}
                correctValues.purposeCode = getContentNS('purposeCode', "customlist_tkio_tran_set_pur_code_list");
                correctValues.hierarchicalCode = getContentNS('hierarchicalCode', "customlist_tkio_list_asn_structure_cod");
                correctValues.tranTypeCode = getContentNS('tranTypeCode', "customlist_trans_type_code_list");
                correctValues.identifyingQualifier = getContentNS('identifyingQualifier', "customlist_list_of_shipment_tra_ref");
                correctValues.orderStatus = getContentNS('orderStatus', "customlist_tkio_carrier_details_ship_o");
                correctValues.packingCode = getContentNS('packingCode', "customlist_tkio_list_carrier_details");
                log.debug({ title: 'Valores obtenidos para realizar el mapeo de errores dentro de la transaccion: ', details: correctValues });
                return correctValues;
            } catch (e) {
                log.error({ title: 'Error getInfoToNetsuite:', details: e });
                return { error: `Could not find values in the instance, verify the information with an administrator: ${e.message}` }
            }
        }
        const getContentNS = (keyValue, idNetsuite) => {
            try {
                var objectAux = {};
                var objSavedSearch = search.create({
                    type: idNetsuite,
                    filters: [],
                    columns:
                        [
                            search.createColumn({ name: "internalid", label: "Internal ID" }),
                            search.createColumn({ name: "name", label: "Internal ID" }),
                        ]
                });
                var searchResultCount = objSavedSearch.runPaged().count;
                log.debug("No. de resultados " + keyValue + ":", searchResultCount);
                objSavedSearch.run().each(function (result) {
                    var namePiv = result.getValue({ name: 'name' });
                    var idPib = namePiv.split(' ')[0];
                    var description = namePiv.split('= ')[1];
                    var internalidList = result.getValue({ name: 'internalid' });
                    if (!objectAux[idPib]) {
                        objectAux[idPib] = {
                            value: internalidList,
                            text: namePiv,
                            description: description
                        }
                    }
                    return true;
                });
                return objectAux;
            } catch (e) {
                log.error({ title: 'Error getContentNS:', details: e });
            }
        }
        // Sent Emails with details datas to x12 file
        const sendEmailDetails = (idEmployee, data, emails) => {
            try {
                // let currentUser_obj = runtime.getCurrentUser();
                // log.audit({ title: 'currentUser_obj', details: currentUser_obj });

                var tabledetail = '';
                data.documentResumen.forEach((docDetail) => {
                    var detallePib = docDetail.details[0] || 'File used successfully';
                    tabledetail += `<tr>
                      <td style='border:1px; border:1px solid #000; padding:10px;'>${docDetail.fileName}</td>
                      <td style='border:1px; border:1px solid #000; padding:10px;'>${docDetail.extension}</td>
                      <td style='border:1px; border:1px solid #000; padding:10px;'>${detallePib}</td>
                  </tr>`
                })
                // console.log(tabledetail)
                // var email_sent = email.sendBulk({
                var email_sent = email.send({
                    // author: 1682,
                    author: idEmployee,
                    recipients: emails,
                    subject: `Summary of execution with the server ${data.name}`,
                    body: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    </head>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,800;1,700&display=swap');
                        body {
                            font-family: 'Montserrat', sans-serif;
                        }
                    </style>
                    <body
                        style="color: #4d5256; font-family: 'Montserrat', sans-serif; font-size: 14px; margin: auto; padding: 27px 0 13px 0; width: 600px;">
                    
                        <div style="display:block;width:100%;">
                            <br/>
                            <p style="margin:0px">The ASN creation process has been executed, a summary of the execution is shown below: </p>
                            <br/>
                            <br/>
                            <div style='display:flex;justify-content:center;'>
                            <table>
                                <tr>
                                    <td style='font-size:10pt; font-weight:bold; border:1px; border:1px solid #000;'>File Name</td>
                                    <td style='font-size:10pt; font-weight:bold; border:1px; border:1px solid #000;'>Extension</td>
                                    <td style='font-size:10pt; font-weight:bold; border:1px; border:1px solid #000;'>Error details</td>
                                </tr>
                                ${tabledetail}
                            </table>
                            </div>
                        </div>
                    </body>
                    </html>
                    `
                });
                log.audit({ title: 'email_sent', details: email_sent });

            } catch (err) {
                log.error({ title: 'Error occurred in sendEmailDetails', details: err });
            }
        }
        // Sent Emails with error conection
        function sendEmailAdmin(idEmployee, sftpName, arrEmailsTxt) {
            try {
                const arrEmails = arrEmailsTxt.split(',');
                // let currentUser_obj = runtime.getCurrentUser();
                // log.audit({ title: 'currentUser_obj', details: currentUser_obj });
                var email_sent = email.sendBulk({
                    author: idEmployee,
                    recipients: arrEmails,
                    subject: `SuiteTrace Connection Errors with server ${sftpName}`,
                    body:
                        `<!DOCTYPE html>
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
                log.audit({ title: 'email_sent', details: email_sent });

            } catch (err) {
                log.error({ title: 'Error occurred in sendEmailAdmin', details: err });
            }
        }
        return { getDataToSS, getInfoToNetsuite, sendEmailDetails, sendEmailAdmin }
    });