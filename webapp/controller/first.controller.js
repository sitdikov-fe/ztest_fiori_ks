sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";
    // var oModel;
    return Controller.extend("ztest_fiori_ks.controller.first", {

		onInit: function(){
			// oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZTEST_FIORI_KOSI_SRV/", true);
			// sap.ui.getCore().setModel(oModel, "oModel");
		},
		
        onButtonCreate: function () {
            //button fort create order
            //this.getOwnerComponent().getRouter().navTo("page2");
            //var value = this.getView().byId("InputID").getValue();

            //var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            //oRouter.navTo("page2")
            this.getOwnerComponent().getRouter().navTo("page2");
            //read msg from i18n model
            //var oBundle = this.getView().getModel("i18n").getResourceBundle();
            //var sRecipient = this.getView().getModel().getProperty("/recipient/name");
            //var sMsg = oBundle.getText("inputFieldText", [sRecipient]);
        },
        onButtonView: function(){
            //button for view order
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("page4");
        }
    });
});