sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Item",
    "sap/ui/model/json/JSONModel",
    "sap/m/upload/Uploader",
    "sap/m/StandardListItem",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    'sap/ui/export/Spreadsheet',
],
    /***
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Item, JSONModel, Uploader, ListItem, MessageToast, MessageBox, Fragment, Spreadsheet) {
        "use strict";

        return Controller.extend("zgvt.upload.commodityupload.controller.Main", {
            onInit: function () {

                // Declaration of  Global Data model 
                var that = this;
                var oDataModel = this.getOwnerComponent().getModel('oDataSrv');


                //UI5 map oData Result of ET_TemplateSet
                var oUploadSet = this.getView().byId("UploadSet");
                oUploadSet.setUploadUrl("/sap/opu/odata/sap/ZVGT_UPLD_COMMCODES_SRV/ET_TemplateSet");

                //Call to oData Entity Schema List
                var oSchemaList = new JSONModel();
                oDataModel.read("/ET_SchemaSet", {
                    success: function (oData) {
                        oSchemaList.setData({ Schema: oData.results });
                        that.getView().setModel(oSchemaList, "oSchemaList");
                    },
                    error: function (oError) {
                        console.show("Ërror reading ET_SchemaSet!!");
                    }

                });


                // To handle dynamic visibility of objects
                var oData2 = {
                    status: false,
                    status1: false
                };

                // Create a JSON model and set the data
                var oModel2 = new JSONModel(oData2);

                // Set the model to the view
                this.getView().setModel(oModel2, 'model2');

                // To handle dynamic visibility of objects
                var oData3 = {
                    columns: [
                        { name: "Schema", visible: true, id: "Schema" },
                        { name: "Commodity", visible: true, id: "Commodity" },
                        { name: "Description", visible: true, id: "Description" },
                        { name: "Description En", visible: true, id: "DescriptionEn" },
                        { name: "First Unit", visible: true, id: "FirstUnit" },
                        { name: "Valid From", visible: true, id: "ValiFfrom" },
                        { name: "Valid To", visible: true, id: "ValidTo" },
                        { name: "Status", visible: true, id: "Status" },
                        { name: "Message", visible: true, id: "Message" }
                    ]
                };

                // Create a JSON model and set the data
                var oModel3 = new JSONModel(oData3);

                // Set the model to the view
                this.getView().setModel(oModel3, 'model3');

                // Get Table name

                var oTable = this.getView().byId("responseTable");

                //Get all columns
                var oColumns = oModel3.getProperty("/columns");

                //Dynamically add Columnd to Table
                oColumns.forEach(function (oColData) {
                    oTable.addColumn(new sap.m.Column({
                        id: oColData.id,
                        header: new sap.m.Label({ text: oColData.name }),
                        visible: oColData.visible
                    }));
                });
            },

            onUploadSelectedButton: function () {
                var oUploadSet = this.byId("UploadSet");

                oUploadSet.getItems().forEach(function (oItem) {
                    if (oItem.getListItem().getSelected()) {
                        oUploadSet.uploadItem(oItem);
                    }
                });
            },
            handleTypeMissmatch: function(oEvent) {
                var aFileTypes = oEvent.getSource().getFileType();
                aFileTypes.map(function(sType) {
                    return "*." + sType;
                });
                MessageToast.show("The file type *." + oEvent.getParameter("fileType") +
                                        " is not supported. Choose file type " +
                                        aFileTypes.join(", "));
            },
    
            onDownloadSelectedButton: function () {
                MessageToast.show("Donload templated Selected");
                //here we need to call odata server for download template

                var oUploadSet = this.byId("UploadSet");

                oUploadSet.getItems().forEach(function (oItem) {
                    if (oItem.getListItem().getSelected()) {
                        oItem.download(true);
                    }
                });
            },

            onSelectionChange: function () {
                var oUploadSet = this.byId("UploadSet");
                // If there's any item selected, sets version button enabled
                if (oUploadSet.getSelectedItems().length > 0) {
                    if (oUploadSet.getSelectedItems().length === 1) {
                        this.byId("versionButton").setEnabled(true);
                    } else {
                        this.byId("versionButton").setEnabled(false);
                    }
                } else {
                    this.byId("versionButton").setEnabled(false);
                }
            },

            handleChange: function (oEvent) {
                var that = this;
                var oFileUploader = that.getView().byId("fileUploader");
                var oldJSONModel = that.getView().getModel("oReturnMessage");
                oFileUploader.checkFileReadable().then(function() {
                    console.log("Clear File Name");
                 }, function(error) {
                     console.log("Clear File Name")
                 }).then(function() {
                     oFileUploader.clear();
                 });
          
                if ( oldJSONModel)
                {
                    oldJSONModel.refresh(true);
                    oldJSONModel.setData([]);
    
                }
                var oDataModel = this.getOwnerComponent().getModel('oDataSrv');
                //Declaration of JSON model for List Disply
                var oTemplateList = new JSONModel();
                var oValidatedComboBox = oEvent.getSource();

                if (oValidatedComboBox.getSelectedKey() != '') {
                    var filter1 = new sap.ui.model.Filter({
                        path: "Nosct",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: oValidatedComboBox.getSelectedKey()
                    });
                    //Call to oData Entity Template List
                    oDataModel.read("/ET_TemplateSet", {
                        filters: [filter1],
                        success: function (oData) {
                            oTemplateList.setData({ file: oData.results });
                            that.getView().setModel(oTemplateList, "oTemplateList");
                        },
                        error: function (oError) {
                            consol.show("Ërror reading ET_TemplateSet!!");
                        }
                    });
                    ///  change propeerty of UPload, Download & Table to Visible using local model dynamically
                    this.getView().getModel('model2').setProperty('/status', true);
                }
                else {
                    //// change propeerty of UPload, Download & Table to Visible using local model dynamically
                    this.getView().getModel('model2').setProperty('/status', false);
                    this.getView().getModel('model2').setProperty('/status1', false);
                }
            },

            postCommCodeToBackend: function (oContent) {
                var oDataModel = this.getOwnerComponent().getModel('oDataSrv');
                var that = this;

                var oPayload =
                {
                    "Schema": this.getView().byId('cbValue').getSelectedKey(),
                    "Key": "X",
                    "Value": btoa(unescape(encodeURIComponent(oContent))),
                    "CommUploadStautus":
                        [{
                            "Schema": " ",
                            "Comco": " ",
                            "DATAB": " ",
                            "DATBI": " ",
                            "BEMEH": " ",
                            "TextEn": " ",
                            "Text": " ",
                            "Status": " ",
                            "Message": " "
                        }]
                };

                var oReturnMessage = new JSONModel();
                //Call to oData Entity to upload commodity code
                oDataModel.create("/FileUploadCommoditySet", oPayload, {
                    method: "POST",
                    async: false,
                    success: function (oData, oResponse) {
                        debugger;
                        oReturnMessage.setData({ items: oData.CommUploadStautus.results });
                        that.getView().setModel(oReturnMessage, "oReturnMessage");
                        that.showTable();
                    },
                    error: function (oError) {
                       var oErrResponse = JSON.parse(oError.responseText);
                       var sErrResponse = oErrResponse.error.message.value;  
                       sap.m.MessageBox.error("Error: " + sErrResponse );
   
                    }
                });
            },
            showTable: function () {

                this.getView().getModel('model2').setProperty('/status1', true);
                var oTable = this.getView().byId('responseTable');
                var aItems = oTable.getItems();
                if (aItems.length > 0) {
                    for (var i = 0; i < aItems.length; i++) {
                        var aCells = aItems[i].getCells();
                        if (aItems[i].getCells()[7].getText() == 'Fail') 
                         {
                            aItems[i].getCells()[7].addStyleClass("redBG");
                            aItems[i].getCells()[8].addStyleClass("redBG");
                        }
                        else 
                        {
                            aItems[i].getCells()[7].addStyleClass("greenBG");
                            aItems[i].getCells()[8].addStyleClass("greenBG");
                        }
                    }
                MessageToast.show("File Processed!!");
                }
            },
            handleUploadPress: function (oEvent) {
                var that = this;
                var oldJSONModel = that.getView().getModel("oReturnMessage");
                if ( oldJSONModel)
                    {
                        oldJSONModel.refresh(true);
                        oldJSONModel.setData([]);
        
                    }
                var oFileName = this.getView().byId("fileUploader").getValue();
                if (!oFileName) {
                    MessageToast.show("File is not excel type.Loading failed");
                    //         MessageBox.error("File is not excel type.Loading failed");
                    this.getView().getModel('model2').setProperty('/status1', false);
                }
                else {

                    var oFileUploader = this.getView().byId("fileUploader");
                    var oDomRef = oFileUploader.getFocusDomRef();
                    var oFile = oDomRef.files[0];
                    var reader = new FileReader();
                    reader.onload = function (evt) {
                        var oData = evt.target.result;
                        var workbook = XLSX.read(oData,
                            {
                                type: 'binary'
                            });
                        var oSheetName = workbook.SheetNames[0];
                        var oExcelData = XLSX.utils.sheet_to_json(workbook.Sheets[oSheetName]);
                        var oJsonString = JSON.stringify(oExcelData);
                        that.postCommCodeToBackend(oJsonString);

                    };
                    reader.readAsBinaryString(oFile);

                }

            },
            openPersoDialog: function () {
                var oView = this.getView();
                if (!this._pPersoDialog) {
                    this._pPersoDialog = Fragment.load({
                        id: oView.getId(),
                        name: "zgvt.upload.commodityupload.view.fragment.PerDialog",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog
                    });
                }
                this._pPersoDialog.then(function (oDialog) {
                    oDialog.open();
                });
            },
            onPressCancel: function () {
                this.getView().byId("myDialog").close();
            },
          
            onPressOk: function () {
                var oList = this.getView().byId("idColumn");

                var aItems = oList.getItems();
                aItems.forEach(function (oItem, index) {
                    var oColumn = oItem.getSelected();

                    if (oColumn) {
                        this.getView().byId("responseTable").getColumns()[index].setVisible(true);
                    }
                    else {
                        this.getView().byId("responseTable").getColumns()[index].setVisible(false);
                    }

                }.bind(this));
                this.getView().byId("myDialog").close();
            },
            onExport: function() {
                var aCols, oRowBinding, oSettings, oSheet, oTable;
               
    
                if (!this._oTable) {
                    this._oTable = this.byId('responseTable');
                }
    
                oTable = this._oTable;
                oRowBinding = oTable.getBinding('items');
                aCols = this.createColumnConfig();
    
                oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oRowBinding,
                    fileName: 'Result.xlsx',
                    worker: false // We need to disable worker because we are using a MockServer as OData Service
                };
    
                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function() {
                    oSheet.destroy();
                });
            },
            createColumnConfig: function() {
                var aCols = [];
    
                aCols.push({
                    label: 'Schema',
                    property: 'Schema',
                    type: String
                });
    
                aCols.push({
                    label: 'Commodity',
                    property: 'Comco',
                    type: String
                });
    
                aCols.push({
                    label: 'Description',
                    property: 'Text',
                    type: String
                });
    
                aCols.push({
                    label: 'Description En',
                    property: 'Texten',
                    type: String
                });
               
                
                aCols.push({
                    label: ' First Unit',
                    property: 'BEMEH',
                    type: String                    
                });
    
                Status
                Message
                aCols.push({
                    label: 'Valid From',
                    property: 'DATAB',
                    type: Date
                });
    
                aCols.push({
                    label: 'Valid To',
                    property: 'DATBI',
                    type: Date
                });
    
              
                aCols.push({
                    label: 'Status',
                    property: 'Status',
                    type: String      
                });
                aCols.push({
                    label: 'Message',
                    property: 'Message',
                    type: String      
                });
    
                return aCols;
            }
        });
    });
