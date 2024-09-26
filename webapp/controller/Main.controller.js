sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Item",
	"sap/ui/model/json/JSONModel",
	"sap/m/upload/Uploader",
	"sap/m/StandardListItem",
	"sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Item, JSONModel, Uploader, ListItem, MessageToast) {
        "use strict";

        return Controller.extend("sap.m.sample.UploadSet.Page", {
            onInit: function () {
                var sPath = sap.ui.require.toUrl("zgvt/commodity/upload/model/items.json"),
                    oUploadSet = this.byId("UploadSet");
    
                this.getView().setModel(new JSONModel(sPath));
    
                // Modify "add file" button
                // oUploadSet.getDefaultFileUploader().setButtonOnly(false);
                // oUploadSet.getDefaultFileUploader().setTooltip("");
                // oUploadSet.getDefaultFileUploader().setIconOnly(true);
                // oUploadSet.getDefaultFileUploader().setIcon("sap-icon://attachment");
                // debugger;
                // oUploadSet.attachUploadCompleted(this.onUploadCompleted.bind(this));
                		// set explored app's demo model on this sample
			// var oModel = new JSONModel(sap.ui.require.toUrl("zproj/arv/upload/excel/uploadexcel/model/schema.json");
			// this.getView().setModel(oModel);

            var oDataModel = this.getOwnerComponent().getModel('oDataSrv');

        



        
              // Create a JSON model and set the data
              var oModel1 = new JSONModel(oData);
        
              // Set the model to the view
              this.getView().setModel(oModel1,'model1');

              var oData2 = {
                
                  status: false 
                
              };
        
              // Create a JSON model and set the data
              var oModel2 = new JSONModel(oData2);
        
              // Set the model to the view
              this.getView().setModel(oModel2,'model2');

              debugger;
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
            onSelectionChange: function() {
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
            // onVersionUpload: function(oEvent) {
            //     var oUploadSet = this.byId("UploadSet");
            //     this.oItemToUpdate = oUploadSet.getSelectedItem()[0];
            //     oUploadSet.openFileDialog(this.oItemToUpdate);
            // },
            // onUploadCompleted: function(oEvent) {
            //     this.oItemToUpdate = null;
            //     this.byId("versionButton").setEnabled(false);
            // },
       
        handleChange: function (oEvent) {
            
			var oValidatedComboBox = oEvent.getSource();

            if ( oValidatedComboBox.getSelectedKey() != '' )
            {
               debugger;
                ///  change propeerty of UPload, Download & Table to Visible using local model dynamically
                this.getView().getModel('model2').setProperty('/status', true);
            }   
            else
            { 
            //// change propeerty of UPload, Download & Table to Visible using local model dynamically
                this.getView().getModel('model2').setProperty('/status', false);
            }
		},
        handleUploadPress : function(oEvent)
        {
          MessageToast.show("here in this excel upload");
        }
    });
    });
