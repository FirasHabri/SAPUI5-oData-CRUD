sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/m/routing/Router',
	'sap/ui/model/odata/ODataModel',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/Filter',
	"sap/ui/core/ValueState",
	"app/utils/Validator",
	
	'sap/ui/model/SimpleType',
	'sap/m/Dialog',
	'sap/m/MessageToast',
	 'sap/ui/comp/valuehelpdialog/ValueHelpDialog',
	 'sap/ui/commons/TextField',
	 'sap/m/Token'
], function (jQuery, Controller, Router, ODataModel, JSONModel, Filter, ValueState, Validator,  SimpleType,Dialog,MessageToast,ValueHelpDialog,TextField,Token) {
	"use strict";

	var PageController = Controller.extend("app/controllers/AddRole", {
		onInit: function () {
			
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			this._router.getRoute("AddRole").attachMatched(this._onRouteMatched, this);

			this._oPnl = this.byId("tableId");
		},
		_onRouteMatched: function () {

			var validator = new Validator();
			var error_fields = validator.validate(this.byId("AddMasterDetails"), "add");
			var con = this;
			//con.theTokenInput = con.getView().byId("USERS");
            //con.theTokenInput.setTokens([]);

		},
		removeValidation: function (oEvent) {
			var content = this.byId('AddMasterDetails').getContent();
			for (var i in content) {
				var control = content[i];
				if (control.getValue) {
					control.setValueState('None');
				}
			}
		},
		navButtonPress: function () {
			window.history.go(-1);
		},

		navigateToMsgTarget: function (e) {
			var source = e.getSource();
			var text = source.getText();
			var Target = source.getTarget();

			sap.ui.getCore().byId(Target).setValueStateText(text);
			sap.ui.getCore().byId(Target).setValueState(sap.ui.core.ValueState.Error);
			this.oMessagesDialog.close();
			this.messageDialogTargetFocusField = Target;
		},
		onClosedPressedMessageDialog: function () {
			this.oMessagesDialog.close();
		},
		onClosedPressedMessageDialogServer: function () {
			this.oMessagesDialogServer.close();
		},
		afterCloseMessageDialog: function () {
			if (this.messageDialogTargetFocusField) {
				sap.ui.getCore().byId(this.messageDialogTargetFocusField).focus();
			}
		},

		handleAllSave: function (oEvent) {

			var sPath = "";
			var con = this;
            var Log = [];
            var batchChanges = [];
			Log.Messages = [];
			var userArray=[];
			var validator = new Validator();
			var error_fields = validator.validate(this.byId("AddMasterDetails"));
			
			if (!con.byId("NAME").getValue())
				error_fields.push(con.byId("NAME").sId)
				
			if (!con.byId("DESCRIPTION").getValue() && con.byId("DESCRIPTION").getVisible())
				error_fields.push(con.byId("DESCRIPTION").sId)
				

			var list_item = [];
			$.each(error_fields, function (index, value) {
				sap.ui.getCore().byId(value).setValueState("Error");
				Log.Messages.push({
					message: sap.ui.getCore().byId(value).getValueStateText(),
					severity: 'error',
					target: value,
				})
			});
			var Messages = Log.Messages.slice(0, 9);
			Log.Messages = Messages;
			if (Log.Messages.length) {
				if (!this.oMessagesDialog) {
					this.oMessagesDialog = sap.ui.xmlfragment("app/fragments/MessagesDialog", this);
					this.getView().addDependent(this.oMessagesDialog);
				}
				var oModel = new sap.ui.model.json.JSONModel(Log);
				this.oMessagesDialog.setModel(oModel, "mes");
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.oMessagesDialog);
				this.oMessagesDialog.open();
			} else {
				
				var MainParameters = {};
				
				MainParameters.NAME = con.byId("NAME").getValue();
				MainParameters.DESCRIPTION = con.byId("DESCRIPTION").getValue();
				MainParameters.CREATED_AT = con.byId("CREATED_AT").getValue();
                MainParameters.LAST_UPDATED_AT = con.byId("LAST_UPDATED_AT").getValue();
                MainParameters.CREATED_BY = con.byId("CREATED_BY").getValue();
                MainParameters.LAST_UPDATED_BY = con.byId("LAST_UPDATED_BY").getValue();

                if (MainParameters.LAST_UPDATED_AT == "") {
                    MainParameters.LAST_UPDATED_AT = null;
                }
                if (MainParameters.CREATED_AT == "") {
                    MainParameters.CREATED_AT = null;
                }
				
				var additionalDetails = [];

				var tableId = this._oPnl.getDomRef();
				var inputs = [];
				var names = [];
				var descriptions = [];
				var batchChanges = [];
				var ids = [];
				$(tableId).find('input').each(function(index, elem) {
					inputs.push($(elem)[0].value);
				});
				for(var i=0; i<inputs.length; i=i+2){
					names.push(inputs[i]);
				}
				for(var i=1; i<inputs.length; i=i+2){
					descriptions.push(inputs[i]);
				}
				var param = {};
				for(var i = 0; i<names.length; i++){
					var randid = (Math.floor(Math.random() * 10000) + 1).toString();
					ids.push(randid);
					param.ID = randid;
					param.NAME = names[i];
					param.DESCRIPTION = descriptions[i];
					
					batchChanges.push(this.getView().getModel().createBatchOperation("TERP_MODULE", "POST", param));
					this.getView().getModel().addBatchChangeOperations(batchChanges);
					this.getView().getModel().submitBatch(
						function (data, res, error) {
						}, function (error) {
					})
				}

				for(var i = 0; i<names.length; i++){
					var UpdateArray={
						MODULE_ID: ids[i],
					}
					userArray.push(UpdateArray);
				};
				
				MainParameters.TERP_ROLE_MODULE = userArray;
					
				batchChanges.push(con.getView().getModel().createBatchOperation("TERP_ROLE", "POST", MainParameters));
				con.getView().getModel().addBatchChangeOperations(batchChanges);
				con.getView().getModel().submitBatch(
					function (data, res, error) {
						if (!error.length) {
							con.getView().getModel().refresh();
							con._router.navTo("role")
						}
					}, function (error) {
				})

				sap.m.MessageToast.show("Entry Added");
				this._router.navTo("role");
			}
		},

		
		onAdd : function(oEvent) {
			var oItem = new sap.m.ColumnListItem({
			cells : [
					new sap.m.Input(),
					new sap.m.Input(),
					new sap.m.Button({
						text : "Delete",
						press : [ this.remove, this ]
					}),
				]
			});
			
			var oTable = this.getView().byId("tableId");
			oTable.addItem(oItem);
		},
		deleteRow : function(oEvent) {
			var oTable = this.getView().byId("tableId");
			oTable.removeItem(oEvent.getParameter("listItem"));
		},
		remove : function(oEvent) {
			var oTable = this.getView().byId("tableId");
			oTable.removeItem(oEvent.getSource().getParent());
		},

    	
	});
	return PageController;
});
