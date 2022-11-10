sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, MessageToast, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("ztest_fiori_ks.controller.Table01", {
		onInit: function (oEvent) {

			this.mode = "Null";
			var dataModel = this.getOwnerComponent().getModel("tableData");
			this.getView().setModel(dataModel, "sOrder1");
			this.temp = JSON.stringify(this.getView().getModel("sOrder1").getData());

			// create a new model for property binding .for visible property
			var newModel1 = new JSONModel({
				visibleHeader: true,
				"editable": false,
				"valueState": "None",
				"add": true,
				"edit": true,
				"delete": true,
				"status": "completed",
				"status1": "Edited"

			});
			this.getView().setModel(newModel1, "newModel");
		},

		onEdit: function (oEvent) {

			var that = this;

			if (this.mode === "Null") {//if user click on save in edit functionality

				// this.mode is a global varible 
				this.mode = "Edit";
				var that = this;
				// declare a arry for holding old records.
				this.oldDataArry = [];
				// var sData = oEvent.getSource().getModel("sOrder1").getData();
				var oTable = this.byId("idSalesTable");
				// selected row data containts selected records to edit
				var selectedRowData = oTable.getSelectedContexts();

				console.log(oTable);
				console.log(selectedRowData);
				
				selectedRowData.forEach(function (item) {
					var sContext = item;
					var sPath = sContext.getPath();
					var sObj = sContext.getObject();
					var oldObj = {//here old Obj collects selected data 
						sPath: sPath,
						sObj: JSON.stringify(sObj)//Json.Stringfy method used to convert in String format
					};
					that.oldDataArry.push(oldObj);//append the record to arry which we declare before
					sObj.editable = true;//by using this property we enable inputfeilds visible

					that.getView().getModel("sOrder1").setProperty(sPath, sObj, sContext, true);//finally we set record in model in that path

				});



			} else if (this.mode === "Edit") {//if user click on save in edit functionality
				var oTable = this.byId("idSalesTable");
				var selectedRowData = oTable.getSelectedContexts();
				selectedRowData.forEach(function (item) {
					var sContext = item;
					var sPath = sContext.getPath();
					var sObj = sContext.getObject();
					sObj.editable = false;//we set editable false 
					that.getView().getModel("sOrder1").setProperty(sPath, sObj, sContext, true);

				});

				this.mode = "Null";

				MessageToast.show("Record updated successfully");//throws a message
				return;

			} else if (this.mode === "Add") {
				var sData = oEvent.getSource().getModel("sOrder1").getData().Sales;//get the table data
				var sIndex = sData.length - 1;//get the length of the sdata
				if (this.recordexists !== undefined) {
					MessageToast.show("ID already exists");

					return;

				} else {
					for (var i = 0; i <= sIndex; i++) {

						if (sData[i].editable === true) {//check feilds which are Appended by click on Add
							if (sData[i].Id === "") {//check if the entered data is black then it throws a error message
								MessageToast.show("ID cannot be empty");
								return;
							} else {
								sData[i].editable = false;//if record is not blank set editable to false
								sData[i].neweditable = false;//this is for first property
								that.getView().getModel("sOrder1").setProperty("/Sales/" + i, sData[i]);//set property binding for that records
								that.getView().getModel("newModel").setProperty("/editable", false);//we set property editable to false so that first property is non-editable
								// oEvent.getSource().getParent().getParent().setShowFooter(false);
								MessageToast.show("Record saved Successfully");
							}
						}
					}
				}
			}

		},

		onLiveChange: function (oEvent) {
			this.enteredValue = oEvent.getParameter("value");

		},
		onAdd: function (oEvent) {
			this.mode = "Add";
			var that = this;

			that.getView().getModel("newModel").setProperty("/editable", true);

			var newRecord = {//create a dummy record to push when user click on Add
				"Id": "",
				"Name": "",
				"NameType": "",
				"Quantity": "",
				"Price": "",
				"FullPrice": "",
				"Storage": "",
				"FullStorage": "",
				"editable": true,
				"neweditable": true
			};
			var oTableData = oEvent.getSource().getModel("sOrder1").getData();//get table data
			oTableData.Sales.push(newRecord);//push this new record in model
			that.getView().getModel("sOrder1").setData(oTableData);//set data to the view
		},

		onChange: function (oEvent) {
			var that = this;
			var enteredText = oEvent.getParameters("value").value;
			this.recordexists = undefined;
			// var index=undefined;
			var sData = this.getView().getModel("sOrder1").getData().Sales;//get the model data
			var spath = parseInt(oEvent.getSource().getBindingContext("sOrder1").getPath().split("/")[2]);//get the index of enter data row

			var index = sData.findIndex(function (item, sindex) {//findIndex is a method used to validate if same value found it returns index position othervise it returns -1
				return item.Id === enteredText && sindex !== spath;
			});
			if (index > -1) {
				this.recordexists = index;
				that.getView().getModel("newModel").setProperty("/valueState", "Error");//set value state to error
				MessageToast.show("Entered entry already exists");

				return;
			}
			that.getView().getModel("newModel").setProperty("/valueState", "None");


		},

		onDelete: function (oEvent) {
			this.mode = "delete";
			var that = this;
			var sData = oEvent.getSource().getModel("sOrder1").getData();
			var oTable = this.byId("idSalesTable");
			var selectedRowData = oTable.getSelectedContexts();//get the selected contexts 
			if (selectedRowData.length === 0) {
				MessageToast.show("please select atleast one row");
				return;
			} else {

				for (var i = selectedRowData.length - 1; i >= 0; i--) {
					var oThisObj = selectedRowData[i].getObject();
					var index = $.map(sData.Sales, function (obj, index) {
						if (obj === oThisObj) {
							return index;
						}
					});
					sData.Sales.splice(index, 1);//delete  record by using Splice
				}
				that.getView().getModel("sOrder1").setData(sData);//after deleting set the data
				// this._oTable.getModel().setData(sData);
				oTable.removeSelections(true);
			}
		}
	});
});