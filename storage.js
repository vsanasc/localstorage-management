
var DB = function(name) {
	this.name = name;

	this.checkOrCreate();

};

DB.prototype.checkOrCreate = function() {
	if (localStorage.getItem(this.name) == null) {
		localStorage.setItem(this.name, "[]");
	}
};

DB.prototype.getData = function() {
	var data = localStorage.getItem(this.name);
	data = JSON.parse(data);
	return data;
};

DB.prototype.setData = function(data) {
	localStorage.setItem(this.name, JSON.stringify(data));
};

DB.prototype.all = function() {
	return this.getData();
};

DB.prototype.insert = function(new_data,uuid) {
	if (typeof new_data != 'object') {
		throw "Required object";
	}

	if( typeof uuid == 'undefined')
		new_data._uuid = this.createUuid();
	else
		new_data._uuid = uuid;

	new_data._created_at = new Date(Date.now());
	new_data._modified_at = new Date(Date.now());

	this.checkOrCreate();

	var data = this.getData();
	data.push(new_data);

	this.setData(data);

	return new_data;

};

DB.prototype.insertAll = function(list){
	if(Array.isArray(list))
		throw "Required array";

	this.checkOrCreate();
	
	var data = this.getData();
	for (var i = 0; i < list.length; i++){
		list[i]._uuid = this.createUuid();
		list[i]._created_at = new Date(Date.now());
		list[i]._modified_at = new Date(Date.now());
		data.push(new_data);
	}
	return data;
}

DB.prototype.delete = function(where) {
	if (this.checkUuid(where)) {
		where = {
			_uuid: where
		};
	}

	var data = this.getData();
	var new_data = [];
	for (var i = 0; i < data.length; i++) {

		if (!this.isEquals(data[i], where)) {
			new_data.push(data[i]);
		}

	};
	this.setData(new_data);
	return;
};

DB.prototype.select = function(where) {
	if (this.checkUuid(where)) {
		where = {
			_uuid: where
		};
	}

	var data = this.getData();
	var select_data = [];
	for (var i = 0; i < data.length; i++) {

		if (this.isEquals(data[i], where)) {
			select_data.push(data[i]);
		}

	};

	return select_data;
};

DB.prototype.update = function(data_updated, where) {
	if (this.checkUuid(where)) {
		where = {
			_uuid: where
		};
	}

	var data = this.getData();
	var new_data = [];
	var changed = [];
	for (var i = 0; i < data.length; i++) {

		if (this.isEquals(data[i], where)) {
			var self_data = this.updateValue(data[i], data_updated);
			new_data.push(self_data);
			changed.push(self_data)
		} else {
			new_data.push(data[i]);
		}

	};

	this.setData(new_data);

	return changed;

};

DB.prototype.drop = function() {
	localStorage.removeItem(this.name);
};

DB.prototype.clear = function(){
	this.drop();
	this.checkOrCreate();
}


DB.prototype.isEquals = function(row, where) {

	var t = 0;
	for (var key in row) {
		if (row.hasOwnProperty(key) && row[key] != null && row[key] == where[key]) {
			t++;
		}
	}

	if (t == Object.keys(where).length) {
		return true;
	} else {
		return false;
	}

};

DB.prototype.createUuid = function() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
};

DB.prototype.checkUuid = function(uuid) {
	if (typeof uuid != 'string')
		return false;

	if (uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
		return true;
	}

	return false;
};

DB.prototype.updateValue = function(obj) {
	for (var i = 1; i < arguments.length; i++) {
		for (var prop in arguments[i]) {
			var val = arguments[i][prop];
			if (typeof val == "object" && !Array.isArray(val)) { // this also applies to arrays or null!
				this.updateValue(obj[prop], val);
			} else {
				try {

					obj[prop] = val;

				} catch (e) {

					console.log(e);
				}
			}
		}
	}

	obj._modified_at = new Date(Date.now());
	return obj;
};
