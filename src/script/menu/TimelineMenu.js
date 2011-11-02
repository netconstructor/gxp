/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/** api: (define)
 *  module = gxp.menu
 *  class = TimelineMenu
 *  base_link = `Ext.menu.Menu <http://extjs.com/deploy/dev/docs/?class=Ext.menu.Menu>`_
 */
Ext.namespace("gxp.menu");

/** api: constructor
 *  .. class:: TimelineMenu(config)
 *
 *    A menu to control layer visibility for the timeline. Can also be used
 *    to select the field to display in the timeline, as well as filtering
 *    the events to show in the timeline.
 */   
gxp.menu.TimelineMenu = Ext.extend(Ext.menu.Menu, {

    /** api: config[layers]
     *  ``GeoExt.data.LayerStore``
     *  The store containing layer records to be viewed in this menu.
     */
    layers: null,

    /** private: method[initComponent]
     *  Private method called to initialize the component.
     */
    initComponent: function() {
        gxp.menu.TimelineMenu.superclass.initComponent.apply(this, arguments);
        this.timelinePanel = this.timelineTool && this.timelineTool.getTimelinePanel();
        this.layers.on("add", this.onLayerAdd, this);
        this.onLayerAdd();
    },

    /** private: method[onRender]
     *  Private method called during the render sequence.
     */
    onRender : function(ct, position) {
        gxp.menu.TimelineMenu.superclass.onRender.apply(this, arguments);
    },

    /** private: method[beforeDestroy]
     *  Private method called during the destroy sequence.
     */
    beforeDestroy: function() {
        if (this.layers && this.layers.on) {
            this.layers.un("add", this.onLayerAdd, this);
        }
        delete this.layers;
        gxp.menu.TimelineMenu.superclass.beforeDestroy.apply(this, arguments);
    },
    
    /** private: method[onLayerAdd]
     *  Listener called when records are added to the layer store.
     */
    onLayerAdd: function() {
        this.removeAll();
        this.layers.each(function(record) {
            var layer = record.getLayer();
            if(layer.displayInLayerSwitcher && layer.dimensions && layer.dimensions.time) {
                var key = this.timelinePanel.getKey(record);
                var schema = this.timelinePanel.schemaCache[key];
                var item = new Ext.menu.CheckItem({
                    text: record.get("title"),
                    checked: (this.timelinePanel.layerLookup[key] && this.timelinePanel.layerLookup[key].visible) || true,
                    menu: new Ext.menu.Menu({
                        plain: true,
                        showSeparator: false,
                        menuHide: OpenLayers.Function.Void,
                        items: [{
                            xtype: 'form',
                            width: 300, 
                            height: 50, 
                            items: [{
                                xtype: 'combo', 
                                store: schema, 
                                mode: 'local',
                                triggerAction: 'all',
                                listeners: {
                                    "select": function(combo) {
                                        this.timelinePanel.setTimeAttribute(record, combo.getValue());
                                    },
                                    scope: this
                                },
                                displayField: "name", 
                                valueField: "name", 
                                fieldLabel: "Label"
                            }]
                        }]
                    }),
                    listeners: {
                        checkchange: function(item, checked) {
                            this.timelinePanel.setLayerVisibility(item, checked, record);
                        },
                        scope: this
                    }
                });
                this.add(item);
            }
        }, this);
        
    }
    
});

Ext.reg('gxp_timelinemenu', gxp.menu.TimelineMenu);
