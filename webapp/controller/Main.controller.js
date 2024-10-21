sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Item",
    "sap/ui/model/json/JSONModel",
    "sap/m/upload/Uploader",
    "sap/m/StandardListItem",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
   
],
    /***
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Item, JSONModel, Uploader, ListItem, MessageToast, MessageBox) {
        "use strict";

        return Controller.extend("zgvt.commodity.upload.commodityupload.controller.Main", {
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
                        consol.show("Ërror reading ET_SchemaSet!!");
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

         //        this._registerForP13n();
            },

            onUploadSelectedButton: function () {
                var oUploadSet = this.byId("UploadSet");

                oUploadSet.getItems().forEach(function (oItem) {
                    if (oItem.getListItem().getSelected()) {
                        oUploadSet.uploadItem(oItem);
                    }
                });
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
                var oDataModel = this.getOwnerComponent().getModel('oDataSrv');
              //Declaration of JSON model for List Disply
                var oTemplateList = new JSONModel();
                var oValidatedComboBox = oEvent.getSource();

                if (oValidatedComboBox.getSelectedKey() != '') {
                    var filter1= new sap.ui.model.Filter({
                        path: "Nosct",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: oValidatedComboBox.getSelectedKey()
                    });
                //Call to oData Entity Template List
                oDataModel.read("/ET_TemplateSet", {
                    filters : [filter1], 
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
      
            postCommCodeToBackend : function(oContent) {
                var oDataModel = this.getOwnerComponent().getModel('oDataSrv');
                var that = this;

                var oPayload = 
                {
                    "Schema" :this.getView().byId('cbValue').getSelectedKey(),
                    "Key"    : "X",
                    "Value"  : btoa(unescape(encodeURIComponent(oContent))),
                    "CommUploadStautus":
                    [{
                        "Schema" :" ",
                        "Comco"  :" ",
                        "DATAB"  :" ",
                        "DATBI"  :" ",
                        "BEMEH"  :" ",
                        "TextEn" :" ",
                        "Text"   :" ",
                        "Status" :" ",
                        "Message":" "
                    }]
                };
    
                var oReturnMessage = new JSONModel();
                //Call to oData Entity to upload commodity code
                oDataModel.create("/FileUploadCommoditySet", oPayload, {
                    method : "POST",
                    async   : false,
                    success: function (oData) {
                        debugger;
                        oReturnMessage.setData({ items: oData.CommUploadStautus.results });
                        that.getView().setModel(oReturnMessage, "oReturnMessage");
                        that.showTable();
                    },
                    error: function (oError) {
                     console.log("Error Uploading File!!");
/*                 
                     sap.m.MessageBox.show(
                         oError.message,
                         sap.m.MessageBox.Icon.ERROR,
                         "Error In oData Service"
                     );  */
                    }
                });    
            },
            showTable :function()
            {
                
                this.getView().getModel('model2').setProperty('/status1', true); 
                var oTable = this.getView().byId('idTable');
                var aItems = oTable.getItems();
                if ( aItems.length > 0 )
                    {
                        for (var i = 0; i < aItems.length; i++)
                            {
                                var aCells = aItems[i].getCells();
                                if ( aItems[i].getCells()[7].getText() === 'Fail' )
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
                    }
            },
            handleUploadPress: function (oEvent) {
                 var that = this;

                var oFileName = this.getView().byId("fileUploader").getValue();
                if (!oFileName)
                    {
                        MessageToast.show("File is not excel type.Loading failed");
               //         MessageBox.error("File is not excel type.Loading failed");
                        this.getView().getModel('model2').setProperty('/status1', false); 
                    }
                 else
                 {
                  
                var oFileUploader = this.getView().byId("fileUploader");
                var oDomRef       = oFileUploader.getFocusDomRef();
                var oFile      = oDomRef.files[0];
                var  reader = new FileReader();
                reader.onload = function(evt)
                {
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
            _registerForP13n: function() {
                const oTable = this.byId("persoTable");
    
                this.oMetadataHelper = new MetadataHelper([{
                        key: "firstName_col",
                        label: "First Name",
                        path: "firstName"
                    },
                    {
                        key: "lastName_col",
                        label: "Last Name",
                        path: "lastName"
                    },
                    {
                        key: "city_col",
                        label: "City",
                        path: "city"
                    },
                    {
                        key: "size_col",
                        label: "Size",
                        path: "size"
                    }
                ]);
    
                this._mIntialWidth = {
                    "firstName_col": "11rem",
                    "lastName_col": "11rem",
                    "city_col": "11rem",
                    "size_col": "11rem"
                };
    
                Engine.getInstance().register(oTable, {
                    helper: this.oMetadataHelper,
                    controller: {
                        Columns: new SelectionController({
                            targetAggregation: "columns",
                            control: oTable
                        }),
                        Sorter: new SortController({
                            control: oTable
                        }),
                        Groups: new GroupController({
                            control: oTable
                        }),
                        ColumnWidth: new ColumnWidthController({
                            control: oTable
                        })
                    }
                });
    
                Engine.getInstance().attachStateChange(this.handleStateChange.bind(this));
            },
    
            openPersoDialog: function(oEvt) {
                const oTable = this.byId("persoTable");
    
                Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
                    contentHeight: "35rem",
                    contentWidth: "32rem",
                    source: oEvt.getSource()
                });
            },
    
            onColumnHeaderItemPress: function(oEvt) {
                const oTable = this.byId("persoTable");
                const sPanel = oEvt.getSource().getIcon().indexOf("sort") >= 0 ? "Sorter" : "Columns";
    
                Engine.getInstance().show(oTable, [sPanel], {
                    contentHeight: "35rem",
                    contentWidth: "32rem",
                    source: oTable
                });
            },
    
            onSort: function(oEvt) {
                const oTable = this.byId("persoTable");
                const sAffectedProperty = this._getKey(oEvt.getParameter("column"));
                const sSortOrder = oEvt.getParameter("sortOrder");
    
                //Apply the state programatically on sorting through the column menu
                //1) Retrieve the current personalization state
                Engine.getInstance().retrieveState(oTable).then(function(oState) {
    
                    //2) Modify the existing personalization state --> clear all sorters before
                    oState.Sorter.forEach(function(oSorter) {
                        oSorter.sorted = false;
                    });
                    oState.Sorter.push({
                        key: sAffectedProperty,
                        descending: sSortOrder === CoreLibrary.SortOrder.Descending
                    });
    
                    //3) Apply the modified personalization state to persist it in the VariantManagement
                    Engine.getInstance().applyState(oTable, oState);
                });
            },
    
            onColumnMove: function(oEvt) {
                const oTable = this.byId("persoTable");
                const oAffectedColumn = oEvt.getParameter("column");
                const iNewPos = oEvt.getParameter("newPos");
                const sKey = this._getKey(oAffectedColumn);
                oEvt.preventDefault();
    
                Engine.getInstance().retrieveState(oTable).then(function(oState) {
    
                    const oCol = oState.Columns.find(function(oColumn) {
                        return oColumn.key === sKey;
                    }) || {
                        key: sKey
                    };
                    oCol.position = iNewPos;
    
                    Engine.getInstance().applyState(oTable, {
                        Columns: [oCol]
                    });
                });
            },
    
            _getKey: function(oControl) {
                return oControl.data("p13nKey");
            },
    
            handleStateChange: function(oEvt) {
                const oTable = this.byId("persoTable");
                const oState = oEvt.getParameter("state");
    
                if (!oState) {
                    return;
                }
    
                oTable.getColumns().forEach(function(oColumn) {
    
                    const sKey = this._getKey(oColumn);
                    const sColumnWidth = oState.ColumnWidth[sKey];
    
                    oColumn.setWidth(sColumnWidth || this._mIntialWidth[sKey]);
    
                    oColumn.setVisible(false);
                    oColumn.setSortOrder(CoreLibrary.SortOrder.None);
                }.bind(this));
    
                oState.Columns.forEach(function(oProp, iIndex) {
                    const oCol = this.byId("persoTable").getColumns().find((oColumn) => oColumn.data("p13nKey") === oProp.key);
                    oCol.setVisible(true);
    
                    oTable.removeColumn(oCol);
                    oTable.insertColumn(oCol, iIndex);
                }.bind(this));
    
                const aSorter = [];
                oState.Sorter.forEach(function(oSorter) {
                    const oColumn = this.byId("persoTable").getColumns().find((oColumn) => oColumn.data("p13nKey") === oSorter.key);
                    /** @deprecated As of version 1.120 */
                    oColumn.setSorted(true);
                    oColumn.setSortOrder(oSorter.descending ? CoreLibrary.SortOrder.Descending : CoreLibrary.SortOrder.Ascending);
                    aSorter.push(new Sorter(this.oMetadataHelper.getProperty(oSorter.key).path, oSorter.descending));
                }.bind(this));
                oTable.getBinding("rows").sort(aSorter);
            },
    
            onColumnResize: function(oEvt) {
                const oColumn = oEvt.getParameter("column");
                const sWidth = oEvt.getParameter("width");
                const oTable = this.byId("persoTable");
    
                const oColumnState = {};
                oColumnState[this._getKey(oColumn)] = sWidth;
    
                Engine.getInstance().applyState(oTable, {
                    ColumnWidth: oColumnState
                });
            }
   
    
        });
    });
