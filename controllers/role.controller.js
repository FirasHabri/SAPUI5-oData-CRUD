sap.ui.define([
    'jquery.sap.global',
    'sap/m/MessageToast',
    'sap/m/UploadCollectionParameter',
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/odata/ODataModel',
    'sap/ui/model/Filter',
    'sap/m/Dialog',
    'sap/m/Button',
    'sap/m/Text',
    'sap/ui/model/resource/ResourceModel',
    'sap/ui/core/format/DateFormat',
    'app/formatter',
	
], function (jQuery, MessageToast, UploadCollectionParameter, Controller, ODataModel, Filter, Dialog, Button, Text, ResourceModel, DateFormat, formatter) {
    "use strict";
    var PageController = Controller.extend("app/controllers/role", {

        formatter: formatter,

        onInit: function () {

            var oComponent = this.getOwnerComponent();
            this._router = oComponent.getRouter();
            jQuery.sap.require("jquery.sap.storage");
            this.oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);

            this.getView().addStyleClass("sapUiSizeCompact");

        },
		handleAdd : function(oEvent){
			
			this._router.navTo("AddRole")
		},
		Click : function(oEvent)
		{	var con 	= this;
				var session = this.oStorage;
				var	sPath 	=  oEvent.getSource().getBindingContext().getPath();
				var path 	= {
				   "path" : sPath		   
				};
				session.put("role", path);
				 this.getView().bindElement('/TERP_ROLE');
				this._router.navTo("ViewRole");
			},
    });
    return PageController;
});
