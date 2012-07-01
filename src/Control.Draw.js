L.Map.mergeOptions({
	drawControl: false
});

L.Control.Draw = L.Control.extend({

	options: {
		position: 'topleft',
		drawPolyline: true,
		drawPolygon: true,
		drawRectangle: true,
		drawCircle: true,
		drawMarker: true,
		edition: false,
		styles: {}
	},

	handlers: {},

	disableEditingOnEscapeKey: function (e) {
		if (e.keyCode === 27) {
			this.disableEditingOnAllLayers();
		}
	},

	disableEditingOnAllLayers: function () {
		for (var key in this._map._layers) {
			if (this._map._layers.hasOwnProperty(key)) {
				var layer = this._map._layers[key];
				if (layer.editing !== undefined) {
					layer.editing.disable();
				}
			}
		}
	},

	enableEditingOnLayer: function (e) {
		var layer;
		if (e.target.editing !== undefined) {
			layer = e.target;
		} else if (e.layer.editing !== undefined) {
			layer = e.layer;
		} else {
			return;
		}

		this.disableEditingOnAllLayers();
		if (!layer.editing.enabled()) {
			layer.editing.enable();
		}
	},

	addEditionEvents: function (e) {
		if (e.layer.editing === undefined) { return; }
		L.DomEvent.removeListener(e.layer, 'click', this.enableEditingOnLayer, this);
		L.DomEvent.addListener(e.layer, 'click', this.enableEditingOnLayer, this);
	},

	onAdd: function (map) {
		var className = 'leaflet-control-draw',
			container = L.DomUtil.create('div', className);

		if (this.options.edition === true) {
			L.DomEvent.addListener(window, 'keydown', this.disableEditingOnEscapeKey, this);
			L.DomEvent.addListener(map, 'click', this.disableEditingOnAllLayers, this);
			L.DomEvent.addListener(map, 'layeradd', this.addEditionEvents, this);
		}

		if (this.options.drawPolyline) {
			this.handlers.polyline = new L.Polyline.Draw(map, this.options.styles.polyline);
			this._createButton(
				'Draw a polyline',
				className + '-polyline',
				container,
				this.handlers.polyline.enable,
				this.handlers.polyline
			);
			this.handlers.polyline.on('activated', this._disableInactiveModes, this);
		}

		if (this.options.drawPolygon) {
			this.handlers.polygon = new L.Polygon.Draw(map, this.options.styles.polygon);
			this._createButton(
				'Draw a polygon',
				className + '-polygon',
				container,
				this.handlers.polygon.enable,
				this.handlers.polygon
			);
			this.handlers.polygon.on('activated', this._disableInactiveModes, this);
		}

		if (this.options.drawRectangle) {
			this.handlers.rectangle = new L.Rectangle.Draw(map, this.options.styles.rectangle);
			this._createButton(
				'Draw a rectangle',
				className + '-rectangle',
				container,
				this.handlers.rectangle.enable,
				this.handlers.rectangle
			);
			this.handlers.rectangle.on('activated', this._disableInactiveModes, this);
		}

		if (this.options.drawCircle) {
			this.handlers.circle = new L.Circle.Draw(map, this.options.styles.circle);
			this._createButton(
				'Draw a circle',
				className + '-circle',
				container,
				this.handlers.circle.enable,
				this.handlers.circle
			);
			this.handlers.circle.on('activated', this._disableInactiveModes, this);
		}

		if (this.options.drawMarker) {
			this.handlers.marker = new L.Marker.Draw(map);
			this._createButton(
				'Add a marker',
				className + '-marker',
				container,
				this.handlers.marker.enable,
				this.handlers.marker
			);
			this.handlers.marker.on('activated', this._disableInactiveModes, this);
		}
		
		return container;
	},

	_createButton: function (title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.href = '#';
		link.title = title;

		L.DomEvent
			.addListener(link, 'click', L.DomEvent.stopPropagation)
			.addListener(link, 'click', L.DomEvent.preventDefault)
			.addListener(link, 'click', fn, context);

		return link;
	},

	// Need to disable the drawing modes if user clicks on another without disabling the current mode
	_disableInactiveModes: function () {
		for (var i in this.handlers) {
			// Check if is a property of this object and is enabled
			if (this.handlers.hasOwnProperty(i) && this.handlers[i].enabled) {
				this.handlers[i].disable();
			}
		}
	}
});

L.Map.addInitHook(function () {
	if (this.options.drawControl) {
		this.drawControl = new L.Control.Draw();
		this.addControl(this.drawControl);
	}
});
