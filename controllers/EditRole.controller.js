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
], function(jQuery, Controller, Router, ODataModel, JSONModel, Filter, ValueState, Validator, SimpleType, Dialog, MessageToast, ValueHelpDialog, TextField) {
    "use strict";

    var PageController = Controller.extend("app/controllers/EditRole", {
        onInit: function() {

            var oComponent = this.getOwnerComponent();
            this._router = oComponent.getRouter();
            jQuery.sap.require("jquery.sap.storage");
            this.oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);

			this._router.getRoute("EditRole").attachMatched(this._onRouteMatched, this);
			this._oPnl = this.byId("tableId");
        },
        _onRouteMatched: function() {

            var validator = new Validator();
            var error_fields = validator.validate(this.byId("AddMasterDetails"), "add");
            var con = this;
            var aFilters = [];
            var spath = this.oStorage.get("EditRole") ? this.oStorage.get("EditRole").path : '';

            var itemsView =  new sap.m.ColumnListItem({
                cells : [
                 new sap.m.Input({
                    value : "{TERP_MODULE/NAME}",
                 }),
                 new sap.m.Input({
                    value : "{TERP_MODULE/DESCRIPTION}",
                 }),
                 new sap.m.Button({
                    text : "Delete",
                    press : [ this.remove, this ]
                }),
                ]
            });

            con.getView().setBusyIndicatorDelay(0);
            con.getView().setBusy(true);
            con.getView().bindElement({
                path: spath+'?$expand=TERP_ROLE_MODULE',
                events: {
                    dataReceived: function (oEvent) {
                        if(!con.getView().getBindingContext()){
                                con._router.navTo("role");
                                return false;
                            }

                        con.byId('tableId').bindItems({
								path : spath+"/TERP_ROLE_MODULE?$expand=TERP_MODULE",
								template : itemsView
                        });
                        
                        con.getView().setBusy(false);
                    }
                }
            });
        },
        handleAllEdit: function(oEvent) {
            var sPath = this.oStorage.get("EditRole") ? this.oStorage.get("EditRole").path : '';
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

                var tableId = this._oPnl.getDomRef();
                var inputs = [];
				var names = [];
                var descriptions = [];
                
                $(tableId).find('input').each(function(index, elem) {
					inputs.push($(elem)[0].value);
				});
				for(var i=0; i<inputs.length; i=i+2){
					names.push(inputs[i]);
				}
				for(var i=1; i<inputs.length; i=i+2){
					descriptions.push(inputs[i]);
                }

                var modules = [];

                $.each(con.getView().getModel().getData(sPath+"/TERP_ROLE_MODULE"),function(i, res){
                    var modueParam = {
                        ID : res["MODULE_ID"],
                        NAME: names[i],
                        DESCRIPTION: descriptions[i],
                    };
                    modules.push(modueParam);
                });

                for (let i = 0; i < modules.length; i++) {
                    console.log(modules[i]["ID"]);
                    con.getView().getModel().addBatchChangeOperations([con.getView().getModel().createBatchOperation("/TERP_MODULE("+modules[i]["ID"]+"L)", "PUT", modules[i])]);
                    con.getView().getModel().submitBatch(
                        function (data, res, error) {
                            if (!error.length) {
                                con.getView().getModel().refresh();
                            }
                        }, function (error) {
                    })
                }

                batchChanges.push(con.getView().getModel().createBatchOperation(sPath, "PUT", MainParameters));
				con.getView().getModel().addBatchChangeOperations(batchChanges);
				con.getView().getModel().submitBatch(
					function (data, res, error) {
						if (!error.length) {
							con.getView().getModel().refresh();
							con._router.navTo("role")
						}
					}, function (error) {
				})
                
            
            }
        },
        handleValueHelpPurchasingGroup: function(oEvent) {
            var con = this;
            var _PATH = null;
            var _SORTER_PATH = null;
            var _DISPLAY_NAME_FIELD = null;
            var _DISPLAY_TITLE = null;

            _PATH = "/TERP_MODULE?$select=ID,NAME";
            _SORTER_PATH = "NAME";
            _DISPLAY_NAME_FIELD = ["NAME"];
            _DISPLAY_TITLE = ["User"];

            var oModel = this.getView().getModel();

            var oSorter1 = new sap.ui.model.Sorter({
                path: _SORTER_PATH,
            });
            oModel.read(_PATH, {
                sorters: [oSorter1],
                success: function(data) {
                    con.allBenificiaryDetails = data.results;
                    showValueHelp();
                },
                error: function() {}
            });

            var showValueHelp = function() {
                con.aKeys = ["ID", _DISPLAY_NAME_FIELD[0]];
                var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog('EMPLOYEE_DETAILS', {
                    basicSearchText: con.theTokenInput.getValue(),
                    title: "Employee Details",
                    supportMultiselect: true,
                    supportRanges: false,
                    supportRangesOnly: false,
                    key: con.aKeys[0],
                    descriptionKey: con.aKeys[1],
                    stretch: sap.ui.Device.system.phone,
                    ok: function(oControlEvent) {
                        var selectedBeneficiary = [];
                        con.aTokens = oControlEvent.getParameter("tokens");
                        if (!con.aTokens.length) {
                            //MessageBox.warning('Select atleast one row');
                            sap.m.MessageToast.show("Select atleast one row");
                            return false;
                        }
                        var deductionID = [];
                        $.each(con.aTokens, function(k, d) {
                            d.setEditable(false)
                            var data = d.data("row");

                            if (data) {
                                deductionID.push(data.ID);
                                if (data[_DISPLAY_NAME_FIELD[1]]) {
                                    d.setProperty("text", data[_DISPLAY_NAME_FIELD[0]] + ' - ' + data[_DISPLAY_NAME_FIELD[1]]);
                                } else {
                                    d.setProperty("text", data[_DISPLAY_NAME_FIELD[0]]);
                                }
                            }

                        });
                        con.theTokenInput.removeAllCustomData();
                        con.theTokenInput.destroyTokens();
                        con.theTokenInput.setTokens(con.aTokens);
                        oValueHelpDialog.close();
                    },
                    cancel: function(oControlEvent) {
                        oValueHelpDialog.close();
                    },
                    afterClose: function() {
                        oValueHelpDialog.destroy();
                    }
                });
                var oColModel = new sap.ui.model.json.JSONModel();

                var cols = [];
                $.each(_DISPLAY_NAME_FIELD, function(i, val) {
                    cols.push({
                        label: _DISPLAY_TITLE[i],
                        template: val,
                    })
                });
                oColModel.setData({
                    cols: cols
                });
                oValueHelpDialog.getTable().setModel(oColModel, "columns");
                var oRowsModel = new sap.ui.model.json.JSONModel();
                oRowsModel.setData(con.allBenificiaryDetails);
                oValueHelpDialog.getTable().setModel(oRowsModel);

                if (oValueHelpDialog.getTable().bindRows) {
                    oValueHelpDialog.getTable().bindRows("/");
                }

                var filterGroupItems = [];
                $.each(_DISPLAY_TITLE, function(i, val) {
                    filterGroupItems.push(new sap.ui.comp.filterbar.FilterGroupItem({
                        groupTitle: "foo",
                        groupName: "gn1",
                        name: _DISPLAY_NAME_FIELD[i],
                        label: val,
                        control: new sap.m.Input()
                    }))
                });

                var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
                    advancedMode: true,
                    filterBarExpanded: true,
                    showGoOnFB: !sap.ui.Device.system.phone,
                    filterGroupItems: filterGroupItems,
                    search: function(oEvent) {
                        var selection = oEvent.getParameter('selectionSet');
                        var aFilters = [];

                        $.each(_DISPLAY_NAME_FIELD, function(i, val) {

                            var unit_code = selection[i].getValue();
                            var filter = new Filter(val, sap.ui.model.FilterOperator.Contains, unit_code);
                            aFilters.push(filter);
                        });

                        oValueHelpDialog.getTable().getBinding("rows").filter(aFilters);
                    }
                });
                if (oFilterBar.setBasicSearch) {
                    oFilterBar.setBasicSearch(new sap.m.SearchField({
                        showSearchButton: sap.ui.Device.system.phone,
                        placeholder: "Search",
                        search: function(event) {
                            var value = event.getSource().getProperty('value');
                            var aFilters = [];
                            $.each(_DISPLAY_NAME_FIELD, function(i, val) {
                                var filter = new Filter(val, sap.ui.model.FilterOperator.Contains, value);
                                aFilters.push(filter);
                            });
                            var filters = new Filter(aFilters, false);
                            oValueHelpDialog.getTable().getBinding("rows").filter(filters);
                        }
                    }));
                }
                oValueHelpDialog.setFilterBar(oFilterBar);

                if (con.theTokenInput.$().closest(".sapUiSizeCompact").length > 0) {
                    oValueHelpDialog.addStyleClass("sapUiSizeCompact");
                } else {
                    oValueHelpDialog.addStyleClass("sapUiSizeCozy");
                }

                oValueHelpDialog.addStyleClass("sapUiSizeCompact");
                oValueHelpDialog.open();
                oValueHelpDialog.update();
            }
        },
        handleAllDelete: function(oEvent) {
            var spath = this.oStorage.get("EditRole") ? this.oStorage.get("EditRole").path : '';
            var oModel = this.getView().getModel();
            oModel.remove(spath);
            sap.m.MessageToast.show("Entry deleted");
            this._router.navTo("role");
        },
        navButtonPress: function() {
            window.history.go(-1);
        },
        navigateToMsgTarget: function(e) {
            var source = e.getSource();
            var text = source.getText();
            var Target = source.getTarget();

            sap.ui.getCore().byId(Target).setValueStateText(text);
            sap.ui.getCore().byId(Target).setValueState(sap.ui.core.ValueState.Error);
            this.oMessagesDialog.close();
            this.messageDialogTargetFocusField = Target;
        },
        onClosedPressedMessageDialog: function() {
            this.oMessagesDialog.close();
        },
        onClosedPressedMessageDialogServer: function() {
            this.oMessagesDialogServer.close();
        },
        afterCloseMessageDialog: function() {
            if (this.messageDialogTargetFocusField) {
                sap.ui.getCore().byId(this.messageDialogTargetFocusField).focus();
            }
        }
        ,
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