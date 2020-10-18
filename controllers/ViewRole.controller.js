sap.ui.define([
    'jquery.sap.global',
    'sap/ui/core/mvc/Controller',
    'sap/m/routing/Router',
    'sap/ui/model/odata/ODataModel',
    'app/formatter',
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    'sap/m/Dialog',
    'sap/m/Button',
    'sap/m/Text',
    "sap/ui/core/ValueState",
     "app/utils/Validator",
], function(jQuery, Controller,Router, ODataModel,formatter,JSONModel,Filter,Dialog,Button,Text,ValueState,Validator) {
"use strict";

var PageController = Controller.extend("app/controllers/ViewRole", {
        formatter : formatter,
        onInit : function (oEvent) {
            var oComponent = this.getOwnerComponent();
            this._router = oComponent.getRouter();
            this._router.getRoute("ViewRole").attachMatched(this._onRouteMatched, this);	
            jQuery.sap.require("jquery.sap.storage");
			this.oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
        },
        
        _onRouteMatched : function (oEvent) {
            var con = this;
            
            var spath  = this.oStorage.get("role") ? this.oStorage.get("role").path : '';
            this.getView().getModel().refresh(true);
            
            this.getView().bindElement(spath);
        
            var con = this;
            if(!spath){
                con._router.navTo("role");
            }

            var itemsView =  new sap.m.ColumnListItem({
                cells : [
                 new sap.m.Text({
                    text : "{TERP_MODULE/NAME}",
                 }),
                 new sap.m.Text({
                    text : "{TERP_MODULE/DESCRIPTION}",
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

                        con.byId('AdditionalUserDetails').bindItems({
								path : spath+"/TERP_ROLE_MODULE?$expand=TERP_MODULE",
								template : itemsView
                        });
                        
                        con.getView().setBusy(false);
                    }
                }
            });
    },       
    navButtonPress : function(){
        this._router.navTo("role");
    },
    handleAllEdit  : function (oEvent) {
        var con = this;
        var sPath = this.getView().getBindingContext().getPath();
        var path = {
                    "path" : sPath		   
                    };
        con.getView().getModel().refresh();
        con.oStorage.put("EditRole", path);
        con._router.navTo("EditRole");
        
    },
    handleAllDelete: function(oEvent){
        var spath = this.getView().getBindingContext().getPath();
        var oModel = this.getView().getModel();
        oModel.remove(spath);
        sap.m.MessageToast.show("Entry deleted");
        this._router.navTo("role");
    },
});

return PageController;

});
