/**
 * @NApiVersion 2.1
 */
define([],
    () => {
        const RECORDS = {};

        RECORDS.SFTP_SETUP = {
            id: 'customrecord_suitetrace_sftp_config',
            FIELDS: {
                INACTIVE: 'isinactive',
                ID: 'internalid',
                NAME: 'custrecord_suitetrace_sftp_name',
                URL: 'custrecord_suitetrace_sftp_server',
                GUID: 'custrecord_suitetrace_sftp_guid',
                USERNAME: 'custrecord_suitetrace_sftp_username',
                PORT: 'custrecord_suitetrace_sftp_port',
                HOST_KEY: 'custrecord_suitetrace_sftp_hostkey',
                OUTPUT_FOLDER: 'custrecord_suitetrace_sftp_output_fd',
                INPUT_FOLDER: 'custrecord_suitetrace_sftp_input_fd',
                FILE_TEST_UPLOAD: 'custrecord_suitetrace_sftp_test_file',
                DATE_EXECUTE: 'custrecord_suitetrace_exec_date',
                FREQUENCY_EXEC: 'custrecord_suitetrace_con_freq',
                UNIT_EXEC: 'custrecord_suitetrace_unit_time',
                EMAIL_SERVER: 'custrecord_suitetrace_email_rep'
            }
        }
        RECORDS.TRACKER = {
            id: 'customrecord_suitetrace_tracker_asn',
            FIELDS: {
                INACTIVE: 'isinactive',
                ID: 'internalid',
                NAME: 'name',
                SFTP_CONNECTION: 'custrecord_suitetrace_sftp_connection',
                STATUS: 'custrecord_suitetrace_status_process',
                FILE: 'custrecord_suitetrace_file_process',
                DOCU_EXEC: 'custrecord_suitrace_document_executed',
                DETAILS: 'custrecord_suitetrace_details_tracker',
                TRANSACTION_RELATED: 'custrecord_suitetrace_transaction_relate',
            }
        }
        RECORDS.PURCHASE_ORDER = {
            id: 'purchaseorder',
            FIELDS: {
                ID: 'internalid',
                TRANID: 'tranid',
                VENDOR: 'entity',
                CUSTOMER: 'shipto',
                SHIP_TO_ACCOUNT: 'custbody_tkio_ship_to_acc_number',
                SHIP_TO: 'custbody_tkio_hl_field_po_cust_cat',
                // SHIP_TO_SELECT: 'shipaddresslist',
                MEMO: 'memo',
                DATE: 'trandate',
                LOCATION: 'location',
                SUBSIDIARY: 'subsidiary',
                STATUS: 'approvalstatus',
                MAIN_LINE: 'mainline'
            },
            SUBLIST: {
                ITEM: {
                    id: 'item',
                    FIELDS: {
                        ITEM: 'item',
                        QUANTITY: 'quantity',
                        INVENTORY_DETAIL: 'inventoryDetail'
                    },
                    JOIN: {
                        INVENTORY_DETAIL: {
                            id: 'inventoryDetail',
                            FIELDS: {
                                INTERNAL_ID: 'internalid',
                                NUMBER: 'inventorynumber',
                                BIN_NUMBER: 'binnumber',
                                EXP_DATE: 'expirationdate',
                            }
                        }
                    }
                }
            }
        }
        RECORDS.ASN = {
            id: 'custompurchase_tkio_asn_healix',
            FIELDS: {
                ID: 'internalid',
                TRANID: 'tranid',
                VENDOR: 'entity',
                SUBSIDIARY: 'subsidiary',
                LOCATION: 'location',
                CUSTOMER: 'custbody_tkio_customer',
                PO: 'custbody_tkio_purchase_order_hl_asn',

                PURPOSE_CODE: 'custbody_tkio_tran_set_purpose_code',
                TYPE_CODE: 'custbody_tkio_trans_type_code',
                STRUCTURE_CODE: 'custbody_tkio_asn_structure_code',
                SHIPMENT_TRACKING_REFERENCE: 'custbody_tkio_shipment_tracking_ref',
                ORDER_DATE: 'custbody_tkio_order_date',
                STATUS_CODE: 'custbody_tkio_carrier_details_ship_ord',
                TS: 'custbody_suitetrace_ts',
            },
            SUBLIST: {
                ITEM: {
                    id: 'item',
                    FIELDS: {
                        ITEM: 'item',
                        QUANTITY: 'quantity',
                        ISSERIAL: 'isserial',
                        INVENTORY_DETAIL: 'inventoryDetail'
                    },
                    JOIN: {
                        INVENTORY_DETAIL: {
                            id: 'inventoryDetail',
                            FIELDS: {
                                INTERNAL_ID: 'internalid',
                                NUMBER: 'inventorynumber',
                                BIN_NUMBER: 'binnumber',
                                EXP_DATE: 'expirationdate',
                            }
                        },
                        ITEM: {
                            id: 'item',
                            FIELDS: {
                                INTERNAL_ID: 'internalid',
                                ISLOTITEM: 'islotitem',
                            }
                        }
                    }
                }
            }
        }
        const LIST = {};
        LIST.STATUS = {
            id: 'customlist_suitetrace_status_process',
            FIELDS: {
                INTERNAL_ID: 'internalid',
                NAME: 'name',
            }
        }
        const SCRIPTS = {};

        SCRIPTS.SFTP_PWD_GUID = {
            SCRIPT_ID: 'customscript_suitetrace_sftp_pwdguid_sl',
            DEPLOY_ID: 'customdeploy_suitetrace_sftp_pwdguid_sl'
        }
        SCRIPTS.ST_PROGRAMMED_SFTP_MR = {
            SCRIPT_ID: 'customscript_suitetrace_prog_sftp_mr',
            DEPLOY_ID: 'customdeploy_suitetrace_prog_sftp_mr',
            PARAMETERS: {
                EMPLOYEE: 'custscript_suitetrace_email_rep'
            }
        }

        const mapManifest = {
            'ST': {
                priority: { 'M': 1 },
                manifest: ['level', 'identifyingCode', 'controlNumber'],
                details: [{ 'M': 1 }, { 'M': 1 }, { 'M': 1 }]
            },
            'BSN': {
                priority: { 'M': 1 },
                manifest: ['level', 'purposeCode', 'shipIdentification', 'date', 'time', 'hierarchicalCode', 'tranTypeCode'],
                details: [{ 'M': 1 }, { 'M': 1 }, { 'M': 1 }, { 'M': 1 }, { 'M': 1 }, { 'O': 1 }, { 'C': 1 }]
            },
            'HL': {
                priority: { 'M': 1 },
                manifest: ['level', 'hierarchical', 'parent', 'structure', 'subordinate'],
                details: [{ 'M': 1 }, { 'M': 1 }, { 'O': 1 }, { 'M': 1 }, { 'O': 1 }]
            },

            'TD1': {
                priority: { 'O': 20 },
                manifest: ['level', 'packingCode', 'ladingQty', 'codeQualifier', 'commodityCode', 'ladingDes', 'weightQualifier', 'weight', 'units'],
                details: [{ 'M': 1 }, { 'O': 1 }, { 'C': 1 }, { 'O': 1 }, { 'C': 1 }, { 'O': 1 }, { 'O': 1 }, { 'C': 1 }, { 'C': 1 }]
            },
            'TD5': {
                priority: { 'O': 12 },
                manifest: ['level', 'code', 'codeQualifier', 'identifyingCode', 'transportCode', 'routing', 'orderStatus'],
                details: []
            },
            'TD3': {
                priority: { 'M': 12 },
                manifest: ['level', 'descCode', 'initialEquip', 'numberEquip'],
                details: []
            },
            'REF': {
                priority: { 'O': 1 },
                manifest: ['level', 'identifyingQualifier', 'identifying', 'description'],
                details: []
            },
            'DTM': {
                priority: { 'M': 1 },
                manifest: ['level', 'date_timeQualifier', 'date'],
                details: [{ 'M': 1 }, { 'M': 1 }, { 'M': 1 }]
            },
            'N1': {
                manifest: ['level', 'identifyingCodeQualifier', 'name', 'codeQualifier', 'identifyingCode'],
                details: []
            },
            'PRF': {
                manifest: ['level', 'numPurchOr', 'numRelease', 'numSequenceOrder', 'date'],
                details: []
            },
            'MAN': {
                manifest: ['level', 'markNumberQualifier', 'markNumber'],
                details: []
            },
            'LIN': {
                manifest: ['level', 'assignedID', 'prodServIDQualifier', 'prodServID'],
                details: []
            },
            'SN1': {
                manifest: ['level', 'assignedID', 'numberUnitShip', 'unitBasicCode', 'quantityShipDate', 'quantityOrdered', 'unitBasicCode2'],
                details: []
            },
            'PO4': {
                manifest: ['level', 'pack', 'size', 'unitBasisCode', 'packgingCode', 'weightQualifier', 'weightPerPack', 'unitBasisCode', 'volumePerPack', 'unitBasisCode', 'length', 'width', 'height', 'unitBasisCode', 'innerPack'],
                details: []
            },
            'N3': {
                manifest: ['level', 'addressInfo_1', 'addressInfo_2'],
                details: []
            },
            'N4': {
                manifest: ['level', 'cityName', 'stateCode', 'postalCode', 'countryCode', 'locationCode', 'locationQualifier', 'locationIdent'],
                details: []
            },
            'PER': {
                manifest: ['level', 'functionCode', 'name', 'commNumberPhone', 'commNumberQualifier', 'commNumberEmail',],
                details: []
            },
            'YNQ': {
                manifest: ['level', 'YNQ_01', 'condition', 'YNQ_03', 'YNQ_04', 'messageTxt_1', 'messageTxt_2', 'messageTxt_3', 'codeListQualifier', 'industryCode'], // Existen 2 casos, donde hay solo un mensaje
                details: []
            },
            'CTT': {
                manifest: ['level', 'numberOfLineItem', 'hashTotal'],
                details: [{ 'M': 1 }, { 'M': 1 }, { 'O': 1 }]
            },
            'SE': {
                manifest: ['level', 'numberIncludedSegment', 'transactionSetControlNumber'],
                details: [{ 'M': 1 }, { 'M': 1 }, { 'M': 1 }]
            }
        }
        const levels = [
            ['ST', 'BSN', 'CTT', 'SE', 'HL'],
            ['HL'],
            ['TD1', 'TD5', 'TD3', 'REF', 'DTM', 'N1', 'YNQ', 'PRF', 'MAN', 'LIN', 'PO4', 'SN1'],
            ['N3', 'N4', 'REF', 'PER'],
        ];
        const mapChildren = [
            // 'HL': ['TD1', 'TD5', 'TD3', 'REF', 'DTM', 'N1', 'YNQ', 'PRF', 'MAN', 'LIN', 'PO4', 'SN1', 'PID'],
            /*'HL':*/['TD1', 'TD5', 'TD3', 'REF', 'DTM', 'N1', 'YNQ', 'PRF', 'MAN', 'LIN', 'PO4', 'SN1'],
            /*'N1':*/['N3', 'N4', 'REF', 'PER']
        ];
        return { RECORDS, LIST, SCRIPTS, mapManifest, levels, mapChildren }
    });