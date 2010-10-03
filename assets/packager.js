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

var packages = {}, components = {};

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

			options.getElements('input[type=checkbox]').each(function(element){
				element.setStyle('display', 'none');

				element.getParent('tr').addListener('click', function(){
					var checked = !element.get('checked');

					element.set('checked', checked);
					if (checked) this.addClass('checked').addClass('selected').removeClass('unchecked');
					else this.addClass('unchecked').removeClass('checked').removeClass('selected');
				});
			});

			options.getElements('input[type=radio]').each(function(element, index, radios){
				element.setStyle('display', 'none');

				var name = element.get('name'),
					affected = radios.filter(function(radio){
						return (radio !== element && radio.get('name') == name);
					}).getParent('tr');

				element.getParent('tr').addListener('click', function(){
					if (element.get('checked')) return;

					element.set('checked', true);
					this.addClass('checked').addClass('selected').removeClass('unchecked');
					affected.addClass('unchecked').removeClass('checked').removeClass('selected');
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

	toQueryString: function(){
		var selected = this.getSelected(),
			disabled = this.getDisabledPackages(),
			query = [];

		if (selected.length) query.push('select=' + selected.join(';'));
		if (disabled.length) query.push('disable=' + disabled.join(';'));

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
