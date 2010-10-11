/*
---

name: Packager

description: Javascript for packager-web's frontend.

license: MIT-style license.

requires: [Core/Array, Core/Element.Style, Core/Element.Event, Core/DomReady]

provides: Packager

...
*/

(function(){

var packages = {}, components = {}, storage = {};

var Packager = this.Packager = {

	init: function(form){
		form = document.id(form || 'packager');

		form.getElements('.package').each(function(element){

			var name = element.get('id').substr(8);

			var pkg = packages[name] = {
				enabled: true,
				element: element,
				toggle: element.getElement('.toggle'),
				components: [],
				selected: 0
			};

			element.getElements('input[type=checkbox]').each(function(element){
				element.set('checked', false);
				element.setStyle('display', 'none');

				var depends = element.get('data-depends'),
					name = element.get('value'),
					parent = element.getParent('tr');

				depends = depends ? depends.split(', ') : [];

				pkg.components.push(name);
				var component = components[name] = {
					element: element,
					depends: depends,
					parent: parent,
					selected: false,
					required: []
				};

				parent.addListener('click', function(){
					if (component.selected) Packager.deselect(name);
					else Packager.select(name);

					Packager.setLocationHash();
				});
			});

			var select = pkg.select = element.getElement('.select');
			if (select) select.addListener('click', function(){
				if (!this.hasClass('disabled')) Packager.selectPackage(name);
			});

			var deselect = pkg.deselect = element.getElement('.deselect');
			if (deselect) deselect.addListener('click', function(){
				if (!this.hasClass('disabled')) Packager.deselectPackage(name);
			});

			var disable = element.getElement('.disable');
			if (disable) disable.addListener('click', function(){
				Packager.disablePackage(name);
			});

			var enable = element.getElement('.enable');
			if (enable) enable.addListener('click', function(){
				Packager.enablePackage(name);
			});

		});

		var options = document.id('options');
		if (options){

			var blocks = options.getElements('[name=blocks\\[\\]]');
			if (blocks.length) storage.blocks = blocks;

			blocks.each(function(element){
				element.setStyle('display', 'none');

				element.getParent('tr').addEvent('click', function(){
					var checked = !element.get('checked');

					element.set('checked', checked);
					if (checked) this.addClass('checked').addClass('selected').removeClass('unchecked');
					else this.addClass('unchecked').removeClass('checked').removeClass('selected');

					Packager.setLocationHash();
				});
			});

			var compressors = options.getElements('[name=compressor]');
			if (compressors.length) storage.compressors = compressors;

			compressors.each(function(element, index, radios){
				element.setStyle('display', 'none');

				element.getParent('tr').addEvent('click', function(){
					if (element.get('checked')) return;

					element.set('checked', true);
					compressors.each(function(compressor){
						if (compressor === element) compressor.getParent('tr').addClass('checked').addClass('selected').removeClass('unchecked');
						else compressor.getParent('tr').addClass('unchecked').removeClass('checked').removeClass('selected');
					});

					Packager.setLocationHash();
				});
			});

		}

		form.addEvents({
			submit: function(event){
				if (!Packager.getSelected().length) event.stop();
			},
			reset: function(event){
				event.stop();
				Packager.reset();
			}
		});

		Packager.fromUrl();
	},

	check: function(name){
		var component = components[name],
			element = component.element;

		if (component.selected) element.set('checked', true);
		if (!component.selected && !component.required.length) return;

		component.parent.addClass('checked').removeClass('unchecked');

		component.depends.each(function(dependancy){
			Packager.require(dependancy, name);
		});
	},

	uncheck: function(name){
		var component = components[name],
			element = component.element;

		if (!component.selected) element.set('checked', false);
		if (component.selected || component.required.length) return;

		component.parent.addClass('unchecked').removeClass('checked');

		component.depends.each(function(dependancy){
			Packager.unrequire(dependancy, name);
		});
	},

	select: function(name){
		var component = components[name],
			pkg = packages[name.split('/')[0]];

		if (!component){
			var matches = name.match(/(.+)\/\*$/);
			if (matches) this.selectPackage(matches[1]);
			return;
		}

		if (component.selected) return;

		component.selected = true;
		component.parent.addClass('selected');

		++pkg.selected;

		if (pkg.select && pkg.selected == pkg.components.length) pkg.select.addClass('disabled');
		if (pkg.deselect && pkg.selected == 1) pkg.deselect.removeClass('disabled');

		this.check(name);
	},

	deselect: function(name){
		var component = components[name],
			pkg = packages[name.split('/')[0]];

		if (!component || !component.selected) return;

		component.selected = false;
		component.parent.removeClass('selected');

		--pkg.selected;

		if (pkg.deselect && !pkg.selected) pkg.deselect.addClass('disabled');
		if (pkg.select && pkg.selected == pkg.components.length - 1) pkg.select.removeClass('disabled');

		this.uncheck(name);
	},

	require: function(name, req){
		var component = components[name];
		if (!component) return;

		var required = component.required;
		if (required.contains(req)) return;

		required.push(req);
		component.parent.addClass('required');

		this.check(name);
	},

	unrequire: function(name, req){
		var component = components[name];
		if (!component) return;

		var required = component.required;
		if (!required.contains(req)) return;

		required.erase(req);
		if (!required.length) component.parent.removeClass('required');

		this.uncheck(name);
	},

	selectPackage: function(name){
		var pkg = packages[name];
		if (!pkg) return;

		pkg.components.each(function(name){
			Packager.select(name);
		});

		this.setLocationHash();
	},

	deselectPackage: function(name){
		var pkg = packages[name];
		if (!pkg) return;

		pkg.components.each(function(name){
			Packager.deselect(name);
		});

		this.setLocationHash();
	},

	enablePackage: function(name){
		var pkg = packages[name];
		if (!pkg || pkg.enabled) return;

		pkg.enabled = true;
		pkg.element.removeClass('package-disabled');
		pkg.element.getElement('tr').removeClass('last');
		pkg.toggle.set('value', '');

		pkg.components.each(function(name){
			components[name].element.set('disabled', false);
		});

		this.setLocationHash();
	},

	disablePackage: function(name){
		var pkg = packages[name];
		if (!pkg || !pkg.enabled) return;

		this.deselectPackage(name);

		pkg.enabled = false;
		pkg.element.addClass('package-disabled');
		pkg.element.getElement('tr').addClass('last');
		pkg.toggle.set('value', name);

		pkg.components.each(function(name){
			components[name].element.set('disabled', true);
		});

		this.setLocationHash();
	},

	getSelected: function(){
		var name, selected = [];

		for (name in packages){
			var pkg = packages[name];

			if (pkg.selected == pkg.components.length) selected.push(name + '/*');
			else pkg.components.each(function(name){
				if (components[name].selected) selected.push(name);
			});
		}

		return selected;
	},

	getDisabledPackages: function(){
		var disabled = [];
		for (var name in packages) if (!packages[name].enabled) disabled.push(name);
		return disabled;
	},

	getExcludedBlocks: function(){
		if (!storage.blocks) return [];

		var excluded = [];

		storage.blocks.each(function(element){
			if (!element.get('checked')) excluded.push(element.get('value'));
		});

		return excluded;
	},

	getCompression: function(){
		if (!storage.compressors) return null;

		var element = storage.compressors.filter(':checked')[0];

		return ((element) ? element.get('value') : null);
	},

	toQueryString: function(){
		var selected = this.getSelected(),
			disabled = this.getDisabledPackages(),
			excluded = this.getExcludedBlocks(),
			compression = this.getCompression(),
			query = [];

		if (selected.length) query.push('select=' + selected.join(';'));
		if (disabled.length) query.push('disable=' + disabled.join(';'));
		if (excluded.length) query.push('exclude=' + excluded.join(';'));
		if (compression) query.push('compression=' + compression);

		return query.join('&') || '!';
	},

	toUrl: function(){
		var loc = window.location,
			queryString = this.toQueryString();

		return loc.protocol + '//' + loc.hostname + loc.pathname + (queryString ? '#' + queryString : '');
	},

	setLocationHash: function(){
		window.location.hash = '#' + this.toQueryString();
	},

	fromUrl: function(){
		var query = window.location.search || window.location.hash;
		this.reset();
		if (!query) return;

		var parts = query.substr(1).split('&');
		parts.each(function(part){
			var split = part.split('='),
				name = split[0],
				value = split[1];

			if (name == 'select'){
				value.split(';').each(function(name){
					Packager.select(name);
				});
			} else if (name == 'disable'){
				value.split(';').each(function(name){
					Packager.disablePackage(name);
				});
			} else if (name == 'exclude'){
				if (!storage.blocks) return;
				var exclude = value.split(';');

				storage.blocks.each(function(element){
					if (exclude.contains(element.get('value'))) element.getParent('tr').fireEvent('click');
				});
			} else if (name == 'compression'){
				if (!storage.compressors) return;
				var compressor = storage.compressors.filter('[value=' + value + ']')[0];

				if (compressor) compressor.getParent('tr').fireEvent('click');
			}
		});

		this.setLocationHash();
	},

	reset: function(){
		var name;
		for (name in components) this.deselect(name);
		for (name in packages) this.enablePackage(name);
		this.setLocationHash();
	}

};

})();
