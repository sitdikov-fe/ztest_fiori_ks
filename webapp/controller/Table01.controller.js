sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, MessageToast, Filter, FilterOperator) {
	"use strict";
	var oModel;

	var counter = 1;

	return Controller.extend("ztest_fiori_ks.controller.Table01", {
		onInit: function (oEvent) {

			this.mode = "Edit";
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
			window.temp = this;
		},

		onLiveChange: function (oEvent) {
			this.enteredValue = oEvent.getParameter("value");
			var _oInput = oEvent.getSource();
			var val = _oInput.getValue();
			val = val.replace(/[^\d]/g, '');
			_oInput.setValue(val);

		},
		onAdd: function (oEvent) {
			this.mode = "Add";
			var that = this;

			that.getView().getModel("newModel").setProperty("/editable", true);

			var newRecord = {//create a dummy record to push when user click on Add
				"Id": counter,
				"Name": "",
				"NameType": "",
				"Quantity": "",
				"Price": "",
				"FullPrice": "",
				"Storage": "",
				"Quanstorage": "",
				"editable": true,
				"neweditable": true
			};
			counter+= 1;
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
				MessageToast.show("Такая запись уже существует");

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
				MessageToast.show("Выберете хотя бы одну строку");
				return;
			} else {

				for (var i = selectedRowData.length - 1; i >= 0; i--) {
					var oThisObj = selectedRowData[i].getObject();
					counter-= 1;
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
				var rawdata = window.temp.getView().getModel("sOrder1").getData().Sales;
				rawdata.forEach(row => {
					console.log(row);
				});
			}

		},
		onCreateTable: function (order) {

			oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZTEST_FIORI_KOSI_SRV/");
			var rawdata = window.temp.getView().getModel("sOrder1").getData().Sales;
			var data = {};
			var oCreateUrl = "/ztestStr001Set";
			var boolreact = true;
			var isEmpty = false;

			console.log();

			rawdata.forEach(row => {
				isEmpty = isEmpty || Object.values(row).some(x => x === '');
			});

			if (order == -1 && rawdata.length == 0) {
				MessageToast.show("Добавьте хотя бы одну строку в таблицу");
				return false;
			}

			if (order == -1 && isEmpty == true) {
				MessageToast.show("Заполните все поля в таблице");
				return false;
			}
			else if(order == -1){
				return true;
			}

			if (isEmpty) {
				MessageToast.show("Заполните все поля в таблице");
			}
			else {
				rawdata.forEach(row => {
					data.Id = row.Id;
					data.Docnum = order;
					data.Name = row.Name;
					data.Nametype = row.NameType;
					data.Quantity = row.Quantity;
					data.Price = row.Price;
					data.Fullprice = row.FullPrice;
					data.Storege = row.Storage;
					data.Quanstorage = row.Quanstorage;

					oModel.create(oCreateUrl, data, null,
						function (response) {
						},
						function (error) {
							boolreact = false;
						}
					);
				});
			}
			return boolreact;
		},
	});
});